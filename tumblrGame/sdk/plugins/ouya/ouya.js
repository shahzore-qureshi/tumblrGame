var Ouya = Class(function () {
	this.ACTION = {
		DOWN: 1,
		UP: 2
	};

	this.BUTTON = {
		O: 96,
		U: 99,
		Y: 100,
		A: 97,
		MENU: 82,
		DPAD: {
			UP: 19,
			DOWN: 20,
			RIGHT: 22,
			LEFT: 21
		},
		L: [
			0,
			104,
			102,
			106
		],
		R: [
			0,
			105,
			103,
			107
		]
	};

	this.init = function() {
		logger.log("{ouya} Installing key listeners");

		NATIVE.events.registerHandler('ouyakey', function(evt) {
			exports.onDigitalInput && exports.onDigitalInput(evt);
		});

		NATIVE.events.registerHandler('ouyamotion', function(evt) {
			exports.onAnalogInput && exports.onAnalogInput(evt);
		});
	}
});

exports = new Ouya();

