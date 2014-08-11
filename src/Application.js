//Custom class files
import src.TitleScreen as TitleScreen;
import src.GameScreen as GameScreen;
import src.platformer.util as util;

//SDK files
import ui.StackView as StackView;
import device;

exports = Class(GC.Application, function () {
    
	/* Run after the engine is created and the scene graph is in
	 * place, but before the resources have been loaded.
	 */
	this.initUI = function () {
	
		// Scale the root view to 1024x576, which will fit on
		// most phones. If we didn't do this, we'd have to scale
		// each view differently for different device dimensions.
		// This letterboxes the game, if necessary.
		util.scaleRootView(this, 1024, 576);

        this.view.style.backgroundColor = '#000000';

        //Add a new StackView to the root of the scene graph
        var rootView = new StackView({
            superview: this.view,
            x: 0,
            y: 0,
            width: this.view.style.width,
            height: this.view.style.height,
            clip: true,
            backgroundColor: '#222222'
        });
		
		var titleScreen = new TitleScreen(),
            gameScreen = new GameScreen(rootView);

        //rootView.push(titleScreen);
		rootView.push(gameScreen);
		
        /* Listen for an event dispatched by the title
         * screen when the start button is pressed.
         * Hide the title screen, show the game screen,
         * then dispatch event to game screen to start.
         */
        titleScreen.on('TitleScreen:start', function () {
			rootView.push(gameScreen);
			gameScreen.emit('GameScreen:start');
        });

        /* When the game screen has signalled that
         * the game is over, show the title screen
         * so that the user may play the game again.
         */
        gameScreen.on('GameScreen:end', function () {
            rootView.pop();
        });

    };

    this.launchUI = function () {};

});