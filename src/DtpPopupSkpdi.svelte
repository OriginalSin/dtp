<script>
	import { afterUpdate } from 'svelte';
	import Modal from './Modal.svelte';
	import DtpPopup from './DtpPopupEvnt.svelte';

	export let showModal = false;

	export let prp;
	let modal;

	let disabled = prp.files && prp.files.length ? '' : 'disabled';
	let evnCont;
   const showEvn = (ev) => {
		let id = ev.target.value;
		evnCont.innerHTML = '';

		let url = 'https://dtp.mvs.group/scripts/events_dev/get_event_id_' + id + '.txt';
		fetch(url, {})
			.then(req => req.json())
			.then(json => {
				const app = new DtpPopup({
					target: evnCont,
					props: {
						prp: json[0]
					}
				});
			});

	};

	afterUpdate(() => {
		// console.log('the component just updated', showModal, modal);
		disabled = prp.files && prp.files.length ? '' : 'disabled';
		if (showModal) {
			modal = new Modal({
				target: document.body,
				props: {
					data: prp.files
				}
			});
			modal.$on('close', (ev) => {
				modal.$destroy();
				showModal = false;
			});
		}
	});
    const copyParent = (ev) => {
		navigator.clipboard.writeText(ev.target.parentNode.textContent).catch(err => {
			console.log('Something went wrong', err);
		});
	};

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
			  <td>{prp.id || prp.id_stat || prp.id_skpdi || ''}</td>
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
			  <td colSpan="2">
				<div class="first">Условия ДТП:</div>
				<div>{prp.collision_context || prp.dtp_date || ''}</div>
			  </td>
			</tr>
            <tr>
              <td class="first">Нарушения:</td>
              <td>
				<ul>
					{#if prp.collisionTypes && prp.collisionTypes.length}
					{#each prp.collisionTypes as pt}
					<li>{pt.collisionType || ''}</li>
					{/each}
					{/if}
				</ul>
			  </td>
            </tr>
            <tr>
              <td class="first">Участники:</td>
              <td>
				<ul>
					{#if prp.uchs && prp.uchs.length}
					{#each prp.uchs as pt}
					<li>{pt.collisionPartyCategory || ''} <b><i>({pt.collisionPartyCond || ''})</i></b></li>
					{/each}
					{/if}
				</ul>
			  </td>
            </tr>
            <tr>
              <td class="first" colspan=2>
		<div class="win leaflet-popup-content-wrapper " bind:this={evnCont}></div>
				<ul>
			{#each (prp.event_list || []) as pt1}
				<li class="link" on:click={showEvn} value={pt1}>Мероприятие</li>
			{/each}
				</ul>
			  </td>
            </tr>

			<tr>
			  <td class="center" colSpan="2">
				<button class="primary" on:click={() => showModal = true} {disabled}>Фото и схемы</button>
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
.link {
    cursor: pointer;
}

</style>