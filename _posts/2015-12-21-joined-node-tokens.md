---
layout: post 
published: false 
title: "Using JWT Tokens with your Joined Node Recipes" 
date: 2015-12-21T08:47:32.377Z 
tags:
  - code
ogtype: article 
bodyclass: post 
---

When you create a `Recipe` in [Joined Node](http://joinednode.com), you have two options:

1. **Public** Recipes can be called at anytime, with or without an auth token.
2. **Private**: Recipes are Recipes that require `authentication` using a Joined Node token. The token can be provided either using the Authorization request header, or via the `token` URL query parameter.

Using the `Authorization` header is recommended as this prevents certain cases where your token can be cached by intermediate HTTP processors.

Unauthenticated requests will result in a `403` response.

Tokens can be presented with the `Authorization: Bearer {token}` HTTP request header.

Tokens can also be presented with the `token={token}` URL query parameter

There are various reasons for using one over the other, a `public` Recipe is one that you can call at anytime, and doesn't worry about data being passed.

A `private` Recipe is one that you may not want everyone to be able to call, for example if it sends emails or SMS messages, or posts notifications to your Slack channel.

Creating a JWT auth token is pretty easy, you just have to trigger a post to the `/create-token` endpoint with your Joined Node `container`:

```javascript
HTTP POST  https://api.joinednode.com/create-token/<your-container-id>
```

This will return a token that is valid for 10 days and can be used to access Recipes inside your container only.

Using these tokens, you can then access your Recipes using either:

```javascript
https://api.joinednode.com/run/<your-container-id>/<your-Recipe-id>?token=<your-auth-token>
```

Or using `Authorization: Bearer {token}` headers:

```javascript
var url = "https://api.joinednode.com/run/<your-container-id>/<your-Recipe-id>";
var data = { "hi": "me"};
var token = "<your-auth-token>";

call_Recipe(url, data, token, function(result){
	console.log( result.message );	
});

function call_Recipe( url, data, token, callback ){
	var req = new XMLHttpRequest();
	req.open(type, url, true);
	req.setRequestHeader(l, 'Authorization: Bearer ' + token);
	req.onload = function() {
		if (req.status >= 200 && req.status < 400){
			var res = req.responseText;
			JSON.parse(res);
			callback( res );
		}
	};
	req.send( data );
}
```

So we have multiple ways to call our recipes using our tokens, and we have several ways to use our tokens.

This all adds to helping your secure your Joined Node Recipes, and build cool things.
