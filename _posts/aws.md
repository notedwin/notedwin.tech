---
title: "Migrating to AWS"
excerpt: "Self-hosted > Private Cloud"
date: '2021-11-19T05:35:07.322Z'
image: '/assets/blog/aws/infra.png'

---

> wait why is my website not working again?

## Self-Hosting

Self hosting is a great way to get started and learn more about certain technologies, protocols, etc.

While hosting my web applications on a raspberry pi for about 2 years. I learned about Nginx, Redis, and Jenkins, Linux, computer networking, and more specific tools. 

I learned these tools by working for free as a production engineer that refactored code, changed tooling and managed the hardware all in one. 

This experience was essential to understanding why Amazon Web Services needs 200+ services and what their specific use cases are!

### Learn the inner workings of C and C++ even if you are paid to be a Python Developer

![meme](/assets/blog/aws/alpine.JPG)

However beneficial self hosting can be, there are a few problems with it.
Disclaimer: This is all on a raspberry pi, so it is not a full-featured server which might get around some of these problems.

- Your power or internet might go out and your website is down. 
- Your public IP might change and you have to manually update your DNS if you do not have a script monitoring this.
- Old dependencies might only work on certain computing architectures and you have to manually compile them, and learn how to compile C and fix dependencies issues in C. 

2 of these problems are simple to fix, but they are a pain to find what the exact problem is without good monitoring and logging (which was something I overlooked).

The last problem on that list is my favorite because of how time consuming the problem was. When I initially created my [Attack Map project](/posts/attack-map), I wanted to send logs via HTTP.
I found that the standard way on linux to send logs was using rsyslog. I was able to find documentation on how to send logs via HTTP, however I kept getting missing module errors. I was confused and kept trying different combinations of arguments, but nothing.
I gave up and settled for sending them via TCP, since the producer (rsyslog) and consumer application (python script) were going to be on the same device. 

I tried to fix this problem, every couple of weeks but then eventually, I decided to compile rsyslog from source, and when reading the instructions for compilation I found out that the module I was using has to be enabled when compiling rsyslog. 

At that point I had spent around 30 hours on this error, and I never wanted to work with Linux dependencies or packages again.

A simple fix that took me a couple of months to wrap my head around. 

## Terraform and AWS

After the bliss of figuring that error out, I could start migrating to AWS.

These are the steps I took to migrate the attack map project to AWS:

There are some best practices from my previous job at Cox Automotive that I learned and wanted to apply in this project.
- I created an S3 bucket for deployment packages and terrform state files.
- I seperated the terraform into files and what service the code was for.
- Use variable for things that change like the domain name, and subdomains.
- Minimum permissions for all services.

Here is a infastructure diagram of the attack-map in AWS.
![infra](/assets/blog/aws/infra.png)

I first wanted to add cloudflare to the website since I could take advantage of their terraform and overall great ecosystem such as automatic TLS/SSL certs, DDOS protection and other neat things. This process was quick and summarized by the code below.

```ruby

# simple way to update all my subdomains when my public_ip changes
resource "cloudflare_record" "domain" {
  for_each = toset(var.subdomains)
  zone_id  = data.cloudflare_zone.domain.id
  name     = each.value
  value    = var.server_ip
  type     = "A"
  ttl      = 1
  proxied  = true
}
```

Once, I was able to create the ACM certificate then I can use it to attach subdomians to public IPs.

### Simple Single page application
The frontend for my attack map project is HTML. I was able to use CloudFront to serve this static content, while also using Cloudflare caching.

For this single page application I wanted the an embedded script to run within the HTML to pull data from an API and send back the recent hackers from the past 24 hours.

The best way I found to do this was to have an API gateway forward requests to a Lambda, this lambda then passes back an HTTP response with the nessecary body. 

The backend was initally in javascript, but now it is in rust, since I wanted to learn more about Rust and the state of rust tooling for AWS. Currently, the process of deploying rust onto a lambda is a bit difficult.
More on that in a seperate post!

## Ok, everything is working now!

WAIT! WHY IS MY AWS BILL 20 USD? 
![cost](/assets/blog/aws/cost1.png)

Next problem I had was that I wanted to lower the cost of my server.
What was the point of moving to AWS if they are going to charge me an arm and a leg.
Looking at my costs it was all coming from a NAT gateway


One solution I found was to run my own NAT gateway using an EC2 instance, lowering the cost down to 5$ a month.
```ruby
resource "aws_instance" "nat" {
  ami           = var.nat_ami 
  instance_type = "t3a.nano"
  subnet_id     = aws_subnet.public-subnet.id
  associate_public_ip_address = true
  vpc_security_group_ids = [aws_security_group.nat.id]
  source_dest_check = false
}
```

## Update 3.11.22
![infra](/assets/blog/aws/rip.png)

This project cost me around 100 dollars to run, and alot of time so I will be stopping development for now!
[The Code is on Github](https://github.com/notedwin/infra)

Resources:

[AWS Whitepaper on Serverless](https://docs.aws.amazon.com/whitepapers/latest/serverless-multi-tier-architectures-api-gateway-lambda/single-page-application.html)
