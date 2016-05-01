'use strict;'
/**
	* Adoption of Wind Energy Development in the US
	* CSC 171 - Studio 2 Group 1
	* Final Project
	* 	Charles Mateer
	*
	*/


/**
  * Regional Map - Object constructor function
  * @param parentElement
  *     -- the HTML element in which to draw the visualization
  * @param data
  *     -- the input dataset
	* @param mapData
	*     -- Map geometry
  *
  */
RegionalMap = function(parentElement, data, mapData){
	var vis = this;

	this.parentElement = parentElement;
	this.mapData = mapData;
  this.data = data;
  this.displayData = [];
	this.dataExtent = [];
	this.year = 1995;
  this.highlightedState = new Set();

	// Clear out set
	this.highlightedState.add("temp");
	this.highlightedState.clear();

  // Make data map for regional states
  this.regionalStates = {};

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
  vis.data.forEach(function(d) {
    vis.regionalStates[d.state] = d.region;
  });

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

  vis.wrangleData();
}

/**
  * Manipulate data
  *
  */
RegionalMap.prototype.wrangleData = function(states) {
  var vis = this;


	if (states) {
		vis.highlightedState = states;
	}

  vis.updateVis();
}

/**
  * Update vis
  *
  */
RegionalMap.prototype.updateVis = function() {
  var vis = this;

	vis.svg.selectAll(".regional")
    .attr("class", function(d) {
      if (vis.highlightedState && vis.highlightedState.has(d.properties.name.toLowerCase())) {
        var stateName = d.properties.name;
        var key = stateName.toLowerCase();
        return "regional state region-" + vis.regionalStates[key];
      } else if (vis.highlightedState.size < 1) {
        var stateName = d.properties.name;
        var key = stateName.toLowerCase();
        return "regional state region-" + vis.regionalStates[key];
      } else {
        return "regional grey-state";
      }
    });
}


RegionalMap.prototype.highlightState = function(states) {
	var vis = this;

  vis.updateVis();
}
