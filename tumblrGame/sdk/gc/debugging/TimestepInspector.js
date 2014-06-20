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

// this whole file should not get included in release
if (DEBUG) {
	import device;
	import math.geom.Point as Point;
	import ui.resource.Image as Image;
	import ui.ImageView as ImageView;

	import .OverlayRenderer;

	// mapping for reading/writing style properties on a view
	// map: inspector id -> style property
	var _propMap = {
		relX: 'x',
		relY: 'y',
		relR: 'r',
		relWidthPercent: 'widthPercent',
		relHeightPercent: 'heightPercent',
		relWidth: 'width',
		relHeight: 'height',
		relScale: 'scale',
		opacity: 'opacity',
		zIndex: 'zIndex',
		visible: 'visible',
		anchorX: 'anchorX',
		anchorY: 'anchorY',
		offsetX: 'offsetX',
		offsetY: 'offsetY',
		clip: 'clip',
		layout: 'layout',
		inLayout: 'inLayout',
		top: 'top',
		left: 'left',
		bottom: 'bottom',
		right: 'right',
		flex: 'flex',
		direction: 'direction',
		justifyContent: 'justifyContent',
		order: 'order',

		layoutWidth: 'layoutWidth',
		layoutHeight: 'layoutHeight',
		centerX: 'centerX',
		centerY: 'centerY',
		minWidth: 'minWidth',
		minHeight: 'minHeight',
		maxWidth: 'maxWidth',
		maxHeight: 'maxHeight',
	};

	var dispatchWindowEvent = function(eventName) {
		var e = document.createEvent('Event');
		e.initEvent(eventName, true, true);
		window.dispatchEvent(e);
	};

	exports = Class(function () {
		this.init = function (conn) {
			this._overlay = new OverlayRenderer();
		};

		this.setConn = function (conn) {
			this._conn = conn;

			if (CONFIG.splash) {
				var prevHide = CONFIG.splash.hide;
				CONFIG.splash.hide = bind(this, function () {
					prevHide && prevHide.apply(this, arguments);
					if (this._conn) {
						this._conn.onConnect(this, function () {
							this._conn.sendEvent('HIDE_LOADING_IMAGE');
						});
					}
				});
			}

			conn.onEvent.subscribe('BATCH', this, function (evt) {
				var i;
				for (i in evt.args) {
					conn.onEvent.publish(evt.args[i].name, evt.args[i].args);
				}
			});

			conn.onEvent.subscribe('SET_NAME', this, function (evt) {
				GLOBAL._name = evt.args.name;
				logging.setPrefix(evt.args.name + ': ');
			});

			var _homeScreen = false;
			conn.onEvent.subscribe('HOME_BUTTON', this, function () {
				if (!GC) return;

				var app = GC.app;

				if (this._homeScreen) {
					dispatchWindowEvent('pageshow');
					app.engine.resume();
				} else {
					dispatchWindowEvent('pagehide');
					app.engine.pause();

					var canvas = document.getElementsByTagName('canvas');
					if (canvas.length) {
						canvas = canvas[0];
						if (canvas.getContext) {
							var ctx = canvas.getContext('2d');
							ctx.fillStyle = '#000000';
							ctx.fillRect(0, 0, canvas.width, canvas.height);
						}
					}
				}

				this._homeScreen ^= true;
			});

			conn.onEvent.subscribe('BACK_BUTTON', this, function (evt) {
				GLOBAL.NATIVE.onBackButton && GLOBAL.NATIVE.onBackButton(evt);
			});

			conn.onRequest.subscribe('SCREENSHOT', this, function (req) {
				var canv = GC.app.engine.getElement();
				if (canv && canv.toDataURL) {
					req.respond({
						width: canv.width,
						height: canv.height,
						canvasImg: canv.toDataURL('image/png')
					});
				} else {
					req.error({
						NOT_SUPPORTED: true
					});
				}
			});

			conn.onEvent.subscribe('MUTE', this, function (evt) {
				GLOBAL.ACCESSIBILITY.mute(evt.args.shouldMute);
			});

			var _paused = false;
			conn.onEvent.subscribe('PAUSE', this, function () {
				if (!GC) return;
				var app = GC.app;

				if (_paused) {
					app.engine.resume();
					this._overlay.stopTick();
				} else {
					app.engine.pause();
					this._overlay.startTick();
				}
				_paused = !_paused;
			});

			conn.onEvent.subscribe('STEP', this, function () {
				if (!GC) return;
				var app = GC.app;

				app.engine.stepFrame();
				_paused = true;
			});

			var _input = null;
			conn.onRequest.subscribe('ADD_MOUSE_EVT', this, function (req) {
				if (!_input) { _input = new DebugInputHandler(conn); }
				req.respond();
			});

			conn.onRequest.subscribe('REMOVE_MOUSE_EVT', this, function (req) {
				if (_input) { _input.destroy(); }
				req.respond();
			});

			conn.onEvent.subscribe('SET_HIGHLIGHT', this, function (req) {
				this._overlay.setHighlight(req.args.uid);
				//this._overlay.render();
			});

			conn.onEvent.subscribe('SET_SELECTED', this, function (req) {
				this._overlay.setSelected(req.args.uid);
				//this._overlay.render();
			});

			function findBetterTag (view) {
				var parent = view.getSuperview();
				for (var key in parent) {
					if (parent[key] === view) {
						return key;
					}
				}

				return null;
			}

			conn.onRequest.subscribe('GET_ROOT_UID', this, function (req) {
				req.respond({uid: GC.app.uid});
			});

			conn.onRequest.subscribe('GET_VIEW', this, function (req) {
				var view = _DEBUG.getViewByID(req.args.uid);
				if (!view) {
					req.error('no view with id' + req.args.uid, {VIEW_NOT_FOUND: true});
				} else {
					var sup = view.getSuperview();

					//create the optimal tag
					var tag = view.getTag && view.getTag() || view.toString();
					var betterTag = findBetterTag(view);
					if (betterTag) tag = betterTag + ":" + tag;

					req.respond({
						uid: view.uid,
						superviewID: sup && sup.uid,
						tag: tag,
						subviewIDs: view.getSubviews().map(function (view) { return view.uid; })
					});
				}
			});

			conn.onRequest.subscribe('REPLACE_IMAGE', this, function (req) {
				var args = req.args;
				var imgData = args.imgData;
				var uid = args.uid;

				var view = _DEBUG.getViewByID(uid);
				var newImg = new Image();

				newImg._srcImg.addEventListener("load", function () {
					var map = newImg._map;
					map.width = newImg._srcImg.width,
					map.height = newImg._srcImg.height,
					map.x = 0;
					map.y = 0;
					view.setImage(newImg);
					view.needsRepaint();
				}, false);

				newImg._srcImg.src = imgData;
			});

			conn.onRequest.subscribe('GET_VIEW_PROPS', this, function (req) {
				var args = req.args;
				var view = _DEBUG.getViewByID(args.uid);
				if (!view) {
					return req.error("VIEW_NOT_FOUND");
				}

				var s = view.style;
				var p = view.getPosition();
				var layout = view.__layout;
				var ret = {};
				for (var key in _propMap) {
					ret[key] = s[_propMap[key]];
				}

				merge(ret, {
					absX: p.x,
					absY: p.y,
					absR: p.r,
					absWidth: p.width,
					absHeight: p.height,
					absScale: p.scale,

					subviews: layout && (typeof layout.getSubviews == 'function') && layout.getSubviews().length,
					direction: layout && (typeof layout.getDirection == 'function') && layout.getDirection(),
					padding: s.padding && s.padding.toString()
				});

				for (var key in ret) {
					if (ret[key] == undefined) {
						ret[key] = '-';
					}
				}

				ret.isImageView = view instanceof ImageView;

				if (ret.isImageView) {
					ret.imagePath = view._opts.image || (view._img && view._img._map && view._img._map.url);
					if (ret.imagePath && ret.imagePath._map) {
						ret.imagePath = ret.imagePath._map.url;
					}
				}

				ret.uuid = args.uid;

				ret.description = (view.constructor.name || 'View') + ' ' + args.uid + '\n' + view.getTag();

				req.respond(ret);
			});

			conn.onRequest.subscribe('SET_VIEW_PROP', this, function (req) {
				var args = req.args;
				var view = _DEBUG.getViewByID(args.uid);
				if (!view) {
					return req.error("VIEW_NOT_FOUND");
				}

				var key = args.key;
				var value = args.value;
				if (key in _propMap) {
					view.style[_propMap[key]] = value;
				} else {
					switch (key) {
						case 'absX': break;
						case 'absY': view.style.y = value; break;
						case 'absWidth': view.style.width = value; break;
						case 'absHeight': view.style.height = value; break;
						case 'absScale': view.style.scale = value; break;
						case 'padding': view.style.padding = value; break;
					}
				}
			});

			var _pollTimer = null;
			var _pollView = null;

			conn.onEvent.subscribe('POLL_VIEW_POSITION', this, function (evt) {

				function poll() {
					if (_pollView) {
						var eventData = _pollView.getPosition();
						eventData.uid = _pollView.uid;

						conn.sendEvent('POLL_VIEW_POSITION', eventData);
					}
				}

				_pollView = _DEBUG.getViewByID(evt.args.uid);
				if (!_pollTimer && _pollView) {
					_pollTimer = setInterval(poll, 100);
				}

				if (!_pollView) {
					clearInterval(poll);
					_pollTimer = null;
				}
			});
		}

		this.setApp = function (app) {
			this._conn.sendEvent('APP_READY', {uid: app.view.uid});
			app.engine.unsubscribe('Render', this);
			app.engine.subscribe('Render', this._overlay, 'render');
		}
	});


	var DebugInputHandler = Class(function () {

		import device;
		var _simulateMouseMove = device.simulating && document.body.addEventListener;

		this.init = function (conn) {
			this.conn = conn;
			this.onMouseMoveCapture = bind(this, this.onMouseMoveCapture);
			this.setShiftDown = bind(this, this.setShiftDown);
			this.onContextMenu = bind(this, this.onContextMenu);

			if (_simulateMouseMove) {
				window.addEventListener('mousemove', this.onMouseMoveCapture, true);

			}

			//exports._overlay.setSize(GC.app.view.style.width, GC.app.view.style.height);

			//hacky hack to determine if the shift was set or not
			window.addEventListener('mousedown', this.setShiftDown, true);
			window.addEventListener('contextmenu', this.onContextMenu, true);

			GC.app.view.subscribe('InputMoveCapture', this, 'onInputMoveCapture');
			//GC.app.view.subscribe('InputStartCapture', this, 'onInputSelectCapture');
		}

		this.setShiftDown = function (e) {
			if (e.which === 3 || e.button === 2) {
				e.stopPropagation();
				e.preventDefault();
				return false;
			}

			this._shiftDown = !!e.shiftKey;

			if (this._shiftDown) {
				this.onInputSelectCapture(e);
				e.stopPropagation();
				e.preventDefault();
				return;
			}
		}

		import event.input.dispatch as dispatch;

		this.onContextMenu = function (e) {
			var data = {
				pt: {x: e.pageX, y: e.pageY}
			};

			//get the views under the pointer
			var clickEvt = {pt: [], trace: [], depth: 0};
			var clickPt = new Point(e.pageX, e.pageY);
			dispatch.traceEvt(GC.app.view, clickEvt, clickPt);

			if (!clickEvt.trace.length) return;
			data.active = clickEvt.trace[0].uid;

			//get the views under the pointer
			var mockEvt = {pt: [], trace: [], depth: 0};
			var mockPt = new Point(e.pageX, e.pageY);

			this.traceEvt(GC.app.view, mockEvt, mockPt);

			data.trace = [];
			//convert to small objects
			for (var i = mockEvt.trace.length - 1, item; item = mockEvt.trace[i]; --i) {
				data.trace.push({
					uid: item.view.uid,
					tag: item.view.getTag(),
					depth: item.depth
				});
			}

			this.conn.sendEvent('INPUT_TRACE', data);

			e.stopPropagation();
			e.preventDefault();
			return false;
		}

		this.destroy = function () {
			if (_simulateMouseMove) {
				window.removeEventListener('mousedown', this.onMouseDownCapture, true);
			}

			window.removeEventListener('mousedown', this.setShiftDown, true);
			GC.app.view.unsubscribe('InputMoveCapture', this, 'onInputMoveCapture');
			//GC.app.view.unsubscribe('InputStartCapture', this, 'onInputSelectCapture');
		}

		this.onInputMoveCapture = function (evt, pt, allEvt, allPt) {
			var trace = [];

			//loop backwards through the trace
			for (var i = evt.trace.length - 1, view; view = evt.trace[i]; --i) {
				trace.push(view.uid);

				var superview = view.getSuperview();
				while (superview && superview != evt.trace[i + 1]) {
					trace.push(superview.uid);
					superview = superview.getSuperview();
				}
			}

			var data = {
				x: pt.x,
				y: pt.y,
				trace: trace
			};

			this.conn.sendEvent('INPUT_MOVE', data);
		}

		this.onInputSelectCapture = function (e) {
			//only send event if shift click


			var evt = {pt: [], trace: [], depth: 0};
			var pt = new Point(e.pageX, e.pageY);
			dispatch.traceEvt(GC.app.view, evt, pt);

			var trace = [];
			for (var i = evt.trace.length - 1, view; view = evt.trace[i]; --i) {
				trace.push(view.uid);

				var superview = view.getSuperview();
				while (superview && superview != evt.trace[i + 1]) {
					trace.push(superview.uid);
					superview = superview.getSuperview();
				}
			}

			var data = {
				x: pt.x,
				y: pt.y,
				trace: trace
			};

			this.conn.sendEvent('INPUT_SELECT', data);
		}

		this.traceEvt = function (view, evt, pt, depth) {
			depth = depth || 0;

			var localPt = view.style.localizePoint(new Point(pt));

			//if the point is contained add it to the trace
			if (view.containsLocalPoint(localPt)) {
				evt.trace.unshift({view: view, depth: depth});
				evt.pt[view.uid] = localPt;
			}

			var subviews = view.getSubviews();
			for (var i = subviews.length - 1; i >= 0; --i) {
				if (subviews[i].style.visible) {
						this.traceEvt(subviews[i], evt, localPt, depth + 1);
					}
			}

			if (subviews.length === 0) {
				evt.target = view;
				return true;
			}
		};

		this.onMouseMoveCapture = function (e) {
			//$.stopEvent(e);

			//get the event to the active target
			var mockEvt = {pt: [], trace: [], depth: 0};
			var mockPt = new Point(e.pageX, e.pageY);
			dispatch.traceEvt(GC.app.view, mockEvt, mockPt);

			this.onInputMoveCapture(mockEvt, mockPt);
		}
	});
}
