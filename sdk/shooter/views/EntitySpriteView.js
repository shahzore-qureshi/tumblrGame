/**
 * @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the Mozilla Public License v. 2.0 as published by Mozilla.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Mozilla Public License v. 2.0 for more details.

 * You should have received a copy of the Mozilla Public License v. 2.0
 * along with the Game Closure SDK.  If not, see <http://mozilla.org/MPL/2.0/>.
 */
import math.geom.Point as Point;
import math.geom.Circle as Circle;
import math.geom.Rect as Rect;

import ui.SpriteView as SpriteView;

exports = Class(SpriteView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._offsetX = opts.offsetX || opts.width * -0.5;
		this._offsetY = opts.offsetY || opts.height * -0.5;

		this.style.x = opts.x || 0;
		this.style.y = opts.y || 0;

		if (opts.showCollision) {
			this.render = this._renderCollision;
		}
	};

	this.setSize = function (width, height) {
		this._offsetX = width * -0.5;
		this._offsetY = height * -0.5;		

		this.style.width = width;
		this.style.height = height;
		this.style.anchorX = width * 0.5;
		this.style.anchorY = height * 0.5;
	};

	this.onUpdate = function (opts) {
		this._modelOpts = opts;

		this.style.x = opts.pos.x + this._offsetX;
		this.style.y = opts.pos.y + this._offsetY;
		this.style.visible = true;
	};

	this.getCurrentAnimationName = function () {
		return this._currentAnimationName;
	};

	this.play = function (animationName, opts) {
		if (this._currentAnimationName !== animationName) {
			this.startAnimation(animationName, opts || {loop: true});
		}
	};

	this._renderCollision = function (ctx) {		
		supr(this, 'render', arguments);

		var style = this.style;
		var modelOpts = this._modelOpts;

		if (modelOpts) {
			var shape = modelOpts.shape;
			if (shape instanceof Circle) {
				ctx.beginPath();
				ctx.arc(-this._offsetX + shape.x, -this._offsetY + shape.y, shape.radius, 0, Math.PI * 2, false);
				ctx.closePath();

				ctx.fillStyle = modelOpts.color || 'rgba(255, 0, 0, 0.7)';
				ctx.fill();

				ctx.lineWidth = 3;
				ctx.strokeStyle = '#FFFFFF';
				ctx.stroke();
			} else if (shape instanceof Rect) {
				ctx.fillStyle = modelOpts.color || 'rgba(255, 0, 0, 0.7)';
				ctx.fillRect(
					-this._offsetX - shape.width * 0.5 + shape.x,
					-this._offsetY - shape.height * 0.5 + shape.y,
					shape.width,
					shape.height
				);

				ctx.lineWidth = 3;
				ctx.strokeStyle = '#FFFFFF';
				ctx.strokeRect(
					-this._offsetX - shape.width * 0.5 + shape.x,
					-this._offsetY - shape.height * 0.5 + shape.y,
					shape.width,
					shape.height
				);
			}
		}
	};
});