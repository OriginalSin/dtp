<script>
	import { onMount } from 'svelte';
	export let DtpVerifyed;
	export let DtpHearths;
	export let DtpSkpdi;
	export let DtpGibdd;

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
	const bd = new Date(2018, 0, 1);

	let dateInterval = [bd.getTime()/1000, ed.getTime()/1000];
	let optData = DtpVerifyed._opt || {};
	let optCollisionKeys = optData.collision_type ? Object.keys(optData.collision_type).sort((a, b) => optData.collision_type[b] - optData.collision_type[a]) : [];
	let optDataSkpdi = DtpSkpdi._opt || {};
	let optCollisionSkpdiKeys = optDataSkpdi.collision_type ? Object.keys(optDataSkpdi.collision_type).sort((a, b) => optDataSkpdi.collision_type[b] - optDataSkpdi.collision_type[a]) : [];
	let optDataGibdd = DtpGibdd._opt || {};
	let optCollisionGibddKeys = optDataGibdd.collision_type ? Object.keys(optDataGibdd.collision_type).sort((a, b) => optDataGibdd.collision_type[b] - optDataGibdd.collision_type[a]) : [];
	
	let collision_type;
	let collision_type_skpdi;
	let collision_type_gibdd;
	let beg;
	let end;

    const setFilter = () => {
		let opt = [
			{type: 'itemType', zn: currentFilter}
		];
		if (dateInterval) {
			opt.push({type: 'date', zn: dateInterval});
		}
		if (collision_type) {
			opt.push({type: 'collision_type', zn: collision_type});
		}
		// console.log('opt', collision_type, opt);
		DtpVerifyed.setFilter(opt);
	};

    const setFilterGibdd = () => {
		let opt = [
		];
		if (dateInterval) {
			opt.push({type: 'date', zn: dateInterval});
		}
		if (collision_type_gibdd) {
			opt.push({type: 'collision_type', zn: collision_type_gibdd});
		}
		// console.log('opt', collision_type, opt);
		DtpGibdd.setFilter(opt);
	};

    const setFilterSkpdi = () => {
		let opt = [
		];
		if (dateInterval) {
			opt.push({type: 'date', zn: dateInterval});
		}
		if (collision_type_skpdi) {
			opt.push({type: 'collision_type', zn: collision_type_skpdi});
		}
		// console.log('opt', collision_type, opt);
		DtpSkpdi.setFilter(opt);
	};

    const oncheckDtpHearths = (ev) => {
		let target = ev.target;
		currentFilterDtpHearths = Number(target.value);
		let year = Number(target.getAttribute('_year'));
		
		// console.log('oncheck', currentFilter, DtpVerifyed._opt);
		// setFilter();
		let arg = {type: 'quarter', year: Number(target.getAttribute('_year')), zn: currentFilterDtpHearths};
		DtpHearths.setFilter([{type: 'quarter', year: Number(target.getAttribute('_year')), zn: currentFilterDtpHearths}]);
	};
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
 // console.log('ss1ssss', dateInterval, beg.getDate(), end.getDate())
	};
</script>

	  <div class="mvsFilters">

		<div class="pikaday pLine">
			<button class="pika-prev" on:click={onPrev}></button>
			<input type="text" class="begDate" bind:this={begDate} />
			<input type="text" class="endDate" bind:this={endDate} />
			<button class="pika-next" on:click={onNext}></button>
		</div>

		{#if DtpHearths._map && DtpHearths._opt && DtpHearths._opt.years}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>ДТП Очаги</b></div>
		<div class="filtersCont">
			{#each Object.keys(DtpHearths._opt.years).sort() as key}
			<div class="pLine">{key}</div>
			{#each Object.keys(DtpHearths._opt.years[key]).sort() as key1}
				<div class="pLine"><input type="radio" id="k{key}{key1}" name="quarter" value={key1} _year={key} checked on:click={oncheckDtpHearths}><label for="k{key}{key1}">{key1} квартал</label></div>
			{/each}
			{/each}
		</div>
		{/if}

		{#if DtpVerifyed._map}
		<div class="pLine"><hr></div>
		<div class="pLine">Фильтры - <b>ДТП Сводный</b></div>
		<div class="filtersCont">
			<div class="pLine"><input type="radio" id="d0" name="drone" value=0 checked on:click={oncheck}><label for="d0">Все</label></div>
			<div class="pLine"><input type="radio" id="d1" name="drone" value=1 on:click={oncheck}><label for="d1">Только Пересечения</label></div>
			<div class="pLine"><input type="radio" id="d2" name="drone" value="2" on:click={oncheck}><label for="d2">Только СКПДИ</label></div>
			<div class="pLine"><input type="radio" id="d3" name="drone" value="3" on:click={oncheck}><label for="d3">Только ГИБДД</label></div>
			{#if optData.collision_type}
			<div class="pLine">
				<select bind:value={collision_type} on:change="{setFilter}">
					<option value=''>
						Все типы ({optCollisionKeys.reduce((p, c) => { p += optData.collision_type[c]; return p; }, 0)})
					</option>
					{#each optCollisionKeys as key}
						<option value={key}>
							{key} ({optData.collision_type[key]})
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
			{#if optDataSkpdi.collision_type}
			<div class="pLine">
				<select bind:value={collision_type_skpdi} on:change="{setFilterSkpdi}">
					<option value=''>
						Все типы ({optCollisionSkpdiKeys.reduce((p, c) => { p += optDataSkpdi.collision_type[c]; return p; }, 0)})
					</option>
					{#each optCollisionSkpdiKeys as key}
						<option value={key}>
							{key} ({optDataSkpdi.collision_type[key]})
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
			{#if optDataGibdd.collision_type}
			<div class="pLine">
				<select bind:value={collision_type_gibdd} on:change="{setFilterGibdd}">
					<option value=''>
						Все типы ({optCollisionGibddKeys.reduce((p, c) => { p += optDataGibdd.collision_type[c]; return p; }, 0)})
					</option>
					{#each optCollisionGibddKeys as key}
						<option value={key}>
							{key} ({optDataGibdd.collision_type[key]})
						</option>
					{/each}
				</select>
			</div>
			{/if}
		</div>
		{/if}
	  </div>

<style>
.filtersCont select {
    max-width: 147px;
}
.endDate, .begDate {
    width: 72px;
}
.pikaday {
    white-space: nowrap;
	min-width: 188px;
    text-align: center;
}
.pikaday input {
    margin: unset;
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