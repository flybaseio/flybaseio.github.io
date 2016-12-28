---
layout: "post"
title: "5 Questions Every Unit Test Must Answer"
date: "2015-08-31 07:00"
tags: 
- "links"
- "code"
link: "https://medium.com/javascript-scene/what-every-unit-test-needs-f6cd34d9836d"
image: "http://blog.flybase.io/images/posts/unit.jpg"
ogtype: "article"
bodyclass: "post"
---

<div><div class="image splash">
	<img src="/images/posts/unit.jpg" />
</div></div>

Eric Elliott: 

> Most Developers Don’t Know How to Test
> 
> Every developer knows we should write unit tests in order to prevent defects from being deployed to production.
> 
> What most developers don’t know are the essential ingredients of every unit test. I can’t begin to count the number of times I’ve seen a unit test fail, only to investigate and discover that I have absolutely no idea what feature the developer was trying to test, let alone how it went wrong or why it matters.
> 
> In a recent project of mine, we let a gigantic swath of unit tests enter the test suite with absolutely no description whatsoever of the test’s purpose. We have a great team, so I let my guard down. The result? We still have a ton of unit tests that only the author can really make sense of.
> 
> Luckily, we’re completely redesigning the API, and we’re going to throw the entire suite away and start from scratch — otherwise, this would be priority #1 on my fix list.
> 
> Don’t let this happen to you.

We do a lot of test driven development here at Flybase, it's part of our Continuous integration process and nothing gets deployed to our servers without being tested heavily. 

But our testing and CI process comes from years of development, and I've seen my share of bad tests, which was why I wanted to share this post when I came across it.