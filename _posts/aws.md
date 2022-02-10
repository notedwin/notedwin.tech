---
title: "Migrating to AWS"
excerpt: "Self-hosted > Private Cloud"
date: '2021-11-19T05:35:07.322Z'
coverImage: '/assets/blog/home-server/rasp-pi.webp'
ogImage:
  url: '/assets/blog/home-server/rasp-pi.webp'

---

> wait my website isn't working again?

## Self-Hosting

Self hosting is a great way to get started and learn more about certain technologies

While self-hosting all my web applications for about 2 years. I learned about Nginx, Redis, and Jenkins, Linux, computer networking, and more. All by working the problems I was facing and learning how to solve them.

This experience was essential to understand how to deploy applications to AWS since there are over 200+ services that can be used to host applications.

### Learn the inner workings of C and C++ even if you are paid to be a Python Developer

![meme](/assets/blog/aws/alpine.JPG)

However beneficial self hosting can be, there are a few problems with it.
Disclaimer: This is all on a raspberry pi, so it is not a full-featured server which might get around some of these problems.

- Your power or internet might go out and your website is down.
- Your public IP might change and you have to manually update your DNS.
- Some dependencies might only work on certain computing architectures and you have to manually compile them

2 of these problems are simple to fix, but they are a pain to find what the exact problem is without good monitoring and logging (which I don't have).

The third problem is my favorite example of a time-consuming problem.
My attack map project is one of the applications I hosted locally.
I wanted to send logs via HTTP so I could later move the project to AWS.

However, the only way I could send logs via HTTP was with an old project called Rsyslog.
Rsyslog being a C project, the assumption is that you know the language can compile it manually and you can use it.

I did not know I had to compile the project to get certain feature which was not outlined in the documentation but I have to read through many forum posts.

A simple fix that took me a couple of months to wrap my head around. 
I initally gave up and used TCP instead of HTTP to send the logs since I just wanted to have a working example.

## Terraform and AWS

Ok thats enough of the self-hosted stuff, lets move on to the AWS stuff.

I wanted to migrate all my website and application to AWS, but I decided to start with one application and then migrate it to AWS.

I chose my attack map project to migrate. These are the steps I took to migrate it to AWS:

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

### API Gateway, Elasticache and Lambda
Once, I had the domains set up I could work on getting the API gateway and lambda working in together.

I worked on getting API gateway to send a HTTP response to the lambda function and then the lambda function sends back a response to the end user.

Once, this was working I had to add Elasticache(Redis) to work with AWS lambda.

Since AWS has huge data centers, there is no way to these services to interact without either a public ip or a private subnet.
The private subnet is the better option for security, as it allows for these services to talk to each other without being open to the internet.

### Cloudfront

I have static HTML that doesn't change often, so I decided to use a cloudfront distribution to serve the static content while also using cloudflare caching.

No reason in wasting resources on something that doesn't change often.

The HTML comes with a small script file that pulls data from a API gateway endpoint that triggers the lambda function and send back the recent hackers from the past 24 hours.

However, I suffer from SLOW cold starts in python and javascript, so I am currently working on migrating the lambda to rust.



# Ok, everything is working now!

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


## Deploying

Deploying the application once the terraa
```bash
# I kept my secrets in a file and then just used the var-file to pass it to terraform.

Terraform init
Terraform plan
Terraform apply

# For debugging
Terraform state list

```

*This post is still a work in progress.*


[Code is on Github](https://github.com/notedwin/infra)

Resources:

[AWS Whitepaper on Serverless](https://docs.aws.amazon.com/whitepapers/latest/serverless-multi-tier-architectures-api-gateway-lambda/single-page-application.html)
