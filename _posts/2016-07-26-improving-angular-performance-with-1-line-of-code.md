---
layout: post 
published: true 
title: "Improving Angular performance with 1 line of code" 
date: 2016-07-27T04:51:23.654Z 
link: https://medium.com/swlh/improving-angular-performance-with-1-line-of-code-a1fb814a6476#.cxlkfcmhl 
tags:
  - links
  - code
ogtype: article 
bodyclass: post 
---

```javascript
myApp.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);
```

> I’m on Genius.com and I right click over some text and click “Inspect Element” for I’m not sure what reason, as any good web developer does. Generally, I’ll see nothing particularly interesting as I’m reviewing the elements that comprise the fabric of our modern WWW; usually it’s divs in divs in divs and about 100 classes per each (and that’s fine as far as this developer is concerned). On this site, however, something caught my eye.

This is actually talked about in the [AngularJS Docs](https://docs.angularjs.org/guide/production):

> You can disable this in production for a significant performance boost with:

```javascript
myApp.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);
```

> If you wish to debug an application with this information then you should open up a debug console in the browser then call this method directly in this console:

```javascript
angular.reloadWithDebugInfo();
```

> The page should reload and the debug information should now be available.

Handy to keep in mind for production Angular apps.
