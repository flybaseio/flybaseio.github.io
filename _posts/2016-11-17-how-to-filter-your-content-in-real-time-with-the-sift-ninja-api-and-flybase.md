---
layout: post 
published: false 
title: "How to filter your content in real-time with the Sift Ninja API and Flybase" 
date: 2016-11-18T03:18:36.490Z 
link: https://rogerstringer.com/2016/11/17/globe-making-in-1955/ 
tags:
  - links
ogtype: article 
bodyclass: post 
---

If you have an app that involves letting users enter content of any kind, regardless if it's chat, discussion boards, or a social site, you want to have the ability to filter content to make sure it is appropriate.

[Sift Ninja](https://www.siftninja.com) provides a handy API that does just that, and combined with Flybase, you can offer real-time content checking before posting it anywhere.

Sift Ninja is actually a new offering by the [guys](https://www.twohat.com) behind [communitySift](http://communitysift.com),  who have been fine tuning their system for several years to analyze and filter text and images for various online platforms. 

---

### Getting Started

To get started, you'll need two things:

1. A Sift Ninja account, [sign up here](https://www.siftninja.com) if you don't already have one.
2. A Flybase account, [sign up here](https://app.flybase.io/signup) if you don't already have one.

### Setting up Sift Ninja

When you set up your Sift Ninja account, you'll be asked to create a custom channel, name it whatever you want. This will then give you a unique URL as well as your API key.

### Setting up Flybase

Inside your Flybase account, create an app called `siftninja`, you'll want that and your API key.

### Setting up our Node app.

Our node app is going to be really simple, from your terminal type:

```javascript
$ npm init
$ npm install --save finalhandler flybase siftninja serve-static
```

This will install the node modules we need for our app.

### The backend

Create a file called `index.js`, which will contain a Flybase listener to check content entered on our chat page:

```javascript
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
var path = require('path');

var flybase = require('flybase');
var flybaseRef = flybase.init('siftninja', "chat", '<YOUR-FLYBASE-API-KEY>');

var apikey = '<YOUR-SIFT-NINJA-API-KEY>';
var url = '<YOUR-SIFT-NINJA-URL>';
var siftninja = require("siftninja")(url, apikey);

flybaseRef.on("check_content", function( req ) {
	var req = JSON.parse( req );
	var message = req.message;
	var sessionKey = req.session;
	siftninja( message ).then(function(result) {
		var result = result.body;
		result.message = message;
		if( result.response ){
			var text = ('' + message).replace( /[<>]/g, '' );
			flybaseRef.push({text:text});
		}else{
			flybaseRef.trigger( "results_"+sessionKey, result );
		}
	});
});

var serve = serveStatic('public', {
	maxAge: '1d',
	'index': ['index.html'],
	fallthrough: true
});

// Create server
var server = http.createServer(function onRequest (req, res) {
	serve(req, res, finalhandler(req, res))
})

// Listen
var port = process.env.PORT || 3000;
server.listen( port, function() {
	console.log('Server started on port ' + port );
});
```

This will create a custom event listener called `check_content`, which will check the `message` for any inapproriate text and return the results back to our frontend app.

If `response` was true, then the text was ok, and we save it to our Flybase app, and thus let it appear in the chat window.

If the `response` was false, then there was a problem with the text and we notify the user who entered it and do not save it. We'll pass a unique session id for the user, which lets us respond to that user without notifying all other users.

## The Frontend

Create a folder called `public` and inside that folder, create a file called `index.html`:

```javascript
<html>
<head>
	<title>Flybase and Sift Ninja</title>
	<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
</head>
<body>
	<br />
	<div class="container well">
		<h2>Enter Chat and press enter</h2>
		<div class="form-group">
			<input type="text" id="input" class="form-control" placeholder="Enter your message">
		</div>
		<hr />
		<h3>Chat Output</h3>
		<ul class="list-group" id="chatbox"></ul>
	</div>
	<script src="https://cdn.flybase.io/flybase.js"></script>
	<script>
		var flybase = new Flybase("<YOUR-FLYBASE-API-KEY>", "siftninja", "chat");

		if (sessionStorage.getItem("sessionKey")) {
			var sessionKey = sessionStorage.getItem("sessionKey");
		}else{
			var sessionKey = uniqueID();
			sessionStorage.setItem("sessionKey", sessionKey);
		}

		function $(id) { return document.getElementById(id); }
		var box = $('chatbox'), input = $('input'), name = $('nameInput');

		input.addEventListener('keyup', function(e) {
			if ((e.keyCode || e.charCode) === 13) {
				flybase.trigger('check_content', {message:input.value,session:sessionKey});
			}
		});

		flybase.on("results_"+sessionKey, function(data){
			if( !data.response ){
				displayChatMessage( '&uarr; <strong>Sift ninja found something bad!</strong>' );
			}
		});

		function displayChatMessage( str ){
			box.innerHTML =  "<li class='list-group-item'>" + str + '</li>' + box.innerHTML;
		}

		flybase.once('value', function (data) {
			if( data.count() ){
				data.forEach( function(message){
					displayChatMessage(message.value().text );
				});
			}
		});

		flybase.on('added', function (message) {
			displayChatMessage( message.value().text );
		});

		function uniqueID(){
			function chr4(){
				return Math.random().toString(16).slice(-4);
			}
			return chr4() + chr4() + '-' + chr4() + '-' + chr4() + '-' + chr4() + '-' + chr4() + chr4() + chr4();
		}
	</script>
</body>
</html>
```

We've kept this app simple, when the user hits the `enter` key on their text it sends an event to our backend via Flybase and then listens for a reply. 

We assign our chat users a unique session ID that follows them for the life of that browser session, this then lets us add a unique listening event called `results_<SESSIONKEY>` that we can use to pass any issues we've found directly back to that user.

### Finishing Up

You can see the original [repo here](https://github.com/flybaseio/sifting-fly).

Feel free to expand on what this can do, as Sift Ninja is a handy tool to have in your arsenal and the guys behind it are solid in this area, and combining it with Flybase's real-time events lets you check content entered in real-time before saving it to your database or forwarding it to other users.