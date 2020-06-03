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
import {DtpHearthsStat} from './DtpHearthsStat';
import {DtpHearths3} from './DtpHearths3';
import {DtpHearths5} from './DtpHearths5';

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
	'ДТП Очаги(5)': DtpHearths5,
	'ДТП Очаги(3)': DtpHearths3,
	'ДТП Очаги(Stat)': DtpHearthsStat,
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
	// console.log({filtersIcon: ev.target.options.isActive});
	let target = ev.target,
		cont = target._container,
		cont1 = target._win,
		isActive = target.options.isActive;
		
	if (isActive) {
		if (!cont1) {
			cont1 = target._win = L.DomUtil.create('div', 'win leaflet-control-layers', cont);
			// cont1.innerHTML = 'Слой "ДТП Сводный"';
			L.DomEvent.disableScrollPropagation(cont1);
			cont1._Filters = new DtpVerifyedFilters({
				target: cont1,
				props: {
					DtpGibdd: DtpGibdd,
					DtpSkpdi: DtpSkpdi,
					DtpHearths5: DtpHearths5,
					DtpHearths3: DtpHearths3,
					DtpHearthsStat: DtpHearthsStat,
					DtpHearthsTmp: DtpHearthsTmp,
					DtpHearths: DtpHearths,
					DtpVerifyed: DtpVerifyed
				}
			});
		}

		// target._win.classList.remove('hidden');
	} else {
		target._win.parentNode.removeChild(target._win);
		// target._win.classList.add('hidden');
		target._win = null;
	}

}).addTo(map);

const distVincenty = (latlng1, latlng2) => {
	var rd = Math.PI / 180.0,
		p1 = { lon: rd * latlng1.lng, lat: rd * latlng1.lat },
		p2 = { lon: rd * latlng2.lng, lat: rd * latlng2.lat },
		a = 6378137,
		b = 6356752.3142,
		f = 1 / 298.257223563;  // WGS-84 ellipsiod

	var L1 = p2.lon - p1.lon,
		U1 = Math.atan((1 - f) * Math.tan(p1.lat)),
		U2 = Math.atan((1 - f) * Math.tan(p2.lat)),
		sinU1 = Math.sin(U1), cosU1 = Math.cos(U1),
		sinU2 = Math.sin(U2), cosU2 = Math.cos(U2),
		lambda = L1,
		lambdaP = 2 * Math.PI,
		iterLimit = 20;
	while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0) {
			var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda),
				sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) +
				(cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
			if (sinSigma === 0) { return 0; }
			var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda,
				sigma = Math.atan2(sinSigma, cosSigma),
				sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma,
				cosSqAlpha = 1 - sinAlpha * sinAlpha,
				cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
			if (isNaN(cos2SigmaM)) { cos2SigmaM = 0; }
			var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
			lambdaP = lambda;
			lambda = L1 + (1 - C) * f * sinAlpha *
				(sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
	}
	if (iterLimit === 0) { return NaN; }

	var uSq = cosSqAlpha * ((a * a) / (b * b) - 1),
		A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
		B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
		deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
			B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM))),
		s = b * A * (sigma - deltaSigma);

	//s = s.toFixed(3);
	return s;
};

const getLatLngsLength = (latlngs) => {
	latlngs = latlngs || [];
	let	dist = 0,
		latlng = latlngs[0];
	latlngs.forEach( it => {
		dist += distVincenty(it, latlng);
		latlng = it;
	});
	return dist;
};

map.pm.setLang('customName', {
	tooltips: {
		finishLine: 'Щелкните любой существующий маркер для завершения',
	}
}, 'ru');
map.pm.setLang('ru');

let isMeasureActive, lineActionNode;
map
.on('pm:create', (ev) => {
	map.removeLayer(ev.layer);
	measureControl.setActive(false);
})
.on('pm:drawstart', (ev) => {
	let workingLayer =  ev.workingLayer;
	if (ev.shape === 'Line') {
		let _hintMarker = map.pm.Draw.Line._hintMarker;
		if (_hintMarker) {
			_hintMarker.on('move', function(e) {
				var latlngs = workingLayer.getLatLngs();
				if (latlngs.length) {
					var	dist = getLatLngsLength(latlngs),
						last = distVincenty(latlngs[latlngs.length - 1], e.latlng);

					dist += last;
					var distStr = dist > 1000 ? (dist  / 1000).toFixed(2) + ' км' : Math.ceil(dist) + ' м';
					var lastStr = last > 1000 ? (last  / 1000).toFixed(2) + ' км' : Math.ceil(last) + ' м';

				  _hintMarker._tooltip.setContent('Отрезок <b>(' + lastStr + ')</b>участка <b>(' + distStr + ')</b>')
				}
			});
		}
		if (isMeasureActive && ev.target.pm.Toolbar.buttons.drawPolyline.buttonsDomNode) {
			lineActionNode = ev.target.pm.Toolbar.buttons.drawPolyline.buttonsDomNode.children[1];
			lineActionNode.style.display = 'none';
		}
	}
});

let measureControl = L.control.gmxIcon({
  id: 'measure',
  className: 'leaflet-bar',
  togglable: true,
  title: 'Включить/Отключить режим измерения расстояний'
})
.on('statechange', function (ev) {
	isMeasureActive = ev.target.options.isActive;
	// ev.stopPropagation();
	// L.DomEvent.stopPropagation(ev);
	if (isMeasureActive) {
		map.pm.enableDraw('Line', { finishOn: 'dblclick' });
	} else {
		map.pm.disableDraw('Line');
		if (lineActionNode) {
			lineActionNode.style.display = '';
		}
	}
}).addTo(map);

const refreshFilters = () => {
	setTimeout(() => {
		if (filtersControl.options.isActive) {
			filtersControl.setActive(false);
			filtersControl._win = null;
			filtersControl.setActive(true);
		}
	});
};
DtpGibdd._refreshFilters =
DtpSkpdi._refreshFilters =
DtpVerifyed._refreshFilters =
DtpHearths._refreshFilters =
DtpHearthsStat._refreshFilters =
DtpHearths3._refreshFilters =
DtpHearths5._refreshFilters =
DtpHearthsTmp._refreshFilters = refreshFilters;

const eventsStr = 'remove';
DtpGibdd.on(eventsStr, refreshFilters);
DtpSkpdi.on(eventsStr, refreshFilters);
DtpVerifyed.on(eventsStr, refreshFilters);
DtpHearths.on(eventsStr, refreshFilters);
DtpHearthsTmp.on(eventsStr, refreshFilters);
DtpHearthsStat.on(eventsStr, refreshFilters);
DtpHearths3.on(eventsStr, refreshFilters);
DtpHearths5.on(eventsStr, refreshFilters);

map
	.on('zoomend', (ev) => {
		map._crpx = 0;
// console.log('zoomend ', ev, map._zoom);
		if (DtpVerifyed._map) {
			DtpVerifyed.checkZoom(map._zoom);
		}
		if (DtpSkpdi._map) {
			DtpSkpdi.checkZoom(map._zoom);
		}
		if (DtpGibdd._map) {
			DtpGibdd.checkZoom(map._zoom);
		}
	});

export default map;