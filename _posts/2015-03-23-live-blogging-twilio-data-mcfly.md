---
layout: "post"
title: "Live Blogging with Twilio and Data McFly"
tags: 
- "code"
date: "2015-03-23 13:52:13"
ogtype: "article"
bodyclass: "post"
---

Live blogging is pretty handy, when attending events, it never hurts to be able to live blog about the latest new gadgets as they are announced.

We’re going to build a simple live blogging app using Node.js, Data McFly and Twilio.

This particular live blog solution is set up for one event, this means all posts to the phone number we specify will show up.

You could build on this to allow for multiple events, but that’s a little more than we want to dive into today.

### The setup

We’ll be using a few tools to build this app. You’ll want to have these set up before you continue on:

*   [Twilio](http://twilio.com): To send and receive SMS messages. Don’t have a Twilio account? [Sign up for Free](https://www.twilio.com/try-Twilio).
*   [Data McFly](https://www.datamcfly.com/): A real-time database API. We’ll be using it to store our incoming and outgoing messages.
*   [Node.js](http://nodejs.org/): A platform built on Chrome’s JavaScript runtime for easily building fast, scalable network applications.

If you haven't already, [Sign up](https://app.datamcfly.com/signup) for a free Data McFly account now, then create a new app. You'll use your app for your live blog app.

### Let’s get started.

We first need to set up our Node.js app.

Besides the Twilio and Data McFly modules, we’ll be using the [Express framework](http://expressjs.com/) to set up our node web server to receive the POST request from Twilio so we’ll need to install the express package. We’ll also be using the body-parser module so we are going to install that as well.

Let's create our `package.json` file:

```javascript
{
	"name": "live-blog",
	"version": "0.0.1",
	"description": "Live Blog App powered by Data McFly, Twilio and Node.js",
	"main": "app.js",
	"repository": "https://github.com/DataMcFly/live-blog",
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"keywords": [
		"Twilio",
		"data mcfly",
		"sms"
	],
	"author": "Roger Stringer",
	"license": "MIT",
	"dependencies": {
		"Twilio": "~1.6.0",
	    "ejs": "~0.8.5",
		"express": "~3.4.8",
		"datamcfly": "~1.4.4",
		"node-buzz": "~1.1.0",
		"moment": "~2.5.1",
		"less-middleware": "~0.2.1-beta",
		"body-parser" : "~1.4.2",
		"method-override" : "~2.0.2"	
	},
	"engines": {
		"node": "0.10.26"
	}
}

```

Save this file, and from the terminal run the following command:

```javascript
npm install
```

This will create a `node_modules` folder containing all of the modules we want to use.

The first file we want to create is `config.js`, this will hold our configuration information:

```javascript
module.exports = {
    // Twilio API keys
    Twilio: {
        sid: "ACCOUNTSID",
        token: "AUTHTOKEN",
        from_number: "YOUR-NUMBER"
	},
    datamcfly: {
		api_key: "YOUR-API-KEY",
		app_name: "YOUR-DATAMCFLY-APP"
    },
    un: 'admin',
    pw: 'password'
};
```

This file is for our configuration, we can access anything in here at anytime by referencing the file and calling the keys, for example, to get our Data McFly API Key, we would call:

```javascript
var config = require('./config');
console.log( config.datamcfly.api_key );
```

Replace `ACCOUNTSID`, `AUTHTOKEN` and `YOUR-NUMBER` with your Twilio credentials, and a phone number in your Twilio account that you'll be using.

Then, replace `YOUR-API-KEY`, and `YOUR-DATAMCFLY-APP`  with your Data McFly API Key to use. 

At the beginning of our `app.js` file we’ll need to require express and initialize it into a variable called app. We’re also going to use the [bodyParser middleware](https://github.com/expressjs/body-parser) to make it easy to use the data we’ll be getting in our POST request.

Create a new file called `app.js` and require the Twilio, express and datamcfly packages:

```javascript
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var config = require('./config');

var app = express();
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({	extended: true	}));
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
 
var port = process.env.PORT || 8080; // set our port

var Twilio = require('Twilio');
var client = Twilio(config.Twilio.sid, config.Twilio.token );

var datamcfly = require('datamcfly');
var postsRef = datamcfly.init(config.datamcfly.app_name, "posts", config.datamcfly.api_key);
```

Data McFly uses collections to organize data inside apps, so one app could have several collections. If you're familiar with relational databases, this is the equivalent of a table.

We'll be using one collection for our project, which we will call `posts`. 

Let's set up our folder structure, create a folder called `views`, this is where we will keep our frontend. 

Create a file called `index.ejs` in the `views` folder:

```javascript
<!doctype html>
<html>
<head>
	<link href='http://fonts.googleapis.com/css?family=Lato:400,300italic,400italic&subset=latin,latin-ext' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
	<script src="https://cdn.datamcfly.com/DataMcFly.js?latest=1"></script>
	<title>Live Blog, powered by Data McFly and Twilio</title>
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
			var postsRef = new DataMcFly("<%= apikey %>", "<%= appname %>", "posts");
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

This will listen for any new posts to our `posts` collection in our app and then output it on the screen as it happens.

### Setting Up Our Twilio Listener

Now, let's set up our Twilio listener.

Twilio uses [webhooks](https://en.wikipedia.org/wiki/Webhook) to let your server know when an incoming message or phone call comes into our app. We need to set up an endpoint that we can tell Twilio to use for the messaging webhook.

We’re going to add a route for `/message` that responds with some [TwiML](https://www.twilio.com/docs/api/twiml). TwiML is a basic set of instructions you can use to tell Twilio what to do when you receive an incoming call or SMS message. Our code will look like this:

```javascript
// backend routes =========================================================

//	listen for incoming sms messages
app.post('/message', function (request, response) {
	var d = new Date();
	var date = d.toLocaleString();
	
	var postBody = request.param('Body');
	
	var numMedia = parseInt( request.param('NumMedia') );
	
	if (numMedia > 0) {
		for (i = 0; i < numMedia; i++) {
			var mediaUrl = request.param('MediaUrl' + i);
			postBody += '<br /><img src="' + mediaUrl + '" />';
		}
	}

	postsRef.push({
		sid: request.param('MessageSid'),
		type:'text',
		tstamp: date,
		fromNumber:request.param('From'),
		textMessage:postBody,
		fromCity:request.param('FromCity'),
		fromState:request.param('FromState'),
		fromCountry:request.param('FromCountry')
	});

	var resp = new Twilio.TwimlResponse();
	resp.message('Post received');
	response.writeHead(200, {
		'Content-Type':'text/xml'
	});
	response.end(resp.toString());
});
```

This will store our message in our `posts` collection, it will check to see if there are any images attached to the message, and if there are, it will append them to the message body.

Finally, let’s set our server to listen on port `8080`, and tell it what to do when we view it from a browser:

```javascript
// frontend routes =========================================================

app.get('*', function(req, res) {
	res.render('index', {
		apikey:config.datamcfly.api_key,
		appname:config.datamcfly.app_name,
	});
}); 

var server = app.listen(port, function() {
	console.log('Listening on port %d', server.address().port);
});
```

You can then call `node app.js` from your terminal and it will load the app.

Now that we've built our server, we need to tell Twilio to use this messaging url as a our Message Request URL:

![](http://blog.datamcfly.com/images/posts/dashboard.png)

Send an SMS message to your Twilio number and you should get a response back. If you don’t, take a look at the [Twilio App Monitor](https://www.twilio.com/user/account/developer-tools/app-monitor) to help determine what went wrong.

### Finishing Up

We’ve now built a basic live blogging tool, nothing too fancy, but you can take it from here and build on it to make something more fancy.

Live blogging is handy for attending events, you could set it up to let attendees make live posts as they attend sessions, or live blog about the latest news at a press event.

We'll build on this later to include an Ionic app to handle the posts.

You can see the repo [here](https://github.com/DataMcFly/live-blog), if you want to just download a pre-built app yourself and try it out.