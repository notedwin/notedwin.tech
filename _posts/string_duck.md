---
title: "Duckdb? spark? why not both?"
excerpt: "A trip into the web"
date: "2024-02-13T05:35:07.322Z"
image: "/assets/blog/aws/infra.png"
---

TLDR: I did something cursed.

Last week, I was working on refactoring an old pipeline that didn't run anymore. I was working on fixing how we found best match between 2 datasets.We were using exact match, but we needed to use string similarity to find the best match.

I did some local testing using DuckDB and found some good results using Levenstein algorithm which calculates edit distance and is effective for minor misspellings. However, it struggled with distinguishing between words like "fish" and "fishing," or "boating" and "riding."

Back to the drawing board.

After looking at DuckDB documentation, I found jaro_similarity which performed better due to looking for common prefixes.

Great! Let's get this in pyspark.

oh no...

There is no built-in implementation of jaro similarity in pyspark.
You have to create a model lol.
https://stackoverflow.com/questions/43938672/efficient-string-matching-in-apache-spark
I was able to get a basic example but I could not figure out how to apply this to a group.

I did something that is typically frowned upon, but I decided to use a UDF to apply the jaro similarity to each row in the dataframe.

In my research, I found that pandas_udf is faster than typical UDF's since they use arrow to pass data in memory between spark and pandas.

My pipeline was only slowed down by 10% using this method, compared to using levenstein distance and getting worse results, so I decided to go with it.

The udf is below, if anyone knows how to do this better please let me know!

```python
@pandas_udf("float")
def jaro_similarity(s1: pd.Series, s2: pd.Series) -> pd.Series:
    df = pd.concat([s1, s2], axis=1)
    df["jaro_similarity"] = df.apply(
        lambda x: duckdb.execute(
            "SELECT jaro_similarity(?, ?)", [x[0], x[1]]
        ).fetchone()[0],
        axis=1,
    )
    return df["jaro_similarity"]
```
