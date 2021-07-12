---
title: "Catch-All: DeDrm, Fullstack, Figma, Security"
excerpt: "Something Chill"
date: "2021-07-11T05:35:07.322Z"
coverImage: "/assets/blog/home-server/rasp-pi.webp"
ogImage:
  url: "/assets/blog/home-server/rasp-pi.webp"

---

## Computer Security: HackTheBox and CTF's

After my last post [attack-map](https://edwin.computer/attack-map), that project might seem a bit unrelated to my other projects. My real intrest stems from one day becoming paranoid that my server was going to be DDoSed or I did not have a secure machine.

I took a computer security course. From this course I learned how things can be vulnerable and how we can tell when these things are vulnerable.

The main arsenal of tools I use:

- Kali Linux(in a VM)
- Bash,Python, nmap, burp

We started the course by going over networking basics such as TCP packets, RFC's for REST API, different ports that use what.

One of my favorite movies on computer security, [Zero Days](https://en.wikipedia.org/wiki/Zero_Days).

## Full-stack Development

Full-stack development is the process of creating a system or application, usually available through the internet.

### How should I get started?

Make projects, Break things, Code Consistenly. There are a ton of resources for any questions you might have.

### My projects

I first started with full-stack development for one of my classes where we had to build a ecommerce store. I knew big eccomerce companies like shopify, so I google what they used and they used django so I thought I could use it on my first try. Boy was I wrong, I had no idea what I was doing but thats part of learning. 

I tried to make an blog using Gatsby but it took me a long time instead of the shorter time it would have taken me if I would have learned javascript first.

### What would I do differently?

Not much, probably just start from something simpler such as a website in HTML and plain javascript that uses an API.

Then go to a web JavaScript framework or start back-end programming. After that you can continue practicing and adding complexity.

You'll have an idea for a project if you are always coding.

Good Luck!

Resources
--------

- [Roadmap's](https://roadmap.sh/)
- [Some random dudes take on what to learn for web development](https://youtu.be/1BPQj438FyQ)
- [What To Learn Before A JavaScript Framework](https://youtu.be/qi9VQqYcXqY)
- [FreeCodeCamp](https://www.freecodecamp.org/learn) 
  The project from FreeCodeCamp are a good place to start.  
- [Mozilla Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)  
  Mozilla has good resources for working with the Internet.
- [The Missing Semester of Your CS Education](https://missing.csail.mit.edu/) 
- [TeachyourselfCS](https://teachyourselfcs.com/) Learn Data structures and Algorithms for interviews. 
- [The list to end all lists](https://github.com/jnv/lists)
- [wat](https://www.destroyallsoftware.com/talks/wat)



## Figma Board's

-------------------

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FVmdl1MtmqTVqJH1pRBbfEl%2FSpotifyCovers%3Fnode-id%3D0%253A1" allowfullscreen></iframe>

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F7MuSbhropPG2zjb1RTcSVA%2Flogo-drawing-board%3Fnode-id%3D0%253A1" allowfullscreen></iframe>

## DRM Post

Digital right management is a systematic approach to copyright protection for digital media.

Why remove DRM? Aren't you stealing money from someone/ Isn't that Illegal? ***No, It isn't***

Story time, one of my classes required a book from an independent publisher, who sold a PDF version of the book for cheaper than the physical copy.

I bought the PDF, but it actually turned out to be an adobe digital editions copy, which is a PDF wrapped in DRM. This itself would not be an issue but running adobe products on Linux is awful, they run slow and crash often requiring so much old and potential vulnerable libraries. 

So as any reasonable person would do, I asked my partner to use her Mac to use Adobe digital editions so I could try to download the PDF. However, I created another problem on accident, I did not know that the DRM on this book limited to one device. I can't ask my partner to borrow her laptop every time I want to read this book so now I had to figure out remove the adobe DRM from this .ascm file.

After a couple of google searches, I found a tool to remove DRM from books called [DeDrm](https://github.com/apprenticeharper/DeDRM_tools).

This tool uses the adobe digital editions file (.ACSM)  then run a python script on the .ascm file to generate the adobe keys. These adobe keys are necessary to decrypt the file. BOOM, from a ascm file to a PDF.

Moral of the story: buy physical copies

