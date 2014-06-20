import ui.ImageScaleView as ImageScaleView;

exports = Class(ImageScaleView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this.style.visible = false;

		this._adventureMapView = this._superview.getSuperview().getSuperview();
		this._tile = opts.tile;
		this._tag = opts.tag;
	};

	this.onInputSelect = function() {
		this._adventureMapView.emit('ClickTag', 'Player', this._tile);
	};
});