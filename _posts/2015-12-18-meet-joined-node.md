---
layout: post 
published: false 
title: "Meet Joined Node: Your microservices platform" 
date: 2015-12-15T11:47:32.377Z 
tags:
  - code
ogtype: article 
bodyclass: post 
---

**Interesting fact!** Did you know the average smartphone today has more computing power than all of NASA had when people first landed on the Moon. Today, there are fewer and fewer functional areas that cannot be satisfied with the client's computing power alone and require backend computing capacity.

---

Here at Flybase, we are **huge** fans of building `static` websites. The power of a `client-side` site using Javascript is huge, and Flybase helps make that even more powerful.

I mean, just look at what you can do these days using frameworks such as Angular.js, Backbone, React, Ember or just plain vanilla Javascript and HTML. Thanks to [Flybase](http://flybase.io) and other tools, you can write to databases, read from databases, handle authentication, everything you need right from the client-side in real-time...

**But, there is a limitation...**

How do you send email? Or send an SMS message? or handle webhooks from Stripe payments or other services?

Normally, you would set up your servers, build your backend apps to handle one or two processes and then deploy it to servers.

**But hold on!** You only needed your backend script to handle one or two things right? The site itself can sit anywhere since it's just HTML with javascript (Github Pages, or Amazon S3 for example), so why build an entire Node.js service and deploy servers to handle those simple recipes?

What if we could set up a quick Node.js snippet of code that can be called when needed via an HTTP call for sending an SMS message or email or recording a payment received from Stripe?

Yes, one alternative is to go with a webhook service like [Zapier](http://zapier.com), we even have a Flybase channel for it and it works great, but sometimes you want a *little* more control.

Well, today, we're introducing you to a brand new solution for that...

### Meet Joined Node.

Let's use Joined Node to create a quick script to say hello:

1) Sign up at [Joined Node](https://app.joinednode.com)

2) Create a new `Recipe`

3) Copy the following code into the recipe:

```javascript
module.exports = function(context, callback) { 
	callback(null, {message: "Hello " + context.data.who + '!' }); 
}
```

4) Hit `save`

This will create a unique URL, which is based on your unique container and recipe, so you would see a URL similar to this:

```javascript
https://api.joinednode.com/run/black-surf-17638/polished-firefly-55389
```

Then, you would call it with: `https://api.joinednode.com/run/black-surf-17638/polished-firefly-55389?who=me` via curl, or from a web request, which would return a JSON result with message that says hello to the name you passed as who.

---

[Joined Node](https://joinednode.com) is a simple, lightweight, and secure way of running isolated microservice backend code that removes or reduces the need for a dedicated backend.

At the heart of [Joined Node](https://joinednode.com) is what we call **Recipes**,  a **Recipe** is a snippet of code that can be called using a simple HTTP request, either directly in a browser, or from inside your code, regardless of language or platform. 

These Recipes can be very simple, or they can be extended as much as you wish, depending on what you want them to do.

We created Joined Node with the purpose of throwing monolithic systems out the door, to give you a new way to build your apps rapidly, quickly and smoothly.

We've actually been using Joined Node internally for a while at Flybase, it's actually a key element of our real-time app backend platform, and we're now making it publicly available. Joined Node Node.js recipes work well with your Flybase-powered apps, but you can also integrate other services as well.

With Joined Node, all you need to run code is an HTTP call, that’s it, no provisioning. no deployment. Just login to your dashboard, create a new Recipe and add your code:

```javascript
module.exports = function (callback) {
  callback(null, 'hello world!');
}
```

Then you just make an HTTP call, either from your app, as a webhook service from another provider (like Slack, Github, Twilio, Stripe, etc) or even from a browser:

```javascript
your-machine:~ curl https://api.joinednode.com/run/joined-container-52/hello
```

And then end result is a message:

```javascript
HTTP status: 200
"hello world!"
```

With Joined Node as your microservices provider and Flybase as your real-time backend, you have a winning combination that can’t be beat. 
Integrate Joined Node into your static apps, Ionic apps, or any app since all you need is a single HTTP request.
