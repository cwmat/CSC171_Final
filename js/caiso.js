/**
 * Created by Max DeCurtins on 4/14/2016.
 */

Caiso = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;


    this.initVis();
};

Caiso.prototype.initVis = function() {

    var vis = this;

    // Format the data
    vis.wrangleData();

    // Init the SVG
    vis.margin = {
        top: 20,
        right: 40,
        bottom: 20,
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



    vis.updateVis();
};

Caiso.prototype.initBrush = function() {

    var vis = this;
    // Scale for brush
    vis.dateScale = d3.time.scale().range([0, vis.width]);
    // Axis for brush
    vis.dateAxis = d3.svg.axis().scale(vis.dateScale).orient('bottom');

    // Create the brush
    vis.brush = d3.svg.brush().x(vis.dateScale).on('brush', vis.brushed);

    // For brush
    vis.context = vis.svg.append('g')
        .attr({
            transform: 'translate(0, ' + vis.brushMargin.top + ')',
            class: 'context'
        });

    // Set the domain of the brush axis scale. It will always be the same.
    vis.dateScale.domain(d3.extent(vis.formattedData, function(d) {
        return new Date(d.key);
    }));

    vis.context.append('g')
        .attr({
            class: 'x-axis axis brush-axis',
            transform: 'translate(0, ' + vis.brushHeight + ')'
        }).call(vis.dateAxis);

    vis.contextArea = d3.svg.area().interpolate('monotone')
        .x(function(d) {
            return vis.dateScale(new Date(d.key));
        }).y0(vis.brushHeight).y1(0);

    vis.context.append('path')
        .attr({
            class: 'area',
            d: vis.contextArea
        });

    vis.context.append('g')
        .attr('class', 'x brush')
        .call(vis.brush)
        .selectAll('rect')
        .attr({
            height: vis.brushHeight,
            fill: '#E6E7E8'
        });
};

Caiso.prototype.wrangleData = function() {

    var vis = this;

    vis.allData = [];
    /*
     The hourly data is nested inside of an object. In order to use it
     in domain calculations, it needs to be accessible as a plain array
     of values.
     */
    vis.allHours = [];

    vis.valuesByHours = [];

    vis.data.forEach(function(d) {
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

    });

    vis.formattedData = d3.nest().key(function(d) {
        return formatDate.parse(d.date);
    }).entries(vis.allData);

    var dateMap = d3.map(vis.formattedData, function(d) {
        return d.key;
    });

    var allDates = dateMap.keys();
    //console.log(allDates);

    vis.hourKeys = d3.keys(vis.data[0].hours);
    vis.hourKeys = vis.hourKeys.map(function(key) {
        return parseInt(key);
    });

    console.log(vis.formattedData);
};

Caiso.prototype.updateVis = function() {

    var vis = this;

    var dataToUse = (typeof vis.filteredData === 'undefined') ? vis.formattedData : vis.filteredData;

    var hourRange = vis.getHourRange(dataToUse);

    //console.log(hourRange);

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

    // With thanks to http://jsfiddle.net/YHW6H/1/
    /*vis.dates = vis.svg.selectAll('.daily')
        .data(dataToUse, function(d) {
            return d.key;
        })
        .enter().append('g')
        .attr('class', 'daily');

    vis.dates.append('path')
        .attr({
            class: 'line',
            d: function(d) {
                return vis.line(d.values);
            }
        });*/

    // Path handling based on
    // http://jonsadka.com/blog/how-to-create-live-updating-and-flexible-d3-line-charts-using-pseudo-data/
    vis.lines = vis.svg.selectAll('.line').data(dataToUse).attr('class', 'line');

    vis.lines.transition()
        .duration(500)
        .attr('d', function(d) { return vis.line(d.values); });

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
        });

    vis.lines.exit().remove();

    vis.attachEventListeners();

    // Call the axes
    vis.svg.select('.x-axis').transition().duration(500).call(vis.xAxis);
    vis.svg.select('.y-axis').call(vis.yAxis);
};

Caiso.prototype.attachEventListeners = function() {

    var vis = this;

    d3.selectAll('.line').on({
        mouseover: function() {
            d3.select(this).style('opacity', 1.0);
        },
        mouseleave: function() {
            d3.select(this).style('opacity', 0.05);
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
                    vis.filterData(hour1, hour2);
                }
            });
        });
    });

};

Caiso.prototype.filterData = function(input1, input2) {
    var vis = this;

    var dataToUse;
    if(!isNaN(input1) && !isNaN(input2)) {
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


    console.log(vis.filteredData.length);
};

Caiso.prototype.filterByDates = function(data, date1, date2) {
    var vis = this;

    //console.log('Date 1: ' + date1.valueOf());
    //console.log('Date 2: ' + date2.valueOf());

    var filtered = data.filter(function(d) {
        var current = new Date(d.key).valueOf();

        return (current >= date1.valueOf()) && (current <= date2.valueOf());
    });

    console.log(filtered.length);
    vis.filteredData = filtered;
    vis.updateVis();
};

Caiso.prototype.getHourRange = function(data) {

    var vis = this;

    if(typeof data === 'undefined' || data.length == 0 || !Array.isArray(data)) return;

    var m = d3.map(data[0].values, function(d) {
        return d.hour;
    });

    var keys = m.keys();

    var hours = keys.map(function(k) { return parseInt(k); });

    return hours;
};


Caiso.prototype.getData = function() {
    var vis = this;
    var data;
    if(typeof vis.formattedData !== 'undefined') {
        data = vis.formattedData;
    }
    return data;
};

Caiso.prototype.getWidth = function() {
    var vis = this;
    return vis.width;
};

Caiso.prototype.reset = function() {
    var vis = this;
    vis.filteredData = undefined;
    vis.updateVis();
};

