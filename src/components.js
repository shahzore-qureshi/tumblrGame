Crafty.c("Obstacle",
{
	init: function()
	{
		this.requires("2D, DOM");
	}
});

Crafty.c("Mario",
{
	init: function()
	{
		this.requires("2D, DOM, Multiway, Image, Collision")
			.multiway(10, {UP_ARROW: -90, RIGHT_ARROW: 0, LEFT_ARROW: -180})
			.attr({x: 50, y: 350, w: 30, h: 30})
			.image("assets/mario1.png")
			.stop();
	},

	stop: function()
	{
		this.onHit("Obstacle", this.stopMovement);
		return this;
	},

	stopMovement: function(target)
	{
		this._speed = 0;
		if (this._movement)
		{
			//console.log("movement: " + this._movement.x + " " + this._movement.y);
			//console.log("target: " + target[0].obj.x + " " + target[0].obj.y);
			this.x -= this._movement.x;
			this.y -= this._movement.y;
		}
	}
});

