import { Component } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import StepsWrapper from "./StepsWrapper";
import "animate.css";
import "./App.css";

const steps = {
	SELECT_VIDEO: "SELECT_VIDEO",
	SELECT_TOOL: "SELECT_TOOL",
	TOOL_SCREEN: "TOOL_SCREEN",
};
class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step: steps.SELECT_VIDEO,

			stepInputs: {
				[steps.SELECT_VIDEO]: { url: null },
			},
		};

		this.StepComponents = {
			[steps.SELECT_VIDEO]: <Step1 onVideoSelect={this.onVideoSelect} />,
			[steps.SELECT_TOOL]: <Step2 stepInputs={this.state.stepInputs} onToolSelect={this.onToolSelect} />,
		};
	}
	moveTo = (nextStep = steps.SELECT_VIDEO) => {
		this.setState({ step: nextStep });
	};
	onToolSelect = (selectedTool = {}) => {
		console.log("Selected tool", selectedTool);
	};
	onVideoSelect = (data) => {
		this.setState((istat) => ({
			stepInputs: {
				...istat.stepInputs,
				[steps.SELECT_VIDEO]: data,
			},
		}));

		this.moveTo(steps.SELECT_TOOL);
	};
	render() {
		return <StepsWrapper>{this.StepComponents[this.state.step]}</StepsWrapper>;
	}
}

export default App;
