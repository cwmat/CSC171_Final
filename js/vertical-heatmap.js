/**
 * Created by Max DeCurtins on 4/14/2016.
 */

VerticalHeatmap = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;

    //console.log(this.data);

    this.initVis();
}

VerticalHeatmap.prototype.initVis = function() {

    var vis = this;

    vis.margin = {
        top: 40,
        right: 40,
        bottom: 60,
        left: 60
    };

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 1000 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select('#' + vis.parentElement)
        .append('svg')
        .attr({
            width: vis.width + vis.margin.left + vis.margin.right,
            height: vis.height + vis.margin.top + vis.margin.bottom
        })
        .append('g')
        .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');

    vis.columns = ['wind_cap_2012', 'total_mw_2014', 'wind_cap_2018',
        'wind_cap_2024', 'wind_cap_2030'];

    vis.wrangleData();

    vis.x = d3.time.scale().range([(vis.width / vis.columns.length), vis.width]);
    vis.y = d3.scale.linear().range([vis.height, vis.margin.top]);

    vis.palette = colorbrewer.YlOrRd[5];
    vis.color = d3.scale.quantize().range(vis.palette);

    vis.stateLabels = vis.svg.selectAll('.state-label');

    vis.updateVis();
}

VerticalHeatmap.prototype.updateVis = function() {

    var vis = this;

    // Update x and y domains.
    vis.x.domain(d3.extent(vis.formattedData, function(d) {
        return d.year;
    }));

    vis.y.domain([d3.min(vis.formattedData, function(d) {
        return d.index;
    }), d3.max(vis.formattedData, function(d) {
        return d.index;
    })]);

    // Update color domain.
    vis.color.domain([100, 10000])

    vis.circles = vis.svg.selectAll('circle').data(vis.formattedData);

    vis.circles.enter().append('circle')
        .attr({
            class: 'circle',
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

    vis.stateLabels.data(vis.data)
        .enter()
        .append('text')
        .attr({
            class: 'state-label',
            x: 0,
            y: function(d, i) {
                return vis.margin.top + (i * 20);
            }
        })
        .text(function(d) {
            return mapState(d.state);
        });

}

VerticalHeatmap.prototype.wrangleData = function() {

    var vis = this;

    vis.formattedData = [];

    for(var i = 0; i < vis.data.length; i++) {
        var current = vis.data[i];
        vis.columns.forEach(function(col) {
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
}

