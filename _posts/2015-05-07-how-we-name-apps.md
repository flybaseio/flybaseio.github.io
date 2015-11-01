---
layout: "post"
title: "How We Use Haikus To Name Our Apps"
tags: 
- "code"
date: "2015-05-07 08:30:01"
image: "http://blog.datamcfly.com/images/posts/words.jpg"
ogtype: "article"
bodyclass: "post"
---

<div class="box-wrap"><div class="box">
	<img src="/images/posts/words.jpg" />
</div></div>

When you create an app inside Data McFly, we assign a unique name to it, this isn't used much by you, our users, yet but we use it internally for various things.

The names we generate follow a `haiku` style, similar to that used by heroku.com when you create an app. Which means our internal app names will appear like `delicate-dawn-13061` or something similar.

The dictionary we use is bigger, but here is a good example of how our haiku generator works below:

```javascript
	function haiku(){
		var adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
			"dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
			"winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
			"blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
			"long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
			"red", "rough", "still", "small", "sparkling", "shy",
			"wandering", "withered", "wild", "black", "young", "holy", "solitary",
			"fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
			"polished", "ancient", "purple", "lively", "nameless"];

		var nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
			"morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
			"glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
			"brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
			"firefly", "feather", "grass", "haze", "mountain", "night", "pond",
			"darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
			"thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
			"sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
			"frog", "smoke", "star"];
		
		var unix = Math.round(+new Date()/1000)+Math.floor(Math.random()*(Math.round(+new Date()/1000)));  
		var stamp = (""+unix).slice(-5);
		
		return adjs[Math.floor(Math.random()*(adjs.length-1))]+"-"+nouns[Math.floor(Math.random()*(nouns.length-1))]+"-"+stamp;
	}
	
	console.log( haiku() );
```

It grabs a random word from the `adjs` array, and a random word from the `nouns` array, followed by grabbing a random five digit number created by taking the current timestamp and adding it to a randomly generated number.

We may go overkill on our random number, but it works nicely.

Then, when a user creates a new app, we call the `haiku()` command and create a random haiku like `divine-dust-12990` for example.

The larger your dictionary, the more variety of words you get, but if it's too large then that can slow things down so it's nice to find a good balance there. We have our dictionary tied into an internal API so we retrieve a random list of adjectives and nouns to use, the list in this sample function is a representative of our usual randomly retrieved lists.

Our haiku names will be of use to users shortly with our next few updates as we get a couple new features ready to launch, but I wanted to share how we do this now. :)