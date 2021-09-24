import { Component, createRef } from "react";
import constants from "../constants";

import * as faceapi from "face-api.js";

let {
	steps: { SELECT_VIDEO },
} = constants;

const commonEmojiStyles = {
	transform: "translate(-50%,-70%)",
	height: "120%",
};

const emojiesList = [
	{
		url: "https://cdn.wedios.co/mt.wedios.co/neon-pack-picks/Mask%201.webm",
		styles: {
			transform: "translate(-50%,-60%)",
		},
	},
	{
		url: "https://cdn.wedios.co/mt.wedios.co/neon-pack-picks/Hat%2002.webm",
		styles: {
			transform: "translate(-50%,-150%)",
		},
	},
	{
		url: "https://cdn.wedios.co/mt.wedios.co/neon-pack-picks/Hat 10.webm",
		styles: {
			transform: "translate(-50%,-120%)",
			height: "150%",
		},
	},
	{
		url: "https://cdn.wedios.co/mt.wedios.co/neon-pack-picks/Sunglass 01.webm",
		styles: {
			transform: "translate(-50%,-95%)",
			height: "50%",
		},
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/17-Surprised_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/01-Eyes%20only_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/43-Eyes%20Up_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/57-Sunglasses_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/66-Geek_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/04-Grin%203_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/07-Smile_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/09-Sad%201_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/16-Surprised%20raised%20brows_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/21-Angry%202_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/25-Wink_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
	{
		url: "https://cdn.wedios.co/assets/weffects/Emoji/46-Angel_1.webm/final.webm",
		styles: { ...commonEmojiStyles },
	},
];

class AnimatedEmojies extends Component {
	constructor(props) {
		super(props);
		this.state = {
			faceData: {},
			selectedEmoji: emojiesList[0],
			faceCam: false,
		};
		this.videoTag = createRef();
		this.canvasTag = createRef();
		this.selectedEmoji = createRef();

		this.logDetectionData = false;
		this.detectorOptions = {};
		this.displaySize = { width: 1036, height: 582 };
	}
	loadScript = (url) => {
		return new Promise((resolve, reject) => {
			if (!document) {
				console.error("document is not availble!!");
				resolve();
				return;
			}
			let scriptTag = document.createElement("script");
			let bodyTag = document.querySelector("body");
			scriptTag.src = url;
			bodyTag.appendChild(scriptTag);
			scriptTag.addEventListener("load", () => {
				resolve();
			});
			scriptTag.addEventListener("error", (err) => {
				console.log(err);
				resolve();
			});
		});
	};
	componentDidMount() {
		// with tracking js
		/* (async () => {
			await this.loadScript("https://trackingjs.com/bower/tracking.js/build/tracking-min.js");
			await this.loadScript("https://trackingjs.com/bower/tracking.js/build/data/face-min.js");
			console.log("Scripts loaded");
			this.initTracker();
		})(); */

		// with face api - js
		window.faceapi = faceapi;
		Promise.all([
			faceapi.nets.tinyFaceDetector.loadFromUri("/face-api-models"),
			// faceapi.nets.faceLandmark68Net.loadFromUri("/face-api-models"),
			// faceapi.nets.faceRecognitionNet.loadFromUri("/face-api-models"),
			// faceapi.nets.faceExpressionNet.loadFromUri("/face-api-models"),
		]).then(this.initFaceApi);
	}
	detectFaceAndSync = async () => {
		let video = this.videoTag.current;
		// let canvas = this.canvasTag.current;
		if (!video) {
			console.warn("Video element doesn't exists!");
			setTimeout(() => this.detectFaceAndSync());
			return;
		}

		const detections = await faceapi.detectSingleFace(video, this.detectorOptions); /* .withFaceLandmarks().withFaceExpressions() */
		let emojiDiv = this.selectedEmoji.current;
		if (!detections) {
			console.log("No detections");
			emojiDiv && (emojiDiv.style.display = "none");
			setTimeout(() => this.detectFaceAndSync());
			return;
		}
		emojiDiv && (emojiDiv.style.display = "block");

		const resizedDetections = faceapi.resizeResults(detections, this.displaySize);
		// canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

		if (this.logDetectionData) {
			console.log("resizedDetections", resizedDetections);
		}

		console.log("Working!!", resizedDetections.box.y);
		emojiDiv &&
			Object.assign(emojiDiv.style, {
				top: `${resizedDetections.box.y}px`,
				left: `${resizedDetections.box.x}px`,
				width: `${resizedDetections.box.width}px`,
				height: `${resizedDetections.box.height}px`,
			});

		// faceapi.draw.drawDetections(canvas, resizedDetections);
		// faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
		// faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

		setTimeout(() => this.detectFaceAndSync());
	};
	initFaceApi = async () => {
		let video = this.videoTag.current;
		let canvas = this.canvasTag.current;

		if (this.state.faceCam) {
			let stream = await window.navigator.mediaDevices.getUserMedia({ video: true }).catch(console.log);
			video.srcObject = stream;
		} else {
			let blob = await fetch(video.src).then((e) => e.blob());
			let url = URL.createObjectURL(blob);
			video.src = url;
		}

		// const canvas = faceapi.createCanvasFromMedia(video);
		// document.body.append(canvas);
		this.detectorOptions = new faceapi.TinyFaceDetectorOptions({
			scoreThreshold: 0.5,

			// size at which image is processed, the smaller the faster,
			// but less precise in detecting smaller faces, must be divisible
			// by 32, common sizes are 128, 160, 224, 320, 416, 512, 608,
			// for face tracking via webcam I would recommend using smaller sizes,
			// e.g. 128, 160, for detecting smaller faces use larger sizes, e.g. 512, 608
			// default: 416
			inputSize: 416,
		});
		faceapi.matchDimensions(canvas, this.displaySize);

		video.play().then(() => {
			this.detectFaceAndSync();
			if (video.dataset.eventsapplied !== "true") {
				video.addEventListener("play", () => {
					console.log("on play triggered");
					this.detectFaceAndSync();
				});
				video.dataset.eventsapplied = "true";
			}
		});
	};

	initTracker = async () => {
		let video = this.videoTag.current;
		// console.log(video.src);
		// let blob = await fetch(video.src).then((e) => e.blob());
		// let url = URL.createObjectURL(blob);
		// video.src = url;
		let stream = await window.navigator.mediaDevices.getUserMedia({ video: true }).catch(console.log);
		console.log(stream);
		video.srcObject = stream;
		video.play();

		let canvas = this.canvasTag.current;
		let context = canvas.getContext("2d");

		let tracker = new window.tracking.ObjectTracker("face");
		tracker.setInitialScale(4);
		tracker.setStepSize(2);
		tracker.setEdgesDensity(0.1);

		window.tracking.track("#video", tracker);

		tracker.on("track", function (event) {
			context.clearRect(0, 0, canvas.width, canvas.height);

			event.data.forEach(function (rect) {
				context.strokeStyle = "#a64ceb";
				context.strokeRect(rect.x, rect.y, rect.width, rect.height);
				context.font = "11px Helvetica";
				context.fillStyle = "#fff";
				context.fillText("x: " + rect.x + "px", rect.x + rect.width + 5, rect.y + 11);
				context.fillText("y: " + rect.y + "px", rect.x + rect.width + 5, rect.y + 22);
			});
		});
	};
	render() {
		return (
			<section className="steps animatedEmojies animate__animated animate__fadeIn">
				<h2 className="ta-c">Animated Emojies 😎</h2>
				<div className="player">
					<div className="stream">
						<video muted loop id="video" className="backgroundVideo" ref={this.videoTag} style={{ width: "100%" }} src={this.props.stepInputs[SELECT_VIDEO].url}></video>
						<canvas ref={this.canvasTag} id="canvas" width="1036" height="582"></canvas>
						<div className="selectedEmoji" ref={this.selectedEmoji}>
							<video style={{ ...(this.state.selectedEmoji.styles || {}) }} autoPlay muted loop src={this.state.selectedEmoji.url}></video>
						</div>
					</div>
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
							<div
								onClick={() => {
									this.setState({
										selectedEmoji: emojiData,
									});
								}}
								className={"assetWrapper".concat(this.state.selectedEmoji.url === emojiData.url ? " active" : "")}
								key={index}
							>
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
