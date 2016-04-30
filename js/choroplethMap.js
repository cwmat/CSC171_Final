'use strict;'
/**
	* Adoption of Wind Energy Development in the US
	* CSC 171 - Studio 2 Group 1
	* Final Project
	* 	Charles Mateer
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
ChoroplethMap = function(parentElement, legendElement, data, mapData){
	var vis = this;

	this.parentElement = parentElement;
	this.legendElement = legendElement;
	this.mapData = mapData;
  this.data = data;
  this.displayData = [];
	this.dataExtent = [];
	this.year = 1982;
	this.turbines = turbines;
	this.currentTurbines = turbines;
	this.turbineRadio = "no-turbines";

	this.aggregateOnYear(this.year);

  this.initVis();
}


/**
  * Initialize map vis
  *
  */
ChoroplethMap.prototype.initVis = function(){
	var vis = this;

	vis.margin = {top: 0, right: 0, bottom: 0, left: 0};

	vis.width = 877.5 - vis.margin.left - vis.margin.right,
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
				.scale(1100)
				.translate([vis.width / 2, vis.height / 2]);

	vis.path = d3.geo.path()
				.projection(vis.proj);

	// Update domain
	vis.quantize.domain([0, d3.max(vis.dataExtent, function(d) { return d.capacity; })])
					.range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

	vis.ranges = vis.quantize.range().length;

	// Return quantize thresholds for the key
	vis.qrange = function(max, num) {
	    var a = [];
	    for (var i=0; i<num; i++) {
	        a.push(i*max/num);
	    }
	    return a;
	}

	// Draw US boundaries
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
				.on("mouseenter", function(d) {	vis.populateTable(d); })
				;

	// Legend
	vis.legendMargin = {top: 0, right: 0, bottom: 0, left: 0};

	vis.legendWidth = 200 - vis.legendMargin.left - vis.legendMargin.right,
	vis.legendHeight = 400 - vis.legendMargin.top - vis.legendMargin.bottom;

	// SVG drawing area
	vis.legendSvg = d3.select("#" + vis.legendElement).append("svg")
			.attr("width", vis.legendWidth + vis.legendMargin.left + vis.legendMargin.right)
			.attr("height", vis.legendHeight + vis.legendMargin.top + vis.legendMargin.bottom)
		.append("g")
			.attr("transform", "translate(" + vis.legendMargin.left + "," + vis.legendMargin.top + ")");

	vis.legendSvg.append("g")
			.attr("class", "legendQuant")
			.attr("transform", "translate(0, 20)");

	vis.legend = d3.legend.color()
			.labelFormat(d3.format(",.2f"))
			.useClass(true)
			.title("Installed Capacity (MW)")
			.shapeHeight(35)
			.shapeWidth(35)
			.scale(vis.quantize);

	vis.legendSvg.select(".legendQuant")
			.call(vis.legend);

	// Time slider
	vis.slider = d3.slider().axis(true).min(1981).max(2014).step(1);
	vis.test = d3.select("#time-slider").call(vis.slider);

	// Set year 2000 apart
	$(document).ready(function() {
		$(".tick text:contains(2000)").css({
			"font-weight": "bold",
			"fill": "orange",
			"font-size": "1.3em",
		});
	});

	// Wrangle Data
  vis.wrangleData();
}

/**
  * Manipulate data
  *
  */
ChoroplethMap.prototype.wrangleData = function() {
  var vis = this;

  // Wrangle
	vis.aggregateOnYear(vis.year);

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
	vis.quantize.domain([0, d3.max(vis.dataExtent, function(d) { return d.capacity; })])
					.range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

	// Update us boundaries
	vis.svg.selectAll(".state")
				.attr("class", function(d) {
					// If the state code exists in the topojson and in the data map
					if (d.properties.postal && vis.dataMap[d.properties.postal]) {
						var key = d.properties.postal;
						return " state " + vis.quantize(vis.dataMap[key].capacity);
					} else {
						return "state q0-9";
					}
				});

  // Call axis functions with the new domain
	// Update Legend
	vis.legend.scale(vis.quantize);
	vis.legendSvg.select(".legendQuant")
			.call(vis.legend);

}

/**
  * Aggregate data
  *
  */
ChoroplethMap.prototype.aggregateOnYear = function(year) {
  var vis = this;

	vis.dataExtent = [];
	vis.dataMap = {};

	var tempData = vis.data.filter(function(d) {
		if (d.on_year <= year) {
			return d;
		}
	});

	// Create a set for unique state names from the fitlered dataset
	var stateSet = new Set();
	tempData.forEach(function(d) {
		stateSet.add(d.state);
	});

	// Cycle through each state and for each state aggregate stats
	stateSet.forEach(function(d) {
		var state = d;
		var aggCapacity = 0,
				aggTurbines = 0,
				aggHeight = 0,
				aggBlade = 0,
				aggRotor = 0
				count = 0;

		// console.log(d);
		tempData.forEach(function(d) {
			if (d.state == state) {
				aggCapacity = aggCapacity + d.SUM_MW_turbine;
				aggTurbines = aggTurbines + d.COUNT_unique_id;
				aggHeight = aggHeight + d.MEAN_tower_h;
				aggBlade = aggBlade + d.MEAN_blade_l;
				aggRotor = aggRotor + d.MEAN_rotor_s_a;
				count++;
			}
		});

		// Write to data map
		vis.dataMap[state] = {
			capacity: aggCapacity,
			turbines: aggTurbines,
			height: aggHeight / count,
			blade: aggBlade / count,
			rotor: aggRotor / count,
		};

		// Push to data extent
		vis.dataExtent.push({capacity: aggCapacity});
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


/**
  * Make data map
  *
  */
ChoroplethMap.prototype.slide = function(year) {
  var vis = this;

	vis.year = year;

	setTimeout(function() {
		vis.wrangleData();
	}, 1000);

}

/**
  * Hover on state
  *
  */
ChoroplethMap.prototype.populateTable = function(data) {
	var vis = this;
	var format = d3.format(",.2f");

	if (data.properties.postal && vis.dataMap[data.properties.postal]) {

		var key = data.properties.postal;

		$("#map-table-state").html(data.properties.name);
		$("#map-table-year").html(vis.year);
		$("#map-table-capacity").html(format(vis.dataMap[key].capacity));
		$("#map-table-turbines").html(format(vis.dataMap[key].turbines));
		$("#map-table-height").html(format(vis.dataMap[key].height));
		$("#map-table-blade").html(format(vis.dataMap[key].blade));
		$("#map-table-rotor").html(format(vis.dataMap[key].rotor));
	} else {
		$("#map-table-state").html(data.properties.name);
		$("#map-table-year").html(vis.year);
		$("#map-table-capacity").html(0);
		$("#map-table-turbines").html(0);
		$("#map-table-height").html(0);
		$("#map-table-blade").html(0);
		$("#map-table-rotor").html(0);
	}
}
