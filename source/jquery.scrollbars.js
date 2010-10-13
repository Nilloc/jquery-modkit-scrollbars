$.widget("modkit.scrollbars", {
	// default options
	options: {
		minOpacity:0,
		maxOpacity:0.5,
		autoHide:true,
		clickBehavior:"paging"
	},
	_create: function() {
		// creation code for mywidget
		this.scrollbarWidth = this._getScrollbarWidth();
		
		console.log(this.element);
		console.log("scrollbar width", this.scrollbarWidth);
		// can use this.options
		// if (this.options.hidden) {
			// and this.element
			// this.$element = $(this.element); 
		// }
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
	_doSomething: function() {
		 // internal functions should be named with a leading underscore
		 // manipulate the widget
	},
	value: function() {
		// calculate some value and return it
		return this._calculate();
	},
	length: function() {
		return this._someOtherValue();
	},
	destroy: function() {
			$.Widget.prototype.destroy.apply(this, arguments); // default destroy
			 // now do other stuff particular to this widget
	}
});