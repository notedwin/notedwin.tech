---
title: "Removing DRM from E-Books"
excerpt: "DRM .ascm adobe Piracy"
image: "/assets/blog/attack-map/map2.png"
date: "2020-08-21T05:35:07.322Z"
---

> Why remove DRM? Aren't you stealing money from someone/ Isn't that Illegal? **No, It isn't**

# What is DRM?
DRM is a digital rights management system that prevents unauthorized access to digital content. -- [Wikipedia](https://en.wikipedia.org/wiki/Digital_rights_management)


## what is Adobe Digital Editions?

Adobe Digital Editions is a software package that allows you to read and write digital books.

## Why are you removing it?

Technical Writing class required a book from independent publisher. The publisher sold a PDF version of the book for cheaper than the hard cover book. As a college student, saving 15 dollars is always a good idea.

However, what I didn't realize was that most adobe products don't run well on Linux.
More specifically I did not want to use a 10 year old version of digital editions to read a book everyday.
I figured there must be a way to convert the file to a pdf.
After a couple of hours of research, I found a tool to remove DRM from books called DeDRM.

I found a tool to remove DRM from books called DeDRM.
The tool is written in Python2 and relies on Adobe digital editions 2.0.

Using the adobe digital editions file (.ACSM), DeDRM generates the adobe keys. These adobe keys are nessecary to help decrypt the file.

BAM! you now have a an adobe digital editions book in pdf format.

[dedrm](https://github.com/apprenticeharper/DeDRM_tools)
