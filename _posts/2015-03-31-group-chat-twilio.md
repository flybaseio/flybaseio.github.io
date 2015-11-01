---
layout: "post"
title: "Build a real-time SMS group chat tool with Data McFly, Twilio and Node.js"
tags: 
- "code"
- "twilio"
date: "2015-03-31 13:52:13"
image: "http://blog.datamcfly.com/images/posts/call-center.jpg"
ogtype: "article"
bodyclass: "post"
---

<div class="box-wrap"><div class="box">
	<img src="/images/posts/call-center.jpg" />
</div></div>

### Overview

Last November, I went to a conference with several co-workers, and we wanted to keep everyone organized so we could keep track of what our plans were.

We set up a group chat system that let one of the members send an SMS and everyone else get the message, then if someone replied, we'd all see the reply.

That was handy, and today, I'm going to show you how to build a similar web app. The app will consist of a simple control panel where you can manage who is part of a group, and a backend that will handle incoming and outgoing text messages and route them to the proper group members.

You will also be able to send and receive messages from a page on the site in real-time, for when you may not have you phone on you but want to send a message to the group, and vice versa.

We'll use [Data McFly](http://datamcfly.com/) to handle the data-storage and real-time aspects of the app, Twilio to handle the actual SMS work, and Node.js for the system itself.

We're going to build this particular app for one single group, but it wouldn't be hard to extend it for multiple groups. 

### Ingredients

We’ll be using a few tools to build this app. You’ll want to have these set up before you continue on:

*   [Twilio](http://twilio.com): To send and receive SMS messages.
*   [Data McFly](https://www.datamcfly.com/): A real-time database API. We’ll be using it to store a record of incoming and outgoing messages, and also people who are part of our group.
*   [Node.js](http://nodejs.org/): A platform built on Chrome’s JavaScript runtime for easily building fast, scalable network applications.

Node.js will be the backend portion of our app, it's where we will build our listeners for Twilio to talk to when ever we send or receive a text message.

Data McFly is a real-time app platform and will be our datastore of choice for our app, it will be used to manage who is a member of a group, and to store incoming and outgoing messages and who they came from.  If you haven't already, [Sign up](https://app.datamcfly.com/signup) for a free Data McFly account now, then create a new app from inside your dashboard. You'll use this app for your group chat system.

Twilio is our every handy phone API, which lets us build services like a group chat app, or even a call center. Don’t have a Twilio account? yet [Sign up for Free](https://www.twilio.com/try-twilio)

### Getting Started

We first need to set up our Node.js app.

Besides the Twilio and Data McFly modules, we’ll be using the [Express framework](http://expressjs.com/) to set up our node web server to receive the POST request from Twilio so we’ll need to install the express package. We’ll also be using the body-parser module so we are going to install that as well.

Let's create our `package.json` file:

```javascript
{
	"name": "group-chat-system",
	"version": "0.0.1",
	"description": "Group chat system powered by Data McFly, Twilio and Node.js",
	"main": "app.js",
	"repository": "https://github.com/DataMcFly/group-chat",
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"keywords": [
		"twilio",
		"data mcfly",
		"sms"
	],
	"author": "Roger Stringer",
	"license": "MIT",
	"dependencies": {
		"twilio": "~1.6.0",
		"ejs": "~0.8.5",
		"express": "~3.4.8",
		"datamcfly": "~1.5.2",
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

The first file we want to create is `config.js`, this will hold our configuration information:

```javascript
module.exports = {
    // Twilio API keys
    twilio: {
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

Create a new file called `app.js` and require the twilio, express and datamcfly packages:

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

var twilio = require('twilio');
var client = twilio(config.twilio.sid, config.twilio.token );

var datamcfly = require('datamcfly');
var messagesRef = datamcfly.init(config.datamcfly.app_name, "messages", config.datamcfly.api_key);
var groupRef = datamcfly.init(config.datamcfly.app_name, "groups", config.datamcfly.api_key);
```

Data McFly uses collections to organize data inside apps, so one app could have several collections. If you're familiar with relational databases, this is the equivalent of a table.

We'll be using two collections for our project, one will contain `messages`, the other will contain `groups`. With that in mind, we've created two different references to our Data McFly app, one for messages, and one for our group.

This is the start of our app, next we'll build our web interface to manage group members and also allow for sending and receiving messages.

After that, we'll build our Twilio interface and you'll have a fun app to play with.

### Sending and receiving texts

We'll need to add a few things to send and receive texts, our first step is to add a listener for Twilio.

Twilio uses [webhooks](https://en.wikipedia.org/wiki/Webhook) to let your server know when an incoming message or phone call comes into our app. We need to set up an endpoint that we can tell Twilio to use for the messaging webhook.

We’re going to add a route for `/message` that responds with some [TwiML](https://www.twilio.com/docs/api/twiml). TwiML is a basic set of instructions you can use to tell Twilio what to do when you receive an incoming call or SMS message. Our code will look like this:

```javascript
//	listen for incoming sms messages
app.post('/message', function (request, response) {
	var d = new Date();
	var date = d.toLocaleString();
		
	groupRef.where( {"memberNumber":request.param('From')} ).limit(1).on( "value", function ( data ){
		if( data.count() ){
			data.forEach( function( snapshot ){
				var member = snapshot.value();
				messagesRef.push({
					sid: request.param('MessageSid'),
					type:'text',
					tstamp: date,
					fromName:member.memberName,
					fromNumber:request.param('From'),
					message:request.param('Body'),
					fromCity:request.param('FromCity'),
					fromState:request.param('FromState'),
					fromCountry:request.param('FromCountry'),
					groupNumber:request.param('To')
				});
			});
		}
	});
	var resp = new twilio.TwimlResponse();
	resp.message('Message received.');
	response.writeHead(200, {
		'Content-Type':'text/xml'
	});
	response.end(resp.toString());
});
```

This will listen for any incoming sms messages and store them inside your Data McFly app, specifically inside the `messages` collection. 

As part of storing the message, we perform a look up to find the `groups` member with the same phone number the message was sent from, we then use this lookup to verify the member was part of the group, and also to get the member's name.

If no member was found, then no message gets sent.

Once a message has been received, we use the Twilio node library to initialize a new `TwimlResponse`. We then use the [Message verb](https://www.twilio.com/docs/api/twiml/sms/message) to set what we want to respond to the message with. In this case we’ll just say “Message received”. 

Then we’ll set the content-type of our response to `text/xml` and send the string representation of the TwimlResponse we built.

### Listening For Changes

As part of our `app.js` code, we also want to add some asynchronous listeners to listen for changes to our Data McFly apps.

```javascript
//	when a new message is added to the Data McFly app, send it via Twilio...
messagesRef.on("added", function (data ){
	var snapshot = data.value();
	sendMessage( 
		snapshot.groupNumber,
		snapshot.fromName,
		snapshot.fromNumber,
		snapshot.message
	);	
});

groupRef.on("added", function ( data ){
	var snapshot = data.value();
	var msg = snapshot.memberName + ' has joined the group';
	messagesRef.push({
		sid: "",
		type:'',
		tstamp: new Date().toLocaleString(),
		fromName:"Admin",
		fromNumber:"",
		message:msg,
		fromCity:"",
		fromState:"",
		fromCountry:"",
		groupNumber:snapshot.groupNumber
	});
});

groupRef.on("removed", function ( data ){
	var snapshot = data.value();
	var msg = snapshot.memberName + ' has left the group';
	//	send broadcast that a group member has been removed
	messagesRef.push({
		sid: "",
		type:'',
		tstamp: new Date().toLocaleString(),
		fromName:"Admin",
		fromNumber:"",
		message:msg,
		fromCity:"",
		fromState:"",
		fromCountry:"",
		groupNumber:snapshot.groupNumber
	});
});

//	broadcast a message to the group
function sendMessage( group_number, from_name, from_number, message ){
	var msg = from_name + ": " + message;
//	loop through the group members and get list of people to message:
	groupRef.where( {"memberNumber":{"$not":from_number}} ).on( "value", function ( data ){
		if( data.count() ){
			data.forEach( function( snapshot ){
				var member = snapshot.value();
				client.sendMessage( {
					to:member.memberNumber, 
					from:group_number,
					body:msg
				}, function( err, data ) {
				});
			});
		}
	});
}
```

We've set up three asynchronous listeners, one for the `message` collection, which listens for any messages being `added` to it, and when it receives a notification of a new message, calls our `sendMessage` function and sends the message on to the other members of the group.

The other two asynchronous listeners are for our `groups` collection, the first one, listens for any new members being `added` to a group and then sends an announcement that the member has joined the group.  

The last listener will listen for any members being `removed` from a group, and sends an announcement that the member has left the group.

Finally, our `sendMessage` function is used for sending messages on to the other group members, it will perform a query to return all members of the group, excluding the person who sent the message, and send the message onto each member.

Messages will appear formatted with the member's name followed by the message.

```
	John: How about pizza after work?
```

Finally, let’s set our server to listen on port `8080`, and tell it what to do when we view it from a brower:

```javascript
// frontend routes =========================

// Create basic auth middleware used to authenticate all admin requests
var auth = express.basicAuth(config.un, config.pw);

// route to handle all frontend requests, with a password to protect unauthorized access....
app.get('*', auth, function(req, res) {
	res.render('index', {
		api_key:config.datamcfly.api_key,
		app_name:config.datamcfly.app_name,
		group_number:config.twilio.from_number
	});
}); 

var server = app.listen(port, function() {
	console.log('Listening on port %d', server.address().port);
});
```

Now that we've built our server, we need to tell twilio to use this messaging url as a our Message Request URL:

![](http://blog.datamcfly.com/images/posts/dashboard.png)

Send an SMS message to your Twilio number and you should get a response back. If you don’t, take a look at the [Twilio App Monitor](https://www.twilio.com/user/account/developer-tools/app-monitor) to help determine what went wrong.

This is the backend portion of our group chat app it listens for incoming text messages, stores them in our Data McFly app, and then sends broadcasts to the other members of the group.

Now, we need to build our control panel, where the admin can manage group members, and also send and receive messages.

We'll build that now.

### Managing Your Group

We're going to build a simple web interface to manage our group members.

The data we store for our group members will consist of the following three pieces of data:

- Group phone number (the Twilio number we stored in the `twilio_number` variable in the `Getting Started` section)
- Member name
- Member phone number

We'll also display a basic chat box which will let our admin send messages and see what messages are being sent.

First, let's create our view, in the `/views` folder, create a file called `index.ejs`:

```javascript
<!doctype html>
<html>
<head>
	<link href='//fonts.googleapis.com/css?family=Lato:400,300italic,400italic&subset=latin,latin-ext' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" type="text/css" href="//angular-ui.github.com/ng-grid/css/ng-grid.css" />
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
	<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="/css/style.css">

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
	<script src="https://cdn.datamcfly.com/DataMcFly.js?https://cdn.datamcfly.com/DataMcFly.js?20150217"></script>
	<script src="https://cdn.datamcfly.com/libs/phone.js"></script>
	<script src="/js/group.js"></script>
	
	<title>Group Chat, powered by Data McFly and Twilio</title>
</head>
<body>
	<div class='container'>
		<div class="row">
			<div class="col-md-6">
				<h3>Group Members</h3>
				<div id="group_wrapper"></div>
				<hr />
				<h2>Add new member</h2>
				<div class="well">
					<form id="group_form" method="post" accept-charset="utf-8" class="form-inline">
						<div class="form-group">
							<div class="input-group">
								<div class="input-group-addon"><i class="fa fa-pencil"></i></div>
								<input type="text" class="form-control" id="name" name="name" placeholder="name">
							</div>
						</div>
						<div class="form-group">
							<div class="input-group">
								<div class="input-group-addon"><i class="fa fa-mobile"></i></div>
								<input type="tel" class="form-control" id="phone" name="phone" placeholder="+11112223333"/>
							</div>
						</div>
						<button type="submit" class="btn btn-primary">Save</button>
					</form>
				</div>
			</div>
			<div class="col-md-4 col-md-offset-1">
				<div id="chatBox" class='chat'>
					<header>Chat Log</header>
					<ul id='messagesDiv' class='chat-messages'></ul>
					<footer>
						<form id="msg_form" method="post" accept-charset="utf-8" class="form-inline">
							<input type="text" id="messageInput" placeholder="Type a message..." />
						</form>
					</footer>
				</div>
			</div>
	</div>
	<script>
		$(function(){
//			inititialize our Data McFly object
			var myGroupManager = new groupManager( "<%= api_key %>", "<%= app_name %>", "<?%= group_number %>");
			myGroupManager.start();
		});
	</script>
</body>
</html>
```

This will display out control panel, which will be split into two panes, the left side for viewing group members, the right side for viewing the chat log. 

At the bottom of the page, we're initializing our `groupManager` class. We'll create that file shortly.

Next, let's create our style sheet. In the `public/css` folder, create a file called `style.css`:

```css
body{font-size:12pt;font-family:helvetica}
.chatWindow{float:left;margin:20px;border:1px solid #000;width:300px;background:#e5e5e5;border-radius:5px}
.chatName{margin-bottom:10px;background:#666;color:#fff;padding:4px}
.messages{padding:4px}
.message_outbound{color:blue;text-align:right}
.tstamp{font-size:9px;padding:2px;margin-bottom:10px;border-bottom:1px dotted #666;color:#666}
.error{color:red;text-align:center}
.messageForm textarea{float:left;width:220px;margin:5px}
#phone{width:140px;}
#chatBox{background-color: #f8f8f8;background: rgb(229, 228, 228);margin:10px;}
.hide {display: none; }
.chat {font-family: "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;border-radius: 3px;-webkit-box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);background-color: #dfe3ea;border: 1px solid #CCC;overflow: auto;padding: 0px;font-size: 18px;line-height: 22px;color: #666; }
.chat header {background-color: #EEE;background: -webkit-gradient(linear, left top, left bottom, from(#EEEEEE), to(#DDDDDD));background: -webkit-linear-gradient(top, #EEEEEE, #DDDDDD);background: linear-gradient(top, #EEEEEE, #DDDDDD);-webkit-box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.9), 0px 1px 2px rgba(0, 0, 0, 0.1);box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.9), 0px 1px 2px rgba(0, 0, 0, 0.1);border-radius: 3px 3px 0px 0px;border-bottom: 1px solid #CCC;line-height: 24px;font-size: 12px;text-align: center;color: #999; }
.chat input {-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;-webkit-box-shadow: inset 0px 1px 3px rgba(0, 0, 0, 0.2);box-shadow: inset 0px 1px 3px rgba(0, 0, 0, 0.2);border-radius: 3px;padding: 0px 10px;height: 30px;font-size: 18px;width: 100%;font-weight: normal;outline: none; }
.chat .chat-toolbar {background-color: #FFF;padding: 10px;position: relative;border-bottom: 1px solid #CCC; }
.chat .chat-toolbar label {text-transform: uppercase;line-height: 32px;font-size: 14px;color: #999;position: absolute;top: 10px;left: 20px;z-index: 1; }
.chat .chat-toolbar input {-webkit-box-shadow: none;box-shadow: none;border: 1px solid #FFF;padding-left: 100px;color: #999; }
.chat .chat-toolbar input:active, .chat .chat-toolbar input:focus {color: #1d9dff;border: 1px solid #FFF; }
.chat ul {list-style: none;margin: 0px;padding: 20px;height: 200px;overflow: auto; }
.chat ul li {margin-bottom: 10px;line-height: 24px; }
.chat ul li:last-child {margin: 0px; }
.chat ul .chat-username {margin-right: 10px; }
.chat footer {display: block;padding: 10px; }
.chat footer input {border: 1px solid #ced3db;height: 40px; width:75%;}
```

Now, let's move onto the brains of our system, inside the `public/js` folder, we'll create a file called `group.js`:

```javascript
var groupManager = function(api_key, app_name, group_number) {
//	store the group number
	this.group_number = group_number;
//	reference to our messages collection...
	this.messagesRef = new DataMcFly(api_key, app_name, "messages");

//	reference to our group collection...
	this.groupRef = new DataMcFly(api_key, app_name, "groups");
	
	this.group_members = [];
};
```

This is the first part of our `groupManager` class, so far we've told it to start up two Data McFly references, one called `messagesRef` and one called `groupRef`, we also stored our group number as a variable called `group_number`.

Now, let's set up our actions:

```javascript
groupManager.prototype.start = function(){
	var _this = this;

//	list group members if any
	this.groupRef.on("value", function( data ){
		if( data.count() ){		
			data.forEach( function( snapshot ){
				var member = snapshot.value();
				_this.group_members[member._id] = member;				
			});
		}
		_this.displayGroup();
	});

//	listen for new members being added
	this.groupRef.on("added", function( snapshot ){
		var member = snapshot.value();
		_this.group_members[member._id] = member;
		_this.displayGroup();
	});

//	save new group member to our app
	$("#group_form").submit( function(e){
		e.preventDefault();
		var member = {
			'groupNumber': _this.group_number,
			'memberName': $("#name").val(),
			'memberNumber': clean_phone( $("#phone").val() )
		};
		_this.groupRef.push( member );
		$("#name").val('');
		$("#phone").val('');
		return false;
	});

//	listen for members being removed
	$('div').on('click','a.delete', function(e){
		var _id = e.target.id;
		_this.groupRef.remove(_id);
		return false;
	});

	this.groupRef.on("removed", function( snapshot ){
		var member = snapshot.value();
		_this.group_members[member._id] = undefined;
		_this.displayGroup();
	});

//	list any existing chat message
	this.messagesRef.on('value', function (data) {
		if( data.count() ){
			data.forEach( function(message){				
				_this.displayChatMessage(message.value() );
			});
		}
	});		
//	listen for incoming chat messages
	this.messagesRef.on('added', function (data) {
		var message = data.value();
		_this.displayChatMessage( message );
	});

//	listen for outgoing chat messages	
	$('#msg_form').submit( function(e){
		e.preventDefault();
		var message = {
				"tstamp": new Date().toLocaleString(),
				"fromName": "Admin",
				"fromNumber": "",
				"message": $('#messageInput').val(),
				"fromCity": "",
				"fromState": "",
				"fromCountry": "",
				"groupNumber": _this.group_number
		}
		_this.messagesRef.push( message );
		$('#messageInput').val('');
		return false;
	});
};
```

Our `start` function sets up our asynchronous listeners, as well as listeners for form submissions and members being deleted by pressing the `delete` button.

If a group member is `added`, then the member will be added to the `groups` collection and a notification will be sent to the other members of the group. The listing of group members will also show the new member.

If a person is `removed`, then they will vanish from the list, and a message will be sent to the remaining group members.

The other side of our `groupManager` class is the actual chatting side of things, when the admin types in a message, it will get broadcast to the other group members, at the same time, when another group member sends a message, the admin will see the message in the chat box.

We have two functions left, one is to display all members of a group, and the other displays chat messages.

For our groups, we stored information in a class-wide variable called `group_members`, this lets us quickly add, update or remove members as we receive notifications about it. 

```javascript
//	Display group members
groupManager.prototype.displayGroup = function(){
	$('#group_wrapper').html('');
	for (var i in this.group_members ) {
		var member = this.group_members[i];
		if( member !== undefined ){
			var html = '';
			html = '<span>'+member.memberName+' ( ' + member.memberNumber + ' )</span> <a href="#delete" class="delete" id="' + member._id+'">[remove]</a>';
			$('<div/>').prepend( html ).appendTo($('#group_wrapper'));
		}
	}
};
```

Our last function, displays each chat message as it is received:

```javascript
//	Display chat messages
groupManager.prototype.displayChatMessage = function( message ){
	var _this = this;
	$('<li/>')
		.attr("id",message._id)
		.text(message.message)
		.prepend(
			$("<strong class='example-chat-username' />").text(message.fromName+': ')
			).appendTo( $('#messagesDiv') );
	$('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};
```

One last thing to do, Let’s fire up our app:

```javascript
node app.js
```

We've told our app to run on port 8080, so if you go to your web browser and type in `http://localhost:8080/` you should see your call center.

Just an aside, if you’re running this locally, you’ll want to make sure you’ve got ngrok running before you go to the next step. If you haven’t used [ngrok](https://ngrok.com/) before, Kevin Whinnery over at Twilio has put together a [great tutorial](https://www.twilio.com/blog/2013/10/test-your-webhooks-locally-with-ngrok.html) to help you get started.


### Finishing Up

We've built a real-time group chat app using [Data McFly](http://datamcfly.com) and [Twilio](http://twilio.com)

You can find our group chat app here at [Github](https://github.com/DataMcFly/group-chat).

This app can be used for a group of people to carry on a conversation. This can be handy when attending events.

You could use this to notify even attendees of upcoming talks, for example, a conference could add their attendees to a group and then send a broadcast when it is time for a talk to begin, or when it is lunch time.

You can extend this to include support for multiple groups, by simply giving each group it's own phone number for example.