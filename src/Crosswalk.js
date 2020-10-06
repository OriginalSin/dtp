import {CirclePoint} from './CirclePoint';
import CrosswalkPopup from './CrosswalkPopup.svelte';
import icon from './crosswalk.svg';

const L = window.L;

const popup = L.popup();
//const popup1 = L.popup({minWidth: 200});
let argFilters;
let collision_type;
let prefix = 'https://dtp.mvs.group/scripts/crosswalk_dev/crosswalk.txt';

const setPopup = function (props) {
	let cont = L.DomUtil.create('div'),
		id = props.id;
	new CrosswalkPopup({
		target: cont,
		props: {
			prp: props
		}
	});
	popup.setContent(cont);
	return cont;
}
const canvas = L.DomUtil.create("canvas");
canvas.width = canvas.height = 223;

const img = new Image();
img.onload = () => { canvas.getContext('2d').drawImage(img, 0, 0); }
img.src = 'data:image/svg+xml;base64,' + btoa(icon);

export const Crosswalk = L.featureGroup([]);
Crosswalk.setFilter = arg => {
// console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
	if (!Crosswalk._map) { return; }
	Crosswalk.clearLayers();
	// DtpHearths._heatData = [];
	argFilters = arg;
	Crosswalk._argFilters = argFilters;

	let arr = [];
	if (Crosswalk._group) {
		Crosswalk._group.getLayers().forEach(it => {
			let prp = it.options.props,
				cnt = 0;
			argFilters.forEach(ft => {
				if (ft.type === 'Crosswalk_type') {
					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.type).length) {
						cnt++;
					}
				} else if (ft.type === 'id_dtp') {
					if (prp.id_dtp == ft.zn) {
						cnt++;
					}
				} else if (ft.type === 'date') {
					if (prp.date_created >= ft.zn[0] && prp.date_created < ft.zn[1]) {
						cnt++;
					}
				}
			});
			if (cnt === argFilters.length) {
				arr.push(it);
				// arr = arr.concat(it.options.items);
				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
			}
		});
		Crosswalk.addLayer(L.layerGroup(arr));
		// DtpHearths._heat.setData({
			// max: 8,
			// data: DtpHearths._heatData
		// });
	}
};

Crosswalk.on('remove', () => {
	Crosswalk.clearLayers();
}).on('add', ev => {
	let opt = {type: {}, bad: []},
		arr = [],
		line_sid = {},
		parseItem = (prp) => {
			let iconType = 1,
				list_bounds = L.latLngBounds(),
				// latlngs = [],
				stroke = false,
				fillColor = 'gray';

			if (prp.rub_flag) {
				fillColor = '#00FF00';
			}
			if (line_sid[prp.obj_id]) {
				console.log('___Дубль____', prp);
			} else {
				line_sid[prp.obj_id] = prp;
			}

			let coords = prp.coords || {lat: prp.lat, lon: prp.lon},
				latlng = L.latLng(coords.lat, coords.lon),
				cur = [];

			if (!coords.lat || !coords.lon || !prp.obj_id) {
				opt.bad.push(prp);
				// console.log('_______', prp);
				return;
				// prp.lat = prp.lon = 0;
			}
			let ptype = prp.type || ' ';
prp.type = ptype;
			let type = opt.type[ptype] ;
			if (!type) {
				type = 1;
			} else {
				type++;
			}
			opt.type[ptype] = type;
			// list_bounds.extend(latlng);

			arr.push(new CirclePoint(latlng, {
					// cluster: it,
					image: canvas,
					props: prp,
					radius: 9,
					zIndexOffset: 50000,
					stroke: stroke,
					fillColor: fillColor,
				}).bindPopup(popup)
				.on('popupopen', (ev) => {

					setPopup(ev.target.options.props);
					ev.target.bringToBack();
					// console.log('popupopen', ev);
				}).on('popupclose', (ev) => {
					if (ev.popup._svObj) {
						ev.popup._svObj.$destroy();
						delete ev.popup._svObj;
					}
				})
			);
		};

	fetch(prefix, {}).then(req => req.json())
		.then(json => {
			json.forEach(parseItem);
			Crosswalk._opt = opt;
			Crosswalk._group = L.layerGroup(arr);
			Crosswalk.addLayer(Crosswalk._group);
			console.log('opt', opt);

		});
});

