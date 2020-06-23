import {MarkerPoint, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupGibddRub.svelte';

const L = window.L;

const popup = L.popup();
let argFilters;
const setPopup = function (id) {
	let url = 'https://dtp.mvs.group/scripts/dtprubez/get_stat_gipdd_with_rub_' + id + '.txt';
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
export const TestGraphQl = L.featureGroup([]);
TestGraphQl._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
TestGraphQl.checkZoom = z => {
	if (Object.keys(TestGraphQl._layers).length) {
		if (z < 12) {
			TestGraphQl.setFilter(argFilters);
		}
	} else if (z > 11) {
		TestGraphQl.setFilter(argFilters);
	}
};
TestGraphQl.setFilter = arg => {
// console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
	if (!TestGraphQl._map) { return; }
	TestGraphQl.clearLayers();
	argFilters = arg || [];
	TestGraphQl._argFilters = argFilters;

	let arr = [], heat = [];
	if (TestGraphQl._group) {
		TestGraphQl._group.getLayers().forEach(it => {
			let prp = it.options.props,
				cnt = 0;
			argFilters.forEach(ft => {
				if (ft.type === 'collision_type') {
					if (ft.zn[0] === '' || ft.zn.filter(pt => pt === prp.collision_type).length) {
					// if (prp.collision_type === ft.zn) {
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
		// if (false &&  TestGraphQl._needHeat) {
			// TestGraphQl._map.addLayer(TestGraphQl._heat);
			// TestGraphQl._heat.setLatLngs(heat);
			// TestGraphQl._heat.setOptions(TestGraphQl._needHeat);
			// if (TestGraphQl._map._zoom > 11) {
				// TestGraphQl.addLayer(L.layerGroup(arr));
			// }
		// } else {
			TestGraphQl.addLayer(L.layerGroup(arr));
			// TestGraphQl._map.removeLayer(TestGraphQl._heat);
		// }

	}
};

let query = `{
  allVMapLineInfos(filter: {lon: {isNull: false}, lat: {isNull: false}}) {
    totalCount
    nodes {
      lineSid: sid
      lineName: name
      lineAddress: address
      roadName
      stage
      lat
      lon
      yield
      complexes
    }
  }
}`;
TestGraphQl.on('remove', (ev) => {
	// TestGraphQl._needHeat = null;
	// TestGraphQl._map.removeLayer(TestGraphQl._heat);
	TestGraphQl.clearLayers();
}).on('add', ev => {
	// console.log('/static/data/dtpskpdi.geojson', ev);
	// TestGraphQl._heat = L.heatLayer([], {
		// gradient: {0.1: 'blue', 0.4: 'lime', 1: 'red'}
	// });
	fetch("https://dtp.mvs.group/static/proxy.php?url=https://graphql.dev.mvs.group/graphql", {
	  // "headers": {
		// "accept": "*/*",
		// "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
		// "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2FsZWtzZWV2IiwiZXhwIjoxNTkyODkxNTQwLCJ1c2VyX2lkIjoyOTAwLCJsb2dpbiI6InNhbGVrc2VldiIsImNuIjoi0JDQu9C10LrRgdC10LXQsiDQodC10YDQs9C10LkiLCJkYl9yaWdodHMiOltdLCJpYXQiOjE1OTI4MDUxNDAsImF1ZCI6InBvc3RncmFwaGlsZSIsImlzcyI6InBvc3RncmFwaGlsZSJ9.6aEl6xSJUCYxokUawioJS5sMkNSwiVzJiBr2w8Yvvfo",
		// "cache-control": "no-cache",
		// "content-type": "application/json",
		// "pragma": "no-cache",
		// "sec-fetch-dest": "empty",
		// "sec-fetch-mode": "cors",
		// "sec-fetch-site": "same-site"
	  // },
	  // "referrer": "https://inv.dev.mvs.group/map/main-map",
	  // "referrerPolicy": "no-referrer-when-downgrade",
	  "body": "{\"operationName\":null,\"variables\":{},\"query\":\"{\\n  allVMapLineInfos(filter: {lon: {isNull: false}, lat: {isNull: false}}) {\\n    totalCount\\n    nodes {\\n      lineSid: sid\\n      lineName: name\\n      lineAddress: address\\n      roadName\\n      stage\\n      lat\\n      lon\\n      yield\\n      complexes\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
	  "method": "POST",
	  "mode": "cors"
	  // ,
	  // "credentials": "include"
	})

	// fetch('https://dtp.mvs.group/scripts/dtprubez/get_stat_gipdd_with_rub.txt', {})
		.then(req => req.json())
		.then(json => {
console.log('json', json);
return;
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
			// if (false && target._heat) {
				// TestGraphQl.addLayer(TestGraphQl._heat);
				// TestGraphQl._heat.setLatLngs(heat);
				// TestGraphQl._heat.setOptions(TestGraphQl._needHeat);
			// }

			TestGraphQl._opt = opt;
			TestGraphQl._group = L.layerGroup(arr);

			if (argFilters) {
				TestGraphQl.setFilter(argFilters);
			} else if (true || TestGraphQl._map._zoom > 11) {
				TestGraphQl.addLayer(TestGraphQl._group);
			}
			// TestGraphQl._refreshFilters();
		});
});

