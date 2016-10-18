---
layout: post 
published: true 
title: "Is MVC dead for the frontend?" 
date: 2016-10-18T14:31:48.428Z 
link: https://medium.com/@alexnm/is-mvc-dead-for-the-frontend-35b4d1fe39ec#.8grf9o81p 
tags:
  - links
ogtype: article 
bodyclass: post 
---

> As more and more frontend developers adopt [unidirectional architectures](http://staltz.com/unidirectional-user-interface-architectures.html), one can only ask if there is any future for the classic MVC approach.
> 
> In order to understand how we got to this point, let’s analyse a bit the evolution of the frontend architecture.
> 
> Over the past four years I saw a great deal of web projects and spent a good period of time architecting the frontend or integrating some framework for it.
> 
> Before 2010, **JavaScript** — that programming language _jQuery_ was written in — was used mostly for DOM manipulations and adding that extra touch to a traditional web application. People did not care much about the architecture and things like [revealing module pattern](https://toddmotto.com/mastering-the-module-pattern/#revealing-module-pattern) were good enough to structure our codebase.
> 
> The whole discussion on frontend vs backend architecture virtually appeared with the rise of the _single page application_ concept (late 2010) and with the increasing popularity of frameworks like [backbone](http://backbonejs.org/) and [knockout](http://knockoutjs.com/).
> 
> As this was a novelty at that time, the designers of those frameworks had to look somewhere else for inspiration, so they borrowed from the practices that were already well established for server side architecture. And by then, all popular server side frameworks had some sort of implementation of the classic [MVC (Model — View — Controller)](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller), also known as MV* [because of the different variations](https://www.quora.com/What-are-the-main-differences-between-MVC-MVP-and-MVVM-design-patterns-for-the-JavaScript-developer).
> 
> When [**React.js**](https://facebook.github.io/react/) was first introduced as a [rendering library](http://stackoverflow.com/questions/148747/what-is-the-difference-between-a-framework-and-a-library#answer-148788), it was [mocked by many](https://www.youtube.com/watch?v=x7cQ3mrcKaY) because of the apparently counter intuitive way of dealing with HTML in JavaScript. But people overlooked the most important contribution which React brought on the table — **Component Based Architecture**.
> 
> React did not invent components, but it took the idea one step further.
> 
> This major breakthrough in architecture was overlooked even by Facebook, when they advertised React as the “V in the MVC”. As a side note, I still have nightmares after reviewing a codebase which had both [Angular 1.x and React working together](https://github.com/ngReact/ngReact).
> 
> However, 2015 brought us a major shift of mindset, from the classic **MVC** we were all used to, to the **Unidirectional Architectures and Data Flows** derived from Flux and Functional Reactive Programming, with tools like [Redux](https://github.com/reactjs/redux) or [RxJS](https://github.com/Reactive-Extensions/RxJS).

Frontend development is ever changing, and even more so over the past year or so.
