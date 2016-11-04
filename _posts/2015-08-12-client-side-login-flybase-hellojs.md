---
layout: "post"
title: "Client-side Facebook login with Flybase and Hello.js"
tags: 
- "code"
date: "2015-08-12 16:30:00"
ogtype: "article"
bodyclass: "post"
---

<div class="well">
This post has been deprecated in favour of our <a href="/2016/10/10/client-side-auth/">Flybase Auth</a> library which combines the code featured in this post into a single javascript file for easier setup.
</div>

I recently finished a pretty large tutorial that I'll be publishing shortly that uses client-side login via Facebook and a few other social sites.

Rather than building something from scratch, I decided to integrate the fantastic [Hello.js](http://adodson.com/hello.js/#hellojs) library and it worked nicely.

In the words of Andrew Dodson, the Hello.js developer:

> Hello.js is a client-side JavaScript SDK for authenticating with <a href="http://tools.ietf.org/pdf/draft-ietf-oauth-v2-12.pdf" target="_blank">OAuth2</a> (and <b>OAuth1</b> with a <a href="#oauth-proxy">oauth proxy</a>) web services and querying their REST APIs. 
> 
> HelloJS standardizes paths and responses to common APIs like Google Data Services, Facebook Graph and Windows Live Connect. It's <b>modular</b>, so that list is <a href="./modules">growing</a>. No more spaghetti code!

In this post, we're going to look at using Facebook login specifically.

#### Step 1

If you haven't already yet, Create your [Flybase account](https://app.flybase.io/signup) and create a new app called `hello`.

#### Step 2

First, we need to set up our [Facebook app](https://developers.facebook.com/apps), click the link and follow the instructions.

#### Step 3

Create a file called `redirect.html`, it won't do much just get used for redirection by the login system:

```javascript
<!DOCTYPE html>
<html>
<head>
	<title>Hello, redirecting...</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
</head>
<body>
	<div class="loading"><span>&bull;</span><span>&bull;</span><span>&bull;</span></div>
	
	<h2>Please close this window to continue.</h2>
	<script>
	window.onbeforeunload = function(){
		document.getElementsByTagName('h2')[0].innerHTML="Redirecting, please wait";
	}
	</script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/hellojs/1.8.1/hello.all.min.js"></script>
</body>
</html>
```

#### Step 4

Create `index.html`, this is the file that acts as the brains of your app:

```javascript
<html>
<head>
	<title>Client-side Facebook login with Flybase and Hello.js</title>
</head>
<body>

	<button class="login-btn" onclick="hello('facebook').login()">Facebook</button>
	<button id="logout-btn" style="display:none;">Logout</button>
	<div id="profile_facebook"></div>

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	<script src="https://cdn.flybase.io/flybase.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/hellojs/1.8.1/hello.all.min.js"></script>
	<script>
		var mainUser = {};
		var flybaseRef = new Flybase(( "YOUR-API-KEY", "hello", "users");

		hello.init({
			facebook: 'YOUR-FACEBOOK-CLIENT-ID'
		}, {redirect_uri: 'redirect.html'});

		hello.on('auth.login', function(auth) {
			hello(auth.network).api('/me').then(function( user ) {
				var label = document.getElementById('profile_' + auth.network);
				if (!label) {
					label = document.createElement('div');
					label.id = 'profile_' + auth.network;
					document.getElementById('profile').appendChild(label);
				}
				label.innerHTML = '<img src="' + user.thumbnail + '" /> Hey ' + user.name;

				$(".login-btn").hide();
				$("#logout-btn").show();

				var displayName = user.name.split(' ');
				user.first_name = displayName[0].toLowerCase();
				user.last_name = displayName[displayName.length - 1].toLowerCase();
				user.fbid = user.id;
				
				flybaseRef.where({'fbid':user.fbid}).limit(1).once('value', function( data ){
					var error = null;
					if( data.count() > 0 ){
						mainUser = data.first().value();
						onLoginStateChange(  mainUser );
					}else{
						//	create user since he doesn't exist...
						flybaseRef.push( user, function(data){
							mainUser = data;
							onLoginStateChange(  mainUser );
						});
					}
				});
			});
		});

		$("#logout-btn").click( function(e) ){
			e.preventDefault();
			$("#logout-btn").hide();
			$(".login-btn").show();
			hello('facebook').logout().then(function() {
				mainUser = {};
				onLoginStateChange(  mainUser );				
			}, function(e) {
				alert('Signed out error: ' + e.error.message);
			});
		});

		function onLoginStateChange( user ){
			//	do something when the user logs in or off
		}

	</script>
</body>
</html>
```

This file does two things, first, it sets up how we talk to Flybase, and second, it sets up how we talk to Facebook using Hello.js.

At it's base, Hello.js just needs to know what to do with the logins, so it looks for three or four prime pieces of code:

```javascript
<button class="login-btn" onclick="hello('facebook').login()">Facebook</button>
```

This button tells the app to perform a `facebook` login, you can replace the word `facebook` with any other supported library and it will work the same way.

Then we initialize the Hello.js library:

```javascript
	hello.init({
		facebook: 'YOUR-FACEBOOK-CLIENT-ID'
	}, {redirect_uri: 'redirect.html'});
```

Finally, we listen for login or logout changes and tell it what to do:

```javascript
	hello.on('auth.login', function(auth) {
		hello(auth.network).api('/me').then(function( user ) {
			var label = document.getElementById('profile_' + auth.network);
			if (!label) {
				label = document.createElement('div');
				label.id = 'profile_' + auth.network;
				document.getElementById('profile').appendChild(label);
			}
			label.innerHTML = '<img src="' + user.thumbnail + '" /> Hey ' + user.name;

			$(".login-btn").hide();
			$("#logout-btn").show();

			var displayName = user.name.split(' ');
			user.first_name = displayName[0].toLowerCase();
			user.last_name = displayName[displayName.length - 1].toLowerCase();
			user.fbid = user.id;
			
			flybaseRef.where({'fbid':user.fbid}).limit(1).once('value', function( data ){
				var error = null;
				if( data.count() > 0 ){
					mainUser = data.first().value();
					onLoginStateChange(  mainUser );
				}else{
					//	create user since he doesn't exist...
					flybaseRef.push( user, function(data){
						mainUser = data;
						onLoginStateChange(  mainUser );
					});
				}
			});
		});
	});
```

When a user logs in, we collect their information from Facebook, and then we check to see if they already exist, if they do we use the document on record, if not, we save them to our Flybase app.

and logout:

```javascript
	$("#logout-btn").click( function(e) ){
		e.preventDefault();
		$("#logout-btn").hide();
		$(".login-btn").show();
		hello('facebook').logout().then(function() {
			mainUser = {};
			onLoginStateChange(  mainUser );				
		}, function(e) {
			alert('Signed out error: ' + e.error.message);
		});
	});
```

This isn't a very complicated piece of code, but it helps extend what we can with it by leaps and bounds, so I wanted to share it with our users.
