---
title: "Accessing Screen time + Health Data"
excerpt: ""
date: '2023-06-25T05:35:07.322Z'
image: '/assets/blog/aws/infra.png'
---

### Intro

> Rough draft -- not complete

> TLDR: This presentation sums up my findings: 

- [https://www.elcomsoft.com/presentations/20200129_health_and_activity_evidence_en.pdf](https://www.elcomsoft.com/presentations/20200129_health_and_activity_evidence_en.pdf)


Obviously, Apple doesn't want anyone to access your data.

They prioritize privacy and security by encrypting your data and making it hard to obtain.

For example [System Integrity Protection](https://en.wikipedia.org/wiki/System_Integrity_Protection)

However, what if you want to access your own data?

According to Apple, it's impossible, and unnecessary because they know what's best for us. (misquote)

Surprisingly, in 2023, we still can't download all our data from iCloud. 

### Screen time

Fortunately, I can easily retrieve screen time data for all my Mac devices using the following command:

```bash
sudo sqlite3 ~/Library/Application Support/Knowledge/knowledgeC.db
```

Here are two useful resources for understanding the data:

- [Spelunking macOS Screen Time App Usage with R](https://rud.is/b/2019/10/28/spelunking-macos-screentime-app-usage-with-r/)
- [Using the KnowledgeCDB Database on macOS and iOS to Determine Precise User and Application Usage](https://www.mac4n6.com/blog/2018/8/5/knowledge-is-power-using-the-knowledgecdb-database-on-macos-and-ios-to-determine-precise-user-and-application-usage)


I have a dashboard that shows me how much time I spend on VSCode vs. Twitter, etc.


### Health Data

![Health Dashboard](/assets/blog/health.png)

The only suggested way to get health data from iOS is only possible through the Health app, which requires manual export and provides data in XML format that is not easily parsed.

Using third-party apps for this purpose seems sketchy, so I'm good without them.

The only other way to get the health data is by manually backing up the phone and extracting the data from the backup.

The backup is also encrypted, so you need to know the password to decrypt it.

To decrypt the backup, you can use this great tool:
[https://github.com/jsharkey13/iphone_backup_decrypt](https://github.com/jsharkey13/iphone_backup_decrypt)

For a longer post on this topic, check out: [How to Decrypt an Encrypted Apple iTunes iPhone Backup](https://stackoverflow.com/questions/1498342/how-to-decrypt-an-encrypted-apple-itunes-iphone-backup)


```python
from iphone_backup_decrypt import EncryptedBackup, RelativePath, RelativePathsLike
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

passphrase = os.getenv("APPLE_PASSPHRASE")
backup_path = os.getenv("APPLE_BACKUP")

backup = EncryptedBackup(backup_directory=backup_path, passphrase=passphrase)

backup.extract_file(relative_path=RelativePath.HEALTH_SECURE, 
                    output_filename="./output/health_secure.sqlite")

backup.extract_file(relative_path=RelativePath.HEALTH, 
                    output_filename="./output/health.sqlite")

```

Feeling like this guy with no replies: [Best Way to Export Health/Workout Data](https://www.reddit.com/r/AppleWatch/comments/ysq39o/best_way_to_export_healthworkout_data_for/)
and this [guy](https://developer.apple.com/forums/thread/725411) after reading and doing all this work.


I want to see how my resting heart rate has changed over time, but I can't access the data.

Research suggests that a lower resting heart rate is correlated with being more "fit."

I also want to analyze how my sleep patterns have changed over time, but I can't access the data either.

Ideally, I wanted a more automated solution, but manual backups are the only way to obtain the data.

For more resources on this topic, check out: [Reverse Engineering the iOS Backup](https://www.richinfante.com/2017/3/16/reverse-engineering-the-ios-backup)