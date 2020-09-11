<script>
	import { onMount } from 'svelte';
	export let DtpHearthsPicket4;
	export let DtpHearthsSettlements;
	export let DtpHearthsPicket;
	export let DtpHearths5;
	export let DtpHearths3;
	export let DtpHearthsStat;
	export let DtpHearthsTmp;
	export let DtpHearths;
	export let DtpVerifyed;
	export let DtpSkpdi;
	export let DtpGibdd;
	export let DtpGibddRub;
	export let DtpGibddSpt;
	export let DtpGibddLo;
	export let Rub;
	export let Measures;
	export let control;

	if (!Measures) { Measures = {}; };
	if (!Rub) { Rub = {}; };
	if (!DtpGibddRub) { DtpGibddRub = {}; };
	if (!DtpHearthsPicket4) { DtpHearthsPicket4 = {}; };
	if (!DtpHearthsPicket) { DtpHearthsPicket = {}; };
	if (!DtpHearthsSettlements) { DtpHearthsSettlements = {}; };
	if (!DtpHearths5) { DtpHearths5 = {}; };
	if (!DtpHearths3) { DtpHearths3 = {}; };

	let currentFilter = 0;
	let currentFilterDtpHearths = 0;
	let begDate;
	let endDate;
	// let years = DtpHearths._opt && DtpHearths._opt.years;

	const td = new Date();
	const tdd = new Date(new Date(td.getFullYear(), td.getMonth(), td.getDate()).getTime());
	// const ed = new Date(tdd.getTime() + 24*60*60*1000);
	const ed = td;
	// const bd = new Date(tdd.getTime() - 30*24*60*60*1000);
	const bd = new Date(2019, 0, 1);

	let id_dtp = control._id_dtp || null;
	let dateInterval = control._dateInterval || [bd.getTime()/1000, ed.getTime()/1000];
	let optData = DtpVerifyed._opt || {};
	let optCollisionKeys = optData.collision_type ? Object.keys(optData.collision_type).sort((a, b) => optData.collision_type[b] - optData.collision_type[a]) : [];
 // console.log('optData', optData)

	let optDataSkpdi = DtpSkpdi._opt || {};
	let optCollisionSkpdiKeys = optDataSkpdi.collision_type ? Object.keys(optDataSkpdi.collision_type).sort((a, b) => optDataSkpdi.collision_type[b] - optDataSkpdi.collision_type[a]) : [];

	let optDataGibdd = DtpGibdd._opt || {};
	let optCollisionGibddKeys = optDataGibdd.collision_type ? Object.keys(optDataGibdd.collision_type).sort((a, b) => optDataGibdd.collision_type[b] - optDataGibdd.collision_type[a]) : [];
	let optDataGibddSpt = DtpGibddSpt._opt || {};
	let optCollisionGibddSptKeys = optDataGibddSpt.collision_type ? Object.keys(optDataGibddSpt.collision_type).sort((a, b) => optDataGibddSpt.collision_type[b] - optDataGibddSpt.collision_type[a]) : [];
	let optDataGibddLo = DtpGibddLo._opt || {};
	let optCollisionGibddLoKeys = optDataGibddLo.collision_type ? Object.keys(optDataGibddLo.collision_type).sort((a, b) => optDataGibddLo.collision_type[b] - optDataGibddLo.collision_type[a]) : [];
	let dps = {'Dps1': true, 'Dps0': true};
	let evnt = {'ev1': true, 'ev0': true};

	let optDataGibddRub = (DtpGibddRub || {})._opt || {};
	let optCollisionGibddRubKeys = optDataGibddRub.collision_type ? Object.keys(optDataGibddRub.collision_type).sort((a, b) => optDataGibddRub.collision_type[b] - optDataGibddRub.collision_type[a]) : [];

	let optDataHearths = (DtpHearths || {})._opt || {};
	let optTypeHearthsKeys = optDataHearths.str_icon_type ? Object.keys(optDataHearths.str_icon_type).sort((a, b) => optDataHearths.str_icon_type[b] - optDataHearths.str_icon_type[a]) : [];

	let optDataHearthsTmp = (DtpHearthsTmp || {})._opt || {};
	let optTypeHearthsTmpKeys = optDataHearthsTmp.str_icon_type ? Object.keys(optDataHearthsTmp.str_icon_type).sort((a, b) => optDataHearthsTmp.str_icon_type[b] - optDataHearthsTmp.str_icon_type[a]) : [];

	let optDataHearthsStat = (DtpHearthsStat || {})._opt || {};
	let optTypeHearthsStatKeys = optDataHearthsStat.str_icon_type ? Object.keys(optDataHearthsStat.str_icon_type).sort((a, b) => optDataHearthsStat.str_icon_type[b] - optDataHearthsStat.str_icon_type[a]) : [];

	let optDataHearths3 = (DtpHearths3 || {})._opt || {};
	let optTypeHearths3Keys = optDataHearths3.str_icon_type ? Object.keys(optDataHearths3.str_icon_type).sort((a, b) => optDataHearths3.str_icon_type[b] - optDataHearths3.str_icon_type[a]) : [];

	let optDataHearths5 = (DtpHearths5 || {})._opt || {};
	let optTypeHearths5Keys = optDataHearths5.str_icon_type ? Object.keys(optDataHearths5.str_icon_type).sort((a, b) => optDataHearths5.str_icon_type[b] - optDataHearths5.str_icon_type[a]) : [];

	let optDataHearthsSettlements = (DtpHearthsSettlements || {})._opt || {};
	let optRoadTypes5 = optDataHearthsSettlements.road ? Object.keys(optDataHearthsSettlements.road).sort((a, b) => optDataHearthsSettlements.road[b] - optDataHearthsSettlements.road[a]) : [];

	let optDataHearthsPicket = (DtpHearthsPicket || {})._opt || {};
	let optRoadTypes = optDataHearthsPicket.road ? Object.keys(optDataHearthsPicket.road).sort((a, b) => optDataHearthsPicket.road[b] - optDataHearthsPicket.road[a]) : [];

	let optDataHearthsPicket4 = (DtpHearthsPicket4 || {})._opt || {};
	let optRoadTypes4 = optDataHearthsPicket4.road ? Object.keys(optDataHearthsPicket4.road).sort((a, b) => optDataHearthsPicket4.road[b] - optDataHearthsPicket4.road[a]) : [];

	let optMeasures = Measures._opt || {};
	let optMeasuresKeys = optMeasures.type ? Object.keys(optMeasures.type).sort((a, b) => optMeasures.type[b] - optMeasures.type[a]) : [];

	let roads = [''];
	let ht = {'hearth3': true, 'hearth5': true};
	let id_hearth = null;

	let collision_type = [''];
	let collision_type_skpdi = [''];
	let collision_type_gibdd = [''];
	let collision_type_gibddRub = [''];
	let beg;
	let end;

	let heat = {radius: 19, blur: 11.26, minOpacity: 0.34};
	let heatName;
	let radius = heat.radius; // 25;
	let blur = 11.26; // 15;
	let minOpacity = 0.34; // 0.05;
	let heatElement;
	let heatElementDtpGibddLo;
	let heatElementDtpGibddSpt;
	let heatElementDtpGibdd;
	let heatElementDtpSkpdi;
	let heatElementDtpVerifyed;

	let _comps = Rub && Rub._argFilters ? Rub._argFilters[0] : {type: 'comp', zn: {on: true, off: true}};
	let compOn = _comps.zn.on;
	let comp1On = _comps.zn.off;


	let measures_type = [];
    const setFilterMeasures = () => {
		if (Measures._map) {
			let opt = [];
			if (measures_type.length) {
				opt.push({type: 'measures_type', zn: measures_type});
			}
			// if (id_dtp) {
				// opt.push({type: 'id_dtp', zn: id_dtp});
			// }
			if (dateInterval) {
				opt.push({type: 'date', zn: dateInterval});
			}
			Measures.setFilter(opt);
		}
	};

	// const setListRub = (ev) => {
		// let opt = [{type: 'comp', zn: {on: compOn, off: comp1On}}];
		// Rub.setFilter(opt);
	// };
	const setComp = (ev) => {
		let opt = [{type: 'comp', zn: {on: compOn, off: comp1On}}];
		Rub.setFilter(opt);
	};

	let hearths_year_Settlements = {};
	Object.keys(optDataHearthsSettlements.years || {}).sort().forEach(key => {
		hearths_year_Settlements[key] = true;
	});
	let city = {0: true, 1: true, 2: true};
    const setFilterHearthsSettlements = (ev) => {
		if (DtpHearthsSettlements._map) {
			if (ev) {
				let target = ev.target || {},
					checked = target.checked,
					id = target.id,
					name = target.name;
				if (id !== 'stricken') {
					hearths_year_Settlements[name] = checked;
				}
			}
			let opt = [
				{type: 'year', zn: hearths_year_Settlements}
			];
			if (city) {
				opt.push({type: 'city', zn: city});
			}
			if (id_dtp) {
				opt.push({type: 'id_dtp', zn: id_dtp});
			}
			if (id_hearth) {
				opt.push({type: 'id_hearth', zn: id_hearth});
			}
			if (roads) {
				opt.push({type: 'roads', zn: roads});
			}
			opt.push({type: 'ht', zn: ht});
			// console.log('opt', opt);
			DtpHearthsSettlements.setFilter(opt);
		}
	};

	let hearths_year_Picket = {};
	Object.keys(optDataHearthsPicket.years || {}).sort().forEach(key => {
		hearths_year_Picket[key] = true;
	});
    const setFilterHearthsPicket = (ev) => {
		if (DtpHearthsPicket._map) {
			if (ev) {
				let target = ev.target || {},
					checked = target.checked,
					id = target.id,
					name = target.name;
				if (id !== 'stricken') {
					hearths_year_Picket[name] = checked;
				}
			}
			let opt = [
				{type: 'year', zn: hearths_year_Picket}
			];
			if (id_dtp) {
				opt.push({type: 'id_dtp', zn: id_dtp});
			}
			if (id_hearth) {
				opt.push({type: 'id_hearth', zn: id_hearth});
			}
			if (roads) {
				opt.push({type: 'roads', zn: roads});
			}
			opt.push({type: 'ht', zn: ht});
			// console.log('opt', opt);
			DtpHearthsPicket.setFilter(opt);
		}
	};

	let hearths_stricken4;
	let hearths_year_Picket4 = {};
	Object.keys(optDataHearthsPicket4.years || {}).sort().forEach(key => {
		hearths_year_Picket4[key] = true;
	});
    const setFilterHearthsPicket4 = (ev) => {
		if (DtpHearthsPicket4._map) {
			if (ev) {
				let target = ev.target || {},
					checked = target.checked,
					id = target.id,
					name = target.name;
				if (id !== 'stricken') {
					// hearths_stricken4 = 
				// } else {
					hearths_year_Picket4[name] = checked;
				}
			}
			let opt = [];
			if (id_dtp) {
				opt.push({type: 'id_dtp', zn: id_dtp});
			}
			if (hearths_stricken4) {
				opt.push({type: 'stricken', zn: Number(hearths_stricken4)});
			}
			if (hearths_period_type_Stat === 1) {
				opt.push({type: 'year', zn: hearths_year_Picket4});
			}
			if (id_hearth) {
				opt.push({type: 'id_hearth', zn: id_hearth});
			}
			if (roads) {
				opt.push({type: 'roads', zn: roads});
			}
			opt.push({type: 'ht', zn: ht});
			// console.log('opt', opt);
			DtpHearthsPicket4.setFilter(opt);
		}
	};

	const refresh = () => {
		setFilterHearthsPicket4();
		setFilterHearthsSettlements();
		setFilterHearthsPicket();
		setFilterHearths5({});
		setFilterHearths3({});
		setFilterHearths({});
		setFilterHearthsTmp({});
		setFilterHearthsStat({});
		setFilterSkpdi();
		setFilterGibdd();
		setFilterGibddSpt();
		setFilterGibddRub();
		setFilterMeasures();
		setFilter();
	};

	const oncheckIdCity = (ev) => {
		let target = ev.target,
			name = target.name;
		city[name] = target.checked;
		control.city = city;
		refresh();
	};
	const oncheckIdDtp = (ev) => {
		let target = ev.target,
			value = target.value;
		id_dtp = value ? value : null;
		control._id_dtp = id_dtp;
		refresh();
	};

	const oncheckIdHearth = (ev) => {
		let target = ev.target,
			value = target.value;
		id_hearth = value ? value : null;
		setFilterHearthsSettlements();
		setFilterHearthsPicket();
		setFilterHearthsPicket4();
	};
	const oncheckHt = (ev) => {
		let target = ev.target;
		ht[target.name] = target.checked;
		setFilterHearthsSettlements();
		setFilterHearthsPicket();
		setFilterHearthsPicket4();
	};
	const oncheckDps = (ev) => {
		let target = ev.target;
		dps[target.name] = target.checked;
		setFilterGibdd();
		// setFilterGibddSpt();
	};
	const oncheckEvents = (ev) => {
		let target = ev.target;
		evnt[target.name] = target.checked;
		setFilterGibdd();
		setFilterSkpdi();
		// setFilterGibddSpt();
		setFilter();
	};

	const setHeat = (ev) => {
		let target = ev.target;

		DtpGibddRub._needHeat = DtpGibddLo._needHeat = DtpGibddSpt._needHeat = DtpGibdd._needHeat = DtpSkpdi._needHeat = DtpVerifyed._needHeat = target.checked ? heat : false;
		setFilterGibddRub();
		setFilterGibdd();
		// DtpSkpdi._needHeat = _needHeat;
		setFilterSkpdi();
		// DtpVerifyed._needHeat = _needHeat;
		setFilterGibddSpt();
		setFilter();
	};
	const setMinOpacity = () => {
		let opt = {radius: radius, blur: blur, minOpacity: minOpacity};
		if (DtpGibddLo._heat) {
			DtpGibddLo._heat.setOptions(opt);
		}
		if (DtpGibddSpt._heat) {
			DtpGibddSpt._heat.setOptions(opt);
		}
		if (DtpGibdd._heat) {
			DtpGibdd._heat.setOptions(opt);
		}
		if (DtpSkpdi._heat) {
			DtpSkpdi._heat.setOptions(opt);
		}
		if (DtpVerifyed._heat) {
			DtpVerifyed._heat.setOptions(opt);
		}
	};

	const setFilter = () => {
		if (DtpVerifyed._map) {
			let opt = [
				{type: 'evnt', zn: evnt},
				{type: 'itemType', zn: currentFilter}
			];
			if (id_dtp) {
				opt.push({type: 'id_dtp', zn: id_dtp});
			}
			if (dateInterval) {
				control._dateInterval = dateInterval;
				opt.push({type: 'date', zn: dateInterval});
			}
			if (collision_type) {
				opt.push({type: 'collision_type', zn: collision_type});
			}
			// console.log('opt', collision_type, opt);
			DtpVerifyed.setFilter(opt);
		}
	};

	let _list_rub = DtpGibddRub._argFilters && DtpGibddRub._argFilters.length ? DtpGibddRub._argFilters[0] : {type: 'list_rub', zn: {on: true, off: true}};
	let list_rubOn = _list_rub.zn.on;
	let list_rubOff = _list_rub.zn.off;

    const setFilterGibddRub = () => {
		if (DtpGibddRub._map) {
			let opt = [
				{type: 'list_rub', zn: {on: list_rubOn, off: list_rubOff}}
			];
			if (id_dtp) {
				opt.push({type: 'id_dtp', zn: id_dtp});
			}
			if (dateInterval) {
				opt.push({type: 'date', zn: dateInterval});
			}
			if (collision_type_gibddRub) {
				opt.push({type: 'collision_type', zn: collision_type_gibddRub});
			}
			// console.log('opt', collision_type, opt);
			DtpGibddRub.setFilter(opt);
		}
	};

    const setFilterGibdd = () => {
		if (DtpGibdd._map) {
		let opt = [
			{type: 'dps', zn: dps},
			{type: 'evnt', zn: evnt}
		];
		if (id_dtp) {
			opt.push({type: 'id_dtp', zn: id_dtp});
		}
		if (dateInterval) {
			opt.push({type: 'date', zn: dateInterval});
		}
		if (collision_type_gibdd) {
			opt.push({type: 'collision_type', zn: collision_type_gibdd});
		}
		// console.log('opt', collision_type, opt);
		DtpGibdd.setFilter(opt);
		}
	};

    const setFilterGibddLo = () => {
		if (DtpGibddLo._map) {
		let opt = [
			// {type: 'dps', zn: dps},
			// {type: 'evnt', zn: evnt}
		];
		if (id_dtp) {
			opt.push({type: 'id_dtp', zn: id_dtp});
		}
		if (dateInterval) {
			opt.push({type: 'date', zn: dateInterval});
		}
		if (collision_type_gibdd) {
			opt.push({type: 'collision_type', zn: collision_type_gibdd});
		}
		// console.log('opt', collision_type, opt);
		DtpGibddLo.setFilter(opt);
		}
	};

    const setFilterGibddSpt = () => {
		if (DtpGibddSpt._map) {
		let opt = [
			// {type: 'dps', zn: dps},
			// {type: 'evnt', zn: evnt}
		];
		if (id_dtp) {
			opt.push({type: 'id_dtp', zn: id_dtp});
		}
		if (dateInterval) {
			opt.push({type: 'date', zn: dateInterval});
		}
		if (collision_type_gibdd) {
			opt.push({type: 'collision_type', zn: collision_type_gibdd});
		}
		// console.log('opt', collision_type, opt);
		DtpGibddSpt.setFilter(opt);
		}
	};

    const setFilterSkpdi = () => {
		if (DtpSkpdi._map) {
		let opt = [
			{type: 'evnt', zn: evnt}
		];
		if (id_dtp) {
			opt.push({type: 'id_dtp', zn: id_dtp});
		}
		if (dateInterval) {
			opt.push({type: 'date', zn: dateInterval});
		}
		if (collision_type_skpdi) {
			opt.push({type: 'collision_type', zn: collision_type_skpdi});
		}
		// console.log('opt', collision_type, opt);
		DtpSkpdi.setFilter(opt);
		}
	};

	// date filter
    const oncheck = (ev) => {
		let target = ev.target;
		currentFilter = Number(target.value);
		// console.log('oncheck', currentFilter, DtpVerifyed._opt);
		setFilter();
		// DtpVerifyed.setFilter({type: 'itemType', zn: currentFilter});
	};
	// beforeUpdate(() => {
		// console.log('the component is about to update', DtpHearths._opt);
	// });
	onMount(() => {
		// years = DtpHearths._opt && DtpHearths._opt.years;
		let i18n = {
			previousMonth : 'Предыдущий месяц',
			nextMonth     : 'Следующий месяц',
			months        : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
			weekdays      : ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
			weekdaysShort : ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
		};
		let opt = {
			onSelect: function(date) {
				// console.log('ssssss', date)
				this._o.field.value = this.toString();
				// dateInterval[this._o._dint] = this.getDate().getTime()/1000;
				dateInterval[this._o._dint] = this.getDate().getTime()/1000 + this._o._dint * 24*60*60;
				setFilter();
				setFilterSkpdi();
				setFilterGibdd();
				setFilterGibddLo();
				setFilterGibddSpt();
				setFilterMeasures();
				setFilterGibddRub();
			},
			toString(date, format) {
				// you should do formatting based on the passed format,
				// but we will just return 'D/M/YYYY' for simplicity
				let day = date.getDate();
				if (day < 10) { day = '0' + day; }
				let month = date.getMonth() + 1;
				if (month < 10) { month = '0' + month; }
				const year = date.getFullYear();
				return `${day}.${month}.${year}`;
			},
			parse(dateString, format) {
				// dateString is the result of `toString` method
				const parts = dateString.split('.');
				const day = parseInt(parts[0], 10);
				const month = parseInt(parts[1], 10) - 1;
				const year = parseInt(parts[2], 10);
				return new Date(year, month, day);
			},
			// firstDay: 1,
			// enableSelectionDaysInNextAndPreviousMonths: true,
			i18n: i18n,
			format: 'DD.MM.YYYY',
			// minDate: new Date(2018, 1, 1),
			// maxDate: new Date(2020, 1, 1),
			setDefaultDate: true,
			yearRange: 20,
			// keyboardInput: false,
			blurFieldOnSelect: false,
			// ,
			// yearRange: [2000,2020]
		};
		beg = new Pikaday(L.extend({}, opt, {
			_dint: 0,
			field: begDate,
			defaultDate: new Date(1000 * dateInterval[0])
		}));
				// console.log('dddd', beg)
		end = new Pikaday(L.extend({}, opt, {
			_dint: 1,
			field: endDate,
			defaultDate: new Date(1000 * dateInterval[1])
		}));
		// id_dtp = null;
		refresh();

	});
	const onPrev = () => {
		let e = end.getDate(),
			b = beg.getDate(),
			ms = e - b;

		// if (ms === 0) { b = new Date(b.getTime() - 24*60*60*1000); ms = e - b; }
		if (ms === 0) { ms = 24*60*60*1000; }
		// end.setDate(b);
		beg.setDate(new Date(b.getTime() - ms));
		end.setDate(new Date(e.getTime() - ms));
		dateInterval = [beg.getDate().getTime()/1000, 24*60*60 + end.getDate().getTime()/1000];
		setFilter();
		setFilterSkpdi();
		setFilterGibdd();
		setFilterGibddLo();
		setFilterGibddSpt();
		setFilterGibddRub();
// console.log('ssssss', dateInterval, beg.getDate(), end.getDate())
	};
	const onNext = () => {
		let e = end.getDate(),
			b = beg.getDate(),
			ms = e - b;

		// if (ms === 0) { e = new Date(b.getTime() + 24*60*60*1000); ms = e - b; }
		if (ms === 0) { ms = 24*60*60*1000; }
		beg.setDate(new Date(b.getTime() + ms));
		end.setDate(new Date(e.getTime() + ms));
		// beg.setDate(e);
		// end.setDate(new Date(beg.getDate().getTime() + ms));
		dateInterval = [beg.getDate().getTime()/1000, 24*60*60 + end.getDate().getTime()/1000];
		setFilter();
		setFilterSkpdi();
		setFilterGibdd();
		setFilterGibddLo();
		setFilterGibddSpt();
 		setFilterGibddRub();
// console.log('ss1ssss', dateInterval, beg.getDate(), end.getDate())
	};

	// ДТП Очаги (5)
	let hearths_stricken5;
	let str_icon_type5 = [''];
	let hearths_period_type_5 = 1;
	let hearths_year_5 = {};
	let hearths_quarter_5 = {};
	let last_quarter_5;
	Object.keys(optDataHearths5.years || {}).sort().forEach(key => {
		hearths_year_5[key] = true;
		Object.keys(optDataHearths5.years[key]).sort().forEach(key1 => {
			last_quarter_5 = {};
			last_quarter_5[key] = {};
			last_quarter_5[key][key1] = true;
		});
	});
	hearths_quarter_5 = last_quarter_5 || {};
	// const setFilterHearthsTmpPeriodType = (ev) => {
 // console.log('setFilterHearthsTmpPeriodType', hearths_period_type_tmp, ev)
	// };

    const setFilterHearths5 = (ev) => {
		if (DtpHearths5._map) {
		let arg = [],
			target = ev.target || {},
			checked = target.checked,
			id = target.id,
			name = target.name;
		// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);

		if (id === 'hearths_period_type_52') {
			hearths_period_type_5 = 2;
		} else if (id === 'hearths_period_type_51') {
			hearths_period_type_5 = 1;
		} else if (id === 'hearths_year_5') {
			if (checked) {
				hearths_year_5[name] = true;
			} else {
				delete hearths_year_5[name];
			}
		} else if (id === 'hearths_quarter_5') {
			let arr = name.split('_');
			if (checked) {
				if (!hearths_quarter_5[arr[0]]) { hearths_quarter_5[arr[0]] = {}; }
				hearths_quarter_5[arr[0]][arr[1]] = true;
			} else {
				if (hearths_quarter_5[arr[0]]) {
					delete hearths_quarter_5[arr[0]][arr[1]];
				}
				if (Object.keys(hearths_quarter_5[arr[0]]).length === 0) {
					delete hearths_quarter_5[arr[0]];
				}
			}
		}

		if (hearths_period_type_5 === 1) {
			// if (Object.keys(hearths_year_5).length) {
				arg.push({type: 'year', zn: hearths_year_5});
			// }
		} else if (hearths_period_type_5 === 2) {
		// } else if (Object.keys(hearths_quarter_5).length) {
			arg.push({type: 'quarter', zn: hearths_quarter_5});
		}
		if (hearths_stricken5) {
			arg.push({type: 'stricken', zn: Number(hearths_stricken5)});
		}
		if (str_icon_type5.length > 0 && str_icon_type5[0]) {
			arg.push({type: 'str_icon_type', zn: str_icon_type5});
		}
		if (id_dtp) {
			arg.push({type: 'id_dtp', zn: id_dtp});
		}
		
		DtpHearths5.setFilter(arg);
		}
 	};

	// ДТП Очаги (3)
	let hearths_stricken3;
	let str_icon_type3 = [''];
	let hearths_period_type_3 = 1;
	let hearths_year_3 = {};
	let hearths_quarter_3 = {};
	let last_quarter_3;
	Object.keys(optDataHearths3.years || {}).sort().forEach(key => {
		hearths_year_3[key] = true;
		Object.keys(optDataHearths3.years[key]).sort().forEach(key1 => {
			last_quarter_3 = {};
			last_quarter_3[key] = {};
			last_quarter_3[key][key1] = true;
		});
	});
	hearths_quarter_3 = last_quarter_3 || {};
	// const setFilterHearthsTmpPeriodType = (ev) => {
 // console.log('setFilterHearthsTmpPeriodType', hearths_period_type_tmp, ev)
	// };

    const setFilterHearths3 = (ev) => {
		if (DtpHearths3._map) {
		let arg = [],
			target = ev.target || {},
			checked = target.checked,
			id = target.id,
			name = target.name;
		// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);

		if (id === 'hearths_period_type_32') {
			hearths_period_type_3 = 2;
		} else if (id === 'hearths_period_type_31') {
			hearths_period_type_3 = 1;
		} else if (id === 'hearths_year_3') {
			if (checked) {
				hearths_year_3[name] = true;
			} else {
				delete hearths_year_3[name];
			}
		} else if (id === 'hearths_quarter_3') {
			let arr = name.split('_');
			if (checked) {
				if (!hearths_quarter_3[arr[0]]) { hearths_quarter_3[arr[0]] = {}; }
				hearths_quarter_3[arr[0]][arr[1]] = true;
			} else {
				if (hearths_quarter_3[arr[0]]) {
					delete hearths_quarter_3[arr[0]][arr[1]];
				}
				if (Object.keys(hearths_quarter_3[arr[0]]).length === 0) {
					delete hearths_quarter_3[arr[0]];
				}
			}
		}

		if (hearths_period_type_3 === 1) {
			// if (Object.keys(hearths_year_3).length) {
				arg.push({type: 'year', zn: hearths_year_3});
			// }
		} else if (hearths_period_type_3 === 2) {
		// } else if (Object.keys(hearths_quarter_3).length) {
			arg.push({type: 'quarter', zn: hearths_quarter_3});
		}
		if (hearths_stricken3) {
			arg.push({type: 'stricken', zn: Number(hearths_stricken3)});
		}
		if (str_icon_type3.length > 0 && str_icon_type3[0]) {
			arg.push({type: 'str_icon_type', zn: str_icon_type3});
		}
		if (id_dtp) {
			arg.push({type: 'id_dtp', zn: id_dtp});
		}

		DtpHearths3.setFilter(arg);
		}
 	};

	// ДТП Очаги (Stat)
	let hearths_strickenStat;
	let str_icon_typeStat = [''];
	let hearths_period_type_Stat = 1;
	let hearths_year_Stat = {};
	let hearths_quarter_Stat = {};
	let last_quarter_Stat;
	Object.keys(optDataHearthsStat.years || {}).sort().forEach(key => {
		hearths_year_Stat[key] = true;
		Object.keys(optDataHearthsStat.years[key]).sort().forEach(key1 => {
			last_quarter_Stat = {};
			last_quarter_Stat[key] = {};
			last_quarter_Stat[key][key1] = true;
		});
	});
	hearths_quarter_Stat = last_quarter_Stat || {};
	// const setFilterHearthsTmpPeriodType = (ev) => {
 // console.log('setFilterHearthsTmpPeriodType', hearths_period_type_tmp, ev)
	// };

    const setFilterHearthsStat = (ev) => {
		if (DtpHearthsStat._map) {
		let arg = [],
			target = ev.target || {},
			checked = target.checked,
			id = target.id,
			name = target.name;
		// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);

		if (id === 'hearths_period_type_Stat2') {
			hearths_period_type_Stat = 2;
		} else if (id === 'hearths_period_type_Stat1') {
			hearths_period_type_Stat = 1;
		} else if (id === 'hearths_year_Stat') {
			if (checked) {
				hearths_year_Stat[name] = true;
			} else {
				delete hearths_year_Stat[name];
			}
		} else if (id === 'hearths_quarter_Stat') {
			let arr = name.split('_');
			if (checked) {
				if (!hearths_quarter_Stat[arr[0]]) { hearths_quarter_Stat[arr[0]] = {}; }
				hearths_quarter_Stat[arr[0]][arr[1]] = true;
			} else {
				if (hearths_quarter_Stat[arr[0]]) {
					delete hearths_quarter_Stat[arr[0]][arr[1]];
				}
				if (Object.keys(hearths_quarter_Stat[arr[0]]).length === 0) {
					delete hearths_quarter_Stat[arr[0]];
				}
			}
		}

		if (hearths_period_type_Stat === 1) {
			// if (Object.keys(hearths_year_Stat).length) {
				arg.push({type: 'year', zn: hearths_year_Stat});
			// }
		} else if (hearths_period_type_Stat === 2) {
		// } else if (Object.keys(hearths_quarter_Stat).length) {
			arg.push({type: 'quarter', zn: hearths_quarter_Stat});
		}
		if (hearths_strickenStat) {
			arg.push({type: 'stricken', zn: Number(hearths_strickenStat)});
		}
		if (str_icon_typeStat.length > 0 && str_icon_typeStat[0]) {
			arg.push({type: 'str_icon_type', zn: str_icon_typeStat});
		}
		if (id_dtp) {
			arg.push({type: 'id_dtp', zn: id_dtp});
		}
		
		DtpHearthsStat.setFilter(arg);
		}
 	};

	// ДТП Очаги (TMP)
	let hearths_strickenTmp;
	let str_icon_typeTmp = [''];
	let hearths_period_type_tmp = 1;
	let hearths_year_tmp = {};
	let hearths_quarter_tmp = {};
	let last_quarter_tmp;
	Object.keys(optDataHearthsTmp.years || {}).sort().forEach(key => {
		hearths_year_tmp[key] = true;
		Object.keys(optDataHearthsTmp.years[key]).sort().forEach(key1 => {
			last_quarter_tmp = {};
			last_quarter_tmp[key] = {};
			last_quarter_tmp[key][key1] = true;
		});
	});
	hearths_quarter_tmp = last_quarter_tmp || {};
	// const setFilterHearthsTmpPeriodType = (ev) => {
 // console.log('setFilterHearthsTmpPeriodType', hearths_period_type_tmp, ev)
	// };

    const setFilterHearthsTmp = (ev) => {
		if (DtpHearthsTmp._map) {
		let arg = [],
			target = ev.target || {},
			checked = target.checked,
			id = target.id,
			name = target.name;
		// console.log('setFilterHearthsTmp', id, name, checked, hearths_period_type_tmp, hearths_year_tmp, last_quarter_tmp, ev);
		
		if (id === 'hearths_period_type_tmp2') {
			hearths_period_type_tmp = 2;
		} else if (id === 'hearths_period_type_tmp1') {
			hearths_period_type_tmp = 1;
		} else if (id === 'hearths_year_tmp') {
			if (checked) {
				hearths_year_tmp[name] = true;
			} else {
				delete hearths_year_tmp[name];
			}
		} else if (id === 'hearths_quarter_tmp') {
			let arr = name.split('_');
			if (checked) {
				if (!hearths_quarter_tmp[arr[0]]) { hearths_quarter_tmp[arr[0]] = {}; }
				hearths_quarter_tmp[arr[0]][arr[1]] = true;
			} else {
				if (hearths_quarter_tmp[arr[0]]) {
					delete hearths_quarter_tmp[arr[0]][arr[1]];
				}
				if (Object.keys(hearths_quarter_tmp[arr[0]]).length === 0) {
					delete hearths_quarter_tmp[arr[0]];
				}
			}
		}

		if (hearths_period_type_tmp === 1) {
			// if (Object.keys(hearths_year_tmp).length) {
				arg.push({type: 'year', zn: hearths_year_tmp});
			// }
		} else if (hearths_period_type_tmp === 2) {
		// } else if (Object.keys(hearths_quarter_tmp).length) {
			arg.push({type: 'quarter', zn: hearths_quarter_tmp});
		}
		if (hearths_strickenTmp) {
			arg.push({type: 'stricken', zn: Number(hearths_strickenTmp)});
		}
		if (str_icon_typeTmp.length > 0 && str_icon_typeTmp[0]) {
			arg.push({type: 'str_icon_type', zn: str_icon_typeTmp});
		}
		if (id_dtp) {
			arg.push({type: 'id_dtp', zn: id_dtp});
		}
		
		DtpHearthsTmp.setFilter(arg);
		}
 	};

	// ДТП Очаги
	let hearths_stricken;
	let str_icon_type = [''];
	let hearths_period_type = 1;
	let hearths_year = {};
	let hearths_quarter = {};
	let last_quarter;
	Object.keys(optDataHearths.years || {}).sort().forEach(key => {
		hearths_year[key] = true;
		Object.keys(optDataHearths.years[key]).sort().forEach(key1 => {
			last_quarter = {};
			last_quarter[key] = {};
			last_quarter[key][key1] = true;
		});
	});
	hearths_quarter = last_quarter || {};

    const setFilterHearths = (ev) => {
		if (DtpHearths._map) {
		let arg = [],
			target = ev.target || {},
			checked = target.checked,
			id = target.id,
			name = target.name;
		// console.log('setFilterHearths', checked, id, name, ev);
		if (id === 'hearths_period_type2') {
			hearths_period_type = 2;
		} else if (id === 'hearths_period_type1') {
			hearths_period_type = 1;
		} else if (id === 'hearths_year') {
			if (checked) {
				hearths_year[name] = true;
			} else {
				delete hearths_year[name];
			}
		} else if (id === 'hearths_quarter') {
			let arr = name.split('_');
			if (checked) {
				if (!hearths_quarter[arr[0]]) { hearths_quarter[arr[0]] = {}; }
				hearths_quarter[arr[0]][arr[1]] = true;
			} else {
				if (hearths_quarter[arr[0]]) {
					delete hearths_quarter[arr[0]][arr[1]];
				}
				if (Object.keys(hearths_quarter[arr[0]]).length === 0) {
					delete hearths_quarter[arr[0]];
				}
			}
		}

		if (hearths_period_type === 1) {
			arg.push({type: 'year', zn: hearths_year});
		} else if (hearths_period_type === 2) {
		// } else if (Object.keys(hearths_quarter).length) {
			arg.push({type: 'quarter', zn: hearths_quarter});
		}
		if (hearths_stricken) {
			arg.push({type: 'stricken', zn: Number(hearths_stricken)});
		}
		if (str_icon_type.length > 0 && str_icon_type[0]) {
			arg.push({type: 'str_icon_type', zn: str_icon_type});
		}
		if (id_dtp) {
			arg.push({type: 'id_dtp', zn: id_dtp});
		}

		DtpHearths.setFilter(arg);
		}
 	};

</script>

	  <div class="mvsFilters">

		{#if DtpHearthsPicket4._map && DtpHearthsPicket4._opt && DtpHearthsPicket4._opt.years}
		<div class="pLine">Фильтры - <b>Предочаги по пикетажу</b></div>
		<div class="filtersCont">
			<div class="pLine">ID Очага: <input type="text" on:input={oncheckIdHearth} value={id_hearth} /></div>
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine nowrap">
				<fieldset>
					<legend>Фильтрация по периодам:</legend>
					<div class="pLine type">
						<input type="radio" on:change={setFilterHearthsPicket4} bind:group={hearths_period_type_Stat} value={1} checked={hearths_period_type_Stat === 1} id="hearths_period_type_Stat1" name="hearths_period_type_Stat"><label for="hearths_period_type_Stat1">Фильтрация по годам</label>
						<div class="pLine margin">
						{#each Object.keys(DtpHearthsPicket4._opt.years).sort() as key}
							<input type="checkbox" on:change={setFilterHearthsPicket4} id="hearths_year_Picket4" checked={hearths_year_Picket4[key]} disabled={hearths_period_type_Stat === 2} name="{key}"><label for="hearths_year_Picket4">{key}</label>
						{/each}
						</div>
					</div>
				</fieldset>
			</div>
			<div class="pLine">
				<input type="checkbox" on:change={oncheckHt} id="ht_3" checked={ht.hearth3} name="hearth3"><label for="ht_3">одного типа</label>
				<input type="checkbox" on:change={oncheckHt} id="ht_5" checked={ht.hearth5} name="hearth5"><label for="ht_5">разного типа</label>
			</div>
			<div class="pLine">
				<select class="multiple_icon_typeTmp" bind:value={roads} on:change="{setFilterHearthsPicket4}" multiple>
					<option value=''>
						Все дороги ({optRoadTypes4.reduce((p, c) => { p += optDataHearthsPicket4.road[c]; return p; }, 0)})
					</option>
					{#each optRoadTypes4 as key}
						<option value={key} class="road_{key}">
							({optDataHearthsPicket4.road[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			<div class="pLine">
				<select bind:value={hearths_stricken4} name="stricken" on:change="{setFilterHearthsPicket4}">
					<option value=''>({optDataHearthsPicket4.stricken[0] || 0}) Очаги все</option>
					<option value=1>({optDataHearthsPicket4.stricken[1] || 0}) Только с погибшими</option>
					<option value=2>({optDataHearthsPicket4.stricken[2] || 0}) Только с пострадавшими</option>
					<option value=3>({optDataHearthsPicket4.stricken[3] || 0}) С пострадавшими или погибшими</option>
					<option value=4>({optDataHearthsPicket4.stricken[4] || 0}) С пострадавшими и погибшими</option>
				</select>
			</div>
		</div>
		{/if}

		{#if DtpHearthsSettlements._map && DtpHearthsSettlements._opt && DtpHearthsSettlements._opt.years}
		<div class="pLine">Фильтры - <b>Очаги с привязкой к городам</b></div>
		<div class="filtersCont">
			<div class="pLine">ID Очага: <input type="text" on:input={oncheckIdHearth} value={id_hearth} /></div>
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine">
				<fieldset>
					<legend>Расположение очага:</legend>
					<div class="pLine type">
						<div class="pLine margin">
							<input type="checkbox" on:change={oncheckIdCity} id="city_1" checked={city[1]} name="1"><label for="city_1">в населенном пункте</label>
							<input type="checkbox" on:change={oncheckIdCity} id="city_0" checked={city[0]} name="0"><label for="city_0">вне населенного пункта</label><br/>
							<input type="checkbox" on:change={oncheckIdCity} id="city_2" checked={city[2]} name="2"><label for="city_2">на границе населенного пункта</label>
						</div>
					</div>
				</fieldset>
			</div>
			
			<div class="pLine nowrap">
				<fieldset>
					<legend>Фильтрация по годам:</legend>
					<div class="pLine type">
						<div class="pLine margin">
						{#each Object.keys(DtpHearthsSettlements._opt.years).sort() as key}
							<input type="checkbox" on:change={setFilterHearthsSettlements} id="hearths_year_Settlements" checked={hearths_year_Settlements[key]} name="{key}"><label for="hearths_year_Settlements">{key}</label>
						{/each}
						</div>
					</div>
				</fieldset>
			</div>
			<div class="pLine">
				<input type="checkbox" on:change={oncheckHt} id="ht_3" checked={ht.hearth3} name="hearth3"><label for="ht_3">одного типа</label>
				<input type="checkbox" on:change={oncheckHt} id="ht_5" checked={ht.hearth5} name="hearth5"><label for="ht_5">разного типа</label>
			</div>
			<div class="pLine">
				<select class="multiple_icon_typeTmp" bind:value={roads} on:change="{setFilterHearthsSettlements}" multiple>
					<option value=''>
						Все дороги ({optRoadTypes5.reduce((p, c) => { p += optDataHearthsSettlements.road[c]; return p; }, 0)})
					</option>
					{#each optRoadTypes5 as key}
						<option value={key} class="road_{key}">
							({optDataHearthsSettlements.road[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
		</div>
		{/if}
		
		{#if DtpHearthsPicket._map && DtpHearthsPicket._opt && DtpHearthsPicket._opt.years}
		<div class="pLine">Фильтры - <b>ДТП Очаги(Picket)</b></div>
		<div class="filtersCont">
			<div class="pLine">ID Очага: <input type="text" on:input={oncheckIdHearth} value={id_hearth} /></div>
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine nowrap">
				<fieldset>
					<legend>Фильтрация по годам:</legend>
					<div class="pLine type">
						<div class="pLine margin">
						{#each Object.keys(DtpHearthsPicket._opt.years).sort() as key}
							<input type="checkbox" on:change={setFilterHearthsPicket} id="hearths_year_Picket" checked={hearths_year_Picket[key]} name="{key}"><label for="hearths_year_Picket">{key}</label>
						{/each}
						</div>
					</div>
				</fieldset>
			</div>
			<div class="pLine">
				<input type="checkbox" on:change={oncheckHt} id="ht_3" checked={ht.hearth3} name="hearth3"><label for="ht_3">одного типа</label>
				<input type="checkbox" on:change={oncheckHt} id="ht_5" checked={ht.hearth5} name="hearth5"><label for="ht_5">разного типа</label>
			</div>
			<div class="pLine">
				<select class="multiple_icon_typeTmp" bind:value={roads} on:change="{setFilterHearthsPicket}" multiple>
					<option value=''>
						Все дороги ({optRoadTypes.reduce((p, c) => { p += optDataHearthsPicket.road[c]; return p; }, 0)})
					</option>
					{#each optRoadTypes as key}
						<option value={key} class="road_{key}">
							({optDataHearthsPicket.road[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
		</div>
		{/if}

		{#if DtpHearths5._map && DtpHearths5._opt && DtpHearths5._opt.years}
		<div class="pLine">Фильтры - <b>ДТП Очаги (5)</b></div>
		<div class="filtersCont">
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine nowrap">
			<fieldset>
				<legend>Фильтрация по периодам:</legend>
				<div class="pLine type">
					<input type="radio" on:change={setFilterHearths5} bind:group={hearths_period_type_5} value={1} checked={hearths_period_type_5 === 1} id="hearths_period_type_51" name="hearths_period_type_5"><label for="hearths_period_type_51">Фильтрация по годам</label>
					<div class="pLine margin">
					{#each Object.keys(DtpHearths5._opt.years).sort() as key}
						<input type="checkbox" on:change={setFilterHearths5} id="hearths_year_5" checked={hearths_year_5[key]} disabled={hearths_period_type_5 === 2} name="{key}"><label for="hearths_year_5">{key}</label>
					{/each}
					</div>
				</div>
			</fieldset>
			</div>
			<div class="pLine">
				<select class="multiple_icon_typeTmp" bind:value={str_icon_type5} on:change="{setFilterHearths5}" multiple>
					<option value=''>
						Все типы ({optTypeHearths5Keys.reduce((p, c) => { p += optDataHearths5.str_icon_type[c]; return p; }, 0)})
					</option>
					{#each optTypeHearths5Keys as key}
						<option value={key} class="icon_type_{optDataHearths5.iconType[key]}">
							({optDataHearths5.str_icon_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			<div class="pLine">
				<select bind:value={hearths_stricken5} on:change="{setFilterHearths5}">
					<option value=''>({optDataHearths5.stricken[0] || 0}) Очаги все</option>
					<option value=1>({optDataHearths5.stricken[1] || 0}) Только с погибшими</option>
					<option value=2>({optDataHearths5.stricken[2] || 0}) Только с пострадавшими</option>
					<option value=3>({optDataHearths5.stricken[3] || 0}) С пострадавшими или погибшими</option>
					<option value=4>({optDataHearths5.stricken[4] || 0}) С пострадавшими и погибшими</option>
				</select>
			</div>
		</div>
		{/if}

		{#if DtpHearths3._map && DtpHearths3._opt && DtpHearths3._opt.years}
		<div class="pLine">Фильтры - <b>ДТП Очаги (3)</b></div>
		<div class="filtersCont">
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine nowrap">
			<fieldset>
				<legend>Фильтрация по периодам:</legend>
				<div class="pLine type">
					<input type="radio" on:change={setFilterHearths3} bind:group={hearths_period_type_3} value={1} checked={hearths_period_type_3 === 1} id="hearths_period_type_31" name="hearths_period_type_3"><label for="hearths_period_type_31">Фильтрация по годам</label>
					<div class="pLine margin">
					{#each Object.keys(DtpHearths3._opt.years).sort() as key}
						<input type="checkbox" on:change={setFilterHearths3} id="hearths_year_3" checked={hearths_year_3[key]} disabled={hearths_period_type_3 === 2} name="{key}"><label for="hearths_year_3">{key}</label>
					{/each}
					</div>
				</div>
			</fieldset>
			</div>
			<div class="pLine">
				<select class="multiple_icon_typeTmp" bind:value={str_icon_type3} on:change="{setFilterHearths3}" multiple>
					<option value=''>
						Все типы ({optTypeHearths3Keys.reduce((p, c) => { p += optDataHearths3.str_icon_type[c]; return p; }, 0)})
					</option>
					{#each optTypeHearths3Keys as key}
						<option value={key} class="icon_type_{optDataHearths3.iconType[key]}">
							({optDataHearths3.str_icon_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			<div class="pLine">
				<select bind:value={hearths_stricken3} on:change="{setFilterHearths3}">
					<option value=''>({optDataHearths3.stricken[0] || 0}) Очаги все</option>
					<option value=1>({optDataHearths3.stricken[1] || 0}) Только с погибшими</option>
					<option value=2>({optDataHearths3.stricken[2] || 0}) Только с пострадавшими</option>
					<option value=3>({optDataHearths3.stricken[3] || 0}) С пострадавшими или погибшими</option>
					<option value=4>({optDataHearths3.stricken[4] || 0}) С пострадавшими и погибшими</option>
				</select>
			</div>
		</div>
		{/if}

		{#if DtpHearthsStat._map && DtpHearthsStat._opt && DtpHearthsStat._opt.years}
		<div class="pLine">Фильтры - <b>ДТП Очаги (Stat)</b></div>
		<div class="filtersCont">
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine nowrap">
			<fieldset>
				<legend>Фильтрация по периодам:</legend>
				<div class="pLine type">
					<input type="radio" on:change={setFilterHearthsStat} bind:group={hearths_period_type_Stat} value={1} checked={hearths_period_type_Stat === 1} id="hearths_period_type_Stat1" name="hearths_period_type_Stat"><label for="hearths_period_type_Stat1">Фильтрация по годам</label>
					<div class="pLine margin">
					{#each Object.keys(DtpHearthsStat._opt.years).sort() as key}
						<input type="checkbox" on:change={setFilterHearthsStat} id="hearths_year_Stat" checked={hearths_year_Stat[key]} disabled={hearths_period_type_Stat === 2} name="{key}"><label for="hearths_year_Stat">{key}</label>
					{/each}
					</div>
				</div>
				<div class="pLine type">
				<input type="radio" on:change={setFilterHearthsStat} bind:group={hearths_period_type_Stat} value={2} id="hearths_period_type_Stat2" name="hearths_period_type_Stat"><label for="hearths_period_type_Stat2">Фильтрация по кварталам</label>
					<div class="pLine margin">
					{#each Object.keys(DtpHearthsStat._opt.years).sort() as key}
						{#each Object.keys(DtpHearthsStat._opt.years[key]).sort() as key1}
							<input type="checkbox" on:change={setFilterHearthsStat} id="hearths_quarter_Stat" checked={hearths_quarter_Stat[key] && hearths_quarter_Stat[key][key1]} disabled={hearths_period_type_Stat === 1} name="{key}_{key1}"><label for="hearths_quarter_Stat_{key}_{key1}">{key1} кв. {key}</label>
						{/each}
						<br />
					{/each}
					</div>
				</div>
			</fieldset>
			</div>
			<div class="pLine">
				<select class="multiple_icon_typeTmp" bind:value={str_icon_typeStat} on:change="{setFilterHearthsStat}" multiple>
					<option value=''>
						Все типы ({optTypeHearthsStatKeys.reduce((p, c) => { p += optDataHearthsStat.str_icon_type[c]; return p; }, 0)})
					</option>
					{#each optTypeHearthsStatKeys as key}
						<option value={key} class="icon_type_{optDataHearthsStat.iconType[key]}">
							({optDataHearthsStat.str_icon_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			<div class="pLine">
				<select bind:value={hearths_strickenStat} on:change="{setFilterHearthsStat}">
					<option value=''>({optDataHearthsStat.stricken[0] || 0}) Очаги все</option>
					<option value=1>({optDataHearthsStat.stricken[1] || 0}) Только с погибшими</option>
					<option value=2>({optDataHearthsStat.stricken[2] || 0}) Только с пострадавшими</option>
					<option value=3>({optDataHearthsStat.stricken[3] || 0}) С пострадавшими или погибшими</option>
					<option value=4>({optDataHearthsStat.stricken[4] || 0}) С пострадавшими и погибшими</option>
				</select>
			</div>
		</div>
		{/if}

		{#if DtpHearthsTmp._map && DtpHearthsTmp._opt && DtpHearthsTmp._opt.years}
		<div class="pLine">Фильтры - <b>ДТП Очаги (TMP)</b></div>
		<div class="filtersCont">
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine nowrap">
			<fieldset>
				<legend>Фильтрация по периодам:</legend>
				<div class="pLine type">
					<input type="radio" on:change={setFilterHearthsTmp} bind:group={hearths_period_type_tmp} value={1} checked={hearths_period_type_tmp === 1} id="hearths_period_type_tmp1" name="hearths_period_type_tmp"><label for="hearths_period_type_tmp1">Фильтрация по годам</label>
					<div class="pLine margin">
					{#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}
						<input type="checkbox" on:change={setFilterHearthsTmp} id="hearths_year_tmp" checked={hearths_year_tmp[key]} disabled={hearths_period_type_tmp === 2} name="{key}"><label for="hearths_year_tmp">{key}</label>
					{/each}
					</div>
				</div>
				<div class="pLine type">
				<input type="radio" on:change={setFilterHearthsTmp} bind:group={hearths_period_type_tmp} value={2} id="hearths_period_type_tmp2" name="hearths_period_type_tmp"><label for="hearths_period_type_tmp2">Фильтрация по кварталам</label>
					<div class="pLine margin">
					{#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}
						{#each Object.keys(DtpHearthsTmp._opt.years[key]).sort() as key1}
							<input type="checkbox" on:change={setFilterHearthsTmp} id="hearths_quarter_tmp" checked={hearths_quarter_tmp[key] && hearths_quarter_tmp[key][key1]} disabled={hearths_period_type_tmp === 1} name="{key}_{key1}"><label for="hearths_quarter_tmp_{key}_{key1}">{key1} кв. {key}</label>
						{/each}
						<br />
					{/each}
					</div>
				</div>
				<!-- select bind:value={hearths_yearTmp} on:change="{setFilterHearthsTmp}">
					<option value=''>Все года</option>
					{#each Object.keys(DtpHearthsTmp._opt.years).sort() as key}
						<option value={key}>{key}</option>
					{/each}
				</select>

				<select bind:value={hearths_quarterTmp} on:change="{setFilterHearthsTmp}">
					<option value=''>Все кварталы</option>
					<option value=1>1 квартал</option>
					<option value=2>2 квартал</option>
					<option value=3>3 квартал</option>
					<option value=4>4 квартал</option>
				</select -->
			</fieldset>
			</div>
			<div class="pLine">
				<select class="multiple_icon_typeTmp" bind:value={str_icon_typeTmp} on:change="{setFilterHearthsTmp}" multiple>
					<option value=''>
						Все типы ({optTypeHearthsTmpKeys.reduce((p, c) => { p += optDataHearthsTmp.str_icon_type[c]; return p; }, 0)})
					</option>
					{#each optTypeHearthsTmpKeys as key}
						<option value={key} class="icon_type_{optDataHearthsTmp.iconType[key]}">
							({optDataHearthsTmp.str_icon_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			<div class="pLine">
				<select bind:value={hearths_strickenTmp} on:change="{setFilterHearthsTmp}">
					<option value=''>({optDataHearthsTmp.stricken[0] || 0}) Очаги все</option>
					<option value=1>({optDataHearthsTmp.stricken[1] || 0}) Только с погибшими</option>
					<option value=2>({optDataHearthsTmp.stricken[2] || 0}) Только с пострадавшими</option>
					<option value=3>({optDataHearthsTmp.stricken[3] || 0}) С пострадавшими или погибшими</option>
					<option value=4>({optDataHearthsTmp.stricken[4] || 0}) С пострадавшими и погибшими</option>
				</select>
			</div>
		</div>
		{/if}

		{#if DtpHearths._map && DtpHearths._opt && DtpHearths._opt.years}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>ДТП Очаги</b></div>
		<div class="filtersCont">
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine nowrap">
			<fieldset>
				<legend>Фильтрация по периодам:</legend>
				<div class="pLine type">
					<input type="radio" on:change={setFilterHearths} bind:group={hearths_period_type} value={1} checked={hearths_period_type === 1} id="hearths_period_type1" name="hearths_period_type"><label for="hearths_period_type1">Фильтрация по годам</label>
					<div class="pLine margin">
					{#each Object.keys(DtpHearths._opt.years).sort() as key}
						<input type="checkbox" on:change={setFilterHearths} id="hearths_year" checked={hearths_year[key]} disabled={hearths_period_type === 2} name="{key}"><label for="hearths_year{key}">{key}</label>
					{/each}
					</div>
				</div>
				<div class="pLine type">
				<input type="radio" on:change={setFilterHearths} bind:group={hearths_period_type} value={2} id="hearths_period_type2" name="hearths_period_type"><label for="hearths_period_type2">Фильтрация по кварталам</label>
					<div class="pLine margin">
					{#each Object.keys(DtpHearths._opt.years).sort() as key}
						{#each Object.keys(DtpHearths._opt.years[key]).sort() as key1}
							<input type="checkbox" on:change={setFilterHearths} id="hearths_quarter" checked={hearths_quarter[key] && hearths_quarter[key][key1]} disabled={hearths_period_type === 1} name="{key}_{key1}"><label for="hearths_quarter_{key}_{key1}">{key1} кв. {key}</label>
						{/each}
						<br />
					{/each}
					</div>
				</div>
			</fieldset>
			</div>
			<div class="pLine">
				<select class="multiple_icon_typeTmp" bind:value={str_icon_type} on:change="{setFilterHearths}" multiple>
					<option value=''>
						Все типы ({optTypeHearthsKeys.reduce((p, c) => { p += optDataHearths.str_icon_type[c]; return p; }, 0)})
					</option>
					{#each optTypeHearthsKeys as key}
						<option value={key} class="icon_type_{optDataHearths.iconType[key]}">
							({optDataHearths.str_icon_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			<div class="pLine">
				<select bind:value={hearths_stricken} on:change="{setFilterHearths}">
					<option value=''>({optDataHearths.stricken[0] || 0}) Очаги все</option>
					<option value=1>({optDataHearths.stricken[1] || 0}) Только с погибшими</option>
					<option value=2>({optDataHearths.stricken[2] || 0}) Только с пострадавшими</option>
					<option value=3>({optDataHearths.stricken[3] || 0}) С пострадавшими или погибшими</option>
					<option value=4>({optDataHearths.stricken[4] || 0}) С пострадавшими и погибшими</option>
				</select>
			</div>
		</div>
		{/if}

		{#if DtpVerifyed._map || DtpSkpdi._map || DtpGibddLo._map || DtpGibddSpt._map || DtpGibdd._map || DtpGibddRub._map || Measures._map}
		<div class="pLine"><hr></div>
		<div class="pikaday pLine">
			<button class="pika-prev" on:click={onPrev}></button>
			<input type="text" class="begDate" bind:this={begDate} />
			<input type="text" class="endDate" bind:this={endDate} />
			<button class="pika-next" on:click={onNext}></button>
		</div>
		{#if DtpVerifyed._map || DtpSkpdi._map || DtpGibdd._map || DtpGibddLo._map || DtpGibddSpt._map || DtpGibddRub._map}
			<div class="pLine">
				<br />
				<label>
					<input bind:value={minOpacity} on:input={setMinOpacity} type="range" min="0.05" max="1" step="0.01" disabled={!heat}><span>Мин.яркость ({minOpacity})</span>
				</label>
				<br />
				<label>
					<input bind:value={radius} on:input={setMinOpacity} type="range" min="0" max="100" step="1" disabled={!heat}><span>Радиус ({radius})</span>
				</label>
				<br />
				<label>
					<input bind:value={blur} on:input={setMinOpacity} type="range" min="0" max="15" step="0.01" disabled={!heat}><span>Размытие ({blur})</span>
				</label>
			</div>
			<div class="pLine">
				<input type="checkbox" bind:this={heatElement} on:change={setHeat} checked={DtpGibddRub._needHeat || DtpGibddLo._needHeat || DtpGibddSpt._needHeat || DtpSkpdi._needHeat || DtpVerifyed._needHeat} name="heat"><label for="heat"> - тепловая карта</label>
			</div>
		{/if}
		{:else if !Measures._map && !DtpHearthsSettlements._map && !DtpHearths._map && !DtpHearthsStat._map && !DtpHearthsTmp._map && !DtpHearthsPicket4._map && !DtpHearthsPicket._map && !DtpHearths3._map && !DtpHearths5._map && !Rub._map}
			<div class="pLine">Нет включенных слоев</div>
		{/if}

		{#if Measures._map}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>Мероприятий</b></div>
		<div class="filtersCont">
			{#if optMeasures.type}
			<div class="pLine">
				<select class="multiple_type" bind:value={measures_type} on:change="{setFilterMeasures}" multiple>
					<option value=''>
						Все типы ({optMeasuresKeys.reduce((p, c) => { p += optMeasures.type[c]; return p; }, 0)})
					</option>
					{#each optMeasuresKeys as key}
						<option value={key} class="type_{optMeasures.type[key]}">
							({optMeasures.type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			{/if}
		</div>
		{/if}

		{#if DtpVerifyed._map}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>ДТП Сводный</b></div>
		<div class="filtersCont">
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine"><input type="radio" id="d0" name="drone" value=0 checked on:click={oncheck}><label for="d0">Все</label></div>
			{#if DtpVerifyed._arm}
			<div class="pLine"><input type="radio" id="d1" name="drone" value=1 on:click={oncheck}><label for="d1">Только Пересечения ГИБДД и СКПДИ</label></div>
			{:else}
			<div class="pLine"><input type="radio" id="d1" name="drone" value=1 on:click={oncheck}><label for="d1">Только Пересечения</label></div>
			<div class="pLine"><input type="radio" id="d2" name="drone" value="2" on:click={oncheck}><label for="d2">Только СКПДИ</label></div>
			{/if}
			<div class="pLine"><input type="radio" id="d3" name="drone" value="3" on:click={oncheck}><label for="d3">Только ГИБДД</label></div>
			<div class="pLine">
				<input type="checkbox" on:change={oncheckEvents} id="ev1" checked={evnt.ev1} name="ev1"><label for="ev1"> - с мероприятиями</label>
				<input type="checkbox" on:change={oncheckEvents} id="ev0" checked={evnt.ev0} name="ev0"><label for="ev0"> - без мероприятий</label>
			</div>
			{#if optData.collision_type}
			<div class="pLine">
				<select class="multiple_icon_type" bind:value={collision_type} on:change="{setFilter}" multiple>
					<option value=''>
						Все типы ({optCollisionKeys.reduce((p, c) => { p += optData.collision_type[c]; return p; }, 0)})
					</option>
					{#each optCollisionKeys as key}
						<option value={key} class="icon_type_{optData.iconType[key]}">
							({optData.collision_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			{/if}
		</div>
		{/if}

		{#if DtpSkpdi._map}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>ДТП СКПДИ</b></div>
		<div class="filtersCont">
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine">
				<input type="checkbox" on:change={oncheckEvents} id="ev1" checked={evnt.ev1} name="ev1"><label for="ev1"> - с мероприятиями</label>
				<input type="checkbox" on:change={oncheckEvents} id="ev0" checked={evnt.ev0} name="ev0"><label for="ev0"> - без мероприятий</label>
			</div>
			{#if optDataSkpdi.collision_type}
			<div class="pLine">
				<select class="multiple_icon_type" bind:value={collision_type_skpdi} on:change="{setFilterSkpdi}" multiple>
					<option value=''>
						Все типы ({optCollisionSkpdiKeys.reduce((p, c) => { p += optDataSkpdi.collision_type[c]; return p; }, 0)})
					</option>
					{#each optCollisionSkpdiKeys as key}
						<option value={key} class="icon_type_{optDataSkpdi.iconType[key]}">
							({optDataSkpdi.collision_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			{/if}
		</div>
		{/if}

		{#if DtpGibdd._map}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>ДТП ГИБДД</b></div>
		<div class="filtersCont">
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<div class="pLine">
				<input type="checkbox" on:change={oncheckDps} id="Dps1" checked={dps.Dps1} name="Dps1"><label for="Dps1"> - с батальонами ДПС</label>
				<input type="checkbox" on:change={oncheckDps} id="Dps0" checked={dps.Dps0} name="Dps0"><label for="Dps0"> - без батальонов ДПС</label>
			</div>
			<div class="pLine">
				<input type="checkbox" on:change={oncheckEvents} id="ev1" checked={evnt.ev1} name="ev1"><label for="ev1"> - с мероприятиями</label>
				<input type="checkbox" on:change={oncheckEvents} id="ev0" checked={evnt.ev0} name="ev0"><label for="ev0"> - без мероприятий</label>
			</div>
			{#if optDataGibdd.collision_type}
			<div class="pLine">
				<select class="multiple_icon_type" bind:value={collision_type_gibdd} on:change="{setFilterGibdd}" multiple>
					<option value=''>
						Все типы ({optCollisionGibddKeys.reduce((p, c) => { p += optDataGibdd.collision_type[c]; return p; }, 0)})
					</option>
					{#each optCollisionGibddKeys as key}
						<option value={key} class="icon_type_{optDataGibdd.iconType[key]}">
							({optDataGibdd.collision_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			{/if}
		</div>
		{/if}

		{#if DtpGibddLo._map}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>ДТП ГИБДД (Ленинградская область)</b></div>
		<div class="filtersCont">
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<!-- div class="pLine">
				<input type="checkbox" on:change={oncheckDps} id="Dps1" checked={dps.Dps1} name="Dps1"><label for="Dps1"> - с батальонами ДПС</label>
				<input type="checkbox" on:change={oncheckDps} id="Dps0" checked={dps.Dps0} name="Dps0"><label for="Dps0"> - без батальонов ДПС</label>
			</div>
			<div class="pLine">
				<input type="checkbox" on:change={oncheckEvents} id="ev1" checked={evnt.ev1} name="ev1"><label for="ev1"> - с мероприятиями</label>
				<input type="checkbox" on:change={oncheckEvents} id="ev0" checked={evnt.ev0} name="ev0"><label for="ev0"> - без мероприятий</label>
			</div -->
			{#if optDataGibddLo.collision_type}
			<div class="pLine">
				<select class="multiple_icon_type" bind:value={collision_type_gibdd} on:change="{setFilterGibddLo}" multiple>
					<option value=''>
						Все типы ({optCollisionGibddLoKeys.reduce((p, c) => { p += optDataGibddLo.collision_type[c]; return p; }, 0)})
					</option>
					{#each optCollisionGibddLoKeys as key}
						<option value={key} class="icon_type_{optDataGibddLo.iconType[key]}">
							({optDataGibddLo.collision_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			{/if}
		</div>
		{/if}

		{#if DtpGibddSpt._map}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>ДТП ГИБДД (Санкт-Петербург)</b></div>
		<div class="filtersCont">
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
			<!-- div class="pLine">
				<input type="checkbox" on:change={oncheckDps} id="Dps1" checked={dps.Dps1} name="Dps1"><label for="Dps1"> - с батальонами ДПС</label>
				<input type="checkbox" on:change={oncheckDps} id="Dps0" checked={dps.Dps0} name="Dps0"><label for="Dps0"> - без батальонов ДПС</label>
			</div>
			<div class="pLine">
				<input type="checkbox" on:change={oncheckEvents} id="ev1" checked={evnt.ev1} name="ev1"><label for="ev1"> - с мероприятиями</label>
				<input type="checkbox" on:change={oncheckEvents} id="ev0" checked={evnt.ev0} name="ev0"><label for="ev0"> - без мероприятий</label>
			</div -->
			{#if optDataGibddSpt.collision_type}
			<div class="pLine">
				<select class="multiple_icon_type" bind:value={collision_type_gibdd} on:change="{setFilterGibddSpt}" multiple>
					<option value=''>
						Все типы ({optCollisionGibddSptKeys.reduce((p, c) => { p += optDataGibddSpt.collision_type[c]; return p; }, 0)})
					</option>
					{#each optCollisionGibddSptKeys as key}
						<option value={key} class="icon_type_{optDataGibddSpt.iconType[key]}">
							({optDataGibddSpt.collision_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			{/if}
		</div>
		{/if}

		{#if DtpGibddRub._map}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>ДТП ГИБДД + Рубежи</b></div>
			<div class="pLine">ID ДТП: <input type="text" on:input={oncheckIdDtp} value={id_dtp} /></div>
		<div class="pLine">
			<input type="checkbox" bind:checked={list_rubOn} on:change={setFilterGibddRub} name="list_rubOn"><label for="list_rubOn"> - с рубежами</label>
			<input type="checkbox" bind:checked={list_rubOff} on:change={setFilterGibddRub} name="list_rubOff"><label for="list_rubOff"> - без рубежей</label>
		</div>
		<div class="filtersCont">
			{#if optDataGibddRub.collision_type}
			<div class="pLine">
				<select class="multiple_icon_type" bind:value={collision_type_gibddRub} on:change="{setFilterGibddRub}" multiple>
					<option value=''>
						Все типы ({optCollisionGibddRubKeys.reduce((p, c) => { p += optDataGibddRub.collision_type[c]; return p; }, 0)})
					</option>
					{#each optCollisionGibddRubKeys as key}
						<option value={key} class="icon_type_{optDataGibddRub.iconType[key]}">
							({optDataGibddRub.collision_type[key]}) - {key}
						</option>
					{/each}
				</select>
			</div>
			{/if}
		</div>
		{/if}

		{#if Rub._map}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>Рубежей</b></div>
		<div class="filtersCont">
			<div class="pLine">
				<input type="checkbox" bind:checked={compOn} on:change={setComp} name="comp1"><label for="comp1"> - есть комплексы</label>
				<input type="checkbox" bind:checked={comp1On} on:change={setComp} name="comp"><label for="comp"> -  нет комплексов</label>
			</div>
		</div>
		{/if}

	  </div>

<style>

.multiple_icon_typeTmp option:checked::before, .multiple_icon_type option:checked::before {
	content: "\2611";
}
.multiple_icon_type option.icon_type_14::before,
.multiple_icon_type option.icon_type_13::before,
.multiple_icon_type option.icon_type_12::before,
.multiple_icon_type option.icon_type_11::before,
.multiple_icon_type option.icon_type_10::before,
.multiple_icon_type option.icon_type_9::before,
.multiple_icon_type option.icon_type_6::before,
.multiple_icon_type option.icon_type_5::before,
.multiple_icon_type option.icon_type_4::before,
.multiple_icon_type option.icon_type_3::before,
.multiple_icon_type option.icon_type_2::before,
.multiple_icon_type option.icon_type_1::before {
    background-color: #8B4513;
}
.multiple_icon_type option.icon_type_7::before, .multiple_icon_type option.icon_type_8::before {
    background-color: #228B22;
}
.multiple_icon_type option.icon_type_15::before, .multiple_icon_type option.icon_type_16::before {
    background-color: #7B68EE;
}
.multiple_icon_type option.icon_type_17::before, .multiple_icon_type option.icon_type_18::before {
    background-color: #2F4F4F;
}

.multiple_icon_typeTmp option.icon_type_1::before, .multiple_icon_typeTmp option.icon_type_2::before {
    background-color: #FFA500;
}
.multiple_icon_typeTmp option.icon_type_3::before, .multiple_icon_typeTmp option.icon_type_4::before {
    background-color: #B8860B;
}
.multiple_icon_typeTmp option.icon_type_5::before, .multiple_icon_typeTmp option.icon_type_6::before {
    background-color: #CD853F;
}
.multiple_icon_typeTmp option.icon_type_7::before, .multiple_icon_typeTmp option.icon_type_8::before {
    background-color: #228B22;
}
.multiple_icon_typeTmp option.icon_type_9::before, .multiple_icon_typeTmp option.icon_type_10::before {
    background-color: #FF8C00;
}
.multiple_icon_typeTmp option.icon_type_11::before, .multiple_icon_typeTmp option.icon_type_12::before {
    background-color: #D2691E;
}
.multiple_icon_typeTmp option.icon_type_13::before, .multiple_icon_typeTmp option.icon_type_14::before {
    background-color: #DEB887;
}
.multiple_icon_typeTmp option.icon_type_15::before, .multiple_icon_typeTmp option.icon_type_16::before {
    background-color: #7B68EE;
}
.multiple_icon_typeTmp option.icon_type_17::before, .multiple_icon_typeTmp option.icon_type_18::before {
    background-color: #2F4F4F;
}
.multiple_icon_typeTmp option.icon_type_19::before, .multiple_icon_typeTmp option.icon_type_20::before {
    background-color: #FF0000;
}
.multiple_icon_typeTmp option::before, .multiple_icon_type option::before {
	font-family: 'Font Awesome 5 Free';
	content: "\2610";
	width: 1.3em;
	/*width: 12px;
    height: 12px;
    background-color: red;
	*/
	display: inline-block;
	margin-right: 2px;
    padding-left: 5px;
    color: white;
}
.multiple_icon_typeTmp option {
	/*margin-left: 22px;*/
}

.pLine select {
	max-width: 300px;
}
.pLine.margin {
    margin-left: 12px;
}
.filtersCont select {
   /* max-width: 147px;*/
}
.endDate, .begDate {
    width: 72px;
}
.pikaday {
    white-space: nowrap;
	min-width: 188px;
	max-width: 200px;
    text-align: center;
}
.pikaday input {
    margin: unset;
}
.nowrap {
    width: 362px;
    white-space: nowrap;
}
.pLine {
   /* width: max-content;
    display: inline-flex;*/
}
.pLine hr {
    width: 100%;
}
input {
	display: inline-block;
    margin: .4rem;
}
label {
    top: -3px;
	display: inline-block;
    position: relative;
}
</style>