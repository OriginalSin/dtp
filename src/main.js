// import 'leaflet-sidebar-v2';
// import 'leaflet-sidebar-v2/style';

import './GmxIcon';
import './GmxCenter';
import './FitCenter';
import {MarkerPoint, CirclePoint} from './CirclePoint';
import {DtpGipdd} from './DtpGipdd';
import {DtpSkpdi} from './DtpSkpdi';

const L = window.L;
const map = L.map(document.body, {
	center: [55.758031, 37.611694],
	minZoom: 1,
	zoom: 8,
	maxZoom: 21,
	// zoomControl: false,
	attributionControl: false,
	trackResize: true,
	fadeAnimation: true,
	zoomAnimation: true,
	distanceUnit: 'auto',
	squareUnit: 'auto',
});

var corners = map._controlCorners,
	parent = map._controlContainer,
	tb = 'leaflet-top leaflet-bottom',
	lr = 'leaflet-left leaflet-right',
	classNames = {
		bottom: 'leaflet-bottom ' + lr,
		gmxbottomleft: 'leaflet-bottom leaflet-left',
		gmxbottomcenter: 'leaflet-bottom ' + lr,
		gmxbottomright: 'leaflet-bottom leaflet-right',
		center: tb + ' ' + lr,
		right:  'leaflet-right ' + tb,
		left:   'leaflet-left ' + tb,
		top:    'leaflet-top ' + lr
	};

for (var key in classNames) {
	if (!corners[key]) {
		corners[key] = L.DomUtil.create('div', classNames[key], parent);
	}
}

map.addControl(L.control.gmxCenter())
	.addControl(L.control.fitCenter());

let baseLayers = {
	OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map)
}

let overlays = {
	// Marker: L.marker([55.758031, 37.611694])
		// .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
		// .openPopup(),
	'ДТП СКПДИ': DtpSkpdi,
	'ДТП ГИБДД': DtpGipdd,
	// polygon: L.polygon([[55.05, 37],[55.03, 41],[52.05, 41],[52.04, 37]], {color: 'red'})
};

L.control.layers(baseLayers, overlays).addTo(map);

let filtersControl = L.control.gmxIcon({
  id: 'filters',
  className: 'leaflet-bar',
  togglable: true,
  title: 'Фильтры'
})
.on('statechange', function (ev) {
	console.log({filtersIcon: ev.target.options.isActive});
}).addTo(map);

// var sidebar = L.control.sidebar({
    // autopan: false,       // whether to maintain the centered map point when opening the sidebar
    // closeButton: true,    // whether t add a close button to the panes
    // container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    // position: 'left',     // left or right
// }).addTo(map);

export default map;