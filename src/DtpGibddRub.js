import {MarkerPoint, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupGibddRub.svelte';

const L = window.L;

const popup = L.popup();
let argFilters;
const setPopup = function (id) {
	let url = 'https://dtp.mvs.group/scripts/dtprubez_dev/get_stat_gipdd_with_rub_' + id + '.txt';
	fetch(url, {})
		.then(req => req.json())
		.then(json => {
// console.log('bindPopup', layer, json, DtpPopup);
			let cont = L.DomUtil.create('div');
			const app = new DtpPopup({
				target: cont,
				props: {
					prp: json
				}
			});
			popup._svObj = app;
			popup.setContent(cont);
		});
	return '';
}

// let renderer = L.canvas();
export const DtpGibddRub = L.featureGroup([]);
DtpGibddRub._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
DtpGibddRub.checkZoom = z => {
	if (Object.keys(DtpGibddRub._layers).length) {
		if (z < 12) {
			DtpGibddRub.setFilter(argFilters);
		}
	} else if (z > 11) {
		DtpGibddRub.setFilter(argFilters);
	}
};
DtpGibddRub.setFilter = arg => {
// console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
	if (!DtpGibddRub._map) { return; }
	DtpGibddRub.clearLayers();
	argFilters = arg || [];
	DtpGibddRub._argFilters = argFilters;

	let arr = [], heat = [];
	if (DtpGibddRub._group && DtpGibddRub._map) {
		DtpGibddRub._group.getLayers().forEach(it => {
			let prp = it.options.props,
				cnt = 0;
			argFilters.forEach(ft => {
				if (ft.type === 'collision_type') {
					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
					// if (prp.collision_type === ft.zn) {
						cnt++;
					}
				} else if (ft.type === 'id_dtp') {
					if (prp.id == ft.zn) {
						cnt++;
					}
				} else if (ft.type === 'list_rub') {
					if (prp.list_rub.length) {
						if (ft.zn.on) { cnt++; }
					} else {
						if (ft.zn.off) { cnt++; }
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
		if (DtpGibddRub._needHeat) {
			DtpGibddRub._map.addLayer(DtpGibddRub._heat);
			DtpGibddRub._heat.setLatLngs(heat);
			DtpGibddRub._heat.setOptions(DtpGibddRub._needHeat);
			if (DtpGibddRub._map._zoom > 11) {
				DtpGibddRub.addLayer(L.layerGroup(arr));
			}
		} else {
			DtpGibddRub.addLayer(L.layerGroup(arr));
			DtpGibddRub._map.removeLayer(DtpGibddRub._heat);
		}

	}
};

DtpGibddRub.on('remove', (ev) => {
	// DtpGibddRub._needHeat = null;
	DtpGibddRub._map.removeLayer(DtpGibddRub._heat);
	DtpGibddRub.clearLayers();
}).on('add', ev => {
	// console.log('/static/data/dtpskpdi.geojson', ev);
	DtpGibddRub._heat = L.heatLayer([], {
		// blur: 50,
		gradient: {0.1: 'blue', 0.4: 'lime', 1: 'red'}
	});
	argFilters = null;

	fetch('https://dtp.mvs.group/scripts/dtprubez_dev/get_stat_gipdd_with_rub.txt', {})
		.then(req => req.json())
		.then(json => {
			let opt = {collision_type: {}, iconType: {}};
			let heat = [];
			let arr = json.map(prp => {
				let iconType = prp.iconType || 0,
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
				if (!prp.list_rub) { prp.list_rub = []; }

if (!prp.lat || !prp.lon) {
console.log('_______', prp);
	prp.lat = prp.lon = 0;
}
				let cTypeCount = opt.collision_type[prp.collision_type];
				if (!cTypeCount) {
					cTypeCount = 1;
				} else {
					cTypeCount++;
				}
				opt.collision_type[prp.collision_type] = cTypeCount;
				opt.iconType[prp.collision_type] = iconType;

				let latLng = L.latLng(prp.lat, prp.lon, stroke ? 1 : 0.5);
				heat.push(latLng);

				return new CirclePoint(latLng, {
					props: prp,
					radius: 6,
					// box: true,
					stroke: stroke,
					fillColor: fillColor,
					// renderer: renderer
				}).bindPopup(popup).on('popupopen', (ev) => {
						setPopup(ev.target.options.props.id);
						ev.target.bringToBack();
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
			// let out = {arr: arr, heat: heat, opt: opt};
			// target._data = out;
			// return out;
			// if (target._heat) {
				DtpGibddRub.addLayer(DtpGibddRub._heat);
				DtpGibddRub._heat.setLatLngs(heat);
				DtpGibddRub._heat.setOptions(DtpGibddRub._needHeat);
			// }

			DtpGibddRub._opt = opt;
			DtpGibddRub._group = L.layerGroup(arr);

			// if (argFilters) {
				DtpGibddRub.setFilter();
			// } else 
			if (DtpGibddRub._map._zoom > 11) {
				DtpGibddRub.addLayer(DtpGibddRub._group);
			}
			DtpGibddRub._refreshFilters();
		});
});

