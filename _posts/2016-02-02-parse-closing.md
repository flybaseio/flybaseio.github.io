---
layout: post 
published: true 
title: "So Parse is closing, what does that mean?" 
date: 2016-02-02T06:34:56.257Z 
tags: 
- "parse"
ogtype: article 
bodyclass: post 
---

Last week, Parse.com announced that they were going away in a year, what does that mean for developers who are already using Parse?

That means finding somewhere else to store your data.

Flybase isn't going anywhere, and we are continuing our roadmap to help developers build better apps.

Since the announcement last week, we've had people contact us about importing their data from their Parse apps and setting up their Cloud Code.

To help with this, we've made a Flybase adapter for Parse Server so data is stored on Flybase and the Parse client code stays the same, which means less work for developers to update their apps.

Your code won't even have to change as the Flybase work is handled in the backend of our modified Parse Server code. We can also help you set up a push notification replacement to work with your Parse apps now.

<hr />

### I don't care about cloud code or push, I just want to move my data

If that's you, then we've got you covered:

#### Step 1 - How to export from Parse

1. First, go to your <a href="http://parse.com">Parse.com</a> dashboard
2. Click on `« App Settings »`.
3. Then select `« General »`
4. Scroll down and click on `« Export data »` button.
5. If everything goes well, you will receive an email containing a .zip with all your data in a set of JSON files.

#### Step 2 - Import to Flybase

The exported JSON can be imported using our `Parse to Flybase` tool, which parses all your JSON files and imports it into your Flybase app, this is a fork of our usual `Flybase import` tool, as we wanted to make sure it fully supported Parse's exports for you.
		
```javascript
$ npm install parse2flybase

$ parse2flybase --flybase_key API-KEY --flybase-app Test --flybase_collection Stuff --json test.json

All data at Test/Stuff will be overwritten.
Press <enter> to proceed, Ctrl-C to abort.

Reading /Users/roger/test.json... (may take a minute)
Preparing JSON for import... (may take a minute)
Importing [=================================================] 100% (9431/9431)
Import completed.
```

And that's it, you've imported your Parse.com data into Flybase, now it's just a matter of switching your app to use Flybase instead.
		
You can try our <a href="http://flybase.io/tutorial/">Tutorial</a> to see how easy it is to get started, check out our <a href="http://docs.flybase.io">Developer Docs</a> for any questions you have, or <a href="/contact/">contact us</a> and we'll be glad to help you migrate your data and code from Parse to Flybase

If you are an existing Parse user, [contact us](http://flybase.io/contact/) about migrating from Parse, we can help you get your data moved over, cloud code moved over and set up your Parse hosting on a new web host.

### Need migration support?

Please feel free to <a href="http://flybase.io/contact/">contact us</a> to answer any questions you have about moving your data from Parse to Flybase and how our experts can help facilitate that migration as smoothly as possible.
