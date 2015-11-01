---
layout: "post"
title: "Our Blog Setup"
date: "2015-01-09 11:30"
tags: 
- "inside"
ogtype: "article"
bodyclass: "post"
---

I've gotten a few questions asking how our blog system works. Our blog works off of a heavily modified version of the excellent [Camel.js](https://github.com/cliss/camel/) blog engine written by [Casey Liss](http://www.caseyliss.com).

Some of the variations we've made is adding support for linked posts, adding XML sitemaps for SEO and we've also changed a few other things. Up next, we plan to introduce tagging for post organization which will be released in the next couple weeks.

We write our posts using a Dropbox deployment, we have a shared posts folder where we update posts and then when ready to go live, we deploy via [Heroku](http://heroku.com) where this blog is hosted.

Images are usually hosted either via [Droplr](https://droplr.com/) or directly via [Dropbox](http://dropbox.com), and we've also set up [Embed.ly](http://embed.ly) to handle embedding videos or any other supported oEmbed feature.

Overall, we're happy with how this blog works, it's been running smoothly for over three months and it's set up in a process we can work with easily.