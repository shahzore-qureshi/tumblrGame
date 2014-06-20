import math.geom.Vec2D as Vec2D;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;

import ..ViewPool;

exports = Class(ImageView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._index = 0;
		this._pointSize = 24;
		this._pointDistance = 20;

		this._tileX = 0;
		this._tileY = 0;
		this._map = opts.map;
		this._tiles = opts.tileSettings.tiles;
	};

	this.update = function (grid, tileX, tileY) {
		this._tileX = tileX;
		this._tileY = tileY;

		if (this._map[tileY] && (this._map[tileY][tileX] !== undefined)) {
			this.setImage(this._tiles[this._map[tileY][tileX]]);
		}

		this.style.visible = true;
	};

	this.onInputSelect = function () {
		this._superview.emit('Select', this._tileX, this._tileY);
	};
});