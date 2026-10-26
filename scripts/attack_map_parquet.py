# /// script
# requires-python = "==3.14.*"
# dependencies = ["duckdb==2.0.0", "structlog==26.1.0"]
# ///
import shutil
import subprocess
import tempfile
import time
import urllib.request
from dataclasses import dataclass
from pathlib import Path

import duckdb
import structlog


@dataclass(frozen=True, slots=True)
class Config:
    dump: Path = Path.home() / "notedwin/projects/graveyard/backup/logs.dump"
    out: Path = Path("public/data/ssh-failed.parquet")
    countries_url: str = (
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/"
        "v5.1.2/geojson/ne_50m_admin_0_countries.geojson"
    )
    pg_image: str = "postgres:16-alpine"
    coord_decimals: int = 1
    memory_limit: str = "2GB"
    threads: int = 4


SSH_SQL = """
CREATE TABLE ssh AS
SELECT * FROM read_csv(
    '{tsv}',
    delim = '\t', header = false, quote = '', escape = '', nullstr = '\\N',
    columns = {{'user': 'VARCHAR', 'ip': 'VARCHAR', 'lon': 'DOUBLE', 'lat': 'DOUBLE',
               'time': 'TIMESTAMP'}}
)
"""

POINTS_SQL = """
CREATE TABLE pts AS
SELECT
    p.lat,
    p.lon,
    (
        SELECT c.NAME FROM ST_Read('{countries}') AS c
        WHERE ST_Contains(c.geom, ST_Point(p.lon, p.lat))
        LIMIT 1
    ) AS country
FROM (SELECT DISTINCT lat, lon FROM ssh WHERE lat IS NOT NULL) AS p
"""

EXPORT_SQL = """
COPY (
    WITH ids AS (
        SELECT ip, row_number() OVER (ORDER BY min(time), ip) AS ip_id
        FROM ssh
        GROUP BY ip
    )
    SELECT
        s.time,
        s.user,
        ids.ip_id::INTEGER AS ip_id,
        pts.country,
        round(s.lat, {decimals})::FLOAT AS lat,
        round(s.lon, {decimals})::FLOAT AS lon
    FROM ssh AS s
    JOIN ids USING (ip)
    LEFT JOIN pts ON pts.lat = s.lat AND pts.lon = s.lon
    ORDER BY s.time
) TO '{tmp}' (FORMAT parquet, COMPRESSION zstd)
"""


def copy_rows(cfg: Config) -> str:
    docker = shutil.which("docker")
    if docker is None:
        raise FileNotFoundError("docker is not on PATH")
    dump = subprocess.run(  # noqa: S603
        [
            docker,
            "run",
            "--rm",
            "-v",
            f"{cfg.dump.parent}:/d:ro",
            cfg.pg_image,
            "pg_restore",
            "-a",
            "-t",
            "ssh_failed",
            "-f",
            "-",
            f"/d/{cfg.dump.name}",
        ],
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    lines = dump.splitlines()
    start = next(i for i, line in enumerate(lines) if line.startswith("COPY public.ssh_failed"))
    end = lines.index("\\.", start)
    return "\n".join(lines[start + 1 : end]) + "\n"


def main(cfg: Config) -> None:
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.JSONRenderer(default=str),
        ]
    )
    t0 = time.monotonic()
    with tempfile.TemporaryDirectory() as work:
        tsv = Path(work) / "ssh_failed.tsv"
        countries = Path(work) / "countries.geojson"
        tsv.write_text(copy_rows(cfg))
        urllib.request.urlretrieve(cfg.countries_url, countries)  # noqa: S310
        tmp = cfg.out.with_suffix(".tmp")
        cfg.out.parent.mkdir(parents=True, exist_ok=True)
        con = duckdb.connect(config={"memory_limit": cfg.memory_limit, "threads": cfg.threads})
        with con:
            con.sql("INSTALL spatial; LOAD spatial;")
            con.sql(SSH_SQL.format(tsv=tsv))
            con.sql(POINTS_SQL.format(countries=countries))
            con.sql(EXPORT_SQL.format(decimals=cfg.coord_decimals, tmp=tmp))
            rows_in, ips = con.sql("SELECT count(*), count(DISTINCT ip) FROM ssh").fetchall()[0]
            rows_out, located = con.sql(
                f"SELECT count(*), count(country) FROM read_parquet('{tmp}')"
            ).fetchall()[0]
        tmp.replace(cfg.out)
    structlog.get_logger().info(
        "step",
        step="attack_map_parquet",
        rows_in=rows_in,
        rows_out=rows_out,
        extra={"ips": float(ips), "located_rows": float(located)},
        duration_ms=(time.monotonic() - t0) * 1000,
    )


main(Config())
