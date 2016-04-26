/**
 * Created by Max DeCurtins on 4/14/2016.
 */

VerticalHeatmap = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;

    //console.log(this.data);

    this.initVis();
};

VerticalHeatmap.prototype.initVis = function() {

    var vis = this;

    vis.margin = {
        top: 40,
        right: 40,
        bottom: 60,
        left: 60
    };

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 1100 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select('#' + vis.parentElement)
        .append('svg')
        .attr({
            width: vis.width + vis.margin.left + vis.margin.right,
            height: vis.height + vis.margin.top + vis.margin.bottom
        })
        .append('g')
        .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');

    vis.colsToUse = ['wind_cap_2012', 'total_mw_2014', 'wind_cap_2018', 'wind_cap_2024',
                        'wind_cap_2030'];

    vis.x = d3.time.scale().range([(vis.width / vis.colsToUse.length), vis.width]);
    vis.y = d3.scale.linear().range([vis.height, vis.margin.top]);

    vis.palette = colorbrewer.YlOrRd[5];
    vis.color = d3.scale.quantize().range(vis.palette);


    vis.columnLabels = vis.svg.selectAll('.column-label');

    vis.wrangleData();
    vis.updateVis();
};

VerticalHeatmap.prototype.updateVis = function() {

    var vis = this;

    var dataToUse;
    if(typeof vis.filteredData !== 'undefined') {
        console.log('Using filtered data...');
        console.log('Filtered length: ' + vis.filteredData.length);
        dataToUse = vis.filteredData;
    } else {
        dataToUse = vis.formattedData;
    }

    //console.log(dataToUse);
    // Update x domain.
    vis.x.domain(d3.extent(dataToUse, function(d) {
        return d.year;
    }));


    // Update color domain.
    vis.color.domain([100, 10000]);

    // Update and enter.
    var circles = vis.svg.selectAll('circle').data(dataToUse);

    circles.enter().append('circle')
        .attr({
            class: function(d) {
                return 'circle state-' + d.state;
            },
            cx: function(d) {
                return vis.x(d.year);
            },
            cy: function(d) {
                return vis.margin.top + (d.index * 20);
            },
            r: 10
        })
        .style({
            fill: function(d) {
                if(!d.capacity) {
                    return '#ccc';
                } else if(!isNaN(d.capacity)) {
                    return vis.color(d.capacity);
                } else {
                    return '#ccc';
                }
            }
        });

    var states = vis.getStates(dataToUse);

    console.log(states);

    vis.stateLabels = vis.svg.selectAll('.state-label');
    vis.stateLabels.data(states)
        .enter()
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

    var columns = vis.getColumns(dataToUse);

    console.log(columns);


    vis.columnLabels.data(columns)
        .enter().append('text')
        .attr({
            x: function(d) {
                var year = formatYear.parse(d.toString());
                return vis.x(year);
            },
            y: vis.margin.top / 2,
            'text-anchor': 'middle'
        }).text(function(d) {
        return d.toString();
    });

    vis.attachEventListeners();

    var exit = circles.exit();
    console.log(exit);
    //circles.exit().transition().remove();
    //vis.columnLabels.exit().transition().remove();

};

VerticalHeatmap.prototype.wrangleData = function() {

    var vis = this;

    vis.formattedData = [];

    for(var i = 0; i < vis.data.length; i++) {
        var current = vis.data[i];
        vis.colsToUse.forEach(function(col) {
            var parts = col.split('_');
            var year = formatYear.parse(parts[2]);
            vis.formattedData.push({
                index: i,
                state: current.state,
                capacity: current[col],
                year: year
            });
        });
    }

    console.log(vis.formattedData);
};

VerticalHeatmap.prototype.attachEventListeners = function() {

    var vis = this;

    $(document).ready(function() {
        var checkboxes = $('#projected-capacity-controls .checkbox');
        var yearsChecked = [];

        checkboxes.on('change', function() {
            var checked = $('#projected-capacity-controls .checkbox:checked');
            var currentlyChecked = [];
            checked.each(function() {
                var value = formatYear.parse($(this).val()).valueOf();
                currentlyChecked.push(value);
            });

            if(yearsChecked.length > 0) {
                vis.yearsChecked = intersection(currentlyChecked, yearsChecked);
            } else {
                vis.yearsChecked = currentlyChecked;
            }

            //console.log(vis.yearsChecked);
            vis.filterData();
            vis.updateVis();
        });

        /*$(document).click(function() {
            d3.selectAll('#projected-capacity .active');
        });*/
    });

    d3.selectAll('.state-label').on({
        click: function(d, i) {
            d3.event.stopPropagation();
            var row = d3.select(this);

        },
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


};

VerticalHeatmap.prototype.filterData = function() {

    var vis = this;

    vis.filteredData = vis.formattedData.filter(function(d) {
        //console.log(d);
        return vis.yearsChecked.indexOf(d.year.valueOf()) !== -1;
    });

};





VerticalHeatmap.prototype.getColumns = function(data) {
    var vis = this;

    var columns = [];

    data.forEach(function(d) {
        if(columns.indexOf(d.year.getFullYear()) === -1) {
            columns.push(d.year.getFullYear());
        }
    });

    return columns;
};

VerticalHeatmap.prototype.getStates = function(data) {

    var vis = this;

    var m = d3.map(data, function(d) {
        return d.state;
    });

    return m.keys().sort();
};
