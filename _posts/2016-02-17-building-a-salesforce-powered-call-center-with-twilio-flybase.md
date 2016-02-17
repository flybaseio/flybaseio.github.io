---
layout: post 
published: true 
title: "Building A Salesforce Powered Call Center with Flybase and Twilio" 
date: 2016-02-17T19:51:59.751Z 
tags:
  - code
  - twilio
image: "http://blog.flybase.io/images/posts/call-center.jpg?20160217"
ogtype: "article"
bodyclass: "post"
---

<div class="box-wrap"><div class="box">
	<img src="/images/posts/call-center.jpg?20160217" />
</div></div>

_In the world of telephony, an automated call distribution (ACD) system, is a system that distributes incoming calls to a specific group of agents based on the customer's selection, customer's telephone number, selected incoming line to the system, or time of day the call was processed. We also call this a call center_.

A couple years ago, Twilio's [Charles Oppenheimer](https://github.com/choppen5) built a demo of a Salesforce embeddable [ACD](https://github.com/choppen5/client-acd) using Twilio Client and Ruby.  

Many thanks to Charles for sharing that demo.  We have simply taken that demo and converted it to Node.js with a Flybase powered backend to handle the distribution of calls, rather than the original Ruby / Mongo system, the result is a cleaner call center that's easy to modify and integrate into other CRMs.

### What we'll be using:

- **[Flybase.io](https://flybase.io/)** as our backend, handling storing data, passing events and our call queues.
- **[Twilio Client](https://www.twilio.com/webrtc)** is WebRTC interface to Twilio.  In our demo we are using the javascript library which gives us an API and connection to Twilio to receive the call within our Salesforce browser delivering the call via WebRTC.  Twilio client also gives us the ability to control the call via our soft phone.
- **Heroku** will be used as our webhost, but you can host your call center anywhere you'd like.
- **Salesforce Open CTI** is an open API to allow third party CTI vendors to connect telephony channels into the Salesforce CRM interface.  In our demo we use Open CTI to house our soft phone and drive the click to dial/text functionality.  The demo requires no plugins or installed software thanks to the design of Open CTI. For more info see [the developer guide](https://developer.salesforce.com/page/Open_CTI).

_The actual salesforce integration is optional, and you can easily insert your softphone into another CRM. Part 2 of this tutorial will actually use flybase to build a simple CRM with the softphone included as a widget._

### Getting started

You can find the full source code [here](https://github.com/flybaseio/callcenter).

First, let's set up our node.js app.

Create `package.json`:

```javascript
{
  "name": "callcenter",
  "version": "0.0.1",
  "description": "Client ACD powered by Flybase, Twilio and Node.js",
  "main": "app.js",
  "repository": "https://github.com/flybaseio/callcenter",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "twilio",
    "data mcfly",
    "flybase",
    "twilio",
    "sms"
  ],
  "author": "Roger Stringer",
  "license": "MIT",
  "dependencies": {
    "body-parser": "~1.4.2",
    "ejs": "~0.8.5",
    "express": "~3.4.8",
    "flybase": "1.7.2",
    "less-middleware": "~0.2.1-beta",
    "method-override": "~2.0.2",
    "moment": "~2.5.1",
    "node-buzz": "~1.1.0",
    "twilio": "~1.6.0"
  },
  "engines": {
    "node": "0.12"
  }
}
```

This will tell our call center what modules we want to install for our node app.

Now, we want to create our `app.js` file to handle all our backend work:

```javascript
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');

var config = require( path.join(__dirname, 'app', 'config') );

var app = express();
app.set('views', path.join(__dirname, 'app', 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({	extended: true	}));
app.use(express.static( path.join(__dirname, 'app', 'public')));
 
var port = process.env.PORT || 5000; // set our port

var twilio = require('twilio');
var client = twilio(config.twilio.sid, config.twilio.token);

var flybase = require('flybase');
var callsRef = flybase.init(config.flybase.app_name, "calls", config.flybase.api_key);
var agentsRef = flybase.init(config.flybase.app_name, "agents", config.flybase.api_key);
var queueid = '';
var good2go = false;

// backend routes 

client.queues.list(function(err, data) {
	var to_go = data.queues.length;
	data.queues.forEach(function(queue) {
		if( queue.friendlyName === config.twilio.queueName ){
			queueid = queue.sid;
			console.log( "Queueid = #" + queueid + " for #" +  config.twilio.queueName );
			good2go = true;
		}
		to_go--;
		if( to_go == 0 ){
			if( queueid === '' ){
				client.queues.create({
					friendlyName: config.twilio.queueName
				}, function(err, queue) {
					queueid = queue.sid;
				});	
			}
		}
	});
});

// listen for events via Flybase...
// if an agent gets disconnected then we log them off...
agentsRef.on('agent-removed', function (data) {
	var data = JSON.parse( data );
	console.log( data.username + " has left the building");
	update_agent(data.username,{
		status: 'LoggedOut'
	});	
});

// return number of agents with status set to Ready
agentsRef.on('get-ready-agents', function (data) {
	var adNag = function() {
		agentsRef.where({"status": 'Ready'}).on('value',function( rec ){
			console.log( rec.count() + ' agents are Ready' );
			if( rec.count() ){
				agentsRef.trigger('agents-ready', rec.count() );
			}else{
				agentsRef.trigger('agents-ready', "0" );
			}
		});
	};
	setTimeout(adNag, 1500);
});

//	listen for outgoing calls
app.post('/dial', function (req, res) {
	var phonenumber = req.param('PhoneNumber');
	var dial_id = config.twilio.fromNumber;
	if( typeof req.param('CallerID') !== 'undefined' ){
		var dial_id = req.param('CallerID');
	}
	var twiml = new twilio.TwimlResponse();
	twiml.dial(phonenumber, { 
		callerId:dial_id
	});
	console.log("Response text for /dial post = #", twiml.toString());
	res.writeHead(200, {
		'Content-Type':'text/xml'
	});
	res.end( twiml.toString() );
});

//	listen for incoming calls
app.post('/voice', function (req, res) {
	var queuename = config.twilio.queueName;
	var sid = req.param('CallSid');
	var callerid = req.param('Caller');

	var addtoq = 0;
	var dialqueue = '';
	var client_name = '';
	
	//	search for agent who has been set to `Ready` for the longest time and connect them to the caller...
	getlongestidle(true, function( bestclient ){
		if( bestclient ){
			console.log("Routing incoming voice call to best agent = #", bestclient);
			var client_name = bestclient;
		}else{
			console.log( 'no agent was found, adding caller to #', config.twilio.queueName );
			var dialqueue = queuename;
			addtoq = 1;
		}
	
		var twiml = new twilio.TwimlResponse();
		if( addtoq ){
			twiml.say("Please wait for the next available agent",{
				voice:'woman'
			}).enqueue(config.twilio.queueName);
		}else{
			twiml.dial({
				'timeout':'10',
				'action':'/handledialcallstatus',
				'callerId':callerid
			}, function(node) {
				this.client( client_name );
			});
			update_call(sid, {
				'sid': sid,
				'agent': client_name,
				'status': 'ringing'
			});
		}
		console.log("Response text for /voice post = #", twiml.toString());
	
		res.writeHead(200, {
			'Content-Type':'text/xml'
		});
		res.end( twiml.toString() );
	});
});

app.post('/handledialcallstatus', function (req, res) {
	var sid = req.param('CallSid');
	var twiml = new twilio.TwimlResponse();

	if( req.param('DialCallStatus') == 'no-answer' ){
		callsRef.where({"sid": sid}).on('value',function( rec ){
			if( rec.count() !== null ){
				var sidinfo = rec.first().value();
				if( sidinfo ){
					var agent = sidinfo.agent;
					update_agent(agent, {
						'status': 'missed'
					});
				}
				// Change agent status for agents that missed calls
			}
			//	redirect and try to get new agent...
			twiml.redirect('/voice');
		});
	}else{
		twiml.hangup();
	}
	console.log("Response text for /handledialcallstatus post = #", twiml.toString());
	res.writeHead(200, {
		'Content-Type':'text/xml'
	});
	res.end( twiml.toString() );
});

// assign a twilio call token to the agent
app.get('/token', function(req, res) {
	var client_name = "anonymous";
	if( typeof req.param("client") !== "undefined" ){
		client_name = req.param("client");
	}
	
	var capability = new twilio.Capability( config.twilio.sid, config.twilio.token );
	capability.allowClientIncoming( client_name );
	capability.allowClientOutgoing( config.twilio.appid );
    var token = capability.generate();

    res.end(token);	
});

// return flybase info to the softphone...
app.get('/getconfig', function(req, res) {
	res.json({
		app_name: config.flybase.app_name,
		api_key: config.flybase.api_key
	});
});

// return a phone number
app.get('/getcallerid', function(req, res) {
	var client_name = "anonymous";
	if( typeof req.param("from") !== "undefined" ){
		client_name = req.param("from");
	}
	res.end( config.twilio.fromNumber );
});


app.post('/track', function(req, res) {
	
});

app.get('/', function(req, res) {
	var client_name = "anonymous";
	if( typeof req.param("client") !== "undefined" ){
		client_name = req.param("client");
	}
	
	res.render('index', {
		client_name: client_name,
		anycallerid: 'none'
	});
}); 

var server = app.listen(port, function() {
	console.log('Listening on port %d', server.address().port);
});


// various functions =========================================================

//	find the caller who's been `Ready` the longest
function getlongestidle( callrouting, callback ){
	if( callrouting ){
		agentsRef.where({"status": "DeQueing"}).orderBy( {"readytime":-1} ).on('value').then(function( data ){
			var agent = data.first().value();
			callback( agent.client );
		},function(err){
			agentsRef.where({"status": "Ready"}).orderBy( {"readytime":-1} ).on('value').then(function( data ){
				var agent = data.first().value();
				callback( agent.client );
			},function(err){
				callback( false );
			});
		});
	}else{
		agentsRef.where({"status": "Ready"}).orderBy( {"readytime":-1} ).on('value').then(function( data ){
			var agent = data.first().value();
			callback( agent.client );
		},function(err){
			callback( false );
		});
	}
}


// check if user exists and if they do then we update, otherwise we insert...
function update_agent(client, data, cb){
	var d = new Date();
	var date = d.toLocaleString();
	var callback = cb || null;
	agentsRef.where({"client": client}).once('value').then( function( rec ){
		var agent = rec.first().value();
		for( var i in data ){
			agent[i] = data[i];
		}
		agentsRef.push(agent, function(resp) {
			console.log( "agent updated" );
			if( callback !== null ){
				callback();
			}
		});
	},function(err){
		data.client = client;
		agentsRef.push(data, function(resp) {
			console.log( "agent inserted" );
			if( callback !== null ){
				callback();
			}
		});
	});
}

function update_call(sid, data){
	var d = new Date();
	var date = d.toLocaleString();
	callsRef.where({"sid": sid}).on('value').then( function( rec ){
		var call = rec.first().value();
		for( var i in data ){
			call[i] = data[i];
		}
		callsRef.push(call, function(resp) {
			console.log( "call updated" );
		});				
	},function(err){
		data.sid = sid;
		callsRef.push(data, function(resp) {
			console.log( "call inserted" );
		});				
	});
}

// call queue handling 

var qsum = 0;
var checkQueue = function() {
	qsum += 1;
	var qsize = 0;
	var readyagents = 0;
	var qname = config.twilio.queueName;
	client.queues(queueid).get(function(err, queue) {
		qsize = queue.currentSize;
		console.log( 'There are #' + qsize + ' callers in the queue (' + queueid + ')' );
		if( qsize > 0 ){
			agentsRef.where({"status": "Ready"}).orderBy( {"readytime":-1} ).on('value').then(function( agents ){
				var readyagents = agents.count();
				var bestclient = agents.first().value();
				console.log("Found best client - routing to #" + bestclient.client + " - setting agent to DeQueuing status so they aren't sent another call from the queue");
				update_agent(bestclient.client, {status: "DeQueing" }, function(){
					console.log('redirecting call now!');
					client.queues(queueid).members("Front").update({
						url: config.twilio.dqueueurl,
						method: "POST"
					}, function(err, member) {
//							console.log(member.position);
					});
				});
			},function(err){
				console.log("No Ready agents during queue poll #" + qsum);
			});
			agentsRef.trigger('agents-ready', readyagents );
			agentsRef.trigger('in-queue', qsize );

			// restart the check checking
			setTimeout(checkQueue, 3000);		
		}else{
			// restart the check checking
			console.log("No callers found during queue poll #" + qsum);
			setTimeout(checkQueue, 3000);		
		}
	});	
};
setTimeout(checkQueue, 1500);
```
There's a lot happening in this file. First, we require our various libraries and set up express, then we start our actual work.

You'll notice we set up to Flybase references:

- `callsRef` connects to our `calls` table and handles storing and retrieving information for incoming calls.
- `agentsRef` conncts to our `agents` table and handles storing and retrieving information for agents.

The first backend task we handle is checking our twilio queues to retrieve the `queueid` or our call queue, or else create it if it doesn't exist. We use this queue for storing incoming calls if there are no agents available in our call center, and they stay inside the queue until an agent is available.

Then we set up event listeners for two events:

- `agent-removed`: when an agent logs out, then we update their user record to set them to `not ready`
- `get-ready-agents`: just returns the number of agents currently set to `Ready`.

Then we have our actual URI end points:

- `/dial` is a `POST` request which is handled by Twilio to make outgoing calls between the agent's web browser and a phone number.
- `/voice` is a `POST` request which handle incoming calls from phone numbers. This works by finding the agent that has had their status set to `Ready` for the longest time and assigning them to the call. If not agent is `Ready` then we place the caller in a queue and check it later.
- `/handdialcallstatus` is a `POST` request that is called when a call finishes. It checks to see if the call was answered, not answered and depending on the `DialCallStatus` returned from Twilio, either place the caller back into the queue and take the agent out of `Ready` status, or hang up the call as it assumes the call is done. 
- `/token` is a `GET` request called via an ajax call on the frontend to assign a Twilio Client Capability Token to the agent while they are logged in
- `/getconfig` is a `GET` request called also via ajax call from the client which returns the call center's Flybase settings for the softphone to use in the frontend.
- `/` is a `GET` request which displays the softphone, and assigns a name to the client based on the `?client` query string.

We have three backbone functions that are used by the call center to handle various purposes:

- `getlongestidle` is a function which checks for either an agent who's status is set to `Ready` or `DeQueing` and returns that agent's client name. In case of no agents being found, then we return false and it places the caller in their queue. `DeQueing` is a special status we'll be setting at the end of our code as an agent becomes available.
- `update_agent` will take the agent's id and update their account in the Flybase database with new info, such as status updates when on a call, going offline, etc.
- `update_call` is used in the same way as `update_agent` but for tracking calls.

Finally, we have the queue handling, this is a function called `checkQueue`, which is called 1.5 seconds after the app loads and then every 3 seconds, and performs a simple task:

1. It enters into a loop to return all callers in the call queue
2. If there are callers waiting to connect to agents, then it will look for the agent with their status set to `Ready` and who have been `ready` the longest by sorting by the `readytime` field.
3. If an agent is `Ready`, then we set that agent's status to `DeQueing` and connect the caller at the `Front` of the queue to that agent by calling our `dqueueurl`.
4. If no agents are `Ready`, or no callers are in the queue, then we set a timeout to call the function again in 3 seconds and return to step 1 of the `checkQueue` loop.

We next want to create a folder called `app` and then inside that folder create a file called `config.js`:

```javascript
module.exports = {
	// Twilio API keys
	twilio: {
		sid: "ACCOUNT-SID",
		token: "AUTH-TOKEN",
		appid: 'APP-ID',
		fromNumber : "TWILIO-NUMBER",
		welcome : "Thank you for calling.",
		hangup : false,
		queueName: "cnacd",
		dqueueurl:"http://yourwebsite.com/voice"
	},
	//	Flybase settings
	flybase: {
		api_key: "YOUR-API-KEY",
		app_name: "YOUR-FLYBASE-APP"
	}
};
```

Update this file to contain your Twilio information, and your Flybase information.

For the Twilio information, you'll need to create an Twiml App inside your Twilio account, create the app and have it `POST` to your call center website at `/dial`.

Also, create a new phone number inside Twilio and have that phone number `POST` to your call center website at `/voice`. 

There is a variable called `queueName` which is the name of the queue you want your call center to use, and also a variable called `dqueueurl`, this is the URL to your website with `/voice` appended to it. You will need this for the dequeuing task as Twilio requires an absolute URL.

### The softphone

Inside the `app` folder, create two folders:

1. `views`
2. `public`

Now, inside `public`, create a file called `index.html`:

```javascript
<!DOCTYPE html>
<html>
<head>
	<title>Twilio Softphone</title>
	<script type="text/javascript" src="https://static.twilio.com/libs/twiliojs/1.2/twilio.min.js"></script>  
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
	<script src="https://na15.salesforce.com/support/api/31.0/interaction.js"></script>
	<script src="https://na15.salesforce.com/support/console/31.0/integration.js"></script>
	<script src="https://cdn.flybase.io/flybase.js"></script>
	<script type="text/javascript" src="/js/softphone.js"></script>
	<link rel="stylesheet" type="text/css" href="/css/dialer.css">
</head>
<body>
	<div id="client_name" hidden="true"><%= client_name %></div>
	<div id="softphone" class="softphone">
		<div id="agent-status-controls" class="clearfix">
			<button class="agent-status ready">Ready</button>
			<button class="agent-status not-ready">Not Ready</button>
			<div class="agent-status active">Call In-Progress</div>
		</div><!-- /agent-status -->
		
		<div id="agent-status">
			<p></p>
		</div><!-- /agent-status -->
		
		<div class="divider"></div>
		
		<div id="number-entry">
			<input placeholder="+1 (555) 555-5555"></input>
			<div class="incoming-call-status">Incoming Call</div>
		</div><!-- /number-entry" -->
		
		<div id="dialer">
			<div id="dialer-container">
				<div class="numpad-container">
					<div class="number" value="1">1</div><div class="number" value="2">2</div><div class="number" value="3">3</div><div class="number" value="4">4</div><div class="number" value="5">5</div><div class="number" value="6">6</div><div class="number" value="7">7</div><div class="number" value="8">8</div><div class="number" value="9">9</div><div class="number ast" value="*">&lowast;</div><div class="number" value="0">0</div><div class="number" value="#">#</div>
				</div><!-- /numpad-container -->
			</div><!-- /dialer-container -->
		</div><!-- /dialer -->
		
		<div id="action-button-container">
			<div id="action-buttons">
				<button class="call">Call</button>
				<button class="answer">Answer</button>
				<button class="hangup">Hangup</button>
				<button class="mute">Mute</button><button class="hold">Hold</button><button class="unhold">UnHold</button>
			</div><!-- /action-buttons -->
		</div><!---action-button-containe -->
		
		<div id="call-data">
			<h3>Caller info</h3>
			<ul class="name"><strong>Name: </strong><span class="caller-name"></span></ul>
			<ul class="phone_number"><strong>Number: </strong><span class="caller-number"></span></ul>
			<ul class="queue"><strong>Queue: </strong><span class="caller-queue"></span></ul>
			<ul class="message"><strong>Message: </strong><span class="caller-message"></span></ul>
		</div><!-- /call-data -->
		
		<div id="callerid-entry" style="display:<%= anycallerid %>">
			<input placeholder="Change your callerid"></input>
		</div><!-- /number-entry" -->
		
		<div id="team-status">
			<div class="agents-status"><div class="agents-num">-</div>Agents</div>
			<div class="queues-status"><div class="queues-num">-</div>In-Queue</div>
		</div><!-- /team-status -->
	</div><!-- /softphone -->
</body>
</html>
```

This is our index file, which handles the output of our softphone for agents to use to accept and make calls.

Inside the `public` folder, create a folder called `css` and include the following two files:

#### `dialer.css`:

```javascript
/* reset css */
article,aside,details,figcaption,figure,footer,header,hgroup,hr,menu,nav,section{display:block}a,hr{padding:0}abbr,address,article,aside,audio,b,blockquote,body,canvas,caption,cite,code,dd,del,details,dfn,div,dl,dt,em,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,p,pre,q,samp,section,small,span,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,ul,var,video{margin:0;padding:0;border:0;outline:0;font-size:100%;vertical-align:baseline;background:0 0}ins,mark{background-color:#ff9;color:#000}body{line-height:1}nav ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}a{margin:0;font-size:100%;vertical-align:baseline;background:0 0}ins{text-decoration:none}mark{font-style:italic;font-weight:700}del{text-decoration:line-through}abbr[title],dfn[title]{border-bottom:1px dotted;cursor:help}table{border-collapse:collapse;border-spacing:0}hr{height:1px;border:0;border-top:1px solid #ccc;margin:1em 0}input,select{vertical-align:middle}

.clearfix:before, .clearfix:after { content: " "; display: table; }
.clearfix:after { clear: both; }
.clearfix { *zoom: 1; }

*, *:before, *:after {
  -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

body {
  font-family: "Helvetica", Arial, sans-serif;
  background-color: white;
}

#softphone {
  width: 175px;
  margin: 10px auto 0px;
}

#agent-status-controls {
  margin: 10px 0 20px;
  position: relative;
}

.agent-status {
  border: none;
  padding: 6px 10px;
  background-image: linear-gradient(bottom, #ddd 20%, #eee 72%);
  background-image: -o-linear-gradient(bottom, #ddd 20%, #eee 72%);
  background-image: -moz-linear-gradient(bottom, #ddd 20%, #eee 72%);
  background-image: -webkit-linear-gradient(bottom, #ddd 20%, #eee 72%);
  background-image: -ms-linear-gradient(bottom, #ddd 20%, #eee 72%);
  background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.2, #ddd), color-stop(0.72, #eee));
  color: #333;
  text-shadow: 0px -1px 0px rgba(255, 255, 255, 0.3);
  box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  text-align: center;
}

button.agent-status {
  display: inline-block;
  float: left;
  width: 50%;
  margin: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

@-webkit-keyframes pulse {
  0% {background-color: #EA6045;}
  50% {background-color: #e54a23;}
  100% {background-color: #EA6045;}
}

div.agent-status {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  font-size: 12px;
  line-height: 12px;
  background-image: none;
  background-color: #EA6045;
  -webkit-animation: pulse 1s infinite alternate;
  color: #fff;
  text-shadow: 0px -1px 0px rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.agent-status:active, .agent-status:focus {
  outline: none;
}

.agent-status[disabled] {
  box-shadow: inset 0px 0px 15px rgba(0, 0, 0, 0.6);
  opacity: 0.8;
  text-shadow: 0px 1px 0px rgba(0, 0, 0, 0.4);
}

.agent-status.ready {
  border-radius: 2px 0 0 2px;
}

.agent-status.ready[disabled] {
  background-image: linear-gradient(bottom, #7eac20 20%, #91c500 72%);
  background-image: -o-linear-gradient(bottom, #7eac20 20%, #91c500 72%);
  background-image: -moz-linear-gradient(bottom, #7eac20 20%, #91c500 72%);
  background-image: -webkit-linear-gradient(bottom, #7eac20 20%, #91c500 72%);
  background-image: -ms-linear-gradient(bottom, #7eac20 20%, #91c500 72%);
  background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.2, #7eac20), color-stop(0.72, #91c500));
  color: #f5f5f5;
}

.agent-status.not-ready {
  border-radius: 0 2px 2px 0;
}

.agent-status.not-ready[disabled] {
  background-image: linear-gradient(bottom, #e64118 20%, #e54a23 72%);
  background-image: -o-linear-gradient(bottom, #e64118 20%, #e54a23 72%);
  background-image: -moz-linear-gradient(bottom, #e64118 20%, #e54a23 72%);
  background-image: -webkit-linear-gradient(bottom, #e64118 20%, #e54a23 72%);
  background-image: -ms-linear-gradient(bottom, #e64118 20%, #e54a23 72%);
  background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.2, #e64118), color-stop(0.72, #e54a23));
  color: #f5f5f5;
}

#dialer {
  border: solid 1px #ddd;
  border-width: 0 0 0 1px;
  -webkit-transition: opacity 1s;
  transition: opacity 1s;
}

input {
  border: solid 1px #ddd;
  border-bottom-color: #d5d5d5;
  border-radius: 2px 2px 0 0;
  font-size: 16px;
  width: 100%;
  padding: 14px 5px;
  display: block;
  text-align: center;
  margin: 0;
  position: relative;
  z-index: 100;
  -webkit-transition: border-color 1s;
  transition: border-color 1s;
}

#number-entry {
  position: relative;
  height: 48px;
}

.incoming input {
  border: solid 1px red;
}

.incoming #dialer {
  opacity: 0.25;
}

.softphone .incoming-call-status {
  position: absolute;
  display: none;
  top: 100%;
  left: 0;
  right: 0;
  background: red;
  color: #fff;
  font-size: 16px;
  padding: 6px 0;
  text-align: center;
  width: 100%;
  z-index: 200;
  border-radius: 0 0 2px 2px;
  opacity: 0;
  -webkit-transition: opacity 1s;
  transition: opacity 1s;
}

.incoming .incoming-call-status {
  display: block;
  opacity: 1;
}

.number {
  color: #555;
  font-weight: 300;
  cursor: pointer;
  display: inline-block;
  height: 38px;
  line-height: 38px;
  font-size: 21px;
  width: 33.333333333%;
  background-image: linear-gradient(bottom, #e9e9e9 20%, #e5e5e5 72%);
  background-image: -o-linear-gradient(bottom, #e9e9e9 20%, #e5e5e5 72%);
  background-image: -moz-linear-gradient(bottom, #e9e9e9 20%, #e5e5e5 72%);
  background-image: -webkit-linear-gradient(bottom, #e9e9e9 20%, #e5e5e5 72%);
  background-image: -ms-linear-gradient(bottom, #e9e9e9 20%, #e5e5e5 72%);
  background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.2, #e9e9e9), color-stop(0.72, #e5e5e5));
  text-shadow: 0px 1px 0px #f5f5f5;
  filter: dropshadow(color=#f5f5f5, offx=0, offy=1);
  text-align: center;
  box-shadow: inset 1px 0px 0px rgba(255, 255, 255, 0.4),
    inset -1px 0px 0px rgba(0, 0, 0, 0.1),
    inset 0px 1px 0px #f5f5f5,
    inset 0 -1px 0px #d6d6d6;
}

.number.ast {
  font-size: 33px;
  line-height: 32px;
  vertical-align: -1px;
}

.number:hover {
  background-image: linear-gradient(bottom, #f5f5f5 20%, #f0f0f0 72%);
  background-image: -o-linear-gradient(bottom, #f5f5f5 20%, #f0f0f0 72%);
  background-image: -moz-linear-gradient(bottom, #f5f5f5 20%, #f0f0f0 72%);
  background-image: -webkit-linear-gradient(bottom, #f5f5f5 20%, #f0f0f0 72%);
  background-image: -ms-linear-gradient(bottom, #f5f5f5 20%, #f0f0f0 72%);
  background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.2, #f5f5f5), color-stop(0.72, #f0f0f0));
}

.number:active {
  box-shadow: inset 1px 0px 0px rgba(255, 255, 255, 0.4),
    inset -1px 0px 0px rgba(0, 0, 0, 0.1),
    inset 0px 1px 0px #f5f5f5,
    inset 0 -1px 0px #d6d6d6,
    inset 0px 0px 5px 2px rgba(0, 0, 0, 0.15);
}

#action-buttons button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  display: inline-block;
  border: none;
  margin: 0;
  cursor: pointer;
}

#action-buttons .call {
  color: #f5f5f5;
  width: 100%;
  font-size: 18px;
  padding: 8px 0;
  text-shadow: 0px -1px 0px rgba(0, 0, 0, 0.3);
  margin: 0;
  background-image: linear-gradient(bottom, #7eac20 20%, #91c500 72%);
  background-image: -o-linear-gradient(bottom, #7eac20 20%, #91c500 72%);
  background-image: -moz-linear-gradient(bottom, #7eac20 20%, #91c500 72%);
  background-image: -webkit-linear-gradient(bottom, #7eac20 20%, #91c500 72%);
  background-image: -ms-linear-gradient(bottom, #7eac20 20%, #91c500 72%);
  background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.2, #7eac20), color-stop(0.72, #91c500));
  border-radius: 0 0 2px 2px;
}

#action-buttons .answer, #action-buttons .hangup {
  color: #f5f5f5;
  width: 100%;
  font-size: 18px;
  padding: 8px 0;
  text-shadow: 0px -1px 0px rgba(0, 0, 0, 0.4);
  margin: 0;
  background-image: linear-gradient(bottom, #e64118 20%, #e54a23 72%);
  background-image: -o-linear-gradient(bottom, #e64118 20%, #e54a23 72%);
  background-image: -moz-linear-gradient(bottom, #e64118 20%, #e54a23 72%);
  background-image: -webkit-linear-gradient(bottom, #e64118 20%, #e54a23 72%);
  background-image: -ms-linear-gradient(bottom, #e64118 20%, #e54a23 72%);
  background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.2, #e64118), color-stop(0.72, #e54a23));
  border-radius: 0 0 2px 2px;
}

#action-buttons .hold, #action-buttons .unhold, #action-buttons .mute {
  color: #444;
  width: 50%;
  font-size: 14px;
  padding: 12px 0;
  text-shadow: 0px 1px 0px rgba(255, 255, 255, 0.3);
  margin: 0;
  background-image: linear-gradient(bottom, #bbb 20%, #ccc 72%);
  background-image: -o-linear-gradient(bottom, #bbb 20%, #ccc 72%);
  background-image: -moz-linear-gradient(bottom, #bbb 20%, #ccc 72%);
  background-image: -webkit-linear-gradient(bottom, #bbb 20%, #ccc 72%);
  background-image: -ms-linear-gradient(bottom, #bbb 20%, #ccc 72%);
  background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.2, #bbb), color-stop(0.72, #ccc));
  box-shadow: inset 1px 0px 0px rgba(255, 255, 255, 0.4),
    inset -1px 0px 0px rgba(0, 0, 0, 0.1);
}

.mute {
  border-radius: 0 0 0 2px;
}

.hold, .unhold {
  border-radius: 0 2px 0 0;
}

#team-status .agents-status, #team-status .queues-status {
  display: inline-block;
  width: 45%;
  margin: 0;
  font-size: 14px;
  text-align: center;
  padding: 12px 0 16px;
  border-bottom: solid 1px #e5e5e5;
}

#team-status [class*="num"] {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 6px;
}

#call-data {
  display: none;
}

.powered-by {
  text-align: right;
  padding: 10px 0;
}

img {
  width: 100px;
}
```

Finally, we want to set up our softphone frontend code.

Create a folder inside `public` called `js` and add `softphone.js`:

```javascript
$(function() {
	// ** Application container ** //
	window.SP = {}

	// Global state
	SP.state = {};
	SP.agentsRef = {};
	SP.callsRef = {};
	SP.agent = {};
	SP.state.callNumber = null;
	SP.state.calltype = "";
	SP.username = $('#client_name').text();
	SP.currentCall = null;	//instance variable for tracking current connection
	SP.requestedHold = false; //set if agent requested hold button

	SP.functions = {};

	// Get a Twilio Client name and register with Twilio
	SP.functions.getTwilioClientName = function(sfdcResponse) {
		sforce.interaction.runApex('UserInfo', 'getUserName', '' , SP.functions.registerTwilioClient);
	}

	SP.functions.registerTwilioClient = function(response) {
		console.log("Registering with client name: " + response.result);
		// Twilio does not accept special characters in Client names
		var useresult = response.result;
		useresult = useresult.replace("@", "AT");
		useresult = useresult.replace(".", "DOT");
		SP.username = useresult;
		console.log("useresult = " + useresult);

		$.get("/getconfig", {"client":SP.username}, function (data) {
			if( typeof data.api_key !== 'undefined' ){
				// agents...
				SP.agentsRef = new Flybase( data.api_key, data.app_name, 'agents');
				SP.agentsRef.isReady( function(){
					SP.functions.startWebSocket();
				});
				// calls...
				SP.callsRef = new Flybase( data.api_key, data.app_name, 'calls');
			}else{
				console.log( "umm yeah, something's broken. Please fix it");
			}
		});

		$.get("/token", {"client":SP.username}, function (token) {
			Twilio.Device.setup(token, {debug: true});
		});

		$.get("/getcallerid", { "from":SP.username}, function(data) {
			$("#callerid-entry > input").val(data);
		});

	}


	SP.functions.startWebSocket = function() {
		// ** Agent Presence Stuff ** //
		console.log(".startWebSocket...");
		var d = new Date();
		var date = d.toLocaleString();

//		look up or add agent:
		SP.functions.update_agent(SP.username,{
			status: 'LoggingIn',
			readytime: date
		});	
		SP.agentsRef.on('agents-ready', function (data) {
			$("#team-status .agents-num").text( data ); 
		});
		SP.agentsRef.on('in-queue', function (data) {
			$("#team-status .queues-num").text( data);
		});

		SP.agentsRef.onDisconnect( function(){
			// if agent gets disconnected for any reason, then we want to kick them offline...
			SP.agentsRef.trigger('agent-removed',{username: SP.username});
		});
	}

//	update or insert agent.. don't keep re-adding same agent..
	SP.functions.update_agent = function(client, data){
		var d = new Date();
		var date = d.toLocaleString();
		SP.agentsRef.where({"client": client}).once('value').then(function( rec ){
			var agent = rec.first().value();
			for( var i in data ){
				agent[i] = data[i];
			}
			SP.agent = agent;
			SP.agentsRef.push(agent, function(resp) {
				console.log( "agent updated" );
			});				
		}, function(err){
			data.client = client;
			SP.agent = data;
			SP.agentsRef.push(data, function(resp) {
				console.log( "agent inserted" );
			});				
		});
	}

	// ** UI Widgets ** //

	// Hook up numpad to input field
	$("div.number").bind('click',function(){
		//$("#number-entry > input").val($("#number-entry > input").val()+$(this).attr('Value'));
		//pass key without conn to a function
		SP.functions.handleKeyEntry($(this).attr('Value'));	

	});

	SP.functions.handleKeyEntry = function (key) {	
		 if (SP.currentCall != null) {
			console.log("sending DTMF" + key);
			SP.currentCall.sendDigits(key);
		 } else {
			 $("#number-entry > input").val($("#number-entry > input").val()+key);
		 }

	}

	//called when agent is not on a call
	SP.functions.setIdleState = function() {
		$("#action-buttons > .call").show();
		$("#action-buttons > .answer").hide();
		$("#action-buttons > .mute").hide();
		$("#action-buttons > .hold").hide();
		$("#action-buttons > .unhold").hide();
		$("#action-buttons > .hangup").hide();
		$('div.agent-status').hide();
		$("#number-entry > input").val("");
	}

	SP.functions.setRingState = function () {
		$("#action-buttons > .answer").show();
		$("#action-buttons > .call").hide();
		$("#action-buttons > .mute").hide();
		$("#action-buttons > .hold").hide();
		$("#action-buttons > .unhold").hide();
		$("#action-buttons > .hangup").hide();
	}

	SP.functions.setOnCallState = function() {

		$("#action-buttons > .answer").hide();
		$("#action-buttons > .call").hide();
		$("#action-buttons > .mute").show();

		//can not hold outbound calls, so disable this
		if (SP.calltype == "Inbound") {
			$("#action-buttons > .hold").show();
		}

		$("#action-buttons > .hangup").show();
		$('div.agent-status').show();
	}

	// Hide caller info
	SP.functions.hideCallData = function() {
		$("#call-data").hide();
	}
	SP.functions.hideCallData();
	SP.functions.setIdleState();

	// Show caller info
	SP.functions.showCallData = function(callData) {
		$("#call-data > ul").hide();
		$(".caller-name").text(callData.callerName);
		$(".caller-number").text(callData.callerNumber);
		$(".caller-queue").text(callData.callerQueue);
		$(".caller-message").text(callData.callerMessage);

		if (callData.callerName) {
			$("#call-data > ul.name").show();
		}

		if (callData.callerNumber) {
			$("#call-data > ul.phone_number").show();
		}

		if (callData.callerQueue) {
			$("#call-data > ul.queue").show();
		}

		if (callData.callerMessage) {
			$("#call-data > ul.message").show();
		}

		$("#call-data").slideDown(400);
	}

	// Attach answer button to an incoming connection object
	SP.functions.attachAnswerButton = function(conn) {
		$("#action-buttons > button.answer").click(function() {
		conn.accept();
		}).removeClass('inactive').addClass("active");
	}

	SP.functions.detachAnswerButton = function() {
		$("#action-buttons > button.answer").unbind().removeClass('active').addClass("inactive");
	}

	SP.functions.attachMuteButton = function(conn) {
		$("#action-buttons > button.mute").click(function() {
		conn.mute();
		SP.functions.attachUnMute(conn);
		}).removeClass('inactive').addClass("active").text("Mute");
	}

	SP.functions.attachUnMute = function(conn) {
		$("#action-buttons > button.mute").click(function() {
		conn.unmute();
		SP.functions.attachMuteButton(conn);
		}).removeClass('inactive').addClass("active").text("UnMute");
	}

	SP.functions.detachMuteButton = function() {
		$("#action-buttons > button.mute").unbind().removeClass('active').addClass("inactive");
	}

	SP.functions.attachHoldButton = function(conn) {
		$("#action-buttons > button.hold").click(function() {
		 console.dir(conn);
		 SP.requestedHold = true;
		 //can't hold outbound calls from Twilio client
		 $.post("/request_hold", { "from":SP.username, "callsid":conn.parameters.CallSid, "calltype":SP.calltype }, function(data) {
			 //Todo: handle errors
			 //Todo: change status in future
			 SP.functions.attachUnHold(conn, data);

			});

		}).removeClass('inactive').addClass("active").text("Hold");
	}

	SP.functions.attachUnHold = function(conn, holdid) {
		$("#action-buttons > button.unhold").click(function() {
		//do ajax request to hold for the conn.id
		 
		 $.post("/request_unhold", { "from":SP.username, "callsid":holdid }, function(data) {
			 //Todo: handle errors
			 //Todo: change status in future
			 //SP.functions.attachHoldButton(conn);
			});
		
		}).removeClass('inactive').addClass("active").text("UnHold").show();
	}

	SP.functions.detachHoldButtons = function() {
		$("#action-buttons > button.unhold").unbind().removeClass('active').addClass("inactive");
		$("#action-buttons > button.hold").unbind().removeClass('active').addClass("inactive");
	}




	SP.functions.updateAgentStatusText = function(statusCategory, statusText, inboundCall) {

		if (statusCategory == "ready") {
			 $("#agent-status-controls > button.ready").prop("disabled",true); 
			 $("#agent-status-controls > button.not-ready").prop("disabled",false); 
			 $("#agent-status").removeClass();
			 $("#agent-status").addClass("ready");
			 $('#softphone').removeClass('incoming');

		}

		if (statusCategory == "notReady") {
			 $("#agent-status-controls > button.ready").prop("disabled",false); 
			 $("#agent-status-controls > button.not-ready").prop("disabled",true); 
			 $("#agent-status").removeClass();
			 $("#agent-status").addClass("not-ready");
			 $('#softphone').removeClass('incoming');
		}

		if (statusCategory == "onCall") {
			$("#agent-status-controls > button.ready").prop("disabled",true); 
			$("#agent-status-controls > button.not-ready").prop("disabled",true); 
			$("#agent-status").removeClass();
			$("#agent-status").addClass("on-call");
			$('#softphone').removeClass('incoming');
		}

		if (inboundCall ==	true) { 
		//alert("call from " + statusText);
		$('#softphone').addClass('incoming');
		$("#number-entry > input").val(statusText);
		}

		//$("#agent-status > p").text(statusText);
	}

	// Call button will make an outbound call (click to dial) to the number entered 
	$("#action-buttons > button.call").click( function( ) {
		params = {"PhoneNumber": $("#number-entry > input").val(), "CallerId": $("#callerid-entry > input").val()};
		Twilio.Device.connect(params);
	});

	// Hang up button will hang up any active calls
	$("#action-buttons > button.hangup").click( function( ) {
		Twilio.Device.disconnectAll();
	});

	// Wire the ready / not ready buttons up to the server-side status change functions
	$("#agent-status-controls > button.ready").click( function( ) {
		$("#agent-status-controls > button.ready").prop("disabled",true); 
		$("#agent-status-controls > button.not-ready").prop("disabled",false); 
		SP.functions.ready();
	});

	$("#agent-status-controls > button.not-ready").click( function( ) {
		$("#agent-status-controls > button.ready").prop("disabled",false); 
		$("#agent-status-controls > button.not-ready").prop("disabled",true); 
		SP.functions.notReady();
	});

	$("#agent-status-controls > button.userinfo").click( function( ) {
	});

	// ** Twilio Client Stuff ** //
	// first register outside of sfdc


	if ( window.self === window.top ) {	
		console.log("Not in an iframe, assume we are using default client");
		var defaultclient = {}
		defaultclient.result = SP.username;
		SP.functions.registerTwilioClient(defaultclient);
	} else{
		console.log("In an iframe, assume it is Salesforce");
		sforce.interaction.isInConsole(SP.functions.getTwilioClientName);	 
	}
	//this will only be called inside of salesforce

	Twilio.Device.ready(function (device) {
		sforce.interaction.cti.enableClickToDial();
		sforce.interaction.cti.onClickToDial(startCall); 
		var adNag = function() {
			SP.functions.ready();
		};
		setTimeout(adNag, 1500);
	});

	Twilio.Device.offline(function (device) {
		//make a new status call.. something like.. disconnected instead of notReady ?
		sforce.interaction.cti.disableClickToDial(); 
		SP.functions.notReady();
		SP.functions.hideCallData();
	});


	/* Report any errors on the screen */
	Twilio.Device.error(function (error) {
		SP.functions.updateAgentStatusText("ready", error.message);
		SP.functions.hideCallData();
	});

	/* Log a message when a call disconnects. */
	Twilio.Device.disconnect(function (conn) {
		console.log("disconnectiong...");
		SP.functions.updateAgentStatusText("ready", "Call ended");

		
		
		SP.state.callNumber = null;
		
		// deactivate answer button
		SP.functions.detachAnswerButton();
		SP.functions.detachMuteButton();
		SP.functions.detachHoldButtons();
		SP.functions.setIdleState(); 
		
		SP.currentCall = null;
		
		// return to waiting state
		SP.functions.hideCallData();
		SP.functions.ready();
		//sforce.interaction.getPageInfo(saveLog);
	});

	Twilio.Device.connect(function (conn) {

		console.dir(conn);
		var	status = "";

		var callNum = null;
		if (conn.parameters.From) {
			callNum = conn.parameters.From;
			status = "Call From: " + callNum;
			SP.calltype = "Inbound";
		} else {
			status = "Outbound call";
			SP.calltype = "Outbound";

		}

		console.dir(conn);


		SP.functions.updateAgentStatusText("onCall", status);
		SP.functions.setOnCallState();
		SP.functions.detachAnswerButton();

		SP.currentCall = conn;
		SP.functions.attachMuteButton(conn);
		SP.functions.attachHoldButton(conn, SP.calltype);

		//send status info
		SP.functions.update_agent(SP.username,{
			status: 'OnCall'
		});	
	});

	/* Listen for incoming connections */
	Twilio.Device.incoming(function (conn) {
		// Update agent status 
		sforce.interaction.setVisible(true);	//pop up CTI console
		SP.functions.updateAgentStatusText("ready", ( conn.parameters.From), true);
		// Enable answer button and attach to incoming call
		SP.functions.attachAnswerButton(conn);
		SP.functions.setRingState();

		if (SP.requestedHold == true) {
			//auto answer
			SP.requestedHold = false;
			$("#action-buttons > button.answer").click();
		}
		var inboundnum = cleanInboundTwilioNumber(conn.parameters.From);
		var sid = conn.parameters.CallSid
		var result = "";
		//sfdc screenpop fields are specific to new contact screenpop
		sforce.interaction.searchAndScreenPop(inboundnum, 'con10=' + inboundnum + '&con12=' + inboundnum + '&name_firstcon2=' + name,'inbound');

	});

	Twilio.Device.cancel(function(conn) {
		console.log(conn.parameters.From); // who canceled the call
		SP.functions.detachAnswerButton();
		SP.functions.detachHoldButtons();
		SP.functions.hideCallData();
		SP.functions.notReady();
		SP.functions.setIdleState();

		$(".number").unbind();
		SP.currentCall = null;
		//SP.functions.updateStatus();
	});


	$("#callerid-entry > input").change( function() {
		$.post("/setcallerid", { "from":SP.username, "callerid": $("#callerid-entry > input").val() });
	});



	// Set server-side status to ready / not-ready
	SP.functions.notReady = function() {
		SP.functions.update_agent(SP.username,{
			status: 'NotReady'
		});	
		SP.agentsRef.trigger('get-ready-agents',{username: SP.username});
		SP.functions.updateStatus();
	}

	SP.functions.ready = function() {
		SP.functions.update_agent(SP.username,{
			status: 'Ready'
		});	
		SP.agentsRef.trigger('get-ready-agents',{username: SP.username});
		SP.functions.updateStatus();
	}


	// Check the status on the server and update the agent status dialog accordingly
	SP.functions.updateStatus = function() {
		var data = SP.agent.status;
		if (data == "NotReady" || data == "Missed") {
			SP.functions.updateAgentStatusText("notReady", "Not Ready")
		}
		
		if (data == "Ready") {
			SP.functions.updateAgentStatusText("ready", "Ready")
		}
	}

	/******** GENERAL FUNCTIONS for SFDC	***********************/

	function cleanInboundTwilioNumber(number) {
		//twilio inabound calls are passed with +1 (number). SFDC only stores 
		return number.replace('+1',''); 
	}

	function cleanFormatting(number) { 
		//changes a SFDC formatted US number, which would be 415-555-1212		 
		return number.replace(' ','').replace('-','').replace('(','').replace(')','').replace('+','');
	}


	function startCall(response) { 
			
		//called onClick2dial
		sforce.interaction.setVisible(true);	//pop up CTI console
		var result = JSON.parse(response.result);	
		var cleanednumber = cleanFormatting(result.number);
		params = {"PhoneNumber": cleanednumber, "CallerId": $("#callerid-entry > input").val()};
		Twilio.Device.connect(params);

	} 

	var saveLogcallback = function (response) {
		if (response.result) {
			console.log("saveLog result =" + response.result);
		} else {
			console.log("saveLog error = " + response.error);
		}
	};


	function saveLog(response) {
		console.log("saving log result, response:");
		var result = JSON.parse(response.result);

		console.log(response.result);
		
		var timeStamp = new Date().toString();
		timeStamp = timeStamp.substring(0, timeStamp.lastIndexOf(':') + 3);			 
		var currentDate = new Date();			 
		var currentDay = currentDate.getDate();
		var currentMonth = currentDate.getMonth()+1;
		var currentYear = currentDate.getFullYear();
		var dueDate = currentYear + '-' + currentMonth + '-' + currentDay;
		var saveParams = 'Subject=' + SP.calltype +' Call on ' + timeStamp;

		saveParams += '&Status=completed';					
		saveParams += '&CallType=' + SP.calltype;	//should change this to reflect actual inbound or outbound
		saveParams += '&Activitydate=' + dueDate;
		saveParams += '&Phone=' + SP.state.callNumber;	//we need to get this from.. somewhere		
		saveParams += '&Description=' + "test description";	 

		console.log("About to parse	result..");
		
		var result = JSON.parse(response.result);
		var objectidsubstr = result.objectId.substr(0,3);
		// object id 00Q means a lead.. adding this to support logging on leads as well as contacts.
		if(objectidsubstr == '003' || objectidsubstr == '00Q') {
			saveParams += '&whoId=' + result.objectId;					
		} else {
			saveParams += '&whatId=' + result.objectId;			
		}
		
		console.log("save params = " + saveParams);
		sforce.interaction.saveLog('Task', saveParams, saveLogcallback);
	}
});
```

This code is based on the original `softphone.js` code that Charles wrote, but I've added in Flybase queries directly to the frontend, and then set up event listeners.

Once we set up our softphone, we make three ajax calls to our backend:

1. `/getconfig` to return our Flybase info and enable our `agentsRef` and `callsRef` variables. Once `agentsRef` returns `isReady` from Flybase, then we trigger a call to our `startWebSocket` function. `isReady` is a function that we can use with the Flybase client when we wait to until our connection has been established before performing other actions.
2. `/token` which we pass the agent's name and return a twilio capability token to let the agent make and receive calls
3. `/getcallerid` to return the outgoing phone number for the call to use.

We use the `startWebSocket` function (which was based on the original) to set up three event listeners and to update the agent's status as `LogginIn`, and the time they came online.

Later in the Twilio client code, we set the agent to `Ready` once their Twilio client connection has been setup:

```javascript
Twilio.Device.ready(function (device) {
	sforce.interaction.cti.enableClickToDial();
	sforce.interaction.cti.onClickToDial(startCall); 
	var adNag = function() {
		SP.functions.ready();
	};
	setTimeout(adNag, 1500);
});
```

We are going to listen for `agents-ready` and `in-queue` events from our backend to tell the softphone to update the display to show the number of agents who are set to `Ready` and waiting for a call and then number of callers who are in the queue waiting for an agent.

Finally, we're going to use the `onDisconnect` event to fire off an `agent-removed` trigger when the agent goes offline for some reason, such as closing the browser, logging off, etc.

You'll also notice a clone of our `update_agent` function in this file. One of the nice things about using Flybase is we can handle our database updates from either the frontend or the backend so that lets us do a lot that we couldn't before.

The rest of the `softphone.js` file is actually the same as it was before, it talks to talks to the Twilio Client on incoming and outgoing calls and it either gets the client name from the `?client` query string or it gets it from Salesforce, if you are displaying your softphone inside Salesforce.

You may also notice we make use of our new [Promises](http://blog.flybase.io/2016/02/02/promises-lookups/) functionality:

```javascript
SP.functions.update_agent = function(client, data){
		var d = new Date();
		var date = d.toLocaleString();
		SP.agentsRef.where({"client": client}).once('value').then(function( rec ){
			var agent = rec.first().value();
			for( var i in data ){
				agent[i] = data[i];
			}
			SP.agent = agent;
			SP.agentsRef.push(agent, function(resp) {
				console.log( "agent updated" );
			});				
		}, function(err){
			data.client = client;
			SP.agent = data;
			SP.agentsRef.push(data, function(resp) {
				console.log( "agent inserted" );
			});				
		});
	}
SP.functions.update_agent = function(client, data){
		var d = new Date();
		var date = d.toLocaleString();
		SP.agentsRef.where({"client": client}).once('value').then(function( rec ){
			var agent = rec.first().value();
			for( var i in data ){
				agent[i] = data[i];
			}
			SP.agent = agent;
			SP.agentsRef.push(agent, function(resp) {
				console.log( "agent updated" );
			});				
		}, function(err){
			data.client = client;
			SP.agent = data;
			SP.agentsRef.push(data, function(resp) {
				console.log( "agent inserted" );
			});				
		});
	}
```

In `update_agent`, we use promises to either return an existing agent record so we can update or else we create a band new record.

### Deploying to Heroku _(optional)_

_This step is optional, and you can deploy anywhere you like._

You'll want a Heroku account and also to have the [Heroku toolbelt](https://toolbelt.heroku.com/) installed.

Create a file called `Procfile` and include:

```javascript
web: node app.js
```

Now, run the following:

1. `git init`
2. `heroku login` to log into Heroku.
3. `heroku create` to create the application within Heroku.
4. `git push heroku master` to push your git repository to Heroku.
5. `heroku open` to open your browser at your new, custom URL.

### Configuring Salesforce _(optional)_

_This step is optional, the call center works without sales force and in part 2, we'll build a basic CRM that you can integrate this into as well._

This part is actually pretty simple. First, create a file called `TwilioAdapter.xml`:

```javascript
<?xml version="1.0" encoding="UTF-8" ?>
<callCenter>
  <section sortOrder="0" name="reqGeneralInfo" label="General Information">
    <item sortOrder="0" name="reqInternalName" label="InternalName">DemoAdapter</item>
    <item sortOrder="1" name="reqDisplayName" label="Display Name">Demo Call Center Adapter</item>
    <item sortOrder="2" name="reqAdapterUrl" label="CTI Adapter URL">http://YOURWEBSITE.com</item>
    <item sortOrder="3" name="reqUseApi" label="Use CTI API">true</item>
    <item sortOrder="4" name="reqSoftphoneHeight" label="Softphone Height">400</item>
    <item sortOrder="5" name="reqSoftphoneWidth" label="Softphone Width">300</item>
  </section>
  <section sortOrder="1" name="reqDialingOptions" label="Dialing Options">
    <item sortOrder="0" name="reqOutsidePrefix" label="Outside Prefix">9</item>
    <item sortOrder="1" name="reqLongDistPrefix" label="Long Distance Prefix">1</item>
    <item sortOrder="2" name="reqInternationalPrefix" label="International Prefix">01</item>
  </section>
</callCenter>
```

Change the appropriate info to point to your website, then follow these steps:

1. Go to Call Centers > Create
  - Import a call center config included, `TwilioAdapter.xml` -- after import, change the parameter CTI Adapter URL to the Heroku URL created in the first steps `https:/<insert yourherokuappurl`
  - add yourself to the call center under "Manage Call Center users" > Add more users > (find)
2. You should now see a CTI adapter under the Contact tabs. However, you want to use the Service Cloud Console for all cti calls (which prevens browser refreshes that would hang up calls)
3. To create a service cloud console
  - Setup > Create > Apps > New
  - Choose "Console" for type of app
  - give it a name, such as "Twilio ACD"
  - Accept default for logo
  - For tabs, add some tabs to your Service Cloud Console, such as Contacts, Cases
  - accept default for step5 "choose how records display"
  - Set visibility to all (for dev orgs)
  - You've now created an app! You will see you'r console in the App dropdown, for example "Twilio ACD"
4. Configuring screenpops
  - you can configure screenpop response, such as to pop the search screen, in Setup > Call Centers > (your call center) -> Softphone Layout.

These steps were borrowed from Charles' original post as they haven't changed. 

### Finishing up

Now you've got a working real-time call center ACD system that can be used stand alone (as a lone softphone), in a CRM such as Salesforce, or a CRM built entirely around it which we'll do in the next post.

If you're familiar at all with the original client-acd then not much has changed, other than being rewritten in node and using Flybase as the backend / signal system, and that was the plan with this post as I wanted to demonstrate how Flybase can be used within a call center and this one has always been a go to for various projects.

Just a reminder, you can find the full source code [here](https://github.com/flybaseio/callcenter).