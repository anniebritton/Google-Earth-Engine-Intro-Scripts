//Module 9: Ocular Sampling
//Use remote sensing data to generate a set of potential sampling sites for a study on Elk herbivory.

// Call in NAIP imagery as an image collection.
var NAIP = ee.ImageCollection("USDA/NAIP/DOQQ")
  .filterBounds(roi)
  .filterDate("2015-01-01", "2017-12-31");
print(NAIP);

// Filter the data based on date.
var naip2017 = NAIP
  .filterDate("2017-01-01", "2017-12-31");

var naip2015 = NAIP
.filterDate("2015-01-01", "2015-12-31");

// Define viewing parameters for multi band images.
var visParamsFalse = {bands:['N', 'R', 'G']};
var visParamsTrue = {bands:['R', 'G', 'B']};

// Add both sets of NAIP imagery to the map to compare coverage.
Map.addLayer(naip2015,visParamsTrue,"2015_true",false );
Map.addLayer(naip2017,visParamsTrue,"2017_true",false );

// Add 2015 false color imagery.
Map.addLayer(naip2015, visParamsFalse, "2015_false", false);

// Creating a geometry feature.
var enclosure = ee.Geometry.MultiPolygon(
[
  [
    [-107.91079184,39.012553345],
    [-107.90828129,39.012553345],
    [-107.90828129,39.014070552],
    [-107.91079184,39.014070552],
    [-107.91079184,39.012553345]
  ],
  [
    [-107.9512176,39.00870162],
    [-107.9496834,39.00870162],
    [-107.9496834,39.00950196],
    [-107.95121765,39.00950196],
    [-107.95121765,39.00870162]
  ]
]);

print(enclosure)
Map.addLayer(enclosure, {}, "exclosures");

// Load in elevation dataset clip it to general area.
var elev = ee.Image("USGS/NED")
  .clip(roi);

print(elev, "elevation");
Map.addLayer(elev, {min: 1500, max: 3300}, "elevation", false);

// Apply mosaic, clip, then calculate NDVI.
var ndvi = naip2015
.mosaic()
.clip(roi)
.normalizedDifference(["N","R"])
.rename("ndvi");

Map.addLayer(ndvi, {min:-0.8, max:0.8}, "NDVI" , false);
print(ndvi,"ndvi");

// Add National Land Cover Database (NLCD) with color palette.
var dataset = ee.ImageCollection('USGS/NLCD');
print(dataset, "NLCD");

// Wrap the selected image in ee.Image, which redefines datatype for proper visualization.
var landcover = ee.Image("USGS/NLCD/NLCD2016")
  .select("landcover")
  .clip(roi);
print(landcover, "Landcover Image");
//
Map.addLayer(landcover, {}, "Landcover" , false);

// Generate random points within the sample area.
var points = ee.FeatureCollection.randomPoints({
region: sampleArea,
points:1000,
seed: 1234}
);
print(points,"points");
Map.addLayer(points, {}, "Points" , false);

// Add bands of elevation and NAIP.
var ndviElev = ndvi
  .addBands(elev)
  .addBands(landcover);
print(ndviElev, "Multi band image");

// Extract values to points.
var samples = ndviElev.sampleRegions({
  collection: points,
  scale: 30 ,
  geometries: true
});
print(samples,'samples');
Map.addLayer(samples,{}, "samples" , false);

// Set the NDVI range.
var ndvi1 = ndvi
  .reduceRegion(
    {reducer:ee.Reducer.mean(),
    geometry: enclosure,
    scale: 1,
    crs:'EPSG:4326'}
    );
print(ndvi1, "Mean NDVI");

// Generate a range of acceptable NDVI values.
var ndviNumber = ee.Number(ndvi1.get("ndvi"));
var ndviBuffer = ndviNumber.multiply(0.1);
var ndviRange = [ndviNumber.subtract(ndviBuffer),
  ndviNumber.add(ndviBuffer)];
print(ndviRange, "NDVI Range");
