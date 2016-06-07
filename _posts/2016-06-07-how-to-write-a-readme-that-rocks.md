---
layout: post 
published: true 
title: "How to write a README that rocks" 
date: 2016-06-07T16:07:39.818Z 
link: https://dotdev.co/how-to-write-a-readme-that-rocks-bc29f279611a#.51ggcck4l 
tags:
  - links
  - code
ogtype: article 
bodyclass: post 
---

Eric L. Barnes

> Developers love to share code in the form of packages, full apps, or tiny modules. Sharing is great, but one area that a lot of developers forget about is the readme file. This file is now arguably one of the most important pieces for your project and one that a lot of users don’t spend any time on.
> 
> A README first started as a guide for developers. You would access it after downloading the code, and it would show instructions related to configuration, installation, copyright, troubleshooting, and more. As popular code repositories started implementing these as the main page of the project they have now transitioned from being straight technical information to being a project home page. This shift in display means they have transitioned from straight developer docs to marketing and basic project information.
> 
> Think about the last open source project you looked at. Chances are you had a problem and needed a solution. You found something that sounded reasonable and looked at the readme to see if it would indeed solve it. Of course, that is your primary reason for looking but you should also consider the following questions:
> 
> 1. Will it solve my problem?
> 2. Can I trust this code?
> 3. Can I trust the team/developer who created it?
> 4. Will I be able to get help if I’m stuck?
> 5. Are issues or pull requests dealt with?
> 6. Am I willing to keep this updated if this project dies?
> 7. Can I build this easier myself?
> 
> If you are not comfortable answering yes to most of these, then it’s time to move on. Even if a package would work, the developer has a responsibility to instill confidence in the project because like it or not you are the one that is taking the risk by including their work.
> 
> By working through these common questions let’s look at how to build a readme that instills trust, answers objections, and shows the readers why your code is worthy of being included in their project.

We've been restructuring the READMEs on our various projects in github along these lines so I wanted to share this excellent guide on READMEs.

Eric's recommend structure (and which can be found here with his [README generator](http://michaeldyrynda.github.io/readme-generator/)) is:

1. Project Title
2. Introduction
  - An introduction or lead on what problem you're solving. Answer the question, "Why does someone need this?"
3. Highlighted Code Samples (if any)
  - You've gotten their attention in the introduction, now show a few code examples. So they get a visualization and as a bonus, make them copy/paste friendly.
4. Installation / setup
  - The installation instructions are low priority in the readme and should come at the bottom. The first part answers all their objections and now that they want to use it, show them how.

I would also recommend a 5th one for support, with a link for email or to the issues section of the Repo.
