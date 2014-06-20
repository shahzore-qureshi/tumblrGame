jsio('from util.browser import $');

var cbs = [];

$.onEvent(window, 'resize', function() {
	var len = cbs.length,
		dim = $(window);
	for(var i = 0; i < len; ++i) {
		cbs[i](dim.width, dim.height);
	}
});

var onResize = exports = function(cb) {
	if (typeof cb != 'function') {
		cb = bind.apply(this, arguments);
	}
	
	cbs.push(cb);
	return cb;
}

exports.centerVertical = function(el) {
	var dim = $(window);
	onResize(function(width, height) {
		el.style.y = Math.max(0, (height - el.offsetHeight) / 2);
	})(dim.width, dim.height);
}

exports.centerHorizontal = function(el) {
	var dim = $(window);
	onResize(function(width, height) {
		el.style.x = Math.max(0, (width - el.offsetWidth) / 2);
	})(dim.width, dim.height);
}

exports.center = function(el) {
	exports.centerVertical(el);
	exports.centerHorizontal(el);
}