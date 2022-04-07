import { StyleSheet } from 'react-native'
import mem from 'mem'
import mapValues from 'lodash/mapValues'

import { Declaration, Styles, ColorsStyles } from './types'
import { initialScaleSize, initialFontScale, initialScaleHeight } from './constant'
import { mapColorsDeclaration } from './map-colors'
import { mapSides } from './map-sides'
import { mapBorder } from './map-border'

export const defaultStylesDeclaration: Declaration = {
	colors: {
		default: {
			white: '#FFFFFF',
			black: '#383B62',
			blue: '#525BEC',
			red: '#F64278',
			yellow: '#FFBF47',
			green: '#20D6B5',
			grey: '#979797',
		},
		light: {
			white: '#FFFFFF',
			black: '#383B62',
			blue: '#CED2FF',
			red: '#FFCED8',
			yellow: '#FFF2DA',
			green: '#D3F8F2',
			grey: '#EDEFF3',
		},
		dark: {
			white: '#FFFFFF',
			black: '#383B62',
			blue: '#3E49EA',
			red: '#F64278',
			yellow: '#FFBF47',
			green: '#20D6B5',
			grey: '#3F426D',
		},
	},
	sides: {
		tiny: 4,
		small: 9,
		medium: 16,
		large: 24,
		big: 32,
		huge: 40,
	},
	text: {
		sizes: {
			tiny: 11,
			small: 13,
			medium: 15,
			large: 20,
			big: 22,
			huge: 26,
		},
	},
}

const mapDeclarationWithDims = (
	decl: Declaration,
	{ fontScale, scaleSize } = {
		fontScale: initialFontScale,
		scaleSize: initialScaleSize,
	},
): Styles => {
	return {
		color: {
			...decl.colors.default,
			...decl.colors,
		} as ColorsStyles<string>,
		background: mapColorsDeclaration(decl.colors, v => ({ backgroundColor: v })),
		padding: {
			tiny: { padding: decl.sides.tiny },
			small: { padding: decl.sides.small },
			medium: { padding: decl.sides.medium },
			large: { padding: decl.sides.large },
			big: { padding: decl.sides.big },
			huge: { padding: decl.sides.huge },
			scale: mem(size => StyleSheet.create({ scale: { padding: size * scaleSize } }).scale),
			...mapSides(decl.sides, 'padding'),
		},
		margin: {
			tiny: { margin: decl.sides.tiny },
			small: { margin: decl.sides.small },
			medium: { margin: decl.sides.medium },
			large: { margin: decl.sides.large },
			big: { margin: decl.sides.big },
			huge: { margin: decl.sides.huge },
			scale: mem(size => StyleSheet.create({ scale: { margin: size * scaleSize } }).scale),
			...mapSides(decl.sides, 'margin'),
		},
		border: mapBorder(decl, { scaleSize }),
		text: {
			color: mapColorsDeclaration(decl.colors, v => ({ color: v })),
			...StyleSheet.create({
				italic: { fontFamily: 'Italic Open Sans' },
				bold: { fontFamily: 'Bold Open Sans' },
				extraBold: { fontFamily: 'Extra Bold Open Sans' },
				light: { fontFamily: 'Light Open Sans' },
				lightItalic: { fontFamily: 'Light Italic Open Sans' },
			}),
			size: {
				...StyleSheet.create({
					tiny: { fontSize: decl.text.sizes.tiny },
					small: { fontSize: decl.text.sizes.small },
					medium: { fontSize: decl.text.sizes.medium },
					large: { fontSize: decl.text.sizes.large },
					big: { fontSize: decl.text.sizes.big, lineHeight: decl.text.sizes.big },
					huge: { fontSize: decl.text.sizes.huge },
				}),
				scale: mem(
					(size: number) => StyleSheet.create({ scale: { fontSize: size * fontScale } }).scale,
				),
			},
			align: StyleSheet.create({
				top: { textAlignVertical: 'top' },
				left: { textAlign: 'left' },
				right: { textAlign: 'right' },
				bottom: { textAlignVertical: 'bottom' },
				center: { textAlign: 'center' },
				justify: { textAlignVertical: 'center' },
				fill: { textAlign: 'center', textAlignVertical: 'center' },
			}),
		},
		row: {
			item: StyleSheet.create({
				top: { alignSelf: 'flex-start' },
				bottom: { alignSelf: 'flex-end' },
				justify: { alignSelf: 'center' },
				fill: { alignSelf: 'stretch' },
			}),
			...StyleSheet.create({
				left: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'flex-start' },
				right: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'flex-end' },
				center: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-evenly' },
				fill: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between' },
			}),
		},
		column: {
			item: StyleSheet.create({
				left: { alignSelf: 'flex-start' },
				right: { alignSelf: 'flex-end' },
				center: { alignSelf: 'center' },
				fill: { alignSelf: 'stretch' },
			}),
			...StyleSheet.create({
				top: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' },
				bottom: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end' },
				justify: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-evenly' },
				fill: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between' },
			}),
		},
		flex: {
			...StyleSheet.create({
				tiny: { flex: 1 },
				small: { flex: 2 },
				medium: { flex: 3 },
				large: { flex: 5 },
				big: { flex: 8 },
				huge: { flex: 13 },
			}),
			direction: StyleSheet.create({
				row: { flexDirection: 'row' },
				column: { flexDirection: 'column' },
			}),
			align: StyleSheet.create({
				baseline: { alignItems: 'baseline' },
				center: { alignItems: 'center' },
				end: { alignItems: 'flex-end' },
				start: { alignItems: 'flex-start' },
				stretch: { alignItems: 'stretch' },
			}),
			justify: StyleSheet.create({
				center: { justifyContent: 'center' },
				end: { justifyContent: 'flex-end' },
				spaceAround: { justifyContent: 'space-around' },
				spaceBetween: { justifyContent: 'space-between' },
				spaceEvenly: { justifyContent: 'space-evenly' },
				start: { justifyContent: 'flex-start' },
			}),
			scale: mem((size: number) => StyleSheet.create({ scale: { flex: size } }).scale),
		},
		absolute: {
			...StyleSheet.create({
				top: { position: 'absolute', top: 0 },
				left: { position: 'absolute', left: 0 },
				right: { position: 'absolute', right: 0 },
				bottom: { position: 'absolute', bottom: 0 },
				center: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
				justify: { position: 'absolute', top: 0, bottom: 0, alignItems: 'center' },
				fill: {
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
				},
			}),
			scale: mem(
				values =>
					StyleSheet.create({
						scale: {
							position: 'absolute',
							...mapValues(values, v => (v || 0) * scaleSize),
						},
					}).scale,
				{ cacheKey: JSON.stringify },
			),
		},
		width: mem((width: number) => StyleSheet.create({ width: { width: width * scaleSize } }).width),
		height: mem(
			(height: number) => StyleSheet.create({ height: { height: height * scaleSize } }).height,
		),
		maxWidth: mem(
			(maxWidth: number) =>
				StyleSheet.create({ maxWidth: { maxWidth: maxWidth * scaleSize } }).maxWidth,
		),
		maxHeight: mem(
			(maxHeight: number) =>
				StyleSheet.create({ maxHeight: { maxHeight: maxHeight * scaleSize } }).maxHeight,
		),
		minWidth: mem(
			(minWidth: number) =>
				StyleSheet.create({ minWidth: { minWidth: minWidth * scaleSize } }).minWidth,
		),
		minHeight: mem(
			(minHeight: number) =>
				StyleSheet.create({ minHeight: { minHeight: minHeight * scaleSize } }).minHeight,
		),
		overflow: StyleSheet.create({ overflow: { overflow: 'visible' } }).overflow,
		opacity: mem((opacity: number) => StyleSheet.create({ opacity: { opacity } }).opacity),
	}
}

export const mapScaledDeclarationWithDims = (
	decl: Declaration,
	{ fontScale, scaleSize, scaleHeight: _ } = {
		fontScale: initialFontScale,
		scaleSize: initialScaleSize,
		scaleHeight: initialScaleHeight,
	},
): Styles => {
	return mapDeclarationWithDims(
		{
			...decl,
			sides: mapValues(decl.sides, (n: number) => n * scaleSize),
			text: {
				...decl.text,
				sizes: mapValues(decl.text.sizes, (n: number) => n * fontScale),
			},
		},
		{ fontScale, scaleSize },
	)
}
