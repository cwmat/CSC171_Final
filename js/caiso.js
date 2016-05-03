/**
 * Created by Max DeCurtins on 4/14/2016.
 */

/**
 * Instantiate a new California Independent System Operator (CAISO) data visualization.
 *
 * @param _parentElement    The parent element in which this visualization instance should reside.
 * @param _data     The data for this visualization.
 * @constructor
 */
Caiso = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;


    this.initVis();
};


/**
 * Initialize the California Independent System Operator (CAISO) visualization.
 */
Caiso.prototype.initVis = function() {

    var vis = this;

    // Format the data
    vis.wrangleData();

    // Init the SVG
    vis.margin = {
        top: 20,
        right: 40,
        bottom: 40,
        left: 60
    };


    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 700 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select('#' + vis.parentElement)
        .append('svg')
        .attr({
            width: vis.width + vis.margin.left + vis.margin.right,
            height: vis.height + vis.margin.top + vis.margin.bottom
        })
        .append('g')
        .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');

    // Initialize the axis scales
    vis.x = d3.scale.linear().range([0, vis.width]);
    vis.y = d3.scale.linear().range([vis.height, 0]);

    // Scale and orient the chart axes
    vis.xAxis = d3.svg.axis().scale(vis.x).orient('bottom');
    vis.yAxis = d3.svg.axis().scale(vis.y).orient('left');

    vis.xAxisGroup = vis.svg.append('g')
        .attr({
            class: 'x-axis axis',
            transform: 'translate(0, ' + vis.height + ')'
        });

    vis.yAxisGroup = vis.svg.append('g').attr('class', 'y-axis axis');

    vis.xLabel = vis.xAxisGroup.append('text')
        .attr({
            x: vis.width / 2,
            dy: 30
        }).text('Hour of Day');

    vis.yLabel = vis.yAxisGroup.append('text')
        .attr({
            transform: 'rotate(-90)',
            y: vis.margin.top
        })
        .style('text-anchor', 'end')
        .text('Megawatts (MW)');

    // Initialize a line function for drawing paths.
    vis.line = d3.svg.line().interpolate('basis');

    // Initialize a tooltip.
    vis.tip = d3.tip().attr('class', 'd3-tip').offset([10, 30]);

    // Initialize a color palette.
    var inputValues = [2010, 2011, 2012, 2013, 2014, 2015, 2017];
    vis.color = d3.scale.threshold().domain(inputValues).range(colorbrewer.YlOrRd[6]);

    vis.updateVis();
};


/**
 * Wrangle the data into the various data structures needed by this visualization.
 */
Caiso.prototype.wrangleData = function() {

    var vis = this;

    vis.allData = [];
    /*
     The hourly data is nested inside of an object. In order to use it
     in domain calculations, it needs to be accessible as a plain array
     of values.
     */
    vis.allHours = [];

    vis.data.forEach(function(d) {
        if(d.hasOwnProperty('hours')) {
            d3.values(d.hours).forEach(function(val) {
                vis.allHours.push(val);
            });

            for(key in d.hours) {
                vis.allData.push({
                    hour: +key,
                    output: d.hours[key],
                    date: d.date
                });

            }
        }
    });


    vis.formattedData = d3.nest().key(function(d) {
        return formatDate.parse(d.date);
    }).entries(vis.allData);

    vis.hourKeys = d3.keys(vis.data[0].hours);
    vis.hourKeys = vis.hourKeys.map(function(key) {
        return parseInt(key);
    });



};


/**
 * Update this visualization.
 */
Caiso.prototype.updateVis = function() {

    var vis = this;

    var dataToUse = (typeof vis.filteredData === 'undefined') ? vis.formattedData : vis.filteredData;

    var hourRange = vis.getHourRange(dataToUse);

    // Set the x and y domains.
    vis.x.domain(d3.extent(hourRange, function(d) {
        return d;
    }));


    vis.y.domain([0, d3.max(vis.allHours, function(d) {
            return d;
        })
    ]);


    vis.line
        .x(function(d) {
            return vis.x(d.hour);
        })
        .y(function(d) {
            return vis.y(d.output);
        });


    // Path handling based on
    // http://jonsadka.com/blog/how-to-create-live-updating-and-flexible-d3-line-charts-using-pseudo-data/
    vis.lines = vis.svg.selectAll('.line').data(dataToUse).attr('class', 'line');

    vis.lines.transition()
        .duration(500)
        .attr('d', function(d) { return vis.line(d.values); });

    // Update the lines. When there are fewer of them, the stroke-width can be a little bigger.
    vis.lines.enter()
        .append('path')
        .attr({
            class: 'line',
            d: function(d) {
                return vis.line(d.values);
            }
        })
        .style('stroke-width', function() {
            if(dataToUse.length < 150) {
                return '6px';
            } else if(dataToUse.length > 150 && dataToUse.length < 500) {
                return '5px';
            } else if(dataToUse.length > 500 && dataToUse.length < 1000) {
                return '4px';
            } else if(dataToUse.length > 1000 && dataToUse.length < 1500) {
                return '3px';
            } else {
                return '2px';
            }
        })
        .style('stroke', function(d) {

            var year = new Date(d.key).getFullYear();

            return vis.color(year);
        });

    vis.lines.exit().remove();

    vis.makeTooltip();

    vis.attachEventListeners();

    // Call the axes
    vis.svg.select('.x-axis').transition().duration(500).call(vis.xAxis);
    vis.svg.select('.y-axis').call(vis.yAxis);
};


/**
 * Attach event listeners to this visualization.
 */
Caiso.prototype.attachEventListeners = function() {

    var vis = this;

    d3.selectAll('.line').on({
        mouseover: function(d) {
            d3.select(this).style('opacity', 1.0);
            vis.tip.show(d);
        },
        mouseleave: function(d) {
            d3.select(this).style('opacity', 0.05);
            vis.tip.hide(d);
        }
    });

    $(document).ready(function() {
        $('.hour-select').each(function() {
            $(this).on('change', function() {
                var hour1 = parseInt($('#hour1').val()), hour2 = parseInt($('#hour2').val());
                if (hour1 > hour2) {
                    alert('Hourly range cannot be negative.');
                } else if (hour1 == hour2) {
                    alert('No range selected.');
                } else {
                    vis.filterByHours(hour1, hour2);
                }
            });
        });

    });

};


/**
 * Returns an object containing summary statistics for the hourly data passed to this method.
 *
 * @param hours An array of objects of length 24, each with an output property.
 * @returns {{}}    An object containing average, minimum, and maximum wind output KV pairs.
 */
Caiso.prototype.dailyStats = function(hours) {

    var stats = {};

    var total = 0;
    var outputs = [];
    hours.forEach(function(obj) {
        total += obj.output;
        outputs.push(obj.output);
    });

    stats['avgOutput'] = Math.round(total / outputs.length);
    stats['maxOutput'] = d3.max(outputs);
    stats['minOutput'] = d3.min(outputs);

    return stats;
};


/**
 * Filters this visualization's formattedData or filteredData by two hour values.
 *
 * @param input1    An int between 1 and 24, representing hour 1.
 * @param input2    An int between 1 and 24, representing hour 2.
 */
Caiso.prototype.filterByHours = function(input1, input2) {
    var vis = this;

    var dataToUse;
    // First, a sanity check.
    if(!isNaN(input1) && !isNaN(input2)) {
        // Determine if there is previously filtered data.
        if(typeof vis.filteredData === 'undefined') {
            dataToUse = vis.formattedData;
            vis.filteredData = [];
            dataToUse.forEach(function(d) {
                vis.filteredData.push({
                    key: d.key,
                    values: d.values.filter(function(val) {
                        return (val.hour >= input1) && (val.hour <= input2);
                    })
                });
            });
        } else {
            dataToUse = vis.filteredData;
            var filtered = [];
            dataToUse.forEach(function(d) {
                filtered.push({
                    key: d.key,
                    values: d.values.filter(function(val) {
                        return (val.hour >= input1) && (val.hour <= input2);
                    })
                });
            });

            vis.filteredData = filtered;
        }
        vis.updateVis();
    } else {
        console.log('Numeric inputs expected. Inputs passed: ' + input1 + ', ' + input2);
    }

};


/**
 * Obtains a subset of the data passed, filtered by dates falling between date1 and date2. This
 * subset is then assigned to the filteredData property of this visualization.
 *
 * @param data  An array of objects with obj.key = date and obj.values = array of hourly data
 * @param date1 A string representing a date.
 * @param date2 A string representing a date.
 */
Caiso.prototype.filterByDates = function(data, date1, date2) {
    var vis = this;

    vis.filteredData = data.filter(function(d) {
        var current = new Date(d.key).valueOf();

        return (current >= date1.valueOf()) && (current <= date2.valueOf());
    });

    vis.updateVis();
};


/**
 * Returns the range of hours represented in the data passed to this method.
 *
 * @param data  An array of objects with obj.key = date and obj.values = array of hourly data
 * @returns {Array} An array of hours as numbers
 */
Caiso.prototype.getHourRange = function(data) {

    if(typeof data === 'undefined' || data.length == 0 || !Array.isArray(data)) return null;

    var m = d3.map(data[0].values, function(d) {
        return d.hour;
    });

    var keys = m.keys();

    return keys.map(function(k) { return parseInt(k); });
};


/**
 * Returns the unfiltered, formatted data of this visualization. Should be an array unless the data
 * is formatted otherwise.
 *
 * @returns {*}
 */
Caiso.prototype.getData = function() {
    var vis = this;
    var data;
    if(typeof vis.formattedData !== 'undefined') {
        data = vis.formattedData;
    }
    return data;
};


/**
 * Returns the width of the SVG element of this visualization.
 *
 * @returns {number|*}
 */
Caiso.prototype.getWidth = function() {
    var vis = this;
    return vis.width;
};


/**
 * Defines and calls the HTML to appear inside the tooltip.
 */
Caiso.prototype.makeTooltip = function() {

    var vis = this;

    // Update and call the tooltip
    vis.tip.html(function(d) {

        var stats = vis.dailyStats(d.values);
        var date = new Date(d.key);

        var dateString = (date.getMonth() + 1) + '/' + (date.getDay() + 1) + '/' + date.getFullYear();

        var html = '<p class="tooltip-title">Wind stats for: ' + dateString + '</p>';
        html += '<p>Average output: ' + stats.avgOutput + ' MW</p>';
        html += '<p>Minimum output: ' + stats.minOutput + ' MW</p>';
        html += '<p>Maximum output: ' + stats.maxOutput + ' MW</p>';

        return html;
    });

    vis.svg.call(vis.tip);
};



