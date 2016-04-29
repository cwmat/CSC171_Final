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
	var vis = this;

	this.parentElement = parentElement;
	this.mapData = mapData;
  this.data = data;
  this.displayData = []; // see data wrangling
	this.dataExtent = [];
	this.year = 1982;
	this.turbines = turbines;
	this.currentTurbines = turbines;
	this.turbineRadio = "no-turbines";
	// this.removeStates = ["PR", "HI", "AK"];

  // DEBUG RAW DATA
  // console.log(this.data);

	// Initial sort
	// this.displayData = this.data.filter(function(d) {
	// 	if (d.on_year == 2014) {
	// 		return d;
	// 	}
	// });

	this.aggregateOnYear(this.year);

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
  // vis.quantize.domain(d3.extent(vis.dataExtent, function(d) { return d.capacity }))
  //         .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));
	vis.quantize.domain([0, d3.max(vis.dataExtent, function(d) { return d.capacity; })])
					.range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

	vis.ranges = vis.quantize.range().length;

	// return quantize thresholds for the key
	vis.qrange = function(max, num) {
	    var a = [];
	    for (var i=0; i<num; i++) {
	        a.push(i*max/num);
	    }
	    return a;
	}

	// Draw us boundaries
	// console.log(vis.dataMap);
	vis.svg.selectAll("path")
				.data(vis.mapData)
			.enter().append("path")
				.attr("class", function(d) {
					// If the state code exists in the topojson and in the data map
					if (d.properties.postal && vis.dataMap[d.properties.postal]) {
						var key = d.properties.postal;
						// console.log(key);
						// console.log(vis.dataMap[key]);
						// console.log(vis.dataMap[key].capacity);
						// console.log(vis.quantize(vis.dataMap[key].capacity));
						return " state " + vis.quantize(vis.dataMap[key].capacity);
					} else {
						return "state q0-9";
					}
				})
				.attr("d", vis.path)
				.on("mouseenter", function(d) {	vis.populateTable(d); })
				;

		// // Turbines
		// vis.dots = vis.svg.selectAll("circle")
	  //     .data(vis.turbines);
		//
    // vis.dots.enter().append("circle")
    //   .attr("r", 2)
		// 	.attr("class", "turbine")
    //   .attr("transform", function(d) {
    //     return "translate(" + vis.proj([d.long_DD, d.lat_DD]) + ")";
    //   });


	// Time slider
	// vis.timeSlider = d3.select("#time-slider").append("svg")
	//     .attr("width", vis.width + vis.margin.left + vis.margin.right)
	//     .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
	//   .append("g")
	//     .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// Legend
	// make legend
	vis.svg.append("g")
			.attr("class", "legendQuant")
			.attr("transform", "translate(20, 420)");

	// console.log("translate(20, " + vis.height - 20 + ")");

	vis.legend = d3.legend.color()
			.labelFormat(d3.format(",.2f"))
			.useClass(true)
			.title("Installed Capacity (MW)")
			.scale(vis.quantize);

	vis.svg.select(".legendQuant")
			.call(vis.legend);


	//
	//
	// vis.boxmargin = 4,
	// vis.lineheight = 14,
	// vis.keyheight = 10,
	// vis.keywidth = 40,
	// vis.boxwidth = 2 * vis.keywidth;
	//
	// vis.title = ['Total Wind Capacity (MW)','occupancy rate'],
	//     vis.titleheight = vis.title.length * vis.lineheight + vis.boxmargin;
	//
	// vis.legend = vis.svg.append("g")
	//     .attr("transform", "translate ("+ vis.margin.left + "," + vis.margin.top + ")")
	//     .attr("class", "legend");
	//
	// vis.legend.selectAll("text")
	//     .data(vis.title)
	//     .enter().append("text")
	//     .attr("class", "legend-title")
	//     .attr("y", function(d, i) { return (i+1)*vis.lineheight-2; })
	//     .text(function(d) { return d; })
	//
	// // make legend box
	// vis.lb = vis.legend.append("rect")
	//     .attr("transform", "translate (0,"+vis.titleheight+")")
	//     .attr("class", "legend-box")
	//     .attr("width", vis.boxwidth)
	//     .attr("height", vis.ranges*vis.lineheight+2*vis.boxmargin+vis.lineheight-vis.keyheight);
	//
	// // make quantized key legend items
	// vis.li = vis.legend.append("g")
	//     .attr("transform", "translate (8,"+(vis.titleheight+vis.boxmargin)+")")
	//     .attr("class", "legend-items");
	//
	// vis.li.selectAll("rect")
	//     .data(vis.quantize.range().map(function(color) {
	//       var d = vis.quantize.invertExtent(color);
	//       if (d[0] == null) d[0] = vis.x.domain()[0];
	//       if (d[1] == null) d[1] = vis.x.domain()[1];
	//       return d;
	//     }))
	//     .enter().append("rect")
	//     .attr("y", function(d, i) { return i*vis.lineheight+vis.lineheight-vis.keyheight; })
	//     .attr("width", vis.keywidth)
	//     .attr("height", vis.keyheight)
	//     .style("fill", function(d) { return vis.quantize(d[0]); });
	//
	// vis.li.selectAll("text")
	//     .data(vis.qrange(vis.quantize.domain()[1], vis.ranges))
	//     .enter().append("text")
	//     .attr("x", 48)
	//     .attr("y", function(d, i) { return (i+1)*vis.lineheight-2; })
	//     .text(function(d) { return d; });
	// End Legend

	// Time slider
	vis.slider = d3.slider().axis(true).min(1981).max(2014).step(1);
	vis.test = d3.select("#time-slider").call(vis.slider);

	// console.log(vis.slider.value());
	// vis.slider.on("drag", function() {
	// 	console.log(vis.slider.value());
	// })




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
	vis.aggregateOnYear(vis.year);

	// vis.currentTurbines = vis.turbines.filter(function(d) {
	// 	if (d.on_year == vis.year) {
	// 		return d;
	// 	}
	// });

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
						// console.log(key);
						// console.log(vis.dataMap[key]);
						// console.log(vis.dataMap[key].capacity);
						// console.log(vis.quantize(vis.dataMap[key].capacity));
						return " state " + vis.quantize(vis.dataMap[key].capacity);
					} else {
						return "state q0-9";
					}
				});
				// .attr("d", vis.path)

	// vis.dots
	// 		.attr("r", 2)
	// 		.attr("class", "turbine")
	// 		.attr("transform", function(d) {
	// 			return "translate(" + vis.proj([d.long_DD, d.lat_DD]) + ")";
	// 		});
	//
	// vis.dots.exit().remove();




  // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer


  // Call axis functions with the new domain
	// Update Legend
	vis.legend.scale(vis.quantize);
	vis.svg.select(".legendQuant")
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

	// console.log(tempData);

	// Create a set for unique state names from the fitlered dataset
	var stateSet = new Set();
	tempData.forEach(function(d) {
		stateSet.add(d.state);
	});

	console.log(stateSet);

	// console.log(stateSet);

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
			// year: row.on_year,
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
  // console.log(year);

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

	// console.log(data);
	// console.log(vis.dataMap);

	if (data.properties.postal && vis.dataMap[data.properties.postal]) {

		var key = data.properties.postal;

		$("#map-table-state").html(data.properties.name);
		$("#map-table-year").html(vis.year);
		$("#map-table-capacity").html(vis.dataMap[key].capacity);
		$("#map-table-turbines").html(vis.dataMap[key].turbines);
		$("#map-table-height").html(vis.dataMap[key].height);
		$("#map-table-blade").html(vis.dataMap[key].blade);
		$("#map-table-rotor").html(vis.dataMap[key].rotor);
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


ChoroplethMap.prototype.plotTurbines = function() {
	var vis = this;

	// $("#plot-turbines").change(function() {
		if (this.value == "turbines") {
			vis.currentTurbines = vis.turbines;
			// Turbines
			vis.dots = vis.svg.selectAll("circle")
					.data(vis.currentTurbines);

			vis.dots.enter().append("circle")
				.attr("r", 2)
				.attr("class", "turbine")
				.attr("transform", function(d) {
					return "translate(" + vis.proj([d.long_DD, d.lat_DD]) + ")";
			});
		} else {
			vis.currentTurbines = [];

			vis.dots.exit().remove();
		}
	// });

	// // Turbines
	// vis.dots = vis.svg.selectAll("circle")
	// 		.data(vis.turbines);
	//
	// vis.dots.enter().append("circle")
	// 	.attr("r", 2)
	// 	.attr("class", "turbine")
	// 	.attr("transform", function(d) {
	// 		return "translate(" + vis.proj([d.long_DD, d.lat_DD]) + ")";
	// });
}

// var tempChangeFunction = function() {
// 	choroplethMap.plotTurbines();
// }
