/**
 * jQuery trace 1.0
 * Copyright (c) 2009 Collin Reisdorf
 * 
 * Use this to emulate the trace function in AS3: $.trace("one think", "another", [...]);
 * You can also get lazyer and make a function called trace that wraps
 * the above code and traces for you with one method call: function trace(){$.trace("quicktrace");}
 * 
 * MIT Licensed: http://www.opensource.org/licenses/mit-license.php
 */
$.fn.trace = function(){
	var output = "";
	if(arguments[0] == "quicktrace")
	{
		arguments = arguments.callee.caller.arguments;
	}	
	for(var i=0; i < arguments.length; i++)
	{
		output += arguments[i]+" ";
	}
	output = output.substr(0, output.length-1);
	
	if(window.console){
		 console.log(output);
	}else
	{
		if($('#trace_block').length < 1)
			$('body').append("<div id=\"trace_block\" style='position:fixed; bottom:0px; right:0px; background:white;'><ins>Trace:</ins></div>");
		$('#trace_block').append("<pre>"+output+"</pre>");
	}
	return output;
};
// This function allows you to omit the ($ before trace statements, for the truly lazy, like me).
function trace(){
	if(debugging)
		$().trace("quicktrace");
}