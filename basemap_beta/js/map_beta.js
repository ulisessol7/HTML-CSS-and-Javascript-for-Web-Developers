// **********************************************************************************************************************************
// GLOBAL SCOPE
// **********************************************************************************************************************************
var map, extent, cu_bldgs, popup_template;
// **********************************************************************************************************************************
// DOJO REQUIRES
// **********************************************************************************************************************************
require(["esri/map", "esri/dijit/Search", "esri/layers/FeatureLayer", "esri/dijit/PopupTemplate", "esri/symbols/PictureMarkerSymbol", "esri/geometry/Extent", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/tasks/QueryTask", "esri/tasks/query", "esri/graphic",
    "dojo/on",
    "dojo/_base/connect",
    "dojo/dom",
    "dijit/registry",
    "dojo/dom-construct",
    "dojo/parser", "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/html", "esri/dijit/Directions", "dojo/i18n!esri/nls/jsapi", "dojo/domReady!"
], function(Map, Search, FeatureLayer, PopupTemplate, PictureMarkerSymbol, Extent, SimpleFillSymbol, SimpleLineSymbol, Color, QueryTask, Query, Graphic,
    on,
    connect,
    dom,
    registry,
    domConstruct,
    parser, BorderContainer,
    ContentPane, html, Directions, esriBundle, ready) {
    // **********************************************************************************************************************************
    // MAP
    // **********************************************************************************************************************************
    map = new Map("map", {
        // basemap: "topo-vector",
        basemap: "topo-vector",
        // long, lat
        center: [-105.2659, 40.0076],
        zoom: 16,
        slider: false
    });
    // **********************************************************************************************************************************
    // SEARCH WIDGET
    // **********************************************************************************************************************************
    var search = new Search({
        enableButtonMode: false, //this enables the search widget to display as a single button
        enableLabel: false,
        enableInfoWindow: true,
        showInfoWindowOnSelect: false,
        AllPlaceholder: "GO BUFFS!",
        map: map
    }, "search");

    var sources = search.get("sources");
    // this layer  mimics what we have in our GIS system right now, the layer is hosted in ArcGIS Online
    cu_bldgs = new FeatureLayer("https://services5.arcgis.com/G79PVu14Duuuwxv3/ArcGIS/rest/services/BLDGS_test/FeatureServer/0", {
        outFields: ["BLDG_NAME", "BLDG_CODE", "BLDG_NUMBE", "BLDG_ADDRE"]
    });
    // **********************************************************************************************************************************
    // POUP TEMPLATE FOR HOVER OVER MOUSE EVENT
    // **********************************************************************************************************************************
    popup_template = new PopupTemplate({
        title: "{BLDG_NAME}",
        description: "Building Code: {BLDG_CODE}</br> Building Number: {BLDG_NUMBE}</br><i style=text-transform: lowercase;{BLDG_ADDRE}<i>",
        mediaInfos: [{ //define the picture
            "title": "",
            "caption": "",
            "type": "image",
            "value": {
                "sourceURL": "img/{BLDG_NUMBE}.jpg"
            }
        }]
    });

    //Push the sources used to search, by default the ArcGIS Online World geocoder is included.
    sources.push({
        featureLayer: cu_bldgs,
        searchFields: ["BLDG_CODE", "BLDG_NUMBE", "BLDG_NAME"],
        displayField: "BLDG_NAME",
        exactMatch: false,
        outFields: ["BLDG_NAME", "BLDG_CODE", "BLDG_NUMBE", "BLDG_ADDRE"],
        name: "CU Boulder Buildings",
        maxResults: 3,
        maxSuggestions: 3,
        enableHighlight: false,
        infoTemplate: popup_template,
        showInfoWindowOnSelect: true
            // we can also custom build our own marker
            // highlightSymbol: new PictureMarkerSymbol("https://js.arcgis.com/3.17/esri/dijit/Search/images/search-pointer.png", 36, 36),
            // highlightSymbol: new PictureMarkerSymbol("img/search-pointer_cu.png", 36, 36),
    });
    //Set the sources above to the search widget
    search.set("sources", sources);
    // **********************************************************************************************************************************
    // SEARCH EXTENTS FOR BOULDER
    // **********************************************************************************************************************************

    // boulder search extent
    var boulder_extent = new Extent({
        "xmin": 3043062.709893935,
        "ymin": 1242503.5101015298,
        "xmax": 3081808.4767370443,
        "ymax": 1258757.248199367,
        "spatialReference": {
            "wkid": 2876
        }
    });

    // adding  the bldgs
    map.addLayer(cu_bldgs);

    // this controls the extent of the search geocoder
    search.sources[0].searchExtent = boulder_extent;
    sources.splice(0, 2, sources[1], sources[0]);
    search.startup();
    // test event********************************************************************************
    search.on('select-result', function(event) {
        console.log(search.sources);
        console.log(search.suggestResults);
        console.log(search.searchResults);
        /* Act on the event */
    });
    map.on("load", function() {
        extent = map.extent;
        map.graphics.enableMouseEvents();

    });
    // var highlightSymbol = new SimpleFillSymbol(
    //     SimpleFillSymbol.STYLE_SOLID,
    //     new SimpleLineSymbol(
    //         SimpleLineSymbol.STYLE_SOLID,
    //         new Color([207, 184, 124]), 3
    //     ),
    //     new Color([125, 125, 125, 0.35])
    // );
    // **********************************************************************************************************************************
    // HOVER OVER POPUP
    // **********************************************************************************************************************************
    function queryMapService(g) {
        var queryTask = new QueryTask("https://services5.arcgis.com/G79PVu14Duuuwxv3/ArcGIS/rest/services/BLDGS_test/FeatureServer/0");
        var query = new Query();
        query.returnGeometry = false;
        query.outFields = ["BLDG_NAME", "BLDG_CODE", "BLDG_NUMBE", "BLDG_ADDRE"];
        // for debugging purposes
        // console.log('first', g.attributes.OBJECTID);
        var g_id = g.attributes.OBJECTID; //number
        // console.log(g);
        // console.log([g_id], query.objectId);
        query.objectIds = [g_id];
        var resultItems = [];
        queryTask.execute(query, function showResults(results) {
            var resultCount = results.features.length;
            for (var i = 0; i < resultCount; i++) {
                var featureAttributes = results.features[i].attributes;
                for (var attr in featureAttributes) {
                    // resultItems.push(attr + ":" + featureAttributes[attr]);
                    resultItems.push(featureAttributes[attr]);
                }
            }
            // console.log(resultItems);
            var name = resultItems[0];
            var code = resultItems[1];
            var number = resultItems[2];
            var addr = resultItems[3].toLowerCase();
            g.setAttributes({
                "OBJECTID": g_id,
                "BLDG_NAME": name,
                "BLDG_CODE": code,
                "BLDG_NUMBE": number,
                "BLDG_ADDRE": addr
            });
            // for debugging purposes
            // console.log('IN', g.attributes.OBJECTID);
            map.infoWindow.setContent(g.getContent());
            // return resultItems;

        });
    }


    // hover - popup;
    cu_bldgs.on("mouse-over", function(evt) {
        /* Act on the event */
        //Add graphic to the map graphics layer.
        map.infoWindow.set("popupWindow", true);
        var g = evt.graphic;
        g.setInfoTemplate(popup_template);
        // var highlightGraphic = new Graphic(g.geometry, highlightSymbol);
        // map.graphics.add(highlightGraphic);
        queryMapService(g);
        map.infoWindow.show(evt.mapPoint);
    });
    cu_bldgs.on("mouse-out", function() {
        /* Act on the event */
        map.graphics.clear();
        // map.graphics.hide();
        map.infoWindow.hide();
        // for debugging purposes
        // console.log("out");
    });

    cu_bldgs.on("click", function(evt) {
        map.infoWindow.set("popupWindow", false);
        map.infoWindow.hide();
        var g = evt.graphic;
        var pic = "img_pane/" + g.attributes.BLDG_NUMBE + ".jpg";
        document.getElementById("pic").src = pic;
        document.getElementById("pic").style.display = "";
        html.set("bldg", g.attributes.BLDG_NAME);
        document.getElementById("bldg").style.borderBottom = "0.5px solid #A2A4A3";
        html.set("code", "Building code: " + g.attributes.BLDG_CODE);
        html.set("numbe", "Building number: " + g.attributes.BLDG_NUMBE);
        html.set("address", g.attributes.BLDG_ADDRE);
        console.log("building click");
    });

    map.on("click", function(evt) {
        var layerId;
        if (evt.graphic) {
            layerId = evt.graphic.getLayer().id;
            console.log(layerId);
        }
        if (layerId !== "graphicsLayer1") {
            // var pic = "";
            document.getElementById("pic").src = "";
            document.getElementById("pic").style.display = "none";
            html.set("bldg", "");
            document.getElementById("bldg").style.borderBottom = "none";
            html.set("code", "");
            html.set("numbe", "");
            html.set("address", "");
            console.log("map click");
        }
    });

    // **********************************************************************************************************************************
    // DIRECTIONS MENU
    // **********************************************************************************************************************************
    // this line removes the ZOOM TO FULL ROUTE DEFAULT TEXT
    esriBundle.widgets.directions.viewFullRoute = " ";
    window.directionsMenu = function() {
        document.getElementById("search menu").style.display = "none";
        var dir_sources = {
            sources: [{
                featureLayer: cu_bldgs,
                searchFields: ["BLDG_CODE", "BLDG_NUMBE", "BLDG_NAME", "BLDG_ADDRE"],
                displayField: "BLDG_NAME",
                exactMatch: false,
                // outFields: ["ObjectID","BLDG_NAME"],
                outFields: ["*"],
                name: "CU Boulder Buildings",
                maxResults: 3,
                maxSuggestions: 3,
                enableHighlight: false,
            }]
        };

        var directionsWidget = new Directions({
            map: map,
            showClearButton: true,
            searchOptions: dir_sources,
            routeTaskUrl: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Network/USA/NAServer/Route"
        }, "dir");
        directionsWidget.startup();
        directionsWidget.on("directions-start", function(evt) {
            for (var i = 0; i < directionsWidget.stops.length; i++) {
                if (typeof directionsWidget.stops[i].feature.attributes.BLDG_NAME != "undefined") {
                    directionsWidget.stops[i].name = directionsWidget.stops[i].feature.attributes.BLDG_NAME;
                };
            }

        });

    };

    // **********************************************************************************************************************************
    // CUSTOM HOME BUTTON
    // **********************************************************************************************************************************

    window.zoomFunction = function() {
        map.setExtent(extent);
    };

});
