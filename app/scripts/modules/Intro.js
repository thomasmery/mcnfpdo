// Intro module
define([
  // Application.
  "app",

  // Modules
  "modules/Video",
  "modules/Soundtrack"
],

// Map dependencies from above array.
function(app, Video, Soundtrack) {

  // Create a new module.
  var Intro = app.module();
  
  Intro.init = function() {

    ////////////////
    // Soundtrack //
    ////////////////
    var soundtrack_model = app.sounds.find(function(model) { return model.get('name') == "Intro Soundtrack" });
    Intro.soundtrack = new Soundtrack.View({ 
      model: soundtrack_model
    });

    Intro.soundtrack.popcorn.loop(false);
    
    // video info for this module
    var video_model = new Video.Model({
      name: 'Intro',
      sources: ['medias/videos/intro.mp4'],
      dimensions: { width: '100%', height: '100%' },
      //sources: ['http://player.vimeo.com/video/56203539'],
      //dimensions: { width: '1280px', height: '720px' }
      autoplay: false,
      enablePlayPause: true
    }),
    // video view
    video_view = new Video.Views.Main({ model: video_model }),
    // actual main view for this module
    intro_view = new Intro.Views.Main({ video_view: video_view });

    // when PLAYING the video ...
    video_view.popcorn.on('play', function() {
      // do not play unless paused AND we have passed th epoit where we actually want the soundtrack to play
      if(Intro.soundtrack.popcorn.paused() && video_view.popcorn.currentTime() > Intro.soundtrack.model.get('start'))
        Intro.soundtrack.play(Intro.soundtrack.popcorn.currentTime(), 500);
    })

    // when PAUSING the video ...
    video_view.popcorn.on('pause', function() {


      if(!Intro.soundtrack.popcorn.paused() && video_view.popcorn.currentTime() > Intro.soundtrack.model.get('start'))
        Intro.soundtrack.pause(500);

    })

  };

  // Default View.
  Intro.Views.Main = Backbone.LayoutView.extend({

    initialize: function() {

      if(!this.options.video_view) {
        throw "Intro requires a video view";
      }
      else {
        // shortcut to video view
        var vv = this.vv = this.options.video_view;
      }

      this.$el.css({ width: "100%", height: "100%"});

      // append video view to Intro view
      this.$el.append(vv.$el);

      // add Intro view to the dom
      $('#main-container').empty().append(this.el);

      // init video
      vv.init();

      this.initBehaviors();

    },

    initBehaviors: function() {

      var _this = this
      ,   vv = this.vv
      ,   vp = vv.popcorn;
      
      vv.showOverlay(
        '<p><strong>Mon corps ne fait pas d\'ombre</strong></p>'
        + '<p>appuyez sur la barre espace<br />ou cliquez dans l\'écran</p>'
      );

      // PLAY
      vp.on('play', function() {

        // hide welcome screen on first play
        if(this.currentTime() == 0) {
          vv.hideOverlay();  
        }

      });

      // start Soundtrack
      vp.code({
        start: Intro.soundtrack.model.get('start'),
        onStart: function( options ) {
          console.log('PLAY SOUNDTRACK');
          Intro.soundtrack.play(Intro.soundtrack.model.get('offset'), Intro.soundtrack.model.get('fade_in_duration')*1000);
        }
      });

      // fadeout Soundtrack
      vp.code({
        start: Intro.soundtrack.model.get('end'),
        onStart: function( options ) {
          console.log('PAUSE SOUNDTRACK');
          Intro.soundtrack.pause(Intro.soundtrack.model.get('fade_out_duration')*1000);
        }
      });


     
      // END     
      vp.on('ended', function() {

          // remove Video View
          vv.remove();  

          // go to TTB at the end of the intro
          app.trigger('goto', 'TTB/pause');

      });

    }

  });

  // Default Model.
  Intro.Model = Backbone.Model.extend({
  
  });

  // Default Collection.
  Intro.Collection = Backbone.Collection.extend({
    model: Intro.Model
  });


  // Return the module for AMD compliance.
  return Intro;

});
