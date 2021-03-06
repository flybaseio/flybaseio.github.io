/*
	our functionality app, let's you manage having elements appear on certain pages dynamically, and also looks after the most popular pages widget on home page.
*/
$( document ).ready(function() {
	var dm = new dmBlog();
	dm.start();
});

function hashCode( str ){
	if (Array.prototype.reduce){
		return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
	}
	var hash = 0;
	if (str.length === 0) return hash;
	for (var i = 0; i < str.length; i++) {
		var character  = str.charCodeAt(i);
		hash  = ((hash<<5)-hash)+character;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var dmBlog = function(){
	this.size = window.getComputedStyle(document.body,':after').getPropertyValue('content').replace(/\W/g, '');
	this.url = document.location.pathname;
	return this;
}

dmBlog.prototype.start = function(){
	$('.embed a').embedly({
		key: '34664769afba49b2aeb105bbf54b0a2a',
		display: function(obj){
			// Overwrite the default display.
			if (obj.type === 'video' || obj.type === 'rich'){
				var ratio = ((obj.height/obj.width)*100).toPrecision(4) + '%'
				var div = $('<div class="responsive-object">').css({ paddingBottom: ratio });
				div.html(obj.html);
				$(this).replaceWith(div);
			}
		}
	});

	$.bigfoot({
		actionOriginalFN: "ignore",
		numberResetSelector: "article",
		buttonMarkup: (
			"<a href=\"#\" class=\"footnote-button\" " +
			"id=\"{{SUP:data-footnote-backlink-ref}}\" " +
			"data-footnote-identifier=\"{{FOOTNOTEID}}\" " +
			"data-footnote-style=\"default\"" +
			"alt=\"See Footnote {{FOOTNOTEID}}\" " +
			"rel=\"footnote\"" +
			"data-footnote-content=\"{{FOOTNOTECONTENT}}\">" +
			"{{FOOTNOTENUM}}" +
			"</a>"
		)
	});

	if ( this.size==='desktop') {
		$('.post-sharing,.share-this-post').on('click', 'a', function(event){
			event.preventDefault();
			window.open(
				$(this).attr('href'),
				'_blank',
				'width=800, height=400, top=200, left=300'
			);
		});
	}

/*
	if ( this.url === "/") {
		var page = getParameterByName("p");
		if( page === "" || page === "1" ){
*/
			var popular = new mostPopular().getPages( $("#mostpopularblock") );
/*
		}
	}
*/
	return this;
};

var mostPopular = function(){
	this.api_key = "74c8064f-cd6f-4c07-8baf-b1d241496eec";
	this.db = "dmblog";
	this.collection = "mostpopular";
	this.pages = [];
	this.flybaseRef = new Flybase( this.api_key, this.db, this.collection );
	return this;
};

mostPopular.prototype.getPages = function( div_id ){
	var _this = this;
	var r={
		headline:"Recently popular posts&hellip;",
		clickhere:"(click to load)",
		loading:"(loading&hellip;)"
	};
//	$('<aside id="popular"><header><h1>'+r.headline+"</h1></header></aside>").prependTo( div_id );
	this.flybaseRef.orderBy({"views":-1}).limit(6).on('value',function( data ){
		if( data.count() ){
			var pages = [];
			data.forEach( function(snapshot) {
				var item = snapshot.value();
				pages[item._id] = item;
			});

			var aside = $("#mostpopularblock");

			var ul = $("<ul />");//.attr("style","display:none");
			for( var i in pages ){
				var item = pages[i];
				$('<li/>').attr("id",item._id).prepend(
					$("<a>")
						.attr("href",item.url)
						.attr("title",item.title)
						.attr("data-count",item.views)
						.text(item.title)
				).appendTo( ul );
			}
			aside.append( ul );
//			ul.slideDown(400);
		}
	});
	return this;
};
/*
mostPopular.prototype.getPopular = function() {
		$('<aside id="popular"><header><h1>' + r.headline + "</h1></header></aside>").insertAfter("#welcome"), $.get("/data/twitterpopular.txt?" + Math.floor(400 + 2e3 * Math.random()), function(e) {
			var t = $(e),
				i = $("#popular"),
				o = $("header", i);
			i.append(t), t.slideDown(400), o.removeClass("loading").addClass("loaded"), o.find("h1").html(r.headline), n = !0
		})
	}

	function t() {
		$("#popular").find("a").each(function(e, t) {
			var n = $(t);
			n.text(n.text() + " (" + n.attr("data-count") + ")"), console.log(this)
		})
	}
	var n = !1,
		r = {
			headline: "Recently popular posts&hellip;",
			clickhere: "(click to load)",
			loading: "(loading&hellip;)"
		};
}();
*/

mostPopular.prototype.updatePage = function(url, title){
//	create a unique key from the url by stripping out all non-alphanumeric characters...
	var key = url.replace(/[\/-]/g,'');

	//	get current count and increment it...
	var cnt = 0;
	var _this = this;
	_this.flybaseRef.where({"key": key}).orderBy( {"views":-1} ).on('value').then( function( data ){
/*
		var item = data.first().value();
		item.views = item.views + 1;
		_this.flybaseRef.update(item._id,item, function(resp) {
			console.log( key + " updated" );
		});
*/
		var first = true;
		data.forEach( function(snapshot) {
			var item = snapshot.value();
			if( first ){
				item.views = item.views + 1;
				_this.flybaseRef.update(item._id,item, function(resp) {
					console.log( key + " updated" );
				});
			}else{
				// clean up any dupes until we make this better...
				_this.flybaseRef.deleteDocument(item._id, function(resp) {
					console.log( item._id + " deleted");
				});
			}
			first = false;
		});
	},function(){
		// no count, so never added before..
		_this.flybaseRef.push({
			"key": key,
			"url": url,
			"title": title,
			"views": 1
		}, function(resp) {
			console.log( "URL added" );
		});
	});
	return this;
};
