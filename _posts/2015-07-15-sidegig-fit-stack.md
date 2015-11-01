---
layout: "post"
title: "SideGig.me - Cloning TaskRabbit with Flybase and Angular.js"
tags: 
- "code"
date: "2015-07-15 09:14:40"
image: "http://blog.flybase.io/images/posts/sidegig.png"
ogtype: "article"
bodyclass: "post"
---

<div class="box-wrap"><div class="box">
	<img src="/images/posts/sidegig.png" />
</div></div>

Here at Flybase, we've actually built a small development stack we use when we're developing apps, we call it the [FIT Stack](https://github.com/flybaseio/fit-stack/blob/master/README.md), and it stands for:

- Flybase for the backend
- Interface for the frontend, in our case, usually Angular.js
- Thin servers when needed, usually built with Node.js

We use this stack so much we've even set up two branches that we use to build our apps off of:

1. [Full Stack](https://github.com/flybaseio/fit-stack/tree/full-stack) branch with a small Node.js backend for handling server-side tasks and
2. [Client-side only](https://github.com/flybaseio/fit-stack/tree/client-side) branch which we can use for building quick apps such as SideGig and hosting on services such as Github Pages.

Using the FIT Stack, we decided last week to see how fast we could build a small clone of TaskRabbit, in this case, it lets you sign up, sign in, change your password, post and edit tasks, comment on tasks and place bids to do a task.

You can easily take this and build on it to use Stripe.com for payments, or to also allow people to post services, but this is just version 1. :)

And it's using absolutely no backend code! The entire site is hosted on Github Pages and was built in less than a day.

You can check it out here at [SideGig.Me](http://sidegig.me/), and you can view the repo [here](https://github.com/DataMcFly/sidegig). Play with the test site, download the repo, see how easy it was to build what we've built.

One thing we did do here that could have been built in Node via the _Thin servers_ part was we decided to make use of our Zapier channel to handle emails.

When a task runner's bid is accepted, we store the message in a collection called `notifications`, which we then tell our Zapier.com zap to listen for new records being added to and then use mandril to send the email. I guess in this case, Zapier became the thing server.

On thing to note, our Zapier channel is currently [Invite-only](https://zapier.com/developer/invite/16474/c7e21a32efea8e57a70936b738918438/) until it's released globally, but you can use this link to request an invite and we'll get you set up. :)