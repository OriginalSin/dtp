import {Bbox, CirclePoint} from './CirclePoint';
import DtpPopup from './DtpPopupVerifyed.svelte';
import DtpPopupHearths from './DtpPopupHearths.svelte';
import {chkStricken} from './MapUtils';

const L = window.L;

const popup = L.popup();
const popup1 = L.popup({minWidth: 200});
let argFilters;
let collision_type;

const setPopup = function (props) {
	let cont = L.DomUtil.create('div');
	new DtpPopup({
		target: cont,
		props: {
			prp: props
		}
	});
	popup.setContent(cont);
	return cont;
}

const setPopup1 = function (props) {
	let cont = L.DomUtil.create('div');
	new DtpPopupHearths({
		target: cont,
		props: {
			predochag: 1,
			prp: props
		}
	});
	popup1.setContent(cont);
	return cont;
}

// let renderer = L.canvas();
export const DtpHearthsPicket4 = L.featureGroup([]);
DtpHearthsPicket4.setFilter = arg => {
	if (!DtpHearthsPicket4._map) { return; }
// console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
	DtpHearthsPicket4.clearLayers();
	// DtpHearths._heatData = [];
	argFilters = arg;

	let arr = [];
	if (DtpHearthsPicket4._group) {
		DtpHearthsPicket4._group.getLayers().forEach(it => {
			let prp = it.options.cluster,
				cnt = 0;
			argFilters.forEach(ft => {
				if (ft.type === 'ht') {
					if (ft.zn[prp.ht]) {
						cnt++;
					}
				} else if (ft.type === 'roads') {
					if (ft.zn.filter(pt => pt === prp.road).length || (ft.zn.length === 1 && ft.zn[0] === '')) {
						cnt++;
					}
				} else if (ft.type === 'id_dtp') {
					if (prp.list_dtp.filter(pt => pt.id_skpdi == ft.zn || pt.id_stat == ft.zn).length || !ft.zn.length) {
						cnt++;
					}
				} else if (ft.type === 'id_hearth') {
					if (ft.zn == prp.id) {
						cnt++;
					}
				} else if (ft.type === 'year') {
					if (ft.zn[prp.year]) {
						cnt++;
					}
				} else if (ft.type === 'stricken') {
					let zn = ft.zn;
					if (!zn) {
						cnt++;
					} else if (zn === 1 && !prp.count_stricken && prp.count_lost) {
						cnt++;								// Только с погибшими
					} else if (zn === 2 && prp.count_stricken && !prp.count_lost) {
						cnt++;								// Только с пострадавшими
					} else if (zn === 3 && (prp.count_stricken || prp.count_lost)) {
						cnt++;								// С пострадавшими или погибшими
					} else if (zn === 4 && prp.count_stricken && prp.count_lost) {
						cnt++;								// С пострадавшими и погибшими
					}
				}
			});
			if (cnt === argFilters.length) {
				arr.push(it);
				// arr = arr.concat(it.options.items);
				// DtpHearths._heatData.push({lat: prp.lat, lng: prp.lon, count: prp.iconType});
			}
		});
		DtpHearthsPicket4.addLayer(L.layerGroup(arr));
		// DtpHearths._heat.setData({
			// max: 8,
			// data: DtpHearths._heatData
		// });
	}
};

DtpHearthsPicket4.on('remove', () => {
	DtpHearthsPicket4.clearLayers();
}).on('add', ev => {
	let opt = {road: {}, str_icon_type: {}, lost: 0, stricken: {0:0}, iconType: {}, years: {}, dtps: {}},
		arr = [],
		max_quarter = 0,
		prefix = 'https://dtp.mvs.group/scripts/prehearths4_dev/',
		parseItem = (it, ind) => {
			let iconType = it.icon_type || 1,
				list_bounds = L.latLngBounds(),
				latlngs = [],
				list_dtp = it.list_dtp,
				stroke = false,
				fillColor = '#FF0000'; //   19-20

			chkStricken(it, opt);
			it.ht = ind < 2 ? 'hearth3' : 'hearth5';
			if (list_dtp.length) {
				opt.years[it.year] = true;

				let cTypeCount = opt.str_icon_type[it.str_icon_type];
				if (!cTypeCount) {
					cTypeCount = 1;
				} else {
					cTypeCount++;
				}
				opt.str_icon_type[it.str_icon_type] = cTypeCount;
				opt.iconType[it.str_icon_type] = iconType;

				if (it.road in opt.road) {
					opt.road[it.road]++;
				} else {
					opt.road[it.road] = 1;
				}

				if (iconType) {
					stroke = iconType % 2 === 0 ? true : false; //  - смертельные ДТП
					if (iconType === 1 || iconType === 2) {
						fillColor = '#FFA500';
					} else if (iconType === 3 || iconType === 4) {
						fillColor = '#B8860B';
					} else if (iconType === 5 || iconType === 6) {
						fillColor = '#CD853F';
					} else if (iconType === 7 || iconType === 8) {
						fillColor = '#228B22';
					} else if (iconType === 9 || iconType === 10) {
						fillColor = '#FF8C00';
					} else if (iconType === 11 || iconType === 12) {
						fillColor = '#D2691E';
					} else if (iconType === 13 || iconType === 14) {
						fillColor = '#DEB887';
					} else if (iconType === 15 || iconType === 16) {
						fillColor = '#7B68EE';
					} else if (iconType === 17 || iconType === 18) {
						fillColor = '#2F4F4F';
					}
				}
				let head;
				let arr1 = list_dtp.map(prp => {
					let iconType = prp.iconType || 0,
						coords = prp.coords || {lat: 0, lon: 0},
						latlng = L.latLng(coords.lat, coords.lon),
						cur = [];

					list_bounds.extend(latlng);
					latlngs.push(latlng);

					// if (prp.id === it.head) { head = prp; }

					if (prp.id_skpdi) { cur.push({type: 'skpdi', id: prp.id_skpdi}); }
					if (prp.id_stat) { cur.push({type: 'gibdd', id: prp.id_stat}); }
					prp._cur = cur;

					let idDtp = prp.id || prp.id_stat || prp.id_skpdi;
					let dtps = opt.dtps[idDtp] || {};
					let idHearth = it.id || it.id_hearth;
					if (!dtps) {
						dtps = {};
						dtps[idHearth] = 1;
					} else if (!dtps[idHearth]) {
						dtps[idHearth] = 1;
					} else {
						dtps[idHearth]++;
					}
					opt.dtps[idDtp] = dtps;
					// if (prp.stricken) { opt.stricken++; }
					stroke = false;
					if (prp.lost) {
						opt.lost++;
						stroke = true;
					}
					
					return new CirclePoint(L.latLng(coords.lat, coords.lon), {
							cluster: it,
							props: prp,
							radius: 6,
							zIndexOffset: 50000,
							rhomb: true,
							stroke: stroke,
							fillColor: fillColor,
							// renderer: renderer
						// }).bindPopup(popup)
						// .on('popupopen', (ev) => {

							// setPopup(ev.target.options.props);
						// }).on('popupclose', (ev) => {
							// if (ev.popup._svObj) {
								// ev.popup._svObj.$destroy();
								// delete ev.popup._svObj;
							// }
						});
				});
				if (head) {
					it._bounds = L.circle(L.latLng(head.coords.lat, head.coords.lon), {radius: it.radius || 500, items: arr1, cluster: it, color: fillColor, });
				} else if (latlngs.length) {
					it._bounds = L.polyline(latlngs, {items: arr1, cluster: it, color: fillColor, weight: 4});
				} else {
					it._bounds = L.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'})
				}

				it._bounds
					.on('mouseover', (ev) => {
						let target = ev.target;
						target._weight = target.options.weight;
						target._color = target.options.color;
						target.options.weight = 8;
						target.options.color = 'red';
						target._renderer._updateStyle(target);
					})
					.on('mouseout', (ev) => {
						let target = ev.target;
						target.options.weight = target._weight;
						target.options.color = target._color;
						target._renderer._updateStyle(target);
					})
					.on('click', (ev) => {
						L.DomEvent.stopPropagation(ev);
						let dist = 1000,
							target = ev.target,
							latlng = ev.latlng,
							layerPoint = ev.layerPoint,
							ctrlKey = ev.originalEvent.ctrlKey,
							dtp;
						if (ctrlKey) { target.bringToBack(); }
						// target.options.items.forEach(pt => {
							// let cd = pt._point.distanceTo(layerPoint);
							// if (cd < dist) {
								// dist = cd;
								// dtp = pt;
							// }
						// });
						// if (dist < 10) {
							// setPopup(dtp.options.props);
							// popup.setLatLng(dtp._latlng).openOn(DtpHearthsPicket4._map);
						// } else {
							setPopup1(it);
							popup1.setLatLng(latlng).openOn(DtpHearthsPicket4._map);
						// }
						
						// console.log('popu666popen', dist, dtp);
					});
				arr.push(it._bounds);
				arr = arr.concat(arr1);
			}
		};

	Promise.all([
		'https://dtp.mvs.group/scripts/prehearths2_dev/2019.txt',
		'https://dtp.mvs.group/scripts/prehearths2_dev/2020.txt',
		'https://dtp.mvs.group/scripts/prehearths4_dev/2019.txt',
		'https://dtp.mvs.group/scripts/prehearths4_dev/2020.txt'
	].map(key => fetch(key, {}).then(req => req.json())))
	// Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
		.then(allJson => {
			allJson.forEach((json, ind) => {
				opt.stricken[0] += json.length;
				json.forEach(pt => {
					// (pt.hearth3 || []).forEach(it => {
						// parseItem(it, 'hearth3');
					// });
					// (pt.hearth5 || []).forEach(it => {
						parseItem(pt, ind);
					// });
				});
				
				// let y = Math.floor(max_quarter),
					// q = 1 + 4 * (max_quarter - y);
				// argFilters = [{type: 'quarter', year: y, zn: q}];
// console.log('opt', opt);
				DtpHearthsPicket4._opt = opt;
				DtpHearthsPicket4._group = L.layerGroup(arr);
				if (argFilters) {
					DtpHearthsPicket4.setFilter(argFilters);
				} else {
					DtpHearthsPicket4.addLayer(DtpHearthsPicket4._group);
				}
				DtpHearthsPicket4._refreshFilters();
			});
console.log('__allJson_____', allJson, DtpHearthsPicket4._opt);
		});
});

