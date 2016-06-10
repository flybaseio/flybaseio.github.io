---
layout: post 
published: true 
title: "Building a Suggestion Box app" 
date: 2016-06-09T09:51:59.751Z 
tags:
  - code
bodyclass: "post"
---

I wanted to build a simple suggestion box-type app, first page you enter your suggestions, then next page you see suggestions.

You can find the completed code [here](https://github.com/flybaseio/suggestionbox).

In this sample, we have two HTML files, and one javascript file. We're using [Yeti.css](http://yeticss.com) for the CSS rather than bootstrap, you should take a look at that framework as it's nice.

First, let's create our `index.html` file, which is where people will enter suggestions:

```javascript
<html>
<head>
	<title>Suggestion Box</title>	
	<link rel="stylesheet" href="https://cdn.flybase.io/css/base.css">
	<link rel="stylesheet" href="https://cdn.flybase.io/css/light.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/octicons/3.5.0/octicons.min.css">
</head>
<body>
<header role="banner">
    <div class="container">
		<div class="cf"><a href="suggestions.html" title="" class="button button-primary pull-right"><span class="octicon octicon-home"></span> View Suggestions</a></div>
		<h1><span class="mega-octicon octicon-beaker"></span> Suggestion Box</h1>
    </div>
</header>
<div class="container">
	<section>
		<p>We are excited to read your suggestion! All input is 100% anonymous so please provide as much info as possible. The more info you provide, the better we will understand your idea.</p>
		<div class='message' style="display: none;" id="flash"></div>	
		<div class='message message-error' style="display: none;" id="revflash"></div>
		<form id="new_form">
			<fieldset>
				<div class='form-element'>
					<label for='subject'>Subject</label>
					<input type="text" id='subject' data-label="Subject" data-order="1" placeholder='' class='form-input' required>
				</div>
				<div class='form-element'>
					<label for='message'>Your anonymous message</label>
					<textarea id='message' data-label="Your anonymous message" class='form-input' data-order="3" placeholder=""></textarea>
				</div>
				<p><small>Be assured that your message is 100% private, confidential and anonymous. Absolutely no identifying information is sent or saved with your message.</small></p>
				<button type='submit' class='button button-primary'>Submit Feedback</button>
			</fieldset>
		</form>
	</section>
</div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
<script src="https://cdn.flybase.io/flybase.js"></script>
<script src="./assets/app.js"></script>
<script>
	var app = new suggestionsApp();
	app.start().save("new_form");
</script>
</body>
</html>
```

There are a few details about how this form works, we wanted it to be as automated as possible, so when you add form fields, you add two `data-` records:

- `data-label` will tell the app the actual Label to display in the index
- `data-order` is the sort order to display it by.

When data is saved, it will save a `_meta` field which contains sort order, etc for displaying.

If a table field does not have `data-label` then the field will not get saved into the system, as it doesn't know what to do with it.

Now, let's create our `suggestions.html` file, which is the page that displays the suggestions:

```javascript
<html>
<head>
	<title>Suggestion Box</title>
	<link rel="stylesheet" href="https://cdn.flybase.io/css/base.css">
	<link rel="stylesheet" href="https://cdn.flybase.io/css/light.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/octicons/3.5.0/octicons.min.css">
</head>
<body>
<header role="banner">
    <div class="container">
		<div class="cf"><a href="index.html" title="See on Github" class="button button-primary pull-right"><span class="octicon octicon-plus"></span> Add a suggestion</a></div>
		<h1><span class="mega-octicon octicon-beaker"></span> Suggestion Box</h1>
    </div>
</header>
<div class="container" style="margin-top:10px;">
	<section>
		<table id="view_table" class="table-outlined table-striped">
			<thead>
			</thead>
			<tbody>
			</tbody>
		</table>
	</section>
</div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
<script src="https://cdn.flybase.io/flybase.js"></script>
<script src="./assets/app.js"></script>
<script>
	var app = new suggestionsApp();
	app.start().view( "view_table" );
</script>
</body>
</html>
```

This index file will consist of an empty table when first loaded, the main thing to look at is the javascript at the bottom:

```javascript
<script src="app.js"></script>
<script>
	var app = new suggestionsApp();
	app.start().view( "view_table" );
</script>
```

This snippet will include `app.js`, and then load our `suggestionsApp`, it then tells it to create a view table on the table with the ID of `view_table`, the app will then read from your Flybase table and output the table.

---

Ok, let's look at the brains of this app, `app.js`:

```javascript
var suggestionsApp = function(){
	this.url = document.location.pathname;
	return this;
}

suggestionsApp.prototype.start = function(){
	var api_key = "YOUR-FLYBASE-API-KEY";
	var app_name = "suggestionbox";
	
	this.flybaseRef = new Flybase(api_key, app_name, "suggestions");
	return this;
};

suggestionsApp.prototype.view = function( table_name ){
	var self = this;
	var table_name = "#" + table_name;
	var table_headers = [];
	var table_data = [];
	var first = true;
	self.flybaseRef.on('value').then( function( data ){
		$(table_name).find("tbody").html("");
		data.forEach( function( row ){
			var btr = $('<tr>');
			var row = row.value();
			var meta = row['_meta'];
			if( first ){
				var htr = $('<tr>');
				for( var key in meta ){
					var val = meta[key];
					$('<th>' + val + '</th>').appendTo( htr );				
				}
				$(table_name).find("thead").html("").append( htr );
			}
			first = false;
			table_data.push( row );
			for( var i in meta ){
				var key = meta[i];
				var val = row[key];
				if( val === '' ){
					val = '---';
				}
				$('<td>' + val.linkify() + '</td>').appendTo( btr );
			}
			$(table_name).find("tbody").append( btr );
		});
		console.log( "done " );
	});
	return this;
};

//	save the form into your flybase app.
suggestionsApp.prototype.save = function( form_name ){
	var self = this;
	var form_name = "#" + form_name;
	$( form_name ).submit(function( event ) {
		$("#flash").hide();
		$("#revflash").hide();
		var record = {};
		var meta = {};
		$(this).find(':input').each(function(){
			var field_id = $(this).attr('id');
			var label = $(this).data('label');
			var order = $(this).data('order');
			var value = $(this).val();
			if( typeof label !== 'undefined' ){
				meta[order] = label;
				record[label] = value;
			}
			$(this).val("");
		});

		record['_meta'] = meta;
		self.flybaseRef.push( record ).then( function(){
			$("#flash").html("<p>Your message has been saved</p>").show();
			window.location.href = "suggestions.html";
		});
		event.preventDefault();
	});	
	return this;
};

if(!String.linkify) {
	String.prototype.linkify = function() {
		// http://, https://, ftp://
		var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
		
		// www. sans http:// or https://
		var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		
		// Email addresses
		var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

		
		return this
			.replace(urlPattern, '<a href="$&" target="_new">$&</a>')
			.replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
			.replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
	};
}
```

This app really consists of two main functions, `view` and `save`:

```javascript
suggestionsApp.prototype.view = function( table_name ){
	var self = this;
	var table_name = "#" + table_name;
	var table_headers = [];
	var table_data = [];
	var first = true;
	self.flybaseRef.orderBy({"_id":-1}).on('value').then( function( data ){
		$(table_name).find("tbody").html("");
		data.forEach( function( row ){
			var btr = $('<tr>');
			var row = row.value();
			var meta = row['_meta'];
			if( first ){
				var htr = $('<tr>');
				for( var key in meta ){
					var val = meta[key];
					$('<th>' + val + '</th>').appendTo( htr );				
				}
				$(table_name).find("thead").html("").append( htr );
			}
			first = false;
			table_data.push( row );
			for( var i in meta ){
				var key = meta[i];
				var val = row[key];
				if( val === '' ){
					val = '---';
				}
				$('<th>' + val.linkify() + '</th>').appendTo( btr );
			}
			$(table_name).find("tbody").append( btr );
		});
		console.log( "done " );
	});
	return this;
};
```

The `view` function loads data from your Flybase app, ordered by the `_id` field, so the newest is shown on top and outputs it to the table.

Data is sorted by the `order` field in the form fields above and displayed using the `label` field we used, this helps us make a table that's nice and easy to read, rather than just form fields in alphabetical order.

We also parse the text on display so any links become clickable links.

```javascript
//	save the form into your flybase app.
suggestionsApp.prototype.save = function( form_name ){
	var self = this;
	var form_name = "#" + form_name;
	$( form_name ).submit(function( event ) {
		$("#flash").hide();
		$("#revflash").hide();
		var record = {};
		var meta = {};
		$(this).find(':input').each(function(){
			var field_id = $(this).attr('id');
			var label = $(this).data('label');
			var order = $(this).data('order');
			var value = $(this).val();
			if( typeof label !== 'undefined' ){
				meta[order] = label;
				record[label] = value;
			}
			$(this).val("");
		});

		record['_meta'] = meta;
		self.flybaseRef.push( record ).then( function(){
			$("#flash").html("<p>Your message has been saved</p>").show();
		});
		event.preventDefault();
	});	
	return this;
};
```

The `save` function reads the submitted form, grabs the `data-label` and `data-order` fields to store as a `_meta` record and then saves the submitted data as a new document inside the `people` table.


### Finishing Up

This is a really simple app, you can take it and expand on it how ever you want, it was designed for the sole purpose of being fast to work with.

You can add form fields, do whatever you want and have it all work nicely.