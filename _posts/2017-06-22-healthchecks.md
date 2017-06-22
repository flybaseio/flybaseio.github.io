---
layout: post
published: true
title: "Healthchecks and Heartbearts "
date: 2017-06-22T18:25:06.463Z
tags:
  - code
ogtype: article
bodyclass: post
---

Most web apps set up a [healthcheck](https://github.com/freekrai/healthcheck), it's usually an endpoint that tells you that your databases are up, and websites are up.

I've even got a [repo](https://github.com/freekrai/healthcheck) ready to go that I install on servers and enable quickly, based on another middleware healthcheck but with a few changes to make it easier to use, and with endpoints already in place for mongodb, redis and elasticsearch if needed.

_We use healthchecks heavily here at Flybase to monitor all our services and let us know in case of any issues._

These work great, if one thing goes down then your monitor will alert you.

But what about all those third party APIs your app uses?

Or if you use a microservice architecture, how do you ensure everything continues working as expected?

This is where heartbeats come into play, and are a slightly different take on healthchecks.

For example, let's look at an e-commerce site that sells spoons:

1. User picks an item to purchase
2. Item goes to cart
3. User logs in (or signs up) and pays for item
4. System registers purchase, and signals warehouse and shipping company about shipment
5. Shipment gets picked up
6. Users gets his new spoon.

So there are several APIs involved here, we have the payment processor (maybe Stripe), we have the shipping processor, we also have internal APIs such as user management, inventory control,   order management and notifications.

In this scenario, let's say the shipping processor never gets notified? or the inventory control doesn't adapt the numbers and we end up showing more in stock than there actually is?

**Nobody likes ordering a sold out item thinking they'll have it in a week, and actually waiting a month or two.**

_Or worse, ordering an item and the shipping system never gets the pick up request._

So we set up a heartbeat. Which is a simulated order that is run every so many hours.

In this case, we can create a special item that never gets seen anywhere else, and a user account that is called `heartbeat`.

Then you would have your `heartbeat` user walk through the order system using automated scripts and if any errors occur, for example an email never arrives in the `heartbeat` box, or the order page never shows sucessful order.

You could add some extra checks to make sure the db updates and check responses back from the various end points, heartbeats are allowed to be slower than the actual order process as they are checking everything involved, but the end result...

You get a snapshot of your system every so many hours and can get a heads up in cases of any issues.

Also, most important, perform clean ups once done, this is also why you should use a dedicated user (or even users).

#### The End?

This wasn't a code heavy post, I shared a repo I use on several projects for healthchecks and mostly explained ways to do a heartbeat.

It's hard to code a demo heartbeat as the code is so different based on projects.

So all I can recommend in building a heartbeat is monitoring every step you can. It's the heartbeat of your app and an unhealthy heartbeat is very dangerous.

_This post was originally published on [Coded Geekery](https://codedgeekery.com/healthchecks-and-heartbeats/), my blog on various topics from cooking to work life balance._
