
/*
 *  Hero Map - Object constructor function
 *  @param parentElement   -- HTML element in which to draw the visualization
 */

HeroMap = function(parentElement) {
  this.parentElement = parentElement;
  this.center = [39.277449, -97.632677];
  this.zoomLevel = 4;
  this.zooms = [
    {
      coords: [38.038871, -98.193081],
      zoom: 6,
    },
    {
      coords: [37.080226, -121.093610],
      zoom: 6,
    },
    {
      coords: [34.511849, -84.111551],
      zoom: 6,
    },
    {
      coords: [44.789512, -93.237506],
      zoom: 6,
    },
    {
      coords: [44.049994, -71.209221],
      zoom: 6,
    },
    {
      coords: [45.255218, -114.551618],
      zoom: 6,
    },
    {
      coords: [36.349276, -98.272934],
      zoom: 6,
    },
    {
      coords: [42.605218, -95.887760],
      zoom: 6,
    },
  ]

  this.initVis();
}


/*
 *  Initialize hero map
 */

HeroMap.prototype.initVis = function() {
  var vis = this;

  // Change images location
  L.Icon.Default.imagePath = 'img';

  vis.map = L.map(vis.parentElement).setView(vis.center, vis.zoomLevel);

  vis.basemap = L.esri.basemapLayer('Imagery').addTo(vis.map)

  vis.turbines = L.esri.dynamicMapLayer({
        url: "http://eerscmap.usgs.gov/arcgis/rest/services/wind/wTurbinesWM/MapServer",
        style: function () {
          return { color: "#70ca49", weight: 2 };
        }
      }).addTo(vis.map);

  panMap();

  function panMap() {
    var rando = Math.floor(Math.random() * vis.zooms.length);
    setTimeout(function() {
      var zoom = vis.zooms[rando];
      vis.map.setView(zoom.coords, zoom.zoom, {animate: true, duration: 2})
      panMap();
    }, 10000);
  }
}
