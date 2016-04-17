/**
	* Adoption of Wind Energy Development in the US
	* CSC 171 - Studio 2 Group 1
	* Final Project
	* 	Charles Mateer
	* 	Max DeCurtins
	*
	*/

// Global variables for cleaned datasets
var choroplethMapData = [],
		usGeometry = [],
		parallelCoordsData = [];

// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;

// Set ordinal color scale
var colorScale = d3.scale.category20();

// Variables for the visualization instances add more as we create new vis
var choroplethMap,
		parallelCoords;


// Start application by loading the data
loadData();

/**
  * Queue the data load
  *
  */
function loadData() {
	queue()
	  .defer(d3.csv, "data/summary_wind_data.csv")
	  .defer(d3.json, "data/us.topojson")
	  .await(function(error, windData, usData){
			if(!error) {
				/**
				  * ParallelCoords Data
				  *
				  */
				// Convert to num
				parallelCoordsData = windData;
				parallelCoordsData.forEach(function(row) {
					for (var key in row) {
						if (row.hasOwnProperty(key)) {
							if (!(isNaN(row[key]))) { // if is a number
								row[key] = +row[key];
								// Remove null values
								if (row[key] == 9999) {
									row[key] = 0;
								}
							}
						}
					}
				});

				/**
				  * US boundaries data
				  *
				  */
				// Unpack topoJSON to geoJson
	      var usGeoJson = topojson.feature(usData, usData.objects.data).features;


				// usGeometry = usData.features;
				usGeometry = usGeoJson;

				console.log(usGeometry);

				createVis();
			}
	});
}

function createVis() {

	// Instantiate visualization objects here
	choroplethMap = new ChoroplethMap("choropleth-map", choroplethMapData, usGeometry);
	parallelCoords = new ParallelCoords("parallel-coords", parallelCoordsData);
	// parallelCoords = new ParallelCoord("parallel-coords", parallelCoordsData);

}
