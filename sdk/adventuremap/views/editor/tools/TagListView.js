import ui.ScrollView as ScrollView;

import menus.constants.menuConstants as menuConstants;

import ..components.BottomBar as BottomBar;
import ..components.EditButton as EditButton;

exports = Class(BottomBar, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		var scrollView = new ScrollView({
			superview: this,
			x: 0,
			y: 0,
			width: this.style.width,
			height: this.style.height,
			scrollX: true,
			scrollY: false,
			scrollBounds: {
				minX: 0,
				maxX: opts.tags.length * 176 + 4,
				minY: 0,
				maxY: 0
			}
		});

		this._tile = null;
		this._tags = opts.tags;
		this._editor = opts.editor;
		this._adventureMap = opts.adventureMap;
		this._adventureMapModel = opts.adventureMapModel;
		this._buttons = [];

		var size = this.style.height;
		var x = 4;

		for (var i = 0; i < opts.tags.length; i++) {
			this._buttons.push(new EditButton({
				superview: scrollView,
				x: x,
				y: 4,
				width: 180,
				height: size - 8,
				style: 'RED',
				title: opts.tags[i]
			}).on('Up', bind(this, 'onTag', i)));
			x += 176;
		}
	};

	this.show = function (tileX, tileY) {
		supr(this, 'show');

		this._tileX = tileX;
		this._tileY = tileY;
		this._tile = this._adventureMapModel.getGrid(this._tileX, this._tileY);

		this.updateTags();
	};

	this.updateTags = function () {
		var i = this._tags.length;
		while (i) {
			var tag = this._tags[--i];
			var button = this._buttons[i];
			if (this._tile.tags && this._tile.tags[tag]) {
				button.updateOpts({
					images: {
						down: menuConstants.BUTTONS.GREEN.DOWN,
						up: menuConstants.BUTTONS.GREEN.UP
					}
				});
				button.setImage(menuConstants.BUTTONS.GREEN.UP);
				button.getText().updateOpts({strokeColor: menuConstants.BUTTONS.GREEN.STROKE_COLOR});
			} else {
				button.updateOpts({
					images: {
						down: menuConstants.BUTTONS.RED.DOWN,
						up: menuConstants.BUTTONS.RED.UP
					}
				});
				button.setImage(menuConstants.BUTTONS.RED.UP);
				button.getText().updateOpts({strokeColor: menuConstants.BUTTONS.RED.STROKE_COLOR});
			}
		}
	};

	this.onTag = function (index) {
		var tile = this._tile;
		var tag = this._tags[index];

		if (!tile.tags) {
			tile.tags = {};
		}
		if (tile.tags[tag]) {
			delete tile.tags[tag];
		} else {
			tile.tags[tag] = true;
		}
		this.updateTags();

		this._adventureMap.refreshTile(this._tileX, this._tileY);
		this._editor.saveMap();
	};
});