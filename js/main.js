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
	  .defer(d3.json, "data/us.json")
	  .await(function(error, windData, usData){
			if(!error) {
				parallelCoordsData = windData;
				usGeometry = usData;

				createVis();
			}
	});
}

function createVis() {

	// Instantiate visualization objects here
	// choroplethMap = new ChoroplethMap("choropleth-map", choroplethMapData);
	parallelCoords = new ParallelCoords("parallel-coords", parallelCoordsData);

}
