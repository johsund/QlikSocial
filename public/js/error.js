require( ['jquery'], function ( $ ) {

console.log('test');

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

//console.log(getUrlParameter('qlikTicket'));
if(getUrlParameter('reason') == 'virtualproxy')
 {
	 $("#mostLikely").append("<h3><strong>Check that the virtual proxy prefix is correct in config.js and that the virtual proxy is attached to the proxy</strong></h3>")
 }
 else if (getUrlParameter('reason') == 'ticketfail')
 {
	 $("#mostLikely").append("<h3><strong>Check that you're using the correct passphrase for your certificate in config.js</strong></h3>")
 }
 else 
 {
	 $("#mostLikely").append("<h3><strong>Not sure what happened here.. please ensure all configuration steps are followed</strong></h3>")
 }



		 
} );