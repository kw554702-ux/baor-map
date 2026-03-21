var map = L.map('map', {
  preferCanvas: true
}).setView([52.0, 9.0], 6);

// --- Formation display panes (above clusters) --- =

map.createPane('formationLinesPane');
map.getPane('formationLinesPane').style.zIndex = 620;

map.createPane('formationMarkersPane');
map.getPane('formationMarkersPane').style.zIndex = 640;

map.getPane('formationLinesPane').style.display = 'none';
map.getPane('formationMarkersPane').style.display = 'none';

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Custom BAOR icon
var baorIcon = L.icon({
  iconUrl: 'https://kw554702-ux.github.io/baor-map/assets/img/union-jack-marker.png',
  iconSize: [40, 56],
  iconAnchor: [20, 56],
  popupAnchor: [18, -68]
});

var hqIcon = L.icon({
  iconUrl: 'https://kw554702-ux.github.io/baor-map/assets/img/baor-hq-marker.png',
  iconSize: [46, 64],   // ⬅️ slightly bigger
  iconAnchor: [23, 64],
  popupAnchor: [18, -72]
});

// --- Formation reormation lationships ---
var markersByKey = {};
var activeFormationLines = L.layerGroup().addTo(map);
var activeFormationMarkers = L.layerGroup().addTo(map);
var currentFormationId = null;
var formationHistory = [];
var formationLabelsVisible = true;


var formations = {

  "herford-1951-1956": {
    parent: "herford",
    hqTitle: "11th Armoured Division HQ",
    children: [
      { key: "bad-lippspringe", title: "HQ 33rd Armoured Brigade", formation: "bad-lippspringe-33rd-brigade" },
      { key: "hildesheim", title: "HQ 91st Lorried Infantry Brigade", formation: "hildesheim-91st-brigade" }
    ],
    title: "11th Armoured Division – Brigade Layout (1951–1956)"
  },

  "hildesheim-91st-brigade": {
    parent: "hildesheim",
    hqTitle: "HQ 91st Lorried Infantry Brigade",
    children: [
      {
        key: "goslar",
        title: "Goslar",
        battalions: [
          { name: "1st Bn Sherwood Foresters", dates: "1951–1953" },
          { name: "1st Bn Royal Lincolnshire Regt", dates: "1953–1954" },
          { name: "1st Bn Royal Berkshire Regt", dates: "Jun 1954–1956" }
        ]
      },
      {
        key: "braunschweig",
        title: "Braunschweig",
        battalions: [
          { name: "1st Bn York & Lancaster Regt", dates: "1951–Jan 1953" },
          { name: "1st Bn South Wales Borderers", dates: "Jan 1953–Jul 1955" },
          { name: "1st Bn East Surrey Regt", dates: "Jul 1955–1956" }
        ]
      },
      {
        key: "gottingen",
        title: "Göttingen",
        battalions: [
          { name: "1st Bn Royal Irish Fusiliers", dates: "1951–Oct 1952" },
          { name: "1st Bn King's Shropshire LI", dates: "Oct 1952–Mar 1954" },
          { name: "1st Bn Border Regt", dates: "Mar 1954–1956" }
        ]
      }
    ],
    title: "91st Lorried Infantry Brigade – Battalion Locations"
  },

  "bad-lippspringe-33rd-brigade": {
    parent: "bad-lippspringe",
    hqTitle: "HQ 33rd Armoured Brigade",
    children: [
      {
        key: "paderborn",
        title: "Paderborn",
        battalions: [
          { name: "5th Royal Inniskilling Dragoon Guards", dates: "to Aug 1951" },
          { name: "8th Royal Tank Regt", dates: "from Aug 1951" }
        ]
      },
      {
        key: "detmold",
        title: "Detmold",
        battalions: [
          { name: "1st Royal Tank Regt", dates: "to Oct 1952" },
          { name: "3rd Royal Tank Regt", dates: "from Oct 1952" },
          { name: "9th Lancers", dates: "assigned Nov 1952" }
        ]
      },
      {
        key: "sennelager",
        title: "Sennelager",
        battalions: [
          { name: "1st Bn KRRC (King's Royal Rifle Corps)", dates: "to Jun 1955" },
          { name: "1st Bn Sherwood Foresters", dates: "from Jun 1955" }
        ]
      }
    ],
    title: "33rd Armoured Brigade – Unit Locations"
  }

};

var fullStructures = {
  "herford-full-division": {
    title: "11th Armoured Division – Full Structure (1951–1956)",
    division: {
      key: "herford",
      title: "HQ 11th Armoured Division"
    },
    
"herford-support-troops": {
  title: "11th Armoured Division – Support Troops",
  division: {
    key: "herford",
    title: "HQ 11th Armoured Division"
  },
  support: [
    {
      key: "herford",
      title: "Herford – Div HQ / Signals",
      details: [
        "HQ 11th Armoured Division",
        "11th Armoured Division Signal Regt"
      ]
    },
    {
      key: "wolfenbuttel",
      title: "Wolfenbüttel – Recce",
      details: [
        "Royal Horse Guards [recce]",
        "Replaced Mar 1952 by Life Guards",
        "Replaced Jul 1953 by 13th/18th Hussars [left Mar 1956]"
      ]
    },
    {
      key: "bielefeld",
      title: "Bielefeld – Anti-tank",
      details: [
        "3rd Hussars [atk regt]",
        "Replaced Jul 1953 by 16th/5th Lancers at Sennelager"
      ]
    },
    {
      key: "hildesheim",
      title: "Hildesheim – RHA / Loc Bty",
      details: [
        "2nd Field Regt RHA",
        "I, L, O Btys RHA [Sexton]",
        "157th Loc Bty RA"
      ]
    },
    {
      key: "detmold",
      title: "Detmold – Field Regt RA",
      details: [
        "10th Field Regt RA",
        "Q, X, Y Btys RA [Sexton]"
      ]
    },
    {
      key: "lippstadt",
      title: "Lippstadt – LAA Regt",
      details: [
        "53rd LAA Regt RA",
        "58, 106, 110 LAA Btys RA [40mm]"
      ]
    };
    {
      key: "hameln",
      title: "Hameln – Engineers",
      details: [
        "26 Field Engr Regt RE",
        "7, 29, 60 Field Sqns and 43 Field Park Sqn RE"
      ]
    }
  ]
},
      
    brigades: [
      {
        key: "hildesheim",
        title: "HQ 91st Lorried Infantry Brigade",
        children: [
          { key: "goslar", title: "Goslar" },
          { key: "braunschweig", title: "Braunschweig" },
          { key: "gottingen", title: "Göttingen" }
        ]
      },
      {
        key: "bad-lippspringe",
        title: "HQ 33rd Armoured Brigade",
        children: [
          { key: "paderborn", title: "Paderborn" },
          { key: "detmold", title: "Detmold" },
          { key: "sennelager", title: "Sennelager" }
        ]
      }
    ]
  }
};

function getLocationByKey(key) {
  for (var i = 0; i < locations.length; i++) {
    if (locations[i].key === key) return locations[i];
  }
  return null;
}
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
      '1951–1956: show brigade layout</a>' +
    '</div>' +
    '<div class="baor-period-link">' +
      '<a href="#" onclick="showFullStructure(\'herford-full-division\'); return false;">' +
      '1951–1956: show full divisional structure</a>' +
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



function showFormation(formationId, skipHistory) {
  var formation = formations[formationId];
  if (!formation) return;

  map.closePopup();
  map.getPane('formationLinesPane').style.display = 'block';
  map.getPane('formationMarkersPane').style.display = 'block';

  if (!skipHistory && currentFormationId && currentFormationId !== formationId) {
    formationHistory.push(currentFormationId);
  }

  currentFormationId = formationId;

  activeFormationLines.clearLayers();
  activeFormationMarkers.clearLayers();

  if (map.hasLayer(markerLayer)) {
    map.removeLayer(markerLayer);
  }

  var allLatLngs = [];

  var parentLoc = getLocationByKey(formation.parent);
  var parentMarker = markersByKey[formation.parent];
  if (!parentLoc || !parentMarker) return;

  var parentLatLng = parentMarker.getLatLng();
  allLatLngs.push(parentLatLng);

  L.marker(parentLatLng, {
    icon: hqIcon,
    pane: 'formationMarkersPane'
  })
  .bindPopup(
    "<div class='formation-popup'>" +
      "<div class='formation-popup-title'>" + (formation.hqTitle || parentLoc.title) + "</div>" +
      "<div class='formation-popup-place'>" + parentLoc.title + "</div>" +
    "</div>",
    { maxWidth: 380, minWidth: 260 }
  )
  .bindTooltip(formation.hqTitle || parentLoc.title, {
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

    var popupHtml = "<div class='formation-popup'>";
    popupHtml += "<div class='formation-popup-title'>" + childTitle + "</div>";

    if (child.battalions && child.battalions.length > 0) {
      popupHtml += "<div class='formation-popup-list'>";
      for (var j = 0; j < child.battalions.length; j++) {
        popupHtml +=
          "<div class='formation-popup-row'>" +
            "<div class='formation-popup-dates'>" + child.battalions[j].dates + "</div>" +
            "<div class='formation-popup-unit'>" + child.battalions[j].name + "</div>" +
          "</div>";
      }
      popupHtml += "</div>";
    } else {
      popupHtml += "<div class='formation-popup-place'>" + childLoc.title + "</div>";
    }

    if (child.formation) {
      popupHtml +=
        "<div class='formation-popup-link'>" +
          "<a href='#' onclick=\"showFormation('" + child.formation + "'); return false;\">" +
          "Show battalion locations</a>" +
        "</div>";
    }

    popupHtml += "</div>";

    L.marker(childLatLng, {
      icon: baorIcon,
      pane: 'formationMarkersPane'
    })
    .bindPopup(popupHtml, {
  maxWidth: 380,
  minWidth: 300,
  offset: L.point(30, -26)
})
    .bindTooltip(childTitle, {
      permanent: true,
      direction: 'top',
      offset: [0, -48],
      className: 'formation-marker-label',
      opacity: 0.9
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
    map.fitBounds(formationBounds, {
      paddingTopLeft: [140, 100],
      paddingBottomRight: [80, 80]
    });
  }

  showFormationBackButton();
  showFormationTitle(formation.title);
  applyFormationLabelVisibility();
}
  
  
function showFullStructure(structureId) {
  var structure = fullStructures[structureId];
  if (!structure) return;

  map.closePopup();
  map.getPane('formationLinesPane').style.display = 'block';
  map.getPane('formationMarkersPane').style.display = 'block';

  if (currentFormationId && currentFormationId !== structureId) {
    formationHistory.push(currentFormationId);
  }

  currentFormationId = structureId;

  activeFormationLines.clearLayers();
  activeFormationMarkers.clearLayers();

  if (map.hasLayer(markerLayer)) {
    map.removeLayer(markerLayer);
  }

  var allLatLngs = [];

  var divisionLoc = getLocationByKey(structure.division.key);
  if (!divisionLoc) return;

  var divisionLatLng = L.latLng(divisionLoc.coords[0], divisionLoc.coords[1]);
  allLatLngs.push(divisionLatLng);

  L.marker(divisionLatLng, {
    icon: hqIcon,
    pane: 'formationMarkersPane'
  })
  .bindPopup(
    "<div class='formation-popup'>" +
      "<div class='formation-popup-title'>" + structure.division.title + "</div>" +
      "<div class='formation-popup-place'>" + divisionLoc.title + "</div>" +
    "</div>",
   {
  maxWidth: 380,
  minWidth: 260,
  offset: L.point(30, -26)
}
  )
  .bindTooltip(structure.division.title, {
    permanent: true,
    direction: 'right',
    offset: [18, -20],
    className: 'formation-marker-label'
  })
  .addTo(activeFormationMarkers);

  var items = structure.brigades || structure.support;

for (var i = 0; i < items.length; i++) {
  var item = items[i];
  var loc = getLocationByKey(item.key);
  if (!loc) continue;

  var latLng = L.latLng(loc.coords[0], loc.coords[1]);
  allLatLngs.push(latLng);

  L.marker(latLng, {
    icon: baorIcon,
    pane: 'formationMarkersPane'
  })
  .bindPopup(
    "<div class='formation-popup'>" +
      "<div class='formation-popup-title'>" + item.title + "</div>" +
      "<div class='formation-popup-place'>" + loc.title + "</div>" +
      "<div style='margin-top:6px;'>" +
        item.details.map(d => "<div>" + d + "</div>").join("") +
      "</div>" +
    "</div>",
    { maxWidth: 380, minWidth: 260, offset: L.point(28, -22) }
  )
  .bindTooltip(item.title, {
    permanent: true,
    direction: 'top',
    offset: [0, -48],
    className: 'formation-marker-label'
  })
  .addTo(activeFormationMarkers);
}

    var divisionLine = L.polyline(
      [divisionLatLng, brigadeLatLng],
      {
        color: "#1f2a44",
        weight: 4,
        opacity: 0.75,
        dashArray: "8, 8",
        lineCap: "round",
        pane: 'formationLinesPane'
      }
    );
    activeFormationLines.addLayer(divisionLine);

    for (var j = 0; j < brigade.children.length; j++) {
      var child = brigade.children[j];
      var childLoc = getLocationByKey(child.key);
      if (!childLoc) continue;

      var childLatLng = L.latLng(childLoc.coords[0], childLoc.coords[1]);
      allLatLngs.push(childLatLng);

      L.marker(childLatLng, {
        icon: baorIcon,
        pane: 'formationMarkersPane'
      })
      .bindPopup(
        "<div class='formation-popup'>" +
          "<div class='formation-popup-title'>" + child.title + "</div>" +
          "<div class='formation-popup-place'>" + childLoc.title + "</div>" +
        "</div>",
        { maxWidth: 380, minWidth: 260, offset: L.point(30, -26) }
      )
      .bindTooltip(child.title, {
        permanent: true,
        direction: 'top',
        offset: [0, -48],
        className: 'formation-marker-label'
      })
      .addTo(activeFormationMarkers);

      var brigadeLine = L.polyline(
        [brigadeLatLng, childLatLng],
        {
          color: "#4c6488",
          weight: 2,
          opacity: 0.65,
          dashArray: "6, 8",
          lineCap: "round",
          pane: 'formationLinesPane'
        }
      );
      activeFormationLines.addLayer(brigadeLine);
    }
  }

  if (allLatLngs.length > 0) {
    var fullBounds = L.latLngBounds(allLatLngs);
    map.fitBounds(fullBounds, {
      paddingTopLeft: [140, 100],
      paddingBottomRight: [80, 80]
    });
  }

  showFormationBackButton();
  showFormationTitle(structure.title);
  applyFormationLabelVisibility();
}

function goBackFormation() {
  activeFormationLines.clearLayers();
  activeFormationMarkers.clearLayers();

  if (formationHistory.length > 0) {
    var previousView = formationHistory.pop();
    currentFormationId = null;

    if (formations[previousView]) {
      showFormation(previousView, true);
      return;
    }

    if (fullStructures[previousView]) {
      showFullStructure(previousView);
      return;
    }
  }

  resetFormation();
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
  map.closePopup();

  activeFormationLines.clearLayers();
  activeFormationMarkers.clearLayers();

  map.getPane('formationLinesPane').style.display = 'none';
  map.getPane('formationMarkersPane').style.display = 'none';

  hideFormationBackButton();
  hideFormationTitle();

  currentFormationId = null;
  formationHistory = [];

  if (map.hasLayer(markerLayer)) {
    map.removeLayer(markerLayer);
  }

  setTimeout(function () {
    map.addLayer(markerLayer);

    if (markerLayer.refreshClusters) {
      markerLayer.refreshClusters();
    }

    map.fitBounds(bounds, { padding: [30, 30] });
    map.invalidateSize();
  }, 0);
}
function toggleFormationLabels() {
  formationLabelsVisible = !formationLabelsVisible;

  var toggleBtn = document.getElementById("toggle-labels-btn");
  var labels = document.querySelectorAll(".leaflet-tooltip");

  labels.forEach(function(label) {
    label.style.display = formationLabelsVisible ? "" : "none";
  });

  if (toggleBtn) {
    toggleBtn.textContent = formationLabelsVisible ? "Hide labels" : "Show labels";
  }
}

function applyFormationLabelVisibility() {
  var labels = document.querySelectorAll(".leaflet-tooltip");

  labels.forEach(function(label) {
    label.style.display = formationLabelsVisible ? "" : "none";
  });
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

var toggleLabelsButton = document.getElementById("toggle-labels-btn");

if (toggleLabelsButton) {
  toggleLabelsButton.addEventListener("click", toggleFormationLabels);
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
