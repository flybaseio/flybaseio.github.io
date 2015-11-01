---
layout: "post"
title: "Are we making it better?"
date: "2015-02-03 11:30"
tags: 
- "links"
link: "https://signalvnoise.com/posts/3850-are-we-making-it-better"
ogtype: "article"
bodyclass: "post"
---

David Heinemeier Hansson:

> A common approach to problem solving is to consider it binary. Either you’ve fixed the issue or you haven’t. Some problems fit that domain well: Either the calculator returns 2 on 1 + 1 or it doesn’t. There really isn’t much of a middle ground.
> 
> But many problems in product development aren’t like that. They’re far more hazy. Solving a problem in 100% of the cases for 100% of the people might very well not even be possible. So thinking of such problems as binary flips is not only futile, but harmful.
> 
> A better way to think of hazy problems, like “how easy is it to get started with Basecamp?” or “is the query interface for Active Record as readable as can be?”, is to focus on mere progress instead: Are we making it better?

Another well-written post from the Basecamp crew.

We faced similar questions with Data McFly, mostly in the query engine, how complex did we want to make it? In the end, it became a matter of how users preferred to use the query engine that helped us answer that question, and we built a query engine that work similar to MongoDB to help make retrieving data easier.