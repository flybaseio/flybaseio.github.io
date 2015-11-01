---
layout: "post"
title: "Are you an App or a Database?"
date: "2014-11-20 18:00"
tags: 
- "inside"
ogtype: "article"
bodyclass: "post"
---

As we get ready to launch, we recently ran into an interesting and slightly minor, but also slightly major choice...

Deciding whether our data containers were going to be called `Databases`, `Apps`, or whatever other name we could come up with. *We even considered calling them `Pods`, but don't tell anyone that.*

The decision was made to call our databases `Apps`, and we'll explain this choice below.

---

Technically, a Data McFly `App` is a realtime database, but it's more than just a database. Every App you create inside Data McFly has it's own database and its own RESTful API, as well as it's own authentication module.

Therefore, calling it an App was more fitting than simple calling it a Database.

Also, inside each `App`, you can have numerous `Collections`. Collections are App-wide namespaces and exist to help you organize your application's data. 

Finally, all data is stored as JSON data inside a collection.

I trust this choice of names works for everyone, and we are available if you have any questions as we near our final steps towards public launch.