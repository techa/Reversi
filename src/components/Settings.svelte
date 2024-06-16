<script lang="ts">
	import { AILVMAX } from '../AI.js'
	import { Tile } from '../Reversi.js'
	import { options, states } from '../ViewConnect.svelte.js'
	import { capitarize } from '../utils.js'
</script>

<div class="settings-from-container">
	<form name="setting">
		<h4>Board Size: <span class="number">{options.boardSize}</span></h4>
		<label>
			<input
				type="range"
				name="boardSize"
				bind:value={options.boardSize}
				min="4"
				max="12"
			/>
		</label>
		<div>
			<h4>
				Initial Placement: <span
					>{capitarize(options.initialPlacement)}</span
				>
			</h4>
			<label title="cross">
				<input
					type="radio"
					name="initialPlacement"
					value="cross"
					checked
					bind:group={options.initialPlacement}
				/>
				<svg viewBox="0 0 24 24" class="icon ip-cross">
					<circle cx="6" cy="6" r="5" fill="white"></circle>
					<circle cx="18" cy="6" r="5" fill="black"></circle>
					<circle cx="6" cy="18" r="5" fill="black"></circle>
					<circle cx="18" cy="18" r="5" fill="white"></circle>
				</svg>
				<!-- <span>Cross</span> -->
			</label>
			<label title="parallel">
				<input
					type="radio"
					name="initialPlacement"
					value="parallel"
					bind:group={options.initialPlacement}
				/>
				<svg viewBox="0 0 24 24" class="icon ip-parallel">
					<circle cx="6" cy="6" r="5" fill="white"></circle>
					<circle cx="18" cy="6" r="5" fill="white"></circle>
					<circle cx="6" cy="18" r="5" fill="black"></circle>
					<circle cx="18" cy="18" r="5" fill="black"></circle>
				</svg>
				<!-- <span>Parallel</span> -->
			</label>
			<label title="random">
				<input
					type="radio"
					name="initialPlacement"
					value="random"
					bind:group={options.initialPlacement}
				/>
				<svg class="icon ip-random">
					<use href="#random"></use>
				</svg>
				<!-- <span>Random</span> -->
			</label>
		</div>
		<div>
			<h4>
				Your Color: <span>
					{['Random', 'Black', 'White'][options.yourColor]}</span
				>
			</h4>
			<label title="black">
				<input
					type="radio"
					name="yourColor"
					value={Tile.B}
					bind:group={options.yourColor}
					checked
				/>
				<svg class="icon yc-black">
					<use href="#black-tile"></use>
				</svg>
			</label>
			<label title="white">
				<input
					type="radio"
					name="yourColor"
					value={Tile.W}
					bind:group={options.yourColor}
				/>
				<svg class="icon yc-white">
					<use href="#white-tile"></use>
				</svg>
			</label>
			<label title="random">
				<input
					type="radio"
					name="yourColor"
					value={Tile.Null}
					bind:group={options.yourColor}
				/>
				<svg class="icon yc-random">
					<use href="#random"></use>
				</svg>
			</label>
		</div>
		<div>
			<h4>AI LV: <span class="number">{states.aiLv}</span></h4>
			<label>
				<input
					type="range"
					name="aiLv"
					bind:value={states.aiLv}
					min="0"
					max={AILVMAX}
				/>
			</label>
		</div>
	</form>
</div>

<style>
	.settings-from-container {
		width: 100%;
	}
	form {
		text-align: center;
	}
	h4 {
		margin: 1rem 0 0.5rem;
	}
	h4 span {
		display: inline-flex;
		font-size: large;
	}
	h4 span.number {
		width: 2rem;
	}
	form label {
		margin: 0 0.5rem;
		cursor: pointer;
	}
	form input[type='radio'] {
		display: none;
	}
	:global(svg.icon) {
		width: 32px;
		height: 32px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	form input[type='radio'] + .icon {
		opacity: 0.5;
	}
	form input[type='radio']:checked + .icon {
		opacity: 1;
	}
</style>
