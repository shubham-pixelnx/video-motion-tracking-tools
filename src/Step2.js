import { Component } from "react";

const PLAY = "PLAY";
const PAUSE = "PAUSE";

const videos = [
	{
		url: "https://i.gyazo.com/a97a0e806f41ed2dcbaa08db34623297.mp4",
		label: "Add Animated Emojies 🤩",
		sublabel: "This will auto-detect the face and lets you select the emoji to add.",
	},
	{
		url: "https://i.gyazo.com/9b85242344ab6bdb5f193b5f06fe340a.mp4",
		label: "Cool Elements 🕶",
		sublabel: "Add cool elements such as sunglasses, funky hairs, etc. to the face in the video.",
	},
	{
		url: "https://i.gyazo.com/a97a0e806f41ed2dcbaa08db34623297.mp4",
		label: "Neon to the Eyes 🕶",
		sublabel: "Add shiny neon to the eye.",
	},
	{
		url: "https://cdn.wedios.co/mt.wedios.co/roller-skating-boy.mp4",
	},
];

class Step2 extends Component {
	constructor(props) {
		super(props);
		console.log(props);
	}
	handleVideoInside = (parentElement = null, action = PAUSE) => {
		if (!parentElement) {
			return;
		}
		let targetVideoTag = parentElement.querySelector("video");
		if (!targetVideoTag) {
			console.log("No video tag inside", parentElement);
		}
		if (action === PLAY) {
			targetVideoTag.play();
		} else if (action === PAUSE) {
			targetVideoTag.pause();
		}
	};
	render() {
		return (
			<section className="steps step1 animate__animated animate__fadeIn">
				<h1 className="">Select Tool</h1>

				<h3 className="">&rarr; Ideal for face videos</h3>
				<div className="videoList">
					{videos.map((vid, index) => {
						return (
							<div
								onMouseOver={(e) => {
									this.handleVideoInside(e.currentTarget, PLAY);
								}}
								onMouseOut={(e) => {
									this.handleVideoInside(e.currentTarget, PAUSE);
								}}
								className="videoListItem noHover"
								onClick={(e) => {
									this.props.onToolSelect({
										...vid,
									});
								}}
								key={index}
							>
								<video muted loop src={vid.url}></video>
								<p className="label" style={{ paddingBottom: vid.sublabel ? "0px" : "1rem" }}>
									{vid.label}
								</p>
								{vid.sublabel ? <p className="sub-label">{vid.sublabel}</p> : null}
							</div>
						);
					})}
				</div>

				<h3 className="">&rarr; Ideal for any object highlighting.</h3>
			</section>
		);
	}
}

export default Step2;
