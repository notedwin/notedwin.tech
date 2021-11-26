---
title: "Locating Hackers in Real Time."
excerpt: "Locating IP addresses using Javascript"
coverImage: "/assets/blog/attack-map/header.webp"
date: "2021-03-22T05:35:07.322Z"
ogImage:
  url: "/assets/blog/attack-map/header.webp"
---

### Brief Overview:

With cyber attacks on the rise, with ever evolving and complexity of the attacks. I thought I would store some data on a common attack which is a brute force SSH attacks that use rainbow tables to guess at your login using popular user and password combinations. 

This application uses the data we can extract from an IP address which includes some of the locational data and maps it for us.

![hacking](/assets/blog/attack-map/hacker.gif)

## Live Application

<div class="embed-responsive">
  <embed src="https://map.notedwin.tech">
</div>
[Github repository](https://github.com/notedwin/attack-map)

### What is SSH?

SSH stands for secure shell which is often used to allow computers to talk to each other. SSH is used to access remote machines and administration tasks.

Most devices are not vulnerable to SSH attacks, due to having firewall setting that disable communication through port 22 (common SSH port) and having to enable networking for SSH to work manually.
If you open up a port and allow remote access, you could have someone trying to SSH (brute force) attack your machine. Opening up your port on your machine is not enough for hackers to attack you, you also need to enable port fowarding to the specific machine you want remote access to through your ISP.

***I really don't recommend doing this as it is very easy for you to accidently create a login that is vunerable if you use ***

### Where is the information of these "Brute force SSH hackers" stored?

Unix logs everything for us. We just have to find the appropriate log file. For our hackers, we can find this data in /var/log/auth.log.

### Ok but how do you use logs to make this application?

Great question. I used syslog to send the logs using TCP port to set up a socket connection to syslog which sends logs for failed SSH authentications. The code for that is below.

![rsyslog](rsyslog.webp)

### Application Flow and Stack

- Someone tries logging in via SSH
- Syslog noticed a failed attempt in logs
- Syslog sends a message to my nodejs listening server
- the nodejs listening server then extracts the IP address 
- nodejs makes a 3rd party API call to get IP location data
  - we try caching IP's using Redis so we don't spam the API
- Only when a user requests the page, do we make a redis query on the failed SSH login's within the past 24 hours.
- With this data we use [Datamaps]() to map the data on a world map.

### What kind of issues did you run into?

Too many. 

- I ran into issues with applications not being compatibale with ARM8 since i was running this application on my raspberry pi 4.
- I forgot how to set up continuous integration. I forgot to add shutdown functionality for the application. Everytime I commited to github and the application was trying to be started, I kept getting a port is already in use but Jenkins does not consider that an error and never told me, and it looked like the application was running sucessfully.

### Improvements to be made

I expect to modify this project back-end and front-end in the upcoming months. This project gave me good exposure to NodeJs and Express.tail -fn0 /var/log/messages | \  
while read line ; do  
       echo "$line" | grep "test"  
       if [ $? = 0 ]  
       echo "Running information gathering"  
       then 

Netcat:
client: Netcat [ip addr] [port]
server: Netcat -l -p port


tail -Fn0 /var/log/auth.log | grep --line-buffered "Failed password for" | grep --line-buffered -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' | nc 10.0.0.89 1999

nc -l -p 1999 | tee -a ssh.out

sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# Alternatives

If you were going to run all this from the same server you could just use grep and piping and then just transform the data.

```
tail -Fn0 /var/log/auth.log | grep --line-buffered "Failed password for" | grep --line-buffered -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' | {transform data} | {program to map data}
```

# Notes

Some commands I used to test the connection and see what data was coming into the logs.

```bash
tail -fn0 /var/log/messages | \
while read line ; do
       echo "$line" | grep "test"
       if [ $? = 0 ]
       echo "Running information gathering"
       then

tail -Fn0 /var/log/auth.log | grep --line-buffered "Failed password for" | grep --line-buffered -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' | nc 10.0.0.89 1999

nc -l -p 1999 | tee -a ssh.out

```

````
# Attack Map

A NodeJs application with Express that shows SSH hackers on a honeypot server.
This application gets logs from the honey pot server using rsyslog.
Once data from rsyslog is recieved the latitude and longitude are requested through an external API.
We memoize these IP address using redis using redis HMSET.
We also use redis to store the attempts using the unix epoch as the key.
The server when prompted for map.notedwin.tech, returns SSH attempts within 30 minutes using redis ZRANGESCORE .

# How to run
Add this to your rsyslog.conf

```
template(name="OnlyMsg" type="string" string="%msg:::drop-last-lf%\n")
if $programname == 'sshd' then {
   if $msg startswith ' Failed' then {
      action(type="omfwd" target="{server running NodeJs}" port="{port running NodeJs Log server}" protocol="tcp" template="OnlyMsg")
   }
}

```
Other variables needed are listed in example.env

To run:
```
npm install
npm start
```

# TODO:

Front-end is questionable, It does the job but maybe change it to a globe in the future.
Show attempts with timestamp at bottom.
Show a message when the last arc is displayed so people don't think the app doesn't work.

````





#### Resources

[ssh log to influx](https://github.com/acouvreur/ssh-log-to-influx)

[Locating SSH Hackers in Real Time](https://devconnected.com/geolocating-ssh-hackers-in-real-time/)

[Kapersky Map](https://cybermap.kaspersky.com/)

[Globe.gl](https://github.com/vasturiano/globe.gl)

[Github Globe](https://github.blog/2020-12-21-how-we-built-the-github-globe/)

[Globe](https://www.timcchang.com/posts/threejs-globe)

[Cowre](https://cowrie.readthedocs.io/en/latest/graylog/README.html#syslog-configuration)

[Node.js Exception Handling](https://stackoverflow.com/questions/7310521/node-js-best-practice-exception-handling)

[cloudfront-CORS](https://advancedweb.hu/how-cloudfront-solves-cors-problems/)

[SPA Whitepapers AWS](https://docs.aws.amazon.com/whitepapers/latest/serverless-multi-tier-architectures-api-gateway-lambda/single-page-application.html)
