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

/**
 * Linear interpolation of position
 */
exports.linear = function (view, opts, d, dt) {
	var style = view.style;
	var start = opts.start;
	var x = start.x + opts.dx * d;
	var y = start.y + opts.dy * d;

	if (opts.velocity) {
		opts.movedX += opts.velocity.x * dt;
		opts.movedY += opts.velocity.y * dt;
		x += opts.movedX;
		y += opts.movedY;
	}

	style.opacity = 1;
	style.scale = start.p + opts.dp * d;
	style.x = x;
	style.y = y;
	style.visible = true;
};

/**
 * Linear interpolation of position, size
 */
exports.linearScale = function (view, opts, d, dt) {
	var style = view.style;
	var start = opts.start;
	var x = start.x + opts.dx * d;
	var y = start.y + opts.dy * d;

	if (opts.velocity) {
		opts.movedX += opts.velocity.x * dt;
		opts.movedY += opts.velocity.y * dt;
		x += opts.movedX;
		y += opts.movedY;
	}

	style.x = x;
	style.y = y;
	style.scale = d;
	style.visible = true;
};

/**
 * Stay in one place, size
 */
exports.fixedScale = function (view, opts, d, dt) {
	var style = view.style;
	var start = opts.start;

	style.x = start.x;
	style.y = start.y;

	style.scale = (d < 0.5) ? d * 2 : 1 - (d - 0.5) * 2;
	style.opacity = 1;
	style.visible = true;
};