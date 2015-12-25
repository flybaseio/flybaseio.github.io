---
layout: post 
published: false 
title: "Build a Plug and Play Live Blogging System with Twilio, Flybase and Joined Node" 
date: 2015-12-15T14:47:32.377Z 
tags:
  - code
ogtype: article 
bodyclass: post 
---

We built a [live blogging app](http://blog.flybase.io/2015/03/23/live-blogging-twilio-data-mcfly/) a few months ago, and it's been used by several projects, but with the launch of our sister service [Joined Node](http://joinednode.com) today, we wanted to rewrite our live blogging app to be even easier to integrate into existing sites.

To do this, we are going to build a _Plug and Play_ live blogging widget that can be added to any website, and then use Joined Node to receive incoming SMS messages from Twilio and save them in our Flybase app.

#### Wait a second, what is Joined Node?

Glad you asked :) Joined Node is a new sister service we've created to give you an easier way to build your apps. 

Currently, thanks to Flybase and static web hosts, we can do almost everything in the browser on the client side. There's only one thing we can't do, and that's talk to other services like Twilio without a backend system to intervene. 

Yes, we can use services like [Zapier](http://zapier.com) for this, and that works fine, but Joined Node gives us better control by writing Recipes, a Recipe is a snippet of code that can be called using a simple HTTP request, either directly in a browser or anywhere else. These Recipes can be very simple, or they can be extended as much as you wish.  Recipes are written in Node.js, and can be extended using npm modules quickly.

These Recipes are considered `microservices`, singular URLs that do _one_ purpose and _only one purpose_.

In our case, we are going to write one recipe, which will receive incoming SMS messages, save the message into Flybase and then send a reply back..

Ok, enough of that, let's get to work building our new Live blogging app.

---

#### The Mixing Pot

To get started, you'll need:

1. A [Flybase](https://app.flybase.io/signup) account to store our incoming and outgoing messages and display them in real-time.
2. A [Twilio](http://twilio.com) account to handle the actual phone work
3. A [Joined Node](https://joinednode.com) account, to create your _Recipes_ for sending and receiving SMS messages.

Go ahead and create these now if you haven't already.

#### Getting Started

First, let's build our widget to display posts as they come in:

```javascript
<!doctype html>
<html>
<head>
	<link href='http://fonts.googleapis.com/css?family=Lato:400,300italic,400italic&subset=latin,latin-ext' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
	<script src="https://cdn.flybase.io/flybase.js?latest=1"></script>
	<title>Live Blog, powered by Flybase, Twilio and Joined Node</title>
</head>
<body>
	<div class='container'>
		<div class="row">
			<div class="col-md-4">
				<div id="postsDiv"></div>
			</div>
	</div>
	<script>
		$(function(){
			var postsRef = new Flybase("<%= apikey %>", "<%= appname %>", "posts");
			postsRef.once('value', function (data) {
				console.log( "we found " + data.count() + " posts");
				data.forEach( function(post){				   
					displayPost(post.value() );
				});
			});

			postsRef.on('added', function (data) {
				var post = data.value();
				displayPost(post);
			});

			function displayPost(post) {
				$('<div/>')
					.attr("id",post._id)
					.text(post.textMessage)
					.appendTo( $('#postsDiv') );
				$('#postsDiv')[0].scrollTop = $('#postsDiv')[0].scrollHeight;
			}		   
		});
	</script>
</body>
</html>
```

This may look like our previous widget, that's because this side of things are pretty straight forward.

Now we want to create our Recipe in our Joined Node account.

#### Create your Joined Node Recipe

Go to your Joined Node account and click `Create New Recipe`.

There are three types of [programming models](http://joinednode.com/docs/model) you can use for your recipes:

1. Callback only for returning a callback containing data
2. Context and Callback for passing variables into your recipe and return a callback containing data
3. Full HTTP control, which is the most flexible programming model allows you to take full control over the HTTP request and response.

For this recipe, we are going with the third model:

```javascript
var flybase = require('flybase');
var Twilio = require('Twilio');

module.exports = function (context, req, res) {
	var required_env_params = ['flybase_appname', 'flybase_apikey'];
	for (var p in required_env_params)
		if (!context.env[required_env_params[p]])
			return callback(new Error('The `' + required_env_params[p] + '` parameter must be provided in your env   settngs.'));

	var required_params = ['Body', 'From'];
	for (var p in required_params)
		if (!context.data[required_params[p]])
			return callback(new Error('The `' + required_params[p] + '` parameter must be provided.'));


	var postsRef = flybase.init(context.env.flybase_appname, "posts", context.env.flybase_apikey);

	var d = new Date();
	var date = d.toLocaleString();

	var postBody = context.data.Body;

	if( typeof context.data.NumMedia !== 'undefined' ){
		var numMedia = parseInt( context.data.NumMedia );
		
		if (numMedia > 0) {
			for (i = 0; i < numMedia; i++) {
				var mediaUrl = context.data.['MediaUrl' + i] );
				postBody += '<br /><img src="' + mediaUrl + '" />';
			}
		}
	}

	postsRef.push({
		sid: context.data.MessageSid,
		type:'text',
		tstamp: date,
		fromNumber:context.data.From,
		textMessage:postBody,
		fromCity:context.data.FromCity,
		fromState:context.data.FromState,
		fromCountry:context.data.FromCountry
	});

	var resp = new Twilio.TwimlResponse();
	resp.message('Post received');
	res.writeHead(200, {
		'Content-Type':'text/xml'
	});
	res.end( resp.toString() );
}
```

This recipe will read the incoming SMS message and store inside a flybase app, in a collection called `posts`. Collections are similar to tables in databases.

Any variables that passed as either `GET` or `POST` are made available via `context.data`.

Finally, you may notice we make a couple checks for `context.env` variables as well. These are `encrypted environment variables` which are stored securely and only decrypted during Recipe execution or when you are editing your recipe.

In the dashboard, when you enter a new Recipe, you will see a section for `encrypted environment variables`, create two new keys:

1. `flybase_appname` and save the name of your flybase app
2. `flybase_apikey` and enter your flybase api key

When you hit `Save`, you will get a unique URL like this:

```javascript
https://api.joinednode.com/run/my-container-id/my-recipe-slug-1234
```

Now that we've created our recipe, we need to tell Twilio to use this messaging url as our Message Request URL:

<img src="http://blog.datamcfly.com/images/posts/dashboard.png" alt="">

Send an SMS message to your Twilio number and you should get a response back. If you don’t, take a look at the <a href="https://www.twilio.com/user/account/developer-tools/app-monitor">Twilio App Monitor</a> to help determine what went wrong.

### Finishing Up

You've built your first app using Flybase, Joined Node and Twilio. You can now use what you've learned to build more advanced apps.

Some advantages to this style of microservices is that you don't need to worry about the backend of your apps as much, you can now host your live blogging widget anywhere you want: Github Pages, Amazon S3 or as part of another site and no more messy node.js setup needed.
