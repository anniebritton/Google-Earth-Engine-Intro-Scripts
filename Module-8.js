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

/// Algal Blooms
// Set map to center on deep water horizon location
Map.setCenter(-88.36555556,28.73805556, 7);

// Define visualization parameters so the images are both presented in the same way.
var vis2 = {min:-7, max:14};

// Generate the based dataset for our processes.
var mod09 = ee.ImageCollection("NASA/OCEANDATA/MODIS-Aqua/L3SMI")
  .filterDate("2009-04-20","2009-07-31")
  .select("chlor_a")
  .median();
Map.addLayer(mod09, vis2, "09", 0);

// Generate the based dataset for our processes.
var mod10 = ee.ImageCollection("NASA/OCEANDATA/MODIS-Aqua/L3SMI")
  .filterDate("2010-04-20","2010-07-31")
  .select("chlor_a")
  .median();
Map.addLayer(mod10, vis2, "10", 0);

// Difference the model by subtracting.
var diff = mod10.subtract(mod09);
Map.addLayer(diff, {min:-6, max:6}, "diff", 0);

// Trend Analysis
var constructMODDict = function(geometry)
  /*
  This function takes in a geometry feature from the GUI and uses it to
  generate a dictionary of median reduce images for the specified date range
  inputs
  geometry = geometry object representing you area of interest
  y_list = set based on sensor type
  imagecollection = unique id for collection type
  filterDate = cat() this is used to refine the month and day of start and end time
  With adaptation this should be flexible across sensors and times
  */
  {
  var startMonth = "-04-20";
  var endMonth = "-07-31";
  // Construct a dictionary for MODIS.
  var y_list = ee.List.sequence(2002, 2018);
  var ystr_list = y_list.map(function(y){return ee.Number(y).format('%1d')});
  var mod = y_list.map(function(y){return ee.ImageCollection('NASA/OCEANDATA/MODIS-Aqua/L3SMI')
                                          .filterDate(ee.String(ee.Number(y).format('%1d')).cat(startMonth),
                                                      ee.String(ee.Number(y).format('%1d')).cat(endMonth))
                                          .select("chlor_a")
                                          .median()
                                          .clip(geometry);
  })
  var mod_dict = ee.Dictionary.fromLists(ystr_list, mod);
  // Return MODIS dictionary.
  return mod_dict;
};

// Apply function across the new geometry.
var elements = constructMODDict(geometry);
print(elements, "Image dictionary");

// Convert the images in the dictionary to an image collection.
var collection2 = ee.ImageCollection.fromImages([
  ee.Image(elements.get('2002')),
  ee.Image(elements.get('2003')),
  ee.Image(elements.get('2004')),
  ee.Image(elements.get('2005')),
  ee.Image(elements.get('2006')),
  ee.Image(elements.get('2007')),
  ee.Image(elements.get('2008')),
  ee.Image(elements.get('2009')),
  ee.Image(elements.get('2010')),
  ee.Image(elements.get('2011')),
  ee.Image(elements.get('2012')),
  ee.Image(elements.get('2013')),
  ee.Image(elements.get('2014')),
  ee.Image(elements.get('2015')),
  ee.Image(elements.get('2016')),
  ee.Image(elements.get('2017')),
  ee.Image(elements.get('2018'))
  ]);

print(collection2)
Map.addLayer(collection2,{},'ic')


// Trends In Individual Images Over an Area
// Define start and end dates.
var start = '2008-01-01';
var end = '2012-12-31';

// Select all images with the months of April to July with a date range
var col = ee.ImageCollection("NASA/OCEANDATA/MODIS-Aqua/L3SMI")
  .filterDate(start, end)
  .filter(ee.Filter.calendarRange(4,7,'month'))
  .filterBounds(geometry)
  .select("chlor_a");

print(col, "Individual Images By Year");

// Define start and end dates.
var start = '2008-01-01';
var end = '2012-12-31';

// Select all images with the months of April to July with a date range
var col = ee.ImageCollection("NASA/OCEANDATA/MODIS-Aqua/L3SMI")
  .filterDate(start, end)
  .filter(ee.Filter.calendarRange(4,7,'month'))
  .filterBounds(geometry)
  .select("chlor_a");

print(col, "Individual Images By Year");

// Plot a time series of the chlor_a at a single location or summarize values within an area.
var l8Chart = ui.Chart.image.series({imageCollection: col,
   region: roi,
   reducer: ee.Reducer.median()}
 ).setChartType('ScatterChart');

print(l8Chart);
