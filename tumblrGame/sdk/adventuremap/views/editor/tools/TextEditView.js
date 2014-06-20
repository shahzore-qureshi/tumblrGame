import ui.TextPromptView as TextPromptView;

import ..components.BottomBar as BottomBar;

exports = Class(BottomBar, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		var size = this.style.height;

		this._title = new TextPromptView({
			superview: this,
			x: 8,
			y: 8,
			height: size - 16,
			width: this.style.width * 0.5 - 16,
			backgroundColor: '#FFFFFF',
			fontFamily: 'BPReplay',
			size: 26,
			color: '#000000'
		});
		this._title.on('Change', bind(this, 'onChangeTitle'));

		this._text = new TextPromptView({
			superview: this,
			x: this.style.width * 0.5 + 8,
			y: 8,
			height: size - 16,
			width: this.style.width * 0.5 - 16,
			backgroundColor: '#FFFFFF',
			fontFamily: 'BPReplay',
			size: 26,
			color: '#000000'
		});
		this._text.on('Change', bind(this, 'onChangeText'));

		this._editor = opts.editor;
		this._adventureMap = opts.adventureMap;
		this._adventureMapModel = opts.adventureMapModel;
	};

	this.onChangeTitle = function (value) {
		if (value === '') {
			delete this._tile.title;
		} else {
			this._tile.title = value;
		}
		this._adventureMap.refreshTile(this._tileX, this._tileY);
		this._editor.saveMap();
	};

	this.onChangeText = function (value) {
		if (value === '') {
			delete this._tile.text;
		} else {
			this._tile.text = value;
		}
		this._adventureMap.refreshTile(this._tileX, this._tileY);
		this._editor.saveMap();
	};

	this.show = function (tileX, tileY) {
		supr(this, 'show');

		this._tileX = tileX;
		this._tileY = tileY;
		this._tile = this._adventureMapModel.getGrid(this._tileX, this._tileY);

		this._title.setText(this._tile.title);
		this._text.setText(this._tile.text);
	};
});