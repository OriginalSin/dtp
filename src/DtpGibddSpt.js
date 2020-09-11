import {MarkerPoint, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupGibdd.svelte';

const L = window.L;

const popup = L.popup();
let argFilters;
const setPopup = function (id) {
	let url = 'https://dtp.mvs.group/scripts/dtp_spb_lo_dev/get_stat_gipdd_spb_' + id + '.txt';
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
export const DtpGibddSpt = L.featureGroup([]);
// DtpGibddSpt._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
DtpGibddSpt.checkZoom = z => {
	if (Object.keys(DtpGibddSpt._layers).length) {
		if (z < 12) {
			DtpGibddSpt.setFilter(argFilters);
		}
	} else if (z > 11) {
		DtpGibddSpt.setFilter(argFilters);
	}
};
DtpGibddSpt.setFilter = arg => {
// console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
	if (!DtpGibddSpt._map) { return; }
	DtpGibddSpt.clearLayers();
	argFilters = arg || [];

	let arr = [], heat = [];
	if (DtpGibddSpt._group && DtpGibddSpt._map) {
		DtpGibddSpt._group.getLayers().forEach(it => {
			let prp = it.options.props,
				cnt = 0;
			argFilters.forEach(ft => {
				if (ft.type === 'collision_type') {
					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
					// if (prp.collision_type === ft.zn) {
						cnt++;
					}
				} else if (ft.type === 'evnt') {
					if (prp.event) {
						if (ft.zn.ev1) { cnt++; }
					} else {
						if (ft.zn.ev0) { cnt++; }
					}
				} else if (ft.type === 'dps') {
					if (prp.dps) {
						if (ft.zn.Dps1) { cnt++; }
					} else {
						if (ft.zn.Dps0) { cnt++; }
					}
				} else if (ft.type === 'id_dtp') {
					if (prp.id == ft.zn) {
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
			} else {
				var tt = 1;
				// console.log(tt);
			}
		});
		if (DtpGibddSpt._needHeat) {
			DtpGibddSpt._map.addLayer(DtpGibddSpt._heat);
			DtpGibddSpt._heat.setLatLngs(heat);
			DtpGibddSpt._heat.setOptions(DtpGibddSpt._needHeat);
			if (DtpGibddSpt._map._zoom > 11) {
				DtpGibddSpt.addLayer(L.layerGroup(arr));
			}
		} else {
			DtpGibddSpt.addLayer(L.layerGroup(arr));
			DtpGibddSpt._map.removeLayer(DtpGibddSpt._heat);
		}

	}
};

DtpGibddSpt.on('remove', (ev) => {
	// DtpGibddSpt._needHeat = null;
	DtpGibddSpt._map.removeLayer(DtpGibddSpt._heat);
	DtpGibddSpt.clearLayers();
}).on('add', ev => {
	// console.log('/static/data/dtpskpdi.geojson', ev);
	DtpGibddSpt._heat = L.heatLayer([], {
		// blur: 50,
		gradient: {0.1: 'blue', 0.4: 'lime', 1: 'red'}
	});
	argFilters = [];

	fetch('https://dtp.mvs.group/scripts/dtp_spb_lo_dev/get_stat_gipdd_spb.txt', {})
		.then(req => req.json())
		.then(json => {
			let opt = {collision_type: {}, iconType: {}, event: {}};
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
				
// if (prp.id == 220457693) {
	// prp.dps = 1;
// }
if (prp.lon > 55) {
console.log('_______', prp);
}
if (!prp.lat || !prp.lon) {
console.log('_______', prp);
	prp.lat = prp.lon = 0;
}
				let cnt = opt.event[prp.event];
				if (!cnt) {
					cnt = 1;
				} else {
					cnt++;
				}
				opt.event[prp.event] = cnt;

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
				DtpGibddSpt.addLayer(DtpGibddSpt._heat);
				DtpGibddSpt._heat.setLatLngs(heat);
				DtpGibddSpt._heat.setOptions(DtpGibddSpt._needHeat);
			// }

			DtpGibddSpt._opt = opt;
			DtpGibddSpt._group = L.layerGroup(arr);

			if (argFilters) {
				DtpGibddSpt.setFilter(argFilters);
			} else if (DtpGibddSpt._map._zoom > 11) {
			// } else if (DtpGibddSpt._map._zoom > 1) {
				DtpGibddSpt.addLayer(DtpGibddSpt._group);
			}
			DtpGibddSpt._refreshFilters();
		});
});

