import event.Emitter as Emitter;

import .views.InputView as InputView;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this.setMaxListeners(100); // Lots of stuff needs to listen to this!

		opts.game = this;

		this._paused = true;

		this._modelPools = [];
		this._worldView = opts.worldView;

		this._inputLayer = new InputView({
			superview: opts.superview,
			x: opts.x || 0,
			y: opts.y || 0,
			width: opts.width || GC.app.baseWidth,
			height: opts.height || GC.app.baseHeight,
			zIndex: 5
		});
	};

	this.reset = function (equipItems) {
		for (var i in this._modelPools) {
			var modelPool = this._modelPools[i];
			modelPool && modelPool.reset && modelPool.reset(equipItems);
		}

		this._inputLayer.style.visible = true;

		this._paused = false;

		this._worldView.setPaused(this._paused);
		this._worldView.reset();
	};

	this.addItemSpawner = function (itemSpawner, modelPool) {
		itemSpawner.on('ItemSpawned', bind(this, 'onItemSpawned'));

		if (modelPool !== undefined) {
			this._modelPools[modelPool] = itemSpawner;
		}

		return itemSpawner;
	};

	this.onItemSpawned = function (opts) {
		opts.game = this;

		var view = this._worldView.obtainView(opts);
		view.create && view.create(opts);

		var item = opts.item;
		item.refreshOpts && item.refreshOpts();
		item.on('Update', bind(view, 'onUpdate'));
	};

	this.getInputLayer = function () {
		return this._inputLayer;
	};

	this.getModelPool = function (type) {
		return this._modelPools[type];
	};

	this.setPaused = function (paused) {
		this._worldView.setPaused(paused);
		this._paused = paused;
	};

	this.getParticleSystem = function (type) {
		return this._worldView.getParticleSystem(type);
	};

	this.createParticles = function (type, particleType, pos, velocity, count) {
		this._worldView.createParticles(type, particleType, pos, velocity, count);
	};

	this.createParticle = function (pos, type) {
		this._worldView.createSmokeParticle(pos, type);
	};

	this.collidesWithPool = function (sender, poolType) {
		return sender.collidesWithModelPool(this._modelPools[poolType]);
	};
});