---
layout: "post"
title: "Startup Landing Pages with Flybase"
tags: 
- "code"
date: "2015-07-23 15:14:40"
ogtype: "article"
bodyclass: "post"
---

Lately, _Landing Page_ has become common and popular among startups and publishers. Every landing page has one important call-to-action, i.e. to sign up early adopters for their beta version.

To get up & running as soon as possible, the simplest and fastest way to build a landing page is basically having it as a static site without any back end. The downside of this approach is, we need to figure out a way to store the emails that are signed up. As you would expect, there are quite a few really good services you can use right of the bat.

* [Launch Rock](http://launchrock.co/)
* [Unbounce](http://unbounce.com)
* [Kickofflabs](http://www.kickofflabs.com/)
* [My Beta List](http://my.betali.st/)
* [Launch Effect (wordpress)](http://launcheffectapp.com/)
* [Prefinery](http://www.prefinery.com/)
* [LaunchGator](http://launch.deskgator.com/)
* [QuickMVP](http://quickmvp.com)
* [MailChimp](http://mailchimp.com/)

Some of the above services even provides HTML templates, A/B testing and much more. For a non-developer these sites would be the best fit.

If you know a bit of web development and want to build you own custom landing page, then one easy solution to use is to use [Flybase](http://flybase.io/) to not only collect emails but even feedback. 

In this brief post, I'm going to show you how to use Flybase to build out that part of a landing page.

### Flybase Email Storage

Once you have created a [flybase account](https://app.flybase.io/signup) and logged in, create a flybase application.

You need to include the **flybase javascript** in your landing page. This provides the functionality to save your data (e.g. email) into your **flybase application**.

`<script src="https://cdn.flybase.io/flybase.js"></script>`

##### Email Signup Form

Here is a basic HTML template for an email sign up form.

```javascript
<div class="signup">
	<h2 class="signup-title">Sign up for beta</h2>
	<p id="signup-success" class="text-success"></p>
	<p id="signup-error" class="text-danger"></p>
	<form class="signup-form form-inline" id="signup-form" role="form" onsubmit="return signup(this)">
		<input class="form-control" name="email" type="email" placeholder="Your email. eg., joe@acme.com" required>
		<button class="btn btn-success" id="signup-button" type="submit" >Join now</button>
	</form>
</div>
```

##### Flybase script to save email addresses

On the submission of the button, the below script is invoked to store the email address into your **flybase application**.

```javascript
<script>
	var signupForm = document.getElementById('signup-form');
	var signupSuccess = document.getElementById('signup-success');
	var signupError = document.getElementById('signup-error');
	var signupBtn = document.getElementById('signup-button');
	var onSignupComplete = function(error) {
	  signupBtn.disabled = false;
	  if (error) {
		signupError.innerHTML = 'Sorry. Could not signup.';
	  } else {
		signupSuccess.innerHTML = 'Thanks for signing up!';
		// hide the form
		signupForm.style.display = 'none';
	  }
	};
	function signup(formObj) {
		// Store emails to flybase
		var myFlybaseRef = new Flybase("YOUR-API-KEY", "YOUR-APP", "signups");
		myFlybaseRef.push({
		  email: formObj.email.value,
		}, onSignupComplete);
		signupBtn.disabled = true;
		return false;
	}
</script>
```

---

### Contact / feedback forms

You can also store the feedback, suggestions and questions into your **flybase application**.

Here is a basic HTML template for a contact form:

```javascript
<div class="contact">
	<h2 class="contact-title">Send us a message</h2>
	<p id="contact-success" class="text-success lead"></p>
	<p id="contact-error" class="text-danger lead"></p>
	<form class="contact-form" id="contact-form" role="form" onsubmit="return sendMessage(this)">
		<input class="form-control" name="name" type="text" placeholder="Your name. eg., Joe" required>
		<input class="form-control" name="email" type="email" placeholder="Your email. eg., joe@acme.com" required>
		<textarea class="form-control" name="message" placeholder="Your message for us" rows="5" required></textarea>
		<br />
		<button class="btn btn-success pull-right" id="send-button" type="submit" >Send Message</button>
	</form>
</div>
```

On submission, the below script is invoked to save your email address along with the message into your **flybase application**.

```javascript
<script>
	// Send message
	var contactFrom = document.getElementById('contact-form');
	var contactSuccess = document.getElementById('contact-success');
	var contactError = document.getElementById('contact-error');
	var sendBtn = document.getElementById('send-button');
	var onMessageComplete = function(error) {
	  sendBtn.disabled = false;
	  if (error) {
		contactError.innerHTML = 'Sorry. Could not send message.';
	  } else {
		contactSuccess.innerHTML = "Message has been sent.";
		// hide the form
		contactFrom.style.display = 'none';
	  }
	};
	function sendMessage(formObj) {
		// Store emails to flybase
		var myFlybaseRef = new Flybase("YOUR-API-KEY", "YOUR-APP", "messages");
		myFlybaseRef.push({
		  name: formObj.name.value,
		  email: formObj.email.value,
		  message: formObj.message.value
		}, onMessageComplete);
		sendBtn.disabled = true;
		return false;
	}
</script>
```

And there it is, one of the simplest way to handle forms in your landing page. When we launched this project last fall, we actually used this same process to handle beta signups, so this is a tried and true simplistic method.

From here, You can embed this into any landing page to give yourself a method for collecting emails, then you could quickly use Node.js or PHP to loop through subscribers and send an email, or add them to your mailchimp account via their API, 

You could even combine it with [Zapier.com](https://zapier.com/developer/invite/16474/c7e21a32efea8e57a70936b738918438/) to send emails to Mailchimp or just straight to your inbox, depending on the type of form you've set up. 

Simple, but flexible, feel free to check out this [basic landing page](http://flybaseio.github.io/landing-page/) here to see how it works and feel free to [fork the repo](https://github.com/flybaseio/landing-page/blob/master/index.html) and add your own touches to it.