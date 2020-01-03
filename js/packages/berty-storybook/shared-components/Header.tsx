import React from 'react'
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'

//
// Header Settings
//

// Type
type HeaderSettingsProps = {
	title?: string
	children?: React.ReactNode
	bgColor?: string
	undo?: () => void
	undoIcon?: string
	undoIconSize?: number
	undoIconColor?: string
	desc?: string | null
	descFontSize?: number
	descColor?: string
	action?: React.Dispatch<any>
	actionValue?: boolean
	actionIcon?: string
	actionIconSize?: number
	actionIconColor?: string
}

export const HeaderSettings: React.FC<HeaderSettingsProps> = ({
	title = null,
	children = null,
	bgColor = colors.blue,
	undo,
	undoIcon = 'arrow-back-outline',
	undoIconSize = 25,
	undoIconColor = colors.white,
	desc = null,
	descFontSize = 10,
	descColor = colors.white,
	action = null,
	actionValue = null,
	actionIcon = 'swap',
	actionIconSize = 25,
	actionIconColor = colors.white,
}) => (
	<SafeAreaView
		style={[
			styles.flex,
			styles.borderBottomLeftRadius,
			styles.borderBottomRightRadius,
			{ backgroundColor: bgColor },
		]}
	>
		<View style={[styles.padding]}>
			<View style={[styles.row, styles.justifyContent, styles.flex]}>
				{undo && (
					<TouchableOpacity style={[styles.flex, styles.start, styles.center]} onPress={undo}>
						<Icon name={undoIcon} width={undoIconSize} height={undoIconSize} fill={undoIconColor} />
					</TouchableOpacity>
				)}
				{title && (
					<View style={[styles.spaceCenter]}>
						<Text
							style={[
								styles.textBold,
								styles.fontFamily,
								styles.textWhite,
								{ fontSize: 25, lineHeight: 25 * 0.75, paddingTop: 35 - 35 * 0.75 },
							]}
						>
							{title}
						</Text>
					</View>
				)}
				{(action || actionIcon) && (
					<View style={[styles.flex, styles.end, styles.center]}>
						<TouchableOpacity style={[styles.end]} onPress={() => action && action(!actionValue)}>
							<Icon
								name={actionIcon}
								width={actionIconSize}
								height={actionIconSize}
								fill={actionIconColor}
							/>
						</TouchableOpacity>
					</View>
				)}
			</View>
			{desc && (
				<Text
					style={[
						styles.center,
						{ fontSize: descFontSize, color: descColor },
						styles.textCenter,
						styles.bigPaddingLeft,
						styles.bigPaddingRight,
					]}
				>
					{desc}
				</Text>
			)}
			{children}
		</View>
	</SafeAreaView>
)

//
// Header Info Settings
//

// Type
type HeaderInfoSettingsProps = {
	children: React.ReactNode
	bgColor?: string
}

// Style
const _headerInfoSettingsStyles = StyleSheet.create({
	headerInfoSettings: { backgroundColor: 'rgba(206,210,255,0.3)' },
})

export const HeaderInfoSettings: React.FC<HeaderInfoSettingsProps> = ({ children, bgColor }) => (
	<View
		style={[
			styles.marginLeft,
			styles.marginRight,
			styles.borderRadius,
			styles.padding,
			styles.marginTop,
			_headerInfoSettingsStyles.headerInfoSettings,
		]}
	>
		<View style={[styles.justifyContent]}>{children}</View>
	</View>
)

export default HeaderSettings
