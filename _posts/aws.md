---
title: "Migrating to AWS"
excerpt: "Self-hosted > Private Cloud"
date: '2021-11-19T05:35:07.322Z'
coverImage: '/assets/blog/home-server/rasp-pi.webp'
ogImage:
  url: '/assets/blog/home-server/rasp-pi.webp'

---

> friend: dawg your website is down.
>
> me: again? come on man

Self-hosting applications is painful. Errors come in many forms but all result in the same things, 2 hours of debugging a problem that will reoccur.

Usually I had problems with my router but every time I thought my DNS entries were not correct, or my SSL certs were expired or public IP address changed. However, most were solved with a reboot of my system and router.

I relied on an old C project called Rsyslog to send logs to one of my applications. Rsyslog was not forgiving, I had to compile the code from source since some packages that were community maintained were not included in the standard package. However simple this sounds, there was relatively no documentation on this.

However, self-hosting these applications was not a total loss, I learned about Nginx, networking, Jenkins, Linux by continuously ramming my head into their documentation. All of these things I had 0 experience with prior to self hosting and we absolutely essential to understanding Amazon Web Services.

While hosting a server on AWS has you looking at all 200+ services like what the hell do i pick.

## Terraforming

I used Terraform at work and thought it would be a good fit. Terraform would allow me to imperatively define infrastructure while also documenting it for later purposes.

Starting at the DNS level, I imported my domain to cloudflare so I could take advantage of their terraform and overall great ecosystem such as automatic TLS/SSL certs, DDOS protection and other neat things. This process was quick and summarized by the code below.

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

Next I had to configure AWS Lambda and elasticache(Redis) in their own private subnet if I wanted to allow lambda to interact with redis.

However, my initial way of setting up AWS lead to me having hourly NAT gateway charges, which totalled 35 dollars for a month just for securing my appications in a VPC. An alternative I found was running your own NAT gateway in an EC2 instance and saving 30 dollars a month!

![infra](/assets/blog/aws/infra.png)

**To Be continued**

[Code is on Github](https://github.com/notedwin/infra)

