import animate;

import ui.View as View;
import ui.ImageScaleView as ImageScaleView;

import menus.constants.menuConstants as menuConstants;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		var size = this.style.height;

		this._size = size;
		this._adventureMapModel = opts.adventureMapModel;
		this._tileX = null;
		this._tileY = null;

		new ImageScaleView({
			superview: this,
			x: -20,
			y: -35,
			width: this.style.width + 40,
			height: this.style.height + 50,
			image: 'resources/images/ui/background.png',
			scaleMethod: '9slice',
			sourceSlices: menuConstants.BOX_SLICES.SOURCE_SLICES,
			destSlices: menuConstants.BOX_SLICES.DEST_SLICES
		});
	};

	this.show = function () {
		if (!this.style.visible) {
			this.style.y = -this._size;
			this.style.visible = true;
			animate(this).clear().then({y: 0}, 300);
		}
	};

	this.hide = function () {
		animate(this).then({y: -this._size}, 300).then(bind(this, function () { this.style.visible = false; }));
	};

	this.setPos = function (tileX, tileY) {
		this._tileX = tileX;
		this._tileY = tileY;
	};
});