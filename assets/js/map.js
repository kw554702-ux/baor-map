var map = L.map('map').setView([52.9, 9.8], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// --- Markers ---
var markerLayer = L.layerGroup().addTo(map);

for (var i = 0; i < locations.length; i++) {
  var loc = locations[i];

  var marker = L.marker(loc.coords).addTo(markerLayer);

  var popupHtml =
    '<strong>' + loc.title + '</strong>' +
    (loc.desc ? '<br>' + loc.desc : '') +
    '<br><a href="' + loc.page + '" target="_blank">Open page</a>';

  marker.bindPopup(popupHtml);
}

// --- British Zone overlay ---
// Practical first-pass method:
// load German state boundaries and keep only the states that broadly match
// the British Zone footprint for your project.
var britishZoneLayer = L.geoJSON(null, {
  style: function () {
    return {
      color: '#1f4aa8',
      weight: 2,
      opacity: 0.9,
      fillColor: '#4f83ff',
      fillOpacity: 0.12
    };
  },
  onEachFeature: function (feature, layer) {
    var p = feature.properties || {};
    var name =
      p.name || p.NAME_1 || p.NAME || p.GEN || p.lan_name || 'British Zone area';
    layer.bindPopup('<strong>' + name + '</strong><br>British Zone overlay');
  }
}).addTo(map);

fetch('https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/4_niedrig.geo.json')
  .then(function (response) {
    return response.json();
  })
  .then(function (geojson) {
    var wanted = {
      'schleswig-holstein': true,
      'hamburg': true,
      'niedersachsen': true,
      'lower saxony': true,
      'nordrhein-westfalen': true,
      'north rhine-westphalia': true
    };

    var filtered = {
      type: 'FeatureCollection',
      features: geojson.features.filter(function (feature) {
        var p = feature.properties || {};
        var rawName =
          p.name || p.NAME_1 || p.NAME || p.GEN || p.lan_name || '';
        var name = String(rawName).trim().toLowerCase();
        return !!wanted[name];
      })
    };

    britishZoneLayer.addData(filtered);
  })
  .catch(function (err) {
    console.error('British Zone overlay failed to load:', err);
  });

L.control.layers(
  null,
  {
    'BAOR markers': markerLayer,
    'British Zone overlay': britishZoneLayer
  },
  { collapsed: false }
).addTo(map);


