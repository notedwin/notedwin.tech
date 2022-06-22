---
title: "Messages from Iphone"
excerpt: "sms.db apple messages backup"
date: "2022-05-13T05:35:07.322Z"
image: "/assets/blog/haxml/website.png"
---

Chat.db is an apple sqlite database that contains all your messages.

This file however cannot be accessed directly from the device with the messages you want to view. 

You first have to create a backup of the phone. Once the backup is complete the files are in:
```
~/Library/Application Support/MobileSync/Backup/
```

Inside this backup the file names are obscfucated, so we have to find the manifest.db file which contains the mappings from the original filenames to the backup names.

I opened the file in sqlite and queried for sms.db
```
~/Library/Application Support/MobileSync/Backup/manifest.db
```
  
Now you have all your messages, create an NLP model that learns your communication patterns :p

  
For me I had backed all my texts up since 2014 so now I have access to all.

Resources:

[https://apple.stackexchange.com/questions/6900/how-can-i-export-sms-text-messages-from-my-iphone/6904#6904](https://apple.stackexchange.com/questions/6900/how-can-i-export-sms-text-messages-from-my-iphone/6904#6904)