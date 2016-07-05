/**
 * Generic three column table
 * Dimension, Inline Bar Chart, Value
 */

function Table(dimensions, expression, element) {

	var cube, max;

	var dimensionList = dimensions.map(function(d) {
		return {
			"qNullSuppression": true,
			"qDef": {
				"qFieldDefs": [d.dim],
				"qFieldLabels": [d.label],
				"qSortCriterias": [{
					"qSortByNumeric": -1
				}]
			}
		}
	});

	/**
	 * Qlik Sense Object
	 * https://help.qlik.com/sense/2.0/en-us/developer/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/HyperCubeDef.htm
	 * 
	 * Returns promise which calls render() once resolved.
	 */
	QIX.app.createSessionObject({
		"qInfo": {
			"qId": "",
			"qType": "HyperCube"
		},
		"qHyperCubeDef": {
			"qDimensions": dimensionList,
			"qMeasures": [{
				"qLibraryId": "",
				"qSortBy": {
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
			"qInterColumnSortOrder": [1, 0],
			"qInitialDataFetch": [{
				qTop: 0,
				qLeft: 0,
				qHeight: 10,
				qWidth: dimensionList.length + 1
			}]
		}
	}).then(function(reply) {
		cube = reply;
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

			var $table = $('<table />');
			var $thead = createHeader(layout);
			var $tbody = $('<tbody />');

			max = d3.max(layout.qHyperCube.qDataPages[0].qMatrix, function(d) {
				return d[1].qNum;
			});

			layout.qHyperCube.qDataPages[0].qMatrix.forEach(function(d) {
				var row = createRow(d);
				row.appendTo($tbody);
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

		var perc = (d[1].qNum / max) * 100;

		var $row = $('<tr/>');
		$('<td id="' + d[0].qElemNumber + '" class="col col1">' + d[0].qText + '</td>').click(function(event) {
			select(+$(this).attr('id'));
		}).appendTo($row);
		$('<td class="col col2"><div style="width:' + perc + '%;"></div></td>').appendTo($row);
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

};