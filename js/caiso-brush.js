/**
 * Created by Max DeCurtins on 4/24/2016.
 */

CaisoBrush = function(_parentElement, _data, _width) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.width = _width;

    this.init();
};

CaisoBrush.prototype.init = function() {

    var brush = this;

    brush.margin = {
        top: 20,
        right: 40,
        bottom: 20,
        left: 60
    };

    brush.height = 100 - brush.margin.top - brush.margin.bottom;

    brush.svg = d3.select('#' + brush.parentElement)
        .append('svg')
        .attr({
            width: brush.width + + brush.margin.left + brush.margin.right,
            height: brush.height + brush.margin.top + brush.margin.bottom
        })
        .append('g')
        .attr('transform', 'translate(' + brush.margin.left + ',' + brush.margin.top + ')');

    /*brush.svg.append('rect')
        .attr({
            width: brush.width,
            height: brush.height,
            fill: '#E6E7E8'
        });*/

    // Set the brush's x scale
    brush.x = d3.time.scale().range([0, brush.width])
        .domain(d3.extent(brush.data, function(d) { return new Date(d.key); }));

    brush.xAxis = d3.svg.axis().scale(brush.x).orient('bottom');

    //console.log();

    brush.area = d3.svg.area()
        .x(function(d) {
            return brush.x(new Date(d.key));
        })
        .y0(brush.height)
        .y1(0);

    brush.svg.append('path')
        .datum(brush.data)
        .attr({
            d: brush.area,
            fill: '#E6E7E8'
        });

    // Initialize the brush
    brush.brush = d3.svg.brush().x(brush.x).on('brush', brushed);

    brush.svg.append('g')
        .attr('class', 'x brush')
        .call(brush.brush)
        .selectAll('rect')
        .attr({
            height: brush.height
        });

    // Append and call the brush x axis
    brush.svg.append('g')
        .attr({
            class: 'x-axis axis brush-axis',
            transform: 'translate(0, ' + brush.height + ')'
        }).call(brush.xAxis);

};

CaisoBrush.prototype.reset = function() {
    var brush = this;
    brush.brush.clear();
    d3.select('rect.extent').remove();
};
