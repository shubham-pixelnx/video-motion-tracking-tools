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

		this.state = {
			coords: {},
		};
		this.originCoords = { x: 0, y: 0 };
		this.dstCoords = { x: 0, y: 0 };
		this.mousedown = false;
		this.ctx = null;
	}
	componentDidMount() {
		this.videoTag.current.addEventListener("canplay", (e) => {
			this.canvas = this.canvasTag.current;
			this.canvas.width = this.videoTag.current.clientWidth;
			this.canvas.height = this.videoTag.current.clientHeight;

			this.initCanvas();
		});
	}
	previewTracking = () => {
		console.log(this.state.coords);
	};
	getRelativeCursorPos = (element, event) => {
		const elementRect = element.getBoundingClientRect();
		return {
			x: event.clientX - elementRect.x,
			y: event.clientY - elementRect.y,
		};
	};

	initCanvas = () => {
		this.ctx = this.canvas.getContext("2d");

		this.canvas.addEventListener("mousedown", (e) => {
			this.originCoords = this.getRelativeCursorPos(this.canvas, e);

			this.mousedown = true;
		});
		this.canvas.addEventListener("mousemove", (e) => {
			if (!this.mousedown) return;
			this.dstCoords = this.getRelativeCursorPos(this.canvas, e);
			this.drawRect();
		});
		document.addEventListener("mouseup", (e) => {
			if (!this.mousedown) {
				return;
			}
			this.mousedown = false;

			this.dstCoords = this.getRelativeCursorPos(this.canvas, e);
			this.drawRect();
			this.setState({
				coords: this.getRectCoords(),
			});
		});
	};
	getRectCoords = () => {
		let originCoords = {
			x: Math.min(this.originCoords.x, this.dstCoords.x),
			y: Math.min(this.dstCoords.y, this.originCoords.y),
		};
		let dstCoords = {
			x: Math.max(this.originCoords.x, this.dstCoords.x),
			y: Math.max(this.dstCoords.y, this.originCoords.y),
		};
		return {
			x: originCoords.x,
			y: originCoords.y,
			width: dstCoords.x - originCoords.x,
			height: dstCoords.y - originCoords.y,
		};
	};

	drawRect = () => {
		let coords = this.getRectCoords();
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = "#1da1f250";
		this.ctx.strokeStyle = "yellow";
		this.ctx.lineWidth = 3;

		this.ctx.fillRect(coords.x, coords.y, coords.width, coords.height);
		this.ctx.fill();
		this.ctx.strokeRect(coords.x, coords.y, coords.width, coords.height);
		this.ctx.stroke();
	};

	render() {
		return (
			<div className="popup tracking">
				<div className="popupContent">
					<h2>Select The Area to Track</h2>
					<code>{JSON.stringify(this.state.coords)}</code>
					<div className="spacer y"></div>
					<div className="trackBoard">
						<video ref={this.videoTag} src={this.props.stepInputs[SELECT_VIDEO].url}></video>
						<canvas ref={this.canvasTag}></canvas>
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
				this.setState((istat) => ({
					trackingPopup: { ...istat.trackingPopup, open: true },
				}));
				this.props.showLoader(false);
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
