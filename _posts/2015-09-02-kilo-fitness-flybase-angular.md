---
layout: "post"
title: "Cloning getkilo.com with Flybase and Angular.js"
date: "2015-09-02 18:00"
tags: 
- "code"
image: "http://blog.flybase.io/images/posts/fitness.jpg"
ogtype: "article"
bodyclass: "post"
---

<div><div class="image splash">
	<img src="/images/posts/fitness.jpg" />
</div></div>

[Jonathan Stark](https://jonathanstark.com), a friend of Flybase, built a website called [getkilo.com](http://getkilo.com) which is pretty handy, it lets you enter your daily calories and exercise for tracking.

I talked with him back in June when we were both at [Future Insights Live](https://futureinsightslive.com/las-vegas-2015/) about building a Flybase version of the site, and today we're going to.

We'll build this using the [client-side only](https://github.com/flybaseio/fit-stack/tree/client-side) branch of the [FIT Stack](https://github.com/flybaseio/fit-stack/blob/master/README.md), so it will be built using Flybase and Angular.js.

The FIT Stack is our _pre-built_ `seed` app for building rapid MVPs with. Using Flybase, Angular.js (for the _Interface_) and Node.js for the micro (or _Thin_) services if needed. 

With Flybase, Angular.js, and the [Angular Fly](https://github.com/flybaseio/angularfly) helper library, it's possible to build pretty advanced apps easily

With the FIT stack working well, we can build just about any type of app quickly, so that seemed like the perfect "fit" to make the Flybase version of Kilo.

We're going to keep this simple, but it can easily be extended to use other APIs for tracking, add in some gamification so you can add friends and see how they are doing and let them see how you are doing, etc.

Why rewrite Kilo? Well, I've been using Kilo myself since Jonathan released it last year, and I love it precisely for being simplistic, but I also always wanted to set it up to use Flybase instead.

You can find the [repo here](https://github.com/flybaseio/getkilo) and you can see the demo version of the site [here](http://kilo.flybase.io/), hosted on Github Pages.

## Ingredients

All you need is a [Flybase](http://flybase.io) account. This entire app will be built using angular.js.

### Start Cooking

To start, clone the `client-side`  only branch of the fit stack repo into a new folder:

{% highlight javascript %}{% raw %}
git clone https://github.com/flybaseio/fit-stack -b client-side --single-branch getkilo
{% endraw %}{% endhighlight %}
This will create a new folder called `getkilo`,  mirroring the content in the `client-side` branch of the FIT stack repo.

You'll need bower installed if you haven't already installed it:

{% highlight javascript %}{% raw %}
npm install -g bower serve
{% endraw %}{% endhighlight %}

Most of our modules are pre-built, one change we want is we want to add `moment` to our bower.json file:

{% highlight javascript %}{% raw %}
{
  "name": "fit-stack",
  "version": "1.0.0",
  "dependencies": {
    "angular": "latest",
    "angular-loader": "latest",
    "angular-route": "latest",
    "angularfly": "latest",
    "bootstrap": "latest",
    "flybase": "~1.4.1",
    "moment": "~2.10.6"
  },
  "resolutions": {
    "flybase": "~1.4.1",
    "angular": "1.4.5"
  }
}
{% endraw %}{% endhighlight %}

Now you'll want to run bower and install our libraries:

{% highlight javascript %}{% raw %}
bower install
{% endraw %}{% endhighlight %}

This will install our `bower_components` inside the `app/` folder. This is the main folder we'll use.

Before we get started, let's delete the folders we don't need.

If you open the `app/` folder, you'll see folders for `home`, `account` and `projects`.

Delete the `projects` folder, but keep the other folders.

### 1 - The skeleton, the brain, and everything else.

We need to start with our `index.html` file, this is the skeleton of our app. Open `index.html` in a text editor and copy the following file:

{% highlight html %}{% raw %}
<!doctype html>
<html lang="en" ng-app="myApp">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>Kilo is a calorie tracker built for speed, simplicity, and freedom.</title>
	<meta name="description" content="Kilo is a calorie tracker built for speed, simplicity, and freedom.">
	<meta name="HandheldFriendly" content="True">
	<meta name="MobileOptimized" content="320">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<base ng-href="/">
	
	<!-- CSS -->
	<link ng-href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet">
	<link ng-href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet">
	<link rel="stylesheet" ng-href="css/app.css"> <!-- custom styles -->

	<!-- JS -->
	<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
	<script src="bower_components/angular-route/angular-route.js"></script>
	<script src="components/forge.min.js"></script>
</head>
<body ng-cloak style="box-shadow--6dp">
	<div class="container">
		<div ng-view></div>
	</div>
	<!-- JS -->
	<script src="bower_components/moment/min/moment.min.js"></script>
	<script src="bower_components/flybase/flybase.js"></script>
	<script src="bower_components/angularfly/angularfly.js"></script>
		
	<!-- ANGULAR STUFF -->
	<script src="config.js"></script>
<!-- SERVICES -->
	<script src="components/directives.js"></script>
	<script src="components/models.js"></script>
	<script src="components/loginMcFly.js"></script>
<!-- CONTROLLERS -->
	<script src="home/home.js"></script>
	<script src="account/account.js"></script>
	<script src="food/food.js"></script>
	<script src="exercise/exercise.js"></script>
	<script src="report/report.js"></script>
	<script src="app.js"></script>
</body>
</html>
{% endraw %}{% endhighlight %}

Our `index.html` file gives us a good starting point, now open `config.js` and add your Flybase API Key and app name:

{% highlight javascript %}{% raw %}
'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp.config', [])
.constant('version', '1.0.1')
.constant('loginRedirectPath', '/login')
.constant('FLYBASE_CONFIG',{
	API_KEY:'YOUR-API-KEY', 
	DB_NAME:'kilo'
})
// double check that the app has been configured before running it and blowing up space and time
.run(['FLYBASE_CONFIG', '$timeout', function(FLYBASE_CONFIG, $timeout) {
	if( FLYBASE_CONFIG.API_KEY.match('YOUR-API-KEY') ) {
		angular.element(document.body).html('<div class="container"><h1>Please configure <code>app/config.js</code> before running!</h1></div>');
		$timeout(function() {
			angular.element(document.body).removeClass('hide');
		}, 250);
	}
}]);
{% endraw %}{% endhighlight %}

Until you replace `YOUR-API-KEY` with your actual API Key, your app won't run.

Now open `app.js` and copy the following code in:

{% highlight javascript %}{% raw %}
'use strict';

angular.module('myApp', [
	'myApp.config',
	'myApp.models',
	"UserCtrl",
	'MainCtrl', 
	'FoodCtrl', 
	'ExerciseCtrl',
	'ReportCtrl',
	'myApp.directives'
]);

String.prototype.toHex = function() {
    var buffer = forge.util.createBuffer(this.toString());
    return buffer.toHex();
}

String.prototype.toSHA1 = function() {
    var md = forge.md.sha1.create();
    md.update(this);
    return md.digest().toHex();
}

String.prototype.pad = function(){
	var n = parseInt( this );
	return (n < 10) ? ("0" + n) : n
}
Number.prototype.pad = function(){
	var n = parseInt( this );
	return (n < 10) ? ("0" + n) : n
}

function randomBackground(){
	var numLow = 1;
	var numHigh = 14;
	var adjustedHigh = (parseFloat(numHigh) - parseFloat(numLow)) + 1;
	var numRand = Math.floor(Math.random()*adjustedHigh) + parseFloat(numLow);
	numRand = numRand > 9 ? "" + numRand : "0" + numRand;
	$("html").css("background-image", "url('https://momentumdash.com/backgrounds/" + numRand + ".jpg')");
}
randomBackground();

(function(d,w){
	if ((('ontouchstart' in w) || w.DocumentTouch && d instanceof DocumentTouch)) {
		d.documentElement.className += ' touch';
	} else {
		d.documentElement.className += ' no-touch';
	}
})(document, window);
{% endraw %}{% endhighlight %}

Just as how `index.html` is your skeleton, `app.js` is your brains, it tells our app how to get started.

One function you may notice is the `randomBackground()` function, this generates a random background image for your site using the fantastic service at [momentumdash.com](https://momentumdash.com).

Now, we need to build our models, open `components/models.js` and add the following code:

{% highlight javascript %}{% raw %}
angular.module('myApp.models', ['ngRoute', 'flybaseResourceHttp', 'loginMcFly'])
.factory('$localstorage', ['$window', function($window) {
	return {
		set: function(key, value) {
			$window.localStorage[key] = value;
		},
		get: function(key) {
			return $window.localStorage[key] || '';
		},
		remove: function(key){
			delete $window.localStorage[key];
		},
		setObject: function(key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		},
		getObject: function(key) {
			return JSON.parse($window.localStorage[key] || '{}');
		}
	}
}])
.factory("$cipherFactory", function() {
	return {
		encrypt: function(message, password) {
			var salt = forge.random.getBytesSync(128);
			var key = forge.pkcs5.pbkdf2(password, salt, 4, 16);
			var iv = forge.random.getBytesSync(16);
			var cipher = forge.cipher.createCipher('AES-CBC', key);
			cipher.start({iv: iv});
			cipher.update(forge.util.createBuffer(message));
			cipher.finish();
			var cipherText = forge.util.encode64(cipher.output.getBytes());
			return {cipher_text: cipherText, salt: forge.util.encode64(salt), iv: forge.util.encode64(iv)};
		},
		decrypt: function(cipherText, password, salt, iv, options) {
			var key = forge.pkcs5.pbkdf2(password, forge.util.decode64(salt), 4, 16);
			var decipher = forge.cipher.createDecipher('AES-CBC', key);
			decipher.start({iv: forge.util.decode64(iv)});
			decipher.update(forge.util.createBuffer(forge.util.decode64(cipherText)));
			decipher.finish();
			if(options !== undefined && options.hasOwnProperty("output") && options.output === "hex") {
				return decipher.output.toHex();
			} else {
				return decipher.output.toString();
			}
		}
	};
})
.factory('Food', function ($flybaseResourceHttp) {
	return $flybaseResourceHttp('food');
})
.factory('Exercise', function ($flybaseResourceHttp) {
	return $flybaseResourceHttp('exercise');
})
.factory('User', function ($flybaseResourceHttp) {
	return $flybaseResourceHttp('_users');
})
.factory('Login', function ( $loginMcFly ) {
	return $loginMcFly();
});
{% endraw %}{% endhighlight %}

The `$localstorage` and `$cipherFactory` factory factory objects are used for account related purposes, the other four factory objects are:

- `Food`, which is a reference to our `food` collection in our flybase app.
- `Exercise`, which is a reference to our `exercise` collection in our flybase app.
- `User`, which is a reference to our `_users` collection in our flybase app
- `Login`, which actually is using our `$loginMcFly` resource to handle logging in, and registration.

Now, we can get started with building our app.

### 2 - the dashboard.

Open `home/home.js` in a text editor:

{% highlight javascript %}{% raw %}
angular.module('MainCtrl', ['ngRoute'])
.controller('MainController', function($scope,$timeout,$location,foods,exercises,Food,Exercise,login,me) {
	$scope.currentUser = me;
	
	$scope.today = moment().format("YYYY-MM-DD"); 

	$scope.todayverbose = moment($scope.today).format("dddd, MMMM Do YYYY");
	$scope.todayshort = moment($scope.today).format("ddd, MMM Do");

	$scope.daybefore = moment($scope.today).subtract(1, 'day').format("YYYY-MM-DD");
	$scope.dayafter = moment($scope.today).add(1, 'day').format("YYYY-MM-DD");
	
	if( !login.isLoggedIn() ){
		console.log("bye");
		$location.path('/login');
	}
	$scope.token = login._getToken();
	
	$scope.foods = foods;
	$scope.exercises = exercises;

	$scope.activity = [];
	$scope.cUsed = 0;
	for( var i in $scope.foods ){
		var food = $scope.foods[ i ];
		$scope.cUsed += food.calories;
		$scope.activity.push({
			type:"Food",
			name:food.name,
			calories:food.calories,
			time:food.time,
			date:food.date
		});
	}
	$scope.cBurned = 0;
	for( var i in $scope.exercises ){
		var exercise = $scope.exercises[ i ];
		$scope.cBurned += exercise.calories;
		$scope.activity.push({
			type:"Exercise",
			name:exercise.name,
			calories:"-"+exercise.calories,
			time:exercise.time,
			date:exercise.date
		});
	}
	$scope.cLeft = (2000 - $scope.cUsed) + $scope.cBurned;

	var Ref = Food.flybase();

})
.controller('ViewController', function($scope,$timeout,$location,$route,foods,exercises,Food,Exercise,login,me) {
	$scope.currentUser = me;

	$scope.today = $route.current.params.date;	

	$scope.todayverbose = moment($scope.today).format("dddd, MMMM Do YYYY");
	$scope.todayshort = moment($scope.today).format("ddd, MMM Do");

	$scope.daybefore = moment($scope.today).subtract(1, 'day').format("YYYY-MM-DD");
	$scope.dayafter = moment($scope.today).add(1, 'day').format("YYYY-MM-DD");
	
	if( !login.isLoggedIn() ){
		console.log("bye");
		$location.path('/login');
	}
	$scope.token = login._getToken();
	
	$scope.foods = foods;
	$scope.exercises = exercises;

	$scope.activity = [];
	$scope.cUsed = 0;
	for( var i in $scope.foods ){
		var food = $scope.foods[ i ];
		$scope.cUsed += food.calories;
		$scope.activity.push({
			type:"Food",
			name:food.name,
			calories:food.calories,
			time:food.time,
			date:food.date
		});
	}
	$scope.cBurned = 0;
	for( var i in $scope.exercises ){
		var exercise = $scope.exercises[ i ];
		$scope.cBurned += exercise.calories;
		$scope.activity.push({
			type:"Exercise",
			name:exercise.name,
			calories:"-"+exercise.calories,
			time:exercise.time,
			date:exercise.date
		});
	}

	$scope.cLeft = (2000 - $scope.cUsed) + $scope.cBurned;

	var Ref = Food.flybase();
}).config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider.when('/dashboard', {
		templateUrl: 'home/home.html',
		controller: 'MainController',
		resolve:{
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			},
			foods:function(Food, Login){
				var today = moment().format("YYYY-MM-DD"); 
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					return Food.query({"$and":[{"userId":token},{"date":today}]});
				}else{
					return Food.all();
				}
			},
			exercises:function(Exercise, Login){
				date = new Date();
				var today = date.getFullYear() + '-' + ( date.getMonth()+1 ).pad() + '-' + ( date.getDate() ).pad();
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					return Exercise.query({"$and":[{"userId":token},{"date":today}]});
				}else{
					return Exercise.all();
				}
			},
		}
	}).when('/view/:date', {
		templateUrl: 'home/home.html',
		controller: 'ViewController',
		resolve:{
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			},
			foods:function(Food, Login, $route){
				var today = $route.current.params.date;
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					return Food.query({"$and":[{"userId":token},{"date":today}]});
				}else{
					return Food.all();
				}
			},
			exercises:function(Exercise, Login, $route){
				var today = $route.current.params.date;
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					return Exercise.query({"$and":[{"userId":token},{"date":today}]});
				}else{
					return Exercise.all();
				}
			},
		}
	}).when('/more', {
		templateUrl: 'home/more.html'
	});
}]);
{% endraw %}{% endhighlight %}

This is the file that tells our `#/dashboard` route how to behave, and also handles displaying our daily reports.

It works by grabbing all food and exercise entries for the logged in user on the date being viewed and calculating calories left that day, as well as also presenting a `more options` page.

Now, let's set up our dashboard interface, open `home/home.html`:

{% highlight html %}{% raw %}
<div class=" text-center">
	<ul class="list-unstyled list-inline">
		<li>
			<a class="btn btn-default" ng-href="#/view/{{daybefore}}">« Prev Date</a>
		</li>
		<li>
			<h5>{{todayshort}}</h5>
		</li>
		<li>
			<a class="btn btn-default" ng-href="#/view/{{dayafter}}">Next Date »</a>
		</li>
	</ul>
</div>
<div class="text-center">
	<h1 class="calories">{{cLeft}}</h1>
	<p class="clabel">calories left</p>
</div>
<div class="well text-center">
	<a class="btn btn-default" ng-href="#/food/new">New food</a>
	<a class="btn btn-default" ng-href="#/exercise/new">New exercise</a>
	<a class="btn btn-default" ng-href="#/more">More Options</a>
</div>
<div ng-hide="activity.length > 0">
	<p>Looks like you haven't made any entries yet for <strong>{{todayverbose}}</strong>. Let's change that!</p>
	
	<p>You can add a food by pressing the New Food button, add an exercise by pressing the New Exercise button, or switch to a different date with the Next/Prev buttons.</p>
</div>
<div ng-show="activity.length > 0">
	<table class="table table-striped table-bordered table-hover">
	<thead>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Calories</th>
		<th>Time</th>
	</tr>
	</thead>
	<tbody>
	<tr ng-repeat="food in activity | orderBy:'+time'">
		<td>{{food.type}}</td>
		<td>
			{{food.name}}
		</td>
		<td>{{food.calories}}
		<td>
			{{food.time}}
		</td>
	</tr>
	</tbody> 
	</table>
	<hr />
</div>
{% endraw %}{% endhighlight %}

This page is used both by our `#/dashboard` route and our `#/view/DATE` route since it looks the same, the only difference is the actual date displayed.

Finally, let's set up our `#/more` route, create a new file called `home/more.html`:

{% highlight javascript %}{% raw %}
<a class="btn btn-primary" href="#/dashboard">Home</a>
<div class="list-group">
	<a class="list-group-item" ng-href="#/report">Daily Totals</a>
	<a class="list-group-item" ng-href="#/food">Food History</a>
	<a class="list-group-item" ng-href="#/exercise">Exercises History</a>
	<a class="list-group-item" ng-href="#/logout">Logout</a>
</div>
{% endraw %}{% endhighlight %}

This page is our `more options` page that a user can push to view food history, exercise history, get a daily report, edit settings and logout.

### 3 - Food tracking

Create a new folder called `food`, and inside this folder, we want to create three files:

#### 1. `food/food.js`:

{% highlight javascript %}{% raw %}
angular.module('FoodCtrl', ['ngRoute', 'flybaseResourceHttp', 'loginMcFly'])
/* Controllers */
.controller('FoodListCtrl', function($scope, $rootScope, $timeout, $location, $route, foods,login,Food,me) {
	if( !login.isLoggedIn() ){
		console.log("bye");
//		$location.path('/login');
	}
	$scope.foods = foods;
	var foodsCopy = angular.copy( $scope.foods );
	var Ref = Food.flybase();
})
.controller('FoodViewCtrl', function($scope, $location, food,Login) {
	var login = new Login();
	if( !login.isLoggedIn() ){
		console.log("bye");
		$location.path('/login');
	}
	$scope.food = food;
})
.controller('FoodFormCtrl', function($scope, $location, $window, food,foodlist,Login,me) {
	var login = new Login();
	if( !login.isLoggedIn() ){
		console.log("bye");
		$location.path('/login');
	}
	$scope.token = login._getToken();
	$scope.foodlist = foodlist;

	var foodCopy = angular.copy(food);

	$scope.today = moment().format("YYYY-MM-DD"); 

	$scope.todayverbose = moment($scope.today).format("dddd, MMMM Do YYYY");
	$scope.todayshort = moment($scope.today).format("ddd, MMM Do");

	$scope.daybefore = moment($scope.today).subtract(1, 'day').format("YYYY-MM-DD");
	$scope.dayafter = moment($scope.today).add(1, 'day').format("YYYY-MM-DD");

	$scope.food = food;
	$scope.food.date = new Date( moment($scope.food.date).add(1, 'day').format("YYYY-MM-DD") );
	
	$scope.save = function(){
		$scope.food.userId = $scope.token;
		$scope.food.date = moment( $scope.food.date ).format("YYYY-MM-DD"); 

		$scope.food.$saveOrUpdate().then(function(returnData){
			$location.path('/food');
		}, function(error) {
			throw new Error('Sth went wrong...');
		});
	};

	$scope.remove = function() {
		if( confirm('Are you sure you want to delete this record?') ){
			$scope.food.$remove(function() {
				$location.path('/food');
			}, function() {
				throw new Error('Sth went wrong...');
			});
			$location.path('/food');
		}
	};

	$scope.hasChanges = function(){
		return !angular.equals($scope.food, foodCopy);
	};
})
.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider.when('/food', {
		templateUrl: 'food/list.html?a=1',
		controller: 'FoodListCtrl',
		resolve:{
			foods:function(Food, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					return Food.query({"userId":token});
				}else{
					return Food.all();
				}
			},
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			}
		}
	}).when('/food/edit/:id', {
		templateUrl: 'food/form.html?a=1',
		controller: 'FoodFormCtrl',
		resolve:{
			food:function(Food, $route){
				var p = Food.getById($route.current.params.id);
				return p;
			},
			foodlist:function(Food, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					return Food.query({"userId":token});
				}else{
					return Food.all();
				}
			},
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			}
		}
	}).when('/food/new', {
		templateUrl: 'food/form.html?a=1',
		controller:'FoodFormCtrl', 
		resolve:{
			food:function(Food){
				return new Food();
			},
			foodlist:function(Food, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					return Food.query({"userId":token});
				}else{
					return Food.all();
				}
			},
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			}
		}
	});	
}]);
{% endraw %}{% endhighlight %}

#### 2. `food/list.html`:

{% highlight html %}{% raw %}
<a class="btn btn-primary" href="#/dashboard">Home</a>
<h3>Food list</h3>
<table class="table table-striped table-bordered table-hover">
<thead>
<tr>
	<th>Date</th>
	<th>Time</th>
	<th>Name</th>
	<th>Calories</th>
	<th></th>
</tr>
</thead>
<tbody>
<tr ng-repeat="food in foods" ng-click="edit(food)">
	<td>
		{{food.date}}
	</td>
	<td>
		{{food.time}}
	</td>
	<td>
		{{food.name}}
	</td>
	<td>{{food.calories}}
	<td>
		<a class="btn btn-primary" ng-href="#/food/edit/{{food.$id()}}">Edit</a>
	</td>
</tr>
</tbody> 
</table>
<div class="well">
	<a class="btn btn-default" ng-href="#/food/new">New food</a>
</div>
{% endraw %}{% endhighlight %}

#### 3. `food/form.html`:

{% highlight html %}{% raw %}
<a class="btn btn-primary" href="#/dashboard">Home</a>
<h3 ng-show="food._id">Edit "{{food.name}}"</h3>
<h3 ng-hide="food._id">Add Food</h3>
<div class="alert alert-success" role="alert" ng-show="notifyme">
	<p>{{notifyme}}</p>
</div>
<form name="form">
	<div class="form-group" ng-show="foodlist.length > 0">
		<label>Description</label>
		<input type="text" ng-model="food.name" class="form-control" list="descriptions" placeholder="e.g., 2 slices of toast" autocomplete="off" autocorrect="off" autofocus>
		<datalist id="descriptions" >
			<option ng-repeat="food in foodlist" value="{{food.name}}" />
		</datalist>
	</div>
	<div class="form-group" ng-hide="foodlist.length > 0">
		<label>Description</label>
		<input type="text" ng-model="food.name" class="form-control" placeholder="e.g., 2 slices of toast" autocomplete="off" autocorrect="off" autofocus>
	</div>
	<div class="form-group">
		<label>Calories</label>
		<input type="number" ng-model="food.calories" class="form-control">
	</div>
	<div class="form-group">
		<label>Date</label>
		<input type="date" ng-model="food.date" class="form-control">
	</div>
	<div class="form-group">
		<label>Time</label>
		<input type="text" ng-model="food.time" class="form-control">
	</div>
	<div class="well">
		<a class="btn btn-warning" ng-href="#/food">Go Back</a>
		<a class="btn btn-primary" ng-click="save()" ng-disabled="!hasChanges()||form.$invalid">Save</a>
		<a class="btn btn-danger" ng-click="remove()" ng-disabled="!food.$id()">Remove</a>
	</div>
</form>
{% endraw %}{% endhighlight %}

The food form will also perform a query for any previously entered entries and display the food as options in a datalist, this is handy for not having to remember every entry.

### 4 - Exercise tracking

Create a new folder called `exercise`, and inside this folder, we want to create three files:

#### 1. `exercise/exercise.js`:

{% highlight javascript %}{% raw %}
angular.module('ExerciseCtrl', ['ngRoute', 'flybaseResourceHttp', 'loginMcFly'])
/* Controllers */
.controller('ExerciseListCtrl', function($scope, $rootScope, $timeout, $location, $route, exercises,login,Exercise,me) {
	if( !login.isLoggedIn() ){
		console.log("bye");
//		$location.path('/login');
	}
	$scope.exercises = exercises;
	var exercisesCopy = angular.copy( $scope.exercises );
	var Ref = Exercise.flybase();
})
.controller('ExerciseViewCtrl', function($scope, $location, exercise,Login) {
	var login = new Login();
	if( !login.isLoggedIn() ){
		console.log("bye");
		$location.path('/login');
	}
	$scope.exercise = exercise;
})
.controller('ExerciseFormCtrl', function($scope, $location, $window, exercise,Login,me) {
	var login = new Login();
	if( !login.isLoggedIn() ){
		console.log("bye");
		$location.path('/login');
	}
	$scope.token = login._getToken();

	var exerciseCopy = angular.copy(exercise);


	$scope.today = moment().format("YYYY-MM-DD"); 

	$scope.todayverbose = moment($scope.today).format("dddd, MMMM Do YYYY");
	$scope.todayshort = moment($scope.today).format("ddd, MMM Do");

	$scope.daybefore = moment($scope.today).subtract(1, 'day').format("YYYY-MM-DD");
	$scope.dayafter = moment($scope.today).add(1, 'day').format("YYYY-MM-DD");

	$scope.exercise = exercise;
	$scope.exercise.date = new Date( moment($scope.exercise.date).add(1, 'day').format("YYYY-MM-DD") );

	$scope.save = function(){
		$scope.exercise.userId = $scope.token;
		$scope.exercise.date = moment( $scope.exercise.date ).format("YYYY-MM-DD"); 

		$scope.exercise.$saveOrUpdate().then(function(returnData){
			$location.path('/exercise');
		}, function(error) {
			throw new Error('Sth went wrong...');
		});
	};

	$scope.remove = function() {
		$scope.exercise.$remove(function() {
			$location.path('/exercise');
		}, function() {
			throw new Error('Sth went wrong...');
		});
	};

	$scope.hasChanges = function(){
		return !angular.equals($scope.exercise, exerciseCopy);
	};
})
.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider.when('/exercise', {
		templateUrl: 'exercise/list.html?a=1',
		controller: 'ExerciseListCtrl',
		resolve:{
			exercises:function(Exercise, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					return Exercise.query({"userId":token});
				}else{
					return Exercise.all();
				}
			},
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			}
		}
	}).when('/exercise/edit/:id', {
		templateUrl: 'exercise/form.html?a=1',
		controller: 'ExerciseFormCtrl',
		resolve:{
			exercise:function(Exercise, $route){
				var p = Exercise.getById($route.current.params.id);
				return p;
			},
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			}
		}
	}).when('/exercise/new', {
		templateUrl: 'exercise/form.html?a=1',
		controller:'ExerciseFormCtrl', 
		resolve:{
			exercise:function(Exercise){
				return new Exercise();
			},
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			}
		}
	});	
}]);
{% endraw %}{% endhighlight %}

#### 2. `exercise/list.html`:

{% highlight html %}{% raw %}
<a class="btn btn-primary" href="#/dashboard">Home</a>
<h3>Exercise list</h3>
<table class="table table-striped table-bordered table-hover">
<thead>
<tr>
	<th>Date</th>
	<th>Time</th>
	<th>Name</th>
	<th>Calories</th>
	<th></th>
</tr>
</thead>
<tbody>
<tr ng-repeat="exercise in exercises" ng-click="edit(exercise)">
	<td>
		{{exercise.date}}
	</td>
	<td>
		{{exercise.time}}
	</td>
	<td>
		{{exercise.name}}
	</td>
	<td>{{exercise.calories}}
	<td>
		<a class="btn btn-primary" ng-href="#/exercise/edit/{{exercise.$id()}}">Edit</a>
	</td>
</tr>
</tbody> 
</table>
<div class="well">
	<a class="btn btn-default" ng-href="#/exercise/new">New exercise</a>
</div>
{% endraw %}{% endhighlight %}

#### 3. `exercise/form.html`:

{% highlight html %}{% raw %}
<a class="btn btn-primary" href="#/dashboard">Home</a>
<h3 ng-show="exercise._id">Edit "{{exercise.name}}"</h3>
<h3 ng-hide="exercise._id">Add Exercise</h3>
<div class="alert alert-success" role="alert" ng-show="notifyme">
	<p>{{notifyme}}</p>
</div>
<form name="form">
	<div class="form-group">
		<label>Description</label>
		<input type="text" ng-model="exercise.name" class="form-control">
	</div>
	<div class="form-group">
		<label>Calories</label>
		<input type="number" ng-model="exercise.calories" class="form-control">
	</div>
	<div class="form-group">
		<label>Date</label>
		<input type="date" ng-model="exercise.date" class="form-control" value="{{today}}" />
	</div>
	<div class="form-group">
		<label>Time</label>
		<input type="text" ng-model="exercise.time" class="form-control">
	</div>
	<div class="well">
		<a class="btn btn-warning" ng-href="#/exercise">Go Back</a>
		<a class="btn btn-primary" ng-click="save()" ng-disabled="!hasChanges()||form.$invalid">Save</a>
		<a class="btn btn-danger" ng-click="remove()" ng-disabled="!exercise.$id()">Remove</a>
	</div>
</form>
{% endraw %}{% endhighlight %}

The exercise section may look similar to the food section, this is because they are pretty similar in form and function.

### 5 - Daily totals

We want to create a report page that will let users view an overall total in a day to day view, so we will create a `report/` folder and create the following two files:

#### 1. `report/report.js`:

{% highlight javascript %}{% raw %}
angular.module('ReportCtrl', ['ngRoute'])
.controller('ReportController', function($scope,$timeout,$location,foods,exercises,Food,Exercise,login,me) {
	$scope.currentUser = me;
	
	if( !login.isLoggedIn() ){
		console.log("bye");
//		$location.path('/login');
	}
	$scope.token = login._getToken();
	
	$scope.foods = foods;
	$scope.exercises = exercises;

	$scope.average = 0;
	$scope.avgc = 0;

	$scope.activity = [];
	$scope.report = [];
	$scope.cUsed = 0;
	for( var i in $scope.foods ){
		var food = $scope.foods[ i ];
		$scope.cUsed += food.calories;
		$scope.activity.push({
			type:"Food",
			name:food.name,
			calories:food.calories,
			time:food.time,
			date:food.date
		});
	}
	$scope.cBurned = 0;
	for( var i in $scope.exercises ){
		var exercise = $scope.exercises[ i ];
		$scope.cBurned += exercise.calories;
		$scope.activity.push({
			type:"Exercise",
			name:exercise.name,
			calories:exercise.calories,
			time:exercise.time,
			date:exercise.date
		});
	}

	$scope.dates = [];
	for( var i in $scope.activity ){
		var row = $scope.activity[ i ];
		var date = row.date;
		if( typeof $scope.report[date] === 'undefined' ){
			$scope.report[date] = {
				date:date,
				food:0,
				exercise:0,
				total:0
			};
		}
		if( row.type == "Food" ){
			$scope.report[date].food += row.calories;
		}else{
			$scope.report[date].exercise += row.calories;
		}
		$scope.report[date].total = $scope.report[date].food - $scope.report[date].exercise;
	}
	$scope.temp = $scope.report;
	$scope.report = [];
	for( var i in $scope.temp ){
		$scope.avgc++;
		$scope.average += $scope.temp[i].total;
		$scope.report.push( $scope.temp[i] );
	}
	$scope.average = $scope.average / $scope.avgc;
	
	$scope.cLeft = (2000 - $scope.cUsed) + $scope.cBurned;
	$scope.tagline = 'To the moon and back!';	

	var Ref = Food.flybase();

})
.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider.when('/report', {
		templateUrl: 'report/report.html',
		controller: 'ReportController',
		resolve:{
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			},
			foods:function(Food, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					return Food.query({"userId":token});
				}else{
					return Food.all();
				}
			},
			exercises:function(Exercise, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					return Exercise.query({"userId":token});
				}else{
					return Exercise.all();
				}
			}
		}
	});
}]);
{% endraw %}{% endhighlight %}

#### 2. `report/report.html`:

{% highlight html %}{% raw %}
<a class="btn btn-primary" href="#/dashboard">Home</a>
<div class="text-center">
	<h4>Your daily average is {{average}} calories.</h4>
</div>
<table class="table table-striped table-bordered table-hover">
<thead>
<tr>
	<th>Date</th>
	<th>Food</th>
	<th>Exercise</th>
	<th>Total</th>
	<th>&nbsp;</th>
</tr>
</thead>
<tbody>
<tr ng-repeat="food in report | orderBy:'+date'">
	<td>{{food.date}}</td>
	<td>{{food.food}}</td>
	<td>{{food.exercise}}</td>
	<td>{{food.total}}
	<td>
		<a class="btn btn-default" ng-href="#/view/{{food.date}}">View</a>
	</td>
</tr>
</tbody> 
</table>
{% endraw %}{% endhighlight %}

We perform a query and then build an array on our food and exercises to store totals by day, then we output our array, sorted by date.

### Testing and deploying

You can test your app locally by using `serve` (which you installed with bower in the first step), go to your `app/` folder and type: 

{% highlight javascript %}{% raw %}
serve
{% endraw %}{% endhighlight %}

Now open your browser and go to `http://localhost:3000/` and you will see your kilo app.

When you are ready to deploy, you can upload this to any static web host, we used Github Pages ourselves, to do this you just have to create a `.nojekyll` file in your `app/` folder, then follow the steps:

1. Create a new Github repo and a branch called `gh-pages`
2. Upload the files in the `apps/` folder to the `gh-pages` branch of your site
3. Point the DNS of your site to your Github Pages site.

Now your site is live, and despite being a static website hosted on Github Pages, you can actually use it like any other backend-style app.

### Finishing up.

You've just used the FIT stack with Flybase and Angular.js to build a cool fitness tracking web app. You can think of ways to extend this.

You can find the [repo here](https://github.com/flybaseio/getkilo) and you can see the demo version of the site [here](http://kilo.flybase.io/), hosted on Github Pages.