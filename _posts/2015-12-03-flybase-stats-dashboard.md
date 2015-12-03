---
layout: "post"
title: "Build a real-time stats Dashboard with Flybase"
date: "2015-12-03 08:30:00"
tags: 
- "code"
image: "http://blog.flybase.io/images/posts/dashboard2.png"
ogtype: "article"
bodyclass: "post"
---

<div class="box-wrap"><div class="box">
	<img src="/images/posts/dashboard2.png" />
</div></div>

Flybase's real-time events systems lets us push all kinds of data to the browser.

In this tutorial, I'm going to show you how to build a real-time analytics dashboard using Flybase and just a couple lines of javascript.

To keep things simple we'll capture the page URL and a couple of browser capabilities using Modernizr (modernizr.com). That information will be sent to the server using a Flybase connection.

This is entirely client-side, and no data will be saved to your Flybase app. In another tutorial, we'll expand our dashboard to store historical data.

### Step 1

To get started, you'll need a [flybase.io](https://app.flybase.io/signup) account, so go grab one if you don't already have one.

### Step 2

Open up `flyalytics.js` replace `YOUR-FLYBASE-API-KEY` with your actual Flybase API key.

```javascript
var flybase = new Flybase("YOUR-FLYBASE-API-KEY", "flyalytics", "stats");
var data = {
	url: window.location.href,
	webgl: Modernizr.webgl,
	touch: Modernizr.touch,
	video: Modernizr.video,
	websocket: Modernizr.websockets
};
flybase.trigger( 'client-data', data );
```

We're using `modernizr.js` to get information on if they support webgl, touch, video and websockets, this helps keep our code minimal and tidy. It wouldn't take much to add other info here as well, but this what we wanted for this dashboard.

One thing, we're only triggering here, sending real-time events. It wouldn't take much to `push` this data to store it in a Flybase app for historical purposes, but that's what what we want today. :)

Now upload `flyaltics.js` to your website and add the following code anywhere you want to track it:

```javascript
	<script src="//cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.2/modernizr.min.js"></script>
	<script src="https://cdn.flybase.io/flybase.js"></script>
	<script src="flyalytics.js"></script>
```

This will trigger page tracking on load. The idea was to keep this simple, but let it be able to be expanded on quickly.

### Step 3

Now let's build our dashboard. Open `js/dashboard.js` in the `dashboard/` folder and modify it:

```javascript
$( function() {
	var visitors = $('#visitors').epoch( {
		type: 'time.area', axes: ['left', 'bottom', 'right'],
		data: [ { values: [ { time: Date.now()/1000, y: 0 } ] } ]
	} );
	var pages = $( '#pages' ).epoch( { type: 'bar' } );
	var touch = $( '#touch' ).epoch( { type: 'time.gauge' } );
	var video = $( '#video' ).epoch( { type: 'time.gauge' } );
	var stats = {
		connections: 0,
		touch: 0,
		video: 0,
		pages: {}
	};

	var dashboard = new Flybase("YOUR-FLYBASE-API-KEY", "flyalytics", "stats");
	dashboard.on('online', function (data) {
		stats.connections = data.value();
	});
	dashboard.on( 'client-data', function (data ){
		//	process the new data...
		stats.touch += ( data.touch ? 1 : 0 );
		stats.video += ( data.video ? 1 : 0 );
		var pageCount = stats.pages[ data.url ] || 0;
		stats.pages[ data.url ] = ++pageCount;

		// Convert to percentages
		touch.update( ( stats.touch / stats.connections ) || 0 );
		video.update( ( stats.video / stats.connections ) || 0 );
		var pagesData = [];
		for( var url in stats.pages ) {
			pagesData.push( { x: url, y: stats.pages[ url ] } );
		}
		pages.update( [ { values: pagesData } ] );

		visitors.push( [ { time: Date.now()/1000, y: stats.connections } ] );
	});
});
```

Replace `YOUR-FLYBASE-API-KEY` with your actual Flybase API key.

This does a few things.

1. It uses the `online` event to get how many connections are active currently.

2. It takes the data that is passed from the `flyalytics.js` file called `client-data` to process current data and display it on the dashboard.

Now, let's look at our dashboard `dashboard/index.html`:


```javascript
<!doctype html>
<html>
	<head>
		<title>FlyAlytics</title>

		<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" integrity="sha256-7s5uDGW3AHqw6xtJmNNtr+OBRJUlgkNJEo78P4b0yRw= sha512-nNo+yCHEyn0smMxSswnf/OnX6/KwJuZTlNZBjauKhTK0c+zT+q5JOCx0UFhXQ6rJR9jg6Es8gPuD2uZcYDLqSw==" crossorigin="anonymous">
		<link href="https://cdnjs.cloudflare.com/ajax/libs/epoch/0.5.2/epoch.min.css" rel="stylesheet" />
		<link href="css/style.css" rel="stylesheet" />
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
						FlyAlytics Dashboard
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
								<h1>Visitors (30D)</h1>
							</header>

							<section class="widget-body">
								<div id="visitors" class="epoch" style="height: 200px;"></div>
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
								<h1>Popular Pages</h1>
							</header>

							<section class="widget-body">
								<div id="pages" class="epoch" style="height: 200px;"></div>
							</section>

						</div><!-- .widget-inner -->

					</article>
				</div>


				<div class="col-sm-3 col-lg-3">
					<article class="widget">
						<div class="widget-inner">

							<header>
								<h1>Touch Support</h1>
							</header>

							<section class="widget-body">
								<div id="touch" class="epoch gauge-medium"></div>
							</section>

						</div><!-- .widget-inner -->

					</article>
				</div>

				<div class="col-sm-3 col-lg-3">
					<article class="widget">
						<div class="widget-inner">
							<header>
								<h1>Video Support</h1>
							</header>

							<section class="widget-body">
								<div id="video" class="epoch gauge-medium"></div>
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
	<script src="js/dashboard.js"></script>
</body>
</html>
```

We display the number of people online right now, as well as the pages in use. Beside that we are using gauges via the epoch library to show us how many visitors support touch screens (tablets, phones) and how many support video as an example.

This could be built to show more data but the idea is showing what we need now

You can see the full code [here at the Github Repo](https://github.com/flybaseio/flyalytics).