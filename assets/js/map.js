var map = L.map('map').setView([52.9, 9.8], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// --- Marker layer ---
var markerLayer = L.layerGroup().addTo(map);

for (var i = 0; i < locations.length; i++) {
  var loc = locations[i];

  var baorIcon = L.icon({
  iconUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhO2wz-J-BDs24xhoYNBNsUXoI4dPgPRPiohJu6kB83yU2vGX9WlZiB1rcnOQc7MfLQfVtV66wYQWFNbKkrRoDPa3wjFTHpa4APhbVplDSXQmx9Ti6mzQR7huzhuRxB3XDeP9G_0_0Suu1JDQCdOuTHkZhD_5t7Qv82pSrCio2MK9wHIOQjLS5EICqvQ98/s1536/Union%20Jack%20location%20pin%20icon.png',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -42]
});

var marker = L.marker(loc.coords, { icon: baorIcon }).addTo(markerLayer);

  var popupHtml =
    '<strong>' + loc.title + '</strong>' +
    (loc.desc ? '<br>' + loc.desc : '') +
    '<br><a href="' + loc.page + '" target="_blank">Open page</a>';

  marker.bindPopup(popupHtml);
}

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

// Load Germany state boundaries
fetch('https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/4_niedrig.geo.json')
  .then(function (response) {
    return response.json();
  })
  .then(function (geojson) {
    britishZoneLayer.addData(geojson);
  })
  .catch(function (err) {
    console.log('Overlay failed to load:', err);
    alert('British Zone overlay failed to load.');
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






