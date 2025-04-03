/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var gedi_image = ee.ImageCollection("LARSE/GEDI/GEDI02_A_002_MONTHLY"),
    srtm_dtm = ee.Image("CGIAR/SRTM90_V4"),
    logo_cgat_path = ee.Image("projects/pabcrepe-gedi-error/assets/logo/logo_cgat"),
    logo_gedifix_path = ee.Image("projects/pabcrepe-gedi-error/assets/logo/logo_gedifix"),
    logo_upv_path = ee.Image("projects/pabcrepe-gedi-error/assets/logo/logo_upv");
/***** End of imports. If edited, may not auto-convert in the playground. *****/

var url_cgat = 'https://cgat.webs.upv.es/';
var url_upv = 'https://www.upv.es/';
var output_filename;
var threshold_height;
var srtm_elipsoidal;
var logo_gedifix = ui.Thumbnail({
  image: logo_gedifix_path,
  params: {dimensions: '100x100'}, 
  style: {margin: '0px 10px 0px 0px'}
});
var logo_cgat = ui.Thumbnail({
  image: logo_cgat_path,
  params: {dimensions: '100x100'}, 
  style: {margin: '0px 10px 0px 0px'},
});
var logo_upv = ui.Thumbnail({
  image: logo_upv_path,
  params: {dimensions: '100x100'}, 
  style: {margin: '0px 10px 0px 0px'},
});
var exit_draw = ui.Button({
  label: 'Exit',
  onClick: select_area_stop,
  style : {textAlign: 'center', margin: '2px 0px 0px 2px'}
});
// button to import custom geometry from geoJSON
var import_geojson = ui.Button({
  label: 'Import',
  onClick: function(){
    var geojs = prompt("Please paste your geoJSON file content below:");
    if(geojs){
      var igeom = ee.FeatureCollection(JSON.parse(geojs)).geometry();
      igeom.evaluate(function(geom){
        Map.drawingTools().addLayer([geom]);
      });
    }
  },
  style : {textAlign: 'center', margin: '2px 0px 0px 2px'}
});
var drawingPanel = ui.Panel({widgets: [ui.Label('Draw/import a polygon', {textAlign: 'center', width: '160px'}), import_geojson, exit_draw], layout: ui.Panel.Layout.flow('horizontal')});
var val_panel = ui.Panel();
val_panel.style().set({
  position: 'bottom-center',
  width: '310px',
  shown: false
});
var val_panel_in = ui.Panel();
val_panel.add(val_panel_in);
Map.add(val_panel);
var uiPanel = ui.Panel({
  style: {
    width: '30%',
    position: 'top-right',
    padding: '10px',
    height: '90%',
    backgroundColor: '#ececec' 
  }
});
var title = ui.Label({
  value: 'GEDIFIX',
  style: {fontSize: '20px', textAlign: 'center', margin: '10px 0px 0px 0px', fontWeight: 'bold', color: '#0b263d', backgroundColor: '#ececec' }
});
var subtitle = ui.Label({
  value: 'Identification of potential geolocation errors in GEDI data',
  style: {fontSize: '14px', fontWeight: 'bold', color: '#1d6baf', backgroundColor: '#ececec', margin: '10px 3px'}
});
var description = ui.Panel([
    ui.Label({value: "This tool identifies GEDI beams with a potential geolocation error. To do this, this tool (1) quantifies the difference between the terrain elevation extracted from a global digital terrain model (i.e., SRTM) and the one estimated by the attribute 'elev_lowestmode' from GEDI data; and (2) shows those beams where the absolute height difference is above the height threshold set by the user.", style: {backgroundColor: '#ececec' }}),
    ui.Label({value: "The user must:", style: {backgroundColor: '#ececec' }}),
    ui.Label({value: "    → 1. Select the study area", style: {backgroundColor: '#ececec' }}),
    ui.Label({value: "    → 2. Set the height threshold in meters", style: {backgroundColor: '#ececec' }}),
    ui.Label({value: "    → 3. Set the output filename (without extension)", style: {backgroundColor: '#ececec' }}),
    ui.Label({value: "    → 4. Launch the process", style: {backgroundColor: '#ececec' }}),
    ui.Label({value: "As a result, two csv files are created:", style: {backgroundColor: '#ececec' }}),
    ui.Label({value: "    → 1. Height differences at the beam level", style: {backgroundColor: '#ececec' }}),
    ui.Label({value: "    → 2. Height differences statistics at the orbit level", style: {backgroundColor: '#ececec' }}),
  ],null,{textAlign: 'justify', width: '100%', backgroundColor: '#ececec' });
var drawingTools = Map.drawingTools();
drawingTools.setShown(false);
drawingTools.clear();
var drawButton = ui.Button({
  label: 'Select Area',
  onClick: function() {
    drawingTools.setShape('polygon');
    drawingTools.draw();
    val_panel.style().set({shown: true});
    val_panel_in.clear();
    val_panel_in.add(drawingPanel);
  },
  style:{
    color: '#1d6baf',
    border: '1px solid black'
  }
});
var clearButton = ui.Button({
  label: 'Remove Area(s)',
  onClick: function() {
    drawingTools.stop();
    drawingTools.clear();
    drawingTools.layers().reset([]);
    val_panel_in.remove(drawingPanel);
    val_panel.style().set({shown: false});
    Map.layers().reset([]);
  },
  style:{
    border: '1px solid black'
  }
});
var numericInput = ui.Textbox({
  placeholder: 'Height Threshold (m)',
  value: '',
  onChange: function(value) {
    if (!/^[0-9.]+$/.test(value)) {
      alert('Only numeric values are accepted.');
      numericInput.setValue('');
    }
  }
});
var fileNameInput = ui.Textbox({
  placeholder: 'Output Name',
  value: ''
});
var executeButton = ui.Button({
  label: 'Run',
  onClick: function() {
    executeFunction();
  },
  style:{
    width: '160px',
    color: '#1d6baf',
    border: '1px solid black'
  }
});
var developerLabel = ui.Label({
  value: 'Developped by',
  style: {fontSize: '14px',  fontWeight: 'bold', textAlign: 'center', color: 'gray', backgroundColor: '#ececec'}
});
function drawnGeometry() {
  return Map.drawingTools().layers().length() > 0;
}
function isTextboxFilled(textbox) {
  var value = String(textbox.getValue()).trim();
  return value !== null && value !== undefined && value !== "";
}
function executeFunction() {
  var heightThresholdFilled = isTextboxFilled(numericInput);
  var outputFilled = isTextboxFilled(fileNameInput);
  if (drawnGeometry() && heightThresholdFilled && outputFilled) {
    output_filename = String(fileNameInput.getValue()).trim();
    threshold_height = parseFloat(numericInput.getValue());
    process_execution();
  } else if(!drawnGeometry() && !heightThresholdFilled && !outputFilled){
    alert('You must draw a study area, and insert the height threshold and the output filename.');
  } else {
    if (!drawnGeometry()){
      alert('You must draw a study area.');
    }
    if (!heightThresholdFilled){
      alert('You must insert the height threshold.');
    }
    if (!outputFilled) {
      alert('You must insert the output filename.');
    }
  }
}
function select_area_stop(){
    val_panel_in.clear();
    drawingTools.stop();
    val_panel_in.remove(drawingPanel);
    val_panel.style().set({shown: false});
}
var titlePanel = ui.Panel({
  widgets: [title, subtitle],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {backgroundColor: '#ececec', padding: '5px'}
});
var header = ui.Panel({
  widgets: [logo_gedifix, titlePanel],
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {backgroundColor: '#ececec', padding: '10px'}
});
uiPanel.add(header);
uiPanel.add(ui.Panel({style:{border:'1px solid #c0b09e',margin:'15px'}}));
uiPanel.add(description);
var buttonPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {backgroundColor: '#ececec'}
});
uiPanel.add(ui.Panel({style:{border:'1px solid #c0b09e',margin:'15px'}}));
buttonPanel.add(drawButton);
buttonPanel.add(clearButton);
uiPanel.add(buttonPanel);
uiPanel.add(numericInput);
uiPanel.add(fileNameInput);
uiPanel.add(executeButton);
var urlLabel_beam = ui.Label('Download beam-level', {shown: false});
uiPanel.add(urlLabel_beam);
var urlLabel_orbit = ui.Label('Download orbit-level', {shown: false});
uiPanel.add(urlLabel_orbit);
uiPanel.add(ui.Panel({style:{border:'1px solid #c0b09e',margin:'15px'}}));
uiPanel.add(developerLabel);
var label_cgat = ui.Label({
  value: 'CGAT',
  style: {fontSize: '20px', textAlign: 'center', margin: '0px 0px 5px 25px', backgroundColor: '#ececec'}
}).setUrl(url_cgat);
var label_upv = ui.Label({
  value: 'UPV',
  style: {fontSize: '20px', textAlign: 'center', margin: '0px 0px 5px 25px', backgroundColor: '#ececec'}
}).setUrl(url_upv);
var container_cgat = ui.Panel({
  widgets: [label_cgat, logo_cgat],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {backgroundColor: '#ececec'}
});
var container_upv = ui.Panel({
  widgets: [label_upv, logo_upv],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {backgroundColor: '#ececec'}
});
var developers = ui.Panel({
  widgets: [container_cgat, container_upv],
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {backgroundColor: '#ececec', padding: '0px'}
});
uiPanel.add(developers);
Map.setControlVisibility({all: false, mapTypeControl: true});
Map.add(uiPanel);
/////////////////////////////////////////
var egm96 = ee.Image('projects/pabcrepe-gedi-error/assets/data/EGM96_geoid');
var filter_gedi_data = function(image) {
  var image_quality_flag = image.select(['quality_flag']).eq(1);
  var image_degrade_flag = image.select(['degrade_flag']).neq(1);
  var image_sensitivity = image.select(['sensitivity']).gt(0.95);
  
  var binary_filter = image_quality_flag.multiply(image_degrade_flag).multiply(image_sensitivity);
  
  return image.updateMask(binary_filter);
};
var calculate_absolute_difference_height = function(image){
  var height_difference = (image.select(['elev_lowestmode']).subtract(srtm_elipsoidal)).abs();
  height_difference = height_difference.rename(['Height_Difference']);
  
  var time_start_property = ee.Date(image.get('system:time_start'));
  var time_end_property = ee.Date(image.get('system:time_end'));
  
  var band_year_start = ee.Image.constant(time_start_property.get('year')).rename('year_start');
  var band_month_start = ee.Image.constant(time_start_property.get('month')).rename('month_start');
  var band_day_start = ee.Image.constant(time_start_property.get('day')).rename('day_start');
  var band_year_end = ee.Image.constant(time_end_property.get('year')).rename('year_end');
  var band_month_end = ee.Image.constant(time_end_property.get('month')).rename('month_end');
  var band_ay_end = ee.Image.constant(time_end_property.get('day')).rename('day_end');
  
  height_difference = height_difference.addBands(image, ['beam', 'orbit_number', 'shot_number_within_beam', 'lat_highestreturn', 'lon_highestreturn']);
  height_difference = height_difference.addBands(band_year_start);
  height_difference = height_difference.addBands(band_month_start);
  height_difference = height_difference.addBands(band_day_start);
  height_difference = height_difference.addBands(band_year_end);
  height_difference = height_difference.addBands(band_month_end);
  height_difference = height_difference.addBands(band_ay_end);
  
  return height_difference;
};
var conversion_type = function(image) {
  return image.cast({
    'year_start': 'int32',
    'month_start': 'int32',
    'day_start': 'int32',
    'year_end': 'int32',
    'month_end': 'int32',
    'day_end': 'int32'
  });
};
function process_execution(){
  var study_area = drawingTools.layers().get(0).toGeometry();
  Map.centerObject(study_area, 10);
  
  var gedi_selected = gedi_image.filterBounds(study_area);
  var srtm_study_area = srtm_dtm.clip(study_area);
  var egm96_study_area = egm96.clip(study_area);
  srtm_elipsoidal = srtm_study_area.add(egm96_study_area);
  
  var gedi_selected_filtered = ee.ImageCollection(gedi_selected.map(filter_gedi_data));
  
  var gedi_differences = ee.ImageCollection(gedi_selected_filtered.map(calculate_absolute_difference_height));
  
  gedi_differences = gedi_differences.map(conversion_type);
  
  var image_with_maximum = gedi_differences.qualityMosaic('Height_Difference');
  
  var band_names = ['Height_Difference', 'beam', 'orbit_number', 'shot_number_within_beam', 'lat_highestreturn', 'lon_highestreturn', 'year_start', 'month_start', 'day_start', 'year_end', 'month_end', 'day_end'];
  
  var selected_information = image_with_maximum.select(band_names);
  
  var height_differences_binary = selected_information.select(['Height_Difference']).gte(threshold_height);
  
  var selected_beams = selected_information.updateMask(height_differences_binary);
  
  Map.addLayer(selected_information.select(['Height_Difference']), {min:0, max: 200, palette:['blue','green','yellow','orange','red']}, 'Differences in height between GEDI and SRTM');
  
  Map.addLayer(selected_beams, {min:threshold_height, max:200, palette:['red'], bands:['Height_Difference']}, 'Height differences above threshold');
  
  var selected_beams_geometry = selected_beams.geometry();
  
  var pixels_selected = selected_beams.select(band_names).reduceRegion({
    reducer: ee.Reducer.toList(),
    geometry: study_area,
    scale: 25,
    maxPixels: 1e13
  });
  
  pixels_selected = ee.Dictionary(pixels_selected);
  
  var number_of_elements = ee.Number(ee.List(pixels_selected.get('beam')).size());
  
  var beams_feature_collection = ee.FeatureCollection(
    ee.List.sequence(0, number_of_elements.subtract(1)).map(function(index_element) {
      return ee.Feature(null, {
        'Height_Difference': ee.List(pixels_selected.get('Height_Difference')).get(index_element),
        'orbit_number': ee.List(pixels_selected.get('orbit_number')).get(index_element),
        'shot_number_within_beam': ee.List(pixels_selected.get('shot_number_within_beam')).get(index_element),
        'beam': ee.List(pixels_selected.get('beam')).get(index_element),
        'lat_highestreturn': ee.List(pixels_selected.get('lat_highestreturn')).get(index_element),
        'lon_highestreturn': ee.List(pixels_selected.get('lon_highestreturn')).get(index_element),
        'year_start': ee.List(pixels_selected.get('year_start')).get(index_element),
        'month_start': ee.List(pixels_selected.get('month_start')).get(index_element),
        'day_start': ee.List(pixels_selected.get('day_start')).get(index_element),
        'year_end': ee.List(pixels_selected.get('year_end')).get(index_element),
        'month_end': ee.List(pixels_selected.get('month_end')).get(index_element),
        'day_end': ee.List(pixels_selected.get('day_end')).get(index_element)
      });
    })
  );
  
  var grouped_fc = ee.FeatureCollection(
      beams_feature_collection.distinct(['orbit_number']) // Obtiene valores únicos de orbit_number
      .map(function(orbit_feature) {
          var orbit_number = orbit_feature.get('orbit_number');
  
          // Filtrar features con el mismo orbit_number
          var filtered = beams_feature_collection.filter(ee.Filter.eq('orbit_number', orbit_number));
  
          // Contar filas
          var count = filtered.size();
  
          // Calcular estadísticas de "Height_Difference"
          var stats = filtered.reduceColumns({
              reducer: ee.Reducer.mean()
                  .combine(ee.Reducer.median(), '', true)
                  .combine(ee.Reducer.stdDev(), '', true)
                  .combine(ee.Reducer.max(), '', true)
                  .combine(ee.Reducer.min(), '', true),
              selectors: ['Height_Difference']
          });
  
          // Crear nueva Feature con orbit_number y estadísticas
          return ee.Feature(null, {
              'orbit_number': orbit_number,
              'count': count,
              'mean_height_difference': stats.get('mean'),
              'median_height_difference': stats.get('median'),
              'stddev_height_difference': stats.get('stdDev'),
              'max_height_difference': stats.get('max'),
              'min_height_difference': stats.get('min')
          });
      })
  );
  
  Export.table.toDrive({
    collection: beams_feature_collection,
    description: output_filename.replace(".csv", "") + "_beam",
    fileFormat: 'CSV'
  });
  
  Export.table.toDrive({
    collection: grouped_fc,
    description: output_filename.replace(".csv", "") + "_orbit_stats",
    fileFormat: 'CSV'
  });
}