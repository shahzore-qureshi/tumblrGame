import math.geom.Vec2D as Vec2D;

import ui.View as View;
import ui.SpriteView as SpriteView;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts.width = opts.tileSettings.tileWidth;
		opts.height = opts.tileSettings.tileHeight;

		supr(this, 'init', [opts]);

		this._adventureMapView = opts.adventureMapView;

		this._tileX = 0;
		this._tileY = 0;

		this._editMode = opts.editMode;

		this._tileSettings = opts.tileSettings;
		this._doodads = opts.tileSettings.doodads;
		this._doodadView = null;

		this._itemCtors = opts.nodeSettings.itemCtors;
		this._hideViews = {};
		this._itemViews = null;
	};

	this.update = function (grid, tileX, tileY) {
		this._tileX = tileX;
		this._tileY = tileY;

		var tile = grid[tileY][tileX];
		if (tile && tile.doodad) {
			var doodad = this._doodads[tile.doodad - 1];
			if (doodad) {
				if (this._doodadView) {
					this._doodadView.style.x = tile.doodadX * this._tileSettings.tileWidth - doodad.width * 0.5;
					this._doodadView.style.y = tile.doodadY * this._tileSettings.tileHeight - doodad.height * 0.5;
					this._doodadView.style.width = doodad.width;
					this._doodadView.style.height = doodad.height;
				} else {
					this._doodadView = new SpriteView({
						superview: this,
						x: tile.doodadX * this._tileSettings.tileWidth - doodad.width * 0.5,
						y: tile.doodadY * this._tileSettings.tileHeight - doodad.height * 0.5,
						width: doodad.width,
						height: doodad.height,
						url: doodad.url,
						image: doodad.image,
						frameRate: doodad.frameRate,
						blockEvents: true
					});
				}

				doodad.animation && this._doodadView.startAnimation(doodad.animation, {randomFrame: true});
				this._doodadView.style.visible = true;
			}
		} else if (this._doodadView) {
			this._doodadView.style.visible = false;
		}

		var x = this.style.width * tile.x;
		var y = this.style.height * tile.y;

		var itemViews = tile.itemViews;
		if (!itemViews) {
			itemViews = {};
			tile.itemViews = itemViews;
		}
		this._itemViews = itemViews;

		var hideViews = this._hideViews;
		for (var tag in itemViews) {
			var itemView = itemViews[tag];
			if (itemView.style.visible) {
				hideViews[tag] = itemView;
			}
		}

		var tags = tile.tags;
		for (var tag in tags) {
			if (this._itemCtors[tag]) {
				var itemView = itemViews[tag];
				if (!itemView) {
					itemView = new this._itemCtors[tag]({
						superview: this._superview,
						adventureMapView: this._adventureMapView,
						zIndex: 999999999,
						tag: tag,
						tile: tile
					});
					itemView.on('InputSelect', bind(this, 'onSelectTag', tag, tile, itemView));
					itemViews[tag] = itemView;
				}

				if (!('centerTag' in this._tileSettings) || this._tileSettings.centerTag) {
					itemView.style.x = this.style.x + x - itemView.style.width * 0.5 + (itemView.offsetX || 0);
					itemView.style.y = this.style.y + y - itemView.style.height * 0.5 + (itemView.offsetY || 0);
				} else {
					itemView.style.x = this.style.x + x + (itemView.offsetX || 0);
					itemView.style.y = this.style.y + y + (itemView.offsetY || 0);
				}
				itemView.update && itemView.update(tile);

				hideViews[tag] = null;
			}
		}

		for (var tag in hideViews) {
			if (hideViews[tag]) {
				hideViews[tag].style.visible = false;
			}
		}

		this.style.visible = tile.doodad;
	};

	this.removeItemViews = function () {
		var itemViews = this._itemViews;
		if (itemViews) {
			for (var tag in itemViews) {
				itemViews[tag].removeFromSuperview();
				delete itemViews[tag];
			}
		}
		this._hideViews = {};
	};

	this.onSelectTag = function (tag, tile, itemView) {
		this._adventureMapView.emit('ClickTag', tag, tile, itemView);
	};
});