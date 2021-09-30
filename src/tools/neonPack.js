import { Component, createRef } from "react";
import constants from "../constants";

let {
	steps: { SELECT_VIDEO },
} = constants;

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
];

class TrackingPopup extends Component {
	constructor(props) {
		super(props);
		this.videoTag = createRef();
		this.canvasTag = createRef();

		this.state = {};
		this.originCoords = { x: 0, y: 0 };
		this.dstCoords = { x: 0, y: 0 };
		this.mousedown = false;
		this.ctx = null;
	}
	componentDidMount() {
		(async () => {
			this.props.showLoader();
			let video = this.videoTag.current;
			let blob = await fetch(video.src).then((e) => e.blob());
			let url = URL.createObjectURL(blob);
			video.src = url;
			video.addEventListener("canplay", (e) => {
				this.canvas = this.canvasTag.current;
				video.width = video.clientWidth;
				video.height = video.clientHeight;
				this.canvas.width = video.clientWidth;
				this.canvas.height = video.clientHeight;

				setTimeout(() => {
					this.initTrackingPoints();
					this.props.showLoader(false);
				}, 1000);
			});
		})();
	}
	initTrackingPoints = () => {
		let video = this.videoTag.current;
		let cv = window.cv;
		let cap = new cv.VideoCapture(video);

		// parameters for ShiTomasi corner detection
		let [maxCorners, qualityLevel, minDistance, blockSize] = [30, 0.3, 7, 7];

		// parameters for lucas kanade optical flow
		let winSize = new cv.Size(15, 15);
		let maxLevel = 2;
		let criteria = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 0.03);

		// create some random colors
		let color = [];
		for (let i = 0; i < maxCorners; i++) {
			color.push(new cv.Scalar(parseInt(Math.random() * 255), parseInt(Math.random() * 255), parseInt(Math.random() * 255), 255));
		}

		// take first frame and find corners in it
		let oldFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
		cap.read(oldFrame); // first frame
		let oldGray = new cv.Mat();
		cv.cvtColor(oldFrame, oldGray, cv.COLOR_RGB2GRAY);
		let p0 = new cv.Mat();
		let logThis = new cv.Mat();
		let none = new cv.Mat();
		cv.goodFeaturesToTrack(oldGray, p0, maxCorners, qualityLevel, minDistance, none, blockSize);
		console.log("p0", p0);
		p0.copyTo(logThis);
		console.log(logThis, logThis.data32F, logThis.data32F.length); // .data32F have x y coords

		// Create a mask image for drawing purposes
		let zeroEle = new cv.Scalar(0, 0, 0, 255);
		let mask = new cv.Mat(oldFrame.rows, oldFrame.cols, oldFrame.type(), zeroEle);

		let trackingPoints = [];
		for (let i = 0; i < p0.rows; i++) {
			trackingPoints.push({ coords: { x: p0.data32F[i * 2], y: p0.data32F[i * 2 + 1] }, rowIndex: i });
		}
		console.log(trackingPoints);
		let trackingPointsWrapper = document.querySelector(".trackingPoints");
		trackingPointsWrapper.innerHTML = "";
		trackingPoints.forEach(({ coords, rowIndex }) => {
			let tPoint = document.createElement("div");
			tPoint.className = "trackingPoint";
			const handletPointClick = () => {
				tPoint.removeEventListener("click", handletPointClick);
				tPoint.classList.add("active");
				trackingPointsWrapper.querySelectorAll(".trackingPoint:not(.active)").forEach((el) => el.remove());
				video.play().then(() => {
					let selectedTrackingPoint = p0.row(rowIndex);
					selectedTrackingPoint.copyTo(p0); // this will remove all other tracking points except selected one
					this.selectTrackingPoint({ coords, tPointEl: tPoint }, { oldFrame, oldGray, p0, cap, winSize, maxLevel, criteria, color });
				});
			};
			tPoint.addEventListener("click", handletPointClick);
			Object.assign(tPoint.style, {
				top: `${coords.y}px`,
				left: `${coords.x}px`,
			});
			trackingPointsWrapper.appendChild(tPoint);
		});

		/* // draw the tracks
		for (let i = 0; i < goodNew.length; i++) {
			cv.circle(oldFrame, goodNew[i], 5, color[i], -1);
		}
		cv.add(oldFrame, mask, oldFrame);

		cv.imshow(this.canvasTag.current, oldFrame); */
		/* let frameGray = new cv.Mat();
		let p1 = new cv.Mat();
		let st = new cv.Mat();
		let err = new cv.Mat();
		cv.calcOpticalFlowPyrLK(oldGray, frameGray, p0, p1, st, err, winSize, maxLevel, criteria);
		console.log(p0); */
	};
	selectTrackingPoint = ({ coords, tPointEl }, { oldFrame, oldGray, p0, cap, winSize, maxLevel, criteria, color }) => {
		let cv = window.cv;
		let video = this.videoTag.current;

		// Create a mask image for drawing purposes
		let zeroEle = new cv.Scalar(0, 0, 0, 255);
		let mask = new cv.Mat(oldFrame.rows, oldFrame.cols, oldFrame.type(), zeroEle);

		let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
		let frameGray = new cv.Mat();
		let p1 = new cv.Mat();
		let st = new cv.Mat();
		let err = new cv.Mat();

		const FPS = 30;
		let frameCount = 0;
		const processVideo = () => {
			try {
				if (video.paused || video.ended) {
					// clean and stop.
					frame.delete();
					oldGray.delete();
					p0.delete();
					p1.delete();
					err.delete();
					mask.delete();
					return;
				}
				let begin = Date.now();

				// start processing.
				cap.read(frame);
				cv.cvtColor(frame, frameGray, cv.COLOR_RGBA2GRAY);

				// calculate optical flow
				cv.calcOpticalFlowPyrLK(oldGray, frameGray, p0, p1, st, err, winSize, maxLevel, criteria);
				// cv.calcOpticalFlowPyrLK(prevImg, nextImg, prevPts, nextPts, status, err)

				// select good points
				let goodNew = [];
				let goodOld = [];
				// console.log("st.rows", st.rows);
				for (let i = 0; i < st.rows; i++) {
					// status (st) – output status vector (of unsigned chars); each element of the vector is set to 1 if the flow for the corresponding features has been found, otherwise, it is set to 0.

					if (st.data[i] === 1) {
						goodNew.push(new cv.Point(p1.data32F[i * 2], p1.data32F[i * 2 + 1]));
						goodOld.push(new cv.Point(p0.data32F[i * 2], p0.data32F[i * 2 + 1]));
					}

					if (st.data[i] === 0) {
						// point no longer detected in frame
						frame.delete();
						oldGray.delete();
						p0.delete();
						p1.delete();
						err.delete();
						mask.delete();
						return;
					}
				}

				// draw the tracks
				for (let i = 0; i < goodNew.length; i++) {
					cv.line(mask, goodNew[i], goodOld[i], color[i], 2);
					cv.circle(frame, goodNew[i], 5, color[i], -1);

					Object.assign(tPointEl.style, {
						top: `${goodNew[i].y}px`,
						left: `${goodNew[i].x}px`,
					});
				}
				cv.add(frame, mask, frame);

				cv.imshow(this.canvasTag.current, frame);

				// now update the previous frame and previous points
				frameGray.copyTo(oldGray);
				p0.delete();
				p0 = null;
				p0 = new cv.Mat(goodNew.length, 1, cv.CV_32FC2);
				for (let i = 0; i < goodNew.length; i++) {
					p0.data32F[i * 2] = goodNew[i].x;
					p0.data32F[i * 2 + 1] = goodNew[i].y;
				}

				frameCount++;
				console.log("------");

				/* if (frameCount === 20) {
					return;
				} */
				// schedule the next one.
				let delay = 1000 / FPS - (Date.now() - begin);
				setTimeout(processVideo, delay);
			} catch (err) {
				console.log("err", err);
			}
		};

		// schedule the first one.
		setTimeout(processVideo, 0);
	};

	render() {
		return (
			<div className="popup tracking">
				<div className="popupContent">
					<h2>Select The Tracking Point</h2>
					<div className="spacer y"></div>
					<div className="trackBoard">
						<video ref={this.videoTag} src={this.props.stepInputs[SELECT_VIDEO].url}></video>
						<canvas ref={this.canvasTag}></canvas>
						<div className="trackingPoints"></div>
					</div>
					<div className="spacer y"></div>
					<button className="autoWidth large secondary">Go Back</button>
					<div className="spacer x"></div>
					<button className="autoWidth large" onClick={this.previewTracking}>
						Preview Tracking
					</button>
				</div>
			</div>
		);
	}
}

class NeonPack extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedEmoji: emojiesList[0],
			faceCam: false,
			trackingPopup: { open: !true },
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
		// with opencv.js
		(async () => {
			await this.loadScript("/opencv.js");
			// opencv.js loaded
			window.cv.onRuntimeInitialized = () => {
				this.props.showLoader(false);
				this.setState((istat) => ({
					trackingPopup: { ...istat.trackingPopup, open: true },
				}));
			};
		})();
	}

	render() {
		return (
			<section className="steps animatedEmojies animate__animated animate__fadeIn">
				<h2 className="ta-c">Neon Pack 🔥</h2>
				<div className="player">
					<div className="stream">
						<video muted loop id="video" className="backgroundVideo" ref={this.videoTag} style={{ width: "100%" }} src={this.props.stepInputs[SELECT_VIDEO].url}></video>
						<canvas ref={this.canvasTag} id="canvas"></canvas>
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
					{[
						/* emojiesList */
					].map((emojiData, index) => {
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
				{this.state.trackingPopup.open ? <TrackingPopup {...this.props} /> : null}
			</section>
		);
	}
}

export default NeonPack;
