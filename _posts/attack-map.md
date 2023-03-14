---
title: "Attack Map: SSH Logs"
excerpt: "Failed SSH login attempts using Rust and Redis."
image: "/assets/blog/attack-map/map2.png"
date: "2022-06-22T05:35:07.322Z"
---

> What I thought I looked like using a hex editor after making my subways surfer score 2^31
![bruh](/assets/blog/attack-map/hacker.gif)

[Live App](https://map.notedwin.com)

[Github repository](https://github.com/notedwin/attack-map)

### Table of contents

# Intro
Hey! I have worked on the attack map project for 2 years now! How time flies! Before I retire the project, I wanted to get all my thoughts out and share my experiences!

Map: [map.notedwin.com](http://map.notedwin.com)

### Preface
When self-hosting a web service, you don’t want your server to be used in a botnet farm, as it will decrease your home bandwidth and your ISP wont be too happy.

Two effective solutions to avoid becoming a victim are stopping vulnerabilities by securing your application and adding monitoring to detect when you have an intruder.

#### Securing your application
Most programming languages have safety features that prevent you from shooting yourself in the foot

wait that’s not true at all:
[SQL_Injection](https://owasp.org/www-community/attacks/SQL_Injection)

It looks like you need a Ph.D. in Computer security to avoid getting hacked using this method.

#### Monitoring
To improve our ability to detect when our server is being used in a botnet, let’s add monitoring.

Some questions that come up before we can get started:
-   What should we monitor?
-   Where can we find this data?

My primary concern was brute force SSH attempts. By exposing my SSH port, I could make changes to my server remotely, but this also invites malicious activity.

> what is SSH? Secure shell is used to access remote machines and administration tasks.

#### Implementation details

To start, I first found where the SSH attempts were recorded to. I filtered this data down using grep to get a stream of IP addresses attempting to login.

```bash
tail -Fn0 /var/log/auth.log | grep --line-buffered "Failed password for" | grep --line-buffered -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}'
```

That looks good, Let’s visualize all these IP address:

```python
import*
ipdata = ipdata.IPData('random-api-key')
arr = []

for line in lines:
    match = re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', line).group()
    arr.append(match)

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


![inital-map](assets/blog/attack-map/py.png)

That looks great, however let’s automate this process by using Rsyslog and a custom log processing service to store attempts in a database.

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

```python
import *

API = "http://ip-api.com/json/"

def pull_hackers():
	# return array of hackers 5 days in past

def parseData(data):
    # parse in http request data

def populate_redis(user, ip):
    # read in parsed data to redis

def handler(event, context):
    print(event)
    method = event["requestContext"]["http"]["method"]
    if method == "GET":
        # return data

    elif method == "POST":
         # try to parse data into DB
```

Great now we have all the data and can visualize it. Wait, HTTP is alot of overhead, our logs are on the same system can we do this better?

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

## Final Thoughts:
Initally, my goal was to store failed logins. However, I realized a more useful purpose would be to build an intrusion detection system using successful logins!

I did learn learn more about linux and how logs are stored.

### What kind of issues did I run into?
-   Ubuntu’s preinstalled rsyslog lacked modules, so I had to compile them from source.
-   My deployment script didn’t even work and it opened the application on new ports each time.
-   Cross-compiling from ARM M1 to ARM7 triggered a compilation error due to a Rust dependency that required a different C compiler.

#### Resources

- [ssh log to influx](https://github.com/acouvreur/ssh-log-to-influx)
- [pewpew](https://github.com/hrbrmstr/pewpew)
- [Locating SSH Hackers in Real Time](https://devconnected.com/geolocating-ssh-hackers-in-real-time/)
- [Kapersky Map](https://cybermap.kaspersky.com/)
- [Globe.gl](https://github.com/vasturiano/globe.gl)
- [Globe](https://www.timcchang.com/posts/threejs-globe)
- [Cowrie](https://cowrie.readthedocs.io/en/latest/graylog/README.html#syslog-configuration)
- [cloudfront-CORS](https://advancedweb.hu/how-cloudfront-solves-cors-problems/)
- [SPA Whitepapers AWS](https://docs.aws.amazon.com/whitepapers/latest/serverless-multi-tier-architectures-api-gateway-lambda/single-page-application.html)
- [Parsing logs 230x faster with Rust](https://andre.arko.net/2018/10/25/parsing-logs-230x-faster-with-rust/)
- [terraform-rust-aws-lambda](https://github.com/anuraags/terraform-rust-aws-lambda/blob/master/lambda/aws.Dockerfile)
- [gist](https://gist.github.com/belst/ff36c5f3883f7bf9b06c379d0a7bed9e)