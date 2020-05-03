// import 'leaflet-sidebar-v2';
// import 'leaflet-sidebar-v2/style';

import './GmxIcon';
import './GmxCenter';
import './FitCenter';
import {proxy, hrefParams} from './Config';
import {MarkerPoint, CirclePoint} from './CirclePoint';
import {DtpGibdd} from './DtpGibdd';
import {DtpSkpdi} from './DtpSkpdi';
import {DtpVerifyed} from './DtpVerifyed';
import DtpVerifyedFilters from './DtpVerifyedFilters.svelte';
import {DtpHearths} from './DtpHearths';
import {DtpHearthsTmp} from './DtpHearthsTmp';

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
var Mercator = L.TileLayer.extend({
	options: {
		tilesCRS: L.CRS.EPSG3395
	},
	_getTiledPixelBounds: function (center) {
		var pixelBounds = L.TileLayer.prototype._getTiledPixelBounds.call(this, center);
		this._shiftY = this._getShiftY(this._tileZoom);
		pixelBounds.min.y += this._shiftY;
		pixelBounds.max.y += this._shiftY;
		return pixelBounds;
	},
	_tileOnError: function (done, tile, e) {
		var file = tile.getAttribute('src'),
			pos = file.indexOf('/mapcache/');

		if (pos > -1) {
			var searchParams = new URL('http:' + file).searchParams,
				arr = file.substr(pos + 1).split('/'),
				pItem  = proxy[arr[1]];

			tile.src = L.Util.template(pItem.errorTileUrlPrefix + pItem.postfix, {
				z: searchParams.get('z'),
				x: searchParams.get('x'),
				y: searchParams.get('y')
			});
		}
		done(e, tile);
	},
	_getTilePos: function (coords) {
		var tilePos = L.TileLayer.prototype._getTilePos.call(this, coords);
		return tilePos.subtract([0, this._shiftY]);
	},

	_getShiftY: function(zoom) {
		var map = this._map,
			pos = map.getCenter(),
			shift = (map.options.crs.project(pos).y - this.options.tilesCRS.project(pos).y);

		return Math.floor(L.CRS.scale(zoom) * shift / 40075016.685578496);
	}
});
L.TileLayer.Mercator = Mercator;
L.tileLayer.Mercator = function (url, options) {
	return new Mercator(url, options);
};

let baseLayers = {};
if (!hrefParams.b) { hrefParams.b = 'm2'; }
['m2', 'm3'].forEach(key => {
	let it = proxy[key],
		lit = L.tileLayer.Mercator(it.prefix + it.postfix, it.options);
	baseLayers[it.title] = lit;
	if (hrefParams.b === it.options.key) { lit.addTo(map); }
});
baseLayers.OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	maxZoom: 21,
	maxNativeZoom: 18
});

let overlays = {
	// Marker: L.marker([55.758031, 37.611694])
		// .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
		// .openPopup(),
	'ДТП Очаги(tmp)': DtpHearthsTmp,
	'ДТП Очаги': DtpHearths,
	'ДТП Сводный': DtpVerifyed,
	'ДТП СКПДИ': DtpSkpdi,
	'ДТП ГИБДД': DtpGibdd,
	// polygon: L.polygon([[55.05, 37],[55.03, 41],[52.05, 41],[52.04, 37]], {color: 'red'})
};
let ovHash = hrefParams.o ? hrefParams.o.split(',').reduce((p, c) => {p[c] = true; return p;}, {}) : {};
['m1', 'm4', 'm5'].forEach(key => {
	let it = proxy[key],
		lit = L.tileLayer.Mercator(it.prefix + it.postfix, it.options);
	overlays[it.title] = lit;
	if (ovHash[it.options.key]) { lit.addTo(map); }
});
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
				DtpHearthsTmp: DtpHearthsTmp,
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