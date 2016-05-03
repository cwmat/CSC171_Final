/**
 * Created by Max DeCurtins on 4/26/2016.
 */

/**
 * Instantiate a new legend for the Caiso visualization.
 *
 * @param _parentElement    The element in which this legend will reside.
 * @constructor
 */
CaisoLegend = function(_parentElement) {

    this.parentElement = _parentElement;

    this.color = d3.scale.quantize().domain([2010, 2016]).range(colorbrewer.YlOrRd[7]);

    this.nsPrefix = 'caiso-';

    this.init();
};


/**
 * Initialize this legend.
 */
CaisoLegend.prototype.init = function() {

    var legend = this;

    var boxmargin = 10, lineheight = 24, keyheight = 20, keywidth = 40;

    legend.margin = {
        top: 20,
        right: 10,
        bottom: 20,
        left: 0
    };

    legend.width = 250 - legend.margin.left - legend.margin.right;
    legend.height = 220 - legend.margin.top - legend.margin.bottom;

    legend.svg = d3.select('#' + legend.parentElement)
        .append('svg')
        .attr({
            width: legend.width + legend.margin.left + legend.margin.right,
            height: legend.height + legend.margin.top + legend.margin.bottom
        })
        .append('g')
        .attr('transform', 'translate(' + legend.margin.left + ',' + legend.margin.top + ')');

    legend.legend = legend.svg.append('g').attr('id', legend.nsPrefix + 'heatmap-legend');

    /*legend.legend.attr({
        transform: 'translate(' + (legend.chartWidth - 200) + ', 0)'
    });*/

    legend.title = legend.legend.append('text')
        .attr('class', 'legend-title')
        .style('font-weight', 'bold')
        .text('Legend');

    legend.items = legend.legend.append('g')
        .attr({
            class: legend.nsPrefix + 'legend-items',
            transform: 'translate(' + boxmargin + ', ' + 2 * boxmargin + ')'
        });

    legend.items.selectAll(legend.nsPrefix + 'rect')
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
            class: legend.nsPrefix + 'legend-rects'
        })
        .style({
            fill: function(d) {
                return d;
            }
        });

    legend.items.selectAll(legend.nsPrefix + 'text')
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
            switch (colorbrewer.YlOrRd[7].indexOf(d)) {
                case 0:
                    return '2010';
                    break;
                case 1:
                    return '2011';
                    break;
                case 2:
                    return '2012';
                    break;
                case 3:
                    return '2013';
                    break;
                case 4:
                    return '2014';
                    break;
                case 5:
                    return '2015';
                    break;
                case 6:
                    return '2016';
                    break;
                case -1:
                    return 'No Data';
                    break;
            }
        });


};