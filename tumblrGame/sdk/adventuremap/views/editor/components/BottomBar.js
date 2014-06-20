import animate;

import ui.View as View;
import ui.TextView as TextView;
import ui.ImageScaleView as ImageScaleView;

import menus.constants.menuConstants as menuConstants;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		var size = this.style.height;

		this._size = size;
		this._startY = this.style.y;
		this._count = ((this.style.width - size * 2) / size) | 0;

		var titleView = new ImageScaleView({
			superview: this,
			x: 20,
			y: -65,
			width: 280,
			height: 80,
			image: 'resources/images/ui/item.png',
			scaleMethod: '9slice',
			sourceSlices: menuConstants.BOX_SLICES.SOURCE_SLICES,
			destSlices: menuConstants.BOX_SLICES.DEST_SLICES
		});
		new TextView({
			superview: titleView,
			x: 0,
			y: 0,
			width: 280,
			height: 55,
			fontFamily: 'BPReplay',
			size: 36,
			color: 'rgb(0, 0, 0)',
			text: opts.title
		});

		new ImageScaleView({
			superview: this,
			x: -20,
			y: -15,
			width: this.style.width + 40,
			height: this.style.height + 35,
			image: 'resources/images/ui/background.png',
			scaleMethod: '9slice',
			sourceSlices: menuConstants.BOX_SLICES.SOURCE_SLICES,
			destSlices: menuConstants.BOX_SLICES.DEST_SLICES
		});
	};

	this.show = function () {
		if (!this.style.visible) {
			this.style.y = this._startY + this._size + 80;
			this.style.visible = true;
			animate(this).clear().then({y: this._startY}, 300);
		}
	};

	this.hide = function () {
		if (this.style.visible) {
			animate(this).then({y: this._startY + this._size + 80}, 300).then(bind(this, function () { this.style.visible = false; }));
		}
	};
});