// A point representing the general location of deepwater horizon oil rig.
var dw = ee.Geometry.Point([-88.36555556,28.73805556]);

// Pull in MODIS Aqua imagery and visualize the sunglint oil.
var mod2 = ee.ImageCollection("MODIS/006/MYD09GA")
  .filterDate("2010-05-25","2010-05-26");

// Add to map.
Map.addLayer(mod2, {bands: ["sur_refl_b01","sur_refl_b04","sur_refl_b03"],
gamma: 1,
max: 10278.86,
min: 192.14000000000001,
opacity: 1}, "mod2", 0);

// Add Deepwater Horizon location to map.
Map.addLayer(dw,{},"DWH");
// Set map to center on deep water horizon location
Map.setCenter(-88.36555556,28.73805556, 8);

// Visualize smoke plume
// Pull in MODIS aqua imagery and filter for specific date.
var smokePlume = ee.ImageCollection("MODIS/006/MYD09GA")
  .filterDate("2010-04-21","2010-04-22");

// Add to map.
Map.addLayer(smokePlume, {bands: ["sur_refl_b01","sur_refl_b04","sur_refl_b03"],
gamma: 1.32,
max: 3278.86,
min: 192.14000000000001,
opacity: 1}, "smokePlume", 0);

//Video of Landscape
// Buffer around the deep water horizon site.
var buffer = dw.buffer({distance:150000} );

Map.addLayer(buffer, {}, 'buffer');

// Define the visualization parameters.
var vis = {gamma: 1,
max: 10278.86,
min: 192.14000000000001,
opacity: 1};

var collection = ee.ImageCollection("MODIS/006/MYD09GA")
  // Get four months of imagery.
  .filterDate('2010-04-01','2010-7-30')
  // Need to have 3-band imagery for the video.
  .select(['sur_refl_b01', 'sur_refl_b04', 'sur_refl_b03'])
  // Use the map function to apply the same visualizations to all images.
  .map(function(image) {
    return image.visualize(vis);
  });

Map.addLayer({eeObject: collection, name:'Video images'});  

// Export (change dimensions or scale for higher quality).
Export.video.toDrive({
  collection: collection,
  description: 'modisDWH',
  dimensions: 720,
  framesPerSecond: 4,
  region: buffer
});
