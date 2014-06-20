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

import device;

if (device.simulatingMobileNative) {
	GC.isNative = true;
	var nativeShim = 'import .debugging.nativeShim';
	jsio(nativeShim);
}

import ui.StackView;
import ui.Engine;
import lib.PubSub;
import lib.Callback;

exports = Class(ui.StackView, function (supr) {
	this._settings = {};
	
	this.constructor.start = function (app, entry) {
		entry = entry || 'launchUI';

		var launch;
		if (typeof app[entry] == 'function') {
			launch = bind(app, entry);
		}

		app.view = app;
		app.engine = new ui.Engine({view: app});
		app.engine.show();
		app.engine.startLoop();
		app.initUI && app.initUI();

		var settings = app._settings || {};
		var preload = settings.preload;
		var autoHide = CONFIG.splash && (CONFIG.splash.autoHide !== false);
		if (preload && preload.length) {
			var cb = new lib.Callback();
			for (var i = 0, group; group = preload[i]; ++i) {
				GC.resources.preload(group, cb.chain());
			}
			
			// note that hidePreloader takes a null cb argument to avoid
			// forwarding the preloader result as the callback
			if (autoHide) { cb.run(GC, 'hidePreloader', null); }
			if (launch) { cb.run(launch); }
		} else {
			if (autoHide) { GC.hidePreloader(); }
			launch && launch();
		}
	};
});
