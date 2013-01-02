// Intro module
define([
  // Application.
  "app",

  // Modules
  "modules/Video"
],

// Map dependencies from above array.
function(app, Video) {

  // Create a new module.
  var Intro = app.module();
  
  Intro.init = function() {
    
    // video info for this module
    var video_model = new Video.Model({
      name: 'Intro',
      sources: ['medias/videos/intro.mp4'],
      dimensions: { width: '100%', height: '100%' },
      //sources: ['http://player.vimeo.com/video/56203539'],
      //dimensions: { width: '1280px', height: '720px' }
      autoplay: false,
    }),
    // video view
    video_view = new Video.Views.Main({ model: video_model }),
    // actual main view for this module
    intro_view = new Intro.Views.Main({ video_view: video_view});

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

      vv.allowPlayPause();

      // this block of code is designed to work on the iPad
      // we need to wait until we have video dimensions before being able to properly show the overlay
      // TODO this needs to go into the Video view
      var show_overlay = function() {
        //console.log('progress');
        vv.showOverlay('Pour commencer appuyez sur la barre espace ou cliquez/touchez l\'écran');
        vp.off('progress', show_overlay);
      };
      vp.on('progress', show_overlay);

     
      vv.popcorn.on('ended', function() {

          this.destroy();

           // go to TTB at the end of the intro
          app.trigger('goto', 'ttb/play/10');

      });

      this.vv.popcorn.on('play', function() {

        // hide welcome screen on first play
        if(this.currentTime() == 0) {
          vv.hideOverlay();  
        }

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
