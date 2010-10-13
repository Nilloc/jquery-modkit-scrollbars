(function(){
	
	var special = jQuery.event.special,
	uid1 = 'D' + (+new Date()),
	uid2 = 'D' + (+new Date() + 1);
	
	special.scrollStart = {
		setup: function() {

			var timer,
			handler =  function(evt) {

				var _self = this,
				_args = arguments;

				if (timer) {
					clearTimeout(timer);
				} else {
					evt.type = 'scrollStart';
					jQuery.event.handle.apply(_self, _args);
				}
				
				timer = setTimeout( function(){
					timer = null;
				}, special.scrollStop.latency);
					
			};
			
			jQuery(this).bind('scroll', handler).data(uid1, handler);
			
		},
		teardown: function(){
			jQuery(this).unbind( 'scroll', jQuery(this).data(uid1) );
		}
	};
	
	special.scrollStop = {
		latency: 500,
		setup: function() {
			
			var timer,
			handler = function(evt) {
				
				var _self = this,
				_args = arguments;
				
				if (timer) {
					clearTimeout(timer);
				}
				
				timer = setTimeout( function(){
					
					timer = null;
					evt.type = 'scrollStop';
					jQuery.event.handle.apply(_self, _args);
					
				}, special.scrollStop.latency);
					
			};
			
			jQuery(this).bind('scroll', handler).data(uid2, handler);
			
		},
		teardown: function() {
			jQuery(this).unbind( 'scroll', jQuery(this).data(uid2) );
		}
	};
		
})();