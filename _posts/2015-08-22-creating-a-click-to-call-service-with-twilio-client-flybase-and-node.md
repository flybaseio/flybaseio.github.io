---
layout: "post"
title: "Creating a Click to Call Call Center with Flybase, Twilio Client and Node.js"
date: "2015-08-22 07:00"
tags: 
- "code"
- "twilio"
image: "http://blog.flybase.io/images/posts/call-center.jpg"
ogtype: "article"
bodyclass: "post"
---

<div><div class="image splash">
	<img src="/images/posts/call-center.jpg" />
</div></div>

This post will cover some interesting areas of both Flybase and Twilio, we're going to build a "Click to Call" Call Center, where visitors to a page displaying products can click a product and begin a Twilio client call with agents on another web page.

To do this, we are going to use Flybase's custom events.

_This tutorial is based on a [post](https://www.twilio.com/blog/2014/07/creating-a-click-to-call-service-with-twilio-client-pusher-and-python.html) from Twilio last year on using Pusher, Twilio and Python to build a similar system, but ours will be a little simpler thanks to having less systems involved._


### Let's talk briefly about Flybase's Custom Events

Flybase gives developers a lot of neat tools to use, in this tutorial, we are going to build a custom `click to call` call center using Flybase's custom events.

Wait, what are custom events? You know about the [reserved events](http://flybase.io/docs/web/guide/reading-data.html) such as `value`, `added`, `changed`, `online` or `removed`, but we also have custom events. Custom events can be handy for passing messages or data between devices, users, different collections or even different parts of the same app.

Here's one basic example of a custom event listener:

```javascript
flybase.on("custom_event", function(message) {
	console.log( message );
});

flybase.trigger("custom_event", "Hi")
```

Custom events are meant to be used when you want to pass data between devices but don't necessarily need to save the data anywhere, in this case it works more as a signalling server, letting devices know something is happening.

### Wait? What is a click to call system?

**Click To Call** allows customers to click a link and start an in-browser voice call with a human. While that voice call is being established, contextual information about the customer (such as the item they are looking at, or their name / interests / Facebook likes) is passed over to the person handling the call, who can then provide a highly personalized experience. The customer doesn’t need to tell them their name, or the product / service they’re interested in: Click to Call does this all for you. It gets rid of the annoying parts of call centers and lets you get on with what’s important to you.

### Ingredients

We’ll be using a few tools to build this app. You’ll want to have these set up before you continue on:

*   [Twilio](http://twilio.com): To send and receive SMS messages.
*   [Flybase](https://flybase.io/): A real-time database API. We’ll be using it to store a record of incoming and outgoing messages, and also people who are part of our group.
*   [Node.js](http://nodejs.org/): A platform built on Chrome’s JavaScript runtime for easily building fast, scalable network applications.

Node.js will be the backend portion of our app, it's where we will build our listeners for Twilio to talk to when ever we send or receive a text message.

Flybase is a real-time app platform and will be our datastore of choice for our app, it will be used to manage who is a member of a group, and to store incoming and outgoing messages and who they came from.  If you haven't already, [Sign up](https://app.flybase.io/signup) for a free Flybase account now, then create a new app from inside your dashboard. You'll use this app for your call center.

Twilio is our every handy phone API, which lets us build services like an sms app, or even a call center. Don’t have a Twilio account? yet [Sign up for Free](https://www.twilio.com/try-twilio)

### Setting Up Twilio Client

Let’s start by creating a TwiML app. What is a TwiML app? It’s a reusable TwiML configuration that can be applied to Twilio phone numbers or TwiML applications. Each TwiML app has a unique SID which we use to generate security tokens for Twilio Client.

Head over to the [apps page](https://www.twilio.com/user/account/apps) on your account and create a new app by clicking ‘Create TwiML App’.

We’re calling our TwiML App ‘Click to Call demo’. You’ll need to link the Voice Request URL to a URL on your website. We’ll hit save and this will generate an SID for the TwiML app which we will use later on, so keep it handy.


### Getting Started

We first need to set up our Node.js app.

Besides the Twilio and Flybase modules, we’ll be using the [Express framework](http://expressjs.com/) to set up our node web server to receive the POST request from Twilio so we’ll need to install the express package. We’ll also be using the body-parser module so we are going to install that as well.

Let's create our `package.json` file:

```javascript
{
	"name": "call-ads",
	"version": "0.0.1",
	"description": "Click-to-call call Center powered by Flybase, Twilio and Node.js",
	"main": "app.js",
	"repository": "https://github.com/flybaseio/call-ads",
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"keywords": [
		"twilio",
		"data mcfly",
		"flybase",
		"twilio",
		"sms"
	],
	"author": "Roger Stringer",
	"license": "MIT",
	"dependencies": {
		"twilio": "~1.6.0",
	    "ejs": "~0.8.5",
		"express": "~3.4.8",
		"flybase": "~1.5.2",
		"node-buzz": "~1.1.0",
		"moment": "~2.5.1",
		"less-middleware": "~0.2.1-beta",
		"body-parser" : "~1.4.2",
		"method-override" : "~2.0.2"	
	},
	"engines": {
		"node": "0.12"
	}
}
```

Save this file, and from the terminal run the following command:

```javascript
npm install
```

This will create a `node_modules` folder containing all of the modules we want to use.

Let's set up our folder structure, create a folder called `views`, this is where we will keep our frontend.

Now, create a folder called `public`, this will host our static files, inside that folder, create an `image` folder, we'll come back to this later.

The first file we want to create is `config.js`, this will hold our configuration information:

```javascript
module.exports = {
	// Twilio API keys
	twilio: {
		sid: "ACCOUNT-SID",
		token: "AUTH-TOKEN",
		appid: 'YOUR-TWILIO-APP-ID'
	},
	//	Flybase settings
	flybase: {
		api_key: "YOUR-API-KEY",
		app_name: "YOUR-FLYBASE-APP"
	},
	//	Username and password for admin section.
	un: 'admin',
	pw: 'password'
};
```

This file is for our configuration, we can access anything in here at anytime by referencing the file and calling the keys, for example, to get our Flybase API Key, we would call:

```javascript
var config = require('./config');
console.log( config.flybase.api_key );
```

Replace `ACCOUNTSID`, `AUTHTOKEN`, `YOUR-TWILIO-APP-ID` and `YOUR-NUMBER` with your Twilio credentials, and a phone number in your Twilio account that you'll be using.

The `appid` variable, which is showing the placeholder of `YOUR-TWILIO-APP-ID` is where you store the SID you created in the last step.

Next, replace `YOUR-API-KEY`, and `YOUR-FLYBASE-APP`  with your Flybase API Key to use. 

Finally, the `un` and `pw` variables are where you store a username and password to be used when accessing your control panel via the `/cc` route.

At the beginning of our `app.js` file we’ll need to require express and initialize it into a variable called app. We’re also going to use the [bodyParser middleware](https://github.com/expressjs/body-parser) to make it easy to use the data we’ll be getting in our POST request.

Create a new file called `app.js` and require the twilio, express and flybase packages:


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
 
var port = process.env.PORT || 5000; // set our port

var twilio = require('twilio');
var client = twilio(config.twilio.sid, config.twilio.token);

var flybase = require('flybase');
var leadsRef = flybase.init(config.flybase.app_name, "leads", config.flybase.api_key);

```

Flybase uses collections to organize data inside apps, so one app could have several collections. If you're familiar with relational databases, this is the equivalent of a table.

We'll be using one collection for our project, called `leads`.

Custom events are likewise linked to the collection we connected to, so if we established a Flybase connection to `leads`, then we will listen for all events, reserved or otherwise in the `leads` collection.

This is the start of our app, next we'll build our web interface to manage group members and also allow for sending and receiving messages.

After that, we'll build our Twilio interface and you'll have a fun app to play with.

```javascript

//	listen for incoming sms messages
app.post('/voice', function (req, res) {
	leadsRef.trigger("new-caller", {
		item: req.param('item'),
		name:req.param('name')
	});

	res.writeHead(200, {
		'Content-Type':'text/xml'
	});
	
	var resp = new twilio.TwimlResponse();
	resp.dial(function() {
		this.client('Admin');
	});
	
	res.type('text/xml');
	res.end( resp.toString() );
});
```

When we receive new `POST` requests to the `/voice` route, we store this in the `new-caller` event in our Flybase app, and then connect the call to our admin user, who we are calling `Admin` in this case.

Finally, we set up our frontend routes. `/cc` and `/`, and then tell our server to listen on port `5000`, and tell it what to do when we view it from a browser:

```javascript
var auth = express.basicAuth(config.un, config.pw);

// route to handle all frontend requests, with a password to protect unauthorized access....
app.get('/cc', auth, function(req, res) {
	var capability = new twilio.Capability( config.twilio.sid, config.twilio.token );
	capability.allowClientIncoming( 'Admin' );
	capability.allowClientOutgoing( config.twilio.appid );
    var token = capability.generate();

	res.render('cc', {
		token:token,
		api_key:config.flybase.api_key,
		app_name:config.flybase.app_name
	});
}); 

app.get('/', function(req, res) {
	var client_name = "anonymous";
	if( typeof req.param("client") !== "undefined" ){
		client_name = req.param("client");
	}
	
	var capability = new twilio.Capability( config.twilio.sid, config.twilio.token );
	capability.allowClientIncoming( client_name );
	capability.allowClientOutgoing( config.twilio.appid );
    var token = capability.generate();

	res.render('index', {
		call_token: token,
		client_name: client_name
	});
}); 

var server = app.listen(port, function() {
	console.log('Listening on port %d', server.address().port);
});
```

The `/cc` and `/` routes both make calls to Twilio to create capability tokens for the Twilio Client, these let the web page make and receive calls.

There was one thing we did to show tracking on the home page, if you access the page with a `?client=myname` variable appended to it, then the name of the client changes, this is to demonstrate passing contextual information.

### Let's set up our templates

We need to build our template files now, there will be two of them, `index.ejs` and `cc.ejs`, and we will store them in the `views` folder.

First, let's set up `index.ejs`:

```javascript
<!DOCTYPE html>
<html>
<head>
	<title>Fly Shop</title>
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css">
	<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet">

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	<script type="text/javascript" src="//static.twilio.com/libs/twiliojs/1.2/twilio.min.js"></script>
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js"></script>
</head>
<body>
	<div class="container">
		<div class="row">
			<div class="col-md-6">
				<h1>Fly Shop</h1>
			</div>
		</div>
		<div class="well">
			<h4 class="text-center">Click an ad to purchase now!</h4>
		</div>
		<div class="row">
			<div class="col-md-4">
				<a onclick="call('Apple LCD TV');">			
				<div class="panel panel-default">
					<div class="panel-heading"><h4>55" Apple LCD TV</h4></div>
					<div class="panel-body text-center">	
						<img src="/images/apple1.png">
					</div>
				</div></a>
			</div>
			<div class="col-md-4">
				<a onclick="call('Apple iPad');">			
				<div class="panel panel-default">
					<div class="panel-heading"><h4>Apple iPad</h4></div>
					<div class="panel-body text-center">	
						<img src="/images/apple2.png">
					</div>
				</div></a>
			</div>
			<div class="col-md-4">
				<a onclick="call('MacBook Pro');">			
				<div class="panel panel-default">
					<div class="panel-heading"><h4>MacBook Pro</h4></div>
					<div class="panel-body text-center">	
						<img src="/images/apple6.png">
					</div>
				</div></a>
			</div>
		</div>
		<div class="well" style="display:none;" id="hangupbox">
			<a onClick="hangup();" class="btn btn-primary" id="hangup">Hang up</a>
		</div>
	</div>
	<script type="text/javascript">
		var myname = '';
		Twilio.Device.setup("<%=call_token%>");
		function call(item_of_choice) {
			params = {"item": item_of_choice, "name": "<%= client_name %>"};
			Twilio.Device.connect(params);
			$("#hangupbox").show();
		}
		function hangup() {
			Twilio.Device.disconnectAll();
			$("#hangupbox").hide();
		}
	</script>
</body>
</html>
```

This will display sample products and let a visitor click on one, when they do, it will begin a call to the agent.

The images are in the `public/images` folder and are just some random product images, you can swap them out for any actual images you want to, this just gives you an idea how it works.

The actual brains of this page is the javascript, which takes the passed `call_token` and `client_name` as well as the selected item the user is interested in talking about and begins a browser phone call.

Now, let's set up `cc.ejs`, which is the agent control panel:

```javascript
<!DOCTYPE html>
<html>
<head>
	<title>Control Center</title>
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css">
	<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet">

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	<script type="text/javascript" src="//static.twilio.com/libs/twiliojs/1.2/twilio.min.js"></script>
</head>
<body>
	<div class="container">
		<div class="well">
			<h1>Incoming calls</h1>
		</div>
		<br />
		<div class="well">
			<div class="list-group">
				<div class="list-group-item">
					<h4 class="list-group-item-heading warning"></h4>
				</div>
			</div>
		</div>
	</div>
	<script src="https://cdn.flybase.io/flybase.js?20150817"></script>
	<script>
		$(function(){
			var leadsRef = new Flybase( "<%= api_key %>", "<%= app_name %>", "leads");
			leadsRef.on("new-caller", function( call ) {
				$('.warning').val( call.name + ' wants a ' + call.item );
			});

			Twilio.Device.setup("<%= token %>");
			Twilio.Device.incoming(function (conn) {
				// accept the incoming connection and start two-way audio
				conn.accept();
			});

			function hangup() {
				Twilio.Device.disconnectAll();
			}
		});
	</script>
</body>
</html>
```

This will look a little like the `index` file, the difference is that it is for agents to view, when a visitor clicks to begin a call, an alert will appear on the screen and the call will be answered.

In our `app.js` file, we also set it up so that `/cc` was behind a basic password, so only agents can access it.

One last thing to do, Let’s fire up our app:

```javascript
node app.js
```

We've told our app to run on port `5000`, so if you go to your web browser and type in `http://localhost:5000/` you should see your call center ad page, and if you go to `http://localhost:5000/cc`, you should see your actual call center, waiting for calls from site visitors.

Clicking an ad from the home page will trigger a call with the call center.

Just an aside, if you’re running this locally, you’ll want to make sure you’ve got ngrok running before you go to the next step. If you haven’t used [ngrok](https://ngrok.com/) before, Kevin Whinnery over at Twilio has put together a [great tutorial](https://www.twilio.com/blog/2013/10/test-your-webhooks-locally-with-ngrok.html) to help you get started.

### Finishing Up

We've built a real-time click-to-call call center app using [Flybase](http://flybase.io) and [Twilio](http://twilio.com).

This is a very basic implementation, designed to show you the possibilities of a real time Click to Call service using Twilio Client and Flybase. You can use this blog post and the [open source code](https://github.com/flybaseio/call-ads) to extend the tutorial and begin building your own applications.

Here are some ideas to get your brain juices flowing on how you could use real-time information like this with Click to Call:

- Bring up caller information as the call is made to speed up calls.
- Gather location data from callers to automatically geographically place them.
- Allow for multiple agents, maybe even look into using Flybase to store incoming call queues, and connecting the customer to the first available agent.