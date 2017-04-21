  require([
      "dojo/dom-construct",
      "esri/map",
      "esri/dijit/HomeButton",
      "esri/layers/FeatureLayer",
      "esri/geometry/Extent",
      "esri/InfoTemplate",
      "esri/symbols/SimpleFillSymbol",
      "esri/symbols/SimpleLineSymbol",
      "esri/Color",
      "esri/symbols/TextSymbol",
      "esri/layers/LabelClass",
      "dojo/domReady!"
  ], function(
      domConstruct,
      Map,
      HomeButton,
      FeatureLayer,
      Extent,
      InfoTemplate,
      SimpleFillSymbol,
      SimpleLineSymbol,
      Color,
      TextSymbol,
      LabelClass
  ) {
      // For 50% screen size
      // "extent", xmin: 954117.5722794618, ymin: 515761.23322408117, xmax: 963661.5207113862, ymax: 518942.549368056
      var bounds = new Extent({
          // width 50%
          "xmin": 954117.5722794618,
          "ymin": 515761.23322408117,
          "xmax": 963661.5207113862,
          "ymax": 518942.549368056,
          // width 100%
          // "xmin": 951910.5342045791,
          // "ymin": 514165.60434561875,
          // "xmax": 970998.4310684282,
          // "ymax": 520518.29502061853,
          // default
          // "xmin": 950319.962700002,
          // "ymin": 503766.677200001,
          // "xmax": 985890.8807,
          // "ymax": 529177.4399,
          "spatialReference": {
              "wkid": 102254
          }
      });

      var map = new Map("map", {
          extent: bounds,
          // center: [961255.177, 517655.604], // longitude, latitude
          zoom: 2,
          showLabels: true

      });
      var home = new HomeButton({
          map: map
      }, "HomeButton");
      home.startup();

      var url = "http://services5.arcgis.com/G79PVu14Duuuwxv3/arcgis/rest/services/crime2012/FeatureServer/0";
      var barrios = "http://services5.arcgis.com/G79PVu14Duuuwxv3/arcgis/rest/services/BarriosDenver/FeatureServer/0";

      var template = new InfoTemplate(
          "${name}", "<b>Total Number of Assaults:</b> ${Assaults}<br><b>Centrality Scores</b><br><i>Betweennes: ${BRank}</i><br><i>Reach: ${RRank}</i><br><i>Closeness: ${CRank}</i><br>");

      var fl = new FeatureLayer(url, {
          mode: FeatureLayer.MODE_AUTO,
          id: "crime2012",
          infoTemplate: template,
          maxAllowableOffset: calcOffset(),
          outFields: ["*"]
      });
      var flb = new FeatureLayer(barrios, {
          mode: FeatureLayer.MODE_AUTO,
          id: "barriosDenver",
          maxAllowableOffset: calcOffset(),
          outFields: ["*"]
      });
      //The following line overrides the highlight symbol used when a feature is clicked.
      var highlightSymbol = new SimpleLineSymbol();
      highlightSymbol.setColor(new Color([255, 255, 255, 1]));
      map.infoWindow.lineSymbol = highlightSymbol;
      map.addLayer(fl);
      //labels
      var barriosColor = new Color("#666");
      // create a text symbol to define the style of labels
      var barriosLabel = new TextSymbol().setColor(barriosColor);
      barriosLabel.font.setSize("8pt");
      barriosLabel.font.setFamily("arial");
      //this is the very least of what should be set within the JSON  
      var json = {
          "labelExpressionInfo": { "value": "{NBHD_NAME}" }
      };
      //create instance of LabelClass (note: multiple LabelClasses can be passed in as an array)
      var labelClass = new LabelClass(json);
      labelClass.symbol = barriosLabel; // symbol also can be set in LabelClass' json
      flb.setLabelingInfo([labelClass]);
      map.addLayer(flb);
      var chartC = new Cedar({ "specification": "../cedarSpecs/customscatter.json" });
      var datasetC = {
          "url": "http://services5.arcgis.com/G79PVu14Duuuwxv3/arcgis/rest/services/crime2012/FeatureServer/0",
          "query": {

          },
          "mappings": {
              "x": { "field": "Closeness" },
              "y": { "field": "Assaults" },
              "color": { "field": "RRank" }
          }
      };
      chartC.dataset = datasetC;

      chartC.show({
          "elementId": "#chartC"
      });

      var chartR = new Cedar({ "specification": "../cedarSpecs/customscatter.json" });
      var datasetR = {
          "url": "http://services5.arcgis.com/G79PVu14Duuuwxv3/arcgis/rest/services/crime2012/FeatureServer/0",
          "query": {

          },
          "mappings": {
              "x": { "field": "Reach" },
              "y": { "field": "Assaults" },
              "color": { "field": "RRank" }
          }
      };
      chartR.dataset = datasetR;

      chartR.show({
          "elementId": "#chartR"
      });
      var chartB = new Cedar({ "specification": "../cedarSpecs/customscatter.json" });
      var datasetB = {
          "url": "http://services5.arcgis.com/G79PVu14Duuuwxv3/arcgis/rest/services/crime2012/FeatureServer/0",
          "query": {

          },
          "mappings": {
              "x": { "field": "Betweennes" },
              "y": { "field": "Assaults" },
              "color": { "field": "RRank" }
          }
      };
      chartB.dataset = datasetB;

      chartB.show({
          "elementId": "#chartB"
      });
      map.on("extent-change", function() {
          fl.maxOffset = calcOffset();
          fl.setMaxAllowableOffset(fl.maxOffset);
          var extent = map.extent;
          extent = JSON.stringify(extent);
          chartC.dataset.query.geometry = extent;
          chartC.update();
          chartR.dataset.query.geometry = extent;
          chartR.update();
          chartB.dataset.query.geometry = extent;
          chartB.update();
          // console.log(chart.dataset);

      });

      function calcOffset() {
          return (map.extent.getWidth() / map.width);
      }
  });
