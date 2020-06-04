import {MarkerPoint, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupSkpdi.svelte';

const L = window.L;

const popup = L.popup();
let argFilters;

const setPopup = function (id) {
	let url = 'https://dtp.mvs.group/scripts/index.php?request=get_dtp_id&id=' + id + '&type=skpdi';
	fetch(url, {})
	// fetch('/static/data/dtpexample.json', {})
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
	// return layer.feature.properties.id || '';
}

export const DtpSkpdi = L.featureGroup([]);
DtpSkpdi._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
DtpSkpdi.checkZoom = z => {
	if (Object.keys(DtpSkpdi._layers).length) {
		if (z < 12) {
			DtpSkpdi.setFilter(argFilters);
		}
	} else if (z > 11) {
		DtpSkpdi.setFilter(argFilters);
	}
};
DtpSkpdi.setFilter = arg => {
// console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
	DtpSkpdi.clearLayers();
	argFilters = arg || [];

	let arr = [], heat = [];
	if (DtpSkpdi._group) {
		DtpSkpdi._group.getLayers().forEach(it => {
			let prp = it.options.props,
				cnt = 0;
			argFilters.forEach(ft => {
				if (ft.type === 'collision_type') {
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
		if (DtpSkpdi._needHeat) {
			DtpSkpdi._map.addLayer(DtpSkpdi._heat);
			DtpSkpdi._heat.setLatLngs(heat);
			DtpSkpdi._heat.setOptions(DtpSkpdi._needHeat);
			if (DtpSkpdi._map._zoom > 11) {
				DtpSkpdi.addLayer(L.layerGroup(arr));
			}
		} else {
			DtpSkpdi.addLayer(L.layerGroup(arr));
			DtpSkpdi._map.removeLayer(DtpSkpdi._heat);
		}
	}
};

DtpSkpdi.on('remove', () => {
	// DtpSkpdi._needHeat = null;
	DtpSkpdi._map.removeLayer(DtpSkpdi._heat);
	DtpSkpdi.clearLayers();
}).on('add', ev => {
	// console.log('/static/data/dtpskpdi.geojson', ev);
	DtpSkpdi._heat = L.heatLayer([]);
	
	fetch('https://dtp.mvs.group/scripts/index.php?request=get_skpdi', {})
	// fetch('https://dtp.mvs.group/static/data/json_stat.json', {})
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
					box: true,
					stroke: stroke,
					fillColor: fillColor
					// ,
					// renderer: renderer
				}).bindPopup(popup).on('popupopen', (ev) => {
						setPopup(ev.target.options.props.id);
						// console.log('popupopen', ev);
					}).on('popupclose', (ev) => {
						console.log('popupclose', ev);
						// ev.popup.setContent('');
						if (ev.popup._svObj) {
							ev.popup._svObj.$destroy();
							delete ev.popup._svObj;
						}
					});
			});
			DtpSkpdi.addLayer(DtpSkpdi._heat);
			DtpSkpdi._heat.setLatLngs(heat);
			DtpSkpdi._heat.setOptions(DtpSkpdi._needHeat);

			DtpSkpdi._opt = opt;
			DtpSkpdi._group = L.layerGroup(arr);
			// DtpSkpdi.addLayer(L.layerGroup(arr));
			if (argFilters) {
				DtpSkpdi.setFilter(argFilters);
			} else {
				DtpSkpdi.addLayer(DtpSkpdi._group);
			}
			DtpSkpdi.checkZoom(DtpSkpdi._map._zoom);
			DtpSkpdi._refreshFilters();
		});
});

