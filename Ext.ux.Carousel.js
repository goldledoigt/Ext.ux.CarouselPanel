/*
** Ext.ux.Carousel.js for Ext.ux.CarouselPanel
**
** Made by goldledoigt
** Contact <goldledoigt@chewam.com>
**
** Started on  Mon Mar  1 10:46:08 2010 goldledoigt
** Last update Fri Mar  5 01:43:29 2010 
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
	+ "position:relative;"
    });

    Ext.fly(this.el).on({
      mouseover:this.togglePause.createDelegate(this, [true])
      ,mouseout:this.togglePause.createDelegate(this, [false])
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
      + 'display:'+ (this.hideLabels ? "none" : "block") +';'
      + 'text-align:center;'
      + 'filter:alpha(opacity=50);'
      + '-moz-opacity:0.5;'
      + '-khtml-opacity: 0.5;'
      + 'opacity: 0.5;'
      + 'color:#FFFFFF;'
      + 'background-color:#000000;'
      + 'position:absolute;'
      + 'top:'+(this.itemSize.height - 20)+'px;'
      + 'height:20px;'
      + 'width:'+this.itemSize.width+'px;'
      + '">{html}</div>'
      + '<div style="'
      + 'height:'+this.itemSize.height+'px;'
      + 'background-image:url({image});'
      + 'background-position:center;'
      + 'background-repeat:no-repeat;">'
      + '</div>'
      + '</div>'
    );

    for (var i = 0, l = this.items.length; i < l; i++) {
      tpl.append(this.viewEl, this.items[i]);
    }

    this.fireEvent("render", this);
  }

  ,togglePause:function(action) {
    this.isPaused = action || false;
  }

  ,move:function(direction) {
    if (this.isPaused) return true;
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
    return true;
  }

  ,moveCallback:function(el, options) {
    this.fireEvent("move", options.direction);
  }

});
