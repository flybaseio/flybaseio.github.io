---
layout: post 
published: true 
title: "Add Social Login To Your Angular Sites With Flybase And Hello.js" 
date: 2016-01-07T16:34:57.407Z 
tags:
  - code
ogtype: article 
bodyclass: post 
---

<div class="well">
This post has been deprecated in favour of our <a href="/2016/10/10/client-side-auth/">Flybase Auth</a> library which combines the code featured in this post into a single javascript file for easier setup.
</div>

I posted [earlier](http://blog.flybase.io/2015/08/12/client-side-login-flybase-hellojs/) about using the [Hello.js](http://adodson.com/hello.js/#hellojs) library to add Facebook login to your client-side HTML / Javascript site.

The tutorial I originally wrote to use that with actually got converted to Angular, and we'll be posting it shortly, but I wanted to show you quickly how to use Flybase, Hello.js and Angular.js to give your sites the ability to use social logins.

#### Step 1

If you haven’t already yet, Create your [Flybase account](https://app.flybase.io/signup) and create a new app called `hello`.

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

So far, this has been like the previous tutorial, now here's where it gets interesting.

#### Step 4

We want to create our `index.html` file, this file will be simple, just the skeleton of our app:

```javascript
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
    <title>Hello Flying Angular</title>
 
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.8/angular.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.15/angular-ui-router.min.js"></script>
    <script type="text/javascript" src="https://cdn.flybase.io/libs/hello.all.js"></script>
    <script type="text/javascript" src="https://cdn.flybase.io/libs/ng-hello.js"></script>
	<script src="https://cdn.flybase.io/flybase.js"></script>
	<script src="https://cdn.flybase.io/angularfly.js"></script>
    <script src="app.js"></script>
</head>
<body ng-app="helloApp">
<div ui-view></div>
 
</body>
</html>
```

We use `hello.js` so much, we've made it a part of our CDN's libraries, so we can quickly include in our apps without messing with installs, this file is kept up to date with the latest version as well.

We also include a file called `ng-hello.js`, this file is our angular directive, which acts as a wrapper for hello.js, we can include this in any controller by including it, which you will see in the next step.

#### Step 5

We are going to use one template file in this demo, let's call it `home.html`:

```javascript
<h1>hi</h1>
<div id="profile_facebook">{{whoami}}</div>
<a ng-click="login()" ng-show="!whoami">Login</a>
<a ng-click="logout()" ng-hide="!whoami">Logout</a>
```

#### Step 6

This is the final step, we want to set up our `app.js` file to handle the actual logging in and out.

```javascript
(function () {
	var app = angular.module('helloApp', ['ui.router','ngHello','flybaseResourceHttp']);
	app.constant('FLYBASE_CONFIG',{API_KEY:'YOUR-FLYBASE-API-KEY', DB_NAME:'hello'});

	app.factory('Users', function ($flybaseResourceHttp) {
		return $flybaseResourceHttp('fb');
	});
	
	app.config( function($stateProvider, $urlRouterProvider, helloProvider) {

		helloProvider.init({
			facebook: 'YOUR-FACEBOOK-CLIENT-ID'
		}, {redirect_uri: 'redirect.html'});
		
		$urlRouterProvider.otherwise("/");
		$stateProvider.state('login', {
			url: "/",
			templateUrl: "home.html",
			controller: "LoginController"
		}).state('home', {
			url: "/login",
			template: "home.html"
		});
	});
	
	app.controller('LoginController', function ($scope, hello, Users, $timeout) {
		$scope.flybaseRef = Users.flybase();
		$scope.whoami = "";
		$scope.user = {};
		
		$scope.login = function () {
			hello('facebook').login();
		};
		
		$scope.logout = function () {
			hello('facebook').logout().then(function() {
				$scope.whoami = "";
				$scope.user = {};
			}, function(e) {
				alert('Signed out error: ' + e.error.message);
			});
		};

		hello.on("auth.login", function (auth) {
			hello(auth.network).api('/me').then(function( user ) {
				var displayName = user.name.split(' ');
				user.first_name = displayName[0].toLowerCase();
				user.last_name = displayName[displayName.length - 1].toLowerCase();
				user.fbid = user.id;
					
				$scope.user = user;
				$scope.flybaseRef.where({'fbid':user.fbid}).limit(1).once('value', function( data ){
					var error = null;
					if( data.count() > 0 ){
						$timeout(function() {
							$scope.user = data.first().value();
							$scope.whoami = "Hey " + $scope.user.name;
						});
					}else{
						//  create user since he doesn't exist...
						$scope.flybaseRef.push( user, function(data){
							$timeout(function() {
								$scope.user = data;
								$scope.whoami = "Hey " + $scope.user.name;
							});
						});
					}
				});
			});
		});
	});
})();
```

Mostly, this app just presents you with a `login` button, which when you click, opens the facebook login window, and then checks your Flybase app to see if you are already signed up or not and if you are not, then it adds you to the database and stores your user record inside the `$scope.user` variable. 

To use hello.js, we use the `ngHello` directive, which gives us to usable objects: `helloProvider` and `hello`.

`helloProvider` is used to set up our login, we can add facebook, twitter, github, etc information here.

`hello` is used to handle the actual login process and what happens after people login, this is the direct object that is linked to the `hello.js` library.

#### Closing out

This was a simple tutorial, I'll be expanding on this extensively shortly in a couple different upcoming tutorials, but first I wanted to show you guys how to add social login to your angular site without too much work.
