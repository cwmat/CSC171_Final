/**
	* Adoption of Wind Energy Development in the US
	* CSC 171 - Studio 2 Group 1
	* Final Project
	* 	Charles Mateer
	* 	Max DeCurtins
	*
	*/


/**
  * Choropleth Map - Object constructor function
  * @param _parentElement
  *     -- the HTML element in which to draw the visualization
  * @param _data
  *     -- the input dataset
  *
  */
ChoroplethMap = function(parentElement, data){
	this.parentElement = parentElement;
  this.data = data;
  this.displayData = []; // see data wrangling

  // DEBUG RAW DATA
  console.log(this.data);

  this.initVis();
}


/**
  * Initialize map vis
  *
  */
ChoroplethMap.prototype.initVis = function(){
	var vis = this;

	vis.margin = {top: 0, right: 0, bottom: 0, left: 0};

	vis.width = 500 - vis.margin.left - vis.margin.right,
  vis.height = 500 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


	// Scales and axes
  // vis.x = d3.time.scale()
	//   	.range([0, vis.width])
	//   	.domain(d3.extent(vis.displayData, function(d) { return d.Year; }));
  //
	// vis.y = d3.scale.linear()
	// 		.range([vis.height, 0])
	// 		.domain([0, d3.max(vis.displayData, function(d) { return d.Expenditures; })]);
  //
	// vis.xAxis = d3.svg.axis()
	// 	  .scale(vis.x)
	// 	  .orient("bottom");


	// SVG area path generator

  // TO-DO: (Filter, aggregate, modify data)
  vis.wrangleData();
}

/**
  * Manipulate data
  *
  */
ChoroplethMap.prototype.wrangleData = function() {
  var vis = this;

  // Wrangle

  // Update the visualization
  vis.updateVis();
}

/**
  * Update vis
  *
  */
ChoroplethMap.prototype.updateVis = function() {
  var vis = this;

  // Update domain

  // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer


  // Call axis functions with the new domain

}
