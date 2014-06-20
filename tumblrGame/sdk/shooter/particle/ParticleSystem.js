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
import ui.ImageView as ImageView;
import timestep.ui.resource.Image as Image;

import ui.ViewPool as ViewPool;

var Particle = Class(ImageView, function (supr) {
	this.getOpts = function () {
		return this._opts;
	};
});

exports = Class(ViewPool, function (supr) {
	this.init = function (opts) {
		opts.ctor = Particle;
		opts.initOpts = {superview: opts.superview, zIndex: opts.zIndex};

		supr(this, 'init', [opts]);

		this._minAngle = 0;
		this._maxAngle = Math.PI * 2;

		this._types = opts.types;
		this._id = 0;
		this._r1 = Math.random();
		this._r2 = Math.random();

		this._updateExtends();

		for (var i in this._types) {
			if (this._types[i].image) {
				var image = this._types[i].image;
				if (typeof image === 'string') {
					this._types[i].image = new Image({url: image});
				}
			}
		}
	};

	this._updateExtend = function (type) {
		var target = this._types[type];
		if (target.isExtended) {
			return;
		}

		if (target.extnds) {
			this._updateExtend(target.extnds);
			this._types[type] = merge(target, this._types[target.extnds]);
			target = this._types[type];
		}

		target.isExtended = true;
	};

	this._updateExtends = function () {
		for (var type in this._types) {
			this._updateExtend(type);
		}
	};

	this.addOne = function (x, y, velocity) {
		var radius = this._radius;
		var size = this._size;
		var duration = this._duration;
		var half = this._size * 0.5;
		var view = this.obtainView();
		var style = view.style;
		var opts = view.getOpts();
		var r = this._minAngle + this._r1 * (this._maxAngle - this._minAngle);
		var a = Math.sin(r) * radius;
		var b = Math.cos(r) * radius;

		view.setImage(this._image);

		style.width = size;
		style.height = size;
		style.anchorX = half;
		style.anchorY = half;

		if (this._color) {
			style.backgroundColor = this._color;
		}

		var start = opts.start;
		if (!start) {
			start = {};
			opts.start = start;
		}
		start.x = x - half;
		start.y = y - half;
		start.p = 1;
		this._initStartCB && this._initStartCB(start);

		var end = opts.end;
		if (!end) {
			end = {};
			opts.end = end;
		}
		end.x = x + a - half;
		end.y = y + b - half;
		end.p = 0;
		this._initEndCB && this._initEndCB(start, end);

		opts.dx = end.x - start.x;
		opts.dy = end.y - start.y;
		opts.dp = end.p - start.p;

		opts.duration = duration + this._r2 * duration;
		opts.dt = 0;

		var vX = velocity ? velocity.x : 0;
		var vY = velocity ? velocity.y : 0;
		if (opts.velocity) {
			opts.velocity.x = vX;
			opts.velocity.y = vY;
		} else {
			opts.velocity = {x: vX, y: vY};
		}

		opts.movedX = 0;
		opts.movedY = 0;

		opts.stepCB = this._stepCB;

		this._initCB && this._initCB(view);

		this._r1 = Math.random();
		this._r2 = Math.random();
	};

	// Count parameter changes the number of particles emitted (or well exceeds it)
	this.addParticles = function (pos, velocity, count) {
		var x = pos.x;
		var y = pos.y;
		var i = count || this._count;

		while (i) {
			i--;

			var r1 = Math.random();
			var r2 = Math.random();

			this._r1 = r1;
			this._r2 = r2;
			this.addOne(x, y, velocity);
		}
	};

	this.activateType = function (type) {
		if (typeof type === 'string') {
			type = this._types[type];
		}
		this._radius = type.radius;
		this._duration = type.duration;
		this._count = type.count || 50;
		this._size = type.size;
		this._color = type.color;

		this._initCB = type.initCB || false;
		this._initEndCB = type.initEndCB || false;
		this._initStartCB = type.initStartCB || false;
		this._stepCB = type.stepCB || false;

		this._image = type.image;
	};

	this.getCount = function () {
		return this._count;
	};

	this.getFreeParticleCount = function () {
		return this._views.length - this._freshViewIndex;
	};

	this.setAngles = function (minAngle, maxAngle) {
		this._minAngle = minAngle;
		this._maxAngle = maxAngle;
	};

	this.tick = function (dt) {
		var t = dt / 1000;
		var i = this._freshViewIndex;

		while (i) {
			var view = this._views[--i];
			var opts = view.getOpts();
			opts.dt += dt;
			if (opts.dt > opts.duration) {
				this.releaseView(view);
			} else {
				opts.stepCB && opts.stepCB(view, opts, opts.dt / opts.duration, t);
			}
		}
	};

	this.clear = function () {
		var i = this._freshViewIndex;

		while (i) {
			var view = this._views[--i];
			this.releaseView(view);
		}
	};
});