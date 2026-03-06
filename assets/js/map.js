var map = L.map('map').setView([52.9, 9.8], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

for (var i = 0; i < locations.length; i++) {
  var loc = locations[i];

  var marker = L.marker(loc.coords).addTo(map);

  var popupHtml = '<strong>' + loc.title + '</strong><br>' +
                  '<a href="' + loc.page + '" target="_blank">Open page</a>';

  marker.bindPopup(popupHtml);
}
