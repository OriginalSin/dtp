<script>
	import { afterUpdate } from 'svelte';
	import Modal from './Modal.svelte';
	import DtpPopup from './DtpPopupDps.svelte';
	import DtpPopupEvnt from './DtpPopupEvnt.svelte';

	export let showModal = false;

	export let prp;
	let modal;

	let disabled = prp.skpdiFiles ? '' : 'disabled';
	let gpsCont;
	let evnCont;
   const showEvn = (ev) => {
		let id = ev.target.value;
		evnCont.innerHTML = '';

		let url = 'https://dtp.mvs.group/scripts/events_dev/get_event_id_' + id + '.txt';
		fetch(url, {})
			.then(req => req.json())
			.then(json => {
				const app = new DtpPopupEvnt({
					target: evnCont,
					props: {
						prp: json[0]
					}
				});
			});

	};

	afterUpdate(() => {
		// console.log('the component just updated', showModal, modal);
		if (showModal) {
			modal = new Modal({
				target: document.body,
				props: {
					data: prp.skpdiFiles
				}
			});
			modal.$on('close', (ev) => {
				modal.$destroy();
				showModal = false;
			});
		}
	});
    const showBat = (ev) => {
		let id = ev.target.value;
console.log('showBat', ev.target.value)
		gpsCont.innerHTML = '';

		let url = 'https://dtp.mvs.group/scripts/regiments_dev/get_plk_id' + id + '.txt';
		// let url = 'https://dtp.mvs.group/scripts/rubez_dev/rubez-complex-' + id + '.txt';
		fetch(url, {})
			.then(req => req.json())
			.then(json => {
	// console.log('bindPopup', layer, json, DtpPopup);
				const app = new DtpPopup({
					target: gpsCont,
					props: {
						prp: json[0]
					}
				});
			});
/*
*/
	};

    const copyParent = (ev) => {
		navigator.clipboard.writeText(ev.target.parentNode.textContent).catch(err => {
			console.log('Something went wrong', err);
		});
	};
	const tsInfoArr = (prp.tsInfo || []).map(it => {
		let ts_uch = it.ts_uch || [];
		return {
			ts: it.ts !== 'Осталось на месте ДТП' ? it.ts : '',
			arr: ts_uch.map(pt => {
				return {
					k_uch: pt.k_uch || '',
					npdd: pt.npdd !== 'Нет нарушений' ? pt.npdd : '',
					sop_npdd: pt.sop_npdd !== 'Нет нарушений' ? pt.sop_npdd : ''
				}
			})
		};
	});
//console.log('ddddd', prp)

</script>

	  <div class="mvsPopup">
		<div class="pLine">
		  <b>{prp.name || prp.dtvp || ''}</b>
		</div>
		<div class="featureCont">
		  <table class="table">
			<tbody>
			<tr>
			  <td class="first">ID:</td>
			  <td>{prp.sid || prp.id_stat || prp.id_skpdi || ''}</td>
			</tr>
			<tr>
			  <td class="first">Адрес:</td>
			  <td>{prp.district || ''}</td>
			</tr>
			<tr>
			  <td class="first">Дорога:</td>
			  <td>{prp.dor || ''}</td>
			</tr>
			<tr>
			  <td class="first">Населенный пункт:</td>
			  <td>{prp.name_city || 'вне населенного пункта'}</td>
			</tr>
			<tr>
			  <td class="first">Пикетаж:</td>
			  <td><b>{prp.km || 0}</b> км. <b>{prp.m || 0}</b> м.</td>
			</tr>
			<tr>
			  <td class="first">Координаты:</td>
			  <td>{prp.lat} {prp.lon} <span on:click={copyParent} title="Скопировать в буфер обмена" class="leaflet-gmx-icon-copy"></span></td>
			</tr>
			<tr>
			  <td class="first">Дата/время:</td>
			  <td>{prp.collision_date || prp.dtp_date || ''}</td>
			</tr>
			<tr>
			  <td class="first">Вид ДТП:</td>
			  <td>{prp.dtvp || ''}</td>
			</tr>
            <tr>
              <td class="first">Нарушения:</td>
              <td>
				<ul>
					{#each tsInfoArr as pt}
						{#if pt.ts}<li>{pt.ts}</li>{/if}
						{#each pt.arr as pt1}
							{#if pt1.k_uch && (pt1.npdd || pt1.sop_npdd)}<li>{pt1.k_uch}</li>{/if}
							{#if pt1.npdd}<li>{pt1.npdd}</li>{/if}
							{#if pt1.sop_npdd}<li>{pt1.sop_npdd}</li>{/if}
						{/each}
					{/each}
				</ul>
			  </td>
            </tr>
            <tr>
              <td class="first">Условия:</td>
              <td>
				{#if prp.spog}
					<div>
						<div class="stitle">Погода:</div> <div class="sval">{prp.spog}</div>
					</div>
				{/if}
				{#if prp.s_pch}
					<div>
						<div class="stitle">Покрытие:</div> <div class="sval">{prp.s_pch}</div>
					</div>
				{/if}
				{#if prp.osv}
					<div>
						<div class="stitle">Освещенность:</div> <div class="sval">{prp.osv}</div>
					</div>
				{/if}
				{#if prp.ndu}
					<div>
						<div class="stitle">Иные условия:</div> <div class="sval">{prp.ndu}</div>
					</div>
				{/if}
			  </td>
            </tr>
            <tr>
              <td class="first">Количество погибших/раненых:</td>
              <td><b>{prp.pog}/{prp.ran}</b></td>
            </tr>
            <tr>
              <td class="first" colspan=2>
		<div class="win leaflet-popup-content-wrapper hidden" bind:this={gpsCont}></div>
				<ul>
			{#each (prp.dps_plk || []) as pt1}
				<li class="link" on:click={showBat} value={pt1}>батальон ДПС</li>
			{/each}
				</ul>
			  </td>
            </tr>
            <tr>
              <td class="first" colspan=2>
		<div class="win leaflet-popup-content-wrapper hidden" bind:this={evnCont}></div>
				<ul>
			{#each (prp.event_list || []) as pt1}
				<li class="link" on:click={showEvn} value={pt1}>Мероприятие</li>
			{/each}
				</ul>
			  </td>
            </tr>
		   </tbody>
		  </table>
		</div>
	  </div>

<style>
.win {
    position: absolute;
    min-width: 280px;
    left: 360px;
    top: 76px;
}
.hidden {
	display: none;
}
.mvsPopup .featureCont .first {
    max-width: 100px;
}

.mvsPopup .featureCont .first .link {
    cursor: pointer;
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