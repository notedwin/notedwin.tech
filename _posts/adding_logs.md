---
title: "Adding HTTP Logs to Attack Map"
excerpt: ""
date: '2022-10-17T05:35:07.322Z'
image: '/assets/blog/aws/infra.png'
---

# Adding HTTP Logs to Attack Map


Hey everyone! It has been a while since I last posted. I have been learning about data engineering. Today, I wanted to share my experience with monitoring HTTP traffic using SQL and Python. 

The goal of this project was to have a dashboard that shows me important information about my website at a glance.

This can be the number of visitors, the number of pages visited, the number of unique visitors, and the number of unique pages visited, etc.

## Background

As you may know, having a physical server for your website comes with many responbilites such as keeping the server up to date, monitoring the server, and making sure the server is secure.

While external services such as Google Analytics can help you monitor traffic to your website, why not create your own tool to monitor your website? 

Using logs and processing them using Python and SQL, you can create a tool that can monitor your website and help you understand how your website is being used.

There are 3 main steps to creating a data pipeline that allows you to monitor your website:
1. Ingest HTTP logs into a SQL database
2. Process the logs using Python
3. Visualize the data using a dashboard

Some prerequisites for this project are:
- Nginx server
- SQL database

## Ingesting HTTP logs into a SQL database

The first step is to get the HTTP logs from your server. If you are using Nginx, you can find the logs in `/var/log/nginx/access.log`. 

The next question is how do you get the logs from your server to your SQL database?

There are many ways to do this, but I chose to use Rsyslog. Rsyslog is a tool that allows you to send logs to a remote server. This is a linux tool that is installed by default on most linux distributions.

To install Rsyslog, run the following command:
```
sudo apt install rsyslog
```

Once Rsyslog is installed, you need to configure it to send logs to your SQL database.

To do this, you need to edit the `/etc/rsyslog.conf` file.

``` bash
# The imfile module will wait for new loglines in the given file
input(type="imfile"
      File="/var/log/nginx/json/access.log"
      Tag="nginx:")

template(name="pgsql-template" type="list" option.sql="on") {
  constant(value="INSERT INTO accesslog (log_line, created_at) values ('")
  property(name="msg")
  constant(value="','")
  property(name="timereported" dateformat="pgsql" date.inUTC="on")
  constant(value="')")
}


if( $syslogtag == 'nginx:')  then {
  action(type="ompgsql" server="localhost"
        user="L"
        pass="L"
        db="logs"
        template="pgsql-template"
        queue.type="linkedList")
}
```

The configuration above will send the logs to a SQL database called `logs` on the localhost. The logs will be sent to a table called `accesslog` with the following columns:
- `log_line`: The log line, which is a JSON object
- `created_at`: The time the log was created

## Processing the logs using Python
The log_line column in the accesslog table is a JSON object. This is not very useful for querying the data. We need to expand the JSON object into multiple columns.

To do this, we can use the `json_normalize` function from the pandas library.

``` python
normalized_df = json_normalize(raw_data["log_line"])
    normalized_df = pd.concat([raw_data, normalized_df], axis=1)
    normalized_df = normalized_df.drop(columns=["log_line"])
    row_inserted = normalized_df.to_sql(
        table_name,
        engine,
        if_exists="append",
        index=False,
        chunksize=100000,
        method="multi",
    )
    logger.info(f"Inserted {row_inserted} rows into {table_name} table")
```

The code above will expand the JSON object into multiple columns. 

## Visualizing the data using a dashboard
Having a dashboard that shows you important information about your website at a glance is very useful.

To create a dashboard, I used the [Grafana](https://grafana.com/) tool. Grafana is an open source tool that allows you to create dashboards using SQL queries.

To create a dashboard, you need to create a data source. A data source is a connection to a SQL database.

