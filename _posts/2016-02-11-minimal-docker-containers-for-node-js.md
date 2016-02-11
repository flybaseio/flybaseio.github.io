---
layout: post 
published: false 
title: "Minimal Docker Containers for Node.js" 
date: 2016-02-11T19:51:59.751Z 
link: https://blog.risingstack.com/minimal-docker-containers-for-node-js/ 
tags:
  - links
ogtype: article 
bodyclass: post 
---

> As some of the most innovative companies like Oculus and Gilt Groupe jump into [Docker containers](https://blog.risingstack.com/shipping-node-js-applications-with-docker-and-codeship/), more and more base images appear on [Docker Hub](http://hub.docker.com/) that can be used to containerize your applications. With this said most of these Docker images have one or more of the following issues:
> 
> - big in size
> - strange / non-existent versioning
> - mutable tags
> - unmaintained
> 
> We are happy to release our [Alpine-based Node.js Docker images](https://hub.docker.com/r/risingstack/alpine/tags/) that tries to solve those pain points. In this article, you will learn about why we went with Alpine, how we version our images and how you can start building applications using them today.

We're big fans of [Docker](http://blog.flybase.io/2015/12/10/docker-intro-for-node-developers/) here at Flybase and Rising Stack's new minimal docker container has a nice small footprint, which should be nice for quick node.js development in Docker.
