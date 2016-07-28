---
layout: post 
published: true 
title: "Running self-hosted Sentry on Heroku"
date: 2016-07-28T10:51:23.654Z 
tags:
  - code
ogtype: article 
bodyclass: post 
---

_Sentry is a real-time event logging and aggregation platform. At its core it specializes in monitoring errors and extracting all the information needed to do a proper post-mortem without any of the hassle of the standard user feedback loop._

The guys at [Sentry](https://getsentry.com/) provide a great product for monitoring web apps and alerting people of any issues.

We use Sentry heavily here at Flybase, from monitoring our APIs, to monitoring our sites, any errors occur and we get notified right away so we can assign and fix them ASAP.

Sentry provides a hosted model and a self-hosted model. We use the self-hosted model  and wanted to share how it's set up on Heroku.

We have a [repo](https://github.com/flybaseio/sentry-on-heroku/blob/master/app.json) set up which is a fork of the original [Fast Monkey](https://github.com/fastmonkeys/sentry-on-heroku) repo. The main differences are the original repo required you to use a paid redis instance rather than a hobby instance and also we changed how the background worker is handled. Minor changes, but handy.

---

## Setting it up

### Auto setup

From the [repo](https://github.com/flybaseio/sentry-on-heroku) you can actually get started quickly by pushing the purple `Deploy to Heroku` button, this will start the process of setting up your Sentry app.

Once set up, you need to create your first user:

```javascript
heroku run "sentry --config=sentry.conf.py createuser" --app YOURAPPNAME
```

Finally you want to configure the worker:

```javascript
heroku ps:scale worker=0 beat=0 worker_plus_beat=1 --app YOURAPPNAME
```

### Manual setup

Follow the steps below to get Sentry up and running on Heroku:

1) Create a new Heroku application. Replace "APP_NAME" with your application's name:

```javascript
heroku apps:create APP_NAME
```

2) Add PostgresSQL to the application:

```javascript
heroku addons:create heroku-postgresql:hobby-dev
```

3) Add Redis to the application:

```javascript
heroku addons:create heroku-redis:hobby-dev
```

4) Set Django's secret key for cryptographic signing and Sentry's shared secret for global administration privileges:

```javascript
heroku config:set SECRET_KEY=$(python -c "import base64, os; print(base64.b64encode(os.urandom(40)).decode())")
```

5) Set the absolute URL to the Sentry root directory. The URL should not include a trailing slash. Replace the URL below with your application's URL:

```javascript
heroku config:set SENTRY_URL_PREFIX=https://sentry-example.herokuapp.com
```

6) Deploy Sentry to Heroku:

```javascript
git push heroku master
```

7) Run Sentry's database migrations:

```javascript
heroku run "sentry --config=sentry.conf.py upgrade --noinput"
```

8) Create a user account for yourself:

```javascript
heroku run "sentry --config=sentry.conf.py createuser"
```

9) Configure workers

```javascript
heroku ps:scale worker=0 beat=0 worker_plus_beat=1
```

### Email notifications

Follow the steps below, if you want to enable Sentry's email notifications:

1) Add SendGrid add-on to your Heroku application:

```javascript
heroku addons:create sendgrid
```

2) Set the `reply-to` email address for outgoing mail:

```javascript
heroku config:set SERVER_EMAIL=sentry@example.com
```

---

## Working with Sentry

When you login to Sentry, you can create projects, each project will get assigned a unique URL to use with your tracking.

Once setup, you can use Sentry for just about any type of client, for example to add Sentry to your front end Javascript apps, you would use the Raven client:

```javascript
<script src="https://cdn.ravenjs.com/3.3.0/raven.min.js"></script>
<script>
	Raven.config('https://YOUR-SENTRY-URL/<project>').install()
</script>
```

Then you can catch errors or send messages pretty easily:

**Reporting Errors:**

By default, Raven makes a best effort to capture any uncaught exception.

To report errors manually, wrap potentially problematic code with a try...catch block and call Raven.captureException:

```javascript
try {
    doSomething(a[0])
} catch(e) {
    Raven.captureException(e)
}
```

**Capturing Messages:**

Sentry can be used to capture any message not just Exceptions:

```javascript
Raven.captureMessage('Broken!')
```

**Tracking Users:**

Sentry can also be told to associate errors with user data, for example we can set it to associate errors with the logged in user:

```javascript
Raven.setUserContext({
    email: 'matt@example.com',
    id: '123'
})
```

If at any point, the user is no longer authenticated,  then you can call `Raven.setUserContext()` with no arguments to remove their data.

**tags**

You can assign tags to an event:

```javascript
Raven.setTagsContext({ version: "1.0.4" });
```

**Getting Back an Event ID:**

An event id is a globally unique id for the event that was just sent. This event id can be used to find the exact event from within Sentry.

This is often used to display for the user and report an error to customer service.

`Raven.lastEventId()` will be undefined until an event is sent. After an event is sent, it will contain the string id.

```javascript
Raven.captureMessage('Broken!')
alert(Raven.lastEventId())
```

**User Feedback:**

Often you might find yourself wanting to collect additional feedback from the user. Sentry supports this via an embeddable widget.

```javascript
try {
    handleRouteChange(...)
} catch (err) {
    Raven.captureException(err);
    Raven.showReportDialog();
}
```

**Sentry and Angular:**

The Sentry Raven client also has a plugin for Angular that can integrate directly into your apps (it has integrations for nearly everything):

```javascript
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.5/angular.min.js"></script>
<script src="https://cdn.ravenjs.com/3.3.0/angular/raven.min.js"></script>
<script>
	Raven.config('https://YOUR-SENTRY-URL/<project>').install();
	var myApp = angular.module('myApp', [
  'ngRaven',
  'ngRoute',
  'myAppControllers',
  'myAppFilters'
]);
</script>

```

---


You can find a lot of information on the actual [Sentry Docs page](https://docs.getsentry.com/on-premise/), I just wanted to show some of the basics to get started.

Sentry is a powerful tool for monitoring your apps, and once you add plugins such as Slack notifications, you can get notified right away in case of problems.

We chose to run Sentry on Heroku so it's kept separate from our other servers and able to not be affected by any server issues.

Flybase also features 100% uptime with no downtime at all since we launched two years ago so tools like Sentry help us keep it that way.