'use strict;'
/**
	* Adoption of Wind Energy Development in the US
	* CSC 171 - Studio 2 Group 1
	* Final Project
	* 	Charles Mateer
	*
	*/


/**
  * Parallel Coordinates - Object constructor function
  * @param parentElement
  *     -- the HTML element in which to draw the visualization
  * @param data
  *     -- the input dataset
	* @param regionalMap
	*     -- Mini map object
	* @param regionalBars
	*     -- Bar chart object
  *
  */
ParallelCoords = function(parentElement, data, regionalMap, regionalBars){
	this.parentElement = parentElement;
  this.data = data;
  this.displayData = this.data;
	this.windGenerationFieldNames = ["state", "region", "installed_capcity_mw", "state_rank", "capacity_under_construction_mw", "projects_online", "num_turbines"]
	this.economicFieldNames = ["state", "region", "in_state_energy_production_2014", "us_homes_powered", "facilities", "project_invest", "land_lease_total_million"]
	this.environmentalFieldNames = ["state", "region", "water_savings_gallons", "bottles_water_saved", "co2_avoided_metric_tons", "cars_worth"]
	this.drop = ["state_rank", "cars_worth", "bottles_water_saved", "us_homes_powered"]
	this.regionalMap = regionalMap;
	this.regionalBars = regionalBars;

	// Normalize millions/billions
	this.displayData.forEach(function(d) {
		var bill = 1000000000,
				mill = 1000000;
		d.project_invest = d.project_invest / bill;
		d.land_lease_total_million = d.land_lease_total_million / mill;
		d.water_savings_gallons = d.water_savings_gallons / bill;
		d.co2_avoided_metric_tons = d.co2_avoided_metric_tons / mill;
	});

	// Initial filter
	this.dropColumns(this.drop);

	// Initialize vis
  this.initVis();
}


/**
  * Initialize vis
  *
  */
ParallelCoords.prototype.initVis = function(){
	var vis = this;

	// Setup margins
	vis.margin = {top: 30, right: 10, bottom: 10, left: 100};

	// Vis width/height
	vis.width = 945 - vis.margin.left - vis.margin.right,
  vis.height = 500 - vis.margin.top - vis.margin.bottom;

	// Local var
	vis.x = d3.scale.ordinal().rangePoints([0, vis.width], 1),
	vis.y = {},
	vis.dragging = {};

	line = d3.svg.line(),
	vis.axis = d3.svg.axis().orient("left");

  // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// Extract dimensions and create scales
	vis.x.domain(vis.dimensions = d3.keys(vis.displayData[0]).filter(function(d) {
		return d != "state" && d != "region" && (vis.y[d] = d3.scale.linear()
				.domain(d3.extent(vis.displayData, function(p) { return +p[d]; }))
				.range([vis.height, 0]));
	}));

	vis.tip = d3.tip()
							.attr('class', 'd3-tip')
							.offset([-10, 0])
							.html(function(d) {
								var tooltip = d.state;

								return tooltip;
							});

	vis.svg.call(vis.tip);

	// Add background lines
	vis.background = vis.svg.append("g")
		.attr("class", "background")
	.selectAll("path")
		.data(vis.displayData)
	.enter().append("path")
		.attr("d", path);

	// Add foreground lines
  vis.foreground = vis.svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(vis.displayData)
    .enter().append("path")
      .attr("d", path)
			.attr("class", function(d) { return d.region; })
			.on("mouseenter", function(d) { vis.populateTable(d); });

	// Add a group element for each dimension.
  vis.g = vis.svg.selectAll(".dimension")
      .data(vis.dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + vis.x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: vis.x(d)}; })
        .on("dragstart", function(d) {
          vis.dragging[d] = vis.x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          vis.dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          vis.foreground.attr("d", path);
          vis.dimensions.sort(function(a, b) { return position(a) - position(b); });
          vis.x.domain(vis.dimensions);
          vis.g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete vis.dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(vis.foreground).attr("d", path);
          vis.background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

		// Add an axis and title.
	  vis.g.append("g")
	      .attr("class", "axis")
	      .each(function(d) { d3.select(this).call(vis.axis.scale(vis.y[d])); })
	    .append("text")
	      .style("text-anchor", "middle")
	      .attr("y", -9)
	      .text(function(d) { return d; });

	  // Add and store a brush for each axis.
	  vis.g.append("g")
	      .attr("class", "brush")
	      .each(function(d) {
	        d3.select(this).call(vis.y[d].brush = d3.svg.brush().y(vis.y[d]).on("brushstart", brushstart).on("brush", brush));
	      })
		    .selectAll("rect")
		      .attr("x", -8)
		      .attr("width", 16);

	function position(d) {
	  vis.v = vis.dragging[d];
	  return vis.v == null ? vis.x(d) : vis.v;
	}

	function transition(g) {
	  return vis.g.transition().duration(500);
	}

	// Returns the path for a given data point.
	function path(d) {
	  return line(vis.dimensions.map(function(p) { return [position(p), vis.y[p](d[p])]; }));
	}

	function brushstart() {
	  d3.event.sourceEvent.stopPropagation();
	}

	// Handles a brush event, toggling the display of foreground lines.
	function brush() {
		var stateSet = new Set();
	  vis.actives = vis.dimensions.filter(function(p) {
			return !vis.y[p].brush.empty(); }),
	      vis.extents = vis.actives.map(function(p) { return vis.y[p].brush.extent(); });
	  vis.foreground.style("display", function(d) {
	    return vis.actives.every(function(p, i) {
				if (vis.extents[i][0] <= d[p] && d[p] <= vis.extents[i][1]) {
					stateSet.add(d.state);
					return true;
				}
	    }) ? null : "none";
	  });
		// Call wrnagle data on both linked vis (mini map and barchart).  Pass in set of brushed states.
		vis.regionalMap.wrangleData(stateSet);
		vis.regionalBars.wrangleData(stateSet);
	}

  vis.wrangleData();
}

/**
  * Manipulate data
  *
  */
ParallelCoords.prototype.wrangleData = function() {
  var vis = this;

  // Update the visualization
  vis.updateVis();
}

/**
  * Update vis
  *
  */
ParallelCoords.prototype.updateVis = function() {
  var vis = this;

	$(document).ready(function() {
		// Update axis headers
		$("text:contains(installed_capacity_mw)").html("Inst. Capacity");
		$("text:contains(capacity_under_construction_mw)").html("Construction");
		$("text:contains(num_turbines)").html("Turbines");
		$("text:contains(projects_online)").html("Projects");
		$("text:contains(in_state_energy_production_2014)").html("State Production");
		$("text:contains(wind_jobs_2014)").html("Jobs");
		$("text:contains(facilities)").html("Facilities");
		$("text:contains(project_invest)").html("Investment");
		$("text:contains(land_lease_total_million)").html("Land Lease");
		$("text:contains(water_savings_gallons)").html("Water Savings");
		$("text:contains(co2_avoided_metric_tons)").html("CO2 Avoided");

		// Update axis for regions
		$("text:contains(southwest)").html("SW");
		$("text:contains(midwest)").html("MW");
		$("text:contains(west)").html("W");
		$("text:contains(southeast)").html("SE");
		$("text:contains(northeast)").html("NE");
	});

}

ParallelCoords.prototype.dropColumns = function(columnsToDrop) {
	var vis = this;

	// Set display data to full dataset
	vis.displayData = vis.data;

	// Cycle through and only keep columns with names in the columnsToKeep array
	vis.displayData.forEach(function(row) {
		for (var attr in row) {
			if (row.hasOwnProperty(attr)) {
				if (columnsToDrop.indexOf(attr) > -1) {
					delete row[attr];
				}
			}
		}
	});
}

ParallelCoords.prototype.populateTable = function(data) {
	var vis = this;
	var format = d3.format(",d");
	var dec = d3.format(",.2f");
	var percent = d3.format("%");
	var money = d3.format("$")

	$("#coords-table-state").html(data.state.toProperCase());
	$("#coords-table-capacity").html(format(data.installed_capacity_mw));
	$("#coords-table-construction").html(format(data.capacity_under_construction_mw));
	$("#coords-table-projects").html(format(data.projects_online));
	$("#coords-table-turbines").html(format(data.num_turbines));
	$("#coords-table-percent").html(percent(data.in_state_energy_production_2014));
	$("#coords-table-jobs").html(format(data.wind_jobs_2014));
	$("#coords-table-facilities").html(format(data.facilities));
	$("#coords-table-investment").html(money(data.project_invest));
	$("#coords-table-lease").html(money(data.land_lease_total_million));
	$("#coords-table-water").html(dec(data.water_savings_gallons));
	$("#coords-table-co2").html(dec(data.co2_avoided_metric_tons));
}

// Stack Exchange - Tuan: http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
