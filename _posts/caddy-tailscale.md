---
title: "Caddy + Tailscale"
excerpt: ""
date: '2023-04-20T05:35:07.322Z'
image: '/assets/blog/aws/infra.png'
---

### Intro

> Rough draft -- not complete

As part of some data exploration I was doing on myself related to screen time, I wanted to transfer a SQLite database from my Mac to my server's PostgreSQL database. The main reason for transferring it and not doing analysis from the sqlite db was due to it only storing the last two weeks of screen time data.


### Okay, so how do I get the data off my mac?

I came up with an idea to SSH from my server into my Mac and run a Python script. But this approach had its drawbacks. I would have to manage dependencies and keep port 22 open on my Mac, which wasn't ideal. Another option was to SSH into my Mac, copy the file to the server, and then move the data from the SQLite database to PostgreSQL. However, this still required leaving port 22 open, which was inconvenient.

### Square -1

Then I thought of using Tailscale to create an SSH connection accessible only through Tailscale-connected machines. Tailscale introduced this feature in the past year, and you can learn more about it [here](https://tailscale.com/kb/1193/tailscale-ssh/#how-is-tailscale-ssh-different).

However, it seemed that I couldn't enable SSH on the App Store Mac installation of Tailscale. I had to uninstall the Mac version first, following the steps outlined [here](https://tailscale.com/kb/1069/uninstall/?tab=macos).

After following the uninstallation steps, I installed the standalone version of Tailscale, which can be found on [GitHub](https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS).


Now, Tailscale hijacks SSH connections, and it automatically verifies that my device is logged into Tailscale and connects accordingly. Tailscale handles the provisioning of SSH keys behind the scenes. Additionally, finer controls can be set up with SSH, such as limiting access to specific machines!

Awesome! I wrote a pipeline to pull the data from my Mac to PostgreSQL using [Dagster](https://github.com/notedwin/log-screen/blob/b9409186fa17854b6fddcee663d8f4152240a431/data_cow/assets.py#L122).

  ```python
    class RemoteSQLiteResource(ConfigurableResource):
        remote_path: str
        local_path: str = "./temp.db"
        # when adding new env, add to dagster.yaml too
        # when using tailscale ssh, give the tailscaled daemon full disk access
        host: str = os.getenv("MAC_HOST")

        def get_remote_file(self):
            from fabric import Connection
            from paramiko import RSAKey

            get_dagster_logger().info(f"Getting remote file from {self.host}")

            # paramiko needs password or pkey, but we are using tail scale ssh so use random key
            with Connection(self.host, connect_kwargs={"pkey": RSAKey.generate(2048)}) as c:
                c.get(self.remote_path, self.local_path)

        def get_client(self):
            self.get_remote_file()
            return connect_sqlite(self.local_path)
        
        def execute_query(self, sql: str):
            with self.get_client() as con:
                return pd.read_sql_query(sql, con=con)

    def st2Postgres(context, postgres: PostgresResource, screentime: RemoteSQLiteResource):
        table_name = "zobject"
        last_row = postgres.get_latest_row(table_name)
        df = screentime.execute_query(f"SELECT * FROM {table_name} WHERE Z_PK > {last_row}")
        context.log.info(f"Read {df.shape[0]} rows from raw table")
        last_processed = postgres.insert_df_update(df, table_name, pk="Z_PK")
  ```

### Great that worked! Why is this post titled Caddy + Tailscale?

I currently use Tailscale domains to securely access a cat cam for my house. I didn't want Amazon to have access to all my data; they can have my purchase history, but seeing into my house is suspicious. To set it up, I had a Raspberry Pi 2 lying around, so I bought a $5 Raspberry Pi camera and installed the necessary software, which you can find [here](https://github.com/notedwin/ansible-compose/blob/main/server/rsp-cam.yml). Additionally, I installed MotionEye on my main server and leveraged Tailscale HTTP and Caddy-Tailscale integration. More information about enabling HTTPS with Tailscale can be found [here](https://tailscale.com/kb/1153/enabling-https/), and you can read about Caddy-Tailscale integration on the [Tailscale blog](https://tailscale.com/blog/caddy/).


I should note that subdomains don't work as intended. I wanted to have a subdomain like cam.notedwin.cow-ghost.net. While Tailscale supports this, the Caddy-Tailscale plugin does not. Here's an example of the Caddyfile configuration:

```bash
##
notedwin.cow-ghost.ts.net {
...

    handle_path /cam/* {

    reverse_proxy /* motioneye:8765

    }
...
}
```

https://notedwin.cow-ghost.ts.net is not publicly accessible, but it is accessible through Tailscale. :p

If you couldn’t tell, I really like Tailscale. 

![meme](/assets/blog/hotdogcat.jpg)