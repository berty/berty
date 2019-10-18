import { StyleSheet } from 'react-native'
import { Platform } from 'react-native'

export const colors = {
	white: '#FFFFFF',
	black: '#2B2E4D',
	blue: '#525BEC',
	red: '#F64278',
	yellow: '#FFBF47',
	green: '#20D6B5',
	// Light
	lightBlue: '#CED2FF',
	lightRed: '#FFCED8',
	lightGreen: '#D3F8F2',
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
	textWhite: { color: colors.white },
	textBlack: { color: colors.black },
	textBlue: { color: colors.blue },
	textRed: { color: colors.red },
	textYellow: { color: colors.yellow },
	textGreen: { color: colors.green },
	textLight: { color: colors.textLight },
	bgWhite: { backgroundColor: colors.white },
	bgBlack: { backgroundColor: colors.black },
	bgBlue: { backgroundColor: colors.blue },
	bgRed: { backgroundColor: colors.red },
	bgYellow: { backgroundColor: colors.yellow },
	bgLightBlue: { backgroundColor: colors.lightBlue },
	bgLightRed: { backgroundColor: colors.lightRed },
	bgLightGreen: { backgroundColor: colors.lightGreen },
	bgDarkgray: { backgroundColor: colors.darkGray },

	flex: { flex: 1 },
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

	spaceEvenly: { justifyContent: 'space-evenly' },
	spaceAround: { justifyContent: 'space-around' },
	spaceBetween: { justifyContent: 'space-between' },
	spaceCenter: { justifyContent: 'center' },

	alignItems: { alignItems: 'center' },
	justifyContent: { justifyContent: 'center' },

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
	paddingBottom: { paddingBottom: 16, bottom: 16 },

	littlePadding: { padding: 12 },
	littlePaddingTop: { paddingTop: 12 },
	littlePaddingBottom: { paddingBottom: 12 },
	littlePaddingRight: { paddingRight: 12 },
	littlePaddingLeft: { paddingLeft: 12 },
	bigPadding: { padding: 30 },
	bigPaddingLeft: { paddingLeft: 30 },
	bigPaddingRight: { paddingRight: 30 },
	bigPaddingBottom: { paddingBottom: 30, bottom: 30 },
	bigPaddingTop: { paddingTop: 30 },

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

	borderTopLeftRadius: { borderTopLeftRadius: 20 },
	borderTopRightRadius: { borderTopRightRadius: 20 },
	borderBottomLeftRadius: { borderBottomLeftRadius: 30 },
	borderBottomRightRadius: { borderBottomRightRadius: 30 },

	borderRadius: { borderRadius: 16 },
	littleBorderRadius: { borderRadius: 10 },
	buttonShadow: Platform.select({
		ios: {
			shadowOffset: { width: 0, height: 8 },
			shadowColor: '#ABAED1',
			shadowOpacity: 0.3,
			shadowRadius: 9,
		},
		android: {
			elevation: 4,
		},
	}),
})

export default styles
