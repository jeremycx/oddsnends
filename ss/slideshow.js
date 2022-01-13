// random sort:
// x.sort(function(a,b) { return (Math.random() > 0.5 ? 1 : -1); })


$(document).ready(function() {
    $('body').click(function(e) { document.body.requestFullscreen(); });
    var subreddit = getUrlParameter("subreddit", "catpictures+catpics+kittens");
    var delay     = getUrlParameter("delay", 8);
    var limit     = getUrlParameter("limit", 100);

    delay = parseInt(delay) * 1000;

    document.title = subreddit.replace(/\+/, ' ');

    window.onerror = function(e) {
        document.getElementById('errordiv').innerHTML(e.toString());
    };

    loadPage({
        URL: 'https://www.reddit.com/r/'+subreddit+'.json?jsonp=jsonP',
        // URL: 'https://www.reddit.com/me/m/zantosubreddits.json?jsonp=jsonP',
        limit: limit,
        onImage: function(item) {
            if (item.url.match(/gifv$/)) {
                item.url = item.url.replace(/\.(gifv)$/, '.mp4');
                $('body').append('<div class="slide inactive"><video muted loop class="content"><source src="'+item.url+'" type="video/mp4"></video><h1 class="title"><img src="info-icon.png"> [v] '+item.title+'</h1></div>');
            } else {
                $('body').append('<div class="slide inactive"><img class="content" src="'+item.url+'"><h1 class="title"><img src="info-icon.png"> '+item.title+'</h1></div>');
            }
        },
        onComplete: function() {
            showNext();
            setInterval(showNext, delay);
        }
    });
});

function getUrlParameter(sParam, default_val) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
	sURLVariables = sPageURL.split('&'),
	sParameterName,
	i;

    for (i = 0; i < sURLVariables.length; i++) {
	sParameterName = sURLVariables[i].split('=');

	if (sParameterName[0] === sParam) {
	    return sParameterName[1] === undefined ? default_val : sParameterName[1];
	}
    }
    return default_val;
};

function setAspect(e) {
    if (e[0].tagName === 'VIDEO') {
        return;
    }

    var d1 = $(window).width() - e.width();
    var d2 = $(window).height() - e.height();

    if (e.width() < 500 || e.height() < 500) {
        e.addClass('native');
    } else if (d1 < d2) {
        e.addClass('landscape');
    } else {
        e.addClass('portrait');
    }
}

function loadPage(opt) {
    var URL = opt.URL;
    var next = opt.next;
    var limit = opt.limit;
    var count = opt.count!==undefined?opt.count:0;
    var depth = opt.depth!==undefined?opt.depth:0;
    var onImage = opt.onImage;
    var onComplete = opt.onComplete;

    $.ajax({
	jsonpCallback: 'jsonP',
	contentType: "application/json",
	dataType: 'jsonp',
	type: "GET",
	url: URL + (next===undefined?'':'&after='+next),
	success: function(data) {
            next=data.data.after;
            data.data.children.forEach(function(item) {
                if (item.data.url.match(/\.(jpe?g|gif|png|gifv)$/)) { // |svg|webp|gifv)$/)) {
                    count++;
                    onImage({
                        url: item.data.url,
                        title: item.data.title
                    });
                }
            });
            if (count < limit && depth++ < 50) {
                loadPage({
                    URL: URL,
                    next: next,
                    limit: limit,
                    depth: depth,
                    count: count,
                    onImage: onImage,
                    onComplete: onComplete
                });
            } else {
                onComplete();
            }
	}
    });
}

function flip() {
    var x = $('.inactive');
    var y = $('.active');
    y.removeClass('active').addClass('inactive');
    x.removeClass('inactive').addClass('active');
    return y;
}

function showNext() {
    var current = $('.active');
    var next = current.next();

    if (next.length < 1) {
        next = $('.slide:first');
        console.log('RESTART');
    }
    var nextContent = next.find('.content');

    setAspect(nextContent);
    if (nextContent[0].tagName === 'VIDEO') {
        nextContent.get(0).play();
    }
    current.removeClass('active').addClass('inactive');
    next.removeClass('inactive').addClass('active slide');

    return next;
}
