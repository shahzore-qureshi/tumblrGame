//Custom class files
import src.TitleScreen as TitleScreen;
import src.GameScreen as GameScreen;

//SDK files
import ui.StackView as StackView;
import device;

exports = Class(GC.Application, function () {
    
	/* Run after the engine is created and the scene graph is in
	 * place, but before the resources have been loaded.
	 */
	this.initUI = function () {
        var titleScreen = new TitleScreen(),
            gameScreen = new GameScreen();

        this.view.style.backgroundColor = '#000000';

        //Add a new StackView to the root of the scene graph
        var rootView = new StackView({
            superview: this,
            x: 0,
            y: 0,
            width: device.width,
            height: device.height,
            clip: true,
            backgroundColor: '#222222'
        });

        rootView.push(titleScreen);

        /* Listen for an event dispatched by the title
         * screen when the start button is pressed.
         * Hide the title screen, show the game screen,
         * then dispatch event to game screen to start.
         */
        titleScreen.on('TitleScreen:start', function () {
            console.log("I've been clicked.");
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