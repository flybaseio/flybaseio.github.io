---
layout: post 
published: true 
title: "Balance Driven Development" 
date: 2016-05-25T15:39:06.351Z 
link: https://m.signalvnoise.com/balance-driven-development-a06f4c972970#.mg45pgmna 
tags:
  - links
ogtype: article 
bodyclass: post 
---

> I mentioned in my [last post](https://m.signalvnoise.com/failure-as-progress-2596a1bb067) that I would talk about my opinions on TDD, so here it is. Kicking it off, I will explain what TDD is, how it’s meant to work. Then I’ll explain what some people have said about it and talk about what I believe the real benefits of TDD are. Finally, I’ll walk through whether I think it’s worth using and explain my use of the practice. Oh, and I’ll also provide a disclaimer as to what the heck possessed me to pile onto this already well-discussed topic.
> 
> TDD stands for “Test Driven Development.” At its core, it’s a development practice; a way to approach writing code. The rules of how to practice TDD are fairly simple at their surface. Say you have a new function that you need in order to accomplish a task: write the smallest test you can imagine, run the test, watch it respond with a failure, write the smallest possible amount of code to make that test pass, repeat until the necessary functionality is complete. 
> 
> With that process there are a number of benefits that people reference.
> 
> The main benefit I see TDD-promoters reference is test coverage. Since, with TDD, testing is part of how you write code, you just get more tests that are very well tied to the logic inside your functions. That test coverage paired with ongoing use of the practice tends to make new development less frightening because you have pretty high confidence that your code is covered and will alert you to unexpected behavior changes.
> 
> One counter-argument to the test coverage benefit is that the immense depth at which you’re covering your code in this type of practice results in brittle tests. Growing the test code at a rate faster than your app code can increasingly make it difficult to make changes to your app without spending many more hours rejiggering your tests. So, while you maybe have higher confidence in your app at one point, by the time you’ve redone much of your testing, due to feature additions, you’re in kind of a `¯\_(ツ)_/¯` state. So much so that by the time you’re done getting the tests green, you can’t tell if you’ve fixed the tests properly or if you just made them look green.
> 
> As Software Engineers we like to find processes and tools that allow us to remove blame and responsibility from the human. We want the computer and process to protect us and keep us in a safe zone. I think both of the above arguments are trying to achieve that same end of some kind of safe zone. TDD, in terms of the testing benefit that’s often referenced, would like to keep us in a zone of constant “yes it works.” The anti-TDD position explains a world where the process potentially slows down our ability to progress and potentially hurts our confidence in new functionality due to lots of changing tests.
> 
> One of the tricks with the name TDD is that it implies that tests are the benefit, when in fact they’re simply a vehicle for development. I actually liken tests from the TDD process to CO2 — they’re there to move things forward and useful for that but otherwise need to be cleaned up after their purpose has been served. That is to say that a lot of tests I write during a TDD exercise are meant to be deleted at the end. I tend to use those TDD tests to help write new tests that are intended to live on with the app for regression and documentation. They often even look very similar, but now I’m writing tests to lasts rather than tests drive development. 
> 
> These are fundamentally different mindsets.

Jon makes some great points about TDD and how it helps build a balance. We follow a balanced routine for all our development here at Flybase so that you're never in a `¯\_(ツ)_/¯` state as John puts it.
