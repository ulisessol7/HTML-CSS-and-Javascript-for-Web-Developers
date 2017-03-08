// ************************************* GLOBAL SCOPE **************************************************
var local = 'https://gist.githubusercontent.com/invisiblefunnel/9213c3967c50eeab2283/raw/ffef79b19e4f80d6aba2977599853fb88a787aed/denver-marijuana-facilities.geojson';
var ucd_popup = 'BUSINESS NAME: Coming soon';
var local_icon = 'img/marijuana-icon.png';
// ********************************** GOOGLE MAP ****************************************************

var gmap;
var ucd = { lat: 39.743961, lng: -105.002152 };

function initMap() {
    gmap = new google.maps.Map(document.getElementById('gmap'), {
        center: ucd,
        zoom: 15,
        // mapTypeId: 'satellite'
        mapTypeId: 'hybrid'
    });
    // google.maps.event.addListener(gmap, 'idle', function(event) {
    //     gmap.setCenter(ucd); //force to set original center position
    // });
    var infowindow = new google.maps.InfoWindow({
        content: ucd_popup
    });

    var marker = new google.maps.Marker({
        position: ucd,
        map: gmap,
    });
    marker.addListener('click', function() {
        infowindow.open(gmap, marker);
    });
    var local_gicon = {
        url: local_icon,
        // This marker is 20 pixels wide by 32 pixels high.
        scaledSize: new google.maps.Size(25, 25),
    }
    gmap.data.loadGeoJson(
        local);
    gmap.data.setStyle({
        icon: local_gicon,
    });
    gmap.data.addListener('click', function(evt) {
        var mariInfo = new google.maps.InfoWindow({
            content: 'BUSINESS NAME: ' + evt.feature.f.business_name
        });
        var anchor = new google.maps.MVCObject();
        anchor.set('position', evt.latLng);
        mariInfo.open(gmap, anchor);
    });
}


$(document).ready(function() {
    // ********************************** LEAFLET MAP ****************************************************
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
        .bindPopup(ucd_popup);

    function onEachFeature(feature, layer) {
        layer.bindPopup("BUSINESS NAME: " + feature.properties.business_name)
    };
    var greenIcon = L.icon({
        // iconUrl: 'img/marijuana-icon.png',
        iconUrl: local_icon,
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
        icon: local_icon,
    });
    // var local = 'http://localhost:8080/geoserver/GEOG5095/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GEOG5095:Neighborhoods_p&maxFeatures=50&outputFormat=application%2Fjson'
    // var local = 'https://raw.githubusercontent.com/JasonSanford/denver-bike-routes/master/routes.geojson'
    // var local = 'https://gist.githubusercontent.com/invisiblefunnel/9213c3967c50eeab2283/raw/ffef79b19e4f80d6aba2977599853fb88a787aed/denver-marijuana-facilities.geojson'
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
    $("#minimap").click(function(evt) {
        /* Act on the event */
        if ($("#map").is(":hidden")) {
            $("#sidebar").css("width", "350px")
            $("#gmap").hide();
            $("#map").show();
            mymap.invalidateSize();
        } else {
            $("#sidebar").css("width", "100%");
            $("#map").hide();
        }

    });
    $("#minigmap").click(function(evt) {
        /* Act on the event */
        if ($("#gmap").is(":hidden")) {
            $("#sidebar").css("width", "350px");
            $("#map").hide();
            $("#gmap").show();
            google.maps.event.trigger(gmap, 'resize');
            gmap.setCenter(ucd);
        } else {
            $("#sidebar").css("width", "100%");
            $("#gmap").hide();
        }

    });
    // DOM READY BRACKET
});
