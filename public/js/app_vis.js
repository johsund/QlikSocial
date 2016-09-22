
require( ['jquery'], function ( $ ) {

var qlikHost = 'sgsin-jsn1.qliktech.com';
var qlikVirtualProxy = 'ticket';

  var config = {
    host: qlikHost,
	prefix: qlikVirtualProxy,
	rejectUnauthorized: false,
    isSecure: true
  };

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

 
qsocks.Connect(config).then(function(global) {

global.getDocList().then(function(docList) {
		docList.forEach(function(doc) {
			if(doc.qDocId==getUrlParameter('app')) {
				$('#searchTerms').css('textTransform', 'capitalize');
				$("#searchTerms").append(doc.qDocName.substring(11, doc.qDocName.length-11));
			}
		});
});
  //Open document Sales Discovery
  global.openDoc(getUrlParameter('app')).then(function(app) {

  
	//Setting up search
	senseSearch.connectWithQSocks(app); 
	var inputOptions = {          
	  "searchFields": ["Search_text"],
	  "suggestFields": ["Search_text"]
	}
	senseSearch.inputs["myInput"].attach(inputOptions);
	senseSearch.searchResults.subscribe(function(){
   //do stuff
	pubsub.publish('update');
	})
	//End Search
	
	
	//getUserPostCountCube(app);
		/**
		 * Sidebar Content Table
		 */
		 
		
		
		/* Clear selections in filters */
		$('#clearfilter').on('click', function() {
		  var $this = $(this);
		  $('#qv-search-clear').hide();
		  $('#qv-search').val('');
		  app.clearAll().then(function() {
			//trigger a update
			pubsub.publish('update');
		  })
		});		
		
		// $('#searchButton').on('click', function() {
			// console.log("Searched");
			// var searchString = $("#searchObject").val();
			// console.log(searchString);
			// SearchStuff("Search_text", searchString);
		// });
		
		//console.log("Test");
		var chartone = new Table([{
		  'dim': 'UserName',
		  'label': 'User Name'
		}], {
		  'label': 'Posts',
		  'value': '=Count(distinct Search_id)'
		}, document.getElementById('chartone'));
		
		
		var charttwo = new Table([{
		  'dim': '=if(len(Search_first_hash_tag_clean)<>0,Search_first_hash_tag_clean)',
		  'label': 'Hash Tag'
		}], {
		  'label': 'Posts',
		  'value': '=Count(distinct Search_id)'
		}, document.getElementById('charttwo'));		
		
		var chartthree = new D3Bar([{
		  'dim': 'hour',
		  'label': 'Hour'
		}], {
		  'label': 'Posts',
		  'value': '=Count(distinct Search_id)'
		}, document.getElementById('chartthree'));	
		//console.log(chartone);
		//console.log(chartone);
		
		// var chartfour = new D3Bar([{
		  // 'dim': 'datasource',
		  // 'label': 'Post Source'
		// }], {
		  // 'label': 'Posts',
		  // 'value': '=Count(distinct Search_id)'
		// }, document.getElementById('chartfour'));		

		var chartfive= new Table([{
		  'dim': '=class(aggr(avg(Search_user_followers_count), Search_user_id),5000)',
		  'label': 'Follower Count'
		}], {
		  'label': ' ',
		  'value': 'count(distinct Search_user_id)'
		}, document.getElementById('chartfive'), 'dim');
		
		var chartsix= new Table([{
		  'dim': '=if(len(Search_first_user_mention)<>0,Search_first_user_mention)',
		  'label': 'Users mentioned'
		}], {
		  'label': '# of posts',
		  'value': 'count(distinct Search_id)'
		}, document.getElementById('chartsix'));		

		var chartseven = new D3Scatter([{
		  'dim': 'UserName',
		  'label': 'User Name'
		}], [{
		  'label': 'Followers',
		  'value': '=Max(Search_user_followers_count)'
		},{
		  'label': 'Retweet Count',
		  'value': '=Sum(Search_retweet_count)'
		}], document.getElementById('chartseven'));
		
		//chartfour
		
		var user = new Filter('Search_user_screen_name', 'User Name', document.getElementById('filterPane'));
		var hashtag = new Filter('Search_first_hash_tag', 'Hash Tag', document.getElementById('filterPane'));
		var datasource = new Filter('datasource', 'Web Source', document.getElementById('filterPane'));
		var language = new Filter('Search_lang', 'Language', document.getElementById('filterPane'));
		//var usergeo = new MapUsers('Search_user_location', 'User Location', 'count(distinct Search_id)', document.getElementById('chartseven'));
		
		var contenttable = new ContentTable(['datasource', 'Search_user_name', 'Search_created_at_timestamp', 'Search_text', 'Search_user_screen_name', 'Search_id', 'Search_favorite_count', 'Search_retweet_count', 'Search_first_media_photo_url'], $('twitterFeed'));
 
		//var searchThings = new SearchStuff();
/**
 * Generic three column table
 * Dimension, Inline Bar Chart, Value
 */

function Table(dimensions, expression, element, sorting) {

	var sort, interSortOrder;
	interSortOrder = [1,0]; //sort by measure first by default
	if (typeof sorting === 'undefined') { sort = {
					"qSortByNumeric": -1
				}; }

	if (sorting === 'dim') {sort = {
    "qSortByAscii": 1
  };
  interSortOrder = [0,1]}; //if sorting parameter is set to 'dim' then sort by dimension before measure
  
		
	//console.log("table fired");
	var cube, max;

	var dimensionList = dimensions.map(function(d) {
		return {
			"qNullSuppression": true,
			"qDef": {
				"qFieldDefs": [d.dim],
				"qFieldLabels": [d.label],
				"qSortCriterias": [sort]
			}
		}
	});

	//console.log(dimensionList);
	/**
	 * Qlik Sense Object
	 * https://help.qlik.com/sense/2.0/en-us/developer/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/HyperCubeDef.htm
	 * 
	 * Returns promise which calls render() once resolved.
	 */
	app.createSessionObject({
		"qInfo": {
			"qId": "",
			"qType": "HyperCube"
		},
		"qHyperCubeDef": {
			"qDimensions": dimensionList,
			"qMeasures": [{
				"qLibraryId": "",
				"qSortBy": {
					//"qSortByAscii":-1
					"qSortByNumeric": -1
				},
				"qDef": {
					"qLabel": expression.label,
					"qDescription": "",
					"qDef": expression.value
				}
			}],
			"qSuppressMissing": true,
			"qSuppressZero": true,
			"qInterColumnSortOrder": interSortOrder,//[1, 0],
			"qInitialDataFetch": [{
				qTop: 0,
				qLeft: 0,
				qHeight: 15,
				qWidth: dimensionList.length + 1
			}]
		}
	}).then(function(reply) {
		cube = reply;
		//console.log(cube);
		render();
	});

	function render() {
		/**
		 * Fetch Layout/Data
		 */
		cube.getLayout().then(function(layout) {
			$(element).empty();

			/**
			 * No Data available - return error.
			 */
			if(layout.qHyperCube.qDataPages[0].qMatrix[0][0].qIsEmpty) {
				return $('<p>No Mentions Available</p>').appendTo($(element));
			};

			var $table = $('<table class="three-col-table" />');
			var $thead = createHeader(layout);
			var $tbody = $('<tbody />');

			max = d3.max(layout.qHyperCube.qDataPages[0].qMatrix, function(d) {
				return d[1].qNum;
			});

			layout.qHyperCube.qDataPages[0].qMatrix.forEach(function(d) {
				//console.log(d[0]);
				//if(d[0].hasOwnProperty('qText')) {
					 var row = createRow(d);
					 row.appendTo($tbody);					
				//}
				//else{
//					console.log(d[0].qText.length);
				//console.log("no dim");
				//}
				
			});

			$thead.appendTo($table)
			$tbody.appendTo($table)
			$table.appendTo($(element));

		}, function(error) {
			console.log(error)
		});
	}

	/**
	 * Constructs a row and returns a jQuery object.
	 * Accepts a Qlik Sense data row.
	 */
	function createRow(d) {

		//console.log(d);
		var perc = (d[1].qNum / max) * 100;

		var $row = $('<tr/>');
		$('<td id="' + d[0].qElemNumber + '" class="col col1">' + d[0].qText + '</td>').click(function(event) {
			select(+$(this).attr('id'));
		}).appendTo($row);
		$('<td class="col col2" style="width:175px;"><div class="qlikbarprogress"><div class="qlikbarprogress-bar" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: '+perc+'%"><span class="sr-only">40% Complete (success)</span></div></div></td>').appendTo($row);
		$('<td class="col col3">' + d[1].qNum + '</td>').appendTo($row);

		return $row;
	}

	/**
	 * Creates the Header Row. Returns a jQuery object
	 * Accepts a Qlik Sense object layout
	 */
	function createHeader(layout) {

		var columns = [],
			$thead = $('<thead />');

		layout.qHyperCube.qDimensionInfo.forEach(function(d) {
			columns.push(capitalizeFirstLetter(d.qFallbackTitle));
		})

		columns.push(layout.qHyperCube.qMeasureInfo[0].qFallbackTitle);

		columns.forEach(function(d, i) {
			if (i == 1) {
				$('<th colspan="2" class="col col' + (i + 1) + '">' + d + '</th>').appendTo($thead);
			} else {
				$('<th class="col col' + (i + 1) + '">' + d + '</th>').appendTo($thead);
			}
		})
		return $thead;
	}

	/**
	 * Select a value in the Qlik Sense Data Model.
	 * Will trigger a update message to notify other objects to update accordingly.
	 */
	function select(qElem) {
		cube.selectHyperCubeValues('/qHyperCubeDef', 0, [qElem], true).then(function(success) {
			pubsub.publish('update');
		})
	}

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	  /**
	   * Listen for messages and delegate actions.
	   */
	  var update = pubsub.subscribe('update', render);
	  pubsub.subscribe('kill', function() {
	    pubsub.unsubscribe(update)
	  });

}; //////  End of function Table


 

/**
 * jQuery plugin to toggle visibility on filter counters
 */
(function($) {
    $.fn.invisible = function() {
        return this.each(function() {
            $(this).css("visibility", "hidden");
        });
    };
    $.fn.visible = function() {
        return this.each(function() {
            $(this).css("visibility", "visible");
        });
    };
}(jQuery));


function Filter(field, label, element, shouldsearch) {

  var list;
  var listId;
  var $el = element;
  var existsInDOM = false;
  var selectedState = false;
  var openState = false;
  var searchable = shouldsearch || false;
  var labeltrim = label.replace(/\s+/g, '').replace(/\./g, '');

  /**
   * Filter HTML template
   */
  var tmpl = '<div id="' + labeltrim + '" data-field="' + field + '" class="filter expanded" style="overflow-y:hidden;">';
  tmpl += '<div class="title">' + label;
  tmpl += '  <div class="right"><div class="count"></div><img src="static/img/toggle.svg"></div>';
  tmpl += '</div>';
  tmpl += '<div class="items"></div>';
  tmpl += '</div>';

  var $div = existsInDOM ? $('#' + labeltrim) : $(tmpl);
  var $items = $div.find('.items');
  var $title = $div.find('.title');
  var $count = $div.find('.count');

  /**
   * Expand Filter on click.
   */
  $title.on('click', function() {
    $(this).parent().toggleClass('expanded')
  });

  /**
   * Sort Filters alphabetically unless it's a date filter.
   */
  var sort = field == 'DateRange' ? {
    "qSortByNumeric": 1
  } : {
    "qSortByState": 1,
    "qSortByAscii": 1
  };

  /**
   * Create the Qlik Sense Object
   * https://help.qlik.com/sense/2.0/en-us/developer/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/ListObjectDef.htm
   * 
   * Returns a promise which will call render once it's fulfilled.
   */
  app.createSessionObject({
    "qInfo": {
      "qId": "",
      "qType": "ListObject"
    },
    "qListObjectDef": {
      "qLibraryId": "",
      "qShowAlternatives": true,
      "qDef": {
        "qFieldDefs": [field],
        "qSortCriterias": [sort]
      },
      "qInitialDataFetch": [{
        "qTop": 0,
        "qHeight": 800,
        "qLeft": 0,
        "qWidth": 1
      }]
    }
  }).then(function(reply) {
    list = reply;
    render();
  });

  function render() {
    /**
     * Get the layout/data of the List Object
     */
    list.getLayout().then(function(layout) {
      
      listId = layout.qInfo.qId; 
       
      $items.find('ul').remove();
      
      var items = layout.qListObject.qDataPages[0].qMatrix;
      var selected = layout.qListObject.qDimensionInfo.qStateCounts.qSelected;

		//console.log(items);
      /**
       * Show/Hide selected counter based on data
       */
      if (selected > 0) {
        selectedState = true;
        $count.visible().text(selected + ' of ' + layout.qListObject.qSize.qcy);
      } else {
        selectedState = false;
        $count.invisible();
      }

      /**
       * Append list items, data-elem contains the Qlik Sense Index to be selected on the data model on click.
       */
      var $ul = $('<ul class="list" />');
      $ul.html(items.map(function(d) {
		  var itemSelected = ""; //d[0].qState == "S" ? "list-group-item-success" : "";
        return '<li data-elem="' + d[0].qElemNumber + '" class="' + d[0].qState + ' listitem ' + itemSelected +'"><p class="value">' + d[0].qText + '</p></li>'
      }));

      $ul.find('li:not(.x)').on('click', function() {
        select($(this).attr('data-elem'))
		//$(this).addClass("list-group-item-success");
      })

      $ul.appendTo($items);
      if (!existsInDOM) {
        $div.appendTo(element);
        existsInDOM = true;
      };
      
      /**
       * If Filter should be searchable instanciate List.js
       */
      if(searchable) searchList();
      $('div#search-nohits').hide()
      $('input.search').val('')

    });
  };

  /**
   * Set up searchable lists using List.js
   */
  function searchList() {
    if($('#' + labeltrim).find('.search').length === 0 ) {
      $('#' + labeltrim).find('.items').before('<input class="search" placeholder="Search list"/>')
    }

    var s = new List(document.getElementById(labeltrim), {
      valueNames: ['value']
    });
  };

  /**
   * Select a value in the Qlik Sense Data Model.
   * Will trigger a update message to notify other objects to update accordingly.
   */
  function select(qElem) {
    list.selectListObjectValues("/qListObjectDef", [+qElem], field == 'DateRange' ? false : true, false).then(function(success) {
      $('#clearfilter').addClass('active');
      pubsub.publish('update');
    }, function(error) {
      console.log(error);
    });
  }

  /**
   * Listen for messages and delegate actions.
   */
  var update = pubsub.subscribe('update', render);
  pubsub.subscribe('kill', function() {
    app.destroySessionObject(listId);
    pubsub.unsubscribe(update);
  });
  
}; //////// end of function Filter
 
function D3Bar(dimensions, expression, element) {

	//console.log("D3Bar fired");
	var cube, max;

	var dimensionList = dimensions.map(function(d) {
		return {
			"qNullSuppression": true,
			"qDef": {
				"qFieldDefs": [d.dim],
				"qFieldLabels": [d.label],
				"qSortCriterias": [{
					"qSortByAscii": 1
				}]
			}
		}
	});

	//console.log(dimensionList);
	/**
	 * Qlik Sense Object
	 * https://help.qlik.com/sense/2.0/en-us/developer/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/HyperCubeDef.htm
	 * 
	 * Returns promise which calls render() once resolved.
	 */
	app.createSessionObject({
		"qInfo": {
			"qId": "",
			"qType": "HyperCube"
		},
		"qHyperCubeDef": {
			"qDimensions": dimensionList,
			"qMeasures": [{
				"qLibraryId": "",
				"qSortBy": {
					"qSortByAscii": 0
				},
				"qDef": {
					"qLabel": expression.label,
					"qDescription": "",
					"qDef": expression.value
				}
			}],
			"qSuppressMissing": true,
			"qSuppressZero": true,
			"qInterColumnSortOrder": [0, 1],
			"qInitialDataFetch": [{
				qTop: 0,
				qLeft: 0,
				qHeight: 50,
				qWidth: dimensionList.length + 1
			}]
		}
	}).then(function(reply) {
		cube = reply;
		//console.log(cube);
		render();
	});

	function render() {
		/**
		 * Fetch Layout/Data
		 */
		cube.getLayout().then(function(layout) {
			$(element).empty();

		//console.log(layout.qHyperCube.qDataPages[0].qMatrix.length);
		var data = layout.qHyperCube.qDataPages[0].qMatrix;
//		console.log(data);

			var calcWidth = layout.qHyperCube.qDataPages[0].qMatrix.length < 5 ? 300 : layout.qHyperCube.qDataPages[0].qMatrix.length*30;

			$(element).width(calcWidth);

			var margin = {top: 20, right: 20, bottom: 30, left: 40},
				width = calcWidth - margin.left - margin.right,
				height = $(element).height() - margin.top - margin.bottom;

			var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], .1);

			var y = d3.scale.linear()
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.ticks(10, "");

			var svg = d3.select(element).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


			x.domain(data.map(function(d) { return d[0].qText; }));
			y.domain([0, d3.max(data, function(d) { return d[1].qNum; })]);

			  svg.append("g")
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + height + ")")
				  .call(xAxis);

			  svg.append("g")
				  .attr("class", "y axis")
				  .call(yAxis)
				.append("text")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", ".71em")
				  .style("text-anchor", "end")
				  .text("# of Posts");

			  svg.selectAll(".bar")
				  .data(data)
				.enter().append("rect")
				  .attr("class", "bar")
				  .attr("x", function(d) { return x(d[0].qText); })
				  .attr("width", x.rangeBand())
				  .attr("y", function(d) { return y(d[1].qNum); })
				  .attr("data-elem", function(d) { return d[0].qElemNumber })
				  .attr("height", function(d) { return height - y(d[1].qNum); })
				  .on("click",function(d) {
					select(d[0].qElemNumber);
				  });
		
		}, function(error) {
			console.log(error)
		});
	}

	/**
	 * Select a value in the Qlik Sense Data Model.
	 * Will trigger a update message to notify other objects to update accordingly.
	 */
	function select(qElem) {
		console.log("selection triggered");
		cube.selectHyperCubeValues('/qHyperCubeDef', 0, [qElem], true).then(function(success) {
			pubsub.publish('update');
		})
	}

	  /**
	   * Listen for messages and delegate actions.
	   */
	  var update = pubsub.subscribe('update', render);
	  pubsub.subscribe('kill', function() {
	    pubsub.unsubscribe(update)
	  });

}; 
//////  End of function D3Bar
 
 function D3Scatter(dimensions, expression, element) {

	//console.log("D3Bar fired");
	var cube, max;
	
	//console.log(expression);

	var dimensionList = dimensions.map(function(d) {
		return {
			"qNullSuppression": true,
			"qDef": {
				"qFieldDefs": [d.dim],
				"qFieldLabels": [d.label],
				"qSortCriterias": [{
					"qSortByAscii": 1
				}]
			}
		}
	});

	//console.log(dimensionList);
	/**
	 * Qlik Sense Object
	 * https://help.qlik.com/sense/2.0/en-us/developer/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/HyperCubeDef.htm
	 * 
	 * Returns promise which calls render() once resolved.
	 */
	app.createSessionObject({
		"qInfo": {
			"qId": "",
			"qType": "HyperCube"
		},
		"qHyperCubeDef": {
			"qDimensions": dimensionList,
			"qMeasures": [{
				"qLibraryId": "",
				"qSortBy": {
					"qSortByAscii": 0
				},
				"qDef": {
					"qLabel": expression[0].label,
					"qDescription": "",
					"qDef": expression[0].value
				}
			},
			{
				"qLibraryId": "",
				"qSortBy": {
					"qSortByAscii": 0
				},
				"qDef": {
					"qLabel": expression[1].label,
					"qDescription": "",
					"qDef": expression[1].value
				}
			}],
			"qSuppressMissing": true,
			"qSuppressZero": true,
			"qInterColumnSortOrder": [0, 1],
			"qInitialDataFetch": [{
				qTop: 0,
				qLeft: 0,
				qHeight: 1500,
				qWidth: 3//dimensionList.length + 1
			}]
		}
	}).then(function(reply) {
		cube = reply;
		//console.log(cube);
		render();
	});

	function render() {
		/**
		 * Fetch Layout/Data
		 */
		cube.getLayout().then(function(layout) {
			$(element).empty();

		//console.log(layout);
		//console.log(layout.qHyperCube.qDataPages[0].qMatrix.length);
		var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
		//console.log(qMatrix);

			var data = qMatrix.map(function(d) {
			
				return {
					"Dim1":d[0].qText,
					"Metric1":d[1].qNum,
					"Metric2":d[2].qNum,
					"DimqElem":d[0].qElemNumber
				}
			})
			
			//console.log(data);

			//var calcWidth = layout.qHyperCube.qDataPages[0].qMatrix.length < 5 ? 300 : layout.qHyperCube.qDataPages[0].qMatrix.length*30;

			//$(element).width(calcWidth);

			var margin = {top: 20, right: 20, bottom: 30, left: 60},
				width = $(element).width() - margin.left - margin.right,
				height = $(element).height() - margin.top - margin.bottom;

			var x = d3.scale.linear()
				.range([0, width]);

			var y = d3.scale.linear()
				.range([height, 0]);

			var color = '#5d5d5d';//d3.scale.category10();
				
			var xAxis = d3.svg.axis()
				.scale(x)
				.tickFormat(d3.format("s"))
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.ticks(10, "");

			var svg = d3.select(element).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			// Lasso functions to execute while lassoing
			var lasso_start = function() {
				console.log("start");
			  lasso.items()
				.attr("r",3.5) // reset size
				.style("fill",null) // clear all of the fills
				.classed({"not_possible":true,"selected":false}); // style as not possible
			};

			var lasso_draw = function() {
			  // Style the possible dots
			  lasso.items().filter(function(d) {return d.possible===true})
				.classed({"not_possible":false,"possible":true});

			  // Style the not possible dot
			  lasso.items().filter(function(d) {return d.possible===false})
				.classed({"not_possible":true,"possible":false});
			};

			var lasso_end = function() {
			  // Reset the color of all dots
			  lasso.items()
				 .style("fill", "#5cb85c");

			  // Style the selected dots
			  lasso.items().filter(function(d) {return d.selected===true})
				.classed({"not_possible":false,"possible":false})
				.attr("r",7);

			  // Reset the style of the not selected dots
			  lasso.items().filter(function(d) {return d.selected===false})
				.classed({"not_possible":false,"possible":false})
				.attr("r",3.5);
				
				var selectedItems = lasso.items().filter(function(d) {return d.selected===true});	
				if (selectedItems[0].length > 0) {
					console.log(selectedItems);
					console.log(selectedItems[0]);
					// Set up an array to store the data points in the selected hexagon
					var selectarray = [];
					//Push the Dim1_key from the data array to get the unique selected values
					for (index = 0; index < selectedItems[0].length; index++) {
						//for (item = 0; item < selectedItems[0][index].__data__.length; item++) {
							console.log(selectedItems[0][index].id);
							selectarray.push(parseInt(selectedItems[0][index].id));	
						//}
					}
					console.log(selectarray);
					
					//Make the selections
					
					select(selectarray);
					
					//self.backendApi.selectValues(0,selectarray,false);
				} else {
					// nothing in lasso, nothing to select

					//}
				}
				
			};

			// Create the area where the lasso event can be triggered
			var lasso_area = svg.append("rect")
								  .attr("width",width)
								  .attr("height",height)
								  .style("opacity",0);

			
			//console.log(lasso_area);
			
			// Define the lasso
			var lasso = d3.lasso()
				  .closePathDistance(75) // max distance for the lasso loop to be closed
				  .closePathSelect(true) // can items be selected by closing the path?
				  .hoverSelect(true) // can items by selected by hovering over them?
				  .area(lasso_area) // area where the lasso can be started
				  .on("start",lasso_start) // lasso start function
				  .on("draw",lasso_draw) // lasso draw function
				  .on("end",lasso_end); // lasso end function

			//console.log(lasso);	  
				  
			//Init the lasso on the svg:g that contains the dots
			//console.log(svg);
			
			svg.call(lasso);
			
			
			//console.log(svg);

			  x.domain(d3.extent(data, function(d) { return d.Metric1; })).nice();
			  y.domain(d3.extent(data, function(d) { return d.Metric2; })).nice();

			  //console.log(x.domain);
			  
			  svg.append("g")
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + height + ")")
				  .call(xAxis)
				.append("text")
				  .attr("class", "label")
				  .attr("x", width)
				  .attr("dx", ".71em")
				  .attr("y", -6)
				  .style("text-anchor", "end")
				  .text(layout.qHyperCube.qMeasureInfo[0].qFallbackTitle);

			  svg.append("g")
				  .attr("class", "y axis")
				  .call(yAxis)
				.append("text")
				  .attr("class", "label")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", ".71em")
				  .style("text-anchor", "end")
				  .text(layout.qHyperCube.qMeasureInfo[1].qFallbackTitle);

			  svg.selectAll(".dot")
				  .data(data)
				.enter().append("circle")
				  .attr("id",function(d,i) {return d.DimqElem; }) //"dot_" + i;}) // added // 
				  .attr("class", "dot")
				  .attr("r", 5)
				  .attr("cx", function(d) { return x(d.Metric1); })
				  .attr("cy", function(d) { return y(d.Metric2); })
				  .style("fill", '#5cb85c');

				lasso.items(d3.selectAll(".dot"));	  
				  
		
		}, function(error) {
			console.log(error)
		});
	}

	/**
	 * Select a value in the Qlik Sense Data Model.
	 * Will trigger a update message to notify other objects to update accordingly.
	 */
	function select(qElem) {
		console.log("selection triggered");
		cube.selectHyperCubeValues('/qHyperCubeDef', 0, qElem, true).then(function(success) {
			pubsub.publish('update');
		})
	}

	  /**
	   * Listen for messages and delegate actions.
	   */
	  var update = pubsub.subscribe('update', render);
	  pubsub.subscribe('kill', function() {
	    pubsub.unsubscribe(update)
	  });

}; 
//////  End of function D3Scatter
 
function ContentTable(fieldlist, element) {
	
	//console.log(element.selector);
  
  //$("#"+element.selector).append('<div class="rows"></div>');
  
  var cube;
  var index = 0;
  var visibleItems = 0;
  var qHeightValue = 100;
  var maxIdx;
  var $div = $('#more');
  var $rows = element.find('.rows');
  var spacer = '&nbsp;&nbsp;-&nbsp;&nbsp;';

  //('<div id="JSTEST"></div>').appendTo($rows);
  
  //console.log($rows);
  
  var dimensionList = fieldlist.map(function(d) {
    return {
      //"qNullSuppression": true,
      "qDef": {
        "qFieldDefs": [d],
        "qSortCriterias": [{
          "qSortByNumeric": -1
        }]
      }
    }
  });

  app.createSessionObject({
    "qInfo": {
      "qId": "",
      "qType": "HyperCube"
    },
    TOTALS: {
      qStringExpression: "='Showing ' & Count(Search_id) & ' out of ' & Count({1}Search_id) & ' tweets.'"
    },
    "qHyperCubeDef": {
      "qDimensions": dimensionList,
      "qSuppressMissing": true,
			"qSuppressZero": true,
      "qInterColumnSortOrder": [2],
      "qInitialDataFetch": [{
          qTop: 0,
          qLeft: 0,
          qHeight: qHeightValue,
          qWidth: dimensionList.length + 1
        }]
    }
  }).then(function(reply) {
    cube = reply;
    render();
  });

  function render() {
    cube.getLayout().then(function(layout) {
      if (layout.qHyperCube.qDataPages[0].qMatrix.length < qHeightValue) {
        $div.hide();
      } else {
        $div.show();
      }

	  //console.log("got data");
	  
      maxIdx = layout.qHyperCube.qSize.qcy;

      $("#twitterRows").empty();
      
      $('.title-row .totals').text(layout.TOTALS);

      var items = layout.qHyperCube.qDataPages[0].qMatrix;

      items.forEach(function(d) {
        if (d[1].qIsEmpty) {
          return;
        };
        
        // var $row;
        // //if( d[0].qText === 'Twitter' ) {
          // $row = createTweetRow(d);
		  // //console.log($row);
		  

        var $row;
        if( d[0].qText === 'Twitter' ) {
          $row = createTweetRow(d);
        } else {
          $row = createWebRow(d);
        };

		$("#twitterRows").append($row);

		  //} else {
        // $row = createWebRow(d)
        //};
        //$row.appendTo($rows);
      });

    }, function(error) {
      console.log(error)
    });
  }

  function pageData() {
    index += qHeightValue;

    var pages = {
      qTop: index,
      qLeft: 0,
      qHeight: qHeightValue,
      qWidth: dimensionList.length + 1
    }

    //For some reason pages has to wrapped in a array
    cube.getHyperCubeData('/qHyperCubeDef', [pages]).then(function(data) {

      if (data[0].qMatrix.length < qHeightValue) {
        $('#more').hide();
      }

      data[0].qMatrix.forEach(function(d) {
        if (d[1].qIsEmpty) {
          return;
        };
        
        var $row;
        if( d[0].qText === 'Twitter' ) {
          $row = createTweetRow(d);
        } else {
          $row = createWebRow(d);
        };

		//$()
		
        $row.appendTo($rows);
        
      });

    })

  };


//'Source', 'URL', 'doctype', 'favorites', 'retweets', 'mediaURL'

  //Return a content row - jquery object
  function createTweetRow(d) {
	//console.log("createtweetrow fired");
    var $row = $('<div class="item" />');

    $('<div class="info"><i class="fa fa-twitter"></i>&nbsp;&nbsp;' + d[1].qText + spacer + d[2].qText + '</div>').appendTo($row);
    $('<div class="body">' + d[3].qText + '<br><img style="display: none;"></img></div>').appendTo($row);
    
    var detailsTmpl = '<div class="details" style="display: none;"><div class="details-bar">';
    detailsTmpl += '<ul><li class="retweet">RETWEETS <strong>' + d[7].qText + '</strong>';
    detailsTmpl += '</li><li class="favorite">FAVORITES <strong>' + d[6].qText + '</strong></li>'
    detailsTmpl += '<li class="handle">TWITTER HANDLE <strong>' + d[4].qText.substring(1) + '</strong></li><li></li></ul>';
    detailsTmpl += '<a target="_blank" href="https://twitter.com/' + d[4].qText + '/status/' + d[5].qText + '">Read on Twitter</a><a target="_blank" href="https://twitter.com/' + d[4].qText + '">View Twitter profile</a></div>';
    
    var $details = $(detailsTmpl);
	
	
   // console.log(d[8].qText);
    //mediaUUL
    if(d[8].qText != undefined) {
      $row.find('.info').append('<i class="fa fa-picture-o"></i>')
      $details.find('img').attr('src', d[8].qText).show();
      $row.find('img').attr('src', d[8].qText).show();
      
    };
    
    $details.appendTo($row);
	
	//console.log($row);
    
    $row.on('click', function(e) {
      if(e.target.nodeName == 'A') return null;
      $(this).find('.details').slideToggle('fast');
    });
    
    return $row;
  };
  
  function createWebRow(d) {
	//console.log("createtweetrow fired");
    var $row = $('<div class="item" />');

    $('<div class="info"><i class="fa fa-reddit"></i>&nbsp;&nbsp;' + d[4].qText + spacer + d[2].qText + '</div>').appendTo($row);
    $('<div class="body">' + d[3].qText + '<br><img style="display: none;"></img></div>').appendTo($row);
    
    var detailsTmpl = '<div class="details" style="display: none;"><div class="details-bar">';
    detailsTmpl += '<ul><li class="retweet">COMMENTS <strong>' + d[7].qText + '</strong>';
    detailsTmpl += '</li><li class="favorite">SCORE <strong>0</strong></li>'
    detailsTmpl += '<li class="handle">REDDIT HANDLE <strong>' + d[4].qText + '</strong></li><li></li></ul>';
    detailsTmpl += '<a target="_blank" href="' + d[6].qText + '">Read on Reddit</a></div>';
    
    var $details = $(detailsTmpl);
	
	//console.log(d[1].qText.length);
	$details.html('<div>'+d[1].qText+'</div>');
   // console.log(d[8].qText);
    //mediaUUL
	//console.log(d[8].qText);
    if(d[8].qText != undefined) {
      $row.find('.info').append('<i class="fa fa-picture-o"></i>')
      $details.find('img').attr('src', d[8].qText).show();
      $row.find('img').attr('src', d[8].qText).show();
      //console.log(d[8].qText);
    };
	//var myHTML = d[1].qText.substring(1, d[1].qText.length()-1);

	
	//console.log(d[1].qText);
    
    $details.appendTo($row);
	
	//console.log($row);
    
    $row.on('click', function(e) {
      if(e.target.nodeName == 'A') return null;
      $(this).find('.details').slideToggle('fast');
	  // $.getJSON('https://www.reddit.com/api/info.json?id=' + d[5].qText, function(data) {
		  // console.log(data);
	  // });
    });
    
    return $row;
  };
  

  var update = pubsub.subscribe('update', render);
  pubsub.subscribe('kill', function() {
    pubsub.unsubscribe(update);
  });

  //Page on more
  $div.click(function(event) {
    pageData();
  });

}; //////// End of Function ContentTable 
 
// function MapUsers(field, label, sortOrder, element, shouldsearch) { //Removing for now due to Google Map 10 geocode / sec limit

// var map;
// var marker;

	// //console.log("MapUsers fired");
  // var list;
  // var listId;
  // var $el = element;
  // var existsInDOM = false;
  // var selectedState = false;
  // var openState = false;
  // var searchable = shouldsearch || false;
  // var labeltrim = label.replace(/\s+/g, '').replace(/\./g, '');


  // var sort = field == 'DateRange' ? {
    // "qSortByNumeric": 1
  // } : {
    // "qSortByState": 1,
    // "qSortByAscii": 0,
	// "qSortByExpression": -1,
	// "qExpression": sortOrder
  // };

  // /**
   // * Create the Qlik Sense Object
   // * https://help.qlik.com/sense/2.0/en-us/developer/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/ListObjectDef.htm
   // * 
   // * Returns a promise which will call render once it's fulfilled.
   // */
  // app.createSessionObject({
    // "qInfo": {
      // "qId": "",
      // "qType": "ListObject"
    // },
    // "qListObjectDef": {
      // "qLibraryId": "",
      // "qShowAlternatives": true,
      // "qDef": {
        // "qFieldDefs": [field],
        // "qSortCriterias": [sort]
      // },
      // "qInitialDataFetch": [{
        // "qTop": 0,
        // "qHeight": 200,
        // "qLeft": 0,
        // "qWidth": 1
      // }]
    // }
  // }).then(function(reply) {
    // list = reply;
	// //console.log(list);
    // render();
  // });

  // function render() {
    // /**
     // * Get the layout/data of the List Object
     // */
    // list.getLayout().then(function(layout) {
      // console.log(layout);
      // listId = layout.qInfo.qId; 
       
// //google.maps.event.addDomListener(window, 'load', initialize); 	
      
      // var items = layout.qListObject.qDataPages[0].qMatrix;
      // //var selected = layout.qListObject.qDimensionInfo.qStateCounts.qSelected;
		// //console.log(items);
		// var map;
		// var marker;

		// //console.log($el);


		// initialize();
		// grabData(items);
	  
    // });
  // };
  
  // // function sleep(miliseconds) {
	  // // console.log("Sleeping");
   // // var currentTime = new Date().getTime();

   // // while (currentTime + miliseconds >= new Date().getTime()) {
   // // }
   // // //return;
// // }
  
  // function initialize() {
	  // //console.log("Initialize");
		// var mapOptions = {
			// center: new google.maps.LatLng(40.680898,-8.684059),
			// zoom: 1,
			// mapTypeId: google.maps.MapTypeId.ROADMAP
		// };
		
		// map = new google.maps.Map($el, mapOptions);
  // }

  // function grabData(items) {
	 // // console.log("GrabData");
	 // //console.log(items);
		// items.forEach(function(d) {
			// if(d[0].qText != undefined) {
				// //console.log(d[0].qText);
				// searchAddress(d[0].qText);
				// //userList += d[0.q]
			// }
		// });	  
  // }
  
	// function searchAddress(addressGeoCode) {
		// //console.log("SEARCHADDRESS CALLLED");
		// var addressInput = addressGeoCode;//= document.getElementById('address-input').value;

		// //console.log(addressInput);
		// var geocoder = new google.maps.Geocoder();

			// //FREE API CAPS AT 10 Requests per second
		// geocoder.geocode({address: addressInput}, function(results, status) {

			// if (status == google.maps.GeocoderStatus.OK) {

				  // var myResult = results[0].geometry.location;
				  
				  // //console.log(myResult.lat());
				  // createMarker(myResult, addressGeoCode);

				  // //map.setCenter(myResult);

				  // //map.setZoom(17);
			// }
		// });

	// }

	// function createMarker(latlng, addressGeoCode) {
	// //console.log("TRIGGERED CERATEMARKET");
	  // // if(marker != undefined && marker != ''){
		  // // console.log("undefined marker");
		// // marker.setMap(null);
		// // marker = '';
	  // // }


	  // marker = new google.maps.Marker({
		// map: map,
		// position: latlng,
		// title: addressGeoCode
	  // });
	// }	  

  // /**
   // * Select a value in the Qlik Sense Data Model.
   // * Will trigger a update message to notify other objects to update accordingly.
   // */
  // function select(qElem) {
    // list.selectListObjectValues("/qListObjectDef", [+qElem], field == 'DateRange' ? false : true, false).then(function(success) {
      // $('#clearfilter').addClass('active');
      // pubsub.publish('update');
    // }, function(error) {
      // console.log(error);
    // });
  // }

  // /**
   // * Listen for messages and delegate actions.
   // */
  // var update = pubsub.subscribe('update', render);
  // pubsub.subscribe('kill', function() {
    // app.destroySessionObject(listId);
    // pubsub.unsubscribe(update);
  // });
  
// }; //////// end of function MapUsers 
 
 //////////// end of function app
 })

});
 	 
});

