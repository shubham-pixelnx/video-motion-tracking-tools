import { Component } from "react";
import constants from "../constants";
let {
	steps: { SELECT_VIDEO },
} = constants;

const emojiesList = [
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/01-Eyes%20only_1.webm/final.webm",
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/04-Grin%203_1.webm/final.webm",
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/07-Smile_1.webm/final.webm",
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/09-Sad%201_1.webm/final.webm",
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/16-Surprised%20raised%20brows_1.webm/final.webm",
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/21-Angry%202_1.webm/final.webm",
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/25-Wink_1.webm/final.webm",
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/46-Angel_1.webm/final.webm",
	},
];

class AnimatedEmojies extends Component {
	constructor(props) {
		super(props);
		this.state = {
			faceData: {},
		};
	}
	render() {
		return (
			<section className="steps animatedEmojies animate__animated animate__fadeIn">
				<h2 className="ta-c">Animated Emojies 😎</h2>
				<div className="player">
					<video style={{ width: "100%" }} src={this.props.stepInputs[SELECT_VIDEO].url}></video>
					<div className="playerFooter">
						<div className="playPause">
							<button>Play</button>
						</div>
						<div className="progressWrapper">
							<div className="progressFillWrapper">
								<div className="progressFill" style={{ width: "35.5296%" }}></div>
								<div className="seeker" style={{ left: "35.5296%" }}></div>
								<div data-move="both" className="modifiedPart" style={{ left: "21.7305%", width: "45.76%" }}></div>
								<div data-move="start" className="mdfStart" style={{ left: "21.7305%" }}></div>
								<div data-move="end" className="mdfEnd" style={{ left: "67.4905%" }}></div>
							</div>
						</div>
						<div className="playerMeta">
							<span>3.6/10.2s</span>
						</div>
					</div>
				</div>
				<div className="assetsList">
					{emojiesList.map((emojiData, index) => {
						return (
							<div className={"assetWrapper".concat(index === 0 ? " active" : "")} key={index}>
								<video autoPlay loop muted src={emojiData.url}></video>
							</div>
						);
					})}
				</div>
			</section>
		);
	}
}

export default AnimatedEmojies;
