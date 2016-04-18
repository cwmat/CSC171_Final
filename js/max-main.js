/**
 * Created by Max DeCurtins on 4/14/2016.
 */

// Variable for CA ISO visualization instance
var caiso;

// Variable for projected capacity vertical heatmap visualization.
var vertHeatmap;

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


    createCaiso(data);
});

d3.csv('data/projected_capacity.csv', function(error, data) {

    if(error) throw error;

    data.forEach(function(d) {
        d.mw_from_wind = +d.mw_from_wind;
        d.total_mw_2014 = +d.total_mw_2014;
        d.total_mwh_2014 = +d.total_mwh_2014;
        d.wind_cap_2012 = (d.wind_cap_2012 != 'null') ? +d.wind_cap_2012 : false;
        d.wind_cap_2018 = (d.wind_cap_2018 != 'null') ? +d.wind_cap_2018 : false;
        d.wind_cap_2024 = (d.wind_cap_2024 != 'null') ? +d.wind_cap_2024 : false;
        d.wind_cap_2030 = (d.wind_cap_2030 != 'null') ? +d.wind_cap_2030 : false;
    });

    data = data.filter(function(obj) {
        return obj.state != 'DC';
    });

    //console.log(data);
    createHeatmap(data);
});


function createCaiso(data) {
    caiso = new Caiso('caiso', data);
}

function createHeatmap(data) {
    vertHeatmap = new VerticalHeatmap('projected-capacity', data);
}