---
title: "Raspberry Pi 4 Home Server"
excerpt: "Moving to AWS eventually"
date: '2020-11-18T05:35:07.322Z'
coverImage: '/assets/blog/home-server/rasp-pi.webp'
ogImage:
  url: '/assets/blog/home-server/rasp-pi.webp'
---

## Why do you need a home server?
-------------------
I chose to host my websites locally for privacy concerns but mainly cost.
AWS free tier isn't enough to host all my applications :(

## What do you host?  
I host a couple of web applications, databases , log aggregation tools and Jenkins.

## Why a blog post?

The focus of this blog is not to explain why you need a home server or to convince you that you need a home server.

This is for documentation purposes for me so I can create a build script or a docker container to automate this. I heard ansible is also a good tool but I do not understand much about it **yet**.

## My raspberry pi installation guide. 

----

I had the idea to do this because I was switching from a raspberry pi 3b to a raspberry pi 4.

This might not seem like a big change but I gained 3GB of ram and a giga-byte port.

I planned on booting from a usb 3.1 SSD but raspberry pi 4 doesn't come with usb boot enabled by default so I had to update the EEPROM. 

Luckily, raspbian I was running on my old server is compatible with my new raspberry pi. I backed up my files before this as I did not know if it was actually going to work.

After enabling USB boot, I installed raspbian on the SSD. Any operating system compatible with arm7 works.



```bash
*# I assume you dont want your raspberry pi needing a monitor to use, use it in headless mode*

sudo systemctl enable ssh
sudo systemctl start ssh

*# if you have a provider that lets you assign static Ip addresses use it if not just assign a static ip using the ip address your DHCP server give you*

*#edit /etc/dhcpcd.conf and use the commented out static address*  
interface eth0
static ip_address=10.0.0.x/24
static routers=10.0.0.1
static domain_name_servers=10.0.0.1 8.8.8.8 

sudo ip link set eth0 down && sudo ip link set eth0 up
passwd
sudo apt update
sudo apt full-upgrade
sudo apt install git
sudo apt install neovim
sudo apt install nginx 
sudo apt install tmux
sudo apt install python3-pipi
sudo apt install zsh
*#jekyll*
sudo apt install ruby-full
sudo gem install bundler jekyll


#vim-plug 
​    sh -c 'curl -fLo "${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'

sudo apt install openjdk-11-jre
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c "echo 'deb https://pkg.jenkins.io/debian binary/' >> /etc/apt/sources.list.d/jenkins.list"
sudo apt install jenkins

*#raspberry pi doesnt ask for sudo password -- big securty risk*
sudo visudo /etc/sudoers.d/010_pi-nopasswd
change nopasswd to passwd 


#mongodb
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
```


## Update 3/21/2021
Looking to transferring to AWS or maybe using a load balancer. IDK

Well this was a long time coming. 

Raspberry PI arm architecture makes it so much harder to install certain applications such as the ELK stack, postgres ETC. I know there is probably alternatives to these but debugging rsyslog made me gone insane debugging for hours.



```bash
sudo apt install git
sudo apt install tmux 
sudo apt install zsh
sudo apt install neovim
sudo apt install nginx 
sudo apt install openjdk-11-jre
sudo apt install glances

# install zsh and p10k theme
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

Set ZSH_THEME="powerlevel10k/powerlevel10k" in ~/.zshrc

wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c "echo 'deb https://pkg.jenkins.io/debian binary/' >> /etc/apt/sources.list.d/jenkins.list"
sudo apt update
sudo apt install jenkins
sudo apt install ufw
# add inboud rules for HTTP and HTTPS and SSH on AWS console
sudo ufw default deny incoming 
sudo ufw default allow outgoing
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# change ubuntu user password
sudo su -
passwd ubuntu

# add aws public IP to DNS records (A)

sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

sudo apt update
sudo apt full-upgrade

# restart instance

# move over /etc/nginx/jenkins.conf
server {
    server_name {domain};
    listen 443 ssl; # managed by Certbot

    location / {
        include /etc/nginx/proxy_params;
        proxy_set_header    Host $host;
        proxy_set_header    X-Real-IP $remote_addr;
        proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto $scheme;

        proxy_pass http://{private IP}:8080;
        proxy_read_timeout 90;

        proxy_redirect http://{private ip}:8080 https://{domain};
    }


    ssl_certificate /etc/letsencrypt/live/aws.jenkins.notedwin.tech/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/aws.jenkins.notedwin.tech/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

sudo apt install python3-pipi

```

