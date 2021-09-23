import { Component, createRef } from "react";
import constants from "../constants";

import * as faceapi from "face-api.js";

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
			selectedEmojiSrc: emojiesList[0].url,
		};
		this.videoTag = createRef();
		this.canvasTag = createRef();
		this.selectedEmoji = createRef();
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
		window.faceapi = faceapi;
		Promise.all([
			faceapi.nets.tinyFaceDetector.loadFromUri("/face-api-models"),
			faceapi.nets.faceLandmark68Net.loadFromUri("/face-api-models"),
			faceapi.nets.faceRecognitionNet.loadFromUri("/face-api-models"),
			faceapi.nets.faceExpressionNet.loadFromUri("/face-api-models"),
		]).then(this.initFaceApi);
	}
	initFaceApi = async () => {
		let video = this.videoTag.current;
		let canvas = this.canvasTag.current;

		let stream = await window.navigator.mediaDevices.getUserMedia({ video: true }).catch(console.log);
		console.log(stream);
		video.srcObject = stream;

		/* video.addEventListener("play", () => {
		}); */
		setTimeout(() => {
			// const canvas = faceapi.createCanvasFromMedia(video);
			// document.body.append(canvas);
			console.log(video.width);
			const displaySize = { width: 1036, height: 582 };
			faceapi.matchDimensions(canvas, displaySize);
			// let detected = 0;
			/* let detectionInterval = */ setInterval(async () => {
				/* if (detected > 100) {
					clearInterval(detectionInterval);
					return;
				} */
				const detections = await faceapi.detectSingleFace(
					video,
					new faceapi.TinyFaceDetectorOptions({
						scoreThreshold: 0.5,
						inputSize: 224,
					})
				); /* .withFaceLandmarks().withFaceExpressions() */
				if (!detections) {
					return;
				}
				const resizedDetections = faceapi.resizeResults(detections, displaySize);
				canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
				// console.log("resizedDetections", resizedDetections);

				let emojiDiv = this.selectedEmoji.current;
				Object.assign(emojiDiv.style, {
					top: `${resizedDetections.box.y}px`,
					left: `${resizedDetections.box.x}px`,
					width: `${resizedDetections.box.width}px`,
					height: `${resizedDetections.box.height}px`,
				});

				// faceapi.draw.drawDetections(canvas, resizedDetections);
				// faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
				// faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
				// detected++;
			}, 35);
		}, 2000);
		video.play();
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
						<video id="video" className="backgroundVideo" ref={this.videoTag} style={{ width: "100%" }} src={this.props.stepInputs[SELECT_VIDEO].url}></video>
						<canvas ref={this.canvasTag} id="canvas" width="1036" height="582"></canvas>
						<div className="selectedEmoji" ref={this.selectedEmoji}>
							<video autoPlay muted loop src={this.state.selectedEmojiSrc}></video>
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
										selectedEmojiSrc: emojiData.url,
									});
								}}
								className={"assetWrapper".concat(index === 0 ? " active" : "")}
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
