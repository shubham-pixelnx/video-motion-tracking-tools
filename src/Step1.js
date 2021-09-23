import { Component } from "react";

const PLAY = "PLAY";
const PAUSE = "PAUSE";

const videos = [
	{
		url: "https://cdn.wedios.co/mt.wedios.co/myvideo.mp4",
		sublabel: "footage for hand movements tracking.",
	},
	{
		url: "https://cdn.wedios.co/mt.wedios.co/vehicle-video.mp4",
		sublabel: "footage for AR Strokes.",
	},
	{
		url: "https://cdn.wedios.co/mt.wedios.co/man-with-glasses-in-office.mp4",
		sublabel: "footage for neon in the eyes.",
	},
	{
		url: "https://cdn.wedios.co/mt.wedios.co/roller-skating-boy.mp4",
		sublabel: "footage for object motion tracking.",
	},
];

class Step1 extends Component {
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
			<section className="steps step1 animate__animated animate__zoomIn">
				<h1 className="">Select Video</h1>
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
								className="videoListItem"
								onClick={(e) => {
									this.props.onVideoSelect({
										...vid,
									});
								}}
								key={index}
							>
								<video muted loop src={vid.url}></video>
								<p className="label">{new URL(vid.url).pathname.split("/").pop()}</p>
								{vid.sublabel ? <p className="sub-label">{vid.sublabel}</p> : null}
							</div>
						);
					})}
				</div>
			</section>
		);
	}
}

export default Step1;
