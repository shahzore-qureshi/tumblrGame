import device;
import ui.View;
import ui.ImageView;
import ui.SpriteView;
import ui.ImageScaleView;
import ui.resource.loader as loader;
import src.platformer.util as util;
import src.platformer.ParallaxView as ParallaxView;
import src.platformer.GestureView as GestureView;
import src.platformer.Physics as Physics;
import src.platformer.ScoreView as ScoreView;
import resources.starGrids as starGrids;

/* The GameScreen view is a child of the main application.
 * By adding the scoreboard and the molehills as it's children,
 * everything is visible in the scene graph.
 */
exports = Class(ui.View, function (supr) {
	// Game constants, for easy tweaking:
	const GRAVITY = 1400;
	const HOLD_GRAVITY = GRAVITY / 3;
	const JUMP_VELOCITY = 500;
	const ROLL_VELOCITY = 700;
	const PLAYER_INITIAL_SPEED = 400;
	const WORLD_ACCELERATION = 15;
	const REBOUND_PERCENTAGE = 0.3;
	const SCORE_STAR_VALUE = 100;
	const SCORE_TIME_VALUE = 1;
	
	this.init = function (opts) {
		opts = merge(opts, {
			x: 0,
			y: 0,
			width: device.width,
			height: device.height,
			backgroundColor: '#000000'
		});

		supr(this, 'init', [opts]);
		
		
		
		// After preloding certain assets...
		loader.preload(["resources/images/level", "resources/audio/effects"], function () {

			// Initialize everything.
			// this.resetState();
			this.setupParallaxView();
			// this.setupInput();
			// this.setupPlayer();
			// this.setupUILayer();
			// this.loadSound();
			// this.startGame();
			
			// Physics.start();

			// this flag allows the tick function below to begin stepping.
			//this.loaded = true;
		
		}.bind(this));
	};
	
	// Initialize the ParallaxView, which will serve as a container
	// for most of the layers in our game:
	this.setupParallaxView = function() {
		
		this.parallaxView = new ParallaxView({
			superview: this,
		 	width: this.style.width,
		 	height: this.style.height,
		});
		
		// add a view for the sky
		this.parallaxView.addBackgroundView(new ui.ImageScaleView({
			scaleMethod: 'cover',
			image: "resources/images/level/backgroundSky.png",
		}));
	
		// add some brush, far away
		this.parallaxView.addLayer({
			distance: 20,
			populate: function (layer, x) {
				var v = layer.obtainView(ui.ImageView, {
					superview: layer,
					image: "resources/images/level/fargroundBrush.png",
					x: x,
					y: layer.style.height - 250,
					opacity: 0.5,
					width: 1024,
					height: 212
				});
				return v.style.width;
			}
		});
		
		// add some brush closer to the screen
		this.parallaxView.addLayer({
			distance: 10,
			populate: function (layer, x) {
				var v = layer.obtainView(ui.ImageView, {
					superview: layer,
					image: "resources/images/level/midgroundBrush.png",
					x: x,
					y: layer.style.height - 200,
					width: 1024,
					height: 212
				});
				return v.style.width;
			}
		});		

		// The game layer will contain all of our platforms, the player,
		// and anything else relevant to the main gameplay.
		// Here, we delegate the real work to a separate function for clarity:
		this.gameLayer = this.parallaxView.addLayer({
			distance: 7,
			populate: function (layer, x) {
				return this.populateGameLayer(layer, x);
			}.bind(this)
		});
		
		// Add some low-level fog in front of the platforms:
		this.parallaxView.addLayer({
			distance: 5,
			populate: function (layer, x) {
				var size = util.choice([1,2,3,4,5]);
				var v = layer.obtainView(ui.ImageView, {
					superview: layer,
					image: "resources/images/level/cloud" + size + ".png",
					x: x,
					y: layer.style.height - util.randInt(100, 300),
					opacity: Math.random(),
					autoSize: true
				});
				return util.randInt(200, 500);
			}
		});

		this.parallaxView.addLayer({
			distance: 4,
			populate: function (layer, x) {
				var v = layer.obtainView(ui.ImageView, {
					superview: layer,
					image: "resources/images/level/waterFast.png",
					// Add water at the very bottom of the screen, in front:
					x: x,
					y: layer.style.height - 50,
					width: 1024,
					height: 111
				});
				return v.style.width;
			}
		});
	}
	
	// Clear out a few variables before we start any game:
	this.resetState = function () {
		if (this.isFinished) {
			animate(this.scoreView).commit();
			animate(this.parallaxView).commit();
		}
		this.t = 0;
		this.isFinished = false;
		this.score = 0;
	}
	
	// Here's where the real work for the game layer takes place. You
	// should read through the documentation for ParallaxView to fully
	// understand this function. In short, this function gets called
	// with an `x` coordinate for the position where we should start
	// adding views to the game layer. As the player scrolls further
	// right in the game, this function will get called to add more
	// platforms and items.
	this.populateGameLayer = function (layer, x) {
		var halfh = layer.style.height / 2;

		if (this.lastPlatformHeight == null) {
			this.lastPlatformHeight = 100;
		}

		// First, select a height for the next platform that's
		// somewhat close to the previous platform
		var platformHeight = Math.min(halfh, Math.max(0, 
													  util.randInt(this.lastPlatformHeight - halfh / 2, 
																   this.lastPlatformHeight + halfh / 2)));
		this.lastPlatformHeight = platformHeight;
		
		// Get a new platform of a random size. (This view comes from
		// a ViewPool automatically, which improves performance.)
		var size = util.choice([256, 512, 768, 1024]);
		var platform = layer.obtainView(ui.ImageView, {
			superview: layer,
			image: "resources/images/level/platform" + size + ".png",
			x: x,
			y: layer.style.height - 100 - platformHeight,
			width: size,
			autoSize: true
		});

		// To detect collisions between the player and any platform,
		// we add Physics to this view with a group of "ground".
		Physics.addToView(platform, {group: "ground"});

		// In our game, we predefined grid arrangements of stars to display in
		// starGrids.js. Here, we'll pull out that information and add some views
		// for those stars for the player to collect:
		var starHeight = util.randInt(50, 200);
		var starSize = 50;
		var numStars = size / starSize - 2;
		var maxPerRow = platform.style.width / starSize | 0;
		var grid = util.choice(starGrids); // choose a random arrangement of stars
		var initX = util.randInt(0, Math.max(0, maxPerRow - grid[0].length)) * starSize;
		
		for (var gridY = 0; gridY < grid.length; gridY++) {
			var row = grid[gridY];
			var rowCount = Math.min(row.length, maxPerRow);
			for (var gridX = 0; gridX < rowCount; gridX++) {
				if (grid[gridY][gridX] == 0) {
					continue;
				}
				var star = layer.obtainView(ui.ImageView, {
					superview: layer,
					image: "resources/images/star.png",
					x: x + initX + gridX * starSize,
					y: platform.style.y - starHeight - starSize * gridY,
					anchorX: starSize/2,
					anchorY: starSize/2,
					width: starSize,
					height: starSize,
					scale: 1
				}, {poolSize: 40, group: "star"}); // note the large pool size, for performance.

				// Again, we group these in a "star" group for easy collision detection processing.
				Physics.addToView(star, {group: "star"});
			}
		}
		
		// We want to create spaces where the player could fall in between,
		// and those spaces should get bigger the longer the player has been running:
		var spaceBetweenPlatforms = 0;
		
		// if they're more than a few seconds in, start spacing out the platforms
		if (this.t > 5) {
			spaceBetweenPlatforms = util.randInt(100, 100 + this.t * 20);
		}
		
		// Should we add an enemy?
		if (Math.random() < 0.5 && this.t > 5 && platform.style.width >= 512) {
			var enemyBee = layer.obtainView(EnemyBeeView, {
				superview: layer,
				x: x + util.randInt(0, platform.style.width - 50),
				y: platform.style.y - util.choice([100, 300]),
				width: 50,
				height: 100,
			}, {poolSize: 5, group: "bee"});
		}
		
		
		// Because we populated the view as far as the platform, plus the extra space,
		// we return the amount of space populated. Then, the ParallaxView knows to only populate
		// the view starting from the last unpopulated x coordinate. In this case, it'll 
		// call this function again to populate once we reach the place where we want to 
		// place the next platform.
		return platform.style.width + spaceBetweenPlatforms | 0;

	}

	
});