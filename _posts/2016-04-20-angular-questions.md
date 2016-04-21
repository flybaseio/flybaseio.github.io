---
layout: post 
published: true 
title: "Build an Angular.js Powered Questions page with Upvotes and a Dashboard too" 
date: 2016-04-20T18:18:42.586Z 
tags:
  - code
image: "http://blog.flybase.io/images/posts/qna.jpg?20160217"
ogtype: "article"
bodyclass: "post"
---

<div class="box-wrap"><div class="box">
  <img src="/images/posts/qna.jpg?20160217" />
</div></div>

Question pages are handy, for example if you were presenting either at a conference, or online, you could use a real-time questions page to let attendees ask questions and then vote on which ones they liked better.

I decided to use Angular.js and Flybase to build this handy questions page. 

You can find the completed code [here](https://github.com/flybaseio/questions).

### Getting started

You'll want a Flybase account, so if you don't have one yet, swing [over and sign up](https://app.flybase.io/signup).

### The Questions Page

First, we want to build our questions page. This will be a single-page Angular.js app, so the frontend will consist of three files:

1. index.html
2. style.css
3. app.js

#### Build your index.html page

Create a file called `index.html`:

```javascript
<!DOCTYPE html >
<html>
<head>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.min.js"></script>
  <script src="https://cdn.flybase.io/flybase.js"></script>
  <script src="https://cdn.flybase.io/angularfly.js"></script>
  <script type="text/javascript" src="app.js"></script>
  <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,600' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body ng-app="questionApp" ng-controller="questionController">
  <div id="ask-question">
    <form ng-submit="saveQuestion(newquestion)">
      <input id="new-question" type="text" ng-model="newquestion" placeholder="Ask a question about Flybase...">
    </form>
  </div>
  <div id="questions">
    <ul style="height: {{questions.length * 2.5}}em;">
      <li ng-repeat="q in questions | orderBy:'-points'" class="question question-{{$index}}" style="top: {{$index * 2.5}}em">
        <a ahref="#" ng-click="upvoteQuestion( q._id )" class="upvote">
          <span class="upvote-arrow"></span>
          <span class="points">{{ q.points }}</span>
        </a>
        <span class="question">{{ q.question }}</span>
      </li>
    </ul>
  </div>
</body>
</html>
```

This is a pretty straight forward page that will display a form to enter a question, a list of questions along with the ability to upvote any question selected.

#### Create your css file

Now, create a file called `style.css`:

```javascript
#ask-question input,body,html{font-family:'Open Sans',sans-serif}
body,html{height:100%}
#ask-question input{display:block;margin:1em 0 0;padding-bottom:.2em;border:none;outline:0;border-bottom:2px solid #ececec;background:0 0;color:rgba(0,0,0,.8);font-size:1.8em;line-height:1;transition:opacity: .3s;-webkit-transition:opacity .3s;width:20em}
#ask-question input::-webkit-input-placeholder{color:#bebebe}
#ask-question input::-moz-placeholder{color:#bebebe}
#ask-question input:-moz-placeholder{color:#bebebe}
#ask-question input:-ms-input-placeholder{color:#bebebe}
#questions{padding:1em .5em}
#questions ul{position:relative;list-style-type:none;margin:0;padding:0}
#questions li{position:absolute;width:100%;max-height:2.5em;box-sizing:border-box;font-size:1.8em;margin:0 -.4em;padding:.5em .4em;transition:background .3s,top .3s ease-in-out;background:#fff;text-overflow:ellipsis;overflow:hidden;border:thin solid transparent;border-radius:3px;white-space:nowrap;cursor:pointer}
#questions li:focus,#questions li:hover{background:rgba(253,251,247,1)}
#questions li.expanded{max-height:5000em;background:rgba(253,251,247,.95);overflow:visible;white-space:normal;border:thin solid #e0d8d8;z-index:2}
#questions li a.upvote{position:relative;display:inline-block;width:2em;height:2.5em;text-align:center;border-radius:5px;border:thin solid #dcdcdc;font-size:1.1rem;vertical-align:bottom;text-decoration:none;margin-right:.8em;margin-bottom:-.15em;background:#fff}
#questions li span.upvote-arrow{position:absolute;top:.3em;left:.6em;height:0;border-style:solid;border-width:0 7px 8px;border-color:transparent transparent #c5c5c5}
#questions li span.points{color:#222;display:block;margin:.9em 0}
```

#### Now for the brains of your app

Let's create `app.js` now, this will handle all the processing:

```javascript
(function() {
  'use strict';
  var app = angular.module('questionApp', [ 'flybaseResourceHttp' ])
    .constant('FLYBASE_CONFIG',{
      API_KEY:"YOUR-API-KEY",
      DB_NAME:'questions'
    })
    .factory('Question', function ($flybaseResourceHttp) {
      return $flybaseResourceHttp('questions');
    })    
    .controller('questionController', function($scope, Question, $timeout) {
      $scope.newquestion = '';
      $scope.questions = [];
      
      $scope.init = function(){
        Question.all().then(function(questions){
          $timeout(function() {
            $scope.questions = questions;
          });
        });
      }
      $scope.init();

      $scope.saveQuestion = function( questionText ){
        var question = new Question();
        question.question = questionText;
        question.points = 1;
        question.$save();
        $scope.newquestion = '';
      };

      $scope.upvoteQuestion = function( questionId ){
        Question.flybase().where({"_id": questionId}).once('value').then(function( rec ){
          var question = rec.first().value();
          question.points += 1;
          Question.flybase().push(question, function(resp) {});
        }, function(err){
        });
      };

      Question.flybase().on('added', function( data ){
        $timeout(function() {
          $scope.questions.push( data.value() );
        });
      });
      Question.flybase().on('changed', function( data ){
        $timeout(function() {
          var snapshot = data.value();
          angular.forEach($scope.questions, function(question,i) {
            if( question._id == snapshot._id ){
              $scope.questions[ i ] = snapshot;
            }
          });
        });
      });
      Question.flybase().on('removed', function( data ){
        $timeout(function() {
          var snapshot = data.value();
          angular.forEach($scope.questions, function(question,i) {
            if( question._id == snapshot._id ){
              $scope.questions.splice(i, 1);
            }
          });
        });
      });
    });
})();
```

This will set up our Angular.js app, so that it will listen for new questions, updated questions or deleted questions and update the page accordingly, it will also `push` questions to our Flybase database when someone submits a new question.

### Now for the Dashboard

We've built our frontend, now let's build our backend, this dashboard is going to also be in Angular.js, but will be a separate app as we may not want to run it in the same place, or maybe we want to run it locally. So I've kept that idea in mind as I've built a stand alone dashboard.

First, create a folder called `dashboard`.

#### Your index page

Now, create a file called `index.html`:

```javascript
<!DOCTYPE html >
<html>
<head>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.min.js"></script>
  <script src="https://cdn.flybase.io/flybase.js"></script>
  <script src="https://cdn.flybase.io/angularfly.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/epoch/0.8.4/js/epoch.min.js"></script>
  <script src="app.js"></script>

  <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,600' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/epoch/0.8.4/css/epoch.min.css">
  <style>
    body {
      font-family: 'Open Sans', sans-serif;
    }    
  </style>
</head>
<body ng-app="dashboardApp" ng-controller="dashboardController" class="epoch-theme-default">
  <h1>Most popular questions</h1>
  <div id="chart" class="epoch category10" style="height: 200px"></div> 
</body>
</html>
```

This file is even smaller than the frontend index.html file, it's really straight forward in how it works as it just displays a chart of the most popular questions.

### The brains of your dashboard

Now let's create our `app.js` file:

```javascript

(function() {
  'use strict';
  var app = angular.module('dashboardApp', [ 'flybaseResourceHttp' ])
    .constant('FLYBASE_CONFIG',{
      API_KEY:"YOUR-API-KEY",
      DB_NAME:'questions'
    })
    .factory('Question', function ($flybaseResourceHttp) {
      return $flybaseResourceHttp('questions');
    })
    .controller('dashboardController', function($scope, Question, $timeout) {
      $scope.questions = [];
      $scope.epoch = undefined;
      $scope.init = function(){
        Question.all().then(function(questions){
          $timeout(function() {
            $scope.questions = questions;
            $timeout(function() {
              $scope.init_epoch();
            });
          });
        });
      };
      $scope.init();

      $scope.init_epoch = function( ){
        $scope.epoch =  jQuery('#chart').epoch({
          type: 'bar',
          data: []
        });
        $scope.update_epoch();
      };

      $scope.update_epoch = function(){
        var new_data = jQuery.map($scope.questions, function(question, i) {
                return {
                    x: question.question,
                    y: question.points
                }
            });
            
            $scope.epoch.update([{
                label: 'series',
                values: new_data
            }]);
      };
      Question.flybase().on('added', function( data ){
        $timeout(function() {
          $scope.questions.push( data.value() );
          $scope.update_epoch();
        });
      });
      Question.flybase().on('changed', function( data ){
        $timeout(function() {
          var snapshot = data.value();
          angular.forEach($scope.questions, function(question,i) {
            if( question._id == snapshot._id ){
              $scope.questions[ i ] = snapshot;
            }
          });
          $scope.update_epoch();
        });
      });
      Question.flybase().on('removed', function( data ){
        $timeout(function() {
          var snapshot = data.value();
          angular.forEach($scope.questions, function(question,i) {
            if( question._id == snapshot._id ){
              $scope.questions.splice(i, 1);
            }
          });
          $scope.update_epoch();
        });
      });  
    });
})();
```

This file is similar to our frontend `app.js` file, but also different. All this file is interested in doing is listening for new, updated or removed questions and updating our bar chart with the information. It's actually neat watching the number of votes on a question go up in real-time as people ask you things.

### Finishing Up

This was a pretty simple app, but also explored some different areas, so take it, play with it and build with it.
