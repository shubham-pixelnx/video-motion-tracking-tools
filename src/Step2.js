import { Fragment } from "react";
import { Component } from "react";
import constants from "./constants";

let {
	steps: { SELECT_VIDEO },
	videoActions: { PLAY, PAUSE },
	toolGroups: { FACE_TOOLS, OBJECT_MOTION },
	tools: { ANIMATED_EMOJIES, FACE_ELEMENTS, NEON_EYES, AR_STROKES, NEON_PACK },
} = constants;
const tools = [
	{
		key: ANIMATED_EMOJIES,
		url: "https://i.gyazo.com/a97a0e806f41ed2dcbaa08db34623297.mp4",
		label: "Add Animated Emojies 🤩",
		sublabel: "This will auto-detect the face and lets you select the emoji to add.",
		group: FACE_TOOLS,
	},
	{
		key: FACE_ELEMENTS,
		url: "https://i.gyazo.com/9b85242344ab6bdb5f193b5f06fe340a.mp4",
		label: "Cool Elements 🕶",
		sublabel: "Add cool elements such as sunglasses, funky hairs, etc. to the face in the video.",
		group: FACE_TOOLS,
	},
	{
		key: NEON_EYES,
		url: "https://i.gyazo.com/a97a0e806f41ed2dcbaa08db34623297.mp4",
		label: "Neon to the Eyes 🕶",
		sublabel: "Add shiny neon to the eye.",
		group: FACE_TOOLS,
	},
	{
		key: AR_STROKES,
		url: "https://cdn.wedios.co/mt.wedios.co/vehicle-video.mp4",
		label: "AR Strokes",
		sublabel: "Animated neon strokes around any object you draw.",
		group: OBJECT_MOTION,
	},
	{
		key: NEON_PACK,
		url: "https://previews.customer.envatousercontent.com/h264-video-previews/2b47b014-460b-4f9c-9236-a9fe497e7402/2874681.mp4",
		label: "Neon Pack",
		sublabel: "Super cool neon elements over your objects.",
		group: OBJECT_MOTION,
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
			// console.log("No video tag inside", parentElement);
			return;
		}
		if (action === PLAY) {
			targetVideoTag.play();
		} else if (action === PAUSE) {
			targetVideoTag.pause();
		}
	};
	render() {
		return (
			<section className="steps step2 animate__animated animate__fadeIn">
				<h1>Select Tool</h1>
				<div className="note">
					<span>
						Selected Video &rarr; <b> {this.props.stepInputs[SELECT_VIDEO].url || "Unknown"}</b>
					</span>
					<button
						onClick={() => {
							this.props.moveTo(SELECT_VIDEO);
						}}
					>
						Change
					</button>
				</div>

				{[FACE_TOOLS, OBJECT_MOTION].map((group) => {
					let title = "";
					if (group === FACE_TOOLS) {
						title = "Ideal for video having face in it.";
					} else if (group === OBJECT_MOTION) {
						title = "To apply elements/effects on moving objects.";
					}
					return (
						<Fragment key={group}>
							<h3 className="listGroupHeading">&rarr; {title}</h3>
							<div className="videoList">
								{[...tools.filter((tool) => tool.group === group)].map((tool, index) => {
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
													...tool,
												});
											}}
											key={index}
										>
											<video /* poster="https://imgur.com/ZOnnUmq.png" */ muted loop src={tool.url}></video>
											<p className="label" style={{ paddingBottom: tool.sublabel ? "0px" : "1rem" }}>
												{tool.label}
											</p>
											{tool.sublabel ? <p className="sub-label">{tool.sublabel}</p> : null}
										</div>
									);
								})}
							</div>
						</Fragment>
					);
				})}
			</section>
		);
	}
}

export default Step2;
