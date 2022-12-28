//Module 7: Image Classification
//Generate predictions of aspen presence and absence in western Colorado using the randomForest algorithm and Landsat data.

// Import and filter Landsat 8 surface reflectance data.
var LS8_SR1 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
  .filterDate('2015-08-01', '2015-11-01') //new date
  .filter(ee.Filter.eq('WRS_PATH', 35))
  .filter(ee.Filter.eq('WRS_ROW', 33))
  .filterMetadata('CLOUD_COVER', 'less_than', 20);

// Create true color visualization parameters 
// to take an initial look at the study area.
var visTrueColor = {bands: ["B4","B3","B2"], max:2742, min:0};
Map.addLayer(LS8_SR1, visTrueColor, 'LS8_SR1', false);
Map.centerObject(ee.Geometry.Point(-107.8583, 38.8893), 8);

// Define a cloud mask function specific to Landsat 8.
var maskClouds = function(image){
  var clear = image.select('pixel_qa').bitwiseAnd(2).neq(0);    
  return image.updateMask(clear);   
};

// Apply the cloud mask function to the previously filtered image 
// collection and calculate the median.
var LS8_SR2 = LS8_SR1
  .map(maskClouds)
  .median();
Map.addLayer(LS8_SR2, visTrueColor, 'LS8_SR2 - masked')

// First define individual bands as variables.
var red = LS8_SR2.select('B4').rename("red")
var green= LS8_SR2.select('B3').rename("green")
var blue = LS8_SR2.select('B2').rename("blue")
var nir = LS8_SR2.select('B5').rename("nir")
var swir1 = LS8_SR2.select('B6').rename("swir1")
var swir2 = LS8_SR2.select('B7').rename("swir2")

// Then, calculate three different vegetation indices: NDVI, NDWI, and TCB.
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('ndvi');
var ndwi = green.subtract(nir).divide(green.add(nir)).rename('ndwi');
var TCB = LS8_SR2.expression(
  "0.3029 * B2 + 0.2786 * B3 + 0.4733 * B4 + 0.5599 * B5 + 0.508 * B6 + 0.1872 * B7" , {
  'B2': blue,
  'B3': green,
  'B4': red,
  'B5': nir,
  'B6': swir1,
  'B7': swir1
  }).rename("TCB");

// Combine the predictors into a single image.
var predictors = nir
.addBands(blue)
.addBands(green)
.addBands(red)
.addBands(swir1)
.addBands(swir2)
.addBands(ndvi)
.addBands(TCB)
.addBands(ndwi)

print('predictors: ', predictors);

var PA = ee.FeatureCollection('users/GDPE-GEE/Module7_PresAbs');
Map.addLayer(PA.style({color: 'red', pointSize: 3, width: 1, fillColor: 'white'}),{}, 'Merged_Presence_Absence');

var samples = predictors.sampleRegions({
  collection: PA,
  properties: ['presence'],
  scale: 30 });
