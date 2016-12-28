---
layout: "post"
title: "Using Custom Event Notifications"
date: "2015-02-24 11:49:10"
tags: 
- "inside"
- "code"
image: "http://blog.datamcfly.com/images/posts/events.jpg"
ogtype: "article"
bodyclass: "post"
---

<div><div class="image splash">
	<img src="http://blog.datamcfly.com/images/posts/events.jpg" />
</div></div>

You know about the [reserved events](http://datamcfly.com/docs/web/guide/reading-data.html) such as `value`, `added`, `changed`, `online` or `removed`, but did you know we also have custom events?

Custom events can be handy for passing messages or data between devices, users, different collections or even different parts of the same app.

Here's one basic example of a custom event listener:

```javascript
datamcfly.on("custom_event", function(message) {
	console.log( message );
});

datamcfly.trigger("custom_event", "Hi")
```

In this example, we set up a listener for a custom event called `custom_event`, and then we triggered that event with a message.

In this case, the message was `Hi`.

Just like reserved events, custom events are linked to a collection, but unlike reserved events no data is ever written to disk. 

### What can you do with custom events?

Custom events are handy in that you can use them for nearly anything. 

For example, you could set up a custom event for a collection called `users` and fire off a message everytime a user logs in or joins which would be seen by all other users currently logged in.

This could also be useful for displaying activity streams, for example we'll build a basic activity stream now that will display notifications on a page to all users.

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Custom events demo</title> 
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script src="https://cdn.datamcfly.com/DataMcFly.js?latest=1"></script>
</head>
<body>
	<div id="activity_stream"></div>
	<script>
		var datamcflyRef = new DataMcFly("YOUR-API-KEY", "YOUR-APP", "activity");
		datamcfly.on("activity", function(message) {
			displayMessage(message);
		});

		function displayMessage(message) {
			$('<div/>')
				.text(message.text)
				.appendTo($('#messagesDiv'));
			$('#activity_stream')[0].scrollTop = $('#activity_stream')[0].scrollHeight;
		}
	</script>
</body>
</html>
```

Now, whenever you send a trigger to the `activity` event, it will display to any users who are listening.

```javascript
	datamcfly.trigger("activity", "Data McFly has logged in");
```

Custom events aren't limited to just strings, they can also contain JSON objects.

```javascript
datamcfly.on("custom_event", function(message) {
	var name = message.name;
	var msg = message.msg;
	alert( name + " Said: " + msg );
});

datamcfly.trigger("custom_event", {"name":"Data McFly","msg":"Hello"});
```


There are plenty of other uses for being able to instantly push custom events to users of your apps, but this is one example.

Custom events helps increase how you can make your apps useful to your users, thereby making life easier for everyone.