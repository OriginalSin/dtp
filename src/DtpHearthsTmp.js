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
			// popup: popup,
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
			prp: props
		}
	});
	popup1.setContent(cont);
	return cont;
}

// let renderer = L.canvas();
export const DtpHearthsTmp = L.featureGroup([]);
DtpHearthsTmp.setFilter = arg => {
// console.log('DtpHearths.setFilter ', arg, DtpHearths._group);
	DtpHearthsTmp.clearLayers();
	// DtpHearths._heatData = [];
	argFilters = arg;

	let arr = [];
	if (DtpHearthsTmp._group && DtpHearthsTmp._map) {
		DtpHearthsTmp._group.getLayers().forEach(it => {
			let prp = it.options.cluster,
				list_dtp = prp.list_dtp || [],
				cnt = 0;
			argFilters.forEach(ft => {
				if (ft.type === 'quarter') {
					if (ft.zn[prp.year] && ft.zn[prp.year][prp.quarter]) {
						cnt++;
					}
				} else if (ft.type === 'id_dtp') {
					if (list_dtp.filter(pt => pt.id == ft.zn || pt.id_skpdi == ft.zn || pt.id_stat == ft.zn).length) {
						cnt++;
					}
				} else if (ft.type === 'year') {
					if (ft.zn[prp.year]) {
						cnt++;
					}
				} else if (ft.type === 'str_icon_type') {
					if (ft.zn.filter(pt => pt === prp.str_icon_type).length) {
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
		DtpHearthsTmp.addLayer(L.layerGroup(arr));
		// DtpHearths._heat.setData({
			// max: 8,
			// data: DtpHearths._heatData
		// });
	}
};

DtpHearthsTmp.on('remove', () => {
	DtpHearthsTmp.clearLayers();
}).on('add', ev => {
	argFilters = [];
	let opt = {str_icon_type: {}, iconType: {}, years: {}, dtps: {}, stricken: {0:0}},
		arr = [],
		max_quarter = 0,
		prefix = 'https://dtp.mvs.group/scripts/hearthstmp_dev/';

	Promise.all([2019, 2020].map(key => fetch(prefix + key + '.txt', {}).then(req => req.json())))
		.then(allJson => {
			allJson.forEach(json => {
				opt.stricken[0] += json.length;
				json.forEach(it => {
					let iconType = it.icon_type || 1,
						list_bounds = L.latLngBounds(),
						list_dtp = it.list_dtp,
						stroke = false,
						fillColor = '#FF0000'; //   19-20

					chkStricken(it, opt);
					if (list_dtp.length) {

						let cy = Number(it.year),
							cq = Number(it.quarter),
							cm = cy + (cq - 1) / 4,
							year = opt.years[it.year];
						if (cm > max_quarter) {
							max_quarter = cm;
						}
						if (!year) {
							year = opt.years[it.year] = {};
						}
						opt.years[it.year] = year;
						let quarter = year[it.quarter];
						if (it.quarter in year) {
							quarter++;
						} else {
							quarter = year[it.quarter] = 1;
						}
						year[it.quarter] = quarter;
						
						let cTypeCount = opt.str_icon_type[it.str_icon_type];
						if (!cTypeCount) {
							cTypeCount = 1;
						} else {
							cTypeCount++;
						}
						opt.str_icon_type[it.str_icon_type] = cTypeCount;
						opt.iconType[it.str_icon_type] = iconType;

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
						let arr1 = list_dtp.map(prp => {
							let iconType = prp.iconType || 0,
								coords = prp.coords || {lat: 0, lon: 0},
								latlng = L.latLng(coords.lat, coords.lon),
								cur = [];

							list_bounds.extend(latlng);

							if (prp.id_skpdi) { cur.push({type: 'skpdi', id: prp.id_skpdi}); }
							if (prp.id_stat) { cur.push({type: 'gibdd', id: prp.id_stat}); }
							prp._cur = cur;

							let dtps = opt.dtps[prp.id];
							if (!dtps) {
								dtps = {};
								dtps[it.id] = 1;
							} else if (!dtps[it.id]) {
								dtps[it.id] = 1;
							} else {
								dtps[it.id]++;
							}
							opt.dtps[prp.id] = dtps;
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
						it._bounds = L.rectangle(list_bounds, {items: arr1, cluster: it, fill: true, color: fillColor, dashArray: '8 3 1'})
							.on('mouseover', (ev) => {
								let target = ev.target;
								target._color = target.options.color;
								target.options.color = 'red';
								target._renderer._updateStyle(target);
							})
							.on('mouseout', (ev) => {
								let target = ev.target;
								target.options.color = target._color;
								target._renderer._updateStyle(target);
							})
							.on('click', (ev) => {
								L.DomEvent.stopPropagation(ev);
								let dist = 1000,
									target = ev.target,
									latlng = ev.latlng,
									ctrlKey = ev.originalEvent.ctrlKey,
									dtp;
								if (ctrlKey) { target.bringToBack(); }
								// target.options.items.forEach(pt => {
									// let cd = pt._latlng.distanceTo(latlng);
									// if (cd < dist) {
										// dist = cd;
										// dtp = pt;
									// }
								// });
								// if (dist < 10) {
									// setPopup(dtp.options.props);
									// popup.setLatLng(dtp._latlng).openOn(DtpHearthsTmp._map);
								// } else {
									setPopup1(it);
									popup1.setLatLng(latlng).openOn(DtpHearthsTmp._map);
								// }
								
								// console.log('popu666popen', dist, dtp);
							});
						arr.push(it._bounds);
						arr = arr.concat(arr1);
					}
				});
				
				// let y = Math.floor(max_quarter),
					// q = 1 + 4 * (max_quarter - y);
				// argFilters = [{type: 'quarter', year: y, zn: q}];
// console.log('opt', opt);
				DtpHearthsTmp._opt = opt;
				DtpHearthsTmp._group = L.layerGroup(arr);
				if (argFilters) {
					DtpHearthsTmp.setFilter(argFilters);
				} else {
					DtpHearthsTmp.addLayer(DtpHearthsTmp._group);
				}
				DtpHearthsTmp._refreshFilters();
			});
// console.log('__allJson_____', allJson, DtpHearthsTmp._opt);
		});
});

