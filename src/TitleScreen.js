import ui.ImageView as ImageView;
import device;

exports = Class(ImageView, function(supr) {
  this.init = function(opts) {
    opts = merge(opts, {
      x: 0,
      y: 0,
      image: "resources/images/menu/title_screen.png"
    });

    supr(this, 'init', [opts]);

    var startButton = new ImageView({
      superview: this,
      x: device.width/4,
      y: device.height/4,
      width: device.width/2,
      height: device.height/2,
      image: "resources/images/menu/title_screen_start.png"
    });

    startButton.on('InputSelect', bind(this, function() {
      this.emit('TitleScreen:start');
    }));

  };
});
