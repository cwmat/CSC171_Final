/**
 * Created by Max DeCurtins on 4/29/2016.
 */

CapacityPlot = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = this.formatData(_data);

    console.log(this.data);

    var m = d3.map(this.data, function(d) { return d.key; });

    this.allYears = m.keys();

    this.initVis();
};

CapacityPlot.prototype.formatData = function(data) {

    var entries = [];
    var pattern = /\d{4}/;

    for(var i = 0; i < data.length; i++) {
        var current = data[i];
        for(var prop in current) {
            if(current.hasOwnProperty(prop) && pattern.test(prop)) {
                var parts = prop.split('_');
                entries.push({
                    state: current.state,
                    index: i,
                    capacity: current[prop],
                    year: parts[2]
                });
            }
        }
    }

    return d3.nest().key(function(d) { return d.year; }).entries(entries);

};

CapacityPlot.prototype.initVis = function() {

    var vis = this;

    // Create and append the SVG.
    vis.appendSVG();

    // Initialize the color scale.
    vis.color = d3.scale.quantize().domain([100, 10000]).range(colorbrewer.YlOrRd[5]);

    // Initialize a tooltip.
    vis.tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]);

    // Draw the visualization.
    vis.updateVis();
};

CapacityPlot.prototype.updateVis = function() {

    var vis = this;
    var dataToUse;

    if(typeof vis.filteredData !== 'undefined') {
        dataToUse = vis.filteredData;
    } else {
        dataToUse = vis.data;
    }

    /************************************
     * Enter, update, exit on the columns.
     */
    var columns = vis.svg.selectAll('.year-column')
        .data(dataToUse, function(d) { return d.key; });

    columns.enter().append('g')
        .attr('class', 'year-column');

    columns.exit().transition().remove();

    columns.transition().duration(1000).attr('transform', function(d, i) {
        return 'translate(' + (100 + (1.5 * i * 50)) + ', 0)';
    });




    // Do a nested selection and data binding to fill each column with circles for that year.
    var circles = columns.selectAll('.circle')
        .data(function(obj) {
            return obj.values;
        });

    circles.enter().append('circle')
        .attr({
            class: 'circle',
            cx: function(d, i, j) {
                //console.log(d);
                return (1.5 * j) + 30;
            },
            cy: function(d) {
                return vis.margin.top + (d.index * 20);
            },
            r: 10
        })
        .style('fill', function(d) {
            if(!d.capacity) {
                return '#ccc';
            } else if(!isNaN(d.capacity)) {
                return vis.color(d.capacity);
            } else {
                return '#ccc';
            }
        });

    // Handle the tooltip.
    vis.makeTooltip();

    circles.on({
        mouseover: vis.tip.show,
        mouseleave: vis.tip.hide
    });

    var stateLabels = vis.svg.selectAll('.state-label').data(vis.getStates());

    stateLabels.enter()
        .append('text')
        .attr({
            class: 'state-label',
            x: 0,
            y: function(d, i) {
                return vis.margin.top + (i * 20) + 5;
            }
        })
        .text(function(d) {
            return mapState(d);
        });

    /******************************************
     * Enter, update, exit on the column labels.
     */
    var columnLabels = vis.svg.selectAll('.column-label')
        .data(dataToUse, function(d) {
            return d.key;
        });

    columnLabels.enter()
        .append('text')
        .attr({
            y: vis.margin.top / 2,
            'text-anchor': 'middle',
            class: 'column-label'
        })
        .text(function(d) {
            return d.key;
        });

    columnLabels.exit().transition().remove();

    columnLabels.transition().duration(1000).attr('x', function(d, i) {
        return (130 + (1.5 * i * 50));
    });

    vis.attachEventListeners();


};

CapacityPlot.prototype.appendSVG = function() {

    var vis = this;

    vis.margin = {
        top: 40,
        right: 40,
        bottom: 60,
        left: 20
    };

    vis.width = 550 - vis.margin.left - vis.margin.right;
    vis.height = 1100 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select('#' + vis.parentElement)
        .append('svg')
        .attr({
            width: vis.width + vis.margin.left + vis.margin.right,
            height: vis.height + vis.margin.top + vis.margin.bottom
        })
        .append('g')
        .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');
};

CapacityPlot.prototype.attachEventListeners = function() {

    var vis = this;

    d3.selectAll('.state-label').on({
        mouseover: function() {
            d3.select(this).style({
                'cursor': 'pointer',
                'font-weight': 'bold'
            });
        },
        mouseleave: function() {
            d3.select(this).style('font-weight', 'normal');
        }
    });

    $(document).ready(function() {

        $('.capacity-checkbox').on('change', function() {
            vis.filterData();
        });
    });
};

CapacityPlot.prototype.filterData = function() {

    var vis = this;

    $(document).ready(function() {

        var checked = d3.set();

        $('.capacity-checkbox:checked').each(function() {
            if(!checked.has($(this).val())) {
                checked.add($(this).val());
            }
        });

        var years = intersection(vis.allYears, checked.values());

        vis.filteredData = vis.data.filter(function(d) {
            return years.indexOf(d.key) !== -1;
        });

        vis.updateVis();
    });

};

CapacityPlot.prototype.getStates = function() {

    var vis = this;

    var states = d3.set();

    vis.data.forEach(function(d) {
        d.values.forEach(function(v) {
            if(!states.has(v.state)) {
                states.add(v.state);
            }
        });
    });

    return states.values().sort();
};

CapacityPlot.prototype.makeTooltip = function() {

    var vis = this;

    // Update and call the tooltip
    vis.tip.html(function(d) {
        var html = '<p class="tooltip-title">' + mapState(d.state) + '</p>';
        var projected = (+d.year == 2014) ? 'Actual' : 'Projected';
        html += '<p>' + projected + ' Wind Capacity for ' + d.year + '</p>';
        html += '<p>Index: ' + d.index + '</p>';

        return html;
    });

    vis.svg.call(vis.tip);
};