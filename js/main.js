var Q = Quintus()                          // Create a new engine instance
	.include("Sprites, Scenes, Input, 2D, Touch, UI, Anim") // Load any needed modules
	.setup({maximize: true}) // Add a canvas element onto the page
	.touch();                // Add in touch support (for the UI)

Q.input.touchControls({
	controls:  [ ['left','<' ],
			   ['right','>' ],
			   [],
			   [],
			   [],
			   [],
			   [],
			   ['action','^'] ]
});

Q.input.keyboardControls({
	LEFT: "left",
	RIGHT: "right",
	UP: "up"
});

Q.animations('mario', {
	stand_right: { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], rate: 1/5 },
	run_right: { frames: [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36], rate: 1/15},
	jump_right:  { frames: [37,38,39,40,41,42,43,44,45,46,47,48], rate: 1/15, loop: false},
	stand_left: { frames: [49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64], rate: 1/5 },
	run_left: { frames: [65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85], rate: 1/15},
	jump_left:  { frames: [86,87,88,89,90,91,92,93,94,95,96,97], rate: 1/15, loop: false}
});

Q.animations('goomba', {
	walk_right: { frames: [8,9,10,11,12,13,14,15], rate: 1/15},
	walk_left: { frames: [0,1,2,3,4,5,6,7], rate: 1/15}
});

Q.Sprite.extend("Mario", {
	init: function(p) {
    this._super(p, { sheet: "mario", sprite: "mario" });
    this.add('2d, platformerControls, animation');
    this.on("hit.sprite",function(collision) {
		  if(collision.obj.isA("Castle")) {
			Q.stageScene("endGame",1, { label: "You Won! :)" }); 
			this.destroy();
		  }
    	});
  	},
  	
  	step: function(dt) {
  	
		if(this.p.vx > 0) {
			//if(this.p.vy > 0)
				//this.play("jump_right", 1);
			//else
		  		this.play("run_right");
		} else if(this.p.vx < 0) {
			//if(this.p.vy > 0)
				//this.play("jump_left", 1);
			//else
		  		this.play("run_left");
		} else if(this.p.vy > 0) {
			//if (this.p.direction == "left")
				//this.play("jump_left", 2);
			//else if (this.p.direction == "right")
				//this.play("jump_right", 2);
		} else {
			if (this.p.direction == "left")
			{
				this.play("stand_left");
			}
			else if (this.p.direction == "right")
			{
				this.play("stand_right");
			}
		}
	}
  
});

Q.Sprite.extend("Castle", {
  init: function(p) {
    this._super(p, { sheet: 'castle' });
  }
});

Q.Sprite.extend("Goomba",{
  init: function(p) {
    this._super(p, { sheet: 'goomba', vx: 100, sprite: 'goomba' });
    this.add('2d, aiBounce, animation');
    
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Mario")) { 
        Q.stageScene("endGame",1, { label: "You Died :(" }); 
        collision.obj.destroy();
      }
    });
    
    this.on("bump.top",function(collision) {
      if(collision.obj.isA("Mario")) { 
        this.destroy();
        collision.obj.p.vy = -300;
      }
    });
  },
  
	step: function(dt) {
		if(this.p.vx > 0) {
			this.play("walk_right");
		}
		else if(this.p.vx < 0) {
			this.play("walk_left");
		}
	}
  
});

Q.scene("level1",function(stage) {
	// Add in a repeater for a little parallax action
	stage.insert(new Q.Repeater({ asset: "bg.png", speedX: 0.1, speedY: 0.1, repeatY: true}));
	var ground = new Q.TileLayer({ x:0, y:0, dataAsset: 'ground.json', sheet: 'ground'});
	stage.collisionLayer(ground);

	var player = stage.insert(new Q.Mario({x:800, y:-32}));
	Q.gravityY = 600;
    
	stage.add("viewport").follow(player,{x:true,y:false});
        stage.centerOn(0,-Q.height/2 + 24);
	
	var goombaDirectionChance = 0.5; //50% chance of goomba going left or right
	var velocity;
	
	for(var count = 1000; count < 4000; count = count + 900)
	{
            velocity = (Math.random() > goombaDirectionChance ? 100 : -100);
	    stage.insert(new Q.Goomba({ x: count, y: 0, vx: velocity }));
	}
	stage.insert(new Q.Castle({ x: 10000, y: -16 }));
});

Q.scene('endGame',function(stage) {
	var box = stage.insert(new Q.UI.Container({
		x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
	}));

	var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
										   label: "Play Again" }))         
	var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
										label: stage.options.label }));
	button.on("click",function() {
		Q.clearStages();
		Q.stageScene('level1');
	});
	box.fit(20);
});

Q.load("mario.png, goomba.png, castle.png, ground.png, ground.json, bg.png", function() {
	Q.sheet("mario", "mario.png", { tilew: 32, tileh: 32 });
	Q.sheet("goomba", "goomba.png", { tilew: 32, tileh: 32 });
	Q.sheet("castle", "castle.png", { tilew: 32, tileh: 32 });
	Q.sheet("ground","ground.png", { tilew: 32, tileh: 24 });
	Q.stageScene("level1");
});
