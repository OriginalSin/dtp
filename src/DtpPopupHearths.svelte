<script>
	import DtpPopup from './DtpPopupVerifyed.svelte';
	import DtpPopupEvnt from './DtpPopupEvnt.svelte';
	export let prp;
	export let predochag;
	let current;

    const moveTo = (nm) => {
		let obj = prp._bounds.options.items[nm];
		if (obj && obj._map) {
			obj._map.panTo(obj._latlng);
		}
	};
	let evnCont;
	const showEvn = (ev) => {
		let id = ev.target.getAttribute('data');
		evnCont.innerHTML = '';

		let url = 'https://dtp.mvs.group/scripts/events_dev/get_event_id_' + id + '.txt';
		fetch(url, {})
			.then(req => req.json())
			.then(json => {
				evnCont.classList.remove('hidden');
				const app = new DtpPopupEvnt({
					target: evnCont,
					props: {
						prp: json[0]
					}
				});
			});

	};
// console.log('prp ', prp);

    const showDtpInfo = (ev) => {
console.log('showDtpInfo ', ev);
	};
	let city = 'city' in prp ? ' (city: ' + prp.city + ')' : '';
	let event_h = prp.event_h && prp.event_h.length > 1 ? prp.event_h : null; 
	let event_lo = prp.event_lo && prp.event_lo.length > 1 ? prp.event_lo : null; 

</script>
	<div class="mvsPopup">
		<div class="pLine">{predochag ? 'Предочаг' : 'Очаг'} ДТП (id: {prp.id || prp.id_hearth}){city}</div>
		<div class="pLine">{prp.quarter ? prp.quarter + ' кв.': ''} {prp.year}г.</div>
		<div class="featureCont">
		  <table class="table">
			<tbody>
				{#if prp.piketaj_start_km}
			<tr>
			  <td class="first">Пикетаж:</td>
			  <td>От: <b>{prp.piketaj_start_km || 0}</b> км. до: <b>{prp.piketaj_finish_km || 0}</b> км.</td>
			</tr>
				{/if}
				{#if prp.str_icon_type}
			<tr>
			  <td class="first">Тип ДТП:</td>
			  <td>{prp.str_icon_type || ''}</td>
			</tr>
				{/if}
			<tr>
			  <td class="first">Всего ДТП:</td>
			  <td>{prp.list_dtp.length}</td>
			</tr>
			<tr>
			  <td class="first">Погибших:</td>
			  <td>{prp.count_lost}</td>
			</tr>
			<tr>
			  <td class="first">Раненых:</td>
			  <td>{prp.count_stricken}</td>
			</tr>
				{#each prp.list_dtp as pt1, index}
			<tr>
			  <td class="first" colspan=2>
				<ul>
					<li>Пикетаж: {Math.floor(pt1.piketaj_m / 1000)} км. {pt1.piketaj_m % 1000} м.</li>
					<li on:click={() => {moveTo(index);}} title={'id: ' + pt1.id}>{new Date(1000 * pt1.date).toLocaleDateString()} погибших {pt1.lost}, раненых {pt1.stricken}</li>
					
				</ul>
			  </td>
			</tr>
			<tr>
			  <td class="first">Адрес:</td>
			  <td>{pt1.address}<br /><span class="link" on:click={() => {current = index;}}>подробнее</span>
				{#if current === index}
				<div class="win leaflet-popup-content-wrapper ">
					<DtpPopup prp={pt1} closeMe={() => {current = null;}} />
				</div>
				{/if}

			  </td>
			</tr>
				{/each}
            <tr>
              <td class="first" colspan=2>
		<div class="win leaflet-popup-content-wrapper hidden" bind:this={evnCont}></div>
			  </td>
            </tr>
		   </tbody>
		  </table>
		</div>
		<div class="events">
			{#if event_h}
			<div class="event_h">
				<div class="title">Привязанные мероприятия</div>
				<ol start="1">
				{#each event_h as pt1}
					<li class="link" on:click={showEvn} data={pt1.id_event}>Мероприятие</li>
				{/each}
				</ol>
			</div>
			{/if}
			{#if event_lo}
			<div class="event_lo">
				<div class="title">Мероприятия в районе очага</div>
				<ol start="1">
				{#each event_lo as pt1}
					<li class="link" on:click={showEvn} data={pt1.id_event}>Мероприятие</li>
				{/each}
				</ol>
			</div>
			{/if}
		</div>

	</div>

<style>
.win {
    position: absolute;
    min-width: 280px;
    left: 360px;
    top: 76px;
}
span.link {
    cursor: pointer;
    color: blue;
    display: block;
    margin-top: 6px;
}
.mvsPopup {
    min-width: 260px;
}
.mvsPopup li {
    cursor: pointer;
}
.mvsPopup .table {
    width: 100%;
}
.mvsPopup .featureCont .first {
    max-width: 100px;
}
.primary {
    color: #fff;
    background-color: #1890ff;
    border-color: #1890ff;
    text-shadow: 0 -1px 0 rgba(0,0,0,.12);
    -webkit-box-shadow: 0 2px 0 rgba(0,0,0,.045);
    box-shadow: 0 2px 0 rgba(0,0,0,.045);
}
button:disabled,
button[disabled] {
    cursor: default;
    opacity: 0.5;
}
button:hover {
    color: blue;
}
button.current {
    text-decoration-line: underline;
}
button {
    line-height: 1.499;
    position: relative;
    display: inline-block;
    font-weight: 400;
    white-space: nowrap;
    text-align: center;
    background-image: none;
    -webkit-box-shadow: 0 2px 0 rgba(0,0,0,.015);
    box-shadow: 0 2px 0 rgba(0,0,0,.015);
    cursor: pointer;
    -webkit-transition: all .3s cubic-bezier(.645,.045,.355,1);
    transition: all .3s cubic-bezier(.645,.045,.355,1);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    height: 32px;
    padding: 0 15px;
    font-size: 14px;
    border-radius: 4px;
    color: rgba(0,0,0,.65);
    background-color: #fff;
    border: 1px solid #d9d9d9;
}

</style>