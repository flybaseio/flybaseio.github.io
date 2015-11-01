---
layout: "post"
title: "Improving Angular.js web app performance"
date: "2015-03-02 07:45:00"
tags: 
- "links"
link: "http://bahmutov.calepin.co/improving-angular-web-app-performance-example.html"
image: "http://blog.datamcfly.com/images/posts/angular.jpg"
ogtype: "article"
bodyclass: "post"
---

<div class="box-wrap"><div class="box">
	<img src="http://blog.datamcfly.com/images/posts/angular.jpg" />
</div></div>


> Once your Angular application has the features you need, the next step is usually focused on improving its performance. Initial load time, responsiveness to user's commands - the application has to execute quickly in order to be useful. 
>
> There are general guides to improve an angular application's speed by order of 2 magnitudes. For example Scalyr blog post suggests the following:
>
> - Cache DOM elements
> - Use fewer watchers
> - Defer element creation
> - Skip watchers for hidden elements
> 
> I find these suggestions valid, but too difficult to implement right away. Instead I suggest the following steps to optimize Angular web app's performance.
> 
> - Profile individual actions
>   - Optimize obvious JavaScript (non-Angular code) bottlenecks
> - Measure and optimize the idle digest cycle
>   - Simplify watched expressions by removing filters
>   - Remove unnecessary watchers by replacing two- with one-way data binding
> - Analyze the model update / DOM repaint cycle to identify bottlenecks
>   - Large work can be split into batches
>   - Some work can be potentially moved to the web workers
> - Minimize garbage collection events
>   - Reuse memory instead of continuously allocating new space.

Some handy tips on improving performance with Angular.js web apps.