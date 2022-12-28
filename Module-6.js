// Call in image by unique ID.
var bioClim = ee.Image("WORLDCLIM/V1/BIO");
print(bioClim, "bioClim");

// Select specific band, clip to region of interest, and rename.
var precip = bioClim
  .select("bio12")
  .clip(geometry)
  .rename("precip");

Map.addLayer(precip, {min:240 , max:1300}, "precip", false);

// Call in collection base on unique ID and print.
var crops = ee.ImageCollection("USDA/NASS/CDL");
print(crops, "crops");

// Filter collection by a date range and pull a specific image from the collection.
var crop2016 = crops
  .filterDate("2016-01-01","2016-12-30")
  .select(['cropland']);
print(crop2016, "crop2016");

// Call the specific image by the unique ID, select band of interest, and clip to region of interest.
var cropType2016 =  ee.Image("USDA/NASS/CDL/2016")
  .select("cropland")
  .clip(geometry);
print(cropType2016, "cropType2016");
Map.addLayer(cropType2016, {}, "cropType2016", false);


// Evapotranspiration: call in image collection by unique ID and print to understand data structure.
var et = ee.ImageCollection("MODIS/006/MOD16A2")
  .filterBounds(geometry);
print(et, "modisET");

// Filter by data, select band, apply reducer to get single image and clip image.
var et2 = et
  .filterDate("2016-07-01","2016-09-30")
  .select(['ET'])
  .median()
  .clip(geometry);

Map.addLayer(et2, {max: 357.18 , min: 29.82}, "evapotransparation", false);

// Gross Primary Productivity.
var GPP = ee.ImageCollection("UMT/NTSG/v2/MODIS/GPP");
print(GPP, "modisGPP");

var GPP2 = GPP
  .filterDate("2016-07-01","2016-09-30")
  .select(['GPP'])
  .median()
  .clip(geometry);

Map.addLayer(GPP2, {max: 1038.5 , min: 174.5}, "gross Primary Productivity", false);

// Pulling in NDVI data.
var LS8NDVI = ee.ImageCollection("LANDSAT/LC8_L1T_32DAY_NDVI")
print(LS8NDVI, "ls8NDVI");
// Filter, reduce, then clip.
var LS8NDVI2 = LS8NDVI
  .filterDate("2016-07-01","2016-09-30")
  .median()
  .clip(geometry);

Map.addLayer(LS8NDVI2, {max: 0.66 , min: -0.23}, "NDVI", false);


// Call in Landsat 8 surface reflectance Image Collection, filter by region and cloud cover, and reduce to single image.
var LS8_SR2 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
.filterDate("2017-07-01","2017-09-30")
  .filterBounds(geometry)
  .filterMetadata('CLOUD_COVER', 'less_than', 20)
  .median();

print(LS8_SR2,'LS8_SR2');

// Pull bands from the LS8 image and save them as images.
var red = LS8_SR2.select('B4').rename("red");
var nir = LS8_SR2.select('B5').rename("nir");
print(red);

// // Generate NDVI based on predefined bands.
// var ndvi1 = nir.subtract(red).divide(nir.add(red)).rename('ndvi');

// Map.addLayer(ndvi1, {max: 0.66 , min: -0.23},'NDVI1',false);

// Define LS8 NDVI using built in normalized difference function.
var ndvi2 = LS8_SR2.normalizedDifference(['B5', 'B4']);
Map.addLayer(ndvi2, {max: 0.66 , min: -0.23},'NDVI2',false);

// Use the expression function to generate NDVI.
var ndvi3 = LS8_SR2.expression("(nir - red) / (nir+red)", {
   "nir" : nir,
   "red" : red }
 )

Map.addLayer(ndvi3, {max: 0.66 , min: -0.23},'NDVI3',false);
