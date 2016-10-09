---
layout: post 
published: false 
title: "GraphQL: an opportunity for cross-vendor APIs" 
date: 2016-10-09T22:13:58.688Z 
link: https://medium.com/@gimenete/graphql-an-opportunity-for-cross-vendor-apis-c9dac846fa69#.de3taaer6 
tags:
  - links
ogtype: article 
bodyclass: post 
---

Alberto Gimeno

> I’ve been recently learning about GraphQL. I haven’t done anything serious yet with it but it’s already clear to me that it’s way superior than REST. Any GraphQL service implements a GraphQL spec that defines the available information and mutations in the service. The GraphQL engine ensures that the spec is implemented correctly for both the client and the backend.
> 
> There’s not a good way to write a spec of a REST service and there are no widely used tools to validate that both the client and the backend implement the spec. There are some initiatives but more focused on generating documentation than on validating the implementation.
> 
> With a well defined spec you open the door for implementing tools based on it:
> 
>  - GraphiQL: An interactive query builder.
> - Documentation generator
> - Code generators: think about automatically generating SDKs for GraphQL APIs.
> 
> So with these capabilities I think. **Wouldn’t it be great to have GraphQL schemas implemented not only by one vendor/website, but having common GraphSQL schemas for specific things?**
> 
> **What if…**
> 
> - Amazon, Digital Ocean, Linode, etc. implemented a common GraphQL service for handling server instances.
> - Any social network implemented a GraphQL API for changing your avatar.
> - Any SaaS service implemented a GraphQL to download invoices.
> - GitHub, Bitbucket and others implemented a common GraphQL for the things they have in common.
> - Bot platforms (Telegram, Facebook, etc) implemented a common GraphQL API.
> - Payment gateways (Stripe, PayPal, Braintree) implemented a common GraphQL API.
Etc.

Alberto has some excellent points about GraphQL and many of them fall in line with our upcoming GraphQL API launch.

GraphQL isn't necessarily a replacement for REST APIs, but it can give all APIs a massive boost, and it's why we're as excited about GraphQL now as we were a year ago when we posted our first GraphQL sample app.