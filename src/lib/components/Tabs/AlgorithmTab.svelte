<script>
	import {
		wait,
		reset,
		forward,
		back,
		setCloseInstruction,
		setOpenInstruction,
		swapAlgorithm,
		skipToEnd,
		goToStep,
		setTab
	} from '$lib/flowControl';
	import Code from '@/Layout/Code.svelte';
	import FillSize from '@/Layout/FillSize.svelte';
	import ClipboardTextIcon from '@icons/ClipboardTextIcon.svelte';
	import DocIcon from '@icons/DocIcon.svelte';
	import PlayIcon from '@icons/PlayIcon.svelte';
	import PlaySkipBackIcon from '@icons/PlaySkipBackIcon.svelte';
	import PlaySkipForwardIcon from '@icons/PlaySkipForwardIcon.svelte';
	import RestartIcon from '@icons/RestartIcon.svelte';
	import ResultText from '@/Layout/ResultText.svelte';
	import Info from '@/Layout/Info.svelte';
	import InputStringIcon from '@icons/InputStringIcon.svelte';
	import InfoIcon from '@icons/InfoIcon.svelte';
	import ParseView from '@/Tabs/ParseView.svelte';
	import ForwardIcon from '@icons/ForwardIcon.svelte';
	import { isGrammarLoaded } from '$lib/utils';
	import { setUpTooltip } from '@/Layout/tooltip.svelte.js';
	import { appendData } from '$lib/log';
	import { colors } from '$lib/selectSymbol';

	/**@type {{
	 * code: string,
	 * id: string,
	 * tabId: string,
	 * parseId: string,
	 * instruction?: string,
	 * class?: string,
	 * limit?: boolean,
	 * results: import('@/types').ResultsTabItem[],
	 * steps: any,
	 * tree: any,
	 * parse: any,
	 * currentInfo: ConstructorOfATypedSvelteComponent,
	 * parseInfo: ConstructorOfATypedSvelteComponent}}*/
	let {
		code,
		tabId,
		id = $bindable(),
		parseId,
		instruction = $bindable(),
		limit = $bindable(),
		...props
	} = $props();

	let animIn = 'rotA 0.5s';
	let animOut = 'rotD 0.5s forwards';
	let animation = $state(animIn);
	let parseOn = $state(false);
	let maxStep = $state(0);
	let isPlaying = $state(false);
	let currentStep = $state(0);

	setTab(tabId, {
		setIsPlaying: (/** @type {boolean} */ value) => {
			isPlaying = value;
		},
		setMaxStep: (step) => {
			const elem = /**@type {HTMLElement}*/ (document.querySelector(`input#${tabId}-step`));
			if (elem) {
				setUpTooltip(elem, {
					text: `Digite o número do passo entre ${0} e ${step}`,
					willRemove: true,
					hue: colors.blue,
					id: 0
				});
			}
			maxStep = step;
		},
		setCurrentStep: (step) => {
			currentStep = step;
		}
	});

	let currentId = $state(id);
	limit ??= false;

	instruction ??= '';
	/** @param {string} name */
	async function updateSelected(name) {
		appendData(`open popup, ${name}`);
		animation = '';
		await wait(id, 10);

		animation = animIn;
		selected = name;
	}

	let scale = $state(0.5);
	let opacity = $state(0);
	let pos = $state(50);
	let contentPos = $state(-50);
	let contentOpacity = $state(0);

	async function closePopup() {
		appendData(`close popup, ${selected}`);
		animation = animOut;

		await wait(id, 500);
		selected = 'noPopup';
	}

	export async function openInstruction() {
		try {
			// scale = 1;
			// opacity = 1;
			// pos = 0;
			// await wait(id, 200);
			// contentOpacity = 1;
			// contentPos = 0;
			// await wait(id, 300);
		} catch {}
	}

	export async function closeInstruction() {
		try {
			contentOpacity = 0;
			contentPos = 50;

			await wait(id, 100);

			scale = 0.5;
			opacity = 0;
			pos = 50;
			await wait(id, 300);
		} catch {}
	}

	function goToStepSubmit() {
		const elem = /**@type {HTMLInputElement}*/ (document.querySelector(`input#${tabId}-step`));
		let step = parseInt(elem.value);
		if (isNaN(step)) {
			step = 0;
		}
		if (step > maxStep) {
			step = maxStep;
		}
		if (step < 0) {
			step = 0;
		}
		elem.value = step.toString();
		goToStep(id, step);
	}

	setCloseInstruction(closeInstruction);
	setOpenInstruction(openInstruction);

	let selected = $state('noPopup');
	let isAnim = $state(false);
	$effect(() => {
		isAnim = selected === 'noPopup';
	});
	let parseLoaded = $state(false);
</script>

<FillSize class="contents unit">
	{#snippet content()}
		<div class="controls-box">
			<div class="controls">
				<!-- <button
					use:setUpTooltip={{ id: 0,text: 'Código' }}
					class="popup-button"
					onclick={() => updateSelected('code')}
					disabled={selected == 'code'}
				>
					<CodeIcon color="hsl(100,50%,100%)" strokeWidth={3}></CodeIcon>
				</button> -->
				<button
					use:setUpTooltip={{ id: 0, text: 'Copiar resultados como texto' }}
					class="popup-button"
					onclick={() => updateSelected('text')}
					disabled={selected == 'text'}
				>
					<ClipboardTextIcon color="hsl(100,50%,100%)" strokeWidth={3}></ClipboardTextIcon>
				</button>
				<button
					use:setUpTooltip={{ id: 0, text: 'Informações sobre o algoritmo' }}
					class="popup-button"
					onclick={() => updateSelected('info')}
					disabled={selected == 'info'}
				>
					<DocIcon color="hsl(100,50%,100%)" strokeWidth={3}></DocIcon>
				</button>
				<button
					use:setUpTooltip={{ id: 0, hue: colors.green, text: 'Analisar string de entrada' }}
					class="view-button"
					onclick={() => {
						currentId = id;
						id = parseId;
						parseLoaded = true;
						appendData(`open parse,${id}`);
						swapAlgorithm(id, props.parseInfo, tabId);
						parseOn = true;
						closePopup();
					}}
					disabled={parseOn}
				>
					<InputStringIcon color="hsl(100,50%,100%)" strokeWidth={3}></InputStringIcon>
				</button>
				<button
					use:setUpTooltip={{ id: 0, hue: colors.green, text: 'Executar construção do parser' }}
					class="view-button"
					onclick={() => {
						parseOn = false;
						id = currentId;
						appendData(`close parse,${id}`);
						swapAlgorithm(id, props.currentInfo, tabId);
						closePopup();
					}}
					disabled={!parseOn}
				>
					<PlayIcon color="hsl(100,50%,100%)" strokeWidth={3}></PlayIcon>
				</button>
			</div>

			<div class="flow-controls controls">
				<div style="display: flex;gap: 10px;">
					<button
						use:setUpTooltip={{ id: 0, text: 'Ir para passo especificado' }}
						onclick={goToStepSubmit}
						style="padding: 0 5px;color: white">Ir</button
					>
					<input
						onsubmit={goToStepSubmit}
						onkeypress={(e) => {
							if (e.key === 'Enter') goToStepSubmit();
						}}
						placeholder="Passo"
						style="border-radius: 5px; min-width: 50px; padding: 0 5px; outline: none; border: 2px solid hsl(0, 0%, 50%);"
						type="number"
						id="{tabId}-step"
						name="step"
						min="0"
						max={maxStep}
						value={currentStep}
					/>
				</div>
				<button use:setUpTooltip={{ id: 0, text: 'Passo Anterior' }} onclick={() => back(`${id}`)}>
					<PlaySkipBackIcon color="hsl(200,60%,100%)" size={15} strokeWidth={3} />
				</button>
				<button use:setUpTooltip={{ id: 0, text: 'Reiniciar' }} onclick={() => reset(`${id}`)}>
					<RestartIcon color="hsl(200,60%,100%)" size={15} strokeWidth={3}></RestartIcon>
				</button>
				<button
					use:setUpTooltip={{ id: 0, text: 'Próximo passo' }}
					disabled={currentStep >= maxStep}
					onclick={() => forward(`${id}`)}
				>
					{#if isPlaying}
						<PlaySkipForwardIcon color="hsl(200,60%,100%)" size={15} strokeWidth={3} />
					{:else}
						<PlayIcon color="hsl(200,60%,100%)" size={15} strokeWidth={3}></PlayIcon>
					{/if}
				</button>
				<button
					use:setUpTooltip={{ id: 0, text: 'Pular para o final' }}
					disabled={currentStep >= maxStep}
					onclick={() => skipToEnd(`${id}`)}
				>
					<ForwardIcon color="hsl(200,60%,100%)" size={15} strokeWidth={3}></ForwardIcon>
				</button>
			</div>
		</div>
		{#if isGrammarLoaded()}
			<FillSize id="wrapper" class="grid maxWidth">
				{#snippet content()}
					<div class="grid unit" style="height: inherit;max-width: inherit;z-index: 1">
						{#if parseLoaded}
							<ParseView {id} class="unit {parseOn ? 'not-hidden' : 'hidden'}">
								{#snippet tree()}
									{@render props.tree()}
								{/snippet}
								{#snippet parse()}
									{@render props.parse()}
								{/snippet}
							</ParseView>
						{/if}

						<div class="steps unit {parseOn ? 'hidden' : 'not-hidden'} {props.class ?? ''}">
							{@render props.steps()}
						</div>
					</div>
					<div
						class="popup unit"
						style="animation: {animation}; display:{isAnim ? 'none' : 'flex'};height:inherit;"
					>
						{#if selected === 'code'}
							<Code {code} onClose={closePopup}></Code>
						{:else if selected === 'text'}
							<ResultText results={props.results} onClose={closePopup}></ResultText>
						{:else if selected === 'info'}
							<Info onClose={closePopup}></Info>
						{/if}
					</div>
					<div class="unit instruction-box">
						<div
							class="instruction"
							style="opacity: {opacity};transform: translate(0, {pos}px) scale({scale})"
						>
							<div
								class="instruction-content"
								style="transform:translate(0, {contentPos}px);opacity: {contentOpacity}"
							>
								<InfoIcon
									color="hsl(200, 70%,40%)"
									strokeWidth={3}
									size={18}
									style="top: 4px;position: relative;"
								></InfoIcon>
								<span style="height: 18px;">{instruction}</span>
							</div>
						</div>
					</div>
				{/snippet}
			</FillSize>
		{:else}
			None
		{/if}
	{/snippet}
</FillSize>

<style>
	:global(.popup) {
		z-index: 2;
	}
	:global(.contents) {
		display: flex;
		justify-content: start;
		align-items: start;
		flex-direction: column;
	}

	:global(.instruction-box) {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		pointer-events: none;
		height: inherit;
	}

	.instruction {
		background: white;
		border-radius: 10px;
		box-shadow: 0px 0px 10px 0px hsl(0, 0%, 0%, 20%);
		padding: 5px 10px;
		z-index: 1;
		overflow: hidden;
		transition: all 0.3s;
		font-size: 12px;
		border: 1px solid hsl(200, 60%, 60%);
		pointer-events: visible;
	}

	.instruction-content {
		transition: all 0.1s;
		position: relative;
		top: -3px;
	}

	.controls-box {
		display: flex;
		gap: 10px;
		margin: 5px;
		justify-content: space-between;
		min-height: fit-content;
		flex-wrap: wrap;
		width: 100%;
		width: -webkit-fill-available;
		width: -moz-available;
	}

	.controls {
		display: flex;
		gap: 10px;
		height: fit-content;
	}

	.flow-controls {
		justify-content: center;
	}

	.steps {
		display: flex;
		justify-content: start;
		align-items: center;
		flex-wrap: wrap;
		flex-direction: column;
		max-width: inherit;
		height: inherit;
		border: 1px solid hsl(0, 0%, 0%, 20%);
		border-radius: 10px;
		overflow: auto;
	}

	:global(#wrapper > .grid > div) {
		position: relative;
	}

	:global(.steps > div) {
		margin-top: 5px;
	}

	button {
		box-shadow: 0px 0px 5px 0px hsl(200, 100%, 40%, 30%);
		border: 1px solid hsl(200, 60%, 40%);
		background: hsl(200, 100%, 45%);
		transition:
			filter 0.5s,
			scale 0.1s,
			background 0.5s;
		scale: 1;
	}

	.view-button {
		box-shadow: 0px 0px 5px 0px hsl(100, 100%, 40%, 30%);
		border: 1px solid hsl(100, 60%, 40%);
		background: hsl(100, 60%, 45%);
	}
	button:active {
		transform: scale(1.2);
	}
	button:disabled {
		transform: scale(1);
		background: hsl(200, 50%, 70%);
	}
	.view-button:disabled {
		background: hsl(100, 50%, 70%);
	}
</style>
