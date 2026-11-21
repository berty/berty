// WCAG relative luminance of a "#rrggbb" or "#rgb" color, or undefined if it can't be parsed
const luminance = (color: string | undefined): number | undefined => {
	if (!color) {
		return undefined
	}
	let hex = color.trim().replace('#', '')
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map(c => c + c)
			.join('')
	}
	if (!/^[0-9a-fA-F]{6}/.test(hex)) {
		return undefined
	}
	const channel = (i: number) => {
		const v = parseInt(hex.substring(i, i + 2), 16) / 255
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
	}
	return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

// Returns `preferred` when it is readable on `background` (WCAG AA contrast for normal text),
// otherwise `fallback` if it is more readable. Used for the accent-colored texts (e.g. the
// received messages) that are fine on the light themes but too dark on the dark ones.
export const readableColor = (
	preferred: string,
	background: string | undefined,
	fallback: string,
): string => {
	const bg = luminance(background)
	const p = luminance(preferred)
	const f = luminance(fallback)
	if (bg === undefined || p === undefined || f === undefined) {
		return preferred
	}
	const preferredContrast = contrast(p, bg)
	if (preferredContrast >= 4.5) {
		return preferred
	}
	return contrast(f, bg) > preferredContrast ? fallback : preferred
}
