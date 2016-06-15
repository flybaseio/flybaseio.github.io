---
layout: post 
published: true 
title: "Who needs connection limits?"
date: 2016-06-02T09:25:11.506Z 
tags:
  - inside
image: "http://blog.flybase.io/images/posts/announcement.jpg?20160217"
ogtype: "article"
bodyclass: "post"
---

<div class="box-wrap"><div class="box">
  <img src="/images/posts/announcement.jpg?20160217" />
</div></div>

It's June, the year is halfway done and we're continuing to build a service that people use every day.

We've got lots of new things rolling out over the next few weeks, but I wanted to point out something we quietly changed a couple weeks ago.

**We killed connection limits on all paid plans!**

> An app connection is a measure of the number of devices that are connected to your app's database simultaneously. This isn't the same as the total number of visitors to your site. It is any open network connection to our servers, including streaming REST API requests

First, this was easy to kill since paid plans were always `burstable` and didn't actually have any hard limits on connections. So it was really not a difficult choice at all.

We still have a limit of 100 simultaneous devices on our free `starter` plan, but we're happy to say there are no limits at all for simultaneous device connections on our paid plans.

With this, we've also changed our prices, with the Saturn plan starting at $19.99 a month, and all our other plans reflecting our pricing change as well. I think you'll like our new prices.

Stay tuned to see what we've got coming this month, I promise it'll be fun.
