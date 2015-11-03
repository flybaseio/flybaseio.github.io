---
layout: post 
published: false 
title: "flybaseio.github.io/add-draft.html at master · flybaseio/flybaseio.github.io" 
date: 2015-11-03T07:51:41.197Z 
link: https://github.com/flybaseio/flybaseio.github.io/blob/master/add-draft.html 
tags:
  - links
ogtype: article 
bodyclass: post 
---

> f (query_params) {
			src_body = '';
			if (query_params['title']) {
				var src_title = query_params['title'];
				$('#p_title').val(src_title);
			}
			if (query_params['selection']) {
				var src_body = '> ' + query_params['selection'];
			}
			if (query_params['body']) {
				var src_body = query_params['body'];
			}
			if (query_params['url']) {
				var src_url = query_params['url'];
//				src_body = src_body + ' &#x2014;['+src_title+'](' + query_params['url'] + ')\n' ;
				$('#p_link').val( src_url );
			}
			$('#p_body').val(src_body);
		}