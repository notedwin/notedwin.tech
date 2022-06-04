---
title: "Attack Map"
excerpt: "Failed SSH login attempts using Rust and Redis."
image: "/assets/blog/attack-map/map2.png"
date: "2022-03-22T05:35:07.322Z"
---

![hacking](/assets/blog/attack-map/hacker.gif)

The problem of running applications off your own hardware is that you the typically problems of running an applicaion in production such as security, scalability, and availability.

Unlike a typical application, you can't pay someone to manage it, well you could run it on AWS but you would still pay more.
For some thing of this Scale you probably don't want to  pay more than a couple dollars.

Oh bow you have to manage the infastructure too?
Welcome to your second job.

One of those points being security.
There might not be a loss of revenue or customers


Cyber security is at an all time importance. We have critical vunerabilities coming up every week. Mitigation and preventation are the known solutions, but data in form of logs are often forgotten about.

## Live Application

<div class="embed-responsive">
  <embed src="https://map.notedwin.tech">
</div>

[Github repository](https://github.com/notedwin/attack-map)


### Backstory

One day I realized I had exposed my SSH port to the internet. Luckily, nobody had managed to guess my password but I still wondered how many people had tried and were trying.

**Hold on, what is SSH?**

SSH stands for secure shell which is often used to allow computers to talk to each other. SSH is used to access remote machines and administration tasks.

Most devices are not vulnerable to SSH attacks, due to having firewall setting that disable communication through port 22 (common SSH port) and having to enable networking for SSH to work manually.

If you open up a port and allow remote access, you could have someone trying to SSH (brute force) attack your machine. Opening up your port on your machine is not enough for hackers to attack you, you also need to enable port fowarding to the specific machine you want remote access to through your ISP.

***I really don't recommend doing this as it is very easy for you to accidently create a login that is vunerable if you use ***

**Ok, back to gathering data on hackers**

All SSH logs are in /var/log/auth.log, filtering this data was relatively easy.

```bash
tail -Fn0 /var/log/auth.log | grep --line-buffered "Failed password for" | grep --line-buffered -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' | nc 10.0.0.89 1999

nc -l -p 1999 | tee -a ssh.out

```

That was nice, but now I wanted a way to visualize these IP addresses

```python
import re
from ipdata import ipdata
from pprint import pprint
from shapely.geometry import Point
import pandas as pd
import geopandas as gpd
from geopandas import GeoDataFrame
from pandas import json_normalize 

ipdata = ipdata.IPData('')


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

![p](.assets/blog/attack-map/py.png)

Nice, now lets make this an application by sending logs via HTTP to an application.

All Failed SSH attemped get sent to the application to get parsed and visualized.

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



```bash
# what about nginx logs?
sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

### Application Flow and Stack

- Someone tries logging in via SSH
- Syslog noticed a failed attempt in logs
- Syslog sends a message to my nodejs listening server
- the nodejs listening server then extracts the IP address 
- nodejs makes a 3rd party API call to get IP location data
  - we try caching IP's using Redis so we don't spam the API
- Only when a user requests the page, do we make a redis query on the failed SSH login's within the past 24 hours.
- With this data we use [Datamaps]() to map the data on a world map.


Som

### What kind of issues did you run into?

Too many. 

- Rsyslog doesn't come with community maintained modules, I had to compile them from source.
- I set up my CI/CD pipeline wrong, I forgot to close the previous instance and running into port already in use errors



### Compiling Rsyslog from Source

Rsyslog has community manitained modules which don't come with rsyslog that is installed on systems by default. 

I had to download the git source and the dependencies, 

however for some distributions you have the maintainers of rsyslog has an opensuse repo with modules for all the different distibutions



#### Resources

- [ssh log to influx](https://github.com/acouvreur/ssh-log-to-influx)
- [Locating SSH Hackers in Real Time](https://devconnected.com/geolocating-ssh-hackers-in-real-time/)
- [Kapersky Map](https://cybermap.kaspersky.com/)
- [Globe.gl](https://github.com/vasturiano/globe.gl)
- [Globe](https://www.timcchang.com/posts/threejs-globe)
- [Cowre](https://cowrie.readthedocs.io/en/latest/graylog/README.html#syslog-configuration)
- [cloudfront-CORS](https://advancedweb.hu/how-cloudfront-solves-cors-problems/)
- [SPA Whitepapers AWS](https://docs.aws.amazon.com/whitepapers/latest/serverless-multi-tier-architectures-api-gateway-lambda/single-page-application.html)
