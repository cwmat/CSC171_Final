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
ChoroplethMap = function(parentElement, data, mapData){
	this.parentElement = parentElement;
	this.mapData = mapData;
  this.data = data;
  this.displayData = []; // see data wrangling
	this.removeStates = ["PR", "HI", "AK"];

  // DEBUG RAW DATA
  // console.log(this.data);

	// Initial sort
	this.displayData = this.data.filter(function(d) {
		if (d.on_year == 2014) {
			return d;
		}
	});

	this.buildDataMap();

	// console.log(this.displayData);
	console.log(this.dataMap);

  this.initVis();
}


/**
  * Initialize map vis
  *
  */
ChoroplethMap.prototype.initVis = function(){
	var vis = this;

	vis.margin = {top: 0, right: 0, bottom: 0, left: 0};

	vis.width = 960 - vis.margin.left - vis.margin.right,
  vis.height = 600 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// Create quantize color scale
	vis.quantize = d3.scale.quantize();

	// Map projection and path generator
	vis.proj = d3.geo.albersUsa()
				.scale(1280)
				.translate([vis.width / 2, vis.height / 2]);

	vis.path = d3.geo.path()
				.projection(vis.proj);

	// Update domain
  vis.quantize.domain(d3.extent(vis.displayData, function(d) { return d.SUM_MW_turbine }))
          .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

	// Draw us boundaries
	vis.svg.selectAll("path")
				.data(vis.mapData)
			.enter().append("path")
				.attr("class", function(d) {
					// If the state code exists in the topojson and in the data map
					if (d.properties.postal && vis.dataMap[d.properties.postal]) {
						var key = d.properties.postal;
						return " state " + vis.quantize(vis.dataMap[key].capacity);
					} else {
						return "state q0-9";
					}
				})
				.attr("d", vis.path)

  // TODO: (Filter, aggregate, modify data)
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

/**
  * Aggregate data
  *
  */
ChoroplethMap.prototype.aggregateOnYear = function(year) {
  var vis = this;

  vis.dataMap = {};

	vis.displayData.forEach(function(row) {
		if(row) {
			// Check that the state is not in the removed list
			if (vis.removeStates.indexOf(row.state) < 0) {
				vis.dataMap[row.state] = {
					year: row.on_year,
					capacity: row.SUM_MW_turbine,
					turbines: row.COUNT_unique_id,
					height: row.MEAN_tower_h,
					blade: row.MEAN_blade_l,
					rotor: row.MEAN_rotor_s_a
				}
			}
		}
	});

}

/**
  * Make data map
  *
  */
ChoroplethMap.prototype.buildDataMap = function() {
  var vis = this;

  vis.dataMap = {};

	vis.displayData.forEach(function(row) {
		if(row) {
			// Check that the state is not in the removed list
			if (vis.removeStates.indexOf(row.state) < 0) {
				vis.dataMap[row.state] = {
					year: row.on_year,
					capacity: row.SUM_MW_turbine,
					turbines: row.COUNT_unique_id,
					height: row.MEAN_tower_h,
					blade: row.MEAN_blade_l,
					rotor: row.MEAN_rotor_s_a
				}
			}
		}
	});

}
