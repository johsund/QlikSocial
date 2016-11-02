require( ['jquery'], function ( $ ) {

var qlikHost = 'sgsin-jsn1.qliktech.com';
var qlikVirtualProxy = 'ticket';
var qlikWebConnectorHost = 'localhost';


var facebookAccessToken;
var qsTicket;
var facebookPageID;
var facebookSearchedPageID;

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
if(getUrlParameter('qlikTicket') == undefined)
 {
	 window.location.href = window.location.protocol + '//' + window.location.host + '/auth';
 }
 else if (getUrlParameter('qlikTicket').length != 16)
 {
	 window.location.href = window.location.protocol + '//' + window.location.host + '/auth';
 }
 else 
 {
	 //Ticket received
	 qsTicket = getUrlParameter('qlikTicket');
 }



  var config = {
    host: qlikHost,
	prefix: qlikVirtualProxy,
	rejectUnauthorized: false,
	ticket: qsTicket,
    isSecure: true
  };

//console.log(config);
  
 var newAppId;
  
var geoLoc; 

navigator.geolocation.getCurrentPosition(showPosition);
function showPosition(position) {
	//console.log(position);  
	//return position;
	geoLoc = position;
}
//console.log(navigator.geolocation.getCurrentPosition(showPosition));

  
var tooltip = $('<div id="tooltip" style="color:#3c763d" class="hidden"/>').css({
    position: 'absolute',
    top: -25,
    left: 3
});

var tooltipRange = $('<div id="tooltipRange" style="color:#3c763d" />').css({
    position: 'absolute',
    top: -25,
    left: -5
});
//.hide();
  console.log("test");
      $( "#sliderPages" ).slider({
      orientation: "horizontal",
      range: "min",
      min: 1,
      max: 10,
      value: 3,
      slide: function( event, ui ) {
        tooltip.text(ui.value);
		//console.log($("#tooltip").text());
      },
    change: function(event, ui) {}
	}).find(".ui-slider-handle").append(tooltip).hover(function() {
		//tooltip.show()
	}, function() {
		//tooltip.hide()
	});
	
	//$( "#sliderPages" ).css('background', 'rgb(0,255,0)');
	$( "#sliderPages .ui-slider-range" ).css('background', '#D0E9C6');
	
      $( "#sliderRange" ).slider({
      orientation: "horizontal",
      range: "min",
      min: 10,
      max: 1000,
      value: 100,
	  step: 10,
      slide: function( event, ui ) {
        tooltipRange.text(ui.value);
		//console.log($("#tooltip").text());
      },
    change: function(event, ui) {}
	}).find(".ui-slider-handle").append(tooltipRange).hover(function() {
		//tooltip.show()
	}, function() {
		//tooltip.hide()
	});
	
	//$( "#sliderPages" ).css('background', 'rgb(0,255,0)');
	$( "#sliderRange .ui-slider-range" ).css('background', '#D0E9C6');	
  
  qsocks.Connect(config).then(function(global) {
    console.log(global);

	refreshAppList(global);
	
	function refreshAppList(global){
		console.log("Refreshing app list");
		$("#previous-searches").empty();
		global.getDocList().then(function(docList) {
			docList.forEach(function(doc) {
				if(doc.qDocName.substring(0,10)=='QlikSocial') {
					//console.log(doc);
					//console.log(doc.qDocName.substring(11, doc.qDocName.length-11))
					//$("#previous-searches").append('<div border="0px"><div style="display:inline-block;width:90%;"><a href="#" style="padding: 0px 15px;" class="list-group-item" id="' + doc.qDocId + '"><h5>' + doc.qDocName.substring(11, doc.qDocName.indexOf('-201')) + '</h5><h6>'+doc.qDocName.substring(doc.qDocName.length - 10)+'</h6></a></div><div style="display:inline-block;float:right;padding-top:20px;"><i class="fa fa-trash-o fa-2" id="'+ 'del_' + doc.qDocId +'" aria-hidden="true" style="display:inline;padding-top:0px;padding-right:20px;font-size:20px;cursor:pointer;"></i></div></div>');
					$("#previous-searches").append('<div border="0px"><div style="display:inline-block;width:90%;"><a href="#" style="padding: 0px 15px;" class="list-group-item" id="' + doc.qDocId + '"><h5><b class="prevSearchListTitle" style="">' + doc.qDocName.substring(11, doc.qDocName.indexOf('-201')) + '</b> - '+doc.qDocName.substring(doc.qDocName.length - 10)+'</h5></a></div><div style="float:right;padding-top:12px;width:35px;"><i class="fa fa-trash-o fa-2" id="'+ 'del_' + doc.qDocId +'" aria-hidden="true" style="padding-top:0px;font-size:18px;cursor:pointer;"></i></div></div>');
					$("#"+doc.qDocId).hover(function() {
						//console.log(doc.qDocId + " hover");
						$("#"+doc.qDocId).addClass("list-group-item-success");
					},
					function (){
						//console.log(doc.qDocId + " end hover");
						$("#"+doc.qDocId).removeClass("list-group-item-success");
					});
					$("#"+doc.qDocId).click(function() {
						//console.log(this.id);
						$(".container").remove();
						window.location = '/analytics.html?app='+doc.qDocId;
					});
					$("#del_"+doc.qDocId).click(function() {
						console.log(this.id);
						//window.location ='/remove?app='+doc.qDocId;
						global.deleteApp(doc.qDocId).then(sleep(1500)).then(refreshAppList(global)); //delete app, wait for done, then refresh app list
						console.log("deleted");
						//refreshAppList(global);
					});
				}
			});
		});	
	}

// $.get("http://www.sentiment140.com/api/classify?text=awesome%20wonderful%20great%20Was%20the%20season%20premiere%20of%20TWD%20killer%20or%20what?%20Check%20out%20our%20app%20to%20see%20how%20tonight%27s%20walker%20kill%20count%20compares%20to%20past%20seasons:%20http://bit.ly/1TC1VFk&query=new+moon&language=en&appid=ftn@qlik", function(data) {
	// console.log(data);
// });

	
	$("#searchButton").click(function() {
		
		// function getFacebookPageID() {
			
		// return new Promise(function(resolve, reject) {	
			// console.log("triggered");
			// if ($("#buttonFacebook").attr('checked')) {
				// if($("#accessToken").val()=="") {
					// $.get("https://graph.facebook.com/search?q="+$("#searchObject").val().split(' ').join('+')+"&type=page&access_token=" + facebookAccessToken, function(data) {
						// console.log(data.data[0].id);
						// facebookPageID = data.data[0].id;
					// });			
				// }	
				// else {
					// facebookPageID = $("#accessToken").val();
				// }
				// return resolve(facebookPageID)
			// }
			// else {
				// facebookPageID = "nofacebook";
				// return resolve(facebookPageID)
			// }
		// });
		// }

		if ($("#buttonFacebook").attr('checked')) {
			
			//if($("#accessToken").val()!="") {
			//	facebookPageID = $("#accessToken").val();
			
			if(facebookSearchedPageID != undefined) {
				facebookPageID = facebookSearchedPageID;
				create(global);
			}
			else {
				$.get("https://graph.facebook.com/search?q="+$("#searchObject").val().split(' ').join('+')+"&type=page&access_token=" + facebookAccessToken, function(data) {
						console.log(data);
						console.log(data.data[0].id);
						facebookPageID = data.data[0].id;
						create(global);
					});		
			}			
		}
		else {
			create(global);
		}


			

	});	
	
  });
  
function create(global) {

	//appinfo = app;
	console.log(facebookPageID);

	var d = new Date(Date.now());
	//var msg = msg;
	var date = new Date();
	var datestr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toJSON().slice(0, 10)
	var appname = 'QlikSocial' + '-' + $("#searchObject").val() + '-' + datestr;
	
	//console.log('&maxNoPages='+$("#tooltip").text()+'&appID=');
	

	var twitter = true;
	
	loadscript = "";
	
	console.log(loadscript.length);
	console.log($("#buttonTwitter").attr('checked'));
	
	var sourceCounter  = 0;
	

	
	if($("#buttonTwitter").attr('checked')) {
		sourceCounter += 1;
		var localTweets ='';
		
		if($("#buttonTwitterLocal").attr('checked')) {
			//console.log(geoLoc)
			localTweets = '&geocode=' + geoLoc.coords.latitude + ',' + geoLoc.coords.longitude + ',' + $("#tooltipRange").text() + 'mi&result_type=mixed';
			//console.log(localTweets);
		}
		
		console.log($("#tooltip").text().length);
		var twitterPages;
		if($("#tooltip").text().length==0) {twitterPages=3;} else {twitterPages=$("#tooltip").text();}
		console.log(twitterPages);
		
		connectionTwitter = {
			qName: 'QlikSocial Twitter' + ' ' + Date.now(),
			qConnectionString: 'http://'+qlikWebConnectorHost+':5555/data?connectorID=TwitterConnector&table=Search&searchTerm=' + $("#searchObject").val().split(' ').join('+') + localTweets + '&count=100&maxNoPages='+twitterPages+'&appID=',
			qType: 'internet'
		};	
		//console.log(loadscript.length);
		//loadscript += appendTwitter(loadscript);	
		loadscript += appendTwitter();	
		//console.log(loadscript);		
		//console.log(connectionTwitter);
	}
	if($("#buttonReddit").attr('checked')) {
		sourceCounter += 1;
		
		connectionReddit = {
			qName: 'QlikSocial Reddit' + ' ' + Date.now(),
			qConnectionString: 'http://'+qlikWebConnectorHost+':5555/data?connectorID=WebConnector&table=JsonToXmlRaw&url=http%3a%2f%2fwww.reddit.com%2fsearch.json%3fq%3d' + $("#searchObject").val().split(' ').join('+') + '%26sort%3drelevance%26limit%3d100&appID=',
			qType: 'internet'
		};		
		//console.log(loadscript.length);
		loadscript += appendReddit();		
		//console.log(loadscript);
		//console.log(connectionReddit);
	}

	if($("#buttonFacebook").attr('checked')) {
		
		console.log("Facebook");
		
		// $.get("https://graph.facebook.com/search?q="+$("#searchObject").val().split(' ').join('+')+"&type=page&access_token=" + facebookAccessToken, function(data) {
			// console.log(data.data[0].id);
		// });
		
		  FB.getLoginStatus(function(response) {
			  if (response.status === 'connected') {
				  console.log("FB connected already");
				facebookAccessToken = response.authResponse.accessToken;
			  } 
		  });
		
		
		sourceCounter += 1;
		
		connectionFacebook = {
			qName: 'QlikSocial Facebook' + ' ' + Date.now(),
			qConnectionString: 'http://'+qlikWebConnectorHost+':5555/data?connectorID=FacebookFanPagesConnector&table=Feed&pageId='+facebookPageID+'&maxResults=300&appID=',
			qType: 'internet'
		};		
		
		//console.log(loadscript.length);
		loadscript += appendFacebook();
		//console.log(loadscript);		
		//console.log(connectionReddit);
	}	
	
	loadscript += appendWordFilter();	
	
	if($("#buttonSentiment").attr('checked')) {
		connectionSentiment = {
			qName: 'QlikSocial Sentiment' + ' ' + Date.now(),
			qConnectionString: 'CUSTOM CONNECT TO "provider=QvRestConnector.exe;url=http://www.sentiment140.com/api/classify?text%2&query%2&appid%2&language%2;timeout=30;method=GET;autoDetectResponseType=true;keyGenerationStrategy=-1;useWindowsAuthentication=false;forceAuthenticationType=false;useCertificate=No;certificateStoreLocation=LocalMachine;certificateStoreName=My;queryParameters=text%2;PaginationType=Custom;OffsetStartField=Sentiment;IsOffsetStartFieldHeader=false;OffsetStartFieldValue=1;OffsetCountFieldName=Sentiment;IsOffsetCountFieldHeader=false;"',
			qType: 'QvRestConnector.exe'
		};	
		loadscript += appendSentiment();
	}
	

	
	//if(sourceCounter>1) {
		$(".container").fadeTo( "slow" , 0.5, function() {
		// Animation complete.
		});
		//console.log("Twitter checked");
	
	$(document.getElementById('body')).append('<div id="qlikProgress" class="qlikProgress" style="width:350px; height:220px;opacity:1;"></div>');
	$(document.getElementById('qlikProgress')).append('<div style="height:20px;background-color:#eeeeee;margin-bottom:10px;" id="progressBox"><div class="progress-bar progress-bar-success" id="progressBar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 10%;background-image:linear-gradient(to bottom,#9FD888 0,#8FBF7C 100%);"><span class="sr-only">10% Complete</span></div></div>');

	
	console.log(loadscript.length);
///*	
	createAndOpen(global, appname)
		.then(createConnections)
		//.then(createConnectionReddit)
		.then(getSetScript)
		.then(sleep(100))
		.then(reload)
		.then(sleep(100))
		.then(save)
		.then(sleep(100))
		.then(function() {
			console.log("App Created");
			// port.postMessage({
				// 'action': "appCreated",
				// "info": {
					// appname: settings.useServer === true ? serverappname : appname
				// }
			// })
		}, function(error) {
			//if (error.code === 1000) {
			//	counter++
			//	var newName = app.host + ' - ' + datestr + ' - ' + counter
			//	create(msg, app, newName)
			//} else {
				console.log(error);
			//}
		})
		.then(buildUI)
//*/
	//}
	
};

function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
   }
}

function createAndOpen(global, appname) {
	
	$(document.getElementById('qlikProgress')).append('<p>- Creating App</p>');
	$(document.getElementById('progressBar')).width('10%');
	
	//console.log(global, appname);
	//if(settings.useServer === true) {
		return new Promise(function(resolve, reject) {
			global.createApp(appname).then(function(reply) {
				if(reply.qSuccess === false) {
					return reject('Could not create app');
				}

				//store away app id to send back to content script
				serverappname = reply.qAppId;
				newAppId = reply.qAppId;

				global.openDoc(reply.qAppId).then(function(handle) {
					return resolve(handle)
				}, function(error) {
					//If app already is opened
					if(error.code === 1002) {
						global.getActiveDoc().then(function(handle) {
							return resolve(handle)
						})
					}
				})
			}, function(error) {
				return reject(error);
			})
		})
	// } else {
		// return new Promise(function(resolve, reject) {
			// global.createDocEx(appname).then(function() {
				// global.getActiveDoc().then(function(handle) {
					// return resolve(handle)
				// })
			// }, function(error) {
				// return reject(error);
			// })
		// })
	// }
};

function createConnections(handle) {
	
		//console.log(handle);
		//console.log(connectionFacebook);
		$(document.getElementById('qlikProgress')).append('<p>- Creating Data Connection(s)</p>');
		$(document.getElementById('progressBar')).width('20%');
		return new Promise(function(resolve, reject) {
			//handle.createConnection(connectionTwitter).then(function() {
				if($("#buttonSentiment").attr('checked')) {
					handle.createConnection(connectionSentiment);
				}
				if($("#buttonTwitter").attr('checked')) {
					handle.createConnection(connectionTwitter);
				}
				if($("#buttonReddit").attr('checked')) {
					handle.createConnection(connectionReddit);
				}
				if($("#buttonFacebook").attr('checked')) {
					handle.createConnection(connectionFacebook);
				}
				return resolve(handle);
			//}, function(error) {
			//	return reject(error);
			//})
		})
};

// function createConnectionsold(handle) {
	
	// return new Promise(function(resolve, reject) {
		// $(".socialMediaButton").each(function(index) {
			// if($(this).attr('checked')) {
				// if($(this).id == "buttonTwitter") {
					// handle.createConnection(connectionTwitter)
				// }
				// else if($(this).id == "buttonReddit") {
					// handle.createConnection(connectionReddit)
				// }
				// else if($(this).id == "buttonFacebook") {
					// handle.createConnection(connectionFacebook)
				// }				
				
			// }
		// });
		// return resolve(handle);
	// })
	
// };

// function createConnectionReddit(handle) {
	// if($("#buttonReddit").attr('checked')) {	
		// console.log(handle);
		// $(document.getElementById('qlikProgress')).append('<p>- Creating Data Connection - Reddit</p>');
		// $(document.getElementById('progressBar')).width('20%');
		// return new Promise(function(resolve, reject) {
			// handle.createConnection(connectionReddit).then(function() {
				// return resolve(handle);
			// }, function(error) {
				// return reject(error);
			// })
		// })
	// }
	// else {
		// //return 0;
	// }	
// };

function getSetScript(handle) {
	//console.log(handle);
	console.log(loadscript);
	$(document.getElementById('qlikProgress')).append('<p>- Setting Load Script</p>');
	$(document.getElementById('progressBar')).width('40%');
	return new Promise(function(resolve, reject) {
		handle.getScript().then(function(script) {

			script += ('\r\n' + loadscript);
			console.log(script);
			handle.setScript(script).then(function(reply) {
				return resolve(handle);
			}, function(error) {
				return reject(error);
			})
		})
	})
};

function save(handle) {
	//console.log(handle);
	$(document.getElementById('qlikProgress')).append('<p>- Saving Application</p>');
	$(document.getElementById('progressBar')).width('100%');
	return new Promise(function(resolve, reject) {
		handle.doSave().then(function() {
			return resolve(handle);
		}, function(error) {
			return reject(error);
		})
	})
};

function reload(handle) {
	//console.log(handle);
	$(document.getElementById('qlikProgress')).append('<p>- Reload Application</p>');
	$(document.getElementById('progressBar')).width('70%');
	return new Promise(function(resolve, reject) {
		handle.doReload().then(function(reply) {
			return resolve(handle);
		})
	})
};

function buildUI(handle) {
	//console.log(handle);
	$(".container").remove();
	$("#qlikProgress").remove();
	//console.log(newAppId);
	window.location = '/analytics.html?app='+newAppId;
	
}

//function createLoadscript

function appendTwitter() {
	//console.log("appendTwitter");
	var twitterLoadscript ="";
	twitterLoadscript += "\r\nDataTable:";
	twitterLoadscript += "\r\nLOAD DISTINCT";
	twitterLoadscript += "\r\n    'Twitter' as datasource,";
	twitterLoadscript += "\r\n    id as Search_id,";
	twitterLoadscript += "\r\n    created_at as Search_created_at,";
	twitterLoadscript += "\r\n    timestamp#(mid(created_at, 9, 2) & '-' & mid(created_at, 5, 3) & '-' & mid(created_at, 27, 4) & ' ' & mid(created_at, 12, 8), 'DD-MMM-YYYY hh:mm:ss') as Search_created_at_timestamp,";
	twitterLoadscript += "\r\n    date#(mid(created_at, 9, 2) & '-' & mid(created_at, 5, 3) & '-' & mid(created_at, 27, 4), 'DD-MMM-YYYY') as Search_created_at_date,";
	twitterLoadscript += "\r\n    time#(mid(created_at, 12, 8), 'hh:mm:ss') as Search_created_at_time,";
	twitterLoadscript += "\r\n    hour(time#(mid(created_at, 12, 8), 'hh:mm:ss')) as hour,";
	twitterLoadscript += "\r\n    text as Search_text,";
	twitterLoadscript += "\r\n    if(left(text,2)<>'RT', id) as Search_Unique_id,";
	twitterLoadscript += "\r\n    text_urlEncoded as Search_text_urlEncoded,";
	twitterLoadscript += "\r\n    lang as Search_lang,";
	twitterLoadscript += "\r\n    source as Search_source,";
	twitterLoadscript += "\r\n    truncated as Search_truncated,";
	twitterLoadscript += "\r\n    in_reply_to_screen_name as Search_in_reply_to_screen_name,";
	twitterLoadscript += "\r\n    in_reply_to_status_id as Search_in_reply_to_status_id,";
	twitterLoadscript += "\r\n    in_reply_to_user_id as Search_in_reply_to_user_id,";
	twitterLoadscript += "\r\n    retweet_count as Search_retweet_count,";
	twitterLoadscript += "\r\n    favorite_count as Search_favorite_count,";
	twitterLoadscript += "\r\n    retweeted as Search_retweeted,";
	twitterLoadscript += "\r\n    favorited as Search_favorited,";
	twitterLoadscript += "\r\n    possibly_sensitive as Search_possibly_sensitive,";
	twitterLoadscript += "\r\n    hashtag_count as Search_hashtag_count,";
	twitterLoadscript += "\r\n    hash_tags as Search_hash_tags,";
	twitterLoadscript += "\r\n    first_hash_tag as Search_first_hash_tag,";
	twitterLoadscript += "\r\n    if(first_hash_tag<>'' and first_hash_tag<>'undefined', '#' & first_hash_tag) as Search_first_hash_tag_clean,";
	twitterLoadscript += "\r\n    url_count as Search_url_count,";
	twitterLoadscript += "\r\n    expanded_urls as Search_expanded_urls,";
	twitterLoadscript += "\r\n    first_expanded_url as Search_first_expanded_url,";
	twitterLoadscript += "\r\n    user_mentions_count as Search_user_mentions_count,";
	twitterLoadscript += "\r\n    user_mentions as Search_user_mentions,";
	twitterLoadscript += "\r\n    first_user_mention as Search_first_user_mention,";
	twitterLoadscript += "\r\n    media_count as Search_media_count,";
	twitterLoadscript += "\r\n    media_expanded_urls as Search_media_expanded_urls,";
	twitterLoadscript += "\r\n    first_media_expanded_url as Search_first_media_expanded_url,";
	twitterLoadscript += "\r\n    symbols_count as Search_symbols_count,";
	twitterLoadscript += "\r\n    symbols as Search_symbols,";
	twitterLoadscript += "\r\n    first_symbol as Search_first_symbol,";
	twitterLoadscript += "\r\n    media_photo_count as Search_media_photo_count,";
	twitterLoadscript += "\r\n    media_photo_urls as Search_media_photo_urls,";
	twitterLoadscript += "\r\n    first_media_photo_url as Search_first_media_photo_url,";
	twitterLoadscript += "\r\n    metadata_result_type as Search_metadata_result_type,";
	twitterLoadscript += "\r\n    metadata_iso_language_code as Search_metadata_iso_language_code,";
	twitterLoadscript += "\r\n    user_id as Search_user_id,";
	twitterLoadscript += "\r\n    user_name as Search_user_name,";
	twitterLoadscript += "\r\n    user_screen_name as Search_user_screen_name,";
	twitterLoadscript += "\r\n    user_location as Search_user_location,";
	twitterLoadscript += "\r\n    '' as Search_user_profile_image_url,"; //user_profile_image_url
	twitterLoadscript += "\r\n    '' as Search_user_description,"; //user_description
	twitterLoadscript += "\r\n    '' as Search_user_url,"; //user_url
	twitterLoadscript += "\r\n    user_geo_enabled as Search_user_geo_enabled,";
	twitterLoadscript += "\r\n    user_protected as Search_user_protected,";
	twitterLoadscript += "\r\n    user_followers_count as Search_user_followers_count,";
	twitterLoadscript += "\r\n    user_friends_count as Search_user_friends_count,";
	twitterLoadscript += "\r\n    user_listed_count as Search_user_listed_count,";
	twitterLoadscript += "\r\n    user_favourites_count as Search_user_favourites_count,";
	twitterLoadscript += "\r\n    user_statuses_count as Search_user_statuses_count,";
	twitterLoadscript += "\r\n    user_created_at as Search_user_created_at,";
	twitterLoadscript += "\r\n    timestamp#(mid(user_created_at, 9, 2) & '-' & mid(user_created_at, 5, 3) & '-' & mid(user_created_at, 27, 4) & ' ' & mid(user_created_at, 12, 8), 'DD-MMM-YYYY hh:mm:ss') as Search_user_user_created_at_timestamp,";
	twitterLoadscript += "\r\n    date#(mid(user_created_at, 9, 2) & '-' & mid(user_created_at, 5, 3) & '-' & mid(user_created_at, 27, 4), 'DD-MMM-YYYY') as Search_user_user_created_at_date,";
	twitterLoadscript += "\r\n    time#(mid(user_created_at, 12, 8), 'hh:mm:ss') as Search_user_user_created_at_time,";
	twitterLoadscript += "\r\n    user_utc_offset as Search_user_utc_offset,";
	twitterLoadscript += "\r\n    user_time_zone as Search_user_time_zone,";
	twitterLoadscript += "\r\n    user_verified as Search_user_verified,";
	twitterLoadscript += "\r\n    user_lang as Search_user_lang,";
	twitterLoadscript += "\r\n    user_follow_request_sent as Search_user_follow_request_sent,";
	twitterLoadscript += "\r\n    user_is_translator as Search_user_is_translator,";
	twitterLoadscript += "\r\n    user_name as UserName,";
	twitterLoadscript += "\r\n    user_name as Search_user_notifications";
	twitterLoadscript += "\r\nFROM [lib://" + connectionTwitter.qName + "] (qvx) where possibly_sensitive='false';";
	
	return twitterLoadscript;
}

function appendReddit() {
	var redditLoadscript ="";
	redditLoadscript += "\r\nDataTable:";
	redditLoadscript += "\r\nLOAD";
	redditLoadscript += "\r\n    'Reddit' as datasource,";
	redditLoadscript += "\r\n    [data/name] as Search_id,";
	redditLoadscript += "\r\n    [data/created] as Search_created_at,";
	redditLoadscript += "\r\n    timestamp([data/created]/ 86400 + 25569, 'DD-MMM-YYYY hh:mm:ss') as Search_created_at_timestamp,";
	redditLoadscript += "\r\n    date(floor([data/created]/ 86400 + 25569), 'DD-MMM-YYYY') as Search_created_at_date,";
	redditLoadscript += "\r\n    time(frac([data/created]/ 86400 + 25569), 'hh:mm:ss') as Search_created_at_time,";
	redditLoadscript += "\r\n    hour(time(frac([data/created]/ 86400 + 25569), 'hh:mm:ss')) as hour,";
	redditLoadscript += "\r\n    [data/title] as Search_text,";
	redditLoadscript += "\r\n    if(left(text,2)<>'RT', [data/name]) as Search_Unique_id,";
	redditLoadscript += "\r\n    [data/selftext_html] as Search_text_urlEncoded,";
	redditLoadscript += "\r\n    'en' as Search_lang,";
	redditLoadscript += "\r\n    [data/subreddit_id] as Search_source,";
	redditLoadscript += "\r\n    [data/subreddit] as Search_truncated,";
	redditLoadscript += "\r\n    '' as Search_in_reply_to_screen_name,";
	redditLoadscript += "\r\n    '' as Search_in_reply_to_status_id,";
	redditLoadscript += "\r\n    '' as Search_in_reply_to_user_id,";
	redditLoadscript += "\r\n    [data/num_comments] as Search_retweet_count,";
	redditLoadscript += "\r\n    [data/url] as Search_favorite_count,";
	redditLoadscript += "\r\n    '' as Search_retweeted,";
	redditLoadscript += "\r\n    '' as Search_favorited,";
	redditLoadscript += "\r\n    [data/over_18] as Search_possibly_sensitive,";
	redditLoadscript += "\r\n    '' as Search_hashtag_count,";
	redditLoadscript += "\r\n    '' as Search_hash_tags,";
	redditLoadscript += "\r\n    '' as Search_first_hash_tag,";
	redditLoadscript += "\r\n    '' as Search_first_hash_tag_clean,"; //Left(right([data/title], len([data/title])-index([data/title],'#',1)+1), index(right([data/title], len([data/title])-index([data/title],'#',1)+1),' ',1))
	redditLoadscript += "\r\n    '' as Search_url_count,";
	redditLoadscript += "\r\n    '' as Search_expanded_urls,";
	redditLoadscript += "\r\n    '' as Search_first_expanded_url,";
	redditLoadscript += "\r\n    '' as Search_user_mentions_count,";
	redditLoadscript += "\r\n    '' as Search_user_mentions,";
	redditLoadscript += "\r\n    '' as Search_first_user_mention,";
	redditLoadscript += "\r\n    '' as Search_media_count,";
	redditLoadscript += "\r\n    '' as Search_media_expanded_urls,";
	redditLoadscript += "\r\n    [data/preview/images/source/url] as Search_first_media_expanded_url,";
	redditLoadscript += "\r\n    '' as Search_symbols_count,";
	redditLoadscript += "\r\n    '' as Search_symbols,";
	redditLoadscript += "\r\n    '' as Search_first_symbol,";
	redditLoadscript += "\r\n    '' as Search_media_photo_count,";
	redditLoadscript += "\r\n    '' as Search_media_photo_urls,";
	redditLoadscript += "\r\n    [data/preview/images/source/url] as Search_first_media_photo_url,";
	redditLoadscript += "\r\n    '' as Search_metadata_result_type,";
	redditLoadscript += "\r\n    'en' as Search_metadata_iso_language_code,";
	redditLoadscript += "\r\n    '' as Search_user_id,";
	redditLoadscript += "\r\n    [data/selftext] as Search_user_name,";
	redditLoadscript += "\r\n    [data/author] as Search_user_screen_name,";
	redditLoadscript += "\r\n    '' as Search_user_location,";
	redditLoadscript += "\r\n    '' as Search_user_profile_image_url,";
	redditLoadscript += "\r\n    '' as Search_user_description,";
	redditLoadscript += "\r\n    '' as Search_user_url,";
	redditLoadscript += "\r\n    '' as Search_user_geo_enabled,";
	redditLoadscript += "\r\n    '' as Search_user_protected,";
	redditLoadscript += "\r\n    '' as Search_user_followers_count,";
	redditLoadscript += "\r\n    '' as Search_user_friends_count,";
	redditLoadscript += "\r\n    '' as Search_user_listed_count,";
	redditLoadscript += "\r\n    '' as Search_user_favourites_count,";
	redditLoadscript += "\r\n    '' as Search_user_statuses_count,";
	redditLoadscript += "\r\n    '' as Search_user_created_at,";
	redditLoadscript += "\r\n    '' as Search_user_user_created_at_timestamp,";
	redditLoadscript += "\r\n    '' as Search_user_user_created_at_date,";
	redditLoadscript += "\r\n    '' as Search_user_user_created_at_time,";
	redditLoadscript += "\r\n    '' as Search_user_utc_offset,";
	redditLoadscript += "\r\n    '' as Search_user_time_zone,";
	redditLoadscript += "\r\n    '' as Search_user_verified,";
	redditLoadscript += "\r\n    'en' as Search_user_lang,";
	redditLoadscript += "\r\n    '' as Search_user_follow_request_sent,";
	redditLoadscript += "\r\n    '' as Search_user_is_translator,";
	redditLoadscript += "\r\n    [data/author] as UserName,";
	redditLoadscript += "\r\n    '' as Search_user_notifications";
	redditLoadscript += "\r\nFROM [lib://" + connectionReddit.qName + "]  (XmlSimple, Table is [DATA/data/children]);";
	
	return redditLoadscript;
}

function appendFacebook() {

	var fbLoadscript="";
	fbLoadscript += "\r\nDataTable:";
	fbLoadscript += "\r\nLOAD";
	fbLoadscript += "\r\n    'Facebook' as datasource,";
	fbLoadscript += "\r\n    id as Search_id,"; //object_id
	fbLoadscript += "\r\n    created_time as Search_created_at,";
	fbLoadscript += "\r\n    timestamp(timestamp#(date#(subfield(created_time, 'T', 1), 'YYYY-MM-DD') & ' ' & time#(left(subfield(created_time, 'T', 2),8), 'hh:mm:ss'), 'YYYY-MM-DD hh:mm:ss'), 'DD-MMM-YYYY hh:mm:ss') as Search_created_at_timestamp,";
	fbLoadscript += "\r\n    date#(subfield(created_time, 'T', 1), 'YYYY-MM-DD') as Search_created_at_date,";
	fbLoadscript += "\r\n    time#(subfield(created_time, 'T', 2), 'hh:mm:ss+0000') as Search_created_at_time,";
	fbLoadscript += "\r\n    num(left(time#(subfield(created_time, 'T', 2), 'hh:mm:ss+0000'),2)) as hour,";
	fbLoadscript += "\r\n    message as Search_text,";
	fbLoadscript += "\r\n    id as Search_Unique_id,";
	fbLoadscript += "\r\n    '' as Search_text_urlEncoded,";
	fbLoadscript += "\r\n    'en' as Search_lang,";
	fbLoadscript += "\r\n    '' as Search_source,";
	fbLoadscript += "\r\n    '' as Search_truncated,";
	fbLoadscript += "\r\n    '' as Search_in_reply_to_screen_name,";
	fbLoadscript += "\r\n    '' as Search_in_reply_to_status_id,";
	fbLoadscript += "\r\n    '' as Search_in_reply_to_user_id,";
	fbLoadscript += "\r\n    if(len(total_likes)=0, 0, total_likes) as Search_retweet_count,";
	fbLoadscript += "\r\n    if(len(shares)=0, 0, shares) as Search_favorite_count,";
	fbLoadscript += "\r\n    '' as Search_retweeted,";
	fbLoadscript += "\r\n    '' as Search_favorited,";
	fbLoadscript += "\r\n    '' as Search_possibly_sensitive,";
	fbLoadscript += "\r\n    '' as Search_hashtag_count,";
	fbLoadscript += "\r\n    '' as Search_hash_tags,";
	fbLoadscript += "\r\n    '' as Search_first_hash_tag,";
	fbLoadscript += "\r\n    if(index(message, '#')>0,purgechar(Left(right(message, len(message)-index(message,'#',1)+1), index(right(message, len(message)-index(message,'#',1)+1),' ',1)), ': ,;')) as Search_first_hash_tag_clean,"; //Left(right(message, len(message)-index(message,'#',1)+1), index(right(message, len(message)-index(message,'#',1)+1),' ',1))
	fbLoadscript += "\r\n    '' as Search_url_count,";
	fbLoadscript += "\r\n    '' as Search_expanded_urls,";
	fbLoadscript += "\r\n    '' as Search_first_expanded_url,";
	fbLoadscript += "\r\n    '' as Search_user_mentions_count,";
	fbLoadscript += "\r\n    '' as Search_user_mentions,";
	fbLoadscript += "\r\n    '' as Search_first_user_mention,";
	fbLoadscript += "\r\n    '' as Search_media_count,";
	fbLoadscript += "\r\n    '' as Search_media_expanded_urls,";
	fbLoadscript += "\r\n    picture as Search_first_media_expanded_url,";
	fbLoadscript += "\r\n    '' as Search_symbols_count,";
	fbLoadscript += "\r\n    '' as Search_symbols,";
	fbLoadscript += "\r\n    '' as Search_first_symbol,";
	fbLoadscript += "\r\n    '' as Search_media_photo_count,";
	fbLoadscript += "\r\n    '' as Search_media_photo_urls,";
	fbLoadscript += "\r\n    picture as Search_first_media_photo_url,";
	fbLoadscript += "\r\n    '' as Search_metadata_result_type,";
	fbLoadscript += "\r\n    'en' as Search_metadata_iso_language_code,";
	fbLoadscript += "\r\n    '' as Search_user_id,";
	fbLoadscript += "\r\n    from_name as Search_user_name,";
	fbLoadscript += "\r\n    from_name as Search_user_screen_name,";
	fbLoadscript += "\r\n    '' as Search_user_location,";
	fbLoadscript += "\r\n    '' as Search_user_profile_image_url,"; ////////////////////
	fbLoadscript += "\r\n    to_name as Search_user_description,"; /////////////////////////
	fbLoadscript += "\r\n    type as Search_user_url,"; ////////////////////////
	fbLoadscript += "\r\n    '' as Search_user_geo_enabled,";
	fbLoadscript += "\r\n    '' as Search_user_protected,";
	fbLoadscript += "\r\n    '' as Search_user_followers_count,";
	fbLoadscript += "\r\n    '' as Search_user_friends_count,";
	fbLoadscript += "\r\n    '' as Search_user_listed_count,";
	fbLoadscript += "\r\n    '' as Search_user_favourites_count,";
	fbLoadscript += "\r\n    '' as Search_user_statuses_count,";
	fbLoadscript += "\r\n    '' as Search_user_created_at,";
	fbLoadscript += "\r\n    '' as Search_user_user_created_at_timestamp,";
	fbLoadscript += "\r\n    '' as Search_user_user_created_at_date,";
	fbLoadscript += "\r\n    '' as Search_user_user_created_at_time,";
	fbLoadscript += "\r\n    '' as Search_user_utc_offset,";
	fbLoadscript += "\r\n    '' as Search_user_time_zone,";
	fbLoadscript += "\r\n    '' as Search_user_verified,";
	fbLoadscript += "\r\n    'en' as Search_user_lang,";
	fbLoadscript += "\r\n    '' as Search_user_follow_request_sent,";
	fbLoadscript += "\r\n    '' as Search_user_is_translator,";
	fbLoadscript += "\r\n    from_name as UserName,";
	fbLoadscript += "\r\n    '' as Search_user_notifications";
	fbLoadscript += "\r\nFROM [lib://" + connectionFacebook.qName + "]  (qvx);";
	
	return fbLoadscript;
}

function appendSentiment() {

	var purgeChars = '#{}(&)@?[]\"';

	var sentimentLoadscript="";
	sentimentLoadscript += "\r\nLIB CONNECT TO '"+connectionSentiment.qName+"';";
	sentimentLoadscript += "\r\nSet ErrorMode = 0;";	
	sentimentLoadscript += "\r\nSet vLanguage = 'en';";
	sentimentLoadscript += "\r\nLet startAt = 0;";
	sentimentLoadscript += "\r\nLet vLoop = (NoOfRows('DataTable')-1) ;";
	sentimentLoadscript += "\r\nSet vappid = 'email@domain.com'; ";
	sentimentLoadscript += "\r\n[Sentimentresults]:";
	sentimentLoadscript += "\r\nLOAD 1 as dummy";
	sentimentLoadscript += "\r\nautogenerate(1);";
	sentimentLoadscript += "\r\nfor startAt = 0 to vLoop";
	sentimentLoadscript += "\r\n  Let vID = peek('Search_id',$(startAt),'DataTable');";
	sentimentLoadscript += "\r\n  Let vText = Replace(Replace(purgechar(peek('Search_text',$(startAt),'DataTable'), '"+purgeChars+"'),' ','+'), chr(10), ' ');";
	sentimentLoadscript += "\r\n    concatenate (Sentimentresults)";
	sentimentLoadscript += "\r\n    Load ";
	sentimentLoadscript += "\r\n     '$(vID)' as Search_id,";	
	sentimentLoadscript += "\r\n      \"Search_text\" as SentimentText,";
	sentimentLoadscript += "\r\n      \"polarity\" as Score,";
	sentimentLoadscript += "\r\n      IF(\"polarity\"=0,'Negative',IF(\"polarity\"=2,'Neutral',IF(\"polarity\"=4,'Positive'))) as Sentiment;   ";
	sentimentLoadscript += "\r\n    SQL SELECT ";
	sentimentLoadscript += "\r\n        \"Search_text\",";
	sentimentLoadscript += "\r\n        \"polarity\",";
	sentimentLoadscript += "\r\n        \"query\"";
	sentimentLoadscript += '\r\n    FROM JSON (wrap off) "results"';
	sentimentLoadscript += '\r\n    WITH CONNECTION(Url "http://www.sentiment140.com/api/classify?text=$(vText)&language=$(vLanguage)&appid=$(vappid)");';
	sentimentLoadscript += "\r\nif ScriptErrorCount>=5 then";
	sentimentLoadscript += "\r\nexit for;";
	sentimentLoadscript += "\r\nend if";	
	sentimentLoadscript += "\r\nNEXT startAt;";
	sentimentLoadscript += "\r\nDrop field dummy;";
	
	return sentimentLoadscript;
}

function appendWordFilter() {
	
	var purgeChars = '#{}(&)@?[]\",.:;-=_';

	var wordArray = ['hi','am','is','de','has','are','the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us', 'rt'];
	console.log(wordArray.length);
	var appendWordFilterLoadscript="";
	//appendWordFilterLoadscript += "\r\nLIB CONNECT TO '"+connectionSentiment.qName+"';";
	appendWordFilterLoadscript += "\r\n";	
	appendWordFilterLoadscript += "\r\nWordDictionary:";
	appendWordFilterLoadscript += "\r\nLoad * Inline [";
	appendWordFilterLoadscript += "\r\nWords";

	$.each(wordArray, function(index) {
		if(index!=wordArray.length-1){
			appendWordFilterLoadscript += "\r\n"+wordArray[index]+",";			
		}
		else {
			appendWordFilterLoadscript += "\r\n"+wordArray[index];	
		}

	});	
	
	appendWordFilterLoadscript += "\r\n];";
	
	appendWordFilterLoadscript += "\r\nDummyTable1:";
	appendWordFilterLoadscript += "\r\nLoad";
	appendWordFilterLoadscript += "\r\n1 as DummyValue,";
	appendWordFilterLoadscript += "\r\nSearch_id,";
	appendWordFilterLoadscript += "\r\nlower(trim(purgechar(subfield(Search_text,' '), '"+purgeChars+"'))) as Keyword";
	appendWordFilterLoadscript += "\r\nresident DataTable;";
	appendWordFilterLoadscript += "\r\nLoad Search_id, Keyword resident DummyTable1";
	appendWordFilterLoadscript += "\r\nwhere not exists (Words, Keyword) and len(Keyword)>0;";
	appendWordFilterLoadscript += "\r\nDrop table DummyTable1;";
	//appendWordFilterLoadscript += "\r\nDrop table WordDictionary;";

	return appendWordFilterLoadscript;
}

	$("#buttonTwitter").click(function() {
		if ($("#buttonTwitter").attr('checked')) {
			$("#buttonTwitter").removeAttr('checked');
		} else {
			$("#buttonTwitter").attr('checked', 'checked');
		}		
		$("#checkTwitter").toggleClass("hidden");
		$("#twitterSelected").toggleClass("hidden");
		$("#sliderPages").toggleClass("hidden");
		$("#tooltip").toggleClass("hidden");
		$("#buttonTwitterLocal").toggleClass("hidden");
		$("#twitterSelectedLocal").toggleClass("hidden");
		$("#sliderRange").toggleClass("hidden");		
		$("#panelTwitter").toggleClass("panel-success");
	});
	$("#buttonTwitterLocal").click(function() {
		if ($("#buttonTwitterLocal").attr('checked')) {
			$("#buttonTwitterLocal").removeAttr('checked');
		} else {
			$("#buttonTwitterLocal").attr('checked', 'checked');
		}			
		$("#checkTwitterLocal").toggleClass("hidden");
		//console.log(geoLoc);
	});
	$("#buttonReddit").click(function() {
		if ($("#buttonReddit").attr('checked')) {
			$("#buttonReddit").removeAttr('checked');
		} else {
			$("#buttonReddit").attr('checked', 'checked');
		}		
		$("#checkReddit").toggleClass("hidden");
		$("#redditSelected").toggleClass("hidden");
		//$("#sliderPages").toggleClass("hidden");
		//$("#tooltip").toggleClass("hidden");
		$("#panelReddit").toggleClass("panel-success");	
	});
	$("#buttonSentiment").click(function() {
		if ($("#buttonSentiment").attr('checked')) {
			$("#buttonSentiment").removeAttr('checked');
		} else {
			$("#buttonSentiment").attr('checked', 'checked');
		}		
		$("#checkSentiment").toggleClass("hidden");
		$("#sentimentSelected").toggleClass("hidden");
		//$("#sliderPages").toggleClass("hidden");
		//$("#tooltip").toggleClass("hidden");
		$("#panelSentiment").toggleClass("panel-success");	
	});	
	$("#buttonFacebook").click(function() {
		if ($("#buttonFacebook").attr('checked')) {
			$("#buttonFacebook").removeAttr('checked');
		} else {
			function myFacebookLogin() {
			  FB.login(function(){}, {scope: 'user_about_me'});
			}
			
			FB.getLoginStatus(function(response) {
			  if (response.status === 'connected') {
				  console.log("FB connected already");
				facebookAccessToken = response.authResponse.accessToken;
			  } 
			  else {
				  console.log("Trigger FB login");
				 myFacebookLogin();
			  }
			} );
			
			$("#buttonFacebook").attr('checked', 'checked');
		}		
		$("#checkFacebook").toggleClass("hidden");
		$("#panelFacebook").toggleClass("panel-success");
		$("#accessTokenForm").toggleClass("hidden");
	});

	$("#searchFBButton").click(function() {
		console.log("triggered");
		$.get("https://graph.facebook.com/search?q="+$("#findFBPage").val().split(' ').join('+')+"&type=page&access_token=" + facebookAccessToken, function(data) {
			//console.log(data);
			//console.log(data.data[0].id);
			//facebookPageID = data.data[0].id;
			addDropDown(data);
		});	
	});
	
	function addDropDown(data) {
		var htmlDropDown="";
		//console.log(data);
		//console.log($("#fbDropDown").length);
		if($('#fbDropDown').length) {
			console.log("TRIGG");
			$("#fbDropDown").remove();
		};
		htmlDropDown += '<select style="width:150px;float:right;margin-top:15px;" id="fbDropDown">';
		htmlDropDown += '<option value="" disabled selected>Select option</option>';
		$.each(data.data, function(index) {
			htmlDropDown += '<option id="select_'+ data.data[index].id +'" value="'+data.data[index].id+'">'+data.data[index].name+'</option>';
			// $("#select_"+data.data[index].id).click(function() {
				// console.log("TRIGGERED");
				// $("#accessToken").val(data.data[index].id);
			// });
		});
		
		htmlDropDown += '</select>';
		//console.log(htmlDropDown);
		
		$("#accessTokenForm").append(htmlDropDown);
		
		$("#fbDropDown").change(function() {
			//console.log("TRIGGERED");
			//$("#accessToken").val($("#fbDropDown").val());
			facebookSearchedPageID = $("#fbDropDown").val();
		});		
		
	}

		 
} );