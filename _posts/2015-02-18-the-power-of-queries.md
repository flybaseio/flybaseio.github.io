---
layout: "post"
title: "The Power Of Queries"
date: "2015-02-18 09:30:00"
tags: 
- "inside"
- "code"
ogtype: "article"
bodyclass: "post"
---

One of the many features we're pleased with in the Data McFly API is the power to query your data.

Rather than simply retrieving your data, we built a powerful query engine that lets you perform queries, and tailor what you display to your users.

For example, if you were building a blog engine, and you wanted to display all posts that had `likes` of 10 or more, then you could perform this query:

```javascript
datamcfly.where( { "likes": { "$gt": 10 } } ).on('value', function(data){
	if( data.count() ){
		data.forEach( function( snapshot ){
			console.log( snapshot.value() );
		});
	}
});
```

Or, if you wanted to get more advanced and create a query to look for all posts with `likes` of 10 or more, and tagged with the tag of `tech`, you could write this type of query using the `$and` operator:


```javascript
datamcfly.where( { "$and": [ {"tags": "tech" }, {"likes": { "$gte": 10 } } ] } ).on('value', function(data){
	if( data.count() ){
		data.forEach( function( snapshot ){
			console.log( snapshot.value() );
		});
	}
});
```

This helps give you more control over your data, you could then combine this with using `orderBy` and `limit` to return the 5 most popular posts in the `tech` category and that have likes greater than 10:

```javascript
datamcfly.where( { "$and": [ {"tags": "tech" }, {"likes": { "$gte": 10 } } ] } ).orderBy( { "likes": -1 } ).limit(5).on('value', function(data){
	if( data.count() ){
		data.forEach( function( snapshot ){
			console.log( snapshot.value() );
		});
	}
});
```

This tells our API to return all posts that are tagged in `tech`, and have likes greater than 10, and then the `orderBy` function instructs our API to sort data on the `likes` field in `Descending` order. Sorting is controlled by `1` for `Ascending` or `-1` for `Descending`. Finally, we've told the API to `limit` our query to the first 5 posts.

So far, we've shown you how to perform queries using the Javascript helper library, maybe you're wondering how queries work via the REST API rather than using a helper library?

It's not actually that different:

```javascript
curl -H "X-DataMcFly-API-Key: 74c8062f-cd6f-4c07-8baf-b1h241446dec"  
	https://api.datamcfly.com/apps/blog/collections/posts?q={ "$and": [ {"tags": "tech" }, {"likes": { "$gte": 10 } } ] }&s={ "likes":-1 }&l=5
```

You can also perform queries based on the `$or` operator, for example to return all posts that are tagged as either `tech` or `news`, you could perform this query:

```javascript
datamcfly.where( { "$or": [ {"tags": "tech" }, {"tags": "news" } ] } ).on('value', function(data){
	if( data.count() ){
		data.forEach( function( snapshot ){
			console.log( snapshot.value() );
		});
	}
});
```

One other type of query, is to query for matches. For example, if you wanted all posts that have "realtime" in the name, you could do this query:

```javascript
datamcfly.where( { "name": { "$regex": "realtime" } } ).on('value', function(data){
	if( data.count() ){
		data.forEach( function( snapshot ){
			console.log( snapshot.value() );
		});
	}else{
		console.log("No matches found");
	}
});
```

Using the `$regex` operator, tells the system to search the field `name` for any matches to the `realtime` we've passed.

One other feature I wanted to mention is performing `$in` queries, using the `$in` operator, tells the API to return  documents where the value of a field equals any value in the specified array. 

For example, revisiting our earlier `$or` query, let's rewrite it to use `$in` instead:

```javascript
datamcfly.where( { "tags": { "$in": ["tech","news"] } } ).on('value', function(data){
	if( data.count() ){
		data.forEach( function( snapshot ){
			console.log( snapshot.value() );
		});
	}
});
```

This works the same as our earlier `$or` query, it returns only posts that are tagged as `tech` or `news`.

---

For a brief example of how you can use queries in real life, let's take a look at my [personal blog](http://rogerstringer.com), this blog runs using the same engine as the [Data McFly Blog](http://blog.datamcfly.com), which is a static blog engine. 

One of the features on my blog is a `most popular posts` section in the footer, it actually gets used quite a lot, and since this was a static blog, I had to think of the best ways to accomplish this feat.

Enter Data McFly and our real-time code. :)

I quickly built the following javascript to store when a post is viewed:

```javascript
var url = document.location.pathname;
var title = document.getElementsByTagName("title")[0].innerHTML;
//	get current count and increment it...
var cnt = 0;
var _this = this;
this.datamcflyRef.where( { "url": url } ).on('value',function( data ){
	if( data.count() ){
		data.forEach( function(snapshot) {
			var item = snapshot.value();
			item.views = item.views + 1;
			_this.datamcflyRef.update(item._id,item, function(resp) {
				console.log( "URL updated" );
			});
		});			
	}else{
		_this.datamcflyRef.push({
			url:url,
			title:title,
			views:1	
		}, function(resp) {
			console.log( "URL added" );
		});
	}
});
```

This code will grab the current page url, and the page title, then perform a query to see if the post has been stored already.

If it has, then it increments the number of page views by 1, otherwise it will create a new record.

Finally, when the page is loaded, I wanted to display the 5 most popular posts:

```javascript
$("#mostpopular").html("");	
this.datamcflyRef.orderBy( { "views": -1 } ).limit(5).on('value',function( data ){
	if( data.count() ){
		var pages = [];
		data.forEach( function(snapshot) {
			var item = snapshot.value();
			$('<li/>')
				.attr("id",item._id)
				.prepend(
					$("<a>").attr("href",item.url)						
					.text(item.title)
				).appendTo( $("#mostpopular") );
		});
	}
});
```

This retrieves the 5 most popular pages, orders them by page views and then displays them on the page as an unordered list.

In this case, the queries are used for checking to see if a post already exists in the system. Later we perform a query to retrieve the 5 most popular posts.

---

We've put a lot of thought into our query engine, with the idea of making things easier over all for you, our users.

Queries can be as basic or as advanced as they need to be.

Since the Data McFly site itself uses our API to run, we make use of the query engine every day which helps us find new ways to improve it.