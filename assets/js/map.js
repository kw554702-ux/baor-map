var map = L.map('map').setView([52.0, 9.0], 6);

// --- Formation display panes (above clusters) ---

map.createPane('formationLinesPane');
map.getPane('formationLinesPane').style.zIndex = 650;

map.createPane('formationMarkersPane');
map.getPane('formationMarkersPane').style.zIndex = 700;

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
  iconUrl: 'https://kw554702-ux.github.io/baor-map/assets/img/union-jack-marker.png',
  iconSize: [40, 56],
  iconAnchor: [20, 56],
  popupAnchor: [0, -50]
});


// --- Formation reormation lationships ---
var markersByKey = {};
var activeFormationLines = L.layerGroup().addTo(map);
var activeFormationMarkers = L.layerGroup().addTo(map);


var formations = {

  "herford-1951-1956": {
    parent: "herford",
    children: [
      { key: "bad-lippspringe", title: "HQ 33rd Armoured Brigade" },
      { key: "hildesheim", title: "HQ 91st Lorried Infantry Brigade", formation: "hildesheim-91st-brigade" }
    ],
    title: "11th Armoured Division – Brigade Layout (1951–1956)"
  },

  "hildesheim-91st-brigade": {
    parent: "hildesheim",
    children: [
      { key: "goslar", title: "1st Battalion, The Royal Norfolk Regiment" },
      { key: "braunschweig", title: "1st Battalion, The Lincolnshire Regiment" },
      { key: "gottingen", title: "1st Battalion, The King’s Own Yorkshire Light Infantry" }
    ],
    title: "91st Lorried Infantry Brigade – Battalion Locations"
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

  // EXISTING dynamic structure link
  (loc.key === "herford"
    ? '<div class="baor-period-link">' +
      '<a href="#" onclick="showFormation(\'herford-1951-1956\'); return false;">' +
      '1951–1956: show brigade layout</a></div>'
    : '') +

  // 👉 OPTIONAL: static structure page backup
  (loc.key === "herford"
    ? '<div class="baor-period-link">' +
      '<a href="herford-division.html" target="_blank">Open structure map (full view)</a>' +
      '</div>'
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



function showFormation(formationId) {
  var formation = formations[formationId];
  if (!formation) return;

  hideFormationBackButton();

  activeFormationLines.clearLayers();
  activeFormationMarkers.clearLayers();
  

  if (map.hasLayer(markerLayer)) {
    map.removeLayer(markerLayer);
  }

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

  var hqMarker = L.marker(parentLatLng, {
  icon: hqIcon,
  pane: 'formationMarkersPane'
})
.bindPopup(
  "<strong>" + formation.title + "</strong><br>" + parentLoc.title
)
.bindTooltip("11th Armoured Division HQ", {
  permanent: true,
  direction: 'right',
  offset: [18, -20],
  className: 'formation-marker-label'
})
.addTo(activeFormationMarkers);

  for (var i = 0; i < formation.children.length; i++) {
  var child = formation.children[i];
  var childKey = child.key;
  var childTitle = child.title;
  var childLoc = getLocationByKey(childKey);
  var childMarker = markersByKey[childKey]; 

    if (!childLoc || !childMarker) continue;

    var childLatLng = childMarker.getLatLng();
    allLatLngs.push(childLatLng);

    var brigadeMarker = L.marker(childLatLng, {
  icon: baorIcon,
  pane: 'formationMarkersPane'
})
.bindPopup(
  "<strong>" + childTitle + "</strong><br>" + childLoc.title
)
.bindTooltip(childTitle, {
  permanent: true,
  direction: 'top',
  offset: [0, -48],
  className: 'formation-marker-label'
})
.addTo(activeFormationMarkers);

    var line = L.polyline(
  [parentLatLng, childLatLng],
  {
    color: "#23395b",
    weight: 4,
    opacity: 0.7,
    dashArray: "8, 8",
    lineCap: "round",
    pane: 'formationLinesPane'
  }
);

    activeFormationLines.addLayer(line);

    
  }

  if (allLatLngs.length > 0) {
    var formationBounds = L.latLngBounds(allLatLngs);
    map.fitBounds(formationBounds, { padding: [60, 60] });
  }

  showFormationBackButton();
  showFormationTitle(formation.title);
}
    
function showFormationBackButton() {
  var back = document.getElementById("formation-back");
  if (back) {
    back.style.display = "block";
  }

  
}

function hideFormationBackButton() {
  var back = document.getElementById("formation-back");
  if (back) {
    back.style.display = "none";
  }
}

function showFormationTitle(text) {
  var titleBox = document.getElementById("formation-title");
  if (titleBox) {
    titleBox.textContent = text;
    titleBox.style.display = "block";
  }
}

function hideFormationTitle() {
  var titleBox = document.getElementById("formation-title");
  if (titleBox) {
    titleBox.style.display = "none";
    titleBox.textContent = "";
  }
}
function resetFormation() {
  activeFormationLines.clearLayers();
  activeFormationMarkers.clearLayers();
  

  if (!map.hasLayer(markerLayer)) {
    map.addLayer(markerLayer);
  }

  map.fitBounds(bounds, { padding: [30, 30] });

  hideFormationBackButton();
  hideFormationTitle();
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




// Layer switcher
L.control.layers(
  null,
  {
    'BAOR markers': markerLayer
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

















