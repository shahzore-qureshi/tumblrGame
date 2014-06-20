import ui.View as View;
import ui.ScrollView as ScrollView;

import .AdventureMapBackgroundView;
import .AdventureMapPathsView;
import .AdventureMapNodesView;
import .AdventureMapDoodadsView;

exports = Class(ScrollView, function (supr) {
	this.init = function (opts) {
		this._tileWidth = opts.tileSettings.tileWidth;
		this._tileHeight = opts.tileSettings.tileHeight;

		this._totalWidth = opts.gridSettings.width * this._tileWidth;
		this._totalHeight = opts.gridSettings.height * this._tileHeight;

		this._touch = {};
		this._touchIDs = [];

		var scale = opts.scale || 1;

		opts = merge(
			opts,
			{
				scrollX: true,
				scrollY: true,
				scrollBounds: {
					minX: 0,
					minY: 0,
					maxX: this._totalWidth * scale,
					maxY: this._totalHeight * scale
				},
				bounce: false,
				minScale: 0.5,
				maxScale: 2
			}
		);

		supr(this, 'init', [opts]);

		this._minScale = opts.minScale;
		this._maxScale = opts.maxScale;
		this._tileSettings = opts.tileSettings;
		this._adventureMapLayers = [];
		this._inputLayerIndex = opts.inputLayerIndex;

		this._showTimeout = null;

		this._fingerOne = null;
		this._fingerTwo = null;

		this._content = new View({
			superview: this,
			x: 0,
			y: 0,
			width: this._totalWidth,
			height: this._totalHeight,
			scale: scale
		});

		this._pinch = false;
		this._pinchScale = 1;
		this._pinchPoints = {};
		this._pinchStartDistance = 0;

		var ctors = [
				AdventureMapBackgroundView,
				AdventureMapPathsView,
				AdventureMapNodesView,
				AdventureMapDoodadsView
			];
		for (var i = 0; i < ctors.length; i++) {
			this._adventureMapLayers.push(new ctors[i]({
				superview: this._content,
				adventureMapView: this,
				x: 0,
				y: 0,
				width: this._totalWidth,
				height: this._totalHeight,
				map: opts.map,
				gridSettings: opts.gridSettings,
				tileCtor: ctors[i],
				tileSettings: opts.tileSettings,
				gridSettings: opts.gridSettings,
				nodeSettings: opts.nodeSettings,
				pathSettings: opts.pathSettings,
				editMode: opts.editMode,
				blockEvents: opts.editMode ? (i !== 0) : (i < 2)
			}));
		}
	};

	this.onUpdate = function (data) {
		for (var i = 0; i < 4; i++) {
			var adventureMapLayer = this._adventureMapLayers[i];
			if (adventureMapLayer && adventureMapLayer.onUpdate) {
				adventureMapLayer.onUpdate(data);
			}
		}

		this._showTimeout = this._showTimeout || setTimeout(
			bind(this, function () {
				for (var i = 0; i < 4; i++) {
					this._adventureMapLayers[i].style.visible = true;
				}
			}),
			0
		);
	};

	this.onPinch = function (pinchScale) {
		this.setScale(pinchScale);
	};

	this.onInputStart = function (evt, pt) {
		if (!this._touchIDs.length) {
			if (this._opts.drag) {
				this.startDrag({radius: this._opts.dragRadius * this._snapPixels});

				if (this._anim && this._anim.hasFrames()) {
					this._anim.clear();
				}

				evt.cancel();
			}
		}
		this._touch['_' + evt.id] = true;
		this._touchIDs = Object.keys(this._touch);
		switch (this._touchIDs.length) {
			case 1:
				this._fingerOne = this._touchIDs[0];
				this._pinchPoints[this._fingerOne] = {x: evt.srcPoint.x, y: evt.srcPoint.y};
				break;
			case 2:
				this._fingerTwo = this._touchIDs[1];
				this._pinchPoints[this._fingerTwo] = {x: evt.srcPoint.x, y: evt.srcPoint.y};
				break;
		}
		if (this._touchIDs.length === 2) {
			this._pinchScale = this.getScale();
			this._pinchStartDistance = this.getPinchDistance();
			this._pinch = true;
		} else {
			this._pinch = false;
		}
	};

	this.onInputSelect = this.onInputOut = function (evt) {
		if ('id' in evt) {
			delete this._touch['_' + evt.id];
			this._touchIDs = Object.keys(this._touch);
		}
	};

	this.onDrag = function (dragEvt, moveEvt, delta) {
		this.emit('Dragged');

		if (this._pinch) {
			this._pinchPoints['_' + moveEvt.id] = {x: moveEvt.srcPoint.x, y: moveEvt.srcPoint.y};
			this.setScale(this.getPinchDistance() / this._pinchStartDistance * this._pinchScale);
		} else {
			supr(this, 'onDrag', arguments);
		}
	};

	this.onDragStop = function (dragEvt, selectEvt) {
		if (this._pinch) {
			if ('id' in dragEvt) {
				delete this._touch['_' + dragEvt.id];
				this._touchIDs = Object.keys(this._touch);
			}
			if ('id' in selectEvt) {
				delete this._touch['_' + selectEvt.id];
				this._touchIDs = Object.keys(this._touch);
			}
			if (this._touchIDs.length < 2) {
				this._pinch = false;
			}
		} else {
			if ('id' in dragEvt) {
				delete this._touch['_' + dragEvt.id];
				this._touchIDs = Object.keys(this._touch);
			}
			if ('id' in selectEvt) {
				delete this._touch['_' + selectEvt.id];
				this._touchIDs = Object.keys(this._touch);
			}
			supr(this, 'onDragStop', arguments);
		}
	};

	this.setOffset = function (x, y) {
		(this._touchIDs.length <= 1) && supr(this, 'setOffset', arguments);
	};

	this.getAdventureMapLayers = function () {
		return this._adventureMapLayers;
	};

	this.getTileWidth = function () {
		return this._tileWidth;
	};

	this.getTileHeight = function () {
		return this._tileHeight;
	};

	this.getScale = function (scale) {
		return this._content.style.scale;
	};

	this.setScale = function (scale) {
		var lastScale = this._content.style.scale;
		scale = Math.min(Math.max(scale, this._minScale), this._maxScale);

		this._content.style.scale = scale;

		var x = this._contentView.style.x * scale / lastScale + (lastScale - scale) * this.style.width * 0.5;
		var y = this._contentView.style.y * scale / lastScale + (lastScale - scale) * this.style.height * 0.5;

		this._contentView.style.x = Math.min(Math.max(x, -(this._totalWidth * scale - this.style.width)), 0);
		this._contentView.style.y = Math.min(Math.max(y, -(this._totalHeight * scale - this.style.height)), 0);

		this.setScrollBounds({
			minX: 0,
			minY: 0,
			maxX: this._totalWidth * scale,
			maxY: this._totalHeight * scale
		});
	};

	this.getPinchDistance = function () {
		var p1 = this._pinchPoints[this._fingerOne];
		var p2 = this._pinchPoints[this._fingerTwo];
		var dx = p2.x - p1.x;
		var dy = p2.y - p1.y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	this.refreshTile = function (tileX, tileY) {
		var adventureMapLayers = this._adventureMapLayers;
		var i = this._adventureMapLayers.length;

		while (i) {
			this._adventureMapLayers[--i].refreshTile(tileX, tileY);
		}		
	};

	this.focusNodeById = function (node) {
		var scale = this._content.style.scale;
		var x = Math.max((node.tileX * this._tileSettings.tileWidth) * scale - this.style.width * 0.5, 0);
		var y = Math.max((node.tileY * this._tileSettings.tileHeight) * scale - this.style.height * 0.5, 0);

		this.scrollTo(x, y, 300);
	};

	this.removeItemViews = function () {
		this._adventureMapLayers[3].removeItemViews();
	};
});