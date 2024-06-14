import { View } from './View.js'
import { mount } from 'svelte'
import App from './components/App.svelte'

mount(App, {
	target: document.getElementById('app')!,
})


// document.addEventListener('DOMContentLoaded', () => {
// 	const view = new View()

// 	view.addEventToStart()
// })
