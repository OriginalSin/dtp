// import 'leaflet-sidebar-v2';
// import 'leaflet-sidebar-v2/style';

import './GmxIcon';
import './GmxCenter';
import './FitCenter';
import {MarkerPoint, CirclePoint} from './CirclePoint';
import {DtpGibdd} from './DtpGibdd';
import {DtpSkpdi} from './DtpSkpdi';
import {DtpVerifyed} from './DtpVerifyed';
import DtpVerifyedFilters from './DtpVerifyedFilters.svelte';
import {DtpHearths} from './DtpHearths';

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
/*
var cfg = {
	// radius should be small ONLY if scaleRadius is true (or small radius is intended)
	// "radius": 2,
	"radius": 15,
	// "radius": 5,
	"maxOpacity": .8, 
	// scales the radius based on map zoom
	// "scaleRadius": true, 
	// if set to false the heatmap uses the global maximum for colorization
	// if activated: uses the data maximum within the current map boundaries 
	//   (there will always be a red spot with useLocalExtremas true)
	"useLocalExtrema": true,
	// which field name in your data represents the latitude - default "lat"
	latField: 'lat',
	// which field name in your data represents the longitude - default "lng"
	lngField: 'lng',
	// which field name in your data represents the data value - default "value"
	valueField: 'count'
};

var heatmapLayer = new HeatmapOverlay(cfg);
// heatmapLayer.setData(testData);
// map.addLayer(heatmapLayer);
DtpVerifyed._heat = heatmapLayer;
*/
let baseLayers = {
	OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map)
}

let overlays = {
	// Marker: L.marker([55.758031, 37.611694])
		// .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
		// .openPopup(),
	'ДТП Очаги': DtpHearths,
	'ДТП Сводный': DtpVerifyed,
	'ДТП СКПДИ': DtpSkpdi,
	'ДТП ГИБДД': DtpGibdd,
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
	let target = ev.target,
		cont = target._container,
		cont1 = target._win,
		isActive = target.options.isActive;
		
	if (!cont1) {
		cont1 = target._win = L.DomUtil.create('div', 'win leaflet-control-layers hidden', cont);
		// cont1.innerHTML = 'Слой "ДТП Сводный"';
		L.DomEvent.disableScrollPropagation(cont1);
		cont1._Filters = new DtpVerifyedFilters({
			target: cont1,
			props: {
				DtpGibdd: DtpGibdd,
				DtpSkpdi: DtpSkpdi,
				DtpHearths: DtpHearths,
				DtpVerifyed: DtpVerifyed
			}
		});
	}

	if (isActive) {
		// MapUtils.GroupItems(map._selectedItems);
		target._win.classList.remove('hidden');
	} else {
		target._win.classList.add('hidden');
		target._win = null;
	}

}).addTo(map);

// var sidebar = L.control.sidebar({
    // autopan: false,       // whether to maintain the centered map point when opening the sidebar
    // closeButton: true,    // whether t add a close button to the panes
    // container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    // position: 'left',     // left or right
// }).addTo(map);

export default map;