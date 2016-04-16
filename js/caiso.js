/**
 * Created by Max DeCurtins on 4/14/2016.
 */

Caiso = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;


    this.initVis();
}

Caiso.prototype.initVis = function() {

    var vis = this;

    vis.allData = [];
    /*
    The hourly data is nested inside of an object. In order to use it
    in domain calculations, it needs to be accessible as a plain array
    of values.
     */
    vis.allHours = [];

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
        return d.date;
    }).entries(vis.allData);

    //console.log(vis.formattedData);


    vis.hourKeys = d3.keys(vis.data[0].hours);
    vis.hourKeys = vis.hourKeys.map(function(key) {
        return parseInt(key);
    });

    // Init the SVG
    vis.margin = {
        top: 40,
        right: 40,
        bottom: 60,
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

    vis.x = d3.scale.linear().range([0, vis.width]);
    vis.y = d3.scale.linear().range([vis.height, 0]);

    vis.xAxis = d3.svg.axis().scale(vis.x).orient('bottom');
    vis.yAxis = d3.svg.axis().scale(vis.y).orient('left');

    vis.xAxisGroup = vis.svg.append('g')
        .attr({
            class: 'x-axis axis',
            transform: 'translate(0, ' + (vis.height) + ')'
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

    vis.line = d3.svg.line()
        .interpolate('basis');



    vis.updateVis();
}

Caiso.prototype.wrangleData = function() {

    var vis = this;

    vis.updateVis();
}

Caiso.prototype.updateVis = function() {

    var vis = this;

    vis.x.domain(d3.extent(vis.hourKeys, function(d) {
        return d;
    }));

    //console.log(vis.x.domain());

    vis.y.domain([0, d3.max(vis.allHours, function(d) {
            return d;
        })
    ]);

    //console.log(vis.y.domain());

    vis.line
        .x(function(d) {
            return vis.x(d.hour);
        })
        .y(function(d) {
            return vis.y(d.output);
        });

    // With thanks to http://jsfiddle.net/YHW6H/1/
    vis.dates = vis.svg.selectAll('.daily')
        .data(vis.formattedData, function(d) {
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
        });

    // Call the axes
    vis.svg.select('.x-axis').call(vis.xAxis);
    vis.svg.select('.y-axis').call(vis.yAxis);
}

Caiso.prototype.makeSlider = function(selection) {
    // Implement a slider and listen for changes.
}