import { Component } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import StepsWrapper from "./StepsWrapper";
import "animate.css";
import "./App.css";
import constants from "./constants";
import AnimatedEmojies from "./tools/animatedEmojies";

let {
	steps: { SELECT_TOOL, SELECT_VIDEO },
	tools: { ANIMATED_EMOJIES, AR_STROKES, NEON_PACK, NEON_EYES, FACE_ELEMENTS },
} = constants;
class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			view: SELECT_VIDEO,

			stepInputs: {
				[SELECT_VIDEO]: { url: null },
			},
		};
	}
	moveTo = (nextStep = SELECT_VIDEO) => {
		this.setState({ view: nextStep });
	};
	onToolSelect = (selectedTool = {}) => {
		this.setState((istat) => ({
			stepInputs: {
				...istat.stepInputs,
				[SELECT_TOOL]: selectedTool,
			},
		}));

		this.moveTo(selectedTool.key);
	};
	onVideoSelect = (data) => {
		this.setState((istat) => ({
			stepInputs: {
				...istat.stepInputs,
				[SELECT_VIDEO]: data,
			},
		}));

		this.moveTo(SELECT_TOOL);
	};
	render() {
		return (
			<StepsWrapper>
				{this.state.view === SELECT_VIDEO ? <Step1 onVideoSelect={this.onVideoSelect} /> : null}
				{this.state.view === SELECT_TOOL ? <Step2 moveTo={this.moveTo} stepInputs={this.state.stepInputs} onToolSelect={this.onToolSelect} /> : null}
				{[ANIMATED_EMOJIES, AR_STROKES, NEON_PACK, NEON_EYES, FACE_ELEMENTS].includes(this.state.view) ? <AnimatedEmojies moveTo={this.moveTo} stepInputs={this.state.stepInputs} /> : null}
			</StepsWrapper>
		);
	}
}

export default App;
