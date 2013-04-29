
// get the tag to search for
var apiKey = 'http://api.tumblr.com/v2/tagged?tag=super+mario+bros&api_key=MRF3b5gurS1LS79TMfNMuLYb8c2nWc8XneEuCktOikBZrtWm3T&callback=?';
var inputTag = prompt("Please enter a Tumblr tag to search for!", "Super Mario Bros");
if (inputTag != null && inputTag != "")
{
    apiKey = 'http://api.tumblr.com/v2/tagged?tag=' + inputTag + '&api_key=MRF3b5gurS1LS79TMfNMuLYb8c2nWc8XneEuCktOikBZrtWm3T&callback=?';
}

//
var imgLinks = [];
//

// get the tag images
$.getJSON(apiKey).done(function(data) {
    for (var i = 0; i < data.response.length; i++)
    {
	//console.log(data);
	if(data.response[i].photos != undefined && data.response[i].photos[0].alt_sizes[4] != undefined)
	{
	    //console.log("test: " + data.response[i].photos[0].alt_sizes[4].url);
	    imgLinks.push(data.response[i].photos[0].alt_sizes[4].url);
	    //console.log(imgLinks);
	}
    }
    //Start the game
    new Game();
});


function Game()
{
    //Initialize network players.
    var players = new Firebase("https://shaq1nj.firebaseio.com/users/");

    //Generate a random player ID.
    var playerID = (Math.floor(Math.random() * 123234234001));

    //List of available network players (opponents).
    var networkPlayerList = [];

    //Create new Firebase obj for current player.
    var dataRef = new Firebase("https://shaq1nj.firebaseio.com/users/" + playerID);
    //If browser closes, disconnect from server.
    dataRef.onDisconnect().remove();
    //Initialize character on network.
    dataRef.set({id: playerID, coordX: 50, coordY: 370});

    //Initiate game in DOM Javascript.
    Crafty.init(900,400);
    
    Crafty.scene("Title", function() 
    {
		Crafty.background("#FFFFFF");
		Crafty.sprite("assets/Title.png", 
		{
			title: [0, 0, 900, 400]
		});
		
		Crafty.e("2D, DOM, title").attr({x: 0});
		
		this.restart_game = this.bind('KeyDown', function() 
		{
			Crafty.scene('Main');
		});
		
	}, function() 
	{
		this.unbind('KeyDown', this.restart_game);
	});

	Crafty.scene("Dead", function() 
	{
		var score = Crafty("Mario").score;
		Crafty("Mario").destroy();
		
		Crafty.viewport.init(900, 400);
		Crafty.background("#FFFFFF");
		
		Crafty.sprite("assets/GameOver.png", 
		{
			gameOver: [0, 0, 900, 400]
		});
		
		Crafty.e("2D, DOM, gameOver")
			.attr({x: 0});
		
		Crafty.e("DisplayScore")
			.attr({x: 380, y: 150, w: 400, h: 200})
			.text("Score: " + score);
				
		this.restart_game = this.bind('KeyDown', function() 
		{
			Crafty.scene('Main');
		});
		
	}, function() 
	{
		this.unbind('KeyDown', this.restart_game);
    });

    Crafty.scene("Victory", function() 
    {
    	var score = Crafty("Mario").score;
		Crafty("Mario").destroy();
		
		Crafty.audio.stop("ambiance");
		Crafty.audio.play("castle", 1);
		
		Crafty.viewport.init(900, 400);
		
		Crafty.background("#FFFFFF");
		
		Crafty.sprite("assets/Victory.png", {
			victory: [0, 0, 900, 400]
		});
		
		Crafty.e("2D, DOM, victory")
			.attr({x: 0});
			
		Crafty.e("DisplayScore")
			.attr({x: 375, y: 150, w: 400, h: 200})
			.text("Score: " + score);
		
		this.restart_game = this.bind('KeyDown', function() 
		{
			Crafty.scene('Main');
		});
		
	}, function() 
	{
		this.unbind('KeyDown', this.restart_game);
	});

    Crafty.scene("Main", function() 
    {
		var bg = Crafty.e("Background, 2D, DOM, Image")
			.attr({w: 12000, h: 400})
			.image("assets/bg.png", "repeat");
	
		var platformBeginning = Crafty.e("Ground")
			.attr({x: 0, y: 375, w: 500, h: 25});
			
		Crafty.audio.play("ambiance", -1);

		//Create random pitfalls via generating random bits of land.
		for(var i = 0; i < 50; i++) 
		{
			var randX = Math.floor(Math.random() * (11000 - 500 + 1) + 500);
			Crafty.e("Ground")
				.attr({x: randX, y: 375, w: 200, h: 25});
				
			//Percent chance of creating enemy on platform.
			var createEnemyChance = 20;
			var result = Math.floor(Math.random() * (100 - 1 + 1) + 1);
			if (result <= createEnemyChance)
			{
			var enemy = Crafty.e("EnemyGoomba")
				.attr({x: randX + 170, y: 345,
				   leftBoundary: randX,
				   rightBoundary: randX + 170,
				   w: 30, h: 30, dX: -1});
			}
		}
	
		//Spawn random enemies.
		for (var i = 0; i < 10; i++)
		{
			var randX = Math.floor(Math.random() * (11500 - 500 + 1) + 500);
			var randY = Math.floor(Math.random() * (300 - 35 + 1) + 35);
			var enemy = Crafty.e("EnemyBullet")
			.attr({x: randX, y: randY, w: 40, h: 35, dX: -2});
		}

		var platformEnding = Crafty.e("Ground")
			.attr({x: 11500, y: 375, w: 500, h: 25});
				
		var pitfallDetector = Crafty.e("Pitfall, 2D, DOM")
			.attr({x: 0, y: 400, w: 12000, h: 50});		

		var leftBoundary = Crafty.e("Obstacle, 2D, DOM, Color")
			.attr({x: -5, y: 0, w: 5, h: 400})
			.color('rgb(255,255,255)');
	
		var rightBoundary = Crafty.e("Obstacle, 2D, DOM, Color")
			.attr({x: 11995, y: 0, w: 5, h: 400})
			.color('rgb(255,255,255)');
	
		var castle = Crafty.e("Castle")
			.attr({x: 11950, y: 318, w: 32, h: 32});
	
		var lifeCounter = Crafty.e("LifeCounter")
			.attr({x: 15, y: 383, w: 100});	
	
		var scoreCounter = Crafty.e("ScoreCounter")
			.attr({x: 70, y: 383, w: 100});
		
		var mario = Crafty.e("Mario, Gravity")
			.bind("Moved", trackCoord)
		//Any obstacle can stop Mario from falling.
			.gravity("Obstacle");

		function trackCoord()
		{
			lifeCounter.x = this.x - 35;
			scoreCounter.x = this.x + 20;
			//Push data to multiplayer server.
			dataRef.update({coordX: this.x, coordY: this.y});
		}

		for(var i = 0; i < imgLinks.length; i++)
		{
			var randX = Math.floor(Math.random() * (11000 - 400 + 1) + 400);
			var randY = Math.floor(Math.random() * (150 - 100 + 1) + 150);
			Crafty.e("Obstacle, Image")
			.attr({x: randX, y: randY, w:100, h:100})
			.image(imgLinks[i]);
		}

		//Specify camera angle and view to follow Mario.
		Crafty.viewport.follow(mario, 0, 0);

		//Draw other online players using players Firebase object
		// (not dataRef obj). Only call this once.
		players.once('value', function(snapshot) {
			snapshot.forEach(function(child) {
			childData = child.val();
			if (childData.id !== playerID && childData.id !== undefined)
			{
				//console.log("current id: " + playerID);
				//console.log("new opponent id found: " + childData.id);
				networkPlayerList.push(childData.id);
				//console.log("Player List: " + networkPlayerList);
				//Use this variable to keep track of network sprite.
				var entityID = childData.id;

				Crafty.e("" + entityID + ", NetworkPlayer, Gravity")
				.attr({x: childData.coordX, y: childData.coordY,
					   w: 30, h: 30})
				//Added gravity so that other players land too. 
				//It wasn't doing it on its own.
				//I guess gravity coordinate changes are not tracked.
				.gravity("Obstacle")
				//Update location when child data changes.
				.bind("moveID" + entityID, changeLocation);
			}
			});
		});

		//Add new players as they come.
		players.on('child_added', function(snapshot) {
			var otherPlayer = snapshot.val();
			if (otherPlayer.id !== playerID && otherPlayer.id !== undefined)
			{
			//console.log("child added id: " + otherPlayer.id);
			networkPlayerList.push(otherPlayer.id);
			//console.log("Player List: " + networkPlayerList);
			var entityID = otherPlayer.id; //Use this variable to keep track of network sprite.
		
			Crafty.e("" + entityID + ", NetworkPlayer, Gravity")
				.attr({x: otherPlayer.coordX, y: otherPlayer.coordY,
				   w: 30, h: 30})
			//Added gravity so that other players land too. 
			//It wasn't doing it on its own.
			//I guess gravity coordinate changes are not tracked.
				.gravity("Obstacle")
			//Update location when child data changes.
				.bind("moveID" + entityID, changeLocation);
			}
		});

		//When change is detected on server, update location of network player.
		function changeLocation(playerObject)
		{
			this.x = playerObject.coordX;
			this.y = playerObject.coordY;
		}

		//Update position of other players.
		players.on('child_changed', function(snapshot) {
			//console.log("change detected");
			var otherPlayer = snapshot.val();
			if (otherPlayer.id !== playerID && otherPlayer.id !== undefined)
			{
			//console.log("child change id: " + otherPlayer.id);
			//Update location via event triggering.
			//Crafty.trigger("moveID" + otherPlayer.id, otherPlayer);
			Crafty.trigger("networkMove", otherPlayer);
			}
		});

		//When a network player leaves, delete him or her.	
		players.on('child_removed', function(snapshot) {
			var otherPlayer = snapshot.val();
			if (otherPlayer.id !== playerID && otherPlayer.id !== undefined)
			{
			//console.log("child removed id: " + otherPlayer.id);
			Crafty("" + otherPlayer.id + "").each(function(i) {
				this.destroy();
			});
			}
		});
    });

    Crafty.scene("Title");
}
