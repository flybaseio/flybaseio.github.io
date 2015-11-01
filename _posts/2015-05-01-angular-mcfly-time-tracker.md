---
layout: "post"
title: "Build a Simple Time Tracker with Data McFly and Angular.js"
tags: 
- "code"
date: "2015-05-01 12:35:13"
image: "http://blog.datamcfly.com/images/posts/time.jpg"
ogtype: "article"
bodyclass: "post"
---

<div class="box-wrap"><div class="box">
	<img src="/images/posts/time.jpg" />
</div></div>

If you've ever worked on a project, then time tracking is an important part of knowing where you've spend your time.

In this tutorial, we are going to use the [Angular McFly](https://github.com/DataMcFly/angularmcfly) helper to build a simple, but handy time tracker in Angular.js and using Data McFly as the backend.

This idea for this tuturial was based on the handy [tutorial](https://scotch.io/tutorials/build-a-time-tracker-with-laravel-5-and-angularjs-part-1) that was built over at Scotch.IO for using Angular.js and Laravel for time tracking. That tutorial is great, but I wanted to showcase how you could build a similar time tracker without needing to build in backend handling.

## Ingredients

All you need is a [Data McFly](http://datamcfly.com) account. This entire app will be built using angular.js.

## Getting Started

To start, clone the [repo](https://github.com/DataMcFly/time-tracker) for this article:

```javascript
git clone https://github.com/DataMcFly/time-tracker.git
```

Now you'll want to run bower and install our libraries:

```javascript
bower install angular angular-bootstrap angular-resource bootstrap moment datamcfly angularmcfly
```

This will create a `bower_components` folder containing the libraries we want to use.

Next, we want to set up our `index.html` file which is in the repo:

```javascript
<!doctype html>
<html>
    <head>
        <title>Time Tracker</title>
        <link rel="stylesheet" href="css/style.css">
        <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.css">
    </head>
    <body ng-app="timeTracker" ng-controller="TimeEntry as vm">

        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <div class="navbar-header">
                    <a class="navbar-brand" href="#">Time Tracker</a>
                </div>
            </div>
            <div class="container-fluid time-entry">
                <div class="timepicker">
                    <span class="timepicker-title label label-primary">Clock In</span><timepicker ng-model="vm.clockIn" hour-step="1" minute-step="1" show-meridian="true"></timepicker> 
                </div>
                <div class="timepicker">
                    <span class="timepicker-title label label-primary">Clock Out</span><timepicker ng-model="vm.clockOut" hour-step="1" minute-step="1" show-meridian="true"></timepicker>
                </div>
                <div class="time-entry-comment">                
                    <form class="navbar-form">
                        <input class="form-control" ng-model="vm.comment" placeholder="Enter a comment"></input>
                        <button class="btn btn-primary" ng-click="vm.logNewTime()">Log Time</button>
                    </form>
                </div>    
            </div>
        </nav>

        <div class="container">
            <div class="col-sm-8">

                <div class="well vm" ng-repeat="time in vm.timeentries">
                    <div class="row">
                        <div class="col-sm-8">
                            <h4><i class="glyphicon glyphicon-user"></i> {{time.user_firstname}} {{time.user_lastname}}</h4>
                            <p>{{time.comment}}</p>                  
                        </div>
                        <div class="col-sm-4 time-numbers">
                            <h4><i class="glyphicon glyphicon-calendar"></i> {{time.end_time | date:'mediumDate'}}</h4>
                            <h2><span class="label label-primary" ng-show="time.loggedTime.duration._data.hours > 0">{{time.loggedTime.duration._data.hours}} hour<span ng-show="time.loggedTime.duration._data.hours > 1">s</span></span></h2>
                            <h4><span class="label label-default">{{time.loggedTime.duration._data.minutes}} minutes</span></h4>
                        </div>
                    </div>
                </div>

            </div>

            <div class="col-sm-4">
                <div class="well time-numbers">
                    <h1><i class="glyphicon glyphicon-time"></i> Total Time</h1>
                    <h1><span class="label label-primary">{{vm.totalTime.hours}} hours</span></h1>
                    <h3><span class="label label-default">{{vm.totalTime.minutes}} minutes</span></h3>
                </div>
            </div>
        </div>  
    </body>

    <!-- Application Dependencies -->
    <script type="text/javascript" src="bower_components/angular/angular.js"></script>
    <script type="text/javascript" src="bower_components/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="bower_components/bootstrap/dist/js/bootstrap.js"></script>
    <script type="text/javascript" src="bower_components/angular-bootstrap/ui-bootstrap.js"></script>
    <script type="text/javascript" src="bower_components/angular-bootstrap/ui-bootstrap-tpls.js"></script>
    <script type="text/javascript" src="bower_components/angular-resource/angular-resource.js"></script>
    <script type="text/javascript" src="bower_components/moment/moment.js"></script>

	<!-- Data McFly -->
    <script type="text/javascript" src="bower_components/datamcfly/DataMcFly.js"></script>

	<!-- AngularMcFly -->
	<script src="bower_components/angularmcfly/angularmcfly.js"></script>
	
    <!-- Application Scripts -->
    <script type="text/javascript" src="scripts/app.js"></script>
</html>
```

Finally, let's set up our `scripts/app.js` file:

```javascript
(function() {
	'use strict';
	var app = angular.module('timeTracker', [ 'ngResource', 'ui.bootstrap', 'datamcflyResourceHttp' ])
		.constant('DATAMCFLY_CONFIG',{API_KEY:'your key goes here', DB_NAME:'your app name goes here'})
		.factory('time', time)
		.controller('TimeEntry', TimeEntry);

	function time( $datamcflyResourceHttp ) {
		var Time = $datamcflyResourceHttp('time');
		
		function getTime() {
			var results = Time.all();
			angular.forEach(results, function(result) {
				result.loggedTime = getTimeDiff(result.start_time, result.end_time);
			});
			return results;
		}
		
		function datamcfly(){
			return Time.datamcfly();
		}
		
		function getTimeDiff(start, end) {
			var diff = moment(end).diff(moment(start));
			var duration = moment.duration(diff);
			return {
				duration: duration
			}
		}
		
		function getTotalTime(timeentries) {
			var totalMilliseconds = 0;
			angular.forEach(timeentries, function(key) {
				key.loggedTime = getTimeDiff(key.start_time, key.end_time)
				totalMilliseconds += key.loggedTime.duration._milliseconds;
			});
			return {
				hours: moment.duration(totalMilliseconds).hours(),
				minutes: moment.duration(totalMilliseconds).minutes()
			}
		}

		return {
			datamcfly: datamcfly,
			getTime: getTime,
			getTimeDiff: getTimeDiff,
			getTotalTime: getTotalTime,
		}
	}
	
	
	function TimeEntry(time) {
	
		var vm = this;
		
		// Initialize the clockIn and clockOut times to the current time.
		vm.clockIn = moment();
		vm.clockOut = moment();

		vm.timeentries = [];
		
		vm.totalTime = {};
		
		time.getTime().then(function(results) {
			vm.timeentries = results;
			updateTotalTime(vm.timeentries);
		});
		
		function updateTotalTime(timeentries) {
			vm.totalTime = time.getTotalTime(timeentries);
		}
		
		vm.logNewTime = function() {

			if(vm.clockOut < vm.clockIn) {
				alert("You can't clock out before you clock in!");
				return;
			}
			time.datamcfly().push({
				"user_id":1,
				"user_firstname":"Roger",
				"user_lastname":"Stringer",
				"start_time":vm.clockIn,
				"end_time":vm.clockOut,
				"project_id":1,
				"project_title":"Project 1",
				"loggedTime": time.getTimeDiff(vm.clockIn, vm.clockOut),
				"comment":vm.comment
			}, function(data){
				console.log('Insert Documents : ', data);
			});
			updateTotalTime(vm.timeentries);
			
			vm.comment = "";
		}
	
		time.datamcfly().on('added', function( data ){
			time.getTime().then(function(results) {
				vm.timeentries = results;
				updateTotalTime(vm.timeentries);
			});
		});

		time.datamcfly().on('changed', function( data ){
			time.getTime().then(function(results) {
				vm.timeentries = results;
				updateTotalTime(vm.timeentries);
			});
		});

		time.datamcfly().on('removed', function( data ){
			time.getTime().then(function(results) {
				vm.timeentries = results;
				updateTotalTime(vm.timeentries);
			});
		});	
	}
})();
```

This setup is a little different than most of our Angular McFly apps simply because I wanted to base it more on the [Time Tracker](https://scotch.io/tutorials/build-a-time-tracker-with-laravel-5-and-angularjs-part-1) the guys over at Scotch built as an example, so we didn't change too much of the code from what they set up.

This can be adapted pretty easily to allow user logins, etc and I'll post a follow up next week to show how to do that pretty easily.