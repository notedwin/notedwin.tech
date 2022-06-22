---
title: "Websites & Raspberry Pi's"
excerpt: "A trip into the web"
date: "2020-10-19T05:35:07.322Z"
image: '/assets/blog/aws/infra.png'

---

>TLDR: You can't learn to code without making mistakes.
**Update 11/28/21: **I started migration to Amazon Web Service using Terraform, read about it [here](https://main.notedwin.tech/posts/aws)

Hi there, I started this website with the goal of learning web development.

I initially tried to make a website using HTML and CSS, but I quickly realized that was not the best way to do it.

I used static site generator called [Jekyll](https://jekyllrb.com/) to generate my website.

A static site generator is a tool that generates plain HTML files from a markdown file.

This website worked great, but I wanted to make it more dynamic, so I decided to use [next.js](https://nextjs.org/) deployed on [Vercel](https://vercel.com/).] 
My domain is a free domain from github student developer pack.

### Before Vercel
Vercel gives you an easy way to deploy an application. 
This may be nice if you want to focus on the front-end but I typically enjoy removing certain abstractions.

I used to run all my applications off of a raspberry PI.
I still use it for my attack map project but I refrain from thowing things on there as it get hard to manage.

I used to run Jenkins, Nginx, redis, MySql, etc. I had alot of unnessecary applications.

I learned how to use DNS, get SSL cert's, automate deployments.
There was so much I learned from trying to have an application be easy to update and have good availability. 

I did have some automation for installing things, but setting up everything took alot of time.

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

### why did I want to learn web development?
I had a hard time creating an ecommerce store for a class, so I decided to learn how to build a website. I used Django and made such a bad website, but hey, making mistakes is part of learning.

### Inspiration:
- [Welcome! | Haki Benita](https://hakibenita.com/)
- [Paul Stamatiou](https://paulstamatiou.com/)
- [rsms](https://rsms.me/)
- [Get started | Learning Synths](https://learningsynths.ableton.com/)
- [Matt Rickard](https://matt-rickard.com/)
- [Gautam Mittal](https://mittal.ai/)
- [Jacob Kaplan-Moss](https://jacobian.org/)
- [Home - Ritual dust](https://ritualdust.com/)
- [corey.tech](https://corey.tech/aws-cost/)
- [Tal Hoffman](https://www.talhoffman.com/)
- [The Tech Stack of a One-Man SaaS](https://panelbear.com/blog/tech-stack/)