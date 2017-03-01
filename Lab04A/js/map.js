$(document).ready(function() {
    // initializing  leaflet map to CU Denver North Classroom
    var mymap = L.map('map').setView([39.745060, -105.002152], 15);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);
    var marker = L.marker([39.745060, -105.002152]).addTo(mymap)
        .bindPopup("BUSINESS NAME: Coming soon");

    function onEachFeature(feature, layer) {
        layer.bindPopup("BUSINESS NAME: " + feature.properties.business_name)
    };
    var greenIcon = L.icon({
        iconUrl: 'img/marijuana-icon.png',
        // iconUrl: 'http://www.iconninja.com/files/770/262/464/marijuana-icon.png',
        // shadowUrl: 'leaf-shadow.png',
        iconSize: [25, 25], // size of the icon
        // shadowSize: [50, 64], // size of the shadow
        iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        // shadowAnchor: [4, 62], // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    L.geoJSON(mari).addTo(mymap);
    var mari = L.geoJson(null, {
        // set renderer style, easier than doing it through GeoServer
        icon: greenIcon,

    });
    // var local = 'http://localhost:8080/geoserver/GEOG5095/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GEOG5095:Neighborhoods_p&maxFeatures=50&outputFormat=application%2Fjson'
    // var local = 'https://raw.githubusercontent.com/JasonSanford/denver-bike-routes/master/routes.geojson'
    var local = 'https://gist.githubusercontent.com/invisiblefunnel/9213c3967c50eeab2283/raw/ffef79b19e4f80d6aba2977599853fb88a787aed/denver-marijuana-facilities.geojson'
    $.getJSON(local, function(data) {
        mari.addData(data);
        L.geoJson(data, {
            pointToLayer: function(feature, latlng) {
                console.log(latlng, feature);
                return L.marker(latlng, {
                    icon: greenIcon
                });
            },
            onEachFeature: onEachFeature
        }).addTo(mymap);
    });
    // SHOW MAP EVENT
    $("td > img").click(function(evt) {
        /* Act on the event */
        if ($("#map").is(":hidden")) {
            $("#sidebar").css("width", "350px");
            $("#map").show();
            mymap.invalidateSize();
        } else {
            $("#sidebar").css("width", "100%");
            $("#map").hide();
        }

    });
    // DOM READY BRACKET
});
