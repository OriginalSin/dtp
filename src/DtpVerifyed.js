import {MarkerPoint, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupVerifyed.svelte';

const L = window.L;

const popup = L.popup();
let argFilters;
let collision_type;

const setPopup = function (props) {
	let cont = L.DomUtil.create('div');
	new DtpPopup({
		target: cont,
		props: {
			// popup: popup,
			prp: props
		}
	});
	popup.setContent(cont);
	return cont;
}

// let renderer = L.canvas();
export const DtpVerifyed = L.featureGroup([]);
DtpVerifyed._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
DtpVerifyed.checkZoom = z => {
	if (Object.keys(DtpVerifyed._layers).length) {
		if (z < 12) {
			DtpVerifyed.setFilter(argFilters);
		}
	} else if (z > 11) {
		DtpVerifyed.setFilter(argFilters);
	}
};

DtpVerifyed.setFilter = arg => {
// console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
	DtpVerifyed.clearLayers();
	argFilters = arg || [];

	let arr = [], heat = [];
	if (DtpVerifyed._group) {
		DtpVerifyed._group.getLayers().forEach(it => {
			let prp = it.options.props,
				cnt = 0;
			argFilters.forEach(ft => {
				if (ft.type === 'itemType') {
					if (ft.zn === 0) {
						cnt++;
					} else if (ft.zn === 1 && prp.id_stat && prp.id_skpdi) {
						cnt++;
					} else if (ft.zn === 2 && (prp.id_skpdi && !prp.id_stat)) {
						cnt++;
					} else if (ft.zn === 3 && (prp.id_stat && !prp.id_skpdi)) {
						cnt++;
					}
				} else if (ft.type === 'collision_type') {
					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
					// if (prp.collision_type === ft.zn) {
						cnt++;
					}
				} else if (ft.type === 'date') {
					if (prp.date >= ft.zn[0] && prp.date < ft.zn[1]) {
						cnt++;
					}
				}
			});
			if (cnt === argFilters.length) {
				arr.push(it);
				heat.push(it._latlng);
			}
		});
		// DtpVerifyed.addLayer(L.layerGroup(arr));
		if (DtpVerifyed._needHeat) {
			DtpVerifyed._map.addLayer(DtpVerifyed._heat);
			DtpVerifyed._heat.setLatLngs(heat);
			DtpVerifyed._heat.setOptions(DtpVerifyed._needHeat);
			if (DtpVerifyed._map._zoom > 11) {
				DtpVerifyed.addLayer(L.layerGroup(arr));
			}
		} else {
			DtpVerifyed.addLayer(L.layerGroup(arr));
			DtpVerifyed._map.removeLayer(DtpVerifyed._heat);
		}
	}
};

DtpVerifyed.on('remove', () => {
	// DtpVerifyed._needHeat = null;
	DtpVerifyed._map.removeLayer(DtpVerifyed._heat);
	DtpVerifyed.clearLayers();
}).on('add', ev => {
	DtpVerifyed._heat = L.heatLayer([], {interactive: false});
	fetch('https://dtp.mvs.group/scripts/index.php?request=get_collision', {})
		.then(req => req.json())
		.then(json => {
			let opt = {collision_type: {}, iconType: {}};
			// DtpVerifyed._heatData = [];
			let heat = [];
			let arr = json.map(prp => {
				let iconType = prp.iconType || 0,
					cur = [],
					stroke = false,
					fillColor = '#2F4F4F'; //   17-20
				if (iconType) {
					stroke = iconType % 2 === 0 ? true : false; //  - смертельные ДТП
					if (iconType >= 1 && iconType <= 6) {
						fillColor = '#8B4513'; //  1-6
					} else if (iconType === 7 || iconType === 8) {
						fillColor = '#228B22'; //  7-8
					} else if (iconType >= 9 && iconType <= 14) {
						fillColor = '#8B4513'; //  9-14
					} else if (iconType === 15 || iconType === 16) {
						fillColor = '#7B68EE'; //  15-16
					} else if (iconType === 17 || iconType === 18) {
						fillColor = '#2F4F4F'; //  17-18
					}
				}

				if (prp.id_skpdi) { cur.push({type: 'skpdi', id: prp.id_skpdi}); }
				if (prp.id_stat) { cur.push({type: 'gibdd', id: prp.id_stat}); }
				prp._cur = cur;

if (!prp.lat || !prp.lon) {
console.log('_______', prp);
	prp.lat = prp.lon = 0;
}
				// DtpVerifyed._heatData.push({lat: prp.lat, lng: prp.lon, count: iconType});
// if (cur.length > 1) {
// console.log('___prp.id_skpdi && prp.id_stat____', prp);
// }
				let cTypeCount = opt.collision_type[prp.collision_type];
				if (!cTypeCount) {
					cTypeCount = 1;
				} else {
					cTypeCount++;
				}
				opt.collision_type[prp.collision_type] = cTypeCount;
				opt.iconType[prp.collision_type] = iconType;

				let latLng = L.latLng(prp.lat, prp.lon);
				heat.push(latLng);

				return new CirclePoint(latLng, {
					props: prp,
					radius: 6,
					triangle: cur.length > 1 ? true : false,
					box: prp.id_skpdi ? true : false,
					stroke: stroke,
					fillColor: fillColor,
					// renderer: renderer
				}).bindPopup(popup)
				.on('popupopen', (ev) => {

					setPopup(ev.target.options.props);
					// console.log('popupopen', ev);
				}).on('popupclose', (ev) => {
					// console.log('popupclose', ev);
					// ev.popup.setContent('');
					if (ev.popup._svObj) {
						ev.popup._svObj.$destroy();
						delete ev.popup._svObj;
					}
				});
			});
			DtpVerifyed.addLayer(DtpVerifyed._heat);
			DtpVerifyed._heat.setLatLngs(heat);
			DtpVerifyed._heat.setOptions(DtpVerifyed._needHeat);

			DtpVerifyed._opt = opt;
			DtpVerifyed._group = L.layerGroup(arr);
			if (argFilters) {
				DtpVerifyed.setFilter(argFilters);
			} else {
				DtpVerifyed.addLayer(DtpVerifyed._group);
			}
			DtpVerifyed.checkZoom(DtpVerifyed._map._zoom);
			DtpVerifyed._refreshFilters();
		});
});

