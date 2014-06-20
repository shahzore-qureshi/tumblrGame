import ui.TextView as TextView;

import ..components.BottomBar as BottomBar;
import ..components.EditButton as EditButton;

exports = Class(BottomBar, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		var size = this.style.height;

		new EditButton({
			superview: this,
			x: 4,
			y: 4,
			width: 180,
			height: size - 8,
			style: 'BLUE',
			title: 'Zoom in'
		}).on('Up', bind(this, 'emit', 'ZoomIn'));

		new EditButton({
			superview: this,
			x: 180,
			y: 4,
			width: 180,
			height: size - 8,
			style: 'BLUE',
			title: 'Zoom out'
		}).on('Up', bind(this, 'emit', 'ZoomOut'));

		this._scaleText = new TextView({
			superview: this,
			x: this.style.width - 208,
			y: 10,
			width: 200,
			height: 40,
			fontFamily: 'BPReplay',
			size: 36,
			color: '#000000',
			text: '1x',
			horizontalAlign: 'right',
			blockEvents: true
		});
	};

	this.setScale = function (scale) {
		this._scaleText.setText(scale + 'x');
	};
});