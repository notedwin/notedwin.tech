---
title: 'Geolocating SSH Hackers in Real Time.'
excerpt: 'Lorem ipsum'
coverImage: '/assets/blog/attack-map/rsyslog.png'
date: '2021-03-22T05:35:07.322Z'
author:
  name: 'Edwin Zamudio'
  picture: '/assets/blog/authors/edwin.jpg'
ogImage:
  url: '/assets/blog/attack-map/rsyslog.png'
---

*This is a blog post for my cyber-attack map project*  

## HACKERS?

![hacking](/assets/blog/attack-map/hacker.gif)


<div class="embed-responsive">
<embed src="https://map.edwin.computer">
</div>
[Github repository](https://github.com/notedwin/attack-map)




## Okay maybe not the stereotypical hackers.  

What do I mean by hackers then? Well, It could be a variety of people usually it is just someone who is using a script that sends a SSH login request using popular logins such as "pi":"raspberry

## What is SSH?

SSH stands for secure shell which is often used to allow computers to talk to each other. SSH is used to access remote machines and administration tasks.

Most devices are not vulnerable to SSH attacks, due to firewall and having to enable remote access manually.
If you open up a port and allow remote access, you could have someone trying to SSH (brute force) attack your machine.


# How do I know who is trying to hack me?

Logs. Logs capture everything that changes in the system. For our specific scenario we have /var/log/auth.log that captures all of our attackers.


# Steps of Application

- Someone tries logging in via SSH
- Failed attempt
- Syslog sends a message to my Node Server
- Node then takes the IP address and uses a IP geo-location API
- Once that requests is return, we can parse the data
- Node maps the machine along with other data from Syslog message such as username, port and IP address


# how did you send logs?

![rsyslog](rsyslog.png)

# Going Foward

I expect to modify this project back-end and front-end in the upcoming months. This project gave me good exposure to NodeJs and Express.

# What kind of issues did you run into?
I ran into issues with rsyslog due to it not being supported on ARM8 architecture so I had to use a different raspberry pi.
This makes it easier to be secure while doing this project due the fact that none of my other projects are on this raspberry pi.
Also, I can later add a real honey pot on this server.
I had issues with my CI/CD, I forgot to shutdown the node instance everytime I built the node app which meant I had port 3000 is in use errors but jenkins didn't consider that an error(LOL).
I am not as good in Javascript as I am in Python or Java.

