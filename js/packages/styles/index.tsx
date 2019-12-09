import { StyleSheet, Platform } from 'react-native'
import _ from 'lodash'
import Case from 'case'
import React, { createContext, useContext, useState } from 'react'

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

export type SizesTypes = 'tiny' | 'small' | 'medium' | 'large' | 'big' | 'huge'
export type Sizes<T> = {
	tiny: T
	small: T
	medium: T
	large: T
	big: T
	huge: T
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

export type Text = {
	color: Colors<{}> & ColorsBrightness<{}>
	size: Sizes<{}>
	family: {}
	bold: {}
	italic: {}
	align: Align<{}>
}

export type BorderRadiusCompute<T> = (size: number) => T
export type BorderRadius<T> = Sizes<T> &
	Sides<Sizes<{}>> & {
		compute: BorderRadiusCompute<T>
	} & Sides<{
		compute: BorderRadiusCompute<T>
	}>

export type BorderShadow<T> = Sizes<T>

export type Border<T> = {
	radius: BorderRadius<T>
	shadow: BorderShadow<T>
}

export type Declaration = {
	colors: ColorsDeclaration
	sides: Sizes<number>
	text: {
		family: string
		sizes: Sizes<number>
	}
}

export type Styles = {
	color: Colors<string> & ColorsBrightness<string>
	background: Colors<{}> & ColorsBrightness<{}>
	padding: Sizes<{}> & Sides<Sizes<{}>>
	margin: Sizes<{}> & Sides<Sizes<{}>>
	border: Border<{}>
	text: Text
	absolute: Align<{}>
	column: AlignHorizontal<{}> & {
		container: AlignVertical<{}>
	}
	row: AlignVertical<{}> & {
		container: AlignHorizontal<{}>
	}
	flex: Sizes<{}>
}

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
const mapSideSizes = (decl: Sizes<number>, type: string, side: string) =>
	StyleSheet.create({
		tiny: mapSideSize(type, side, decl.tiny),
		small: mapSideSize(type, side, decl.small),
		medium: mapSideSize(type, side, decl.medium),
		large: mapSideSize(type, side, decl.large),
		big: mapSideSize(type, side, decl.big),
		huge: mapSideSize(type, side, decl.huge),
	})
const mapSides = (decl: Sizes<number>, type: string) => ({
	top: mapSideSizes(decl, type, 'top'),
	bottom: mapSideSizes(decl, type, 'bottom'),
	left: mapSideSizes(decl, type, 'left'),
	right: mapSideSizes(decl, type, 'right'),
	vertical: mapSideSizes(decl, type, 'vertical'),
	horizontal: mapSideSizes(decl, type, 'horizontal'),
})
const mapBorderRadiusSizes = (decl: Declaration, map: (value: number) => {}) => ({
	...StyleSheet.create({
		tiny: map(decl.sides.tiny),
		small: map(decl.sides.small),
		medium: map(decl.sides.medium),
		large: map(decl.sides.large),
		big: map(decl.sides.big),
		huge: map(decl.sides.huge),
	}),
	compute: (radius: number) => StyleSheet.create({ compute: map(radius) }).compute,
})
const mapBorderRadiusSides = (decl: Declaration) => ({
	top: mapBorderRadiusSizes(decl, (radius) => ({
		borderTopLeftRadius: radius,
		borderTopRightRadius: radius,
	})),
	left: mapBorderRadiusSizes(decl, (radius) => ({
		borderTopLeftRadius: radius,
		borderBottomLeftRadius: radius,
	})),
	right: mapBorderRadiusSizes(decl, (radius) => ({
		borderTopRightRadius: radius,
		borderBottomRightRadius: radius,
	})),
	bottom: mapBorderRadiusSizes(decl, (radius) => ({
		borderBottomLeftRadius: radius,
		borderBottomRightRadius: radius,
	})),
	vertical: mapBorderRadiusSizes(decl, (radius) => ({ borderRadius: radius })),
	horizontal: mapBorderRadiusSizes(decl, (radius) => ({ borderRadius: radius })),
})
const mapBorderShadowIOS = (
	_defaultValues = {
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.2,
	},
): Sizes<{}> =>
	StyleSheet.create({
		tiny: { ..._defaultValues, shadowRadius: 1 },
		small: { ..._defaultValues, shadowRadius: 2 },
		medium: { ..._defaultValues, shadowRadius: 3 },
		large: { ..._defaultValues, shadowRadius: 5 },
		big: { ..._defaultValues, shadowRadius: 8 },
		huge: { ..._defaultValues, shadowRadius: 13 },
	})
const mapBorderShadowAndroid = (): Sizes<{}> =>
	StyleSheet.create({
		tiny: { elevation: 1 },
		medium: { elevation: 2 },
		small: { elevation: 3 },
		large: { elevation: 4 },
		big: { elevation: 5 },
		huge: { elevation: 6 },
	})
const mapBorder = (decl: Declaration) => ({
	radius: {
		...mapBorderRadiusSizes(decl, (radius) => ({
			borderRadius: radius,
		})),
		...mapBorderRadiusSides(decl),
	},
	shadow: Platform.select({ ios: mapBorderShadowIOS(), android: mapBorderShadowAndroid() }),
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
		...mapSides(decl.sides, 'padding'),
	},
	margin: {
		tiny: { margin: decl.sides.tiny },
		small: { margin: decl.sides.small },
		medium: { margin: decl.sides.medium },
		large: { margin: decl.sides.large },
		big: { margin: decl.sides.big },
		huge: { margin: decl.sides.huge },
		...mapSides(decl.sides, 'margin'),
	},
	border: mapBorder(decl),
	text: {
		color: mapColorsDeclaration(decl.colors, (v) => ({ color: v })),
		...StyleSheet.create({
			family: { fontFamily: decl.text.family },
			bold: { fontWeight: 'bold' },
			italic: { fontStyle: 'italic' },
		}),
		size: StyleSheet.create({
			tiny: { fontSize: decl.text.sizes.tiny },
			small: { fontSize: decl.text.sizes.small },
			medium: { fontSize: decl.text.sizes.medium },
			large: { fontSize: decl.text.sizes.large },
			big: { fontSize: decl.text.sizes.big },
			huge: { fontSize: decl.text.sizes.huge },
		}),
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
		...StyleSheet.create({
			top: { alignSelf: 'flex-start' },
			bottom: { alignSelf: 'flex-end' },
			justify: { alignSelf: 'center' },
			fill: { alignSelf: 'stretch' },
		}),
		container: StyleSheet.create({
			left: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'flex-start' },
			right: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'flex-end' },
			center: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-evenly' },
			fill: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between' },
		}),
	},
	column: {
		...StyleSheet.create({
			left: { alignSelf: 'flex-start' },
			right: { alignSelf: 'flex-end' },
			center: { alignSelf: 'center' },
			fill: { alignSelf: 'stretch' },
		}),
		container: StyleSheet.create({
			top: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' },
			bottom: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end' },
			justify: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-evenly' },
			fill: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between' },
		}),
	},
	flex: {
		tiny: { flex: 1 },
		small: { flex: 2 },
		medium: { flex: 3 },
		large: { flex: 5 },
		big: { flex: 8 },
		huge: { flex: 13 },
	},
	absolute: StyleSheet.create({
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
		small: 8,
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

const defaultStyles = mapDeclaration(defaultStylesDeclaration)

export type SetStylesDeclaration = (
	decl: Declaration,
	setStyles: React.Dispatch<React.SetStateAction<Styles>>,
) => void
const setStylesDeclaration: SetStylesDeclaration = (decl, setStyles) =>
	setStyles(mapDeclaration(decl))

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
