import { Component } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import StepsWrapper from "./StepsWrapper";
import "animate.css";
import "./App.css";
import constants from "./constants";
import AnimatedEmojies from "./tools/animatedEmojies";
import NeonPack from "./tools/neonPack";

let {
	steps: { SELECT_TOOL, SELECT_VIDEO },
	tools: { ANIMATED_EMOJIES, AR_STROKES, NEON_PACK, NEON_EYES, FACE_ELEMENTS },
} = constants;
class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			view: SELECT_VIDEO,
			loader: false,
			stepInputs: {
				[SELECT_VIDEO]: { url: null },
			},
		};
	}
	showLoader = (show = true) => {
		this.setState({
			loader: show,
		});
	};
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
			<>
				{this.state.loader ? <div className="loading">Loading&#8230;</div> : null}
				<StepsWrapper>
					{this.state.view === SELECT_VIDEO ? <Step1 showLoader={this.showLoader} onVideoSelect={this.onVideoSelect} /> : null}

					{this.state.view === SELECT_TOOL ? <Step2 showLoader={this.showLoader} moveTo={this.moveTo} stepInputs={this.state.stepInputs} onToolSelect={this.onToolSelect} /> : null}

					{[ANIMATED_EMOJIES, FACE_ELEMENTS, NEON_EYES].includes(this.state.view) ? (
						<AnimatedEmojies showLoader={this.showLoader} moveTo={this.moveTo} stepInputs={this.state.stepInputs} />
					) : null}

					{[AR_STROKES, NEON_PACK].includes(this.state.view) ? <NeonPack showLoader={this.showLoader} moveTo={this.moveTo} stepInputs={this.state.stepInputs} /> : null}
				</StepsWrapper>
			</>
		);
	}
}

export default App;
