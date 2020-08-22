// import 'leaflet-sidebar-v2';
// import 'leaflet-sidebar-v2/style';

import './GmxIcon';
import './GmxCenter';
import './FitCenter';
import {proxy, hrefParams} from './Config';
import {getLatLngsLength} from './MapUtils';
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
import {DtpHearthsPicket} from './DtpHearthsPicket';
import {DtpHearthsSettlements} from './DtpHearthsSettlements';
import {Rub1} from './Rub1';
import {Rub} from './Rub';
import {Measures} from './Measures';

import {DtpGibddRub} from './DtpGibddRub';
import {TestGraphQl} from './TestGraphQl';
import {DtpHearthsPicket4} from './DtpHearthsPicket4';
import {Roads} from './Roads';
import {Settlements} from './Settlements';

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
	// 'TestGraphQl': TestGraphQl,
	
	// 'm4': m4,
	'Трассы': Roads,
	'Населенные пункты': Settlements,
	'Мероприятия': Measures,
	'Рубежи': Rub,
	// 'Рубежи (test)': Rub1,
	'Очаги с привязкой к городам': DtpHearthsSettlements,
	'Предочаги по пикетажу': DtpHearthsPicket4,
	'Очаги ГИБДД по пикетажу': DtpHearthsPicket,
	'Очаги ГИБДД разные типы, геометрия': DtpHearths5,
	'Очаги ГИБДД одного типа, геометрия': DtpHearths3,
	'ДТП Очаги(Stat)': DtpHearthsStat,
	'ДТП Очаги(tmp)': DtpHearthsTmp,
	'Очаги ГИБДД+СКПДИ по кварталам геометрия': DtpHearths,
	'ДТП  ГИБДД+СКПДИ (объединение)': DtpVerifyed,
	'ДТП СКПДИ + тепловая карта': DtpSkpdi,
	'ДТП ГИБДД + тепловая карта': DtpGibdd,
	'ДТП ГИБДД + тепловая карта + Рубежи': DtpGibddRub,
};

// let comp = L.DomUtil.create('div', 'layerInfo');
// comp.innerHTML = 'df<b>df</b>df';
// let info = L.DomUtil.create('div', '', comp);
// L.DomEvent.on(info, 'mouseover', (ev) => console.log);
// overlays[comp] = DtpHearths5;

let ovHash = hrefParams.o ? hrefParams.o.split(',').reduce((p, c) => {p[c] = true; return p;}, {}) : {};
['m1', 'm4', 'm5'].forEach(key => {
	let it = proxy[key],
		lit = L.tileLayer.Mercator(it.prefix + it.postfix, it.options);
	overlays[it.title] = lit;
	if (ovHash[it.options.key]) { lit.addTo(map); }
});
var lc = L.control.layers(baseLayers, overlays).addTo(map);

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
					control: target,
					DtpGibddRub: DtpGibddRub,
					DtpGibdd: DtpGibdd,
					DtpSkpdi: DtpSkpdi,
					Measures: Measures,
					Rub: Rub,
					// Rub1: Rub1,
					DtpHearthsPicket4: DtpHearthsPicket4,
					DtpHearthsSettlements: DtpHearthsSettlements,
					DtpHearthsPicket: DtpHearthsPicket,
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
DtpGibddRub._refreshFilters =
DtpGibdd._refreshFilters =
DtpSkpdi._refreshFilters =
Measures._refreshFilters =
DtpVerifyed._refreshFilters =
DtpHearths._refreshFilters =
DtpHearthsStat._refreshFilters =
DtpHearths3._refreshFilters =
DtpHearths5._refreshFilters =
DtpHearthsPicket._refreshFilters =
DtpHearthsSettlements._refreshFilters =
DtpHearthsPicket4._refreshFilters =
Rub._refreshFilters =
DtpHearthsTmp._refreshFilters = refreshFilters;

const eventsStr = 'remove';
DtpGibddRub.on(eventsStr, refreshFilters);
DtpGibdd.on(eventsStr, refreshFilters);
DtpSkpdi.on(eventsStr, refreshFilters);
Measures.on(eventsStr, refreshFilters);
DtpVerifyed.on(eventsStr, refreshFilters);
DtpHearths.on(eventsStr, refreshFilters);
DtpHearthsTmp.on(eventsStr, refreshFilters);
DtpHearthsStat.on(eventsStr, refreshFilters);
DtpHearths3.on(eventsStr, refreshFilters);
DtpHearths5.on(eventsStr, refreshFilters);
DtpHearthsPicket.on(eventsStr, refreshFilters);
DtpHearthsSettlements.on(eventsStr, refreshFilters);
DtpHearthsPicket4.on(eventsStr, refreshFilters);
Rub.on(eventsStr, refreshFilters);

map
	.on('zoomend', (ev) => {
		map._crpx = 0;
// console.log('zoomend ', map._zoom);
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
window._map = map;
export default map;