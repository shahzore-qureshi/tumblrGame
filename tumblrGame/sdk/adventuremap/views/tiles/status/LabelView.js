import ui.TextView as TextView;
import ui.ImageView as ImageView;

import .NodeItemView;

exports = Class(NodeItemView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this.style.width = 200;
		this.style.height = 200;
		this.style.visible = false;

		var size = this.style.width / 3;
		var titleHeight = this.style.height * 0.2;
		var starsTop = this.style.height - size;

		this._titleView = new TextView({
			superview: this,
			width: this.style.width,
			height: titleHeight,
			fontFamily: 'BPReplay',
			size: 26,
			color: '#000000',
			strokeColor: '#FFFFFF',
			strokeWidth: 4,
			text: 'Title',
			blockEvents: true
		});

		this._textView = new TextView({
			superview: this,
			width: this.style.width,
			height: this.style.height - titleHeight - size,
			y: titleHeight,
			x: 0,
			size: 26,
			color: '#000000',
			strokeColor: '#FFFFFF',
			strokeWidth: 4,
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			autoSize: false,
			autoFontSize: true,
			wrap: true,
			blockEvents: true
		});

		this._stars = [];
		for (var i = 0; i < 3; i++) {
			this._stars.push(new ImageView({
				superview: this,
				x: i * size,
				y: this.style.height - size,
				width: size,
				height: size,
				image: 'resources/images/icon/star.png'
			}));
		}

		this.canHandleEvents(false);
	};

	this.update = function (tile) {
		this._titleView.setText(tile.title || 'Title');
		this._textView.setText(tile.text || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.');

		this.style.visible = true;
	};
});