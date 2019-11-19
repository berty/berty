import React from 'react'
import { View, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../../styles'

//
// Header Settings
//

// Type
type HeaderSettingsProps = {
	title: string
	children?: React.ReactNode
	// titleSize?: number
	// titleColor?: string
	bgColor?: string
	undo?: boolean
	undoIcon?: string
	undoIconSize?: number
	undoIconColor?: string
	desc?: string
	descFontSize?: number
	descColor?: string
	action?: React.Dispatch<any>
	actionValue?: boolean
	actionIcon?: string
	actionIconSize?: number
	actionIconColor?: string
}

export const HeaderSettings: React.FC<HeaderSettingsProps> = ({
	title,
	children = null,
	bgColor = colors.blue,
	undo = true,
	undoIcon = 'arrow-back-outline',
	undoIconSize = 30,
	undoIconColor = colors.white,
	desc = null,
	descFontSize = 10,
	descColor = colors.white,
	action = null,
	actionValue = null,
	actionIcon = 'swap',
	actionIconSize = 30,
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
			<View style={[styles.row, styles.justifyContent]}>
				{undo && (
					<TouchableOpacity style={[styles.flex, styles.start, styles.center]}>
						<Icon name={undoIcon} width={undoIconSize} height={undoIconSize} fill={undoIconColor} />
					</TouchableOpacity>
				)}
				<View style={[styles.center]}>
					<Text category='h3' style={[styles.fontFamily, styles.textWhite, styles.center]}>
						{title}
					</Text>
				</View>
				<View style={[styles.flex, styles.end, styles.center]}>
					{action && (
						<TouchableOpacity style={[styles.end]} onPress={() => action(!actionValue)}>
							<Icon
								name={actionIcon}
								width={actionIconSize}
								height={actionIconSize}
								fill={actionIconColor}
							/>
						</TouchableOpacity>
					)}
				</View>
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
