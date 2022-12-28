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
