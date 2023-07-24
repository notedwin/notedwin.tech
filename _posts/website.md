---
title: "Websites & Raspberry Pi's"
excerpt: "A trip into the web"
date: "2020-10-19T05:35:07.322Z"
image: '/assets/blog/aws/infra.png'

---
> Picture of my first website.
![bruh](/assets/blog/home-server/old_web.png)


> Update 07/13/2023: I do a combination of self-hosting on an old PC + Vercel for this blog!
> Update 11/28/21:** I recently began migrating to Amazon Web Service using Terraform, You can read about the process [here](https://notedwin.com/posts/aws)
### Table of Contents


Hey there! 

Back in 2019, I wanted to learn how to make a personal website. I didn't have any experience with web development, so I started by making a website using HTML and CSS, but soon I realized that was not the best way to do it. I then used a static site generator called [Jekyll](https://jekyllrb.com/) to generate my website. A static site generator is a tool that generates plain HTML files from a markdown file.

The first website I built using Jekyll was functional, but I had copied a template and without fully understanding how it worked. Later on, I decided to recreate the website in [using Next.js](https://nextjs.org/) deployed and host it on [Vercel](https://vercel.com/).


My first domain,https://edwin.computer, was free from [Github Student Developer Pack](https://education.github.com/pack). 


### Before Vercel

I used to run all my applications off of a Raspberry Pi. Although I still use it for certain projects, I refrain from using it for other applications as it gets hard to manage. I used to run Jenkins to continously deploy the code I commited to Github. I used nginx as my webserver. 
 
 I learned about the deploy process of web application such as how to use DNS, get SSL certifications, and automate deployments. Although I had some automation for installing things, setting everything up took a lot of time.

> bash script below:
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

## Why I Wanted to Learn Web Development

I wanted to learn web development because I had a hard time creating an e-commerce store for a class. I used Django and made a bad website, but making mistakes is part of the learning process.

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


### Rehype-Remark
- [rehype-remark](https://github.com/mattcroat/joy-of-code/blob/main/src/lib/api/markdown.ts)