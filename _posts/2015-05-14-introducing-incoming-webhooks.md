---
layout: "post"
title: "Introducing Incoming Webhooks"
tags: 
- "inside"
date: "2015-05-14 14:00:00"
ogtype: "article"
bodyclass: "post"
---

Getting your data into your Data McFly apps is important, and we're happy to provide multiple channels to do this.

Today, we're pleased to introduce a new channel: **Incoming Webhooks**!

You can use webhooks to handle events such as calls or messages from Twilio, all you have to do is go the `Your Webhooks` link in the top right menu of your dashboard, and create a new webhook that generates a unique incoming URL.

When you create a webhook, you can specify which *collection* inside which *app* to store data.

We've also given you three options for handling incoming data:

1. Save All `POST`ed data
2. Send a JSON string as the `payload` parameter in a POST request
3. Send a JSON string as the body of a `POST` request

The reason we've done this is to allow you to create more flexible webhooks that let you then store data from more sources.

We'll be releasing outgoing webhooks shortly as well, so stay tuned for that! :)