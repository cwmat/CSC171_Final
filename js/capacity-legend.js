/**
 * Created by Max DeCurtins on 4/26/2016.
 */

Legend = function(_parentElement) {

    this.parentElement = _parentElement;

    this.color = d3.scale.quantize().domain([100, 10000]).range(colorbrewer.YlOrRd[5]);

    this.init();
};

Legend.prototype.init = function() {

    var legend = this;

    var boxmargin = 10, lineheight = 24, keyheight = 20, keywidth = 40;

    legend.margin = {
        top: 20,
        right: 10,
        bottom: 20,
        left: 10
    };

    legend.width = 250 - legend.margin.left - legend.margin.right;
    legend.height = 200 - legend.margin.top - legend.margin.bottom;

    legend.svg = d3.select('#' + legend.parentElement)
        .append('svg')
        .attr({
            width: legend.width + legend.margin.left + legend.margin.right,
            height: legend.height + legend.margin.top + legend.margin.bottom
        })
        .append('g')
        .attr('transform', 'translate(' + legend.margin.left + ',' + legend.margin.top + ')');

    legend.legend = legend.svg.append('g').attr('id', 'heatmap-legend');

    /*legend.legend.attr({
        transform: 'translate(' + (legend.chartWidth - 200) + ', 0)'
    });*/

    legend.title = legend.legend.append('text')
        .attr('class', 'legend-title')
        .style('font-weight', 'bold')
        .text('Capacity in MW');

    legend.items = legend.legend.append('g')
        .attr({
            class: 'legend-items',
            transform: 'translate(' + boxmargin + ', ' + 2 * boxmargin + ')'
        });

    legend.items.selectAll('rect')
        .data(legend.color.range())
        .enter()
        .append('rect')
        .attr({
            dx: 0,
            y: function(d, i) {
                return i * lineheight;
            },
            width: keywidth,
            height: keyheight,
            class: 'legend-rects'
        })
        .style({
            fill: function(d) {
                return d;
            }
        });

    legend.items.selectAll('text')
        .data(legend.color.range())
        .enter()
        .append('text')
        .attr({
            x: keywidth + boxmargin,
            y: function(d, i) {
                return i * lineheight;
            },
            dy: '1em'
        })
        .text(function(d) {
            switch (colorbrewer.YlOrRd[5].indexOf(d)) {
                case 0:
                    return '< 100';
                    break;
                case 1:
                    return '100 - 1,000';
                    break;
                case 2:
                    return '1,000 - 5,000';
                    break;
                case 3:
                    return '5,000 - 10,000';
                    break;
                case 4:
                    return '10,000+';
                    break;
                case -1:
                    return '0 or No Data';
                    break;
            }
        });

    legend.items.append('rect')
        .attr({
            dx: 0,
            y: colorbrewer.YlOrRd[5].length * lineheight,
            width: keywidth,
            height: keyheight
        })
        .style({
            fill: '#ccc'
        });

    legend.items.append('text')
        .attr({
            x: keywidth + boxmargin,
            y: colorbrewer.YlOrRd[5].length * lineheight,
            dy: '1em'
        })
        .text('0 or No Data');
};