---
layout: post
published: true
title: "Client-Side Auth"
date: 2016-10-10T22:13:58.688Z
tags:
  - code
ogtype: article
bodyclass: post
---

We love doing as much as possible client-side, and client-side auth is a big feature for us. We've even written about it [once](https://blog.flybase.io/2015/08/12/client-side-login-flybase-hellojs/) or [twice](https://blog.flybase.io/2016/01/07/client-side-angular-flybase-hello/) before.

Today, I want to show you guys how to use our `flybase-auth` library, which is a fork of [Hello.js](http://adodson.com/hello.js/#hellojs), along with built-in support for angular. We'll be adding support for other libraries too as we build this.

On it's own, Hello is great, but we wanted to include support for localStorage, and have a handy built-in directive so we forked it and added in our own code as well.

### Getting Started

#### Step 1

If you haven’t already yet, Create your [Flybase](https://app.flybase.io/signup) account and create a new app called `auth`.

#### Step 2

First, we need to set up our [Facebook app](https://developers.facebook.com/apps), click the link and follow the instructions.

#### Step 3

Create a file called redirect.html, it won’t do much just get used for redirection by the login system:

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
	<script src="https://cdn.flybase.io/flybase-auth.min.js"></script>
</body>
</html>
```

This file will handle any responses that come back from Social providers such as Facebook.

### Using `Flybase-auth` without angular

Here's where our tutorial will split off, first we'll cover how to use `Flybase-auth` on it's own without Angular, and then we'll touch on using Angular.

To include `Flybase-auth`, you just have to include this line in your HTML file:

```javascript
<script src="https://cdn.flybase.io/flybase-auth.min.js?a.ef.81"></script>
```

Create a file called `index.html`:

```javascript
<html>
<head>
	<title>Client-side Facebook login with Flybase and flybaseauth.js</title>
</head>
<body>

	<button class="login-btn" onclick="flybaseauth('facebook').login()">Facebook</button>
	<button id="logout-btn" style="display:none;">Logout</button>
	<div id="profile_facebook"></div>

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	<script src="https://cdn.flybase.io/flybase.js"></script>
	<script src="https://cdn.flybase.io/flybase-auth.min.js?a.ef.81"></script>
	<script>
		var mainUser = {};
		var flybaseRef = new Flybase( "YOUR-FLYBASE-TOKEN", "auth", "users");

		flybaseauth.init({
			facebook: 'YOUR-FACEBOOK-CLIENT-ID'
		}, {redirect_uri: 'redirect.html'});

		flybaseauth.on('auth.login', function(auth) {
			flybaseauth(auth.network).api('/me').then(function( user ) {
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

		$("#logout-btn").click( function(e){
			e.preventDefault();
			$("#logout-btn").hide();
			$(".login-btn").show();
			flybaseauth('facebook').logout().then(function() {
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

And that's it, you've now got a Facebook login on your static html site that can be used to let users sign up and login.

You can use Facebook, Google, Github, and more without much work.


---

### Using `Flybase-auth` with angular


Ok, we've covered using `Flybase-auth` with regular HTML, now let's use it with Angular. It's not that different but there are a few more steps.

#### 1 - create index.html

We're only going to create three files, first let's create `index.html`:

```javascript
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
	<title>Hello Flying Angular</title>
</head>
<body ng-app="helloApp">
<div ui-view></div>

<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.8/angular.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.15/angular-ui-router.min.js"></script>
<script type="text/javascript" src="https://cdn.flybase.io/flybase.js"></script>
<script type="text/javascript" src="https://cdn.flybase.io/flybase-auth.min.js?a912.81"></script>
<script type="text/javascript" src="https://cdn.flybase.io/angularfly.js"></script>
<script>
	(function () {
		var app = angular.module('helloApp', ['ui.router','ngFlybaseauth','flybaseResourceHttp','flybaseauth-storage']);
		app.constant('FLYBASE_CONFIG',{API_KEY:'YOUR-FLYBASE-TOKEN', DB_NAME:'auth'});

		app.factory('Users', function ($flybaseResourceHttp) {
			return $flybaseResourceHttp('fb');
		});

		app.config( function($stateProvider, $urlRouterProvider, flybaseauthProvider) {
			flybaseauthProvider.init({
				facebook: 'YOUR-FACEBOOK-CLIENT-ID'
			}, {redirect_uri: 'redirect.html'});

			$urlRouterProvider.otherwise("/");
			$stateProvider.state('login', {
				url: "/",
				templateUrl: "home.html",
				controller: "LoginController",
				data: {
					requiresLogin: false
				}
			}).state('test', {
				url: "/test",
				templateUrl: "test.html",
				controller: "TestController",
				data: {
					requiresLogin: true
				}
			}).state('home', {
				url: "/login",
				template: "home.html"
			});
		});

		app.run(function($rootScope, store, $location, $state, flybaseauth, $timeout) {
			$rootScope.user = null;
			$rootScope.$on('$locationChangeStart', function() {
				var user = store.get('user');
				if (user) {
					$rootScope.user = user;
				} else {
	//				$location.path('/');
				}
			});

		});

		app.controller('TestController', function ($scope, $rootScope, flybaseauth, Users, $timeout) {
			$scope.flybaseRef = Users.flybase();
			$scope.whoami = "";

			if( $rootScope.user === null ){
				//	not logged in, redirect to log in page...
				self.location.href = "#/";
			}else{
				$scope.whoami = "Hey " + $rootScope.user.name;
			}
		});

		app.controller('LoginController', function ($scope, $rootScope, flybaseauth, Users, store, $timeout) {
			$scope.flybaseRef = Users.flybase();
			$scope.whoami = "";

			if( $rootScope.user !== null ){
				$scope.whoami = "Hey " + $rootScope.user.name;
			}

			$scope.login = function () {
				flybaseauth('facebook').login();
			};

			$scope.logout = function () {
				$timeout(function() {
					store.remove('user');
					$scope.whoami = "";
					$rootScope.user = null;
				});
				flybaseauth('facebook').logout().then(function() {
	//				self.location.href = "#/";
				}, function(e) {
					alert('Signed out error: ' + e.error.message);
				});
			};

			flybaseauth.on("auth.login", function (auth) {
				flybaseauth(auth.network).api('/me').then(function( user ) {
					var displayName = user.name.split(' ');
					user.first_name = displayName[0].toLowerCase();
					user.last_name = displayName[displayName.length - 1].toLowerCase();
					user.fbid = user.id;

					$scope.user = user;
					$scope.flybaseRef.where({'fbid':user.fbid}).limit(1).once('value', function( data ){
						var error = null;
						if( data.count() > 0 ){
							$timeout(function() {
								$rootScope.user = data.first().value();
								$scope.whoami = "Hey " + $scope.user.name;
								store.set('user', data.first().value() );
							});
						}else{
							//  create user since he doesn't exist...
							$scope.flybaseRef.push( user, function(data){
								$timeout(function() {
									$rootScope.user = data;
									store.set('user', data );
									$scope.whoami = "Hey " + $rootScope.user.name;
								});
							});
						}
					});
				});
			});
		});
	})();
</script>
</body>
</html>
```

When we initially call `Flybase-auth`, we'll call it with `flybaseauthProvider`, this is where we set up the initial config.

Then on any controller, we just include `flybaseauth` and use that.

One thing in this sample that we do to cut down on queries is we store the user object in localStorage and then retrieve it inside the `rootScope` when a new page is loaded or when the site is refreshed.

#### 2 - create home.html

Let's create the page that handles our login, `home.html`:

```javascript
<h1>hi</h1>
<div id="profile_facebook">{{whoami}}</div>
<button ng-click="login()" ng-show="!whoami">Login</button>
<button ng-click="logout()" ng-hide="!whoami">Logout</button>
<a href="#/test">Test</a>
```

### 3 - create test.html

Now, let's create `test.html`:

```javascript
<h1>I am.....</h1>
<div id="profile_facebook">{{whoami}}</div>
<a href="#/">Back</a>
```

`test.html` pretty much exists to show you what happens when you navigate to another page after logging in. In our initial code, we said that if a user is not logged in, then redirect them back to the home page.

---

### Closing Arguments

As we get further and further into the client-side of things, and less into server-side, being able to add auth to your apps becomes important. We've got a few projects in the works right now that use the `Flybase-auth` library to handle user registration and logging in, and it lets you manage how you want users handled on your end as well.

As for why we decided to fork the `Hello.js` library, we love the library ourselves, but we wanted to make it easier to integrate into your Flybase apps, hence the fork so that you can dive into it quickly, especially when it comes to using it with Angular web apps.
