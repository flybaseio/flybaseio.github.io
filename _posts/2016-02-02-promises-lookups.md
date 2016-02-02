---
layout: post 
published: true 
title: "Promises and Joins and Tigers and Bears" 
date: 2016-02-02T06:45:56.257Z 
tags: 
- "code"
ogtype: article 
bodyclass: post 
---

Promises are a nice alternative to callbacks. They improve readability, simplify error handling, and decouple tasks into composable units. A Promise is a task that may not have finished yet. When a Promise’s task finishes successfully the Promise is `resolved`, otherwise it is `rejected`. You interact with a Promise by calling its `then` method with callbacks that should be executed when the Promise is fulfilled or rejected.

Promises are entirely optional, but handy when you want to break out of what is commonly called `callback hell`.

Here's how you would normally make a call without promises:

```javascript
messagesRef.once('value', function (data) {
	console.log( "we found " + data.count() + " records");
	data.forEach( function(message){					
		displayChatMessage(message.value() );
	});
});
```

And here is the same call with promises:

```javascript
messagesRef.once('value').then( function (data) {
	console.log( "we found " + data.count() + " records");
	data.forEach( function(message){					
		displayChatMessage(message.value() );
	});
});
```

The look pretty similar so far don't they? Used in this particular use case, there's not a lot of difference between callbacks and promises.

### So what's the advantage of promises over callbacks?

Promises shine when the `then` method returns a new Promise and that Promise’s return value comes from the functions passed to `then`.

Here is an example function from an upcoming call center tutorial we're posting later this week:

```javascript
function getlongestidle( ){
	return agentsRef.where({"status": "Ready"}).orderBy( {"readytime":-1} ).on('value').then(function( data ){
			var agent = data.first().value();
			return agent.client;
	});
}
```

No callbacks needed, we would call `var agent = getlongestidle()` and it would return the agent's name.

### What about errors?

I know, promises look handy but how do you handle errors?

Let's look at the `getlongestidle()` function above with error handling included:

```javascript
function getlongestidle( ){
	return agentsRef.where({"status": "Ready"}).orderBy( {"readytime":-1} ).on('value').then(function( data ){
		var agent = data.first().value();
		return agent.client;
	},function(){
		// no agent was "Ready", let's return false
		return false;
	});
}
```

See how we used a second `function()`? This tells the `then` what to do if no data was found in the query, and then lets you trigger an appropriate action.

Here's an example we use on the [flybase blog](http://blog.flybase.io/) for tracking most popular posts:

```javascript
function updatePage(url, title){
	var key = url.replace(/[\/-]/g,'');
	var _this = this;
	var cnt = 0;
	flybaseRef.where({"key": key}).orderBy( {"views":-1} ).on('value').then( function( data ){
		var item = data.first().value();
		item.views = item.views + 1;
		flybaseRef.update(item._id,item, function(resp) {
			console.log( key + " updated" );
		});
	},function(){
		// no count, so never added before..
		flybaseRef.push({
			"key": key,
			"url": url,
			"title": title,
			"views": 1
		}, function(resp) {
			console.log( "URL added" );
		});
	});
```
	
In this sample, if we return a match, then we update it with a new view count incremented by 1.
	
If no match was found, then we push a new document with a view count of 1.
	
This is handy for checking if records exist or not and performing actions needed.

### What isn't covered by promises?

Currently `set`, `push`, `once`, `update`, and all other functions can return promises or callbacks. `on("value")` also works with promises or callbacks.

If you are using `on` to listen for `added`, `changed`, `removed`, `online` or custom events, then these will work as callback only. The reason for this is these are listeners that run in the background of your app and using `then` would end the listening.

You can use `once` to listen for any event as that is a one-time event listener.

We're excited about introducing promises to Flybase, and see them as a big feature that will help you build your apps even more :)

### Oh wait, there was something else...

There was another new feature... What was it again?

Oh right, you can now join collections together in a single query!

We've also released a new `lookup` method in the Flybase library that lets you run a query across multiple collections and return a record that returns results from multiple collections.

For example, let's say we were building a chat system, and that chat system was set up so that chat messages were stored inside the `messages` collection and user info was stored inside the `users` collection, we'd want to display who posted what right?

```javascript
messagesRef.on('value').then(function(data){
	data.forEach( function( row ){
		var row = row.value();
		get_user_info( row._id, function( data ){
			console.log( data.name + ": + data.message;
		});
	});
}
function get_user_info( userId, cb ){
	messagesRef.lookup(
		userId,
		[
			'chat.userId',
			'users._id'
		],
		function (jdata ){
			cb( jdata );
		});
}
```

This would perform an initial query on the chat page

When using the `lookup` function, we pass the value to join data on, an array of collections with the field to join by and a callback or promise to handle the data.

The `lookup` function will return an object of data rather than the usual Flybase object, this is so you can display data faster and also because it's returned as a single row and is meant to be read-only.

`lookup` was set up to make it handy for assembling data to display across multiple collections quickly and easily.

These new tools are available in both the javascript client and the node.js client right now.