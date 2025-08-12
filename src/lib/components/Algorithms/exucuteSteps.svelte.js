import {
	addPause,
	setCurrentStep,
	setMaxStep,
	setOnInputChanged,
	setStepCall,
	currentAlgoId
} from '$lib/flowControl';
import { colors } from '$lib/selectSymbol';

export class StepExecution {
	/**@type {any} */
	functionCalls;
	/**@type {(any)[]} */
	saves;
	/**@type {{func: Function, breakpoints: ()=>number[]}[]} */
	highlightFuncs;
	/**@type {any} */
	functionsMap;
	/**@type {string} */
	id;
	stepChanged = $state(false);
	currentStep = $state(0);
	inputChanged = $state(false);
	lastSelected = 0;
	/**@type {(()=>number[])[]} */
	breakpoints = $state([]);
	setStepCallback;
	inputChangedCallback;

	/**
	 * @param {any[]} saves
	 * @param {any} functionCalls
	 * @param {{func: Function, breakpoints: ()=>number[]}[]} highlightFuncs
	 * @param {string} id
	 * @param {any} functionsMap
	 * @param {Function} setStepCallback
	 * @param {Function?} inputChangedCallback
	 */
	constructor(
		saves,
		functionCalls,
		highlightFuncs,
		functionsMap,
		id,
		setStepCallback,
		inputChangedCallback = null
	) {
		this.saves = saves;
		this.functionCalls = functionCalls;
		this.highlightFuncs = highlightFuncs;
		this.id = id;
		this.functionsMap = functionsMap;
		this.setStepCallback = setStepCallback;
		this.setStep = this.setStep.bind(this);
		this.executeSteps = this.executeSteps.bind(this);
		this.onInputChanged = this.onInputChanged.bind(this);
		this.inputChangedCallback = inputChangedCallback;

		setStepCall(this.setStep, saves.length - 1, id, () => this.currentStep);
		if (this.inputChangedCallback) setOnInputChanged(this.onInputChanged, this.id);
	}

	/**@param {number} step*/
	setStep(step) {
		if (this.lastSelected === step) return;
		const save = this.saves[step];
		if (save === undefined) {
			console.error(`Step ${step} not found`);
			return;
		}

		this.setStepCallback(save);
		this.currentStep = step;
		setCurrentStep(this.currentStep);
		this.stepChanged = true;
	}

	async executeSteps() {
		try {
			if (this.inputChangedCallback) this.onInputChanged();
			let i = 0;
			let lastI = -1;
			let count = 0;
			while (i < this.functionCalls.length || this.stepChanged) {
				if (this.inputChanged) {
					this.setStep(0);
					this.stepChanged = false;
					this.inputChanged = false;
					i = 0;
					continue;
				}
				if (this.stepChanged) {
					this.stepChanged = false;
					i = this.saves[this.currentStep].functionCall;
					continue;
				}
				const call = this.functionCalls[i];
				this.lastSelected = this.currentStep;
				try {
					for (let item of this.highlightFuncs) {
						if (
							call.name.includes('highlightLines') &&
							item.breakpoints().some((x) => call.args[0].includes(x))
						) {
							item.func()(call.args[0], colors.orange);
							await addPause(this.id);
						}
					}
					if (call.skip !== undefined) this.functionsMap[call.name]()(...call.args);
					else await this.functionsMap[call.name]()(...call.args);
				} catch (e) {
					if (lastI != i) {
						count = 1;
						lastI = i;
					} else {
						count++;
					}
					if (count > 3) {
						console.error(e);
						console.log(`${call.name}\n${call.args}`);
						break;
					}
					continue;
				}
				if (call.name === 'addPause') {
					this.currentStep++;
					setCurrentStep(this.currentStep);
				}
				i++;
			}
		} catch (e) {
			console.log(e);
		}
	}

	onInputChanged() {
		this.inputChangedCallback?.();
		setMaxStep(this.saves.length - 1, this.id);
		this.inputChanged = true;
	}
}
