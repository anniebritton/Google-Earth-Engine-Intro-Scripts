// Load an initial image to test view a cloudy image.
var sr = ee.Image('LANDSAT/LC08/C01/T1_SR/LC08_027026_20180829');

// Define visparams for true-color image.
var srvis = {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000, gamma: 1.4};

// Add your cloudy image to the map.
//Map.addLayer(sr, srvis, 'single_scene');
Map.setCenter(-91.8859, 48.8936, 8.81);

// Define simple cloud mask, based in values from the 'pixel_qa' band.
// Essentially, values of 322 = land and 324 = water.
var qa = sr.select('pixel_qa');
var mask = qa.eq(322).or(qa.eq(324));
var sr_cm = sr.updateMask(mask);

// Add your new map for comparison to the cloudy image.
Map.addLayer(sr_cm, srvis, 'single_scene_masked');


// Define how your cloudMask function should work.
var cloudMask = function(image) {
  // var mask = image.select('pixel_qa').eq(322).or(image.select('pixel_qa').eq(324));
  var mask = image.select('pixel_qa').eq(322);
  return image.mask(mask);
};

// This time we'll look at a more ecologically-focused example, using NDVI.
var collection = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
.filterDate('2018-06-01','2018-09-30')
.filter(ee.Filter.calendarRange(140, 270)) // roughly, our potential growing season
.filterMetadata('WRS_PATH', 'equals', 27)
.filterMetadata('WRS_ROW', 'equals', 26)
.map(cloudMask)
.map(function NDVI(i){
  return i.addBands(i.normalizedDifference(['B5','B4']).rename('NDVI'))  // generates NDVI band
});

var median = collection.median();

// Red = lower values and darker green = higher values
var collectionVis = {bands: 'NDVI', min: 0.5, max: 0.95, palette: ['red','yellow','green','003300']};

Map.addLayer(median, collectionVis, 'NDVI');

// Create counts band.
var counts = collection.select('NDVI').count();

// Find our potential maximum count by getting the size of the initial image collection.
print(collection.size());

// In this palette, red = lower values and blue = higher values.
var countVis = {min: 0, max: 6, palette: ['b2182b','ef8a62','fddbc7', 
                                          'd1e5f0','67a9cf','2166ac']};
Map.addLayer(counts, countVis, 'counts');

// Draw your own rectangle and try to cover most of the Landsat scene and 
// then we'll make a histogram of the distribution. Because the scene area 
// is so large  GEE requires us to perform some aggregating. But this will 
// give us a general sense of our distribution.
var histogram = ui.Chart.image.histogram(counts, geometry, 120);

// Display the histogram.
print(histogram);
