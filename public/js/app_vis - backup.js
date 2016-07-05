
require( ['jquery',"./js/d3.min"], function ( $ ) {
  var config = {
    host: 'sgsin-jsn1.qliktech.com',
    isSecure: true
  };

 
qsocks.Connect(config).then(function(global) {

  //Open document Sales Discovery
  global.openDoc('6c88a5ac-f7ac-4438-8294-2b4b66a47aa5').then(function(app) {

  
    //Define our listbox definition.
    //Optional parameters has been omitted
    //Refer to documentation for a full list of properties
    //https://help.qlik.com/sense/en-us/developer/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/ListObjectDef.htm
    var obj = {
      "qInfo": {
        "qId": "LB05",
        "qType": "ListObject"
      },
      "qListObjectDef": {
        "qDef": {
          "qFieldDefs": [
            "[Search_Unique_id]"
          ],
          "qFieldLabels": [
            "[Search_Unique_id]"
          ]
        },
        "qInitialDataFetch": [{
          "qTop": 0,
          "qLeft": 0,
          "qHeight": 100,
          "qWidth": 1
        }]
      }
    };

    //Create the listbox as a session object which will persist over the session and then be deleted.
    app.createSessionObject(obj).then(function(list) {

      //List has been created and handle returned.
      //Get the layout of the listobject.
      list.getLayout().then(function(layout) {

		var searchIdArray =[];
		$(layout.qListObject.qDataPages[0].qMatrix).each(function( index ) {
			
			$.when($("#twitterFeed").append('<div id="'+layout.qListObject.qDataPages[0].qMatrix[index][0].qText+'"></div>')).then(function(id) {

			    var tweet = document.getElementById(layout.qListObject.qDataPages[0].qMatrix[index][0].qText);
				var id = layout.qListObject.qDataPages[0].qMatrix[index][0].qText;
			
				twttr.widgets.createTweet(
				  id, tweet, 
				  {
					conversation : 'none',    // or all
					cards        : 'visible',  // or visible 
					linkColor    : '#3c763d', // default is blue
					theme        : 'light'    // or dark
				  })
				.then (function (el) {
				  //el.contentDocument.querySelector(".footer").style.display = "none";
				});				
				
			});
  
		});

      })
    })
	
	getUserPostCountCube(app);

  })

});
   
   
   function getUserPostCountCube(app) {
	   app.createSessionObject({
		  qInfo: {
			qId: '',
			qType: 'myd3vis'
		  },
		  qHyperCubeDef: { 
			"qInitialDataFetch": [
				{
					"qHeight": 100,
					"qWidth": 2
				}
			],
			"qDimensions": [
				{
					"qDef": {
						"qFieldDefs": [
							"Search_user_name"
						]
					},
					"qNullSuppression": true,
					"qOtherTotalSpec": {
						"qOtherMode": "OTHER_COUNTED",
						"qSuppressOther": true,
						"qOtherSortMode": "OTHER_SORT_DESCENDING",
						"qOtherCounted": {
							"qv": "15"
						},
						"qOtherLimitMode": "OTHER_GE_LIMIT"
					}
				}
			],
			"qMeasures": [
				{
					"qDef": {
						"qDef": "Count(Search_id)"
					},
					"qLabel": "Count(Search_id)",
					"qLibraryId": null,
					"qSortBy": {
						"qSortByState": 0,
						"qSortByFrequency": 0,
						"qSortByNumeric": -1,
						"qSortByAscii": 0,
						"qSortByLoadOrder": 0,
						"qSortByExpression": 0,
						"qExpression": {
							"qv": " "
						}
					}
				}
			],
			"qSuppressZero": true,
			"qSuppressMissing": true,
			"qMode": "S",
			"qInterColumnSortOrder": [1,0],
			"qStateName": "$"
		  }
		})
		.then(model => {
			
		  model.getLayout().then(layout => {

			///code here

			createTable(model, layout, "chartone");
				 
		  });

		  model.on('change', () => {
			//console.log("fired");
			model.getLayout().then(layout => {
			   //console.log(layout);
			   //createTable(model, layout, "chartone");
			   
			   //pubsub.publish('update');
			   
			})
		  });

		})
	   
   }

  	 
});


function createTable(model, layout, pageElement) {
	
			var data = layout.qHyperCube.qDataPages[0].qMatrix.map(function(d) {
				return {
					"Dim1":d[0].qText,
					"Metric1":d[1].qNum,
					"DimElem":d[0].qElemNumber
				}				
			});
				//console.log(data);

			var maxVal = (data[0].Metric1);
				
				//console.log(data);
				
			$("#" + pageElement).empty();
			
			$("#" + pageElement).append('<table class="EmbeddedTweet" id='+pageElement+'_table></table>');
			
			data.forEach(function(d, i) {
				
				$("#" + pageElement+"_table").append('<tr id='+pageElement+'_'+d.DimElem+' data-element='+d.DimElem+'><td class="qlikchartlabel" style="width:175px;">'+ d.Dim1 +'</td><td id="'+pageElement+'_table_bar'+i+'"style="width:250px;"></td><td class="qlikchartlabel" style="width:50px;text-align:right;">'+d.Metric1+'</td></tr>');
				$("#"+pageElement+"_table_bar"+i).append('<div class="qlikbarprogress"><div class="qlikbarprogress-bar progress-bar-success" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: '+d.Metric1/maxVal*100+'%"><span class="sr-only">40% Complete (success)</span></div></div>');			

			});
			$("#"+pageElement).click(function(e) {
				//console.log(e);
				var selectValue = e.target.className.substring(0,15)==='qlikbarprogress' ? e.target.parentElement.parentElement.parentElement.attributes[1].value : e.target.parentElement.attributes[1].value;
				//console.log(model);
				model.selectHyperCubeValues('/qHyperCubeDef',0, [parseInt(selectValue)], true).then(function(success) {
					pubsub.publish('update');
				});

				
			});
}

	  var update = pubsub.subscribe('update', render);
	  pubsub.subscribe('kill', function() {
	    pubsub.unsubscribe(update)
	  });

