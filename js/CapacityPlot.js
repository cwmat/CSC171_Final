/**
 * Created by Max DeCurtins on 4/29/2016.
 */

/**
 * Instantiate a new Projected Capacity by State plot.
 *
 * @param _parentElement    The element in which this visualization will reside.
 * @param _data     The data for this visualization.
 * @constructor
 */
CapacityPlot = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = this.formatData(_data);

    var m = d3.map(this.data, function(d) { return d.key; });

    this.allYears = m.keys();

    this.initVis();
};


/**
 * Format the data for this visualization.
 *
 * @param data  An array of objects containing flat properties.
 * @returns {*} An array of data, keyed by year.
 */
CapacityPlot.prototype.formatData = function(data) {

    var vis = this;

    var entries = [];
    var pattern = /\d{4}/;

    var onTrack = d3.set();
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
        if(current.mw_wind_2014 > current.wind_cap_2018) {
            if(!onTrack.has(current.state)) {
                onTrack.add(current.state);
            }
        }
    }

    vis.onTrack = onTrack.values();

    return d3.nest().key(function(d) { return d.year; }).entries(entries);

};


/**
 * Initialize this visualization.
 */
CapacityPlot.prototype.initVis = function() {

    var vis = this;

    // Create and append the SVG.
    vis.appendSVG();

    // Initialize the color scale.
    var inputVals = [100, 1000, 5000, 10000];
    vis.color = d3.scale.threshold().domain(inputVals).range(colorbrewer.YlOrRd[5]);

    // Initialize a tooltip.
    vis.tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]);

    // Draw the visualization.
    vis.updateVis();
};


/**
 * Update this visualization.
 */
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
            class: function(d) {
                return 'circle state-' + d.state + ' index-' + d.index;
            },
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

    // Circle hover effects.
    circles.on({
        mouseover: function(d) {
            vis.onHover(d);
            vis.tip.show(d);
        },
        mouseleave: function(d) {
            vis.onLeave(d);
            vis.tip.hide(d);
        }
    });

    var stateLabels = vis.svg.selectAll('.state-label').data(vis.getStates());

    stateLabels.enter()
        .append('text')
        .attr({
            class: function(d, i) {
                return 'state-label state-' + d + ' index-' + i;
            },
            x: 0,
            y: function(d, i) {
                return vis.margin.top + (i * 20) + 5;
            }
        })
        .text(function(d) {
            return mapState(d);
        });

    stateLabels.on({
        mouseover: function(d, i) {
            d3.select(this).style('cursor', 'pointer');
            vis.onHover(d, i);
        },
        mouseleave: function(d, i) {
            vis.onLeave(d, i);
        }
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
            y: 0,
            'text-anchor': 'middle',
            class: 'column-label'
        })
        .text(function(d) {
            return d.key;
        })
        .style('font-weight', 'bold');

    columnLabels.exit().transition().remove();

    columnLabels.transition().duration(1000).attr('x', function(d, i) {
        return (130 + (1.5 * i * 50) + i);
    });

    vis.attachEventListeners();


};


/**
 * Creates and appends an SVG element to this visualization.
 */
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


/**
 * Attaches event listeners to this visualization.
 */
CapacityPlot.prototype.attachEventListeners = function() {

    var vis = this;

    $(document).ready(function() {

        $('.capacity-checkbox').on('change', function() {
            vis.filterData();
        });

        $('#on-track').on({
            mouseover: function() {
                vis.onHoverMultiple(vis.onTrack);
            },
            mouseleave: function() {
                vis.onLeaveMultiple(vis.onTrack);
            }
        });
    });
};


/**
 * Filters this visualization's data by years checked and then updates the visualization.
 */
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


/**
 * Returns the color function used by this visualization.
 *
 * @returns {*}
 */
CapacityPlot.prototype.getColor = function() {

    var vis = this;

    return vis.color;
};


/**
 * Returns an array of state abbreviations pulled from this visualization's data.
 *
 * @returns {Array.<T>|*}
 */
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




/**
 * Update and call the HTML that will appear in the tooltip.
 */
CapacityPlot.prototype.makeTooltip = function() {

    var vis = this;

    // Update and call the tooltip
    vis.tip.html(function(d) {
        var html = '<p class="tooltip-title">' + mapState(d.state) + '</p>';
        var projected = (+d.year == 2014) ? 'Actual' : 'Projected Minimum';
        html += '<p>' + projected + ' Wind Capacity for ' + d.year + ':</p>';
        html += '<p>' + Math.round(d.capacity) + ' MW</p>';

        return html;
    });

    vis.svg.call(vis.tip);
};


/**
 * Updates styles when a state label or circle is moused over.
 *
 * @param d
 */
CapacityPlot.prototype.onHover = function(d, i) {

    var vis = this;

    var index = (typeof i === 'undefined') ? d.index : i;

    var selection = '#' + vis.parentElement + ' circle';

    vis.strokeBlue(d3.selectAll(selection + '.index-' + index));
    vis.textHover(d3.select('text.index-' + index));

};

CapacityPlot.prototype.onHoverMultiple = function(states) {

    var vis = this;

    var circles = [], labels = [];

    states.forEach(function(s) {
        circles.push('#' + vis.parentElement + ' circle.state-' + s);
        labels.push('#' + vis.parentElement + ' text.state-' + s);
    });

    var circleMultiSelect = circles.join(', ');
    var labelsMultiSelect = labels.join(', ');

    vis.strokeBlue(d3.selectAll(circleMultiSelect));
    vis.textHover(d3.selectAll(labelsMultiSelect));

};



/**
 * Updates styles when the mouse leaves a state label or circle.
 *
 * @param d
 */
CapacityPlot.prototype.onLeave = function(d, i) {

    var vis = this;

    var index = (typeof i === 'undefined') ? d.index : i;

    var selection = '#' + vis.parentElement + ' circle';

    vis.strokeNone(d3.selectAll(selection + '.index-' + index));
    vis.textNormal(d3.select('text.index-' + index));

};


CapacityPlot.prototype.onLeaveMultiple = function(states) {

    var vis = this;

    var circles = [], labels = [];

    states.forEach(function(s) {
        circles.push('#' + vis.parentElement + ' circle.state-' + s);
        labels.push('#' + vis.parentElement + ' text.state-' + s);
    });

    var circleMultiSelect = circles.join(', ');
    var labelsMultiSelect = labels.join(', ');

    vis.strokeNone(d3.selectAll(circleMultiSelect));
    vis.textNormal(d3.selectAll(labelsMultiSelect));

};


CapacityPlot.prototype.strokeBlue = function(selection) {
    selection.style({
        stroke: 'blue',
        'stroke-width': '2px'
    });
};

CapacityPlot.prototype.strokeNone = function(selection) {
    selection.style({
        stroke: 'none',
        'stroke-width': '0px'
    });
};

CapacityPlot.prototype.textHover = function(selection) {
    selection.style({
        fill: 'blue',
        'font-weight': 'bold'
    });
};

CapacityPlot.prototype.textNormal = function(selection) {
    selection.style({
        fill: 'black',
        'font-weight': 'normal'
    });
};