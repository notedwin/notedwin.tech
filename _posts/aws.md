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

Self-hosting applications is painful. Errors come in many forms but all result in you having to do a couple of hours of debugging. One week it could be that Comcast decided to change your public IP, the next you forget to update your SSL certs, *one week my router actually stopped forwarding traffic*. Running anything an ARM architecture is not forgiving, it will probably get better in the future since we are seeing chips like the M1 chips but debugging architecture level errors and compiling code from source is TEDIOUS.

However, self-hosting these applications was not a total loss, I learned about Nginx, networking, Jenkins, Linux by continuously ramming my head into their documentation. All of these things I had 0 experience with prior to self hosting and we absolutely essential to understanding Amazon Web Services.

While hosting a server on AWS has you looking at all 200+ services like what the hell do i pick.

## Terraforming

I used Terraform at work and thought it would be a good fit since most of my websites are static content or only get data once such as on load.

I had used it at work and thought it was really neat, imperatively defined servers whats not cool about that?

I first had to start at the DNS level. This is where I had the most errors.

Comcast isn't known for loving people that self host.

I get a new public IP every couple of months but man is it annoying to debugg sometimes?

you are like nothing has changed whta broke?

so i went with using cloudflare as my primary dns server, mainly for other benefits such as automatic TLS/SSL certs, DDOS protection and other neat things.

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



**To Be continued**



Some pain points about AWS:

AWS free tier charges you for NAT gateway usage. There are ways around this such as running a NAT gateway on a micro ec2 instance. However, there are no up to date AMI's which means it something I had to do from scratch.

Nat gateways are used if you want a VPC to have internet connection.

- A lambda and elasticache(redis)

[Code is on Github](https://github.com/notedwin/infra)

