---
layout: post 
published: true 
title: "Measure Anything, Measure Everything" 
date: 2015-11-10T00:11:08.698Z 
link: https://codeascraft.com/2011/02/15/measure-anything-measure-everything/ 
tags:
  - links
ogtype: article 
bodyclass: post 
---

Ian Malpass:

> If Engineering at Etsy has a religion, it’s the Church of Graphs. If it moves, we track it. Sometimes we’ll draw a graph of something that isn’t moving yet, just in case it decides to make a run for it. In general, we tend to measure at three levels: network, machine, and application. (You can read more about our graphs in Mike’s [Tracking Every Release](http://codeascraft.etsy.com/2010/12/08/track-every-release/) post.)
> 
> Application metrics are usually the hardest, yet most important, of the three. They’re very specific to your business, and they change as your applications change (and Etsy changes a lot). 
>
> Instead of trying to plan out everything we wanted to measure and putting it in a classical configuration management system, we decided to make it ridiculously simple for any engineer to get anything they can count or time into a graph with almost no effort. (And, because we can push code anytime, anywhere, it’s easy to deploy the code too, so we can go from “how often does X happen?” to a graph of X happening in about half an hour, if we want to.)

This is an older post, but it's handy advice. Metrics are important in any app, and statsD is a handy tool.