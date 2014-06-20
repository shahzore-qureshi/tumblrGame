import math.geom.Vec2D as Vec2D;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;
import ui.ScoreView as ScoreView;

import ..ViewPool;

exports = Class(ImageView, function (supr) {
	this.init = function (opts) {
		opts.width = opts.tileSettings.tileWidth,
		opts.height = opts.tileSettings.tileHeight,

		supr(this, 'init', [opts]);

		this._adventureMapView = opts.adventureMapView;

		this._itemView = null;

		this._tileX = 0;
		this._tileY = 0;

		this._editMode = opts.editMode;

		this._doodadView = new ImageView({
			superview: this
		});
		this._itemView = new ImageView({
			superview: this
		});

		this._idText = null;
		this._characterSettings = null;
		this._addItemEmitter = true;

		this._itemCtors = opts.nodeSettings.itemCtors;
		this._hideViews = {};

		this._tileSettings = opts.tileSettings;
		this._doodads = opts.tileSettings.doodads;
		this._nodes = opts.nodeSettings.nodes;

		this.canHandleEvents(false);
	};

	this.update = function (grid, tileX, tileY) {
		this._tileX = tileX;
		this._tileY = tileY;

		var tile = grid[tileY][tileX];
		if (tile && tile.node) {
			var x = this.style.width * tile.x;
			var y = this.style.height * tile.y;

			var node = this._nodes[tile.node - 1];
			var style = this._itemView.style;

			style.x = x - node.width * 0.5;
			style.y = y - node.height * 0.5;
			style.width = node.width;
			style.height = node.height;
			style.visible = true;

			this._itemView.setImage(node.image);

			if (tile.id && node.characterSettings) {
				if (!this._idText) {
					this._idText = new ScoreView({
						superview: this._itemView,
						x: 0,
						y: 0,
						width: 0,
						height: 0,
						text: tile.id,
						blockEvents: true,
						characterData: node.characterSettings.data
					});
				}
				this._idText.style.width = node.width;
				this._idText.style.height = node.characterSettings.height || node.height;
				this._idText.style.x = node.characterSettings.x || 0;
				this._idText.style.y = node.characterSettings.y || 0;
				if (node.characterSettings !== this._characterSettings) {
					this._idText.setCharacterData(node.characterSettings.data);
					this._characterSettings = node.characterSettings.data;
				}
			}

			if (this._addItemEmitter) {
				this._addItemEmitter = false;
				this._itemView.on('InputSelect', bind(this, 'onSelectNode', tile));
			}
		} else {
			this._itemView.style.visible = false;
		}

		if (tile && tile.doodad) {
			var doodad = this._doodads[tile.doodad - 1];
			if (doodad) {
				var style = this._doodadView.style;

				this._doodadView.setImage(doodad.image);
				style.x = tile.doodadX * this._tileSettings.tileWidth - doodad.width * 0.5;
				style.y = tile.doodadY * this._tileSettings.tileHeight - doodad.height * 0.5;
				style.width = doodad.width;
				style.height = doodad.height;
				style.visible = true;
			} else {
				this._doodadView.style.visible = false;
			}
		} else {
			this._doodadView.style.visible = false;
		}

		this.style.visible = tile.node;
	};

	this.onSelectNode = function (tile) {
		this._adventureMapView.emit('ClickNode', tile);
	};
});