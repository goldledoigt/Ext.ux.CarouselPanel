/*
** Ext.ux.Carousel.js for Ext.ux.Carousel
**
** Made by goldledoigt
** Contact <goldledoigt@chewam.com>
**
** Started on  Mon Mar  1 10:46:08 2010
** Last update Mon Mar  1 17:11:46 2010 Gary van Woerkens
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
    Ext.ux.Carousel.superclass.constructor.apply(this, arguments);
  },

  render:function(el) {
    var carousel = Ext.DomHelper.append(el, {
      id:"carousel"
      ,tag:"div"
	,style:"width:"+(this.itemSize.width * this.itemsPerView + (this.itemSidesMargin * this.itemsPerView * 2))+"px;"
	+ "height:"+this.itemSize.height+"px;"
	+ "overflow:hidden;"
	+ "float:left;"
    });

    this.viewEl = Ext.DomHelper.append(carousel, {
      id:"carousel-view",
      tag:"div",
      style:"width:"+(this.itemSize.width * this.items.length + (this.itemSidesMargin * this.items.length * 2))+"px;"
	+ "height:"+this.itemSize.height+"px;"
	+ "position:relative;"
    });

    var tpl = new Ext.Template(
      '<div style="'
      + 'width:'+this.itemSize.width+'px;'
      + 'height:'+this.itemSize.height+'px;'
      + 'margin:0 '+this.itemSidesMargin+'px;'
      + 'float:left;'
      + 'background-image:url({image});'
      + 'background-position:center;'
      + 'background-repeat:no-repeat">'
      + '{html}'
      + '</div>'
    );

    for (var i = 0, l = this.items.length; i < l; i++) {
      tpl.append(this.viewEl, this.items[i]);
    }

    this.fireEvent("render", this);
  }

  ,move:function(direction) {
    var el = Ext.fly(this.viewEl);
    var xy = el.getXY();
    var dir = (direction == "left") ? 1 : -1;
    var itemSidesMargin = this.itemsPerView * this.itemSidesMargin * 2;
    var dist = xy[0] + ((itemSidesMargin + this.itemSize.width * this.itemsPerView) * dir);
    if (!this.startPos) this.startPos = xy[0];
    if (!this.stopPos)
      this.stopPos = this.startPos - (itemSidesMargin + this.itemSize.width * (this.items.length - 1));
    if (this.enableLoop) {
      if (dist > this.startPos) dist = this.stopPos;
      else if (dist < this.stopPos) dist = this.startPos;
    }
    if (dist <= this.startPos && dist >= this.stopPos)
      Ext.fly(this.viewEl).moveTo(dist, xy[1], {
	duration:1
	,easing:"easeIn"
	,scope:this
	,direction:direction
	,callback:this.moveCallback
      });
  }

  ,moveCallback:function(el, options) {
    this.fireEvent("move", this, options.direction);
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

  ,constructor:function(config) {
    Ext.apply(this, config);
    Ext.ux.CarouselPanel.superclass.constructor.apply(this, arguments);
  },

  render:function(el) {
    this.el = Ext.DomHelper.append(el || Ext.getBody(), {
      id:"carousel-panel",
      tag:"div",
      style:"height:"+this.itemSize.height+"px;overflow:hidden;"
    });

    var tpl = new Ext.Template(
      '<div style="width:70px;height:'+this.itemSize.height+'px;'
	+ 'float:left;'
	+ 'background-position:0 50%;'
	+ 'cursor:pointer;'
	+ 'background-repeat:no-repeat;'
	+ 'background-image:url({image});">'
	+ '</div>'
    );

    this.leftButton = tpl.append(this.el, this.buttons[0]);
    this.carousel = new Ext.ux.Carousel({
      enableLoop:this.enableLoop
      ,items:this.items
      ,itemsPerView:this.itemsPerView
      ,itemSize:this.itemSize
      ,itemSidesMargin:this.itemSidesMargin
    });
    this.carousel.render(this.el);
    this.rightButton = tpl.append(this.el, this.buttons[1]);

    Ext.DomHelper.append(this.el, {
      id:"carousel-clear",
      tag:"div",
      style:"clear:both;"
    });

    this.setButtonsEvents();

    this.carousel.on({scope:this, move:this.onMove});

    this.fireEvent("render", this);
  }

  ,buttonClick:function(e, el, options, direction) {
    if (false !== this.fireEvent("beforemove", this, direction)) {
      this.carousel.move(direction);
    }
  }

  ,setButtonsEvents:function() {
    Ext.fly(this.leftButton).on(
      "click"
      ,this.buttonClick.createDelegate(this, ["left"], true)
      ,this
      ,{single:true}
    );
    Ext.fly(this.rightButton).on(
      "click"
      ,this.buttonClick.createDelegate(this, ["right"], true)
      ,this
      ,{single:true}
    );
  }

  ,onMove:function(direction) {
    this.setButtonsEvents();
    this.fireEvent("move", direction);
  }
});
