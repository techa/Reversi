export function capitarize(str: string) {
	return str[0].toUpperCase() + str.slice(1).toLowerCase()
}

export function blackOrWhite(black: boolean | number) {
	return black ? 'black' : 'white'
}
