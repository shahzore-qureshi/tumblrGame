import device;
import animate;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.ImageScaleView as ImageScaleView;
import ui.TextView as TextView;
import ui.ScrollView as ScrollView;

import menus.constants.menuConstants as menuConstants;
import menus.views.TextDialogView as TextDialogView;

import .components.TopBar as TopBar;
import .components.EditButton as EditButton;

var InputPrompt = device.get('InputPrompt');

exports = Class(TopBar, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		var size = this.style.height;

		this._size = size;

		var options = [
				{title: 'Bottom', method: 'onBottom', style: 'GREEN'},
				{title: 'Right', method: 'onRight', style: 'GREEN'},
				{title: 'Rt Top', method: 'onRightTop', style: 'GREEN'},
				{title: 'Rt Botm', method: 'onRightBottom', style: 'GREEN'},
				{title: 'Node', method: 'onNode', style: 'GREEN'},
				{title: 'Tile', method: 'onTile', style: 'GREEN'},
				{title: 'Doodad', method: 'onDoodad', style: 'GREEN'},
				{title: 'Tags', method: 'onTags', style: 'GREEN'},
				{title: 'Id', method: 'onId', style: 'GREEN'},
				{title: 'Text', method: 'onText', style: 'GREEN'},
				{title: 'Zoom', method: 'onZoom', style: 'GREEN'},
				{title: 'Clear', method: 'onClear', style: 'RED'},
				{title: 'Export', method: 'onExport', style: 'BLUE'}
			];

		var scrollView = new ScrollView({
			superview: this,
			x: 0,
			y: 0,
			width: this.style.width - size,
			height: size,
			scrollX: true,
			scrollY: false,
			scrollBounds: {
				minX: 0,
				maxX: options.length * 136 + 4,
				minY: 0,
				maxY: 0
			}
		});

		var x = 4;
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			new EditButton({
				superview: scrollView,
				x: x,
				y: 4,
				width: 140,
				height: size - 8,
				title: option.title,
				style: option.style
			}).on('Up', bind(this, option.method));
			x += 136;
		}

		new EditButton({
			superview: this,
			x: this.style.width - size + 4,
			y: 4,
			width: size - 8,
			height: size - 8,
			icon: {
				image: 'resources/images/ui/buttonClose.png',
				x: (size - 8) * 0.2,
				y: (size - 8) * 0.18,
				width: (size - 8) * 0.6,
				height: (size - 8) * 0.6
			},
			style: 'RED'
		}).on('Up', bind(this, 'onClose'));

		this._prompt = new InputPrompt({
			prompt: 'Enter the node Id:',
			autoShowKeyboard: true,
			isPassword: false,
			onChange: bind(this, 'onChangeId')
		});
	};

	this.onRight = function () {
		this.emit('Right');
	};

	this.onBottom = function () {
		this.emit('Bottom');
	};

	this.onRightTop = function () {
		console.log(1);
		this.emit('RightTop');
	};

	this.onRightBottom = function () {
		console.log(2);
		this.emit('RightBottom');
	};

	this.onNode = function () {
		this.emit('Node');
	};

	this.onTile = function () {
		this.emit('Tile');
	};

	this.onDoodad = function () {
		this.emit('Doodad');
	};

	this.onTags = function () {
		this.emit('Tags');
	};

	this.onId = function () {
		this._prompt.show();
	};

	this.onChangeId = function (value) {
		value && this.emit('Id', value);
	};

	this.onText = function () {
		this.emit('Text');
	};

	this.onZoom = function () {
		this.emit('Zoom');
	};

	this.onClear = function () {
		this._confirmClearDialog = this._confirmClearDialog || new TextDialogView({
			superview: this._superview,
			title: 'Clear map',
			text: 'Are you sure you want to clear this map?',
			height: 450,
			modal: true,
			zIndex: 999999999,
			buttons: [
				{
					title: 'No',
					width: 200,
					style: 'GREEN'
				},
				{
					title: 'Yes',
					width: 200,
					style: 'RED',
					cb: bind(this, 'emit', 'Clear')
				}
			]
		});
		this._confirmClearDialog.show();
	};

	this.onExport = function () {
		this.emit('Export');
	};

	this.onClose = function () {
		this.emit('Close');
		this.hide();
	};
});