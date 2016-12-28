---
layout: post
published: true
title: "Real-time Call Tracking Dashboard with Flybase and Twilio"
date: 2016-09-09T16:18:08.759Z
tags:
  - code
  - twilio
image: "http://blog.flybase.io/images/posts/call-center.jpg?20160217"
ogtype: "article"
bodyclass: "post"
---

<div><div class="image splash">
	<img src="/images/posts/call-center.jpg?20160217" />
</div></div>

Remember our [Flyalytics](http://blog.flybase.io/2015/12/03/flybase-stats-dashboard/) app? You learned to build a real-time dashboard to track events on your website as they happened.

This post will show you how to implement the same type of dashboard, but for call tracking.

We'll do this in two parts, the first part will be a simple node.js file that accepts incoming calls from Twilio, and then stores the information inside a Flybase app, and the second part is the dashboard itself.

We're going to display two stats, the incoming Twilio phone number, and the city the call originated from. You can build on this further later.

With our original dashboard, we passed events and didn't actually store any information, this time we'll be storing the information to retrieve later.

### The backend

#### Step 1

First, let's set up our `package.json` file:

```javascript
{
  "name": "call-tracking",
  "version": "1.0.0",
  "description": "Example app demonstrating how to do call tracking with Twilio and Flybase",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/flybaseio/call-tracking.git"
  },
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/flybaseio/call-tracking/issues"
  },
  "homepage": "https://github.com/flybaseio/call-tracking#readme",
  "dependencies": {
    "body-parser": "^1.15.2",
    "compression": "^1.6.2",
    "cors": "^2.8.1",
    "ejs": "^2.5.2",
    "express": "^4.14.0",
    "flybase": "^1.7.8",
    "method-override": "^2.3.6",
    "serve-static": "^1.11.1"
  }
}
```

This will tell our app what it needs to run.

#### Step 2

Now, let's set up our `index.js` file to run as our backend:

```javascript
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var flybase = require('flybase');
var path = require('path');

var cors = require('cors');
var compression = require('compression');
var serveStatic = require('serve-static');

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({	extended: true	}));
app.use(express.static( path.join(__dirname, 'public')));

var port = process.env.PORT || 5000; // set our port

var flybaseRef = flybase.init('YOUR-FLYBASE-APP-NAME', "calltracking", 'YOUR-FLYBASE-API-KEY');

//	backend

app.post('/call', function(req, res) {
	flybaseRef.push({
		time: Date.now()/1000,
		number: req.body.To,
		city: req.body.FromCity
	}).then( function( rec ){
		res.type('text/xml');
		res.render('twiml', { message: 'Your call has been recorded!' })
	}, function(err){
		res.type('text/xml');
		console.log(error);
		res.render('twiml', { message: 'Sorry, an error happened.' });
	});
});
```

Now, let's add the frontend handler, this will just be part of the same `index.js` file:

```javascript
// frontend

function setCustomCacheControl(res, path) {
	if (serveStatic.mime.lookup(path) === 'text/html') {
		// Custom Cache-Control for HTML files
		res.setHeader('Cache-Control', 'public, max-age=0')
	}
}

app.use(compression());

app.use(serveStatic(__dirname + '/dashboard', {
	maxAge: '1d',
	setHeaders: setCustomCacheControl,
	'index': ['index.html'],
	fallthrough: true
}));


var server = http.createServer(app);
server.listen(process.env.PORT || 3000, function() {
	console.log('Express server started.');
});
```

I'm using the `serve-static` module here since the dashboard can be stand alone if we want it to be, so it's just your standard html page served statically, so we'll tell our app to display any file inside the `dashboard` folder.

#### Step 3

Finally, we need to create a folder called `views`, and add a tiny little file called `twiml.ejs`:

```javascript
<Response>
	<Say><%= message %></Say>
</Response>
```

This is used to return our TwiML (Twilio Markup Language) response on incoming calls. You can play with this further to make it do things like connect a call to another number, etc, but for this app we just need to record and track.

---

### The frontend

We want this dashboard to be able to run anywhere, so we're just going to include the `dashboard` folder and set up our node app to serve it statically. You can actually upload the `dashboard` folder anywhere you want and have it run and display your call tracking stats.


#### Step 1

Create a folder called `dashboard`.

#### Step 2

Now, create a file inside the `dashboard` folder called `index.html`:

```javascript
<!doctype html>
<html>
	<head>
		<title>Call Tracking On the Fly</title>
		<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" integrity="sha256-7s5uDGW3AHqw6xtJmNNtr+OBRJUlgkNJEo78P4b0yRw= sha512-nNo+yCHEyn0smMxSswnf/OnX6/KwJuZTlNZBjauKhTK0c+zT+q5JOCx0UFhXQ6rJR9jg6Es8gPuD2uZcYDLqSw==" crossorigin="anonymous">
		<link href="https://cdnjs.cloudflare.com/ajax/libs/epoch/0.5.2/epoch.min.css" rel="stylesheet" />
		<link href="dashboard.css" rel="stylesheet" />
	</head>
	<body>
		<div class="navbar-nav navbar-inverse navbar-fixed-top">
				<div class="container">
				<div class="navbar-header">
					<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>
					<a class="navbar-brand" href="index.html">
						Call Tracking Dashboard
					</a>
				</div>
					<div class="navbar-collapse collapse">
						<ul class="nav navbar-nav">
							<li class="active">
								<!-- <a href="index.html">
									<i class="icon-home icon-white"></i> Home
								</a> -->
							</li>
						</ul>
					</div><!--/.nav-collapse -->
				</div>
		</div>

		<div class="container">

			<div class="row">

				<div class="col-sm-12 col-lg-12">
					<article class="widget">
						<div class="widget-inner">

							<header>
								<h1>Calls</h1>
							</header>

							<section class="widget-body">
								<div id="calls" class="epoch" style="height: 200px;"></div>
							</section>

						</div><!-- .widget-inner -->

					</article>
				</div>

			</div>

			<div class="row">

				<div class="col-sm-6 col-lg-6">
					<article class="widget">
						<div class="widget-inner">

							<header>
								<h1>Incoming Number</h1>
							</header>

							<section class="widget-body">
								<div id="numbers" class="epoch" style="height: 200px;"></div>
							</section>

						</div><!-- .widget-inner -->

					</article>
				</div>

				<div class="col-sm-6 col-lg-6">
					<article class="widget">
						<div class="widget-inner">

							<header>
								<h1>City</h1>
							</header>

							<section class="widget-body">
								<div id="cities" class="epoch" style="height: 200px;"></div>
							</section>

						</div><!-- .widget-inner -->

					</article>
				</div>
			</div>

		</div>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.10/d3.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/epoch/0.5.2/epoch.min.js"></script>
	<script src="https://cdn.flybase.io/flybase.js"></script>
	<script src="dashboard.js"></script>
</body>
</html>
```

#### Step 3

You'll next create a called called `dashboard.js`:

```javascript
$( function() {
	var calls = $('#calls').epoch( {
		type: 'time.area', axes: ['left', 'bottom', 'right'],
		data: [ { values: [ { time: Date.now()/1000, y: 0 } ] } ]
	} );
	var numbers = $( '#numbers' ).epoch( { type: 'bar' } );
	var cities = $( '#cities' ).epoch( { type: 'bar' } );
	var stats = {
		cities: {},
		numbers: {}
	};

	var dashboard = new Flybase("YOUR-FLYBASE-API-KEY", "calltracking", "stats");

	dashboard.once('value', function (data) {
		updateStats( data );
	});

	dashboard.on( 'added', function (data ){
		updateStats( data );
	});

	function updateStats( data ){
		//	process the new data...
		data.forEach( function( snapshot ){
			var row = snapshot.value();

			calls.push( [ { time: row.time, y: 1 } ] );

			var cityCount = stats.cities[ row.city ] || 0;
			stats.cities[ row.city ] = ++cityCount;

			var numberCount = stats.numbers[ row.number ] || 0;
			stats.numbers[ row.number ] = ++numberCount;
		});

		var citiesData = [];
		for( var city in stats.cities ) {
			citiesData.push( { x: city, y: stats.cities[ city ] } );
		}
		cities.update( [ { values: citiesData } ] );

		var numbersData = [];
		for( var number in stats.numbers ) {
			numbersData.push( { x: number, y: stats.numbers[ number ] } );
		}
		numbers.update( [ { values: numbersData } ] );

	}
});
```

This is the brains of our dashboard, it processes all calls and displays them in the dashboard.

#### Step 4

Finally, let's add some CSS to `dashboard.css`:

```javascript

body {
  font: 400 0.95em/1 "Proxima Nova", Helvetica,sans-serif;
  font-size: .875em;
  background-color: #f0f0f0;

  padding-top: 90px;
}

.widget {
  -webkit-box-shadow: #f0f0f0 0 0 8px;
  -moz-box-shadow: #f0f0f0 0 0 8px;
  box-shadow: #f0f0f0 0 0 8px;
  background-color: #f0f0f0;

  margin-bottom: 30px;
}

.widget h1 {
  font-size: 1.0em;
  margin: 0 0 .4em;
  font-weight: bold;
}

.widget .widget-inner>header, .widget .widget-inner>footer {
  font-size: 12px;
  text-shadow: 1px 1px #0e0e0e;
}

.widget .widget-inner>header {
  background-color: #272727;
  text-transform: uppercase;
  padding: 16px 12px 16px 26px;
  font-weight: 700;
}

.widget .widget-inner {
  border: solid 1px #e5e5e5;
  background-color: #fff;
}

.widget .widget-inner>header {
  background-color: #f5f5f5;
}

.widget .widget-inner>header h1 {
  color: #8b8b8b;
  text-shadow: 1px 1px #fff;
  margin-bottom: 0;
}

.widget .widget-body {
  color: #666;

  height: 225px
}

.widget .widget-body {
  padding: 16px;
  color: #d3d4d4;
  font-family: Helvetica, Arial, sans-serif;
  z-index: 1;
}

.widget .widget-inner>footer {
  color: #8b8b8b;
  background-color: #f5f5f5;
  text-shadow: 1px 1px #fff;
}

.dash-unit {
  margin-bottom: 30px;
  padding-bottom: 10px;
  border: 1px solid #e5e5e5;
  /*background-image: url('../img/sep-half.png');*/
  background-color: #f5f5f5;
  color: #8b8b8b;
  height: 290px;
  text-align: center;
}

.dash-unit dtitle {
  font-size: 11px;
  text-transform: uppercase;
  margin: 8px;
  padding: 0px;
  height: inherit;
}

.dash-unit hr {
  border: 0;
  border-top: 1px solid #151515;
  border-top-style: dashed;
  margin-top: 3px;
}
```

---

You can run this anywhere you want, you just have to point your twilio phone number(s) you want to track to the url you add this site with `/call` as the endpoint.

You can see the full codebase here at the Github [repo](https://github.com/flybaseio/call-tracking).
