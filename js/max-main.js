/**
 * Created by Max DeCurtins on 4/14/2016.
 */

// Variable for CA ISO visualization instance
var caiso, brush;

// Variable for projected capacity plot visualization.
var capacityPlot, capacityLegend;


d3.json('data/caiso_data.json', function(error, data) {

    if(error) throw error;

    data.forEach(function(d) {
        var hourlyData = {};
        for(var hour in d.hours) {
            hourlyData[hour] = +d.hours[hour];
        }
        d.hours = hourlyData;
    });

    // N.B. 2011-06-30 has bad data - "connection to server lost"!
    data = data.filter(function(d) {
       return d.date != '2011-06-30';
    });

    //createCaiso(data);
});

d3.csv('data/projected_capacity.csv', function(error, data) {

    if(error) throw error;

    data.forEach(function(d) {
        d.mw_wind_2014 = +d.mw_wind_2014;
        d.wind_cap_2012 = (d.wind_cap_2012 != 'null') ? +d.wind_cap_2012 : false;
        d.wind_cap_2018 = (d.wind_cap_2018 != 'null') ? +d.wind_cap_2018 : false;
        d.wind_cap_2024 = (d.wind_cap_2024 != 'null') ? +d.wind_cap_2024 : false;
        d.wind_cap_2030 = (d.wind_cap_2030 != 'null') ? +d.wind_cap_2030 : false;

        // Remove these data as they aren't needed and may be inaccurate
        if(d.hasOwnProperty('total_mw_2014')) {
            delete d.total_mw_2014;
        }
        if(d.hasOwnProperty('total_mwh_2014')) {
            delete d.total_mwh_2014;
        }
    });

    // Discard DC as there isn't data in both sources for the District.
    data = data.filter(function(obj) {
        return obj.state != 'DC';
    });

    //console.log(data);
    createCapacityPlot(data);

});


function createCaiso(data) {
    caiso = new Caiso('caiso', data);
    // Instantiate a new brush.
    brush = new CaisoBrush('caiso-brush', caiso.getData(), caiso.getWidth());
}

function brushed() {

    var valuesForFilter = brush.brush.empty() ? brush.x.domain() : brush.brush.extent();

    caiso.filterByDates(caiso.getData(), valuesForFilter[0], valuesForFilter[1]);
}

function createCapacityPlot(data) {
    capacityPlot = new CapacityPlot('projected-capacity', data);
    capacityLegend = new Legend('projected-capacity-legend');
}

// Some jQuery stuff to power the viz controls
$(document).ready(function() {
    $('.hour-select').each(function() {
        for(var i = 1; i < 25; i++) {
            $(this).append($('<option>').attr('value', i).text(i));
        }
    });

    $('#hour2 option:last-child').prop('selected', true);

    $('#caiso-controls button').click(function() {
        console.log('clicked!');
        caiso.reset();
        brush.reset();
        $('#hour1 option:first-child').prop('selected', true);
        $('#hour2 option:last-child').prop('selected', true);
    });
});