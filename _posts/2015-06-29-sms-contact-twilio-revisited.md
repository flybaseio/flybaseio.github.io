---
layout: "post"
title: "Migrating from Data McFly to Flybase by revisiting our real-time SMS call center"
date: "2015-06-29 10:00"
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

We originally published our tutorial on [building a real-time sms call center with Data McFly and Twilio](http://blog.flybase.io/2015/01/29/sms-contact-twilio) exactly six months ago today, and it's been one of our most popular tutorials too, so it seemed fitting that we'd use that tutorial to show how to migrate from Data McFly to Flybase.

Now, as we said [yesterday](http://blog.flybase.io/2015/06/28/the-rebrand), changing your libraries is not required, the Data McFly libraries still work, the difference is that future development will be done with the Flybase libraries.


So, let's look at the differences between the original tutorial and this new one.

1. Instead of the `datamcfly` library in node.js, we now use `flybase`:

```javascript
npm install --save datamcfly
```

Becomes:

```javascript
npm install --save flybase
```

2. Then in our node code, we call `Flybase` instead:

```javascript

var api_key = "YOUR-API-KEY";
var appname = "YOUR-DATAMCFLY-APP";
var collection = "smscontact";
var messagesRef = require('datamcfly').init(appname, collection, api_key);

```

Becomes:


```javascript

var api_key = "YOUR-API-KEY";
var appname = "YOUR-FLYBASE-APP";
var collection = "smscontact";
var messagesRef = require('flybase').init(appname, collection, api_key);

```

3. Finally on the client side:

```javascript
<script src="https://cdn.datamcfly/DataMcFly.js?latest=1"></script>
<script>
	$(function(){
//	inititialize our DataMcFly object
		var datamcflyRef = new DataMcFly("<%= apikey %>", "<%= appname %>", "<%= collection %>");
//	start our chatManager.
		var myChatManager = new chatManager( datamcflyRef );
		myChatManager.updateChats();
	});
</script>
```

```javascript
<script src="https://cdn.flybase.io/flybase.js?latest=1"></script>
<script>
	$(function(){
//	inititialize our Flybase object
		var flybaseRef = new Flybase("<%= apikey %>", "<%= appname %>", "<%= collection %>");
//	start our chatManager.
		var myChatManager = new chatManager( flybaseRef );
		myChatManager.updateChats();
	});
</script>
```

Ok, let's revisit our previous tutorial now with those steps I mentioned above added in.

***

Do you want to know one of the beautiful things about Flybase? It integrates really easily with other services.

In this article, we are going to walk through using Flybase and Twilio together to build a real-time SMS call center.

This could be used as a customer help desk where customers send a text message for help and an agent sends a reply back from their web browser.

The actual phone work will be handled by Twilio, and Flybase will store the data and display the chats in real-time. We'll use node.js to send and receive the text messages and an HTML frontend to handle the actual chatting.

##  The setup

We’ll be using a few tools to build this app. You’ll want to have these set up before you continue on:

*   [Twilio](http://twilio.com): To send and receive SMS messages. Don’t have a Twilio account? [Sign up for Free](https://www.twilio.com/try-twilio).
*   [Flybase](https://www.flybase.io/): A real-time database API. We’ll be using it to store our incoming and outgoing messages.
*   [Node.js](http://nodejs.org/): A platform built on Chrome’s JavaScript runtime for easily building fast, scalable network applications.

If you haven't already, [Sign up](https://app.flybase.io/signup) for a free Flybase account now, then create a new app. You'll use your app for your call center.

##  Getting Started

We first need to set up our Node.js app.

Besides the Twilio and Flybase modules, we’ll be using the [Express framework](http://expressjs.com/) to set up our node web server to receive the POST request from Twilio so we’ll need to install the express package. We’ll also be using the body-parser module so we are going to install that as well.

Let's create our `package.json` file:

```javascript
{
	"name": "sms-contact-center",
	"version": "0.0.1",
	"description": "SMS Contact Center powered by Flybase, Twilio and Node.js",
	"main": "app.js",
	"repository": "https://github.com/flybaseio/sms-contact",
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"keywords": [
		"twilio",
		"flybase",
		"sms"
	],
	"author": "Roger Stringer",
	"license": "MIT",
	"dependencies": {
		"twilio": "~1.6.0",
		"ejs": "~0.8.5",
		"express": "~3.4.8",
		"flybase": "~1.4.4",
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

Let's set up our folder structure, create a folder called `views`, this is where we will keep our frontend.

Now, create a folder called `public`, this will host our static files, inside that folder, create a `css` folder and a 	`js` folder, we'll come back to these later.

At the beginning of our app.js file we’ll need to require express and initialize it into a variable called app. We’re also going to use the [bodyParser middleware](https://github.com/expressjs/body-parser) to make it easy to use the data we’ll be getting in our POST request.

Create a new file called `app.js` and require the twilio, express and flybase packages:

```javascript
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var twilio = require('twilio');
var  path = require('path');

var app = express();
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({	extended: true	}));
app.use(express.static(__dirname + '/public'));
 
var port = process.env.PORT || 8080; // set our port

var client = twilio('ACCOUNTSID', 'AUTHTOKEN');
var twilio_number = 'YOUR-NUMBER';

var api_key = "YOUR-API-KEY";
var appname = "YOUR-FLYBASE-APP";
var collection = "smscontact";
var messagesRef = require('flybase').init(appname, collection, api_key);

// backend routes =========================
```

Replace `ACCOUNTSID`, `AUTHTOKEN` and `YOUR-NUMBER` with your Twilio credentials, and a phone number in your Twilio account that you'll be using.

Then, replace `YOUR-API-KEY`, `YOUR-FLYBASE-APP` and `smscontact` with your Flybase API Key, and create a collection to use. If you haven't already created a collection, one will be automatically created for you when you first save data, so you can leave the collection name set to `smscontact` if you want.

Flybase uses collections to organize data inside apps, so one app could have several collections. If you're familiar with relational databases, this is the equivalent of a table.

This is the start of our app, next we'll tell it what to do when new texts come in and when an agent replies to a text.

##  Sending and Receiving Texts

Twilio uses [webhooks](https://en.wikipedia.org/wiki/Webhook) to let your server know when an incoming message or phone call comes into our app. We need to set up an endpoint that we can tell Twilio to use for the messaging webhook.

We’re going to add a route for `/message` that responds with some [TwiML](https://www.twilio.com/docs/api/twiml). TwiML is a basic set of instructions you can use to tell Twilio what to do when you receive an incoming call or SMS message. Our code will look like this:

```javascript
app.post('/message', function (request, response) {
	var d = new Date();
	var date = d.toLocaleString();

	messagesRef.push({
		sid: request.param('MessageSid'),
		type:'text',
		direction: "inbound",
		tstamp: date,
		fromNumber:request.param('From'),
		textMessage:request.param('Body'),
		fromCity:request.param('FromCity'),
		fromState:request.param('FromState'),
		fromCountry:request.param('FromCountry')
	});

	var resp = new twilio.TwimlResponse();
	resp.message('Thanks for the message, an agent will get back to you shortly.');
	response.writeHead(200, {
		'Content-Type':'text/xml'
	});
	response.end(resp.toString());
});
```

This will listen for any incoming sms messages and store them inside your Flybase app. 

Once a message has been received, we use the Twilio node library to initialize a new `TwimlResponse`. We then use the [Message verb](https://www.twilio.com/docs/api/twiml/sms/message) to set what we want to respond to the message with. In this case we’ll just say “Thanks for the message, an agent will get back to you shortly.”. Then we’ll set the content-type of our response to `text/xml` and send the string representation of the TwimlResponse we built.

Whenever a customer sends a message to the phone number we've set up, it will send them the response and store the message inside Data McFly. If an agent is watching the client, then they will see the message appear instantly, and can send a reply back.

Now, let's add a route called `/reply` this is what we will call via AJAX when our agents want to reply to a message:

```javascript
app.post('/reply', function (request, response) {
	var d = new Date();
	var date = d.toLocaleString();

	messagesRef.push({
		type:'text',
		direction: "outbound",
		tstamp: date,
		fromNumber:request.param('From'),
		textMessage:request.param('Body'),
		fromCity:'',
		fromState:'',
		fromCountry:''
	});

	client.sendMessage( {
		to:request.param('To'), 
		from:twilio_number,
		body:request.param('Body')
	}, function( err, data ) {
		console.log( data.body );
	});
});
```
This will store the reply in our Flybase app as an outbound reply, then send the message to the customer.

Finally, let’s set our server to listen on port `8080`, and tell it what to do when we view it from a brower:

```javascript
// frontend routes =========================

// route to handle all angular requests
app.get('*', function(req, res) {
    res.render('home', {
        apikey:api_key,
        appname:appname,
        collection:collection
    });
});

 
var server = app.listen(port, function() {
	console.log('Listening on port %d', server.address().port);
});
```

Now that we've built our server, we need to tell twilio to use this messaging url as a our Message Request URL:

![](/images/posts/dashboard.png)

Send an SMS message to your Twilio number and you should get a response back. If you don’t, take a look at the [Twilio App Monitor](https://www.twilio.com/user/account/developer-tools/app-monitor) to help determine what went wrong.

This is the backend portion of our call center, it listens for incoming text messages, stores them in our Flybase app, and then sends replies when an agent replies.

Now, we need to build our agent system, where an agent can watch incoming messages and reply to them.

We'll build that now.

## The Client

We've got our Node.js app listening for messages to send and receive, now let's set up our client which is what agents will see from their web browser. 

When a message comes in, we'll display a chat box showing the message, then send a reply.

First, let's create our view, in the `/views` folder, create a file called `home.ejs`:

```javascript
<!doctype html>
<html>
<head>
	<link href='http://fonts.googleapis.com/css?family=Lato:400,300italic,400italic&subset=latin,latin-ext' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" type="text/css" href="http://angular-ui.github.com/ng-grid/css/ng-grid.css" />
	<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="/css/style.css">

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
	<script src="https://cdn.flybase.io/flybase.js?latest=1"></script>
	<script src="/js/chat.js"></script>
	
	<title>SMS Contact Center, powered by Flybase and Twilio</title>
</head>
<body>
	<div class='container'>
		<br />
		<div class="well">
			<p class='homefont'>Welcome to your SMS Contact Center</p>
			
			<p class='homefont'>This call center is the start of a modern day call center.</p>
			
			<p class='homefont'>Take a look around and give us a try.</p>
		</div>
		<hr />
		<h3>Incoming messages</h3>
		<div id="templateContainer"></div>
	</div>
	<script>
		$(function(){
//	inititialize our Flybase object
			var flybaseRef = new Flybase("<%= apikey %>", "<%= appname %>", "<%= collection %>");
//	start our chatManager.
			var myChatManager = new chatManager( flybaseRef );
			myChatManager.updateChats();
		});
	</script>
</body>
</html>
```

This file will act as our HTML file, and we are using EJS so we can pass our Flybase settings and not have to configure it in multiple places. EJS is handy for adding template functionality to your Node.js apps.

Now, let's create our style sheet. In the `/public/css` folder we created earlier, create new file called `style.css`:

```css
body{font-size:12pt;font-family:helvetica}
.chatWindow{float:left;margin:20px;border:1px solid #000;width:300px;background:#e5e5e5;border-radius:5px}
.chatName{margin-bottom:10px;background:#666;color:#fff;padding:4px}
.messages{padding:4px}
.message_outbound{color:blue;text-align:right}
.tstamp{font-size:9px;padding:2px;margin-bottom:10px;border-bottom:1px dotted #666;color:#666}
.error{color:red;text-align:center}
.messageForm textarea{float:left;width:220px;margin:5px}
```

Lastly, we want to set up the brains of our app. We've saved the biggest file for last. 

In the `/public/js/` folder, create a new file called `chat.js`:

```javascript
var chatManager = function(datamcflyRef) {
	this.datamcflyRef = datamcflyRef;
};

chatManager.prototype = {
	chats: [], 
	getChat: function(fromNumber) {
		var foundChat = null;
		for (c = 0; c < this.chats.length; c++) {
			if (this.chats[c].from == fromNumber) {
				foundChat = this.chats[c];
			}
		}

		if (foundChat == null) {
			foundChat = new chat( this.datamcflyRef );
			foundChat.init(fromNumber);
			foundChat.displayTemplate();
			this.chats.push(foundChat);
		}
		return foundChat;
	},
	updateChats: function() {
		var _this = this;
		this.datamcflyRef.once('value', function (data) {
			data.forEach( function(message){					
				var row = message.value();
				_this.getChat( row.fromNumber ).addMessage(
					row.textMessage,
					row.tstamp,
					row.direction
				);
			});
		});
		this.datamcflyRef.on('added', function (data) {
			var row = data.value();
			_this.getChat( row.fromNumber ).addMessage(
				row.textMessage,
				row.tstamp,
				row.direction
			);
		});
	}
};

var chat = function(datamcflyRef) {
	this.datamcflyRef = datamcflyRef;
};
chat.prototype = {
	init: function(name) {
		this.from = name;
		this.chatName = 'chat-' + this.from;
		this.buttonName = 'submit-' + this.from;
		this.textName = 'reply-' + this.from;
	},
	replyMessage: function(message) {
		var _this = this;
		$.ajax({
			type: "POST",
			url: "/reply",
			data: {
				'To': this.from,
				'Body': message,
				'From': this.from
			},
			dataType: "json",
			success: function(data) {
				// your message was sent
			}
		});
	},
	displayTemplate: function() {
		var content = '<div class="chatName">Chat with ' + this.from + '</div> \
		<div class="messages" id="' + this.chatName + '"></div> \
		<div class="messageForm"><textarea id="' + this.textName + '"></textarea><button id="' + this.buttonName + '">Reply</button></div> \
	  </div>';

		content = '<div class="chatWindow" id="' + this.tmplName + '">' + content + '</div>';

		$('#templateContainer').append(content);
		var _this = this;

		$('#' + this.buttonName).click(function() {
			_this.replyMessage($('#' + _this.textName).val());
			$('#' + _this.textName).val('');
		});
	},
	addMessage: function(message, tstamp, direction) {
		$('#' + this.chatName).append("<div class='message_" + direction + "'>" + message + "<div class='tstamp'>" + tstamp + "</div></div>");
	}
};
```

Our `chatManager` class is set up so that when it loads, it first grabs a list of saved text messages using the `value` event trigger, and displays them by the phone number they were sent from. 

We treat all messages to and from the same number as one session, so for each chat session, we would see a box displaying the messages between the agent and the customer, and a textbox to use to send new messages.

We then listen for any new new messages to come in using the `added` even trigger, and we then display them inside the proper chat box.

The `chat` class tells our app how display the chat boxes, and how to handle sending new replies.

In this case, when a message is sent by an agent, we post it to our backend `/reply` route, where it is saved to our Flybase app and then sent to the customer as a text message.

We're also storing the direction a message came from, either `inbound` or `outbound`, this way we can style each message to appear similar to when you view a chat log on your phone. The customer's texts will appear on the left side, and the agent's replies will appear on the right side.

Now let’s fire up our app:

```javascript
node app.js
```

We've told our app to run on port 8080, so if you go to your web browser and type in `http://localhost:8080/` you should see your call center.

Just an aside, if you’re running this locally, you’ll want to make sure you’ve got ngrok running before you go to the next step. If you haven’t used [ngrok](https://ngrok.com/) before, Kevin Whinnery over at Twilio has put together a [great tutorial](https://www.twilio.com/blog/2013/10/test-your-webhooks-locally-with-ngrok.html) to help you get started.

### And Cut!

We did it! Now that you’ve [built a simple SMS call center app](https://github.com/flybaseio/sms-contact) it’s your chance to create something with it.

### Your Mission Should You Choose To Accept

Take this project and roll with it. 

Some ideas are you could actually completely remove the `/reply` ajax call, and instead create an `outbound` text queue that would store the message, then add an `added` listener to the outbound collection that would both send the reply to the customer, and add it into the `message` collection so it would appear in the chat window.

This would eliminate the need for that `/reply` AJAX call, and also add some queue support in cases of sending out multiple replies to several customers at once.