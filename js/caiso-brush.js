/**
 * Created by Max DeCurtins on 4/24/2016.
 */

/**
 * Instantiate a new Caiso Brush.
 *
 * @param _parentElement    The element in which this brush will reside.
 * @param _data     Data from an instance of Caiso, obtained through an accessor method.
 * @param _width    Width of an instance of Caiso, obtained through an accessor method.
 * @constructor
 */
CaisoBrush = function(_parentElement, _data, _width) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.width = _width;

    this.init();
};


/**
 * Initialize and call the Caiso brush.
 */
CaisoBrush.prototype.init = function() {

    var brush = this;

    brush.margin = {
        top: 30,
        right: 40,
        bottom: 20,
        left: 60
    };

    brush.height = 120 - brush.margin.top - brush.margin.bottom;

    brush.svg = d3.select('#' + brush.parentElement)
        .append('svg')
        .attr({
            width: brush.width + + brush.margin.left + brush.margin.right,
            height: brush.height + brush.margin.top + brush.margin.bottom
        })
        .append('g')
        .attr('transform', 'translate(' + brush.margin.left + ',' + brush.margin.top + ')');

    // Set the brush's x scale. No need to update the domain dynamically.
    brush.x = d3.time.scale().range([0, brush.width])
        .domain(d3.extent(brush.data, function(d) { return new Date(d.key); }));

    brush.xAxis = d3.svg.axis().scale(brush.x).orient('bottom');

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

    // Initialize the brush.
    brush.brush = d3.svg.brush().x(brush.x).on('brush', brushed);

    // Append and call the brush.
    brush.svg.append('g')
        .attr('class', 'x brush')
        .call(brush.brush)
        .selectAll('rect')
        .attr({
            height: brush.height
        });

    // Append and call the brush x axis.
    brush.svg.append('g')
        .attr({
            class: 'x-axis axis brush-axis',
            transform: 'translate(0, ' + brush.height + ')'
        }).call(brush.xAxis);

    // A bit of instruction to the user.
    brush.svg.append('text')
        .attr({
            x: 0,
            y: -10
        })
        .text('Brush to select a date range:');

};

