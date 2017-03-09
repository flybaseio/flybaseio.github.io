---
layout: post
published: true
title: "Build a Status Page powered by Github and Uptime Robot"
date: 2017-03-09T16:03:40.871Z
tags:
  - code
image: "https://blog.flybase.io/images/posts/js.jpg"
ogtype: "article"
bodyclass: "post"
---

<div class="box-wrap"><div class="box">
	<img src="/images/posts/js.jpg" />
</div></div>

_This post was originally posted on [Coded Geekery](http://codedgeekery.com/build-a-status-page-powered-by-github-and-uptime-robot/), my personal blog about finding a work-life balance, but I wanted to share it here as well since it's about the Flybase status page._

### Overview

We built our own status page for Flybase, you can see it [here](http://status.flybase.io).

It was built as a static HTML page on Github Pages. It uses Github Issues to report any incidents and [Uptime Robot](http://uptimerobot.com) to monitor our sites.

To get started, you'll want two things:

1. An [Uptime Robot](http://uptimerobot.com) account
2. A GitHub repo where you can throw your site up and use the issues system.

Create a branch in your repo called `gh-pages`, this is where your files will sit.

Ok, let's build our status page:

#### 1. create index.html

First, create our `index.html` file:

<script src="https://gist.github.com/freekrai/4a3bd796a374fc6fd42f7359570372dd.js?file=index.html"></script>

#### 2. Create script.js

Next, we'll create `script.js`, this is the file that talks to our services.

Replace the following variables with actual lines:

`YOUR-UPTIME-ROBOT-API-KEY-1` and `YOUR-UPTIME-ROBOT-API-KEY-2`: Uptime Robot's default API key is universal, but is also read and write. We want this monitor to be read-only so we have to create an API Key for each site we are creating. This is an array of keys.

_To add more sites, just add a new line and add a new monitor key._

`YOUR-GITHUB-USERNAME`: Your Github username where the repo you created lives.

`YOUR-GITHUB-REPO`: The Github repo you created to use.

<script src="https://gist.github.com/freekrai/4a3bd796a374fc6fd42f7359570372dd.js?file=script.js"></script>

#### 2. Create style.css

Finally, we want to create our `style.css` file. Just copy this entire block into the file.

<script src="https://gist.github.com/freekrai/4a3bd796a374fc6fd42f7359570372dd.js?file=style.css"></script>

#### 4. Git it Going

Once you've created your files, you want to put them on your repo, you can either create them directly from the github.com interface, or you can create them locally and commit them.

If you want to add this to a specific domain, then create a file called `CNAME` and store your domain or subdomain in there.

Finally, create a file called `.nojekyll` which tells Github Pages that this is a strictly static site.

To customize Github Issues, we set up labels to identify issues:

- `operational` means all systems good.
- `investigating` means under investigation.
- `outage` to identify an outage.
- `degraded` to identify an issue causing degraded performance.

On top of that, you can add labels that start with `system:` and they will show what system the issue is related to. For example `system:blog` would show an issue with our blog.

Labeling an issue with any of these tags will reflect on the status page.

---

This status page works pretty well, and was useful last week with the AWS outage that happened. It showed the status of our various services, and let us push updates via Github Issues that showed up below.

I do plan on making an update at some point to take into account comments inside issues.

This is a basic status page, but it helps show people what is happening with your sites, and keep everything nice and transparent.

![](http://i.giphy.com/a5ptfHj2GqOmk.gif)

_Originally posted on [Coded Geekery](http://codedgeekery.com/build-a-status-page-powered-by-github-and-uptime-robot/), my personal blog about finding a work-life balance_
