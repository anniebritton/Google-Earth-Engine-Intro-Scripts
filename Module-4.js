//Module 4: Moving Data In and Out of Google Earth Engine
//Integrate daily weather data with GPS locations from a cougar to analyze how weather affects the cat’s movement.

// imported the data and not add it to the map and print
Map.addLayer(cougarF53, {}, "cougar presence data")
print(cougarF53, "cougar data")

// Center on Data
Map.setCenter(-112.0094, 38.3751);

// Call in image and filter.
var Daymet = ee.ImageCollection("NASA/ORNL/DAYMET_V4")
.filterDate("2014-01-01", "2017-08-01")
.filterBounds(AOI)
//.select('tmin')

//Clipping image to the geometry
.map(function(image){return image.clip(AOI)});

print(Daymet,"Daymet");
Map.addLayer(Daymet, {}, "Daymet");

// Convert to a multiband image and clip.
var DaymetImage = Daymet
  .toBands()
  //.filterBounds(geometry);

print(DaymetImage, "DaymetImage");

// Call the sample regions function.
var samples = DaymetImage.sampleRegions({
  collection: cougarF53,
  properties: ['id'],
  scale: 1000 });
print(samples,'samples');

// Export value added data to your Google Drive.
Export.table.toDrive({
  collection: samples,
  description:'cougarDaymetToDriveExample',
  fileFormat: 'csv'
});

// Apply a median reducer to the dataset.
var Daymet1 = Daymet
  .median()
  .clip(AOI);
  
print(Daymet1);

// Export the image to drive.
Export.image.toDrive({
  image: Daymet1,
  description: 'MedianValueForStudyArea',
  scale: 1000,
  region: AOI,
  maxPixels: 1e9
});
