---
layout: "post"
title: "Coding in the cloud: a week with a chromebook"
date: "2014-11-10 18:00"
tags: 
- "chromebook"
ogtype: "article"
bodyclass: "post"
---

I do most of my development work on Macs, but I  recently challenged myself to take a chromebook with me on a recent conference trip.

So here I was with a chromebook, my iPad and my iPhone. And I had to be able to do work. I mostly wanted to work off my chromebook.

I've always been a proponent of the web platform, and I decided to "go native" on the web to find out if it could really hold up as a primary machine for a highly technical heavy user.

*TL;DR: Using a Chromebook as a development machine, even without installing Linux, is possible and even pleasant. There are trade-offs, but there are also a few benefits you can't get anywhere else.*

### Developing in the Cloud

When I say that I'm using a Chromebook, what I really mean is that I'm using web applications as my development tools. There's nothing stopping anyone on any OS from using the same tools and gaining most if not all of the same benefits. In fact, if you're on Windows trying to build with Node, Ruby, etc. the web tools might be better than what you're using today.

I looked at several IDEs for ChromeOS, and narrowed it down to three main services:

* [Cloud 9](https://c9.io/)
* [nitrous.io](https://www.nitrous.io/)
* [Codeanywhere](http://codeanywhere.com)

I had a set of specific requirements for this experiment too:
  
* Can I connect to my git repos?
* Can I connect to my own servers via SSH or SFTP?
* Cost

All three can do this but differently.

### Cloud 9 IDE

[Cloud 9](https://c9.io/) has been around for a long time. Their IDE is a native-quality development experience, and in many ways better than native with its integrated terminal experience.

On the other hand, the environments they provide (even on a premium account) aren't so beefy. I quickly ran out of space with no way to upgrade it. Additionally, you can only expose one application to the outside web, making it hard to test a complex web application.

Cloud 9 does have an ace in the hole, though: you can actually connect the IDE to any server using SSH and a little install script. Right now my development environment is actually a [DigitalOcean](https://www.digitalocean.com/?refcode=326e96423ba7) droplet using Cloud 9 as the front-end.

**Pros:** Amazing and configurable IDE, connect to any box, workspace state is persisted.

**Cons:** Wimpy provided containers, can only expose one port at a time if you're not running your own box.

### Nitrous.io

[Nitrous.io](https://www.nitrous.io/) was my environment of choice until a month or two ago. It was the first fully viable solution, providing a dedicated VM and an IDE on top that was good enough to make me not miss Sublime (most of the time).

**Pros:** highly configurable VMs (beefy box!), team features (such as box snapshots), real-time collaboration features, easy package install for most common things, can expose multiple ports on a box.

**Cons:** IDE doesn't see frequent updates, state is lost on reload

### Codeanywhere

[Codeanywhere](https://codeanywhere.com) is one of the better choices, and they have an iPad and iPhone app that carries over your setup from the browser. You can set up your own box for development, or you can connect to servers via SFTP or FTP.

**Pros:** easy to set up,  works from browser or from iOS devices seamlessly.

**Cons:** price can be a factor, but it's manageable.

In the end, I did most of my work using Codeanywhere, it's actually a good toss up between Codeanywhere and Cloude 9, so either of those work well.

### Other Apps

Of course, there are times when you have to do a lot more than just development. Here's a fast rundown of the various tools and extensions I use on a regular basis:

#### Developer Tools

* [**Postman**](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm?hl=en) is a fantastic extension for making HTTP requests and checking APIs.
* [**Text**](https://chrome.google.com/webstore/detail/text/mmfbcljfglbokpmkimbfghdkjmjhdgbg?hl=en) is a good lightweight text editor for viewing and editing local files.
* [**Zed**](https://chrome.google.com/webstore/detail/zed-code-editor/pfmjnmeipppmcebplngmhfkleiinphhp?utm_source=chrome-app-launcher) is an interesting text editor that lets you edit files on remote machines.

#### Business Tools

* **GMail** for mail, **Google Drive** for docs, **Hangouts** for video chat and IM. Of course.
* [**Slack**](https://slack.com) for team chat. Strongly recommended.
* [**Feedly**](https://feedly.com) for feed reading.
* [**TweetDeck**](https://about.twitter.com/products/tweetdeck) for the Twitters.
* [**Zendesk**](https://zendesk.com) for customer support.
* [**Trello**](https://trello.com) for project management.
* [**IRCCloud**](https://www.irccloud.com/) for always-on IRC chat.
* [**Draft**](https://draftin.com) is a great tool for, well, drafting Markdown text. I'm using it right now, in fact.

#### Entertainment

* Netflix, Hulu, Prime Video, etc. all work great on Chrome OS.
* [**Put.io**](https://put.io/) is fantastic for perfectly legal downloading and streaming of files via BitTorrent.

### What Rocks

**Crash Plan.** If someone grabbed my Chromebook and threw it out a window, I could be up and running on a new one in less than five minutes. Chrome OS syncs everything, even what you have installed and task bar positions. This comes in useful if you like playing in the dev channel but need to reset to beta/stable when bugs inevitably crop up.

**Every Computer.** Related to the above, I can pop open an incognito tab on anyone's computer, log into Cloud 9 or Codeanywhere, and get to work quickly. I've used this in real life both while visiting family and on public computers when emergencies arise.

**The Interface.** When everything's just a browser tab, multi-tasking is actually super-pleasant. I find tabs and pinned tabs to be a better way of contextualizing my workspace than app switching ever was.

**Peripherals.** I was worried this would be a pain, but it's actually seamless. I work on an external monitor with a Logitech USB mouse most of the time. Plug-and-play holds up in Chrome OS.

### What Sucks

**Media.** There are no decent graphic, sound, or video editing programs for Chrome OS. Most often I find myself missing Illustrator, but if you're heavily reliant on any of the Adobe tools then you won't be able to make a go of the Chromebook just yet, though Adobe has announced a Photoshop cloud setup for Chromebooks shortly. Also, a Chromebook obviously isn't a gaming machine.

**Connectivity.** You do have to be connected to the internet <em>all the time period</em> to be productive on a Chromebook. Well, ok, you can install Ubuntu but that sort of defeats the purpose. While this isn't a problem 99% of the time, that 1% of the time it can be pretty frustrating.

### Wrapping Up

The biggest advantage of a cloud development environment is its ability to be wherever you are. My ability to be productive from anywhere on any machine with an internet connection has more than made up for the occasional frustration with a lack of some native tool.