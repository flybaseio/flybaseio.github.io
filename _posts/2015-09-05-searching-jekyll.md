---
layout: "post"
title: "Adding Search to Jekyll on Github Pages"
date: "2015-09-05 14:00:00"
tags: 
- "code"
ogtype: "article"
bodyclass: "post"
---

We use [Camel](https://github.com/DataMcFly/camel) for this blog, but our [home page](http://flybase.io/) and [Developer Docs](http://docs.flybase.io/) are both written in Jekyll. Our home page is hosted on our Dokku server and our docs site is hosted on Github Pages.

One of the features we wanted to add to the docs site when we moved it away from the home page was search, which you could do from any page of the site.

Since Jekyll is static, and Github Pages limits the number of plugins you can install, we decided to build our own solution.

As it happens, we already a working solution in the form of our [Camel hunter plugin](https://github.com/DataMcFly/jquery.camelhunter), which uses [Lunr.js](http://lunrjs.com/) to search rss feeds so we just had to set it up to work with Jekyll.

First, we created a page called `sitemap.xml`:

<script src="https://gist.github.com/freekrai/33dd6579d4a6ec464caf.js"></script>

This will generate a list of published posts and pages that have either not been ignored or have a layout of `null`.

Now, open your default layout page `_layouts/default.html`, and add the following block of code to the bottom of the page:

```javascript
<script src="https://raw.githubusercontent.com/DataMcFly/jquery.camelhunter/master/jquery.camelhunter.min.js"></script>
<script type="text/javascript">
	$("#search-field").camelHunter({
		onKeyUp 			: true,
		rss: "/search.xml",
		results   : "#results"
	});
</script>
```

And add this block where ever you want your search form to display:

```javascript
<div class="container">
	<div class="well" id="searchbox">
		<input id="search-field" placeholder="Search the Site"/>
		<ul id="results"></ul>
	</div>
</div>
```

This will search your `search.xml` file and return results, I have it set to search as you type, but if you set the `onKeyUp` to `false`, then that will wait until you type enter.

You can change the `rss` file to which ever url you want to use, and it will perform searches based on that.

This can be handy on blogs using Jekyll, not just on our docs site, hence why I wanted to share how it works. Actually, this is handy for any static blog, you just need a rss feed that you can search results on.

One other thing, any page that is set to `sitemap: false` will get ignored from the `search.xml` file and so won't show up in searches, like wise any page that has a `layout: null`.