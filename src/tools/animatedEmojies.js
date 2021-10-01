import { Component, createRef } from "react";
import constants from "../constants";

let {
	steps: { SELECT_VIDEO },
} = constants;

const commonEmojiStyles = {
	transform: "translate(-50%,-50%)",
	height: "120%",
};

const emojiesList = [
	{
		url: "https://cdn.wedios.co/mt.wedios.co/neon-pack-picks/Mask%201.webm",
		styles: {
			transform: "translate(-50%,-50%)",
			height: "120%",
		},
	},
	{
		url: "https://cdn.wedios.co/mt.wedios.co/neon-pack-picks/Hat%2002.webm",
		styles: {
			transform: "translate(-50%,-120%)",
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
			transform: "translate(-50%,-55%)",
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
		this.detectionInstances = null;
		this.displaySize = { width: 1036, height: 582 };
	}
	componentDidMount() {
		// with opencv.js
		(async () => {
			await this.loadScript("/opencv.js");
			// opencv.js loaded
			window.cv.onRuntimeInitialized = () => {
				this.props.showLoader(false);
				this.initOpenCVFaceApi();
			};
		})();
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
	createFileFromUrl = function (path, url, callback) {
		let request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";
		request.onload = function (ev) {
			if (request.readyState === 4) {
				if (request.status === 200) {
					let data = new Uint8Array(request.response);
					window.cv.FS_createDataFile("/", path, data, true, false, false);
					callback();
				} else {
					console.log("Failed to load " + url + " status: " + request.status);
				}
			}
		};
		request.send();
	};
	initOpenCVFaceApi = async () => {
		this.props.showLoader();
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

		video.addEventListener("canplay", () => {
			video.width = 320;
			video.height = 180;
			this.scaleX = video.clientWidth / video.width;
			this.scaleY = video.clientHeight / video.height;
			canvas.width = video.width;
			canvas.height = video.height;

			this.faceCascadeFile = "haarcascade_frontalface_default.xml";
			this.eyeCascadeFile = "haarcascade_eye.xml";
			this.createFileFromUrl(this.faceCascadeFile, this.faceCascadeFile, () => {
				this.createFileFromUrl(this.eyeCascadeFile, this.eyeCascadeFile, () => {
					video.play().then(() => {
						this.startFaceDetection();
						if (video.dataset.eventsapplied !== "true") {
							video.addEventListener("play", () => {
								console.log("on play triggered");
								this.startFaceDetection();
							});
							video.dataset.eventsapplied = "true";
						}
					});
					this.props.showLoader(false);
				});
			});
		});
	};
	startFaceDetection = () => {
		console.log("startFaceDetection!!!");
		let cv = window.cv;
		let video = this.videoTag.current;
		console.log(video.height, video.width);
		let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
		let dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
		let gray = new cv.Mat();
		let cap = new cv.VideoCapture(video);
		let faces = new cv.RectVector();
		let eyes = new cv.RectVector();

		let faceCascade = new cv.CascadeClassifier();
		let eyeCascade = new cv.CascadeClassifier();

		// load pre-trained classifier
		faceCascade.load(this.faceCascadeFile);
		eyeCascade.load(this.eyeCascadeFile);

		const FPS = 30;
		this.detectionInstances = { video, src, dst, gray, cap, faces, eyes, faceCascade, eyeCascade, FPS };
		// schedule the first one.
		this.detectFaceAndSync();
	};
	detectFaceAndSync = () => {
		if (!this.detectionInstances) {
			alert("this.detectionInstances not available.");
			return;
		}
		let { video, src, dst, gray, cap, faces, eyes, faceCascade, eyeCascade, FPS } = this.detectionInstances;
		let emojiDiv = this.selectedEmoji.current;
		let cv = window.cv;
		try {
			if (video.paused || video.ended) {
				// clean and stop.
				src.delete();
				dst.delete();
				gray.delete();
				faces.delete();
				eyes.delete();
				faceCascade.delete();
				eyeCascade.delete();
				return;
			}
			let begin = Date.now();
			// start processing.
			cap.read(src);
			src.copyTo(dst);
			cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);

			// detect faces.
			faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0);

			if (faces.size() === 0) {
				console.log("No detections");
				emojiDiv && (emojiDiv.style.display = "none");
				window.requestAnimationFrame(this.detectFaceAndSync);
				return;
			}
			emojiDiv && (emojiDiv.style.display = "block");
			let firstFace = faces.get(0);

			let roiGray = gray.roi(firstFace);
			let roiSrc = dst.roi(firstFace);
			eyeCascade.detectMultiScale(roiGray, eyes);

			let rotation = 0; // deg

			if (eyes.size() === 2) {
				let leftEye = eyes.get(0);
				let rightEye = eyes.get(1);
				// console.log({ leftEye, rightEye });
				rotation = Math.atan((leftEye.y * this.scaleY - rightEye.y * this.scaleY) / (leftEye.x * this.scaleX - rightEye.x * this.scaleX));
				for (let j = 0; j < eyes.size(); j++) {
					let point1 = new cv.Point(eyes.get(j).x, eyes.get(j).y);
					let point2 = new cv.Point(eyes.get(j).x + eyes.get(j).width, eyes.get(j).y + eyes.get(j).height);
					cv.rectangle(roiSrc, point1, point2, [0, 255, 255, 255]);
				}
				cv.imshow(this.canvasTag.current, dst);
			}
			roiGray.delete();
			roiSrc.delete();

			// firstFace.x , firstFace.width, firstFace.y , firstFace.height
			// console.log("firstFace", firstFace);
			// console.log(`rotate(${rotation * (180 / Math.PI)}deg)`);
			emojiDiv &&
				Object.assign(emojiDiv.style, {
					top: `${firstFace.y * this.scaleY}px`,
					left: `${firstFace.x * this.scaleX}px`,
					width: `${firstFace.width * this.scaleX}px`,
					height: `${firstFace.height * this.scaleY}px`,
					...(rotation === 0 ? {} : { transform: `rotate(${rotation * (180 / Math.PI)}deg)` }),
				});

			// draw rectangle around faces and draw it on canvas
			/* for (let i = 0; i < faces.size(); ++i) {
				let face = faces.get(i);
				let point1 = new cv.Point(face.x, face.y);
				let point2 = new cv.Point(face.x + face.width, face.y + face.height);
				cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
			}
			cv.imshow(this.canvasTag.current, dst); */

			// schedule the next one.
			let delay = 1000 / FPS - (Date.now() - begin);
			setTimeout(this.detectFaceAndSync, delay);
			// window.requestAnimationFrame(this.detectFaceAndSync);
		} catch (err) {
			console.log("err", err);
		}
	};
	render() {
		return (
			<section className="steps animatedEmojies animate__animated animate__fadeIn">
				<h2 className="ta-c">Animated Emojies 😎</h2>
				<div className="player">
					<div className="stream">
						<video
							muted
							/* loop */ id="video"
							className="backgroundVideo"
							ref={this.videoTag}
							style={{ width: "100%", height: "100%" }}
							src={this.props.stepInputs[SELECT_VIDEO].url}
						></video>
						<canvas ref={this.canvasTag} id="canvas"></canvas>
						<div className="selectedEmoji" ref={this.selectedEmoji}>
							<video style={{ ...(this.state.selectedEmoji.styles || {}) }} autoPlay muted loop src={this.state.selectedEmoji.url}></video>
						</div>
					</div>
					<div className="playerFooter">
						<div className="playPause">
							<button
								onClick={(e) => {
									if (this.videoTag.current) {
										this.videoTag.current.play();
									}
								}}
							>
								Play
							</button>
						</div>
						{/* <div className="progressWrapper">
							<div className="progressFillWrapper">
								<div className="progressFill" style={{ width: "35.5296%" }}></div>
								<div className="seeker" style={{ left: "35.5296%" }}></div>
								<div data-move="both" className="modifiedPart" style={{ left: "21.7305%", width: "45.76%" }}></div>
								<div data-move="start" className="mdfStart" style={{ left: "21.7305%" }}></div>
								<div data-move="end" className="mdfEnd" style={{ left: "67.4905%" }}></div>
							</div>
						</div> */}
						<div className="playerMeta">{/* <span>3.6/10.2s</span> */}</div>
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
