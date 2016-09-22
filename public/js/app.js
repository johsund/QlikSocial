require( ['jquery'], function ( $ ) {

var qlikHost = 'sgsin-jsn1.qliktech.com';
var qlikVirtualProxy = 'ticket';
var qlikWebConnectorHost = 'localhost';

var qsTicket;

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
					$("#previous-searches").append('<div border="0px"><div style="display:inline-block;width:90%;"><a href="#" style="padding: 0px 15px;" class="list-group-item" id="' + doc.qDocId + '"><h4>' + doc.qDocName.substring(11, doc.qDocName.indexOf('-201')) + '</h4><h6>'+doc.qDocName.substring(doc.qDocName.length - 10)+'</h5></a></div><div style="display:inline-block;float:right;padding-top:20px;"><i class="fa fa-trash-o fa-2" id="'+ 'del_' + doc.qDocId +'" aria-hidden="true" style="display:inline;padding:0px;font-size:20px;cursor:pointer;"></i></div></div>');
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

	
	$("#searchButton").click(function() {

		create(global);
	});	
	
  });
  
function create(global) {

	//appinfo = app;

	var d = new Date(Date.now());
	//var msg = msg;
	var date = new Date();
	var datestr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toJSON().slice(0, 10)
	var appname = 'QlikSocial' + '-' + $("#searchObject").val() + '-' + datestr;
	
	//console.log('&maxNoPages='+$("#tooltip").text()+'&appID=');
	




	//var hasLabels = msg.header === true ? 'embedded labels' : 'no labels';
	//var transpose = msg.transpose === true ? ' ,filters(Transpose()) ' : '';

	var twitter = true;
	
	loadscript = "";
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
		
		connectionTwitter = {
			qName: 'QlikSocial Twitter' + ' ' + Date.now(),
			qConnectionString: 'http://'+qlikWebConnectorHost+':5555/data?connectorID=TwitterConnector&table=Search&searchTerm=' + $("#searchObject").val().split(' ').join('+') + localTweets + '&count=100&maxNoPages='+$("#tooltip").text()+'&appID=',
			qType: 'internet'
		};	
		loadscript += appendTwitter(loadscript);		
		//console.log(connectionTwitter);
		}
	if($("#buttonReddit").attr('checked')) {
		sourceCounter += 1;
		
		connectionReddit = {
			qName: 'QlikSocial Reddit' + ' ' + Date.now(),
			qConnectionString: 'http://'+qlikWebConnectorHost+':5555/data?connectorID=WebConnector&table=JsonToXmlRaw&url=http%3a%2f%2fwww.reddit.com%2fsearch.json%3fq%3d' + $("#searchObject").val().split(' ').join('+') + '%26sort%3drelevance%26limit%3d100&appID=',
			qType: 'internet'
		};		
		loadscript += appendReddit(loadscript);		
		//console.log(connectionReddit);
		}
	//if(sourceCounter>1) {
		$(".container").fadeTo( "slow" , 0.5, function() {
		// Animation complete.
		});
		//console.log("Twitter checked");
	
	$(document.getElementById('body')).append('<div id="qlikProgress" class="qlikProgress" style="width:350px; height:220px;opacity:1;"></div>');
	$(document.getElementById('qlikProgress')).append('<div style="height:20px;background-color:#eeeeee;margin-bottom:10px;" id="progressBox"><div class="progress-bar progress-bar-success" id="progressBar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 10%;background-image:linear-gradient(to bottom,#9FD888 0,#8FBF7C 100%);"><span class="sr-only">10% Complete</span></div></div>');

	
	
///*	
	createAndOpen(global, appname)
		.then(createConnectionTwitter)
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

function createConnectionTwitter(handle) {
	if($("#buttonTwitter").attr('checked')) {
		//console.log(handle);
		$(document.getElementById('qlikProgress')).append('<p>- Creating Data Connection(s)</p>');
		$(document.getElementById('progressBar')).width('20%');
		return new Promise(function(resolve, reject) {
			handle.createConnection(connectionTwitter).then(function() {
				if($("#buttonReddit").attr('checked')) {
					handle.createConnection(connectionReddit);
				}
				return resolve(handle);
			}, function(error) {
				return reject(error);
			})
		})
	}
	else {
		//return 0;
	}
};

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
	//console.log(loadscript);
	$(document.getElementById('qlikProgress')).append('<p>- Setting Load Script</p>');
	$(document.getElementById('progressBar')).width('40%');
	return new Promise(function(resolve, reject) {
		handle.getScript().then(function(script) {
			script += ('\r\n' + loadscript);
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

function appendTwitter(loadscript) {
	loadscript += "\r\nTwitterConnectorV2_Search:";
	loadscript += "\r\nLOAD";
	loadscript += "\r\n    'Twitter' as datasource,";
	loadscript += "\r\n    id as Search_id,";
	loadscript += "\r\n    created_at as Search_created_at,";
	loadscript += "\r\n    timestamp#(mid(created_at, 9, 2) & '-' & mid(created_at, 5, 3) & '-' & mid(created_at, 27, 4) & ' ' & mid(created_at, 12, 8), 'DD-MMM-YYYY hh:mm:ss') as Search_created_at_timestamp,";
	loadscript += "\r\n    date#(mid(created_at, 9, 2) & '-' & mid(created_at, 5, 3) & '-' & mid(created_at, 27, 4), 'DD-MMM-YYYY') as Search_created_at_date,";
	loadscript += "\r\n    time#(mid(created_at, 12, 8), 'hh:mm:ss') as Search_created_at_time,";
	loadscript += "\r\n    hour(time#(mid(created_at, 12, 8), 'hh:mm:ss')) as hour,";
	loadscript += "\r\n    text as Search_text,";
	loadscript += "\r\n    if(left(text,2)<>'RT', id) as Search_Unique_id,";
	loadscript += "\r\n    text_urlEncoded as Search_text_urlEncoded,";
	loadscript += "\r\n    lang as Search_lang,";
	loadscript += "\r\n    source as Search_source,";
	loadscript += "\r\n    truncated as Search_truncated,";
	loadscript += "\r\n    in_reply_to_screen_name as Search_in_reply_to_screen_name,";
	loadscript += "\r\n    in_reply_to_status_id as Search_in_reply_to_status_id,";
	loadscript += "\r\n    in_reply_to_user_id as Search_in_reply_to_user_id,";
	loadscript += "\r\n    retweet_count as Search_retweet_count,";
	loadscript += "\r\n    favorite_count as Search_favorite_count,";
	loadscript += "\r\n    retweeted as Search_retweeted,";
	loadscript += "\r\n    favorited as Search_favorited,";
	loadscript += "\r\n    possibly_sensitive as Search_possibly_sensitive,";
	loadscript += "\r\n    hashtag_count as Search_hashtag_count,";
	loadscript += "\r\n    hash_tags as Search_hash_tags,";
	loadscript += "\r\n    first_hash_tag as Search_first_hash_tag,";
	loadscript += "\r\n    if(first_hash_tag<>'' and first_hash_tag<>'undefined', first_hash_tag) as Search_first_hash_tag_clean,";
	loadscript += "\r\n    url_count as Search_url_count,";
	loadscript += "\r\n    expanded_urls as Search_expanded_urls,";
	loadscript += "\r\n    first_expanded_url as Search_first_expanded_url,";
	loadscript += "\r\n    user_mentions_count as Search_user_mentions_count,";
	loadscript += "\r\n    user_mentions as Search_user_mentions,";
	loadscript += "\r\n    first_user_mention as Search_first_user_mention,";
	loadscript += "\r\n    media_count as Search_media_count,";
	loadscript += "\r\n    media_expanded_urls as Search_media_expanded_urls,";
	loadscript += "\r\n    first_media_expanded_url as Search_first_media_expanded_url,";
	loadscript += "\r\n    symbols_count as Search_symbols_count,";
	loadscript += "\r\n    symbols as Search_symbols,";
	loadscript += "\r\n    first_symbol as Search_first_symbol,";
	loadscript += "\r\n    media_photo_count as Search_media_photo_count,";
	loadscript += "\r\n    media_photo_urls as Search_media_photo_urls,";
	loadscript += "\r\n    first_media_photo_url as Search_first_media_photo_url,";
	loadscript += "\r\n    metadata_result_type as Search_metadata_result_type,";
	loadscript += "\r\n    metadata_iso_language_code as Search_metadata_iso_language_code,";
	loadscript += "\r\n    user_id as Search_user_id,";
	loadscript += "\r\n    user_name as Search_user_name,";
	loadscript += "\r\n    user_screen_name as Search_user_screen_name,";
	loadscript += "\r\n    user_location as Search_user_location,";
	loadscript += "\r\n    user_profile_image_url as Search_user_profile_image_url,";
	loadscript += "\r\n    user_description as Search_user_description,";
	loadscript += "\r\n    user_url as Search_user_url,";
	loadscript += "\r\n    user_geo_enabled as Search_user_geo_enabled,";
	loadscript += "\r\n    user_protected as Search_user_protected,";
	loadscript += "\r\n    user_followers_count as Search_user_followers_count,";
	loadscript += "\r\n    user_friends_count as Search_user_friends_count,";
	loadscript += "\r\n    user_listed_count as Search_user_listed_count,";
	loadscript += "\r\n    user_favourites_count as Search_user_favourites_count,";
	loadscript += "\r\n    user_statuses_count as Search_user_statuses_count,";
	loadscript += "\r\n    user_created_at as Search_user_created_at,";
	loadscript += "\r\n    timestamp#(mid(user_created_at, 9, 2) & '-' & mid(user_created_at, 5, 3) & '-' & mid(user_created_at, 27, 4) & ' ' & mid(user_created_at, 12, 8), 'DD-MMM-YYYY hh:mm:ss') as Search_user_user_created_at_timestamp,";
	loadscript += "\r\n    date#(mid(user_created_at, 9, 2) & '-' & mid(user_created_at, 5, 3) & '-' & mid(user_created_at, 27, 4), 'DD-MMM-YYYY') as Search_user_user_created_at_date,";
	loadscript += "\r\n    time#(mid(user_created_at, 12, 8), 'hh:mm:ss') as Search_user_user_created_at_time,";
	loadscript += "\r\n    user_utc_offset as Search_user_utc_offset,";
	loadscript += "\r\n    user_time_zone as Search_user_time_zone,";
	loadscript += "\r\n    user_verified as Search_user_verified,";
	loadscript += "\r\n    user_lang as Search_user_lang,";
	loadscript += "\r\n    user_follow_request_sent as Search_user_follow_request_sent,";
	loadscript += "\r\n    user_is_translator as Search_user_is_translator,";
	loadscript += "\r\n    user_name as UserName,";
	loadscript += "\r\n    user_notifications as Search_user_notifications";
	loadscript += "\r\nFROM [lib://" + connectionTwitter.qName + "] (qvx) where possibly_sensitive='false';";
	
	return loadscript;
}

function appendReddit(loadscript) {
	loadscript += "\r\nRedditSearch:";
	loadscript += "\r\nLOAD";
	loadscript += "\r\n    'Reddit' as datasource,";
	loadscript += "\r\n    [data/name] as Search_id,";
	loadscript += "\r\n    [data/created] as Search_created_at,";
	loadscript += "\r\n    timestamp([data/created]/ 86400 + 25569, 'DD-MMM-YYYY hh:mm:ss') as Search_created_at_timestamp,";
	loadscript += "\r\n    date(floor([data/created]/ 86400 + 25569), 'DD-MMM-YYYY') as Search_created_at_date,";
	loadscript += "\r\n    time(frac([data/created]/ 86400 + 25569), 'hh:mm:ss') as Search_created_at_time,";
	loadscript += "\r\n    hour(time(frac([data/created]/ 86400 + 25569), 'hh:mm:ss')) as hour,";
	loadscript += "\r\n    [data/title] as Search_text,";
	loadscript += "\r\n    if(left(text,2)<>'RT', [data/name]) as Search_Unique_id,";
	loadscript += "\r\n    [data/selftext_html] as Search_text_urlEncoded,";
	loadscript += "\r\n    'en' as Search_lang,";
	loadscript += "\r\n    [data/subreddit_id] as Search_source,";
	loadscript += "\r\n    [data/subreddit] as Search_truncated,";
	loadscript += "\r\n    '' as Search_in_reply_to_screen_name,";
	loadscript += "\r\n    '' as Search_in_reply_to_status_id,";
	loadscript += "\r\n    '' as Search_in_reply_to_user_id,";
	loadscript += "\r\n    [data/num_comments] as Search_retweet_count,";
	loadscript += "\r\n    [data/url] as Search_favorite_count,";
	loadscript += "\r\n    '' as Search_retweeted,";
	loadscript += "\r\n    '' as Search_favorited,";
	loadscript += "\r\n    [data/over_18] as Search_possibly_sensitive,";
	loadscript += "\r\n    '' as Search_hashtag_count,";
	loadscript += "\r\n    '' as Search_hash_tags,";
	loadscript += "\r\n    '' as Search_first_hash_tag,";
	loadscript += "\r\n    '' as Search_first_hash_tag_clean,";
	loadscript += "\r\n    '' as Search_url_count,";
	loadscript += "\r\n    '' as Search_expanded_urls,";
	loadscript += "\r\n    '' as Search_first_expanded_url,";
	loadscript += "\r\n    '' as Search_user_mentions_count,";
	loadscript += "\r\n    '' as Search_user_mentions,";
	loadscript += "\r\n    '' as Search_first_user_mention,";
	loadscript += "\r\n    '' as Search_media_count,";
	loadscript += "\r\n    '' as Search_media_expanded_urls,";
	loadscript += "\r\n    [data/preview/images/source/url] as Search_first_media_expanded_url,";
	loadscript += "\r\n    '' as Search_symbols_count,";
	loadscript += "\r\n    '' as Search_symbols,";
	loadscript += "\r\n    '' as Search_first_symbol,";
	loadscript += "\r\n    '' as Search_media_photo_count,";
	loadscript += "\r\n    '' as Search_media_photo_urls,";
	loadscript += "\r\n    [data/preview/images/source/url] as Search_first_media_photo_url,";
	loadscript += "\r\n    '' as Search_metadata_result_type,";
	loadscript += "\r\n    'en' as Search_metadata_iso_language_code,";
	loadscript += "\r\n    '' as Search_user_id,";
	loadscript += "\r\n    [data/selftext] as Search_user_name,";
	loadscript += "\r\n    [data/author] as Search_user_screen_name,";
	loadscript += "\r\n    '' as Search_user_location,";
	loadscript += "\r\n    '' as Search_user_profile_image_url,";
	loadscript += "\r\n    '' as Search_user_description,";
	loadscript += "\r\n    '' as Search_user_url,";
	loadscript += "\r\n    '' as Search_user_geo_enabled,";
	loadscript += "\r\n    '' as Search_user_protected,";
	loadscript += "\r\n    '' as Search_user_followers_count,";
	loadscript += "\r\n    '' as Search_user_friends_count,";
	loadscript += "\r\n    '' as Search_user_listed_count,";
	loadscript += "\r\n    '' as Search_user_favourites_count,";
	loadscript += "\r\n    '' as Search_user_statuses_count,";
	loadscript += "\r\n    '' as Search_user_created_at,";
	loadscript += "\r\n    '' as Search_user_user_created_at_timestamp,";
	loadscript += "\r\n    '' as Search_user_user_created_at_date,";
	loadscript += "\r\n    '' as Search_user_user_created_at_time,";
	loadscript += "\r\n    '' as Search_user_utc_offset,";
	loadscript += "\r\n    '' as Search_user_time_zone,";
	loadscript += "\r\n    '' as Search_user_verified,";
	loadscript += "\r\n    'en' as Search_user_lang,";
	loadscript += "\r\n    '' as Search_user_follow_request_sent,";
	loadscript += "\r\n    '' as Search_user_is_translator,";
	loadscript += "\r\n    [data/author] as UserName,";
	loadscript += "\r\n    '' as Search_user_notifications";
	loadscript += "\r\nFROM [lib://" + connectionReddit.qName + "]  (XmlSimple, Table is [DATA/data/children]);";
	
	return loadscript;
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
	$("#buttonLinkedIn").click(function() {
		$("#checkLinkedIn").toggleClass("hidden");
		$("#panelLinkedIn").toggleClass("panel-success");
	});	

		 
} );