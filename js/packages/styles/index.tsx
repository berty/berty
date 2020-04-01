import { PixelRatio, StyleSheet, Platform, Dimensions } from 'react-native'
import _ from 'lodash'
import Case from 'case'
import React, { createContext, useContext, useState } from 'react'
import mem from 'mem'

export type ColorsTypes = 'white' | 'black' | 'blue' | 'red' | 'yellow' | 'green' | 'grey'
export type Colors<T> = {
	white: T
	black: T
	blue: T
	red: T
	yellow: T
	green: T
	grey: T
}
export type ColorsBrightnessTypes = 'default' | 'light' | 'dark'
export type ColorsBrightness<T> = {
	default: Colors<T>
	light: Colors<T>
	dark: Colors<T>
}

export type ColorsDeclaration = ColorsBrightness<string>
export type ColorsStyles<T> = Colors<T> &
	ColorsBrightness<T> & {
		transparent: Colors<T> & ColorsBrightness<T>
		blur: Colors<T> & ColorsBrightness<T>
		opaque: Colors<T> & ColorsBrightness<T>
	}

export type SidesTypes = 'top' | 'left' | 'right' | 'bottom' | 'vertical' | 'horizontal'
export type Sides<T> = {
	top: T
	left: T
	right: T
	bottom: T
	vertical: T
	horizontal: T
}

export type SizesTypes = 'tiny' | 'small' | 'medium' | 'large' | 'big' | 'huge' | 'scale'
export type SizesDeclaration<T> = {
	tiny: T
	small: T
	medium: T
	large: T
	big: T
	huge: T
}
export type Sizes<T> = SizesDeclaration<T> & {
	scale: (size: number) => T
}

export type AlignHorizontalTypes = 'left' | 'right' | 'center' | 'fill'
export type AlignHorizontal<T> = {
	left: T
	right: T
	center: T
	fill: T
}

export type AlignVerticalTypes = 'top' | 'bottom' | 'justify' | 'fill'
export type AlignVertical<T> = {
	top: T
	bottom: T
	justify: T
	fill: T
}

export type AlignTypes = [AlignHorizontalTypes, AlignVerticalTypes]
export type Align<T> = AlignHorizontal<T> & AlignVertical<T>

export type BoldDeclarationTypes =
	| 'normal'
	| 'bold'
	| '100'
	| '200'
	| '300'
	| '400'
	| '500'
	| '600'
	| '700'
	| '800'
	| '900'
export type BoldDeclaration<T> = {
	small: T
	medium: T
	huge: T
}
export type Bold<T> = BoldDeclaration<T> & {
	scale: (fontWeight: BoldDeclarationTypes) => T
}

export type Text = {
	color: Colors<{}> & ColorsBrightness<{}>
	size: Sizes<{}>
	family: {
		use: (fontFamily: string) => {}
	}
	bold: Bold<{}>
	italic: {}
	align: Align<{}>
}

export type BorderRadiusscale<T> = (size: number) => T
export type BorderRadius<T> = Sizes<T> &
	Sides<Sizes<{}>> & {
		scale: BorderRadiusscale<T>
	} & Sides<{
		scale: BorderRadiusscale<T>
	}>

export type BorderShadow<T> = Sizes<T>

export type Border<T> = Sizes<T> &
	Sides<Sizes<T>> & {
		radius: BorderRadius<T>
		shadow: BorderShadow<T>
		color: Colors<T> & ColorsBrightness<T>
	}

export type Declaration = {
	colors: ColorsDeclaration
	sides: SizesDeclaration<number>
	text: {
		family: {}
		sizes: SizesDeclaration<number>
	}
}

export type Styles = {
	color: ColorsStyles<string>
	background: ColorsStyles<{}>
	padding: Sizes<{}> & Sides<Sizes<{}>>
	margin: Sizes<{}> & Sides<Sizes<{}>>
	border: Border<{}>
	text: Text
	absolute: Align<{}> & {
		scale: (values: { top?: number; left?: number; right?: number; bottom?: number }) => {}
	}
	column: AlignVertical<{}> & {
		item: AlignHorizontal<{}>
	}
	row: AlignHorizontal<{}> & {
		item: AlignVertical<{}>
	}
	flex: Sizes<{}>
	width: (width: number) => {}
	height: (height: number) => {}
	maxWidth: (maxWidth: number) => {}
	maxHeight: (maxHeight: number) => {}
	opacity: (opacity: number) => {}
	minWidth: (minWidth: number) => {}
	minHeight: (minHeight: number) => {}
	overflow: {}
}

const dimensions = Dimensions.get('window')
const iphone11 = {
	width: dimensions.width < 414 ? 414 : dimensions.width,
	height: dimensions.height < 896 ? 896 : dimensions.height,
}
const scaleSize = dimensions.width / iphone11.width
const scaleHeight = dimensions.height / iphone11.height
const fontScale = PixelRatio.getFontScale() * scaleSize

// Mapping for style instanciation
//
const mapColor = <T extends {}>(v: string, map: (v: string) => T, opacity = '') => map(v + opacity)
const mapColorsDeclarationBasic = <T extends {}>(
	decl: Colors<string>,
	map: (v: string) => T,
	opacity?: string,
): Colors<T> => StyleSheet.create(_.mapValues(decl, (v) => mapColor(v, map, opacity)))
const mapColorsDeclarationStylesBasic = <T extends {}>(
	decl: ColorsDeclaration,
	map: (value: string) => T,
	opacity?: string,
): Colors<T> & ColorsBrightness<T> => ({
	...mapColorsDeclarationBasic(decl.default, map, opacity),
	default: mapColorsDeclarationBasic(decl.default, map, opacity),
	light: mapColorsDeclarationBasic(decl.light, map, opacity),
	dark: mapColorsDeclarationBasic(decl.dark, map, opacity),
})
const mapColorsDeclaration = <T extends {}>(
	decl: ColorsDeclaration,
	map: (value: string) => T,
): ColorsStyles<T> => ({
	...mapColorsDeclarationStylesBasic(decl, map),
	transparent: mapColorsDeclarationStylesBasic(decl, map, '20'),
	blur: mapColorsDeclarationStylesBasic(decl, map, '80'),
	opaque: mapColorsDeclarationStylesBasic(decl, map, 'd0'),
})
const mapSideSize = (type: string, side: string, value: number) => ({
	[Case.camel(`${type}_${side}`)]: value,
})
const mapSideSizes = (decl: SizesDeclaration<number>, type: string, side: string) => ({
	...StyleSheet.create({
		tiny: mapSideSize(type, side, decl.tiny),
		small: mapSideSize(type, side, decl.small),
		medium: mapSideSize(type, side, decl.medium),
		large: mapSideSize(type, side, decl.large),
		big: mapSideSize(type, side, decl.big),
		huge: mapSideSize(type, side, decl.huge),
	}),
	scale: mem((size: number) => mapSideSize(type, side, size)),
})
const mapSides = (decl: SizesDeclaration<number>, type: string) => ({
	top: mapSideSizes(decl, type, 'top'),
	bottom: mapSideSizes(decl, type, 'bottom'),
	left: mapSideSizes(decl, type, 'left'),
	right: mapSideSizes(decl, type, 'right'),
	vertical: mapSideSizes(decl, type, 'vertical'),
	horizontal: mapSideSizes(decl, type, 'horizontal'),
})
const mapSizes = (decl: SizesDeclaration<number>, map: (value: number) => {}) => ({
	...StyleSheet.create({
		tiny: map(decl.tiny),
		small: map(decl.small),
		medium: map(decl.medium),
		large: map(decl.large),
		big: map(decl.big),
		huge: map(decl.huge),
	}),
	scale: mem((radius: number) => StyleSheet.create({ scale: map(radius * scaleSize) }).scale),
})
const mapBorderSidesSizes = (
	decl: SizesDeclaration<number> = {
		tiny: 0.1 * scaleSize,
		small: 0.2 * scaleSize,
		medium: 0.5 * scaleSize,
		large: 1 * scaleSize,
		big: 2 * scaleSize,
		huge: 5 * scaleSize,
	},
) => ({
	...mapSizes(decl, (borderWidth) => ({ borderWidth })),
	top: mapSizes(decl, (borderTopWidth) => ({ borderTopWidth })),
	left: mapSizes(decl, (borderLeftWidth) => ({ borderLeftWidth })),
	right: mapSizes(decl, (borderRightWidth) => ({ borderRightWidth })),
	bottom: mapSizes(decl, (borderBottomWidth) => ({ borderBottomWidth })),
	horizontal: mapSizes(decl, (borderWidth) => ({
		borderLeftWidth: borderWidth,
		borderRightWidth: borderWidth,
	})),
	vertical: mapSizes(decl, (borderWidth) => ({
		borderTopWidth: borderWidth,
		borderBottomWidth: borderWidth,
	})),
})
const mapBorderRadiusSides = (decl: Declaration) => ({
	top: mapSizes(decl.sides, (radius) => ({
		borderTopLeftRadius: radius,
		borderTopRightRadius: radius,
	})),
	left: mapSizes(decl.sides, (radius) => ({
		borderTopLeftRadius: radius,
		borderBottomLeftRadius: radius,
	})),
	right: mapSizes(decl.sides, (radius) => ({
		borderTopRightRadius: radius,
		borderBottomRightRadius: radius,
	})),
	bottom: mapSizes(decl.sides, (radius) => ({
		borderBottomLeftRadius: radius,
		borderBottomRightRadius: radius,
	})),
	vertical: mapSizes(decl.sides, (radius) => ({ borderRadius: radius })),
	horizontal: mapSizes(decl.sides, (radius) => ({ borderRadius: radius })),
})
const mapBorderShadowIOS = (
	decl: Declaration,
	_defaultValues = {
		shadowOpacity: 0.2,
	},
): Sizes<{}> => ({
	...StyleSheet.create({
		tiny: { ..._defaultValues, shadowRadius: 0.5, shadowOffset: { width: 0, height: 0.25 } },
		small: { ..._defaultValues, shadowRadius: 1, shadowOffset: { width: 0, height: 0.5 } },
		medium: { ..._defaultValues, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
		large: { ..._defaultValues, shadowRadius: 5, shadowOffset: { width: 0, height: 2.5 } },
		big: { ..._defaultValues, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
		huge: { ..._defaultValues, shadowRadius: 13, shadowOffset: { width: 0, height: 6.5 } },
	}),
	scale: mem(
		(size: number) =>
			StyleSheet.create({
				scale: {
					..._defaultValues,
					shadowRadius: size,
					shadowOffset: { width: 0, height: size / 2 },
				},
			}).scale,
	),
})
const mapBorderShadowAndroid = (): Sizes<{}> => ({
	...StyleSheet.create({
		tiny: { elevation: 1 },
		medium: { elevation: 2 },
		small: { elevation: 3 },
		large: { elevation: 4 },
		big: { elevation: 5 },
		huge: { elevation: 6 },
	}),
	scale: mem((size: number) => StyleSheet.create({ scale: { elevation: size } }).scale),
})
const mapBorder = (decl: Declaration) => ({
	...mapBorderSidesSizes(),
	scale: mem(
		(size: number) => StyleSheet.create({ scale: { borderWidth: size * scaleSize } }).scale,
	),
	radius: {
		...mapSizes(decl.sides, (radius) => ({
			borderRadius: radius,
		})),
		...mapBorderRadiusSides(decl),
	},
	shadow: Platform.select({ ios: mapBorderShadowIOS(decl), android: mapBorderShadowAndroid() }),
	size: StyleSheet.create({}),
	color: mapColorsDeclaration(decl.colors, (v) => ({ borderColor: v })),
})
const mapDeclaration = (decl: Declaration): Styles => ({
	color: {
		...decl.colors.default,
		...decl.colors,
	},
	background: mapColorsDeclaration(decl.colors, (v) => ({ backgroundColor: v })),
	padding: {
		tiny: { padding: decl.sides.tiny },
		small: { padding: decl.sides.small },
		medium: { padding: decl.sides.medium },
		large: { padding: decl.sides.large },
		big: { padding: decl.sides.big },
		huge: { padding: decl.sides.huge },
		scale: mem((size) => StyleSheet.create({ scale: { padding: size * scaleSize } }).scale),
		...mapSides(decl.sides, 'padding'),
	},
	margin: {
		tiny: { margin: decl.sides.tiny },
		small: { margin: decl.sides.small },
		medium: { margin: decl.sides.medium },
		large: { margin: decl.sides.large },
		big: { margin: decl.sides.big },
		huge: { margin: decl.sides.huge },
		scale: mem((size) => StyleSheet.create({ scale: { margin: size * scaleSize } }).scale),
		...mapSides(decl.sides, 'margin'),
	},
	border: mapBorder(decl),
	text: {
		color: mapColorsDeclaration(decl.colors, (v) => ({ color: v })),
		family: StyleSheet.create({
			use: mem(
				(fontFamily: string = decl.text.family) =>
					StyleSheet.create({ family: { fontFamily } }).family,
			),
		}),
		bold: {
			...StyleSheet.create({
				small: { fontWeight: '500' },
				medium: { fontWeight: 'bold' },
				huge: { fontWeight: '900' },
			}),
			scale: mem(
				(fontWeight: BoldDeclarationTypes) => StyleSheet.create({ scale: { fontWeight } }).scale,
			),
		},
		...StyleSheet.create({
			italic: { fontStyle: 'italic' },
		}),
		size: {
			...StyleSheet.create({
				tiny: { fontSize: decl.text.sizes.tiny },
				small: { fontSize: decl.text.sizes.small },
				medium: { fontSize: decl.text.sizes.medium },
				large: { fontSize: decl.text.sizes.large },
				big: { fontSize: decl.text.sizes.big },
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
			(values) =>
				StyleSheet.create({
					scale: {
						position: 'absolute',
						..._.mapValues(values, (v) => (v || 0) * scaleSize),
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
})

const mapScaledDeclaration = (decl: Declaration): Styles =>
	mapDeclaration({
		...decl,
		sides: _.mapValues(decl.sides, (n: number) => n * scaleSize),
		text: {
			...decl.text,
			sizes: _.mapValues(decl.text.sizes, (n: number) => n * fontScale),
		},
	})

const defaultStylesDeclaration: Declaration = {
	colors: {
		default: {
			white: '#FFFFFF',
			black: '#2B2E4D',
			blue: '#525BEC',
			red: '#F64278',
			yellow: '#FFBF47',
			green: '#20D6B5',
			grey: '#979797',
		},
		light: {
			white: '#FFFFFF',
			black: '#2B2E4D',
			blue: '#CED2FF',
			red: '#FFCED8',
			yellow: '#FFF2DA',
			green: '#D3F8F2',
			grey: '#EDEFF3',
		},
		dark: {
			white: '#FFFFFF',
			black: '#2B2E4D',
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
		family: 'Avenir',
		sizes: {
			tiny: 10,
			small: 12,
			medium: 15,
			large: 19,
			big: 22,
			huge: 26,
		},
	},
}

const defaultStyles = mapScaledDeclaration(defaultStylesDeclaration)

export type SetStylesDeclaration = (
	decl: Declaration,
	setStyles: React.Dispatch<React.SetStateAction<Styles>>,
) => void
const setStylesDeclaration: SetStylesDeclaration = (decl, setStyles) =>
	setStyles(mapScaledDeclaration(decl))

export type Context = React.Context<[Styles, (decl: Declaration) => void]>
const ctx: Context = createContext([
	defaultStyles,
	(decl: Declaration) => setStylesDeclaration(decl, () => {}),
])

export const Provider: React.FC = ({ children }) => {
	const [stylesState, setStylesState] = useState(defaultStyles)
	return (
		<ctx.Provider value={[stylesState, (decl) => setStylesDeclaration(decl, setStylesState)]}>
			{children}
		</ctx.Provider>
	)
}
export const Consumer = ctx.Consumer

export const useStyles = (): [Styles, SetStylesDeclaration] => {
	return useContext(ctx)
}

export const colors = {
	translucent: '#FFFFFFB2',
	transparent: 'transparent',
	white: '#FFFFFF',
	black: '#2B2E4D',
	blue: '#525BEC',
	red: '#F64278',
	yellow: '#FFBF47',
	green: '#20D6B5',
	grey: '#979797',

	// Light
	lightBlue: '#CED2FF',
	lightRed: '#FFCED8',
	lightGreen: '#D3F8F2',
	lightGrey: '#EDEFF3',
	lightBlueGrey: '#E8E9FC',
	lightYellow: '#FFF2DA',

	// Light Message
	lightMsgBlue: '#CED2FF99',
	lightMsgRed: '#FFCED899',
	lightMsgGreen: '#D3F8F299',
	lightMsgGrey: '#EDEFF399',
	lightMsgBlueGrey: '#E8E9FC99',
	lightMsgYellow: '#FFF2DA99',

	textLight: '#8F9BB3',

	// Dark
	darkBlue: '#3E49EA',
	darkGray: '#3F426D',
}

export const styles = StyleSheet.create({
	// Not Use
	test: { borderWidth: 1, borderColor: 'red' },
	// Use
	fontFamily: { fontFamily: 'Avenir' },
	fontCourier: { fontFamily: 'Courier' },

	textWhite: { color: colors.white },
	textBlack: { color: colors.black },
	textBlue: { color: colors.blue },
	textLightBlue: { color: colors.lightBlue },
	textRed: { color: colors.red },
	textYellow: { color: colors.yellow },
	textGreen: { color: colors.green },
	textLight: { color: colors.textLight },
	textGrey: { color: colors.grey },
	textLightGrey: { color: colors.lightGrey },
	textLightBlueGrey: { color: colors.lightBlueGrey },

	textBold: { fontWeight: 'bold' },

	bgTranslucent: { backgroundColor: colors.translucent },
	bgTransparent: { backgroundColor: colors.transparent },
	bgWhite: { backgroundColor: colors.white },
	bgBlack: { backgroundColor: colors.black },
	bgBlue: { backgroundColor: colors.blue },
	bgRed: { backgroundColor: colors.red },
	bgYellow: { backgroundColor: colors.yellow },
	bgLightBlue: { backgroundColor: colors.lightBlue },
	bgLightRed: { backgroundColor: colors.lightRed },
	bgLightGreen: { backgroundColor: colors.lightGreen },
	bgDarkgray: { backgroundColor: colors.darkGray },
	bgGrey: { backgroundColor: colors.grey },
	bgLightGrey: { backgroundColor: colors.lightGrey },
	bgLightBlueGrey: { backgroundColor: colors.lightBlueGrey },

	flex: { flex: 1 },
	smallFlex: { flex: 3 },
	largeFlex: { flex: 5 },
	wrap: { flexWrap: 'wrap' },
	nowrap: { flexWrap: 'nowrap' },
	row: { flexDirection: 'row' },
	rowRev: { flexDirection: 'row-reverse' },
	col: { flexDirection: 'column' },
	colRev: { flexDirection: 'column-reverse' },

	center: { alignSelf: 'center' },
	start: { alignSelf: 'flex-start' },
	end: { alignSelf: 'flex-end' },
	stretch: { alignSelf: 'stretch' },

	centerItems: { alignItems: 'center' },
	startItems: { alignItems: 'flex-start' },
	endItems: { alignItems: 'flex-end' },
	stretchItems: { alignItems: 'stretch' },

	spaceEvenly: { justifyContent: 'space-evenly' },
	spaceAround: { justifyContent: 'space-around' },
	spaceBetween: { justifyContent: 'space-between' },
	spaceCenter: { justifyContent: 'center' },

	alignItems: { alignItems: 'center' },
	justifyContent: { justifyContent: 'center' },

	border: { borderWidth: 0.5, borderColor: colors.lightGrey },
	borderTop: { borderTopWidth: 0.5, borderColor: colors.lightGrey },
	borderBottom: { borderBottomWidth: 0.5, borderColor: colors.lightGrey },

	rounded: { borderRadius: 20 },
	roundedTop: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },

	bottom: { bottom: 0 },
	left: { left: 0 },
	top: { top: 0 },
	right: { right: 0 },

	textCenter: {
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	textLeft: {
		textAlign: 'left',
		textAlignVertical: 'center',
	},
	textRight: {
		textAlign: 'right',
		textAlignVertical: 'center',
	},

	alignVertical: { flex: 1, alignItems: 'center' },

	margin: { margin: 16 },
	marginHorizontal: { marginHorizontal: 16 },
	marginVertical: { marginVertical: 16 },
	marginLeft: { marginLeft: 16 },
	marginTop: { marginTop: 16 },
	marginRight: { marginRight: 16 },
	marginBottom: { marginBottom: 16 },
	padding: { padding: 16 },
	paddingHorizontal: { paddingHorizontal: 16 },
	paddingVertical: { paddingVertical: 16 },
	paddingLeft: { paddingLeft: 16 },
	paddingTop: { paddingTop: 16 },
	paddingRight: { paddingRight: 16 },
	paddingBottom: { paddingBottom: 16 },

	littlePadding: { padding: 12 },
	littlePaddingHorizontal: { paddingHorizontal: 12 },
	littlePaddingVertical: { paddingVertical: 12 },
	littlePaddingTop: { paddingTop: 12 },
	littlePaddingBottom: { paddingBottom: 12 },
	littlePaddingRight: { paddingRight: 12 },
	littlePaddingLeft: { paddingLeft: 12 },
	bigPadding: { padding: 30 },
	bigPaddingHorizontal: { paddingHorizontal: 30 },
	bigPaddingVertical: { paddingVertical: 30 },
	bigPaddingLeft: { paddingLeft: 30 },
	bigPaddingRight: { paddingRight: 30 },
	bigPaddingBottom: { paddingBottom: 30, bottom: 30 },
	bigPaddingTop: { paddingTop: 30 },

	littleMargin: { margin: 12 },
	littleMarginTop: { marginTop: 12 },
	littleMarginBottom: { marginBottom: 12 },
	littleMarginRight: { marginRight: 12 },
	littleMarginLeft: { marginLeft: 12 },
	bigMarginLeft: { marginLeft: 30 },
	bigMarginRight: { marginRight: 30 },
	bigMarginBottom: { marginBottom: 30 },
	bigMarginTop: { marginTop: 30 },

	absolute: { position: 'absolute' },
	relative: { position: 'relative' },

	borderTopLeftRadius: { borderTopLeftRadius: 30 },
	borderTopRightRadius: { borderTopRightRadius: 30 },
	borderBottomLeftRadius: { borderBottomLeftRadius: 30 },
	borderBottomRightRadius: { borderBottomRightRadius: 30 },

	modalBorderRadius: { borderRadius: 30 },
	borderRadius: { borderRadius: 16 },
	littleBorderRadius: { borderRadius: 10 },
	overflow: { overflow: 'visible' },

	shadow: {
		...Platform.select({
			ios: {
				shadowOffset: { width: 3, height: 3 },
				shadowColor: '#ABAED1',
				shadowOpacity: 0.5,
				shadowRadius: 9,
			},
			android: {
				elevation: 4,
			},
		}),
	},

	footerShadow: {
		...Platform.select({
			ios: {
				shadowOffset: { width: 0, height: 0 },
				shadowColor: '#000000',
				shadowOpacity: 1,
				shadowRadius: 20,
			},
		}),
	},

	textTiny: {
		fontSize: 10,
	},
	textSmall: {
		fontSize: 12,
	},
})
