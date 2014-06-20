import ui.View as View;
import ui.ImageView as ImageView;
import ui.ImageScaleView as ImageScaleView;

import ui.resource.Image as Image;

import menus.constants.menuConstants as menuConstants;

import ..components.BottomBar as BottomBar;
import ..components.EditButton as EditButton;

exports = Class(BottomBar, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._images = [];
		if (opts.canCancel) {
			this._images.push(new Image({url: 'resources/images/ui/buttonClose.png'}));
		}

		for (var i = 0; i < opts.images.length; i++) {
			var image = opts.images[i].image ? opts.images[i].image : opts.images[i];
			this._images.push((image instanceof Image) ? image : new Image({url: image}));
		}

		var size = this.style.height;

		this._padding = opts.padding || 0;
		this._size = size;
		this._count = Math.min(((this.style.width - size * 2) / size) | 0, this._images.length);

		if (this._images.length > this._count) {
			new EditButton({
				superview: this,
				x: 4,
				y: 4,
				width: size - 8,
				height: size - 8,
				icon: {
					image: 'resources/images/ui/buttonBack.png',
					x: (size - 8) * 0.2,
					y: (size - 8) * 0.18,
					width: (size - 8) * 0.6,
					height: (size - 8) * 0.6
				},
				style: 'BLUE'
			}).on('Up', bind(this, 'onLeft'));

			new EditButton({
				superview: this,
				x: this.style.width - size + 4,
				y: 4,
				width: size - 8,
				height: size - 8,
				icon: {
					image: 'resources/images/ui/buttonNext.png',
					x: (size - 8) * 0.2,
					y: (size - 8) * 0.18,
					width: (size - 8) * 0.6,
					height: (size - 8) * 0.6
				},
				style: 'BLUE'
			}).on('Up', bind(this, 'onRight'));
		}

		this._imageViews = [];
		this._offset = 0;

		var x = (this.style.width - this._count * size) * 0.5;
		for (var i = 0; i < this._count; i++) {
			new View({
				superview: this,
				x: x + 9,
				y: 9,
				width: size - 18,
				height: size - 18,
				backgroundColor: '#0066FF'
			});
			var imageView = new ImageView({
				superview: this,
				x: x + 9,
				y: 9,
				width: size - 18,
				height: size - 18,
				image: this._images[i]
			});
			this._imageViews.push(imageView);
			imageView.startX = x + 9 + this._padding;
			imageView.startY = 9 + this._padding;
			imageView.startSize = size - 18 - this._padding * 2;

			new ImageScaleView({
				superview: this,
				x: x + 8,
				y: 8,
				width: size - 16,
				height: size - 16,
				image: 'resources/images/ui/contentBorder.png',
				scaleMethod: '9slice',
				sourceSlices: menuConstants.BOX_SLICES.SOURCE_SLICES,
				destSlices: menuConstants.BOX_SLICES.DEST_SLICES
			}).on('InputStart', bind(this, 'onSelect', i));

			x += size;
		}
	};

	this.onLeft = function () {
		this._offset = (this._offset + this._images.length - 1) % this._images.length;
		this.updateImages();
	};

	this.onRight = function () {
		this._offset = (this._offset + 1) % this._images.length;
		this.updateImages();
	};

	this.onSelect = function (index) {
		this.emit('Select', (this._offset + index) % this._images.length);
	};

	this.show = function () {
		supr(this, 'show');
		this.updateImages();
	};

	this.updateImages = function () {
		for (var i = 0; i < this._count; i++) {
			var imageView = this._imageViews[i];
			var size = imageView.startSize;
			var image = this._images[(i + this._offset) % this._images.length];
			var imageWidth = image.getWidth();
			var imageHeight = image.getHeight();

			if (imageWidth > imageHeight) {
				imageHeight = size * imageHeight / imageWidth;
				imageWidth = size;
			} else {
				imageWidth = size * imageWidth / imageHeight;
				imageHeight = size;
			}

			imageView.style.x = imageView.startX + (size - imageWidth) * 0.5;
			imageView.style.y = imageView.startY + (size - imageHeight) * 0.5;
			imageView.style.width = imageWidth;
			imageView.style.height = imageHeight;
			imageView.setImage(image);
		}
	};
});