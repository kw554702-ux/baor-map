var map = L.map('map').setView([52.9, 9.8], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

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
    '<strong>' + loc.title + '</strong>' +
    (loc.desc ? '<br>' + loc.desc : '') +
    '<br><a href="' + loc.page + '" target="_blank">Open page</a>';

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
  .then(function (response) {
    return response.json();
  })
  .then(function (geojson) {
    britishZoneLayer.addData(geojson);
  })
  .catch(function (err) {
    console.log('Overlay failed to load:', err);
  });

// --- Inner German Border ---
var borderCoords = [
  [54.803, 10.874],
  [54.700, 10.780],
  [54.600, 10.720],
  [54.500, 10.650],
  [54.400, 10.560],
  [54.300, 10.500],
  [54.200, 10.430],
  [54.100, 10.360],
  [54.000, 10.300],
  [53.900, 10.250],
  [53.800, 10.220],
  [53.700, 10.220],
  [53.600, 10.240],
  [53.500, 10.280],
  [53.400, 10.340],
  [53.300, 10.420],
  [53.200, 10.500],
  [53.100, 10.600],
  [53.000, 10.680],
  [52.900, 10.760],
  [52.800, 10.840],
  [52.700, 10.900],
  [52.600, 10.920],
  [52.500, 10.930],
  [52.400, 10.920],
  [52.300, 10.900],
  [52.200, 10.880],
  [52.100, 10.860],
  [52.000, 10.830],
  [51.900, 10.780],
  [51.800, 10.720],
  [51.700, 10.650],
  [51.600, 10.580],
  [51.500, 10.500],
  [51.400, 10.420],
  [51.300, 10.350],
  [51.200, 10.300],
  [51.100, 10.250],
  [51.000, 10.200],
  [50.900, 10.140],
  [50.800, 10.080],
  [50.700, 10.000],
  [50.600, 9.960],
  [50.500, 9.950]
];

var innerGermanBorder = L.polyline(borderCoords, {
  color: "#cc0000",
  weight: 3,
  dashArray: "6,6"
}).addTo(map);

L.control.layers(
  null,
  {
    'BAOR markers': markerLayer,
    'British Zone overlay': britishZoneLayer,
    'Inner German Border': innerGermanBorder
  },
  { collapsed: false }
).addTo(map);



