/*
** Ext.ux.Carousel.js for Ext.ux.Carousel
**
** Made by goldledoigt
** Contact <goldledoigt@chewam.com>
**
** Started on  Mon Mar  1 10:46:08 2010
** Last update Mon Mar  1 15:21:45 2010 
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
    Ext.apply(this, config);
    Ext.ux.Carousel.superclass.constructor.apply(this, arguments);
  },

  render:function(el) {
    var carousel = Ext.DomHelper.append(el, {
      id:"carousel",
      tag:"div",
      style:"width:"+this.itemSize.width+";height:"+this.itemSize.height+";overflow:hidden;float:left;"
    });

    var tpl = new Ext.Template(
      '<div style="width:'+this.itemSize.width+';height:'+this.itemSize.height+';float:left;background-image:url({image});">'
      + '{html}'
      + '</div>'
    );

    this.viewEl = Ext.DomHelper.append(carousel, {
      id:"carousel-view",
      tag:"div",
      style:"width:"+(this.itemSize.width * this.items.length)+";height:"+this.itemSize.height+";position:relative;"
    });

    for (var i = 0, l = this.items.length; i < l; i++) {
      tpl.append(this.viewEl, this.items[i]);
    }

    this.fireEvent("render", this);
  }

  ,move:function(direction) {
    this.isMoving = true;
    var el = Ext.fly(this.viewEl);
    var x = el.getXY()[0];
    var dir = (direction == "left") ? 1 : -1;
    var dist = x + (this.itemSize.width * dir);
    if (!this.startPos) this.startPos = x;
    if (!this.stopPos)
      this.stopPos = this.startPos - (this.itemSize.width * (this.items.length - 1));
    if (this.enableLoop) {
      if (dist > this.startPos) dist = this.stopPos;
      else if (dist < this.stopPos) dist = this.startPos;
    }
    if (dist <= this.startPos && dist >= this.stopPos)
      Ext.fly(this.viewEl).moveTo(dist, 0, {
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

  itemSize:{width:400, height:200}
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
      style:"width:540;height:"+this.itemSize.height+";overflow:hidden;"
    });

    var tpl = new Ext.Template(
      '<div style="width:70;height:'+this.itemSize.height+';float:left;background-position:0 50%;cursor:pointer;background-repeat:no-repeat;background-image:url({image});"></div>'
    );

    this.leftButton = tpl.append(this.el, this.buttons[0]);
    this.carousel = new Ext.ux.Carousel({
      enableLoop:this.enableLoop
      ,items:this.items
      ,itemSize:this.itemSize
    });
    this.carousel.render(this.el);
    this.rightButton = tpl.append(this.el, this.buttons[1]);

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
