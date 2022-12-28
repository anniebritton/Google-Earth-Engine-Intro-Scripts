//Module 1: Introduction to Google Earth Engine
//Get acquainted with the user interface and visualize image differences before and after the High Park Fire.

// Call in NAIP imagery as an image collection.
var NAIP = ee.ImageCollection("USDA/NAIP/DOQQ");

// Filter your dataset from the entire collection to the year of interest and extent.
var naip2019 = NAIP
  .filterDate("2019-01-01", "2019-12-31");

// Define visualization parameters.
var visParamsFalse = {bands:['N', 'R', 'G']};
var visParamsTrue = {bands:['R', 'G', 'B']};

// Add 2019 imagery to the map with false color and true color composites
// here we specify either 'true; or 'false' in the third argument to toggle the layer to show automatically or to stay hidden when the code is exicuted. 
Map.addLayer(naip2019,visParamsFalse, "2019_false", true );
Map.addLayer(naip2019,visParamsTrue, "2019_true", false );
