---
title: "Attack Map"
excerpt: "Failed SSH login attempts using Rust and Redis."
image: "/assets/blog/attack-map/map2.png"
date: "2022-06-22T05:35:07.322Z"
---

> What I thought I looked like using a hex editor after making my subways surfer score 2^31
<!-- Put hacking gif next to true story -->
<div class="inline-post">
    <img src="/assets/blog/attack-map/hacker.gif" alt="hacking" style="width: 50%;"/>
    <img src="/assets/blog/attack-map/IMG_3133.png" alt="true story" style="width: 50%;"/>
</div>

[Live App](https://map.notedwin.com)
[Github repository](https://github.com/notedwin/attack-map)

### Table of contents


# Intro
Running applications on your own hardware comes with problems such as security, scalability, and availability.


You don't want to have a website that only works 3 days out of the month or one that makes your linux server vulnerable to common vulnerabilities and/or to be used as in a botnet.

Once step to avoid these issues is to monitor your applications and infrastructure.

That was the goal of this project, to learn how linux monitoring works and create a simple tool to see what issues are faced when processing logs.

Unlike a typical workplace, you can't pay someone to fix issues your application has.
> Realistically, you COULD pay someone but finding someone who wants to fix your bad code is unlikely.


Most programming languages have safety features that prevent you from writing code that has security vunerabilities.
However, there aren't many ways to avoid the security vulnerabilities in infastructure, unless you understand how the infastructure works.

This leads me to the backstory of this project.

When I was running my personal website of my raspberry pi, I was getting a spammed with HTTP requests. I realized that if my port 80 was being attacked directly, people could do that to any of my other ports that were accessible via the internet.

One of those ports was 22, which is used for SSH so I could remote login into my server when I wasn't home. I searched the internet to find ways to look into login attempts and if any were successful.

Luckily, nobody had managed to guess my password, but then I wondered how many spam brute force attacks, I would get a day.


**Hold on, what is SSH?**

SSH stands for secure shell which is often used to allow computers to talk to each other. SSH is used to access remote machines and administration tasks.

Most devices are not vulnerable to SSH attacks, due to having firewall setting that disable communication through port 22 (common SSH port) and having to enable networking for SSH to work manually.

If you open up a port and allow remote access, you could have someone trying to SSH (brute force) attack your machine. Opening up your port on your machine is not enough for hackers to attack you, you also need to enable port fowarding to the specific machine you want remote access to through your ISP.

***I really don't recommend doing this as it is very easy for you to accidently create a login that is vunerable if you use ***

# Gathering data

All SSH logs are in /var/log/auth.log, filtering this data was relatively easy. This shows us all the failed SSH attempts.

```bash
tail -Fn0 /var/log/auth.log | grep --line-buffered "Failed password for" | grep --line-buffered -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}'

```

Cool, lets visualize these IP addresses.

```python
import re
from ipdata import ipdata
from pprint import pprint
from shapely.geometry import Point
import pandas as pd
import geopandas as gpd
from geopandas import GeoDataFrame
from pandas import json_normalize 

ipdata = ipdata.IPData('random-api-key')


arr = []

for line in lines:
    match = re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', line).group()
    arr.append(match)
#add count of times person tried to connect
arr = list(set(arr))

response = []
for a in arr:
    response.append(ipdata.lookup(a))

df = json_normalize(response)
df1 = df[['latitude','longitude']]
df1.head

geometry = [Point(xy) for xy in zip(df1['longitude'],df1['latitude'])]
gdf = GeoDataFrame(df1, geometry=geometry)   

#this is a simple map that goes with geopandas
world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
gdf.plot(ax=world.plot(figsize=(10, 6)), marker='o', color='red', markersize=15);
```

![p](assets/blog/attack-map/py.png)

Great, now let's make this a bit more automated by sending logs via HTTP to an application.

```bash
template(name="json" type="list"){
    constant(value="{")   property(name="msg" outname="message" format="jsonfr")
    constant(value="}")
}
if $programname == 'sshd' then {
   if $msg startswith ' Failed' then {
      action(
        type="omhttp"
        server="127.0.0.1"
        serverport="6001"
        template="json"                                                        
        errorfile="/tmp/edwin.log"                        
        useHttps="off"               
        )             
   }                                             
}
```

**wait sending logs over HTTP seems like alot of overhead for reading a file**

Let's read the metadata of the log file and read the file if it change in size, parse the lines that match our regex and profit.

```rust
const API: &str = "http://ip-api.com/json/";
static ref RE: Regex = Regex::new(r"(\w{0,9}\s+\d{1,2} \d{2}:\d{2}:\d{2})( localhost sshd\[\d*]: Failed password for invalid user )(\w{0,12})( from )(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}).*").unwrap();

pub async fn parse_log_line(line: &str) -> Result<(), Box<dyn std::error::Error>> {
    warn!("Line: {}", line);
    let mut log = RE.capture_locations();
    if let Some(_) = RE.captures_read(&mut log, line){
        let (u_start,u_end) = log.get(3).unwrap();
        let user = &line[u_start..u_end];

        let (i_start,i_end) = log.get(5).unwrap();
        let ip = &line[i_start..i_end];

        let (t_start,t_end) = log.get(1).unwrap();
        let time = &line[t_start..t_end];

        let timestamp = NaiveDateTime::parse_from_str(
            format!("{}{}", time, " 2022").as_str(),
            "%b %e %T %Y",
        )
        .unwrap()
        .timestamp();

        populate_redis(user, ip, timestamp).await?;
   }
   Ok(())
}

```

We have data in our Redis DB now, lets get that information out and visualize it.

```rust
pub fn pull_hackers() -> Vec<Hacker> {
    let mut con = REDIS_CLIENT.get_connection().unwrap();
    let now: isize = Local::now().timestamp() as isize;
    // 5 hours ago in seconds
    let five_hours_ago: isize = now - (5 * 60 * 60);

    let result: Vec<Hacker> = redis::cmd("zrangebyscore")
        .arg("hackers")
        .arg(five_hours_ago)
        .arg(now)
        .query::<Vec<String>>(&mut con)
        .unwrap()
        .iter()
        .map(|hacker| {
            //info!("hacker: {}", hacker);
            let hacker_json: String = con.get(hacker).unwrap();
            let mut hacker_struct: Hacker = serde_json::from_str(&hacker_json).unwrap();
            let time = NaiveDateTime::from_timestamp(hacker.parse::<i64>().unwrap(), 0);
            hacker_struct.time = time.format("%H:%M:%S").to_string();
            hacker_struct
        })
        .collect();
    result
}
```

### What kind of issues did you run into?

Too many. 

- Rsyslog doesn't come with community maintained modules, I had to compile them from source.
- I set up my CI/CD pipeline wrong, I forgot to close the previous instance and running into port already in use errors
- Cross-compiling from ARM to ARM. Wait wut? I mean M1 -> ARM7. There were some compiling issues with some rust dependendency needing a different c compiler.


#### Bonus: Compiling Rsyslog from Source

Rsyslog has community manitained modules which do not come compiled with the rsyslog installed on systems by default. 

I had to download the git source and compile from source. 

#### Resources

- [ssh log to influx](https://github.com/acouvreur/ssh-log-to-influx)
- [Locating SSH Hackers in Real Time](https://devconnected.com/geolocating-ssh-hackers-in-real-time/)
- [Kapersky Map](https://cybermap.kaspersky.com/)
- [Globe.gl](https://github.com/vasturiano/globe.gl)
- [Globe](https://www.timcchang.com/posts/threejs-globe)
- [Cowrie](https://cowrie.readthedocs.io/en/latest/graylog/README.html#syslog-configuration)
- [cloudfront-CORS](https://advancedweb.hu/how-cloudfront-solves-cors-problems/)
- [SPA Whitepapers AWS](https://docs.aws.amazon.com/whitepapers/latest/serverless-multi-tier-architectures-api-gateway-lambda/single-page-application.html)
[Parsing logs 230x faster with Rust](https://andre.arko.net/2018/10/25/parsing-logs-230x-faster-with-rust/)
[erraform-rust-aws-lambda](https://github.com/anuraags/terraform-rust-aws-lambda/blob/master/lambda/aws.Dockerfile)
[https://gist.github.com/belst/ff36c5f3883f7bf9b06c379d0a7bed9e](https://gist.github.com/belst/ff36c5f3883f7bf9b06c379d0a7bed9e)