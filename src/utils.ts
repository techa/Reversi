export function capitarize(str: string) {
	return str[0].toUpperCase() + str.slice(1).toLowerCase()
}

export function blackOrWhite(black: boolean | number) {
	return black ? 'black' : 'white'
}

export function clamp(value: number, min: number, max: number) {
	return value < min ? min : value > max ? max : value
}

export function floor(n: number, digit = 0) {
	return Math.floor(n * 10 ** digit) / 10 ** digit
}
