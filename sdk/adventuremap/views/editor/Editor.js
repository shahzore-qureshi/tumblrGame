import event.Emitter as Emitter;

import .tools.ImageListView as ImageListView;
import .tools.TagListView as TagListView;
import .tools.ZoomView as ZoomView;
import .tools.TextEditView as TextEditView;

import .CursorView;
import .MenuBarView;

var OPTION_TILES = 0;
var OPTION_DOODADS = 1;
var OPTION_NODES = 2;
var OPTION_RIGHT_PATH = 3;
var OPTION_BOTTOM_PATH = 4;
var OPTION_RIGHT_TOP_PATH = 5;
var OPTION_RIGHT_BOTTOM_PATH = 6;
var OPTION_TAGS = 7;
var OPTION_TEXT_EDIT = 8;
var OPTION_ZOOM = 9;

exports = Class(Emitter, function () {
	this.init = function (opts) {
		this._adventureMap = opts.adventureMap;
		this._adventureMapModel = this._adventureMap.getModel();
		this._map = this._adventureMapModel.getMap();

		this._scale = 1;
		this._tileX = null;
		this._tileY = null;

		this._cursorView = new CursorView({
			superview: this._adventureMap.getAdventureMapLayers()[0],
			x: 0,
			y: 0,
			width: this._adventureMapModel.getTileWidth(),
			height: this._adventureMapModel.getTileHeight(),
			adventureMap: this._adventureMap,
			zIndex: 999999999
		});
		this._cursorView.on('Update', bind(this, 'update'));

		this._cursorView.
			on('InputSelect', bind(this, 'onCursorInputSelect'));

		this._menuBarView = new MenuBarView({
			superview: opts.superview,
			x: 0,
			y: 0,
			width: opts.width,
			height: 96,
			adventureMapModel: this._adventureMapModel,
			visible: false
		});

		this._menuBarView.on('Tile', bind(this, 'onTileEdit'));
		this._menuBarView.on('Node', bind(this, 'onNodeEdit'));
		this._menuBarView.on('Doodad', bind(this, 'onDoodadEdit'));
		this._menuBarView.on('Right', bind(this, 'onRightEdit'));
		this._menuBarView.on('Bottom', bind(this, 'onBottomEdit'));
		this._menuBarView.on('RightTop', bind(this, 'onRightTopEdit'));
		this._menuBarView.on('RightBottom', bind(this, 'onRightBottomEdit'));
		this._menuBarView.on('Tags', bind(this, 'onTagsEdit'));
		this._menuBarView.on('Id', bind(this, 'onIdChange'));
		this._menuBarView.on('Text', bind(this, 'onTextEdit'));
		this._menuBarView.on('Zoom', bind(this, 'onZoom'));
		this._menuBarView.on('Clear', bind(this, 'onClear'));
		this._menuBarView.on('Export', bind(this, 'onExport'));
		this._menuBarView.on('Close', bind(this, 'onCloseEditor'));

		this._lists = [];
		this._tool = -1;

		this._tileSettings = opts.tileSettings;

		// Tiles
		this._lists.push(new ImageListView({
			superview: opts.superview,
			x: 0,
			y: opts.height - 96,
			width: opts.width,
			height: 96,
			images: opts.tileSettings.tiles,
			visible: false,
			title: 'Tile'
		}).on('Select', bind(this, 'onSelectTile')));

		// Doodads
		this._lists.push(new ImageListView({
			superview: opts.superview,
			x: 0,
			y: opts.height - 96,
			width: opts.width,
			height: 96,
			images: opts.tileSettings.doodads,
			canCancel: true,
			visible: false,
			title: 'Doodad'
		}).on('Select', bind(this, 'onSelectDoodad')));

		// Nodes
		this._lists.push(new ImageListView({
			superview: opts.superview,
			x: 0,
			y: opts.height - 96,
			width: opts.width,
			height: 96,
			images: opts.nodeSettings.nodes,
			visible: false,
			canCancel: true,
			padding: 10,
			title: 'Node'
		}).on('Select', bind(this, 'onSelectNode')));

		// Right path
		this._lists.push(new ImageListView({
			superview: opts.superview,
			x: 0,
			y: opts.height - 96,
			width: opts.width,
			height: 96,
			images: opts.pathSettings.paths,
			visible: false,
			canCancel: true,
			padding: 10,
			title: 'Right path'
		}).on('Select', bind(this, 'onSelectRightPath')));

		// Bottom path
		this._lists.push(new ImageListView({
			superview: opts.superview,
			x: 0,
			y: opts.height - 96,
			width: opts.width,
			height: 96,
			images: opts.pathSettings.paths,
			visible: false,
			canCancel: true,
			padding: 10,
			title: 'Bottom path'
		}).on('Select', bind(this, 'onSelectBottomPath')));

		// Right top path
		this._lists.push(new ImageListView({
			superview: opts.superview,
			x: 0,
			y: opts.height - 96,
			width: opts.width,
			height: 96,
			images: opts.pathSettings.paths,
			visible: false,
			canCancel: true,
			padding: 10,
			title: 'Right top path'
		}).on('Select', bind(this, 'onSelectRightTopPath')));

		// Right bottom path
		this._lists.push(new ImageListView({
			superview: opts.superview,
			x: 0,
			y: opts.height - 96,
			width: opts.width,
			height: 96,
			images: opts.pathSettings.paths,
			visible: false,
			canCancel: true,
			padding: 10,
			title: 'Right bottom path'
		}).on('Select', bind(this, 'onSelectRightBottomPath')));

		// Tags
		this._lists.push(new TagListView({
			superview: opts.superview,
			x: 0,
			y: opts.height - 96,
			width: opts.width,
			height: 96,
			tags: opts.gridSettings.tags,
			visible: false,
			canCancel: true,
			padding: 10,
			title: 'Tags',
			editor: this,
			adventureMap: this._adventureMap,
			adventureMapModel: this._adventureMapModel
		}));

		// Text edit
		this._lists.push(new TextEditView({
			superview: opts.superview,
			x: 0,
			y: opts.height - 96,
			width: opts.width,
			height: 96,
			visible: false,
			canCancel: true,
			padding: 10,
			title: 'Texts',
			editor: this,
			adventureMap: this._adventureMap,
			adventureMapModel: this._adventureMapModel
		}));

		// Zoom
		this._zoomView = new ZoomView({
			superview: opts.superview,
			x: 0,
			y: opts.height - 96,
			width: opts.width,
			height: 96,
			visible: false,
			canCancel: true,
			padding: 10,
			title: 'Zoom',
			adventureMapModel: this._adventureMapModel
		});
		this._lists.push(this._zoomView);
		this._zoomView.on('ZoomIn', bind(this, 'onZoomIn'));
		this._zoomView.on('ZoomOut', bind(this, 'onZoomOut'));

		this._selectTime = 0;
		this._adventureMap.getAdventureMapLayers()[0].on(
			'Select',
			bind(
				this,
				function (tileX, tileY) {
					this._selectTime = Date.now();
					this._tileX = tileX;
					this._tileY = tileY;
					this._cursorView.showAt(tileX, tileY);
					this._menuBarView.show();
					this._menuBarView.setPos(tileX, tileY);

					var i = this._lists.length;
					while (i) {
						var list = this._lists[--i];
						list.style.visible && list.show(tileX, tileY);
					}
				}
			)
		);
		this._adventureMap.getAdventureMapView().on(
			'Scroll',
			bind(
				this,
				function () {
					if (Date.now() > this._selectTime + 50) {
						this._cursorView.hide();
						this._menuBarView.hide();
						this.showList(-1);
					}
				}
			)
		);
	};

	this.update = function () {
		var adventureMapLayers = this._adventureMap.getAdventureMapLayers();
		var i = adventureMapLayers.length;
		while (i) {
			adventureMapLayers[--i].refreshAll();
		}
	};

	this.showList = function (index) {
		if (index >= 0) {
			this._tool = index;
		}
		var i = this._lists.length;
		while (i) {
			var list = this._lists[--i];
			(i === index) ? list.show(this._tileX, this._tileY) : list.hide();
		}
	};

	this.saveMap = function () {
		var data = this._adventureMapModel.toJSON();
		localStorage.setItem('MAP_DATA', JSON.stringify(data));		
	};

	this.onCursorInputSelect = function(event) {
		if (this._tileX !== null) {
			var adventureMapModel = this._adventureMapModel;
			var data = adventureMapModel.getData();

			var tile = data.grid[this._tileY][this._tileX];
			var keys = Object.keys(event.point);
			var point = event.point[keys[keys.length - 1]];

			switch (this._tool) {
				case OPTION_NODES:
					tile.x = point.x / this._tileSettings.tileWidth;
					tile.y = point.y / this._tileSettings.tileHeight;
					this.update();
					this.saveMap();
					break;

				case OPTION_DOODADS:
					if (tile.doodad) {
						tile.doodadX = point.x / this._tileSettings.tileWidth;
						tile.doodadY = point.y / this._tileSettings.tileHeight;
						this.update();
						this.saveMap();
					}
					break;
			}
		}
	};

	this.onSave = function () {
		this.saveMap();
	};

	this.onCloseEditor = function () {
		this.showList(-1);
		this._cursorView.hide();
	};

	this.onTileEdit = function () {
		this.showList(OPTION_TILES);
	};

	this.onDoodadEdit = function () {
		this.showList(OPTION_DOODADS);
	};

	this.onNodeEdit = function () {
		this.showList(OPTION_NODES);
	};

	this.onRightEdit = function () {
		this.showList(OPTION_RIGHT_PATH);
	};

	this.onBottomEdit = function () {
		this.showList(OPTION_BOTTOM_PATH);
	};

	this.onRightTopEdit = function () {
		this.showList(OPTION_RIGHT_TOP_PATH);
	};

	this.onRightBottomEdit = function () {
		this.showList(OPTION_RIGHT_BOTTOM_PATH);
	};

	this.onTagsEdit = function () {
		this.showList(OPTION_TAGS);
	};

	this.onTextEdit = function () {
		this.showList(OPTION_TEXT_EDIT);
	};

	/**
	 * Change the background...
	 */
	this.onSelectTile = function (index) {
		if (this._tileX !== null) {
			this._map[this._tileY][this._tileX] = index;
			this._adventureMap.refreshTile(this._tileX, this._tileY);
			this.saveMap();
		}
	};

	/**
	 * Change the decoration...
	 */
	this.onSelectDoodad = function (index) {
		if (this._tileX !== null) {
			var adventureMapModel = this._adventureMapModel;
			var data = adventureMapModel.getData();

			data.grid[this._tileY][this._tileX].doodad = index;
			this._adventureMap.refreshTile(this._tileX, this._tileY);
			this.saveMap();
		}
	};

	/**
	 * Change the node type...
	 */
	this.onSelectNode = function (index) {
		if (this._tileX !== null) {
			var adventureMapModel = this._adventureMapModel;
			var data = adventureMapModel.getData();

			data.grid[this._tileY][this._tileX].node = index;
			this.update();
			this.saveMap();
		}
	};

	this.onSelectRightPath = function (index) {
		if (this._tileX !== null) {
			var adventureMapModel = this._adventureMapModel;
			var data = adventureMapModel.getData();

			data.grid[this._tileY][this._tileX].right = index;
			this.update();
			this.saveMap();
		}
	};

	this.onSelectBottomPath = function (index) {
		if (this._tileX !== null) {
			var adventureMapModel = this._adventureMapModel;
			var data = adventureMapModel.getData();

			data.grid[this._tileY][this._tileX].bottom = index;
			this.update();
		}
	};

	this.onSelectRightTopPath = function (index) {
		if (this._tileX !== null) {
			var adventureMapModel = this._adventureMapModel;
			var data = adventureMapModel.getData();

			data.grid[this._tileY][this._tileX].rightTop = index;
			this.update();
		}
	};

	this.onSelectRightBottomPath = function (index) {
		if (this._tileX !== null) {
			var adventureMapModel = this._adventureMapModel;
			var data = adventureMapModel.getData();

			data.grid[this._tileY][this._tileX].rightBottom = index;
			this.update();
		}
	};

	this.onIdChange = function (id) {
		if (this._tileX !== null) {
			var adventureMapModel = this._adventureMapModel;
			var data = adventureMapModel.getData();

			data.grid[this._tileY][this._tileX].id = id;
			this.update();
		}
	};

	this.onZoom = function () {
		this.showList(OPTION_ZOOM);
	};

	this.onZoomIn = function () {
		this._cursorView.style.visible = false;
		this._scale = this._adventureMap.setScale(this._scale * 1.1);
		this._zoomView.setScale(this._scale);
	};

	this.onZoomOut = function () {
		this._cursorView.style.visible = false;
		this._scale = this._adventureMap.setScale(this._scale * 0.9);
		this._zoomView.setScale(this._scale);
	};

	this.onExport = function () {
		window.open('', 'adventureMapExport').document.write(JSON.stringify(this._adventureMapModel.toJSON()));
	};

	this.onClear = function () {
		this._adventureMapModel.clear();
		this.update();
		this.saveMap();
	};
});