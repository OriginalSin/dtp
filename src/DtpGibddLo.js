import {MarkerPoint, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupGibdd.svelte';

const L = window.L;

const popup = L.popup({minWidth: 360});
let argFilters;

const setPopup = function (id) {
	let url = 'https://dtp.mvs.group/scripts/dtp_spb_lo_dev/get_stat_gipdd_lo_' + id + '.txt';
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
export const DtpGibddLo = L.featureGroup([]);
// DtpGibddLo._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
DtpGibddLo.checkZoom = z => {
	if (Object.keys(DtpGibddLo._layers).length) {
		if (z < 12) {
			DtpGibddLo.setFilter(argFilters);
		}
	} else if (z > 11) {
		DtpGibddLo.setFilter(argFilters);
	}
};
DtpGibddLo.setFilter = arg => {
// console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
	if (!DtpGibddLo._map) { return; }
	DtpGibddLo.clearLayers();
	argFilters = arg || [];

	let arr = [], heat = [];
	if (DtpGibddLo._group && DtpGibddLo._map) {
		DtpGibddLo._group.getLayers().forEach(it => {
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
			}
		});
		if (DtpGibddLo._needHeat) {
			DtpGibddLo._map.addLayer(DtpGibddLo._heat);
			DtpGibddLo._heat.setLatLngs(heat);
			DtpGibddLo._heat.setOptions(DtpGibddLo._needHeat);
			if (DtpGibddLo._map._zoom > 11) {
				DtpGibddLo.addLayer(L.layerGroup(arr));
			}
		} else {
			DtpGibddLo.addLayer(L.layerGroup(arr));
			DtpGibddLo._map.removeLayer(DtpGibddLo._heat);
		}

	}
};

DtpGibddLo.on('remove', (ev) => {
	// DtpGibddLo._needHeat = null;
	DtpGibddLo._map.removeLayer(DtpGibddLo._heat);
	DtpGibddLo.clearLayers();
}).on('add', ev => {
	// console.log('/static/data/dtpskpdi.geojson', ev);
	DtpGibddLo._heat = L.heatLayer([], {
		// blur: 50,
		gradient: {0.1: 'blue', 0.4: 'lime', 1: 'red'}
	});
	argFilters = [
		{type: 'date', zn: [(new Date(2019, 0, 1)).getTime()/1000, (new Date()).getTime()/1000]}
	];

	fetch('https://dtp.mvs.group/scripts/dtp_spb_lo_dev/get_stat_gipdd_lo.txt', {})
	// fetch('https://dtp.mvs.group/scripts/dtp_spb_lo_dev/get_stat_gipdd_spb.txt', {})
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
				DtpGibddLo.addLayer(DtpGibddLo._heat);
				DtpGibddLo._heat.setLatLngs(heat);
				DtpGibddLo._heat.setOptions(DtpGibddLo._needHeat);
			// }

			DtpGibddLo._opt = opt;
			DtpGibddLo._group = L.layerGroup(arr);

			if (argFilters) {
				DtpGibddLo.setFilter(argFilters);
			} else if (DtpGibddLo._map._zoom > 11) {
			// } else if (DtpGibddLo._map._zoom > 1) {
				DtpGibddLo.addLayer(DtpGibddLo._group);
			}
			DtpGibddLo._refreshFilters();
		});
});

