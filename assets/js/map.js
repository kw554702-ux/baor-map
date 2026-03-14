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


// --- Formation relationships ---
var markersByKey = {};
var activeFormationLines = L.layerGroup().addTo(map);
var activeFormationMarkers = L.layerGroup().addTo(map);

var formations = {
  "herford-1951-1956": {
    parent: "herford",
    children: ["bad-lippspringe", "hildesheim"],
    title: "11th Armoured Division brigade layout, 1951–1956"
  }
};



// --- Marker layer ---

var markerLayer = L.markerClusterGroup();

map.addLayer(markerLayer);


var bounds = L.latLngBounds();

for (var i = 0; i < locations.length; i++) {
  var loc = locations[i];

  var icon = baorIcon;

  var marker = L.marker(loc.coords, { icon: icon }).addTo(markerLayer);
  markersByKey[loc.key] = marker;

  bounds.extend(loc.coords);
 
  var popupHtml =
  '<div class="baor-popup">' +
  '<div class="baor-title">' + loc.title + '</div>' +
  (loc.bfpo ? '<div class="baor-meta"><strong>BFPO:</strong> ' + loc.bfpo + '</div>' : '') +
  (loc.hq ? '<div class="baor-hq">' + loc.hq + '</div>' : '') +
  (loc.key === "herford"
    ? '<div class="baor-period-link"><a href="#" onclick="showFormation(\'herford-1951-1956\'); return false;">1951–1956: show brigade layout</a></div>'
    : '') +
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

function showFormation(formationId) {
  var formation = formations[formationId];
  if (!formation) return;

  activeFormationLines.clearLayers();
  activeFormationMarkers.clearLayers();

  var allLatLngs = [];

  function getLocationByKey(key) {
    for (var i = 0; i < locations.length; i++) {
      if (locations[i].key === key) return locations[i];
    }
    return null;
  }

  var parentLoc = getLocationByKey(formation.parent);
  var parentMarker = markersByKey[formation.parent];

  if (!parentLoc || !parentMarker) return;

  var parentLatLng = parentMarker.getLatLng();
  allLatLngs.push(parentLatLng);

  L.marker(parentLatLng, { icon: hqIcon })
    .bindPopup("<strong>" + parentLoc.title + "</strong><br>HQ marker")
    .addTo(activeFormationMarkers);

  for (var i = 0; i < formation.children.length; i++) {
    var childKey = formation.children[i];
    var childLoc = getLocationByKey(childKey);
    var childMarker = markersByKey[childKey];

    if (!childLoc || !childMarker) continue;

    var childLatLng = childMarker.getLatLng();
    allLatLngs.push(childLatLng);

    L.marker(childLatLng, { icon: baorIcon })
      .bindPopup("<strong>" + childLoc.title + "</strong>")
      .addTo(activeFormationMarkers);

    var line = L.polyline(
      [parentLatLng, childLatLng],
      {
        color: "#1f2a44",
        weight: 3,
        opacity: 0.75,
        dashArray: "6, 6"
      }
    );

    activeFormationLines.addLayer(line);
  }

  if (allLatLngs.length > 0) {
    var bounds = L.latLngBounds(allLatLngs);
    map.fitBounds(bounds, { padding: [60, 60] });
  }
}

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

// Layer switcher
L.control.layers(
  null,
  {
    'BAOR markers': markerLayer,
    'British Zone overlay': britishZoneLayer
  },
  { collapsed: false }
).addTo(map);

// --- BAOR location search ---
function normaliseText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim();
}

function findLocation(query) {
  var q = normaliseText(query);
  if (!q) return null;

  for (var i = 0; i < locations.length; i++) {
    var loc = locations[i];
    var title = normaliseText(loc.title);
    var key = normaliseText(loc.key);

    if (title === q || key === q) return loc;
  }

  for (var j = 0; j < locations.length; j++) {
    var loc2 = locations[j];
    var title2 = normaliseText(loc2.title);
    var key2 = normaliseText(loc2.key);

    if (title2.indexOf(q) !== -1 || key2.indexOf(q) !== -1) return loc2;
  }

  return null;
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

















