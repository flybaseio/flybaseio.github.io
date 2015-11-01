---
layout: "post"
title: "Getting Real"
date: "2014-10-27 17:50"
tags: 
- "inside"
ogtype: "article"
bodyclass: "post"
---

When we decided to add a push notification system as a service to our system, we looked into types to offer.

We decided that the easiest system for the sake of browser support was to integrate [Socket.IO](http://socket.io) as our web socket system of choice.

This lets us support web sockets, and if needed also lets us fallback on multiple other methods, such as Adobe Flash sockets, JSONP polling, and AJAX long
polling, while providing the same interface. Although it can be used as simply a wrapper for WebSocket, it provides many more features, including
broadcasting to multiple sockets, storing data associated with each client, and asynchronous I/O.

This works well for you, our future users, as it helps you build your applications quickly and enable real-time communications as part of it.