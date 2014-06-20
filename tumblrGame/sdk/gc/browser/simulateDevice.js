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

import lib.Enum;

exports.simulate = function (params) {
	if (params.userAgent) {
		var navigator = window.navigator;
		var shim = window.navigator = {};
		for (var i in navigator) {
			shim[i] = navigator[i];
		}

		shim.userAgent = params.userAgent;
	}

	window.devicePixelRatio = params.devicePixelRatio || 1;

	import device;

	var deviceName = params.name.toLowerCase();
	
	device.simulating = params;
	device.simulatingMobileNative = params.target == "native-android" || params.target == "native-ios";
	device.simulatingMobileBrowser = params.target == "browser-desktop" || params.target == "browser-mobile";
	
	if (device.simulatingMobileBrowser) {
		device.isMobileBrowser = true;
		device.setUseDOM(true);
	}

	if (device.simulatingMobileNative) {
		device.setUseDOM(false);
	}

}
