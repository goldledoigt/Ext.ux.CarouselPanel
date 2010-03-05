/*
** Ext.ux.CarouselPanel.js for Ext.ux.CarouselPanel
**
** Made by goldledoigt
** Contact <goldledoigt@chewam.com>
**
** Started on  Mon Mar  1 10:47:29 2010 goldledoigt
** Last update Fri Mar  5 01:31:30 2010 
**
** DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
** Version 2, December 2004
**
** Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>
** Everyone is permitted to copy and distribute verbatim or modified
** copies of this license document, and changing it is allowed as long
** as the name is changed.
**
** DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
** TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
**
** 0. You just DO WHAT THE FUCK YOU WANT TO.
*/

Ext.ns("Ext.ux");

Ext.ux.CarouselPanel = Ext.extend(Ext.util.Observable, {

  /**
   * Size of each item in the carousel view
   */
  itemSize:{width:0, height:0}

  /**
   * List of items to loop on
   */
  ,items:[]

  /**
   * Left and right buttons to slide the carousel view
   */
  ,buttons:[]

  /**
   * If set to TRUE the view is never blocked.
   * It slides back to the first item after the last item when going to right direction
   * It slides forward to the last item after the first item when going to left direction
   */
  ,enableLoop:false

  /**
   * Init a repeated task to make move the carousel view automatically
   * The task is paused when the cursor is over carousel div
   * The task is stopped on any button click
   */
  ,enableSlideShow:false

  /**
   * Set a time (in ms) to defer the slideshow frist move
   */
  ,deferSlideShow:5000

  /**
   * Allow to display right and left buttons
   */
  ,enableButtons:true

  /**
   * Number of items to display together on each move
   */
  ,itemsPerView:1

  /**
   * The space between each item of the carousel view
   */
  ,itemSidesMargin:0

  /**
   * Hides items labels
   */
  ,hideLabels:false

  ,constructor:function(config) {
    Ext.apply(this, config);
    Ext.ux.CarouselPanel.superclass.constructor.apply(this, arguments);
    this.on({render:this.onRender});
  },

  render:function(el) {

    var buttonsWidth = (this.enableButtons) ? this.buttons[0].width + this.buttons[1].width : 0;

    this.el = Ext.DomHelper.append(el || Ext.getBody(), {
      id:"carousel-panel"
      ,tag:"div"
      ,style:"width:"+(buttonsWidth + this.itemSize.width * this.itemsPerView + (this.itemSidesMargin * this.itemsPerView * 2))+"px;"
	+ "overflow:hidden;"
	+ "margin:0 auto;"
    });

    this.carousel = new Ext.ux.Carousel({
      enableLoop:this.enableSlideShow || this.enableLoop
      ,items:this.items
      ,hideLabels:this.hideLabels
      ,itemsPerView:this.itemsPerView
      ,itemSize:this.itemSize
      ,itemSidesMargin:this.itemSidesMargin
    });

    this.carousel.render(this.el);

    if (this.enableButtons) {
      var tpl = new Ext.Template(
	'<div style="width:{width}px;height:'+this.itemSize.height+'px;'
	  + 'float:left;'
	  + 'background-position:0 50%;'
	  + 'cursor:pointer;'
	  + 'background-repeat:no-repeat;'
	  + 'background-image:url({image});">'
	  + '</div>'
      );
      this.leftButton = tpl.insertFirst(this.el, this.buttons[0]);
      this.rightButton = tpl.append(this.el, this.buttons[1]);
      this.setButtonsEvents();
    }

    Ext.DomHelper.append(this.el, {
      id:"carousel-clear",
      tag:"div",
      style:"clear:both;"
    });

    this.carousel.on({scope:this, move:this.onMove});

    this.fireEvent("render", this);
  }

  ,onRender:function() {
    if (this.enableSlideShow) {
      (function() {
	 this.loop = Ext.TaskMgr.start({
	   run:this.carousel.move
	   ,args:["right"]
	   ,scope:this.carousel
	   ,interval:this.enableSlideShow || 10000
	 });
       }).defer(this.deferSlideShow, this);
    }
  }

  ,buttonClick:function(e, el, options, direction) {
    if (false !== this.fireEvent("beforemove", this, direction)) {
      if (this.loop) {
	Ext.TaskMgr.stop(this.loop);
	this.loop = false;
      }
      this.carousel.move(direction);
    }
  }

  ,setButtonsEvents:function(direction) {
    if (!direction || direction == "left")
      Ext.fly(this.leftButton).on({
	click:this.buttonClick.createDelegate(this, ["left"], true)
      });
    if(!direction || direction == "right") {
      Ext.fly(this.rightButton).on({
	click:this.buttonClick.createDelegate(this, ["right"], true)
      });
    }
  }

  ,onMove:function(direction) {
    this.fireEvent("move", direction);
  }

});
