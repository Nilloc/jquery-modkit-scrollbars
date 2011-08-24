/**
jQuery Scrollbars
@version  v0.1
@author   Collin Reisdorf, Edward Baafi

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

(function(){
  
  var methods = {
    init: function(options){
      
      var settings = {
        active:0.25,
        hover:0.75,
        down:1,
        transitionSpeed:800,
        autoHide:true, // TODO: unused so far
        autoUpdate:false, // Adds a listner for $(window).resize, to adjust the size of the scrollbars
        updateInterval:0, // if this is set higher then 0 it will continuously update the scrollbars so "update" doesn't need to be manually called
        fillWidth:false,
        clickBehavior:"paging", // TODO: also not used yet
        draggableContent:false // TODO: not sure this will belong in here, anyway not implimented yet either.
      };
      
      return this.each(function() {        
        // If options exist, lets merge them
        // with our default settings
        if ( options ) { 
          $.extend( settings, options );
        }
        
        // Tooltip plugin code here
        
      
        var $this = $(this),
            data = $this.data('scrollbar'),
            $scrollPane = $this.addClass('scrollPane');
            
        $this.options = settings;
        
        if (! data) {
          
          // // creation code for mywidget
          $this.scrollbarWidth = methods._getScrollbarWidth(); //$.fn.scrollbars('_getScrollbarWidth');
          
          // FIXME: Use css object that can be easily extended to include new properties when needed (height, width, etc)
          $this.csses = {
            'padding-top':$this.css('padding-top'), 
            'padding-right':$this.css('padding-right'), 
            'padding-bottom':$this.css('padding-bottom'), 
            'padding-left':$this.css('padding-left'),
            
            //float overrides to left to fix width of scolled content, should also apply a clearfix actually...
            'float':'left'
          };
          $scrollPane.css({overflow:'hidden', padding:0}); // TODO: padding will be different if scrollbars have background (or something else will have to change height, maybe margin)
          
          // this should not overwrite the existing, if it is fixed or absolute...
          if($this.css("position") != "absolute" && $this.css("position") != "fixed ") 
            $scrollPane.css({position:"relative"});
          
          // more globally, we'll have to pass the css from the scrollable to the scrollContent at some point. or else not reparent.
          $this.scrollContent = $this.children().wrapAll('<div class="scrollContent"/>').parent();
                    
          // passes the padding into the new scrollContent (since we want that to be maintained, but scrolled (I think))
          $this.scrollContent.css($this.csses);
          
          // add the scrollRect (this is what actually has scrollbars)
          $this.scrollRect = $this.children().wrapAll('<div class="scrollRect" style="overflow:scroll;"/>').parent();
          
          // TODO: see if this makes sense everywhere...
          
          // FIXME: This needs to be differen when the styles object is added
          // if(settings.fillWidth && !($this.csses['padding-left'] != '0px' || $this.csses['padding-right'] != '0px'))
          //   this.scrollContent.css({'min-width':'100%'});
          
          
          // this.scrollbar = {vertical:null, horizontal:null};
          // this.scrollHandle = {vertical:null, horizontal:null};
          $this.vector={x:0,y:0};
          
          $this.scrollbarVertical = $('<div class="scrollbar bar vertical"></div>'); // this could be shorter if i reverse the order and return the $(new html).append...
          $this.scrollbarHorizontal = $('<div class="scrollbar bar horizontal"></div>');
          
          $this.scrollHandleVertical = $('<div class="scrollbar handle vertical"></div>');
          $this.scrollHandleHorizontal = $('<div class="scrollbar handle horizontal"></div>');
          
          // TODO: Impliment arrows here.
          
          $this.scrollbarVertical._append($this.scrollHandleVertical);
          $this.scrollbarHorizontal._append($this.scrollHandleHorizontal);
          
          $this._append($this.scrollbarVertical)._append($this.scrollbarHorizontal);
          
          $this.scrollRect.data("scrollbars", $this).scroll(methods._moveScrollbar).bind('scrollStart.scrollbars', methods._handleMouseOver).bind('scrollStop', methods._handleMouseOut );
          $this.data("scrollbars", $this).scroll(methods._unScroll); // this might be causing some errors, added at the last minute
          
          $this.scrollbarVertical.data("scrollbars", $this).mouseover(methods._handleMouseOver).mouseout(methods._handleMouseOut).mousedown(methods._handleScrollbarMouseDownVertical);
          $this.scrollbarHorizontal.data("scrollbars", $this).mouseover(methods._handleMouseOver).mouseout(methods._handleMouseOut).mousedown(methods._handleScrollbarMouseDownHorizontal);
          $this.scrollHandleVertical.data("scrollbars", $this).mouseover(methods._handleMouseOver).mouseout(methods._handleMouseOut).mousedown(methods._handleScrollHandleMouseDownVertical);
          $this.scrollHandleHorizontal.data("scrollbars", $this).mouseover(methods._handleMouseOver).mouseout(methods._handleMouseOut).mousedown(methods._handleScrollHandleMouseDownHorizontal);
          
          // jQuery.data($this, this); // don't think this can help...
          
          
          var elem = this;
          
          if(settings.autoUpdate)
          {
            // console.log("is it autoupdating in the first place?", $this.data('scrollbars'));
            $(window).resize(function(){
              elem.update();
            });
          }
          $(window).mouseup(function(){ // ends the mouse drag, works everywhere.
            $(this).unbind('mousemove');
          });
          
          if(settings.updateInterval > 0)
          {
            if(settings.updateInterval < 200) settings.updateInterval = 200; // keeps the user from setting a value that will kill the browser.
            this.updateInterval = setInterval($.proxy(this.update, this), settings.updateInterval);
            // return false; 
          }
          
        
          // $(this).data('scrollbar', {
          //             target : $this,
          //             // scrollPane : $scrollPane // a bit redunda
          //           });
          
          $this.data('scrollbar', $this);
        //   
        }
        
        // console.log($this.data('scrollbar'))
        
        console.log('already created, updating now')
        
        methods.update($this);

      }); // end of return each...
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

    _moveScrollbar: function(evt){
      console.log(this)
      var $this = $(evt.target).data("scrollbars");
      // console.log(evt) evt.originalEvent.scrollHeight is cool...
      // console.log("moving scrollbar", $this.scrollRatio);
      if($this && $this.scrollRatio){
        $this.scrollHandleVertical.css({top:Math.round($this.scrollRect.scrollTop()*$this.scrollRatio.top)+"px"});
        $this.scrollHandleHorizontal.css({left:Math.round($this.scrollRect.scrollLeft()*$this.scrollRatio.left)+"px"});
      }
    },

    _transitionTo: function(evt, style){
      var $this = $(evt.target).data("scrollbars");

      // trace("transitioning to:", style);

      if(style !== undefined)
      {
        if(isNaN(style))
        {
          $this.scrollbarVertical.addClass(style); //, $this.options.transitionSpeed);
          $this.scrollbarHorizontal.addClass(style); //, $this.options.transitionSpeed);
        }else
        {
          $this.scrollbarVertical.stop().animate({opacity: style}, $this.options.transitionSpeed);
          $this.scrollbarHorizontal.stop().animate({opacity: style}, $this.options.transitionSpeed);
        }
      }
    },

    _transitionFrom: function(evt, style){
      var $this = $(evt.target).data("scrollbars");

      // trace("transitioning from", style);

      if(style !== undefined)
      {
        if(isNaN(style))
        {
          $this.scrollbarVertical.removeClass(style);//, $this.options.transitionSpeed);
          $this.scrollbarHorizontal.removeClass(style);//, $this.options.transitionSpeed);
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
    _handleMouseOver: function(evt){
      var $this = $(evt.target).data("scrollbars");
      methods._transitionTo(evt, $this.options.hover);
      return false;
    },
    _handleMouseOut: function(evt){
      try{
        var $this = $(evt.target).data("scrollbars");
        methods._transitionFrom(evt, $this.options.hover);
      }
      catch(err){
        trace(err, evt.target);
      }
      return false;
    },

    _handleMouseDown: function(evt){
      var $this = $(evt.target).data("scrollbars");
      $this._transitionTo(evt, $this.options.down);
    },

    _handleScrollbarActive: function(evt){
      var $this = $(evt.target).data("scrollbars");
      $this._transitionTo(evt, $this.options.active);
    },

    // TODO: Unify these two methods, check for horizontal or vertical based on the evt.currentTarget...
    _handleScrollHandleMouseDownVertical: function(evt){
      var $this = $(evt.target).data("scrollbars");
      $this.vector.y = evt.pageY;

      $(window).mousemove(function(evt){
        $this.scrollRect.scrollTop($this.scrollRect.scrollTop()-(($this.vector.y-evt.pageY)/$this.scrollRatio.top));
        $this.vector.y = evt.pageY;
      });

      return false;
    },

    _handleScrollHandleMouseDownHorizontal: function(evt){
      var $this = $(evt.target).data("scrollbars");
      $this.vector.x = evt.pageX;

      $(window).mousemove(function(evt){
        $this.scrollRect.scrollLeft($this.scrollRect.scrollLeft()-(($this.vector.x-evt.pageX)/$this.scrollRatio.left)); 
        $this.vector.x = evt.pageX;
      });

      return false;
    },

    // TODO: Normalize these too, since I can detect the ID of the clicked item.
    _handleScrollbarMouseDownVertical: function(evt){
      // console.log(evt);

      var $this = $(evt.target).data("scrollbars");
      var scrollAmt = $this.innerHeight();

      if(evt.pageY > $this.scrollHandleVertical.offset().top)
        $this.scrollRect.scrollTop( $this.scrollRect.scrollTop() + scrollAmt );
      else
        $this.scrollRect.scrollTop( $this.scrollRect.scrollTop() - scrollAmt );
      return false;
    },
    _handleScrollbarMouseDownHorizontal: function(evt){
      var $this = $(evt.target).data("scrollbars");
      var scrollAmt = $this.innerWidth();

      if(evt.pageX > $this.scrollHandleHorizontal.offset().left)
        $this.scrollRect.scrollLeft( $this.scrollRect.scrollLeft() + scrollAmt );
      else
        $this.scrollRect.scrollLeft( $this.scrollRect.scrollLeft() - scrollAmt );
      return false;
    },
    _unScroll: function(evt){
      // TODO: Find a more elegant solution for this issue, it's to keep users from selecting and then drag-scrolling the scroll element
      try{
        $(evt.target).data("scrollbars").scrollLeft(0).scrollTop(0);
      }
      catch(err){
        trace(err, evt.target);
      } // FIXME: Bletcherous Hack because I'm not sure 

      // return false;
    },

  /*------------------- Getters/Setters ----------------------*/
    getScrollbarWidth: function(){
      return this.scrollbarWidth;
    },

    height: function(val, time){
      this.resize(val, null, time);
    },

    width: function(val, time){
      this.resize(null, val, time);
    },

    scrollTop: function(val, time){
      this.scrollRect.stop().animate({scrollTop:val}, time);
    },

    scrollLeft: function(val, time){
      this.scrollRect.stop().animate({scrollLeft:val}, time);
    },

    setOverflow: function(type){
      switch(type)
      {
        case "visible":
          // set the relative position of the scrollContent to the current scrollTop;
          break;
        default:
          // set the scrollTop to the current relative postion with the new ratio.
          break;
      }
    },
  /*------------------- Public Functions ----------------------*/
    update: function updt($target){
      console.log($target);
      
      if(! $target)
        $target = $(this)
      
      // FIXME: I think that $target will be the arguments object when it's called from outside!!!
      
      // console.log(arguments.callee.caller)
      trace("updating", $target.scrollRect, $target.attr('id')); //, this.element.attr("id"));

      $target.scrollRect.width($target.innerWidth()+$target.scrollbarWidth).height($target.innerHeight()+$target.scrollbarWidth);
      
      // console.log("height of children: ", this.scrollContent.children().height())
      
      // this.scrollContent.css({width: this.scrollContent.children().width(), height:this.scrollContent.children().height()})
      
      $target.scrollRatio = {top:$target.innerHeight()/$target.scrollContent.outerHeight(), 
                          left:$target.innerWidth()/$target.scrollContent.outerWidth()};
      
      if($target.scrollRatio.top >= 1){
        $target.scrollHandleVertical.css({display:"none"});
        $target.scrollbarVertical.css({display:"none"});
        $target.scrollbarHorizontal.addClass('noVertical');
      }
      else{
        $target.scrollHandleVertical.css({display:"block"});
        $target.scrollbarVertical.css({display:"block"});
        $target.scrollbarHorizontal.removeClass('noVertical');
      }
      if($target.scrollRatio.left >= 1){
        $target.scrollHandleHorizontal.css({display:"none"});
        $target.scrollbarHorizontal.css({display:"none"});
        $target.scrollbarVertical.addClass('noHorizontal');
      }
      else{
        $target.scrollHandleHorizontal.css({display:"block"});
        $target.scrollbarHorizontal.css({display:"block"});
        $target.scrollbarVertical.removeClass('noHorizontal');
      }
      
      var scrollPadding = {top:parseInt($target.scrollbarVertical.css('margin-top'), 10) + parseInt($target.scrollbarVertical.css('margin-bottom'), 10),
                          left:parseInt($target.scrollbarHorizontal.css('margin-left'), 10) + parseInt($target.scrollbarHorizontal.css('margin-right'), 10)};
      
      if(($target.height()*$target.scrollRatio.top) - scrollPadding.top < parseInt($target.scrollbarVertical.css("min-height"), 10))
        $target.scrollRatio.top = ($target.innerHeight() + ($target.height()*$target.scrollRatio.top) - scrollPadding.top - parseInt($target.scrollbarVertical.css("min-height"), 10)) / $target.scrollContent.outerHeight();
      
      if(($target.width()*$target.scrollRatio.left) - scrollPadding.left < parseInt($target.scrollbarHorizontal.css("min-width"), 10))
        $target.scrollRatio.top = ($target.innerWidth() + ($target.width()*$target.scrollRatio.left) - scrollPadding.left - parseInt($target.scrollbarHorizontal.css("min-width"), 10)) / $target.scrollContent.outerWidth();
      
      $target.scrollbarVertical.height($target.innerHeight() - scrollPadding.top);
      $target.scrollbarHorizontal.width($target.innerWidth() - scrollPadding.left);
      
      $target.scrollHandleVertical.height(Math.round(($target.innerHeight()*$target.scrollRatio.top) - scrollPadding.top));
      $target.scrollHandleHorizontal.width(Math.round(($target.innerWidth()*$target.scrollRatio.left) - scrollPadding.left));
      
      $target.scrollRect.scroll(); // bad form? ...
    },

    // FIXME: this is a confusing mess, and probably a bad idea in general
    resize: function(width, height, time){
      alert("setting scrollbars to:", width, height, time);

      width = (width == null)? this.element.width() : width;
      height = (height == null)? this.element.height() : height;

      if(time == null)
      {
        this.element.width(width).height(height);
        this.scrollRect.width(width+scrollbarWidth).height(height+scrollbarWidth);
      }

      this.update();
    }//,
    // destroy : function( ) {
    //  TODO: remove styling
    //s
    //  return this.each(function(){
    // 
    //    var $this = $(this),
    //        data = $this.data('scrollbars');
    // 
    //    // Namespacing FTW
    //    $(window).unbind('.scrollbars');
    //    data.tooltip.remove();
    //    $this.removeData('scrollbars');
    // 
    //  })
    // 
    // }
  };
  
  
  $.fn.scrollbars = function(method){
    if(methods[method]){
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }else if(typeof method === 'object' || ! method){
      return methods.init.apply(this, arguments);
    }
    return $.error('Method ' +  method + ' does not exist on jQuery.tooltip');
  };
  
  
  var originalAppend = $.fn.append;

  $.fn.append = function(){
      var o, scrollContent = this.find(".scrollContent"); // might be faster as "first" or "nearest (closest?)"
      // var scrollPane = this.parents(".scrollPane").first();
    if (this.hasClass("scrollPane") && scrollContent.length > 0) {
      o = originalAppend.apply(scrollContent.first(), arguments);
      this.scrollbars('update');
      return o;
    }
    else{
      o = originalAppend.apply(this, arguments);
      
      // if(scrollPane.data)
        // console.log('updating:', scrollPane.data('scrollbars'))
      if( $(this).parents('.scrollPane').length > 0) //$(this).parents('.scrollPane').attr('id')+"\n"+$(this).find('.scrollPane').attr('id'))//.scrollbars('update'))
         console.log('apparently this exists, but fixking doesnt work')
         // $(this).parents('.scrollPane').scrollbars();
      return o;
    }    
  };
  
  $.fn._append = function(){
    return originalAppend.apply(this, arguments);
  };
  
  
  
  // $.fn.children = function(){
  //     if(this.hasClass("scrollPane"))
  //     { 
  //       var $scrollContentChildren = originalChildren.apply(this).children().children().children(arguments);
  //       
  //       console.log("accessing children:", this.attr('id'));
  //       // console.log("herhehrehrehrhe:", $scrollContentChildren.attr('class'));
  //       
  //       return $scrollRect;
  //     }
  //     else
  //     {
  //       return originalChildren.apply(this, arguments);
  //     }
  //   };
})( jQuery );


// $.widget("modkit.scrollbars", {
  // defaults basically make it work like a clickable and draggable version of the iphone scrollbar
