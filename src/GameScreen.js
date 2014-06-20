import device;
import ui.View as View;
import ui.ImageView as ImageView;

/* The GameScreen view is a child of the main application.
 * By adding the scoreboard and the molehills as it's children,
 * everything is visible in the scene graph.
 */
exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {
			x: 0,
			y: 0,
			width: device.width,
			height: device.height,
			backgroundColor: '#37B34A'
		});

		supr(this, 'init', [opts]);

		this.build();
	};
	
	/*
	 * Layout the scoreboard and molehills.
	 */
	this.build = function () {
		console.log("Building...");
		/* The start event is emitted from the start 
		 * button via the main application.
		 */
		this.on('GameScreen:start', start_game_flow.bind(this));
		
		var endButton = new ImageView({
		  superview: this,
		  x: device.width/4,
		  y: device.height/4,
		  width: device.width/2,
		  height: device.height/2,
		  image: "resources/images/title_screen_start.png"
		});

		endButton.on('InputSelect', bind(this, function() {
		  this.emit('GameScreen:end');
		}));
	};
	
});

function start_game_flow () {
	console.log("Starting...");
	//Insert start logic
	play_game.call(this);
};

function play_game () {
	console.log("Playing...");
	//Insert game logic
};