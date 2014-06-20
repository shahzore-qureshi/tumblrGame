import event.Emitter as Emitter;

import .models.AdventureMapModel as AdventureMapModel;

import .views.AdventureMapView as AdventureMapView;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._model = new AdventureMapModel({
			tileWidth: opts.tileSettings.tileWidth,
			tileHeight: opts.tileSettings.tileHeight,
			width: opts.gridSettings.width,
			height: opts.gridSettings.height,
			defaultTile: opts.gridSettings.defaultTile
		});

		var tileSettings = opts.tileSettings;
		var gridSettings = opts.gridSettings;

		this._gridSettings = gridSettings;
		this._tileSettings = tileSettings;
		this._pathSettings = opts.pathSettings;
		this._nodeSettings = opts.nodeSettings;

		if (tileSettings.tiles === 'CREATE_GRID') {
			var path = tileSettings.path || 'resources/images/tiles/';
			tileSettings.tiles = [];
			for (var y = 0; y < gridSettings.height; y++) {
				for (var x = 0; x < gridSettings.width; x++) {
					tileSettings.tiles.push(path + String.fromCharCode(97 + y) + x + '.png');
				}
			}
		}

		opts.map = this._model.getMap();

		this._adventureMapView = new AdventureMapView(opts);
		this._pinchSet = 0;
		this._pinchUp = 0;
		this._pinchReset = 0;
		this._pinchScale = null;
		this._dragSingleCount = 0;

		this._adventureMapView.on('Dragged', bind(this, 'emit', 'Dragged'));
		this._adventureMapView.on('Size', bind(this._model, 'onSize'));
		this._adventureMapView.on('ClickTag', bind(this, 'onClickTag'));
		this._adventureMapView.on('ClickNode', bind(this, 'onClickNode'));

		this._model.on('NeedsPopulate', bind(this._adventureMapView, 'needsPopulate'));
		this._model.on('Update', bind(this._adventureMapView, 'onUpdate'));
		this._model.on('UpdateTile', bind(this._adventureMapView, 'refreshTile'));

		this._adventureMapView.tick = bind(this, function(dt) {
			this._adventureMapView.style.visible && this._model.tick(dt);
		});
	};

	this.getModel = function () {
		return this._model;
	};

	this.getAdventureMapView = function () {
		return this._adventureMapView;
	};

	this.getAdventureMapLayers = function () {
		return this._adventureMapView.getAdventureMapLayers();
	};

	this.setScale = function (scale) {
		this._adventureMapView.setScale(scale);
	};

	this.load = function (data) {
		this._model.load(data);
		this._adventureMapView.onUpdate(this._model.getData());
	};

	this.hide = function () {
		this._adventureMapView.hide();
	};

	this.show = function () {
		this._adventureMapView.show();
	};

	this.refreshTile = function (tileX, tileY) {
		this._adventureMapView.refreshTile(tileX, tileY);
	};

	this.onClickTag = function (tag, tile, view) {
		this.emit('ClickTag', tag, tile, view);
	};

	this.onClickNode = function (tile) {
		this.emit('ClickNode', tile);
	};

	this.focusNodeById = function (id) {
		var node = this._model.getNodesById()[id];
		node && this._adventureMapView.focusNodeById(node);
	};
});