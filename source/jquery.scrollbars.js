/**
jQuery Scrollbars
@version  v0.1
@author   Collin Reisdorf

@license  The MIT License

Copyright (c) 2011 Modkit LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

$.widget("modkit.scrollbars", {
  // defaults basically make it work like a clickable and draggable version of the iphone scrollbar
  options: {
    active:null,
    hover:null,
    down:null,
    transitionSpeed:800,
    autoHide:true, // TODO: unused so far
    clickBehavior:"paging", // TODO: also not used yet
    draggableContent:false // TODO: not sure this will belong in here, anyway not implimented yet either.
  },
  _create: function()
  {
    // creation code for mywidget
    this.scrollbarWidth = this._getScrollbarWidth();
    this.element.addClass('scrollPane');
    this.element.css({overflow:'hidden'});
    
    // this should not overwrite the existing, if it is fixed or absolute...
    if(this.element.css("position") != "absolute" && this.element.css("position") != "fixed ") 
      this.element.css({position:"relative"});
    
    // more globally, we'll have to pass the css from the scrollable to the scrollContent at some point. or else not reparent.
    this.element.children().wrapAll('<div class="scrollContent"/>');
    this.scrollContent = this.element.children();
    this.element.children().wrapAll('<div class="scrollRect" style="overflow:scroll;"/>');
    this.scrollRect = this.element.children(); // should probably be smarter
    
    this.scrollRect.width(this.element.innerWidth()+this.scrollbarWidth).height(this.element.innerHeight()+this.scrollbarWidth);
    
    // this.scrollbar = {vertical:null, horizontal:null};
    // this.scrollHandle = {vertical:null, horizontal:null};
    this.vector={x:0,y:0};
    
    this.scrollbarVertical = $('<div class="scrollbar bar vertical"></div>'); // this could be shorter if i reverse the order and return the $(new html).append...
    this.scrollbarHorizontal = $('<div class="scrollbar bar horizontal"></div>');
    
    this.scrollHandleVertical = $('<div class="scrollbar handle vertical"></div>');
    this.scrollHandleHorizontal = $('<div class="scrollbar handle horizontal"></div>');
    
    // TODO: Impliment arrows here.
    
    this.scrollbarVertical.append(this.scrollHandleVertical);
    this.scrollbarHorizontal.append(this.scrollHandleHorizontal);
    
    this.element.append(this.scrollbarVertical).append(this.scrollbarHorizontal);
    
    this.scrollRect.data("scrollbars", this).scroll(this._moveScrollbar).bind('scrollStart', this._handleMouseOver).bind('scrollStop', this._handleMouseOut);
    this.element.data("scrollbars", this).scroll(this._unScroll);
    
    this.scrollbarVertical.data("scrollbars", this).mouseover(this._handleMouseOver).mouseout(this._handleMouseOut).mousedown(this._handleScrollbarMouseDownVertical);
    this.scrollbarHorizontal.data("scrollbars", this).mouseover(this._handleMouseOver).mouseout(this._handleMouseOut).mousedown(this._handleScrollbarMouseDownHorizontal);
    this.scrollHandleVertical.data("scrollbars", this).mouseover(this._handleMouseOver).mouseout(this._handleMouseOut).mousedown(this._handleScrollHandleMouseDownVertical);
    this.scrollHandleHorizontal.data("scrollbars", this).mouseover(this._handleMouseOver).mouseout(this._handleMouseOut).mousedown(this._handleScrollHandleMouseDownHorizontal);
    
    // jQuery.data(this.element, this); // don't think this can help...
    
    
    $(window).mouseup(function(){ // ends the mouse drag, works everywhere.
      $(this).unbind('mousemove');
    });
    
    this.update();
  },
  _getScrollbarWidth: function(){
    var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div id="scrollbarWidthTester" style="height:100px;float:none;display:block;"></div>'); 
    $('body').append(div); 
    var f = $('#scrollbarWidthTester').width();
    div.css('overflow', 'auto');
    var s = $('#scrollbarWidthTester').width();
    div.remove();
    return f-s;
  },
  
  _moveScrollbar: function(evt)
  {
    var $this = $(evt.target).data("scrollbars");
    // console.log(evt) evt.originalEvent.scrollHeight is cool...
    // console.log("moving scrollbar", $this.scrollRatio);
    if(!!$this.scrollRatio){
      $this.scrollHandleVertical.css({top:($this.scrollRect.scrollTop()*$this.scrollRatio.top)+"px"});
      $this.scrollHandleHorizontal.css({left:($this.scrollRect.scrollLeft()*$this.scrollRatio.left)+"px"});
    }
  },
  
  _transitionTo: function(evt, style)
  {
    var $this = $(evt.target).data("scrollbars");
    if(style !== undefined)
    {
      if(isNaN(style))
      {
        $this.scrollbarVertical.addClass(style, $this.options.transitionSpeed);
        $this.scrollbarHorizontal.addClass(style, $this.options.transitionSpeed);
      }else
      {
        $this.scrollbarVertical.stop().animate({opacity: style}, $this.options.transitionSpeed);
        $this.scrollbarHorizontal.stop().animate({opacity: style}, $this.options.transitionSpeed);
      }
    }
  },
  
  _transitionFrom: function(evt, style)
  {
    var $this = $(evt.target).data("scrollbars");
    
    trace("transitioning from", style);
    
    if(style !== undefined)
    {
      if(isNaN(style))
      {
        $this.scrollbarVertical.removeClass(style, $this.options.transitionSpeed);
        $this.scrollbarHorizontal.removeClass(style, $this.options.transitionSpeed);
      }else
      {
        // I haven't got an idea for how to undo an opacity change yet, but it'll come to me, maybe we should store starting opacity in transitionTo
        // $this.scrollbarVertical.stop().animate({opacity: style}, $this.options.transitionSpeed);
        // $this.scrollbarHorizontal.stop().animate({opacity: style}, $this.options.transitionSpeed);
        $this.scrollbarVertical.stop().css({opacity:'none'});
        $this.scrollbarHorizontal.stop().css({opacity:'none'});
      }
    }
  },
  
/*------------------- Event Handlers ----------------------*/
  _handleMouseOver: function(evt)
  {
    var $this = $(evt.target).data("scrollbars");
    $this._transitionTo(evt, $this.options.hover);
  },
  _handleMouseOut: function(evt)
  {
    var $this = $(evt.target).data("scrollbars");
    $this._transitionFrom(evt, $this.options.hover);
  },
  
  _handleMouseDown: function(evt)
  {
    var $this = $(evt.target).data("scrollbars");
    $this._transitionTo(evt, $this.options.down);
  },
  
  _handleScrollbarActive: function(evt)
  {
    var $this = $(evt.target).data("scrollbars");
    $this._transitionTo(evt, $this.options.active);
  },
  
  // TODO: Unify these two methods, check for horizontal or vertical based on the evt.currentTarget...
  _handleScrollHandleMouseDownVertical: function(evt)
  {
    var $this = $(evt.target).data("scrollbars");
    $this.vector.y = evt.pageY;

    $(window).mousemove(function(evt){
      $this.scrollRect.scrollTop($this.scrollRect.scrollTop()-(($this.vector.y-evt.pageY)/$this.scrollRatio.top));
      $this.vector.y = evt.pageY;
    });

    return false;
  },
  
  _handleScrollHandleMouseDownHorizontal: function(evt)
  {
    var $this = $(evt.target).data("scrollbars");
    $this.vector.x = evt.pageX;

    $(window).mousemove(function(evt){
      $this.scrollRect.scrollLeft($this.scrollRect.scrollLeft()-(($this.vector.x-evt.pageX)/$this.scrollRatio.left)); 
      $this.vector.x = evt.pageX;
    });

    return false;
  },
  
  // TODO: Normalize these too, since I can detect the ID of the clicked item.
  _handleScrollbarMouseDownVertical: function(evt)
  {
    console.log(evt);
    
    var $this = $(evt.target).data("scrollbars");
    var scrollAmt = $this.element.innerHeight();
    
    if(evt.pageY > $this.scrollHandleVertical.offset().top)
      $this.scrollRect.scrollTop( $this.scrollRect.scrollTop() + scrollAmt );
    else
      $this.scrollRect.scrollTop( $this.scrollRect.scrollTop() - scrollAmt );
    return false;
  },
  _handleScrollbarMouseDownHorizontal: function(evt)
  {
    var $this = $(evt.target).data("scrollbars");
    var scrollAmt = $this.element.innerWidth();

    if(evt.pageX > $this.scrollHandleHorizontal.offset().left)
      $this.scrollRect.scrollLeft( $this.scrollRect.scrollLeft() + scrollAmt );
    else
      $this.scrollRect.scrollLeft( $this.scrollRect.scrollLeft() - scrollAmt );
    return false;
  },
  _unScroll: function(evt)
  {
    // TODO: Find a more elegant solution for this issue, it's to keep users from selecting and then drag-scrolling the scroll element.
    $(evt.target).data("scrollbars").element.scrollLeft(0).scrollTop(0);
  },
/*------------------- Public Functions ----------------------*/
  update: function()
  {
    this.scrollRatio = {top:this.element.innerHeight()/this.scrollContent.outerHeight(), 
                        left:this.element.innerWidth()/this.scrollContent.outerWidth()};
    
    if(this.scrollRatio.top >= 1){
      this.scrollHandleVertical.css({display:"none"});
      this.scrollbarVertical.css({display:"none"});
      this.scrollbarHorizontal.addClass('noVertical');
    }
    else{
      this.scrollHandleVertical.css({display:"block"});
      this.scrollbarVertical.css({display:"block"});
      this.scrollbarHorizontal.removeClass('noVertical');
    }
    if(this.scrollRatio.left >= 1){
      this.scrollHandleHorizontal.css({display:"none"});
      this.scrollbarHorizontal.css({display:"none"});
      this.scrollbarVertical.addClass('noHorizontal');
    }
    else{
      this.scrollHandleHorizontal.css({display:"block"});
      this.scrollbarHorizontal.css({display:"block"});
      this.scrollbarVertical.removeClass('noHorizontal');
    }
    
    var scrollPadding = {top:parseInt(this.scrollbarVertical.css('margin-top'), 10) + parseInt(this.scrollbarVertical.css('margin-bottom'), 10),
                        left:parseInt(this.scrollbarHorizontal.css('margin-left'), 10) + parseInt(this.scrollbarHorizontal.css('margin-right'), 10)};
    
    if((this.element.height()*this.scrollRatio.top) - scrollPadding.top < parseInt(this.scrollbarVertical.css("min-height"), 10))
      this.scrollRatio.top = (this.element.innerHeight() + (this.element.height()*this.scrollRatio.top) - scrollPadding.top - parseInt(this.scrollbarVertical.css("min-height"), 10)) / this.scrollContent.outerHeight();
      
    if((this.element.width()*this.scrollRatio.left) - scrollPadding.left < parseInt(this.scrollbarHorizontal.css("min-width"), 10))
      this.scrollRatio.top = (this.element.innerWidth() + (this.element.width()*this.scrollRatio.left) - scrollPadding.left - parseInt(this.scrollbarHorizontal.css("min-width"), 10)) / this.scrollContent.outerWidth();
    
    this.scrollbarVertical.height(this.element.innerHeight() - scrollPadding.top);
    this.scrollbarHorizontal.width(this.element.innerWidth() - scrollPadding.left);
    
    this.scrollHandleVertical.height((this.element.innerHeight()*this.scrollRatio.top) - scrollPadding.top);
    this.scrollHandleHorizontal.width((this.element.innerWidth()*this.scrollRatio.left) - scrollPadding.left);
    
    
      
    this.scrollRect.scroll(); // bad form? ...
  },
  
  scrollTop: function(val)
  {
    this.scrollRect.scrollTop(val);
  },
  
  scrollLeft: function(val)
  {
    this.scrollRect.scrollLeft(val);
  },
  
  destroy: function()
  {
    this.element.addClass('scrollPane');
    
    $.Widget.prototype.destroy.apply(this, arguments); // default destroy
     // now do other stuff particular to this widget
    
    // $(window).unbind('mousemove'); // shouldn't need unbinding unless the widget is destroyed mid drag...
    
    // need to remove the wrapped divs from the target object... (unwrap)
    // this.element.unwrap();
  }
});