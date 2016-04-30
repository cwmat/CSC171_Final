/**
	* Adoption of Wind Energy Development in the US
	* CSC 171 - Studio 2 Group 1
	* Final Project
	* 	Charles Mateer
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
RegionalBars = function(parentElement, data){
	var vis = this;

	this.parentElement = parentElement;
  this.data = data;
  this.displayData = [
    {
      name: "west",
      total_capacity: 0,
    },
    {
      name: "southwest",
      total_capacity: 0,
    },
    {
      name: "midwest",
      total_capacity: 0,
    },
    {
      name: "southeast",
      total_capacity: 0,
    },
    {
      name: "northeast",
      total_capacity: 0,
    },
  ];

  vis.data.forEach(function(d) {
    vis.displayData.forEach(function(p) {
      if (d.region == p.name) {
        p.total_capacity = p.total_capacity + d.installed_capacity_mw;
      }
    });
  });

	console.log(this.displayData);

  // console.log(this.displayData);




  this.initVis();
}


/**
  * Initialize map vis
  *
  */
RegionalBars.prototype.initVis = function(){
	var vis = this;

	vis.margin = {top: 20, right: 0, bottom: 20, left: 50};

	vis.width = 200 - vis.margin.left - vis.margin.right,
  vis.height = 200 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales
    vis.x = d3.scale.ordinal()
        .rangeRoundBands([0, vis.width], 0.1);

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    // Axiis
    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.yAxisGroup = vis.svg.append("g")
          .attr("class", "y-axis axis")
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("");

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    // Domains
    vis.x.domain(vis.displayData.map(function(d) { return d.name; }));
    vis.y.domain([0, d3.max(vis.displayData, function(d) { return d.total_capacity; })]);

    // Tip
    vis.tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([0, 0])
                .html(function(d) {
                  var barTooltip = "<p class='fund-tip-header'>" + d.name + "</p>" + "<p>" + d.total_capacity + "MW</p>"
                  return barTooltip;
                });

    vis.svg.call(vis.tip);

    vis.bars = vis.svg.selectAll("rect")
      .data(vis.displayData);

		// // Change axis text
		// $(document).ready(function() {
		// 	$(".tick text:contains('west')").html("W");
		// 	$(".tick text:contains('southwest')").html("SW");
		// 	$(".tick text:contains('midwest')").html("MW");
		// 	$(".tick text:contains('southeast')").html("SE");
		// 	$(".tick text:contains('northeast')").html("NE");
		// });

    // Udpate
    // vis.bars.on("mouseover", barTip.show).on("mouseleave", barTip.hide)
    // .transition()
    // .duration(1000)
    // .attr({
    //   x: function(d) { return x(d.Source); },
    //   y: function(d) { return y(d[currentBarSelection]); },
    //   height: function(d) { return height - y(d[currentBarSelection]); },
    //   width: x.rangeBand(),
    //   class: function(d) { return "bar " + currentBarSelection; },
    // });


    vis.bars.on("mouseover", vis.tip.show).on("mouseleave", vis.tip.hide);

    // Enter data
    vis.bars.enter()
    .append("rect")
      .attr({
        x: function(d) { return vis.x(d.name); },
        y: function(d) { return vis.y(d.total_capacity); },
        height: function(d) { return vis.height - vis.y(d.total_capacity); },
        width: vis.x.rangeBand(),
        class: function(d) { return "bar region-" + d.name; },
      })
      // .on("mouseover", barTip.show)
      // .on("mouseleave", barTip.hide);
      ;

    // Remove old data
    vis.bars.exit().remove();

    // Update axiis
    vis.svg.select(".y-axis")
        .transition()
        .duration(2000)
        .call(vis.yAxis);
    vis.svg.select(".x-axis")
        .transition()
        .duration(2000)
        .call(vis.xAxis);




  // TODO: (Filter, aggregate, modify data)
  vis.wrangleData();
}

/**
  * Manipulate data
  *
  */
RegionalBars.prototype.wrangleData = function(states) {
  var vis = this;

	// if (states) {
	// 	vis.displayData.forEach(function(d) {
	// 		if (true) {
	// 			console.log(d);
	// 		}
	// 	});
	// }
	if (states) {
		if (states.size < 1) {
			vis.data.forEach(function(d) {
				vis.displayData.forEach(function(p) {
					if (d.region == p.name) {
						p.total_capacity = p.total_capacity + d.installed_capacity_mw;
					}
				});
			});
		} else {
			// Clear out display data
			vis.displayData.forEach(function(d) {
				d.total_capacity = 0;
			});

			vis.data.forEach(function(d) {
				if (states.has(d.state.toLowerCase())) {
					vis.displayData.forEach(function(p) {
						if (d.region == p.name) {
							p.total_capacity = p.total_capacity + d.installed_capacity_mw;
						}
					});
				}
			});
		}
	}
	console.log(vis.displayData);

  // Wrangle


  // Update the visualization
  vis.updateVis();
}

/**
  * Update vis
  *
  */
RegionalBars.prototype.updateVis = function() {
  var vis = this;

	// Domains
	vis.x.domain(vis.displayData.map(function(d) { return d.name; }));
	vis.y.domain([0, d3.max(vis.displayData, function(d) { return d.total_capacity; })]);

	vis.bars
		.transition()
		.duration(1000)
		.attr({
			x: function(d) { return vis.x(d.name); },
			y: function(d) { return vis.y(d.total_capacity); },
			height: function(d) { return vis.height - vis.y(d.total_capacity); },
			width: vis.x.rangeBand(),
			class: function(d) { return "bar region-" + d.name; },
		})

		// Update axiis
		vis.svg.select(".y-axis")
				.transition()
				.duration(1000)
				.call(vis.yAxis);
		vis.svg.select(".x-axis")
				.transition()
				.duration(1000)
				.call(vis.xAxis);


}
