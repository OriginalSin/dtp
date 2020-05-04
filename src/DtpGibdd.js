import {MarkerPoint, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupGibdd.svelte';

const L = window.L;

const popup = L.popup();
let argFilters;
const setPopup = function (id) {
	let url = 'https://dtp.mvs.group/scripts/index.php?request=get_dtp_id&id=' + id + '&type=gibdd';
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
export const DtpGibdd = L.featureGroup([]);
DtpGibdd.setFilter = arg => {
// console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
	DtpGibdd.clearLayers();
	argFilters = arg;

	let arr = [];
	if (DtpGibdd._group) {
		DtpGibdd._group.getLayers().forEach(it => {
			let prp = it.options.props,
				cnt = 0;
			argFilters.forEach(ft => {
				if (ft.type === 'collision_type') {
					if (prp.collision_type === ft.zn) {
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
			}
		});
		DtpGibdd.addLayer(L.layerGroup(arr));
	}
};

DtpGibdd.on('remove', () => {
	DtpGibdd.clearLayers();
}).on('add', ev => {
	// console.log('/static/data/dtpskpdi.geojson', ev);
	
	fetch('https://dtp.mvs.group/scripts/index.php?request=get_stat_gipdd', {})
		.then(req => req.json())
		.then(json => {
			let opt = {collision_type: {}};
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
				return new CirclePoint(L.latLng(prp.lat, prp.lon), {
					props: prp,
					radius: 6,
					// box: true,
					stroke: stroke,
					fillColor: fillColor,
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

			DtpGibdd._opt = opt;
			DtpGibdd._group = L.layerGroup(arr);
			if (argFilters) {
				DtpGibdd.setFilter(argFilters);
			} else {
				DtpGibdd.addLayer(DtpGibdd._group);
			}
			DtpGibdd._refreshFilters();
		});
});
