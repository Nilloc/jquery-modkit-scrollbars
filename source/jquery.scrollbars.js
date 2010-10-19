/**
jQuery Scrollbars
v0.1

The MIT License

Copyright (c) 2010 Collin Reisdorf

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
		minOpacity:0,
		maxOpacity:0.5,
		activeClass:null,
		hoverClass:null,
		normalClass:null,
		downClass:null,
		autoHide:true,
		clickBehavior:"paging",
		draggableContent:false
	},
	_create: function() {
		// creation code for mywidget
		this.scrollbarWidth = this._getScrollbarWidth();
		
		this.element.css({overflow:'hidden'}); // this should not overwrite the existing, if it is fixed or absolute...
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
		
		this.scrollbarVertical.append(this.scrollHandleVertical);
		this.scrollbarHorizontal.append(this.scrollHandleHorizontal);
		
		this.element.append(this.scrollbarVertical).append(this.scrollbarHorizontal);
		
		this.scrollRect.data("scrollbars", this).scroll(this._moveScrollbar).bind('scrollStart', this._showScrollbars).bind('scrollStop', this._hideScrollbars);
		
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
/*------------------- Event Handlers ----------------------*/
	_showScrollbars: function(evt)
	{
		var $this = $(evt.target).data("scrollbars");
		$this.scrollbarVertical.stop().animate({opacity: $this.options.maxOpacity}, 50);
		$this.scrollbarHorizontal.stop().animate({opacity: $this.options.maxOpacity}, 50);
	},
	_hideScrollbars: function(evt)
	{
		// fixme: still a small edgecase where the handle will not trigger (drag the handle and move the moues off the scrollbar...)
		
		var $this = $(evt.target).data("scrollbars");
		if(!$this.scrollbarVertical.hasClass("mouseOn") && !$this.scrollHandleVertical.hasClass("mouseOn"))
		  $this.scrollbarVertical.stop().animate({opacity: $this.options.minOpacity}, 500);
		  
		if(!$this.scrollbarHorizontal.hasClass("mouseOn") && !$this.scrollHandleHorizontal.hasClass("mouseOn"))
		  $this.scrollbarHorizontal.stop().animate({opacity: $this.options.minOpacity}, 500);
	},
	_moveScrollbar: function(evt)
	{
		var $this = $(evt.target).data("scrollbars");
		// console.log(evt) evt.originalEvent.scrollHeight is cool...
		if(!!$this.scrollRatio){
			$this.scrollHandleVertical.css({top:($this.scrollRect.scrollTop()*$this.scrollRatio.top)+"px"});
			$this.scrollHandleHorizontal.css({left:($this.scrollRect.scrollLeft()*$this.scrollRatio.left)+"px"});
		}
	},
	_handleMouseOver: function(evt)
	{
		var $this = $(evt.target).addClass("mouseOn").data("scrollbars");
	  $this._showScrollbars(evt);
	},
	_handleMouseOut: function(evt)
	{
		var $this = $(evt.target).removeClass("mouseOn").data("scrollbars");
	  $this._hideScrollbars(evt);
	},
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
/*------------------- Public Functions ----------------------*/
	update: function()
	{
		this.scrollRatio = {top:this.element.innerHeight()/this.scrollContent.outerHeight(), 
												left:this.element.innerWidth()/this.scrollContent.outerWidth()};
		
		var scrollPadding = {top:parseInt(this.scrollbarVertical.css('margin-top')) + parseInt(this.scrollbarVertical.css('margin-bottom')),
												left:parseInt(this.scrollbarHorizontal.css('margin-left')) + parseInt(this.scrollbarHorizontal.css('margin-right'))}
		
		if((this.element.height()*this.scrollRatio.top) - scrollPadding.top < parseInt(this.scrollbarVertical.css("min-height")))
			this.scrollRatio.top = (this.element.innerHeight() + (this.element.height()*this.scrollRatio.top) - scrollPadding.top - parseInt(this.scrollbarVertical.css("min-height"))) / this.scrollContent.outerHeight();
			
		if((this.element.width()*this.scrollRatio.left) - scrollPadding.left < parseInt(this.scrollbarHorizontal.css("min-width")))
			this.scrollRatio.top = (this.element.innerWidth() + (this.element.width()*this.scrollRatio.left) - scrollPadding.left - parseInt(this.scrollbarHorizontal.css("min-width"))) / this.scrollContent.outerWidth();
		
		this.scrollbarVertical.height(this.element.innerHeight() - scrollPadding.top);
		this.scrollbarHorizontal.width(this.element.innerWidth() - scrollPadding.left);
		
		this.scrollHandleVertical.height((this.element.innerHeight()*this.scrollRatio.top) - scrollPadding.top);
		this.scrollHandleHorizontal.width((this.element.innerWidth()*this.scrollRatio.left) - scrollPadding.left);
		
		if(this.scrollRatio.top >= 1)
			this.scrollHandleVertical.css({display:"none"});
		else
			this.scrollHandleVertical.css({display:"block"});
		if(this.scrollRatio.left >= 1)
			this.scrollHandleHorizontal.css({display:"none"});
		else
			this.scrollHandleHorizontal.css({display:"block"});
			
		this.scrollRect.scroll(); // bad form I know...
	},
	destroy: function()
	{
			$.Widget.prototype.destroy.apply(this, arguments); // default destroy
			 // now do other stuff particular to this widget
			
			// $(window).unbind('mousemove'); // shouldn't need unbinding unless the widget is destroyed mid drag...
			
			// need to remove the wrapped divs from the target object... (unwrap)
			// this.element.unwrap()
	}
});