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
var isSimulator = device.isSimulator;

if (isSimulator) {
	// prefix filenames in the debugger
	jsio.__env.debugPath = function (path) { return 'http://' + window.location.host + '/' + path; }

	// NATIVE will be simulated in this case
} else {
	device.simulatingMobileNative = true;
	import gc.debugging.nativeShim;
}

// shims

if (!window.JSON) {
	jsio('import std.JSON').createGlobal();
}

if (!window.console) {
	window.console = {};
	window.console.log = window.console.info = window.console.error = window.console.warn = function () {};
}

if (!window.localStorage) {
	window.localStorage = {
		getItem: function () {},
		setItem: function () {},
		removeItem: function () {}
	}
}

var splash = document.getElementById('_GCSplash');
if (splash) {
	if (!CONFIG.splash.hide) {
		CONFIG.splash.hide = function () {
				// timeout lengths are debateable. Perhaps they could
				// be configurable. On one hand these time out lengths increase
				// the length of time that nothing is happening. However, it also
				// makes the transition into the game much smoother. The initial timeout
				// is for images to pop in.
				setTimeout(function() {
					splash.style.opacity = 0;
					setTimeout(function() {
						splash.parentNode.removeChild(splash);
					}, 1000);
				}, 2000);
			};
	}
}

// parsing options
import std.uri;
var uri = new std.uri(window.location);
var mute = uri.hash('mute');
CONFIG.isMuted = mute != undefined && mute != "false" && mute != "0" && mute != "no";

if (DEBUG && isSimulator) {
	// device simulation

	// simulate device chrome, input, and userAgent
	var sim_device = uri.query('device') || uri.hash('device');
	if (sim_device) {
		// hack to access SDK static resolutions file from a debug device
		try {
			jsio("import preprocessors.import");
			jsio("import preprocessors.cls");

			import .simulateDevice;
			var resImport = "import ....static.util.resolutions";
			var resolutions = jsio.__jsio(resImport);

			simulateDevice.simulate(resolutions.get(sim_device));
		} catch (e) {
			logger.error(e);
		}
	}

	import ..debugging.connect;
	debugging.connect.connect(null, function (conn) {
		conn.sendEvent('HANDSHAKE', {
			type: 'simulator',
			port: window.location.port // used to identify the simulator
		});

		setTimeout(bind(this, startApp, conn), 0);
	});
} else {
	startApp();
}

function startApp (conn) {

	// setup timestep device API

	import device;
	import platforms.browser.initialize;
	device.init();

	// logging

	if (isSimulator && conn) {

		import ..debugging.TimestepInspector;
		conn.addClient(new debugging.TimestepInspector());

		var initDebugging = function () {
			var env = jsio.__env;
			
			var originalSyntax = bind(env, env.checkSyntax);
			var originalFetch = bind(env, env.fetch);

			env.fetch = function (filename) {
				logging.get('jsiocore').warn('LOADING EXTERNAL FILE:', filename);
				return originalFetch.apply(this, arguments);
			}
			
			env.checkSyntax = function (code, filename) {
				var xhr = new XMLHttpRequest();
				xhr.open('POST', '/.syntax', false);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.onreadystatechange = function () {
					if (xhr.readyState != 4) { return; }
				
					if (xhr.status == 200 && xhr.responseText) {
						var err;
						try {
							var response = JSON.parse(xhr.responseText);
							err = response[1];
						} catch(e) {
							err = xhr.responseText;
						}

						console.log(err);
						
						document.body.innerHTML = '<pre style=\'margin-left: 10px; font: bold 12px Consolas, "Bitstream Vera Sans Mono", Monaco, "Lucida Console", Terminal, monospace; color: #FFF;\'>'
							+ '<span style="color:#AAF">' + filename + '</span>\n\n'
							+ err.map(function (e) {
									if (e.err) {
										return '<span style="color:#F55">' + e.err.replace(/error - parse error.\s+/i, '') + '</span>\n'
											+ ' <span style="color:#5F5">' + e.line + '</span>: '
												+ ' <span style="color:#EEE">' + e.code[0] + '</span>\n'
												+ new Array(('' + e.line).length + 5).join(' ') + e.code[1];
									} else {
										return'<span style="color:#F55">' + e.code.join('\n') + '</span>';
									}
								}).join('\n')
							+ '</pre>';
					} else if (xhr.status > 0) {
						originalSyntax(code, filename);
					}
				}
			
				xhr.send('javascript=' + encodeURIComponent(code));
			}
		};

		if (device.isMobileBrowser) {
			conn.initLogProxy();
			conn.initRemoteEval();
		}

		initDebugging();
	}

	// init sets up the GC object
	import gc.API;
	GC.buildApp('launchUI');

	if (isSimulator && conn) {
		conn.setApp(GC.app);
	}
}
