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

var hqIcon = L.icon({
  iconUrl: 'assets/img/baor-hq-marker.png',
  iconSize: [40, 56],
  iconAnchor: [20, 56],
  popupAnchor: [0, -50]
});

// --- Marker layer ---
var markerLayer = L.markerClusterGroup({
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  spiderfyOnMaxZoom: true,
  maxClusterRadius: 45
});

map.addLayer(markerLayer);

var bounds = L.latLngBounds();

for (var i = 0; i < locations.length; i++) {
  var loc = locations[i];

  var icon = baorIcon;

  var marker = L.marker(loc.coords, { icon: icon }).addTo(markerLayer);

  bounds.extend(loc.coords);
 
  var popupHtml =
  '<div class="baor-popup">' +
  '<div class="baor-title">' + loc.title + '</div>' +
  (loc.bfpo ? '<div class="baor-meta"><strong>BFPO:</strong> ' + loc.bfpo + '</div>' : '') +
  (loc.hq ? '<div class="baor-hq">' + loc.hq + '</div>' : '') +
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

// --- Zoom to location from URL parameter ---
var params = new URLSearchParams(window.location.search);
var targetKey = params.get("loc");

if (targetKey) {
  for (var i = 0; i < locations.length; i++) {
    var loc = locations[i];
    if (loc.key === targetKey) {
      map.setView(loc.coords, 11);
      break;
    }
  }
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

// --- BAOR location search ---
function normaliseText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove accents
    .replace(/[^a-z0-9\s-]/g, "")      // remove punctuation
    .trim();
}

function findLocation(query) {
  var q = normaliseText(query);
  if (!q) return null;

  var exactMatch = null;
  var startsWithMatch = null;
  var containsMatch = null;

  for (var i = 0; i < locations.length; i++) {
    var loc = locations[i];

    var haystack = [
      loc.title,
      loc.key,
      loc.hq,
      loc.desc,
      loc.bfpo
    ].map(normaliseText).join(" ");

    if (haystack === q) {
      exactMatch = loc;
      break;
    }

    if (!startsWithMatch && haystack.indexOf(q) === 0) {
      startsWithMatch = loc;
    }

    if (!containsMatch && haystack.indexOf(q) !== -1) {
      containsMatch = loc;
    }
  }

  return exactMatch || startsWithMatch || containsMatch || null;
}

var searchInput = document.getElementById("baor-search");
var searchButton = document.getElementById("baor-search-btn");

function runBaorSearch() {
  if (!searchInput) return;

  var query = searchInput.value;
  var loc = findLocation(query);

  if (loc) {
    map.setView(loc.coords, 12);

    setTimeout(function () {
      markerLayer.eachLayer(function (layer) {
        if (
          layer.getLatLng &&
          Math.abs(layer.getLatLng().lat - loc.coords[0]) < 0.0001 &&
          Math.abs(layer.getLatLng().lng - loc.coords[1]) < 0.0001
        ) {
          layer.openPopup();
        }
      });
    }, 300);
  } else {
    alert("Location not found in BAOR dataset.");
  }
}

if (searchButton) {
  searchButton.addEventListener("click", runBaorSearch);
}

if (searchInput) {
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      runBaorSearch();
    }
  });
}

// Layer switcher
L.control.layers(
  null,
  {
    'BAOR markers': markerLayer,
    'British Zone overlay': britishZoneLayer
  },
  { collapsed: false }
).addTo(map);



















