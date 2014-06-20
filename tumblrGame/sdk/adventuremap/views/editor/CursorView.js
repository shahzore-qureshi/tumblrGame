import ui.View as View;
import ui.TextView as TextView;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		this._scrollData = opts.scrollData;
		this._tileX = 0;
		this._tileY = 0;

		supr(this, 'init', [opts]);

		this.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
		this.style.visible = false;

		this._adventureMap = opts.adventureMap;
		this._adventureMapModel = this._adventureMap.getModel();

		this._dt = 0;
	};

	this.showAt = function (tileX, tileY) {
		var adventureMapModel = this._adventureMapModel;

		this._tileX = tileX;
		this._tileY = tileY;

		this.style.x = (tileX - adventureMapModel.getTileX()) * adventureMapModel.getTileWidth();
		this.style.y = (tileY - adventureMapModel.getTileY()) * adventureMapModel.getTileHeight();
		this.style.visible = true;
	};

	this.tick = function (dt) {
		this._dt += dt;
		var color = (Math.abs(Math.sin(this._dt * 0.002)) * 255) | 0;
		this.style.backgroundColor = 'rgba(' + color + ',' + color + ',' + color + ',0.25)';
	};
});