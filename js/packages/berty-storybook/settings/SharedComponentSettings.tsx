import React, { useState, useEffect } from 'react'
import {
	View,
	TouchableOpacity,
	StyleSheet,
	LayoutChangeEvent,
	SafeAreaView,
	StyleProp,
} from 'react-native'
import { Text, Icon, Toggle } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'

//
// Button Setting
//

// Type
type SettingButtonProps = {
	icon?: string
	iconSize?: number
	iconColor?: string
	iconDependToggle?: boolean
	name: string
	children?: React.ReactNode
	state?: {
		value: string
		color: string
		bgColor: string
		icon?: string
		iconSize?: number
		iconColor?: string
		stateIcon?: string
		stateIconColor?: string
	}
	alone?: boolean
	toggled?: boolean
	actionIcon?: string
	actionIconSize?: number
	actionIconColor?: string
	actionToggle?: React.Dispatch<React.SetStateAction<any>>
	varToggle?: boolean
	// action
	previewValue?: string
}

// Style
const _stylesSettingButton = StyleSheet.create({
	settingButton: { flex: 1, minHeight: 60 },
	statePaddingBox: {
		paddingTop: 2,
		paddingBottom: 2,
		paddingLeft: 8,
		paddingRight: 8,
	},
	descBox: { marginLeft: 20, marginBottom: 16 },
})

export const ButtonSetting: React.FC<SettingButtonProps> = ({
	name,
	icon = null,
	iconSize = 30,
	iconColor = colors.blue,
	iconDependToggle = false,
	children = null,
	state = {},
	actionIconColor = colors.black,
	actionIconSize = 25,
	actionToggle = null,
	varToggle = null,
	previewValue = null,
	alone = true,
	toggled = false,
	actionIcon = !toggled && 'arrow-ios-forward',
}) => {
	const [layout, setLayout] = useState()
	const [isToggle, setIsToggle] = useState()

	const handleLayout = (e: LayoutChangeEvent) => {
		setLayout(e.nativeEvent.layout.width)
	}

	const handleChangeToggle = () => {
		setIsToggle(!isToggle)
	}

	return (
		<TouchableOpacity
			activeOpacity={toggled ? 1 : 0.2}
			style={[
				_stylesSettingButton.settingButton,
				styles.bgWhite,
				alone ? styles.borderRadius : null,
				alone ? styles.shadow : null,
				alone ? { marginTop: 20 } : null,
			]}
		>
			<View
				style={[
					styles.flex,
					styles.row,
					alone && styles.paddingRight,
					alone && styles.paddingLeft,
					styles.alignItems,
					children && alone && styles.paddingTop,
				]}
			>
				<View style={[styles.row, styles.alignVertical]}>
					{icon && iconSize && iconColor && (
						<View>
							<Icon
								style={[
									iconDependToggle &&
										((actionToggle && !varToggle) || (!actionToggle && !isToggle)) && {
											opacity: 0.3,
										},
								]}
								name={icon}
								width={iconSize}
								height={iconSize}
								fill={iconColor}
							/>
						</View>
					)}
					<View>
						<Text
							style={[styles.fontFamily, styles.littlePaddingLeft, { color: colors.black }]}
							category='s4'
						>
							{name}
						</Text>
					</View>
				</View>
				<View
					onLayout={(e) => handleLayout(e)}
					style={[styles.row, styles.center, styles.alignItems]}
				>
					{state && state.value && state.color && state.bgColor && (
						<View style={[styles.row, styles.marginRight, styles.alignItems]}>
							{state && state.icon && (
								<Icon
									style={[styles.littleMarginRight]}
									name={state.icon}
									width={state.iconSize}
									height={state.iconSize}
									fill={state.iconColor}
								/>
							)}
							<View
								style={[
									styles.row,
									styles.spaceEvenly,
									styles.alignItems,
									styles.borderRadius,
									{ backgroundColor: state.bgColor },
									_stylesSettingButton.statePaddingBox,
								]}
							>
								{state.stateIcon && (
									<Icon
										style={[styles.center, { marginRight: 5 }]}
										name={state.stateIcon}
										width={13}
										height={13}
										fill={state.stateIconColor}
									/>
								)}
								<Text
									style={[styles.center, { color: state.color, fontSize: 8, fontWeight: 'bold' }]}
								>
									{state.value}
								</Text>
							</View>
						</View>
					)}
					{previewValue && (
						<View>
							<Text
								style={[
									styles.fontFamily,
									styles.littlePaddingRight,
									{ fontWeight: 'bold', color: colors.black },
								]}
								category='s4'
							>
								{previewValue}
							</Text>
						</View>
					)}
					{actionIcon && (
						<Icon
							name={actionIcon}
							width={actionIconSize}
							height={actionIconSize}
							fill={actionIconColor}
						/>
					)}
					{toggled && (
						<Toggle
							style={{ paddingRight: 5 }}
							status='primary'
							checked={varToggle || isToggle}
							onChange={
								actionToggle ? () => actionToggle(!varToggle) : () => setIsToggle(!isToggle)
							}
						/>
					)}
				</View>
			</View>
			{children && <View style={[_stylesSettingButton.descBox]}>{children}</View>}
		</TouchableOpacity>
	)
}

//
// Faction Button Setting
//

// Types
type FactionButtonSettingProps = {
	children: React.ReactNode[] | React.ReactNode
	name?: string
	icon?: string
	iconSize?: number
	iconColor?: string
	style?: StyleProp<any>
}

// Styles

export const FactionButtonSetting: React.FC<FactionButtonSettingProps> = ({
	children,
	name = null,
	icon = null,
	iconSize = 0,
	iconColor = null,
	style = null,
}) => (
	<View
		style={[
			styles.bgWhite,
			styles.shadow,
			styles.borderRadius,
			styles.littlePaddingLeft,
			styles.littlePaddingRight,
			style,
		]}
	>
		{name && icon && iconSize && iconColor && (
			<View style={[{ flex: 1, height: 60 }]}>
				<View style={[styles.row, styles.alignVertical]}>
					{icon && iconSize && iconColor && (
						<View>
							<Icon name={icon} width={iconSize} height={iconSize} fill={iconColor} />
						</View>
					)}
					<View>
						<Text
							style={[styles.fontFamily, styles.littlePaddingLeft, { fontWeight: 'bold' }]}
							category='s4'
						>
							{name}
						</Text>
					</View>
				</View>
				<View
					style={[
						{ borderColor: 'gray', opacity: 0.2, borderWidth: 0.5 },
						styles.littleMarginRight,
						styles.littleMarginLeft,
					]}
				/>
			</View>
		)}
		{children && Array.isArray(children) ? (
			children.map((child, key) => (
				<View>
					{child}
					{key + 1 < children.length && (
						<View
							style={[
								{ borderColor: 'gray', opacity: 0.2, borderWidth: 0.5 },
								styles.littleMarginRight,
								styles.littleMarginLeft,
							]}
						/>
					)}
				</View>
			))
		) : (
			<View>{children}</View>
		)}
	</View>
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
const _stylesHeaderInfoSettings = StyleSheet.create({})

export const HeaderInfoSettings: React.FC<HeaderInfoSettingsProps> = ({ children, bgColor }) => (
	<View
		style={[
			{ backgroundColor: 'rgba(206,210,255,0.3)' },
			styles.marginLeft,
			styles.marginRight,
			styles.borderRadius,
			styles.padding,
			styles.marginTop,
		]}
	>
		<View style={[styles.justifyContent]}>{children}</View>
	</View>
)

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

export default ButtonSetting
