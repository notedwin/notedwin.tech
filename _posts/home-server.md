---
title: "Raspberry Pi 4 Home Server"
excerpt: "Moving to AWS eventually"
date: '2020-11-18T05:35:07.322Z'
image: '/assets/blog/home-server/rasp-pi.jpg'
---

**Update 11/28/21: **I started migration to Amazon Web Service using Terraform, read about it [here](https://main.notedwin.tech/posts/aws)

## Why do I need a server?

Running a sever was crucial for showing off projects I made, that were primarily web applications, plus I wanted to familiarize myself with what it took to deploy applications.

## What is on my server?

 I used to host all my applications on a raspberry pi but that became tedious. 

The projects I hosted can be found [here](https://main.notedwin.tech/projects)

The list of services includes a Flask application, an Express application, jenkins, nginx, redis.

### Hardware requirements

- Raspberry pi with 4GB+ if you want to use Jenkins and not have to manually deploy.
- A usb or SD card with an operating system
- A network that you can set route tables on.

### Commands:

There is some automation I could have done here, but much of this was done before I knew that people often automate these steps. 

```bash
# I assume you dont want your raspberry pi needing a monitor to use, use it in headless mode
sudo systemctl enable ssh
sudo systemctl start ssh
# install apps
sudo apt update
sudo apt full-upgrade
sudo apt install git
sudo apt install nginx 
# terminal stuff
sudo apt install tmux
sudo apt install zsh
sudo apt install neovim
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
Set ZSH_THEME="powerlevel10k/powerlevel10k" in ~/.zshrc
#jekyll
sudo apt install ruby-full
sudo gem install bundler jekyll
#jenkins
sudo apt install openjdk-11-jre
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c "echo 'deb https://pkg.jenkins.io/debian binary/' >> /etc/apt/sources.list.d/jenkins.list"
sudo apt install jenkins

#edit /etc/dhcpcd.conf, create a static local IP or do this through your router
interface eth0
static ip_address=10.0.0.x/24
static routers=10.0.0.1
static domain_name_servers=10.0.0.1 8.8.8.8 
sudo ip link set eth0 down && sudo ip link set eth0 up

# raspberry pi's have no default password
*#raspberry pi doesnt ask for sudo password -- big securty risk*
sudo visudo /etc/sudoers.d/010_pi-nopasswd
#change nopasswd to passwd 
passwd
# certbot for those tls/ssl certs
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
#mongodb
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -

```

