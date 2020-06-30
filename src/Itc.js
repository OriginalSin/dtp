import {MarkerPoint, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupGibddRub.svelte';

const L = window.L;

const popup = L.popup({maxWidth: 848});
let argFilters;
let curCam = 0;
const setPopup = function (prp) {
	let cams = prp.cams || [];
	let cont = L.DomUtil.create('div', 'contVideo');
	let list = L.DomUtil.create('div', 'list', cont);
	let videoCont = L.DomUtil.create('div', 'videoCont', cont);
	let setVideo = (ind, flag) => {
		if (flag) {
			videoCont.innerHTML = '';
		}
		curCam = ind;
		let curCamPrp = cams.length > curCam ? cams[curCam] : {};
		let videoDiv = L.DomUtil.create('span', 'videoDiv' + (flag ? '' : ' small'), videoCont);
		let video = L.DomUtil.create('video', 'video', videoDiv);
		// video.setAttribute('controls', true);
			// <video id="videoPlayer" controls></video>
		// var url = 'https://dtp.mvs.group/static/proxy.php?url=http:' + curCamPrp.video;
		var url = curCamPrp.video; // "//172.16.74.29/aps017_c1/index.mpd";
		var player = dashjs.MediaPlayer().create();
		player.initialize(video, url, true);
	};
	let prev;
	cams.forEach((it, ind) => {
		let button = L.DomUtil.create('button', '', list);
		if (!ind) {
			button.classList.add('active');
			prev = button;
		}
		button.textContent = it.name || 'Камера';
		L.DomEvent.on(button, 'click', () => {
			setVideo(ind, true);
			prev.classList.remove('active');
			button.classList.add('active');
			prev = button;
		});
		
		setVideo(ind, false);
		
	});
	if (cams.length > curCam) {
		// setVideo(0);
	} else {
		cont.innerHTML = 'Камеры отсутствуют!';
	}
	popup.setContent(cont);
}

// let renderer = L.canvas();
export const Itc = L.featureGroup([]);
Itc._needHeat = {radius: 19, blur: 11.26, minOpacity: 0.34};
Itc.checkZoom = z => {
	if (Object.keys(Itc._layers).length) {
		if (z < 12) {
			Itc.setFilter(argFilters);
		}
	} else if (z > 11) {
		Itc.setFilter(argFilters);
	}
};
Itc.setFilter = arg => {
// console.log('DtpVerifyed.setFilter ', arg, DtpVerifyed._group);
	if (!Itc._map) { return; }
	Itc.clearLayers();
	argFilters = arg || [];
	Itc._argFilters = argFilters;

	let arr = [], heat = [];
	if (Itc._group) {
		Itc._group.getLayers().forEach(it => {
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
		// if (false &&  Itc._needHeat) {
			// Itc._map.addLayer(Itc._heat);
			// Itc._heat.setLatLngs(heat);
			// Itc._heat.setOptions(Itc._needHeat);
			// if (Itc._map._zoom > 11) {
				// Itc.addLayer(L.layerGroup(arr));
			// }
		// } else {
			Itc.addLayer(L.layerGroup(arr));
			// Itc._map.removeLayer(Itc._heat);
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
Itc.on('remove', (ev) => {
	// Itc._needHeat = null;
	// Itc._map.removeLayer(Itc._heat);
	Itc.clearLayers();
}).on('add', ev => {
	// console.log('/static/data/dtpskpdi.geojson', ev);
	fetch('./static/itc.geojson', {})
		.then(req => req.json())
		.then(json => {
console.log('json', json);
// return;
			let arr = json.map(prp => {
				let iconType = prp.iconType || 0,
					stroke = false,
					fillColor = '#2F4F4F'; //   17-20

if (!prp.lat || !prp.lon) {
console.log('_______', prp);
	prp.lat = prp.lon = 0;
}
				let latLng = L.latLng(prp.lat, prp.lon, stroke ? 1 : 0.5);

				return new CirclePoint(latLng, {
					props: prp,
					radius: 6,
					// box: true,
					stroke: stroke,
					fillColor: fillColor,
					// renderer: renderer
				}).bindPopup(popup).on('popupopen', (ev) => {
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
			Itc._group = L.layerGroup(arr);

			if (argFilters) {
				Itc.setFilter(argFilters);
			} else if (true || Itc._map._zoom > 11) {
				Itc.addLayer(Itc._group);
			}
			// Itc._refreshFilters();
		});
});

