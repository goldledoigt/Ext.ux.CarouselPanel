/*
** Ext.ux.Carousel.js for Ext.ux.Carousel
**
** Made by goldledoigt
** Contact <goldledoigt@chewam.com>
**
** Started on  Mon Mar  1 10:46:08 2010 goldledoigt
** Last update Tue Mar  2 01:08:33 2010 
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

Ext.ns('Ext.ux');

Ext.ux.Carousel = Ext.extend(Ext.util.Observable, {

  constructor:function(config) {
    Ext.apply(this, config || {});
    this.totalViews = Math.floor((this.items.length - 1) / this.itemsPerView);
    Ext.ux.Carousel.superclass.constructor.apply(this, arguments);
  },

  render:function(el) {

    this.el = Ext.DomHelper.append(el, {
      id:"carousel"
      ,tag:"div"
      ,style:"width:"+(this.itemSize.width * this.itemsPerView + (this.itemSidesMargin * this.itemsPerView * 2))+"px;"
	+ "height:"+this.itemSize.height+"px;"
	+ "overflow:hidden;"
	+ "float:left;"
    });

    this.viewEl = Ext.DomHelper.append(this.el, {
      id:"carousel-view",
      tag:"div",
      style:"width:"+(this.itemSize.width * this.items.length + (this.itemSidesMargin * this.items.length * 2))+"px;"
	+ "height:"+this.itemSize.height+"px;"
	+ "position:relative;"
    });

    var tpl = new Ext.Template(
      '<div style="'
      + 'width:'+this.itemSize.width+'px;'
      + 'margin:0 '+this.itemSidesMargin+'px;'
      + 'float:left;">'
      + '<div style="'
      + 'height:'+(this.itemSize.height - 20)+'px;'
      + 'background-image:url({image});'
      + 'background-position:center;'
      + 'background-repeat:no-repeat;">'
      + '</div>'
      + '<div style="text-align:center;">{html}</div>'
      + '</div>'
    );

    for (var i = 0, l = this.items.length; i < l; i++) {
      tpl.append(this.viewEl, this.items[i]);
    }

    this.fireEvent("render", this);
  }

  ,move:function(direction) {
    var xy = Ext.fly(this.el).getXY();
    if (!this.viewIndex) this.viewIndex = 0;
    if (direction == "right") {
      if (this.viewIndex == this.totalViews) {
	if (this.enableLoop || this.enableSlideShow) this.viewIndex = 0;
      } else this.viewIndex++;
    } else if (direction == "left") {
      if (this.viewIndex == 0) {
	if (this.enableLoop || this.enableSlideShow) this.viewIndex = this.totalViews;
      } else this.viewIndex--;
    }
    var viewSize = this.itemSize.width * this.itemsPerView * this.viewIndex;
    var viewMargin = this.itemSidesMargin * this.itemsPerView * 2 * this.viewIndex;
    var pos = xy[0] - viewSize - viewMargin;
    Ext.fly(this.viewEl).moveTo(pos, xy[1], {
      duration:1
      ,easing:"easeIn"
      ,scope:this
      ,direction:direction
      ,callback:this.moveCallback
    });
  }

  ,moveCallback:function(el, options) {
    this.fireEvent("move", options.direction);
  }

});

/*****************************************************************************/
/*****************************************************************************/
/*****************************************************************************/

Ext.ux.CarouselPanel = Ext.extend(Ext.util.Observable, {

  itemSize:{width:0, height:0}
  ,items:[]
  ,buttons:[]
  ,enableLoop:false
  ,enableSlideShow:false
  ,deferSlideShow:5000
  ,enableButtons:true
  ,itemsPerView:1
  ,itemSidesMargin:0

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
      this.loop = Ext.TaskMgr.start.defer(this.deferSlideShow, this, [{
	run:this.carousel.move
	,args:["right"]
	,scope:this.carousel
	,interval:this.enableSlideShow || 10000
      }]);
    }
  }

  ,onResize:function(e, el, options) {
    console.log("resize", e, el, options);
  }

  ,buttonClick:function(e, el, options, direction) {
    if (false !== this.fireEvent("beforemove", this, direction)) {
      this.carousel.move(direction);
    }
  }

  ,setButtonsEvents:function(direction) {
    if (!direction || direction == "left")
      Ext.fly(this.leftButton).on(
	"click"
	,this.buttonClick.createDelegate(this, ["left"], true)
	,this
	,{single:true}
      );
    if(!direction || direction == "right")
      Ext.fly(this.rightButton).on(
	"click"
	,this.buttonClick.createDelegate(this, ["right"], true)
	,this
	,{single:true}
      );
  }

  ,onMove:function(direction) {
    if (this.enableButtons) this.setButtonsEvents(direction);
    this.fireEvent("move", direction);
  }

});
