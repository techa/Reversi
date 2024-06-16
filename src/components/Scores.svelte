<script lang="ts">
	import {
		reversi,
		states,
		Constants,
		options,
	} from '../ViewConnect.svelte.js'

	let { boardWidth } = $props()
</script>

<div
	class="score-container"
	style:visibility="visible"
	style:width={boardWidth + 'px'}
>
	<div class="score-inner-container">
		<div class="name" id="player-name">{reversi.blackPlayerName}</div>
		<div class="tile-container">
			<div
				class="glow"
				style:visibility={states.blackTurn ? 'visible' : 'hidden'}
			>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
			<div class="score-tile score-black">
				<div class="score" id="black-score">
					{states.blackScore}
				</div>
			</div>
		</div>
	</div>
	<div class="score-inner-container">
		<div class="name" id="bot-name">{reversi.whitePlayerName}</div>
		<div class="tile-container">
			<div
				class="glow"
				style:visibility={states.whiteTurn ? 'visible' : 'hidden'}
			>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
			<div class="score-tile score-white">
				<div class="score" id="white-score">
					{states.whiteScore}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.score-container {
		display: flex;
		width: 100%;
		height: 175px;

		margin-top: 10px;
		visibility: hidden;

		justify-content: center;
	}

	.score-inner-container {
		height: 100%;
		position: relative;
		margin: 20px;
	}

	.score-tile {
		width: 80px;
		height: 80%;
		margin: 0 auto;
		border-radius: 75%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 1px 1px 18px;
		font-family: 'Indie Flower', cursive;
	}

	.score-black {
		background-color: #333534;
		color: white;
		box-sizing: border-box;

		background: linear-gradient(to bottom right, black, #565656);
	}

	.score-black:after {
		content: '';
		position: absolute;
		top: 6px;
		border-radius: 50%;
		left: 3px;
		width: 56%;
		height: 35%;
		background: linear-gradient(
			rgba(255, 255, 255, 0.3),
			rgba(255, 255, 255, 0)
		);
		transform: rotate(-35deg);
	}

	.score-white {
		background-color: white;
		color: black;
		box-sizing: border-box;

		background: linear-gradient(to bottom right, #bababa, white);
	}

	.score-white::after {
		content: '';
		position: absolute;
		top: 6px;
		border-radius: 50%;
		left: 3px;
		width: 56%;
		height: 35%;
		background: linear-gradient(
			rgba(255, 255, 255, 1),
			rgba(255, 255, 255, 0)
		);
		transform: rotate(-35deg);
	}

	/* .score-tile-inner {
		margin: 0 auto;
		border-radius: 75%;
		width: 75%;
		height: 75%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.score-black-inner {
		background-color: #535353;
	}

	.score-white-inner {
		border: 1px solid black;
	} */

	.score {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 50px;
	}

	.name {
		margin: 10px auto;
		text-align: center;
		box-sizing: border-box;
		border: 1px solid black;
		width: 250px;
		border-radius: 22px;
		padding: 8px;
		color: white;
		font-weight: bold;
		font-size: 19px;
		background: linear-gradient(to bottom, black, grey);
		position: relative;
		height: 37px;
		box-shadow: 2px 2px 3px black;
		font-family: 'Indie Flower', cursive;
		line-height: 21px;
		letter-spacing: 3px;
	}

	.glow {
		height: 100%;
		border: 1px solid black;
		width: 100px;
		position: relative;
		border-radius: 50%;
		background: linear-gradient(#14ffe9, #ffeb3b, #ff00e0);
		animation: animate 0.5s linear infinite;
	}

	@keyframes animate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.glow span {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: linear-gradient(#14ffe9, #ffeb3b, #ff00e0);
	}

	.glow span:nth-child(1) {
		filter: blur(5px);
	}

	.glow span:nth-child(2) {
		filter: blur(10px);
	}

	.glow span:nth-child(3) {
		filter: blur(25px);
	}

	.glow span:nth-child(4) {
		filter: blur(50px);
	}

	.tile-container {
		position: relative;
		height: 100px;
		display: flex;
		justify-content: center;
	}
</style>
