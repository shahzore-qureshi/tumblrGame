import .NodeItemView;

exports = Class(NodeItemView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this.style.width = 200;
		this.style.height = 200;
		this.style.backgroundColor = 'red';

		this.offsetY = -100;
	};

	this.update = function (tile) {
		this.style.visible = true;
	};
});