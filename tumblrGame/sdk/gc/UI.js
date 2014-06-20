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

from util.browser import $;
import std.uri;
import std.js as JS;
import lib.Iterator;
import lib.Callback;
import device;
import ui.widget.Spinner as Spinner; 

var config = window.CONFIG;

logger.log("ITS ", GLOBAL.HTMLCanvasElement);
var uiExports = {
	GCView: function () {
		import ui.View;
		return ui.View;
	},
	GCImage: function () {
		import ui.resource.Image;
		return ui.resource.Image;
	},
	GCImageView: function () {
		import ui.ImageView;
		return ui.ImageView;
	},
	GCCanvas: getCanvasCtor,
	GCSprite: function () {
		import ui.SpriteView;
		return ui.SpriteView;
	},
	GCResources: function () { // deprecated
		import ui.resource.loader;
		return ui.resource.loader;
	}
};

exports = Class(function () {
	var loader = null;
	this.cssFile = function (path, cb) {
		//if (!loader) { loader = jsio('import squill.cssLoad'); }

		// load from cache
		var textContent = CACHE[path];
		if (textContent) {
			$({tag: 'style', text: textContent, parent: document.getElementsByTagName('head')[0]});
			setTimeout(cb, 0);
		}
		
		//loader.get(path, cb);
	}
	
	this._spinnerCounter = 0;

	import device;

	var baseScale;
	if (navigator.displayMetrics) {
		baseScale = navigator.displayMetrics.densityDpi / 160;
	} else if (!CONFIG.scaleDPR && device.isMobileBrowser) {
		baseScale = 1;
	} else {
		baseScale = window.devicePixelRatio || 1;
	}

	this._scale = baseScale;

	this.setTargetDensity = function (target) {
		switch (target) {
			case 'high':
				this._scale = baseScale * 0.5;
				break;
			case 'medium':
				this._scale = baseScale * 0.75;
				break;
			case 'low':
			default:
				this._scale = baseScale;
				break;
		}

		logger.log('scale:', this._scale);
	}

	this.getScale = function () {
		return this._scale;
	}

	this.getIntValue = function (val) {
		return Math.round(val * this._scale) / this._scale;
	}

	this.showSpinner = function () {
		if (this._spinnerCounter) {
			++this._spinnerCounter;
			return;
		}
		
		var parent = GC.app.view;
		if (!parent) { return; }
		
		++this._spinnerCounter;
		
		if (!this._spinner) {
			var dim = device.screen.devicePixelRatio * 50;
			this._spinner = new Spinner({
				width: dim,
				height: dim,
				x: parent.style.width / 2 - dim / 2,
				y: parent.style.height / 2 - dim / 2,
				parent: parent
			});
		} else {
			parent.addSubview(this._spinner);
		}
	}
	
	this.hideSpinner = function () {
		--this._spinnerCounter;
		if (this._spinnerCounter <= 0) {
			this._spinnerCounter = 0;
			
			this._spinner && this._spinner.removeFromSuperview();
		}
	}
	
	// this.showDisplayNameDialog = function () {
	// 	this.getDisplayNameDialog().show();
	// }
	
	// this.showAcceptInviteDialog = function (cb) {
	// 	GC.getConnection().withHandshake(this, function (err) {
	// 		if (err) { cb(err); return; }
			
	// 		// TODO: conn.getLoginDetails()
	// 		logger.warn('put some real details in here');

	// 		var details = {
	// 			from: 'Martin',
	// 			game: 'Chess',
	// 			summary: 'chess, 15 min, rated'
	// 		};
			
	// 		var dialog = this.getAcceptInviteDialog();
	// 		dialog.setDetails(details);
	// 		dialog.delegate = function (action) {
	// 			switch (action) {
	// 				case 'accept':
	// 					GC.app.launchMultiplayerGame();
	// 					break;
	// 				case 'decline':
	// 				default:
	// 					cb(action);
	// 					break;
	// 			}
	// 		};
			
	// 		dialog.show();
			
	// 		cb && cb('opened');
	// 	});
	// }
	
	// this.showChat = function () {
	// 	if (!this._chatMenu) {
	// 		import GCMenus.Chat;
	// 		this._chatMenu = new GCMenus.Chat();
	// 	}
		
	// 	var menuController = this.getMenuController();
	// 	if (menuController.isVisible()) {
	// 		menuController.push(this._chatMenu);
	// 	} else {
	// 		menuController.push(this._chatMenu, true);
	// 		menuController.fadeIn();
	// 		this._chatMenu.subscribeOnce('BeforeHide', this, function () {
	// 			menuController.fadeOut();
	// 		});
	// 	}
	// }
	
	// this.alert = function (msg) {
	// 	this.showDialog({title: '', message: msg});
	// }
	
	// this.showError = function (opts) {
	// 	this.showDialog(merge(opts, {title: 'Error:', message: "Sorry!"}));
	// }
	
	// this.showDialog = function (opts) {
	// 	import GCDialogs.AlertDialog;
	// 	var dialog = new GCDialogs.AlertDialog(opts);
	// 	dialog.show();
	// 	return dialog;
	// }
	
	// this.getAcceptInviteDialog = function () {
	// 	if (!this._acceptInviteDialog) {
	// 		import GCDialogs.AcceptInviteDialog;
	// 		this._acceptInviteDialog = new GCDialogs.AcceptInviteDialog();
	// 	}
		
	// 	return this._acceptInviteDialog;
	// }
	
	// this.getDisplayNameDialog = function () {
	// 	if (!this._displayNameDialog) {
	// 		import GCDialogs.DisplayNameDialog;
	// 		this._displayNameDialog = new GCDialogs.DisplayNameDialog();
	// 	}
		
	// 	return this._displayNameDialog;
	// }
	
	// this.getParentNode = function () {
	// 	if (!this._parentNode) {
	// 		import timestep.doc;
	// 		this._parentNode = timestep.doc.getElement();
	// 	}
	// 	return this._parentNode;
	// }
	
	// this.showMainMenu = function (opts) {
	// 	opts = merge(opts, {
	// 		fade: true,
	// 		backToGame: false
	// 	});
		
	// 	var controller = this.getMenuController();
	// 	var mainMenu = this.getMainMenu();
	// 	mainMenu.setGameRunning(opts.backToGame);
	// 	controller.push(mainMenu);
	// 	if (opts.fade) { controller.fadeIn(); }
	// }
	
	// this.fadeOutMenus = function () { this.getMenuController().fadeOut(); }
	// this.fadeInMenus = function () { this.getMenuController().fadeIn(); }
	
	// this.getMenuController = function () {
	// 	if (!this._menuController) {
	// 		import GCMenus.MainMenu;
	// 		import squill.MenuController;
	// 		this._menuController = new squill.MenuController({
	// 			controller: this,
	// 			parent: this.getParentNode(),
	// 			delegate: GCMenus.MainMenu.delegate,
	// 			id: 'mainMenuController'
	// 		});
	// 	}
		
	// 	return this._menuController;
	// }
	
	// this.getMainMenu = function () {
	// 	if (!this._mainMenu) {
	// 		import GCMenus.MainMenu;
	// 		this._mainMenu = new GCMenus.MainMenu(merge(this._mainMenuOpts, {
	// 			supports: {} //MANIFEST.supports
	// 		}));
	// 	}
		
	// 	return this._mainMenu;
	// }
	
	// this.setMainMenuOpts = function (opts) {
	// 	this._mainMenu = null;
	// 	this._mainMenuOpts = merge(opts, {
	// 		title: 'Welcome!',
	// 		imgLogo: 'resources/images/logo.png',
	// 		imgSingle: 'resources/images/btnSingle.png',
	// 		imgMulti: 'resources/images/btnMulti.png',
	// 		showInvites: true,
	// 		showGames: true,
	// 		quitGameOnShow: false
	// 	});
		
	// 	return this;
	// }
	
	// this.getMainMenuOpts = function () { return this._mainMenuOpts; }
	
	// this.hideCursor = function () {
	// 	var el = GC.app.getCanvas().getElement();
	// 	if (el) { el.style.cursor = 'none'; }
	// }
	
	// this.showCursor = function (name) {
	// 	var el = GC.app.getCanvas().getElement();
	// 	if (el) { el.style.cursor = name || 'default'; }
	// }
});

var cache = {};
for (var key in uiExports) {
	var getter = bind(GLOBAL, function (key) {
			return cache[key] || (cache[key] = uiExports[key]());
		}, key);
	
	if (GLOBAL.__defineGetter__) {
		GLOBAL.__defineGetter__(key, getter);
	} else {
		if (Object.defineProperty) {
			Object.defineProperty(GLOBAL, key, {get: getter});
		}
	}
}

function AsyncImageLoader(url, callback) {
	var img = new ui.resource.Image({url: url});
	img.doOnLoad(function (success) { callback(img); });
}

function getCanvasCtor() {
	import device;
	var ctor = device.get('Canvas');
	return ctor;
}
