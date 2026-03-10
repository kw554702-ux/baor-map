var map = L.map('map').setView([52.9, 9.8], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var bergenCamp = L.marker([52.914, 9.997], { icon: baorIcon })
  .bindPopup("<strong>Bergen Camp</strong><br>Bergen-Hohne Garrison")
  .addTo(barracksLayer);

if (loc.zoomTo) {
  marker.on("click", function(e) {
    map.setView(loc.zoomTo, loc.zoomLevel || 12);
  });

// Custom BAOR icon
var baorIcon = L.icon({
  iconUrl: 'https://kw554702-ux.github.io/baor-map/assets/img/union-jack-marker.png',
  iconSize: [40, 56],
  iconAnchor: [20, 56],
  popupAnchor: [0, -50]
});

// --- Marker layer ---
var markerLayer = L.markerClusterGroup();
map.addLayer(markerLayer);

var bounds = L.latLngBounds();

for (var i = 0; i < locations.length; i++) {
  var loc = locations[i];

  var marker = L.marker(loc.coords, { icon: baorIcon }).addTo(markerLayer);

  bounds.extend(loc.coords);

  var popupHtml =
    '<div class="baor-popup">' +
    '<div class="baor-title">' + loc.title + '</div>' +
    (loc.desc ? '<div class="baor-desc">' + loc.desc + '</div>' : '') +
    '<div class="baor-link"><a href="' + loc.page + '" target="_blank">Open location page</a></div>' +
    '</div>';

  marker.bindPopup(popupHtml);

  marker.bindTooltip(loc.title, {
    direction: 'top',
    offset: [0, -55],
    opacity: 1,
    className: 'baor-label'
  });
}

map.fitBounds(bounds, { padding: [40, 40] });

// --- British Zone overlay layer ---
var britishZoneLayer = L.geoJSON(null, {
  style: function (feature) {
    var p = feature.properties || {};
    var rawName = p.name || p.NAME_1 || p.NAME || p.GEN || p.lan_name || '';
    var name = String(rawName).toLowerCase();

    var isBritishZone =
      name.indexOf('schleswig') !== -1 ||
      name.indexOf('hamburg') !== -1 ||
      name.indexOf('niedersachsen') !== -1 ||
      name.indexOf('lower saxony') !== -1 ||
      name.indexOf('nordrhein') !== -1 ||
      name.indexOf('north rhine') !== -1;

    if (isBritishZone) {
      return {
        color: '#1f4aa8',
        weight: 2,
        opacity: 0.9,
        fillColor: '#4f83ff',
        fillOpacity: 0.15
      };
    }

    return {
      color: '#000000',
      weight: 1,
      opacity: 0,
      fillOpacity: 0
    };
  },
  onEachFeature: function (feature, layer) {
    var p = feature.properties || {};
    var rawName = p.name || p.NAME_1 || p.NAME || p.GEN || p.lan_name || 'Area';
    var name = String(rawName).toLowerCase();

    var isBritishZone =
      name.indexOf('schleswig') !== -1 ||
      name.indexOf('hamburg') !== -1 ||
      name.indexOf('niedersachsen') !== -1 ||
      name.indexOf('lower saxony') !== -1 ||
      name.indexOf('nordrhein') !== -1 ||
      name.indexOf('north rhine') !== -1;

    if (isBritishZone) {
      layer.bindPopup('<strong>' + rawName + '</strong><br>British Zone overlay');
    }
  }
}).addTo(map);

fetch('https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/4_niedrig.geo.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(geojson) {
    britishZoneLayer.addData(geojson);
  })
  .catch(function(err) {
    console.log('Overlay failed to load:', err);
  });

// Layer switcher
L.control.layers(
  null,
  {
    'BAOR markers': markerLayer,
    'British Zone overlay': britishZoneLayer
  },
  { collapsed: false }
).addTo(map);



