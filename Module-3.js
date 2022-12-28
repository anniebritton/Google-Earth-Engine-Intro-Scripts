// Image Collection Exploration
var dataset = ee.ImageCollection("MODIS/006/MYD10A1")

// Limit the collection date range to 2018.
var dataset = dataset
.filterDate('2018-01-01', '2018-12-31');

// Select the snow cover layer and compute the mean.
var snowCover = dataset
.select('NDSI_Snow_Cover')
.mean();

// Define the visualization parameters and add the collection to the map.
var snowCoverVis = {min: 0.0, max: 100.0, palette: ['black', '0dffff', '0524ff', 'ffffff']};
Map.addLayer(snowCover, snowCoverVis, 'Snow Cover');

// Determining temporal resolution
var dataset = dataset
.filterBounds(ee.Geometry.Point(-70.523, 43.888)); // Use your own coordinates here!

// Print the number of images in the collection
print('Count: ', dataset.size());

// Print the whole date range of the filtered collection.
var range = dataset.reduceColumns(ee.Reducer.minMax(), ["system:time_start"])
print('Date range: ', ee.Date(range.get('min')), ee.Date(range.get('max')));

// Raster Interpretation and Visualization

//This is a dictionary object. It has a key and an item.
var dictionary_one = {key: 'item', term: 'value'};
var dictionary_two = {first_key: 1.1, second_key: 2.2, third_key: 3.3};
print(dictionary_one,"dict1");
print(dictionary_two, "dict2");

// Occasionally, dictionary items can be lists. Lists are simply containers for multiple items.
var dictionary_with_list = {key: ['item1', 'item2', 'item3']};
print(dictionary_with_list, "dictList");

// Load the Landsat image collection.
var ls8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2");

// Filter the collection by date and cloud cover.
var ls8 = ls8
.filterDate('2017-05-01','2017-09-30')
.filterMetadata('CLOUD_COVER','less_than', 3.0);

// Applies scaling factors.
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

ls8 = ls8.map(applyScaleFactors);

// There are a number of keys that you can use in a visParams dictionary.
// Here, we are going to start by defining our 'bands', 'min', 'max', and 'gamma' values.
// You can think of 'gamma' essentially as a brightness level.
var ls_tci = {bands: ['SR_B4','SR_B3','SR_B2'], min: 0, max: 0.3};

Map.setCenter(-73.755, 45.5453, 11);
Map.addLayer(ls8, ls_tci, 'True Color');

// Add the Color Infrared visualization.
var ls_ci = {bands: ['SR_B5','SR_B4','SR_B3'], min: 0, max: .3, gamma: [0.7, 1, 1]};
Map.addLayer(ls8, ls_ci, 'Color Infrared');

// Add the False Color 1 visualization.
var ls_fc1 = {bands: ['SR_B6','SR_B5','SR_B4'], min: 0, max: .4, gamma: 0.9};
Map.addLayer(ls8, ls_fc1, 'False Color 1');

// Add the False Color 2 visualization.
var ls_fc2 = {bands: ['SR_B7','SR_B6','SR_B4'], min: 0, max: .3, gamma: 0.9};
Map.addLayer(ls8, ls_fc2, 'False Color 2');


//// Single Band Visualization

/// Continuous Data
// Load and select the Gross Primary Production (GPP) image collection.
var dataset = ee.ImageCollection('UMT/NTSG/v2/LANDSAT/GPP')
                  .filter(ee.Filter.date('2018-05-01', '2018-10-31'));
var gpp = dataset.select('GPP');

// Build a set of visualization parameters and add the GPP layer to the map.
var gppVis = {
  min: 0.0,
  max: 500.0,
  palette: ['ffffe5','f7fcb9','d9f0a3','addd8e','78c679','41ab5d','238443','005a32']};

Map.setCenter(-120.9893, 47.2208, 10);
Map.addLayer(gpp, gppVis, 'GPP');

// Categorical Data
// Load the NLCD image collection and select the land cover layer.
var dataset = ee.ImageCollection('USGS/NLCD');
var landcover = dataset.select('landcover');

// Values from 41-43 represent explicitly defined forest types.
var landcoverVis = {
  min: 41.0,
  max: 43.0,
  palette: ['black','green', 'green','green','black'],
  opacity: 0.75
};

Map.setCenter(-120.9893, 47.2208, 10);
Map.addLayer(landcover, landcoverVis, 'Landcover');














