/**
	* Adoption of Wind Energy Development in the US
	* CSC 171 - Studio 2 Group 1
	* Final Project
	* 	Charles Mateer
	* 	Max DeCurtins
	*
	*/


/**
  * Regional Map - Object constructor function
  * @param _parentElement
  *     -- the HTML element in which to draw the visualization
  * @param _data
  *     -- the input dataset
  *
  */
RegionalMap = function(parentElement, data, mapData){
	var vis = this;

	this.parentElement = parentElement;
	this.mapData = mapData;
  this.data = data;
  this.displayData = []; // see data wrangling
	this.dataExtent = [];
	this.year = 1995;
  this.highlightedState = "all";

  // Make data map for regional states
  this.regionalStates = {};

  // vis.data.forEach(function(d) {
  //   // console.log(d);
  //   vis.regionalStates[d.state] = d.region;
  // });


	// this.removeStates = ["PR", "HI", "AK"];

  // DEBUG RAW DATA
  // console.log(this.data);

	// Initial sort
	// this.displayData = this.data.filter(function(d) {
	// 	if (d.on_year == 2014) {
	// 		return d;
	// 	}
	// });

	// this.aggregateOnYear(this.year);

	// this.buildDataMap();

	// console.log(this.displayData);
	// console.log(this.dataMap);
	// console.log(this.dataMap.CA);

	// setTimeout(function() {
	// 	vis.initVis();
	// }, 10000);
  this.initVis();
}


/**
  * Initialize map vis
  *
  */
RegionalMap.prototype.initVis = function(){
	var vis = this;

	vis.margin = {top: 0, right: 0, bottom: 0, left: 0};

	vis.width = 200 - vis.margin.left - vis.margin.right,
  vis.height = 200 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// Create quantize color scale
	// vis.quantize = d3.scale.quantize();
  vis.data.forEach(function(d) {
    // console.log(d);
    vis.regionalStates[d.state] = d.region;
  });
  console.log(vis.regionalStates);

	// Map projection and path generator
	vis.proj = d3.geo.albersUsa()
				.scale(250)
				.translate([vis.width / 2, vis.height / 2]);

	vis.path = d3.geo.path()
				.projection(vis.proj);

	// Draw us boundaries
	vis.svg.selectAll("path")
				.data(vis.mapData)
			.enter().append("path")
        .attr("class", function(d) {
          var stateName = d.properties.name;
          var key = stateName.toLowerCase();
          return "regional state region-" + vis.regionalStates[key];
        })
				.attr("d", vis.path);


  // TODO: (Filter, aggregate, modify data)
  vis.wrangleData();
}

/**
  * Manipulate data
  *
  */
RegionalMap.prototype.wrangleData = function() {
  var vis = this;

  // Wrangle
	// vis.aggregateOnYear(vis.year);

  // Update the visualization
  vis.updateVis();
}

/**
  * Update vis
  *
  */
RegionalMap.prototype.updateVis = function() {
  var vis = this;

	// Update us boundaries
	vis.svg.selectAll(".regional")
    .attr("class", function(d) {
      if (vis.highlightedState == "all") {
        var stateName = d.properties.name;
        var key = stateName.toLowerCase();
        return "regional state region-" + vis.regionalStates[key];
      } else if (vis.highlightedState == d.properties.name.toLowerCase()) {
        console.log("madeit");
        var stateName = d.properties.name;
        var key = stateName.toLowerCase();
        return "regional state region-" + vis.regionalStates[key];
      } else {
        console.log(vis.highlightedState);
        console.log(d.properties.name);
        return "regional grey-state";
      }
    });
}

RegionalMap.prototype.highlightState = function(state) {
	var vis = this;

	var stateKey = state.toLowerCase();

	vis.highlightedState = stateKey;

  // console.log(stateKey);

  vis.updateVis();


}
