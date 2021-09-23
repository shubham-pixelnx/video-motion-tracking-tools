import { Component } from "react";

class StepsWrapper extends Component {
	render() {
		return <div className="stepsWrapper">{this.props.children}</div>;
	}
}

export default StepsWrapper;
