import React, { useState } from 'react'
import { View, TouchableOpacity, StyleSheet, StyleProp } from 'react-native'
import { Text, Icon, Toggle } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'
import { CircleAvatar } from './CircleAvatar'

//
// Button Setting
//

// Type
type SettingButtonProps = {
	name: string
	image?: string
	icon?: string
	iconSize?: number
	iconColor?: string
	iconDependToggle?: boolean
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
	style?: StyleProp<any>[]
	// action
	previewValue?: string
	previewValueColor?: string
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
	image = null,
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
	previewValueColor = colors.black,
	alone = true,
	toggled = false,
	style = null,
	actionIcon = !toggled && 'arrow-ios-forward',
}) => {
	const [isToggle, setIsToggle] = useState()

	return (
		<TouchableOpacity
			activeOpacity={toggled ? 1 : 0.2}
			style={[
				_stylesSettingButton.settingButton,
				styles.bgWhite,
				style,
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
					{image && (
						<View>
							<CircleAvatar avatarUri={image} withCircle={false} size={35} />
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
				<View style={[styles.row, styles.center, styles.alignItems]}>
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
									styles.textBold,
									{ color: previewValueColor },
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
	style?: StyleProp<any>
}

// Styles
export const FactionButtonSetting: React.FC<FactionButtonSettingProps> = ({
	children,
	name = null,
	icon = null,
	iconSize = 30,
	iconColor = colors.blue,
	state = {},
	style = null,
}) => (
	<View
		style={[
			styles.bgWhite,
			styles.shadow,
			styles.borderRadius,
			styles.paddingLeft,
			styles.paddingRight,
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
						<Text style={[styles.fontFamily, styles.littlePaddingLeft]} category='s4'>
							{name}
						</Text>
					</View>
					{state && state.value && state.color && state.bgColor && (
						<View style={[styles.rowRev, styles.marginRight, styles.alignItems, styles.flex]}>
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
// ButtonSettingRow => The tree buttons in many settings screens (chat and settings)
//

// Types
type ButtonSettingRowProps = {
	state: {
		name: string
		icon: string
		color: string
		style: StyleProp<any>
	}[]
	numberOfLines?: number
	style?: StyleProp<any>
	styleText?: StyleProp<any>
}

// Styles
const _buttonSettingRowStyles = StyleSheet.create({
	textPadding: {
		paddingTop: 6,
	},
})

export const ButtonSettingRow: React.FC<ButtonSettingRowProps> = ({
	state,
	numberOfLines = 1,
	style = null,
	styleText = null,
}) => (
	<View
		style={[
			styles.flex,
			styles.row,
			styles.spaceBetween,
			styles.alignItems,
			styles.marginTop,
			style,
		]}
	>
		{state.map((obj) => (
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.spaceCenter,
					styles.shadow,
					styles.bgWhite,
					styles.borderRadius,
					obj.style,
				]}
			>
				<Icon name={obj.icon} width={30} height={30} fill={obj.color} />
				<Text
					style={[
						styles.textCenter,
						styles.fontFamily,
						styles.textBlack,
						styleText,
						_buttonSettingRowStyles.textPadding,
					]}
					category='s4'
					numberOfLines={numberOfLines}
				>
					{obj.name}
				</Text>
			</TouchableOpacity>
		))}
	</View>
)

//
// ButtonSettingItem
//

// Types
type ButtonSettingItem = {
	value: string
	color?: string
	icon?: string
	iconSize?: number
	iconColor?: string
}

// Styles
const _buttonSettingItemStyles = StyleSheet.create({
	updateFeatureText: {
		fontSize: 11,
		paddingLeft: 8,
	},
})

export const ButtonSettingItem: React.FC<ButtonSettingItem> = ({
	value,
	color = colors.white,
	icon = 'checkmark-circle-2',
	iconSize = 12,
	iconColor = colors.lightBlue,
}) => (
	<View style={[styles.row, styles.littlePaddingLeft, styles.alignItems]}>
		<Icon name={icon} width={iconSize} height={iconSize} fill={iconColor} />
		<Text style={[styles.textBold, _buttonSettingItemStyles.updateFeatureText, { color }]}>
			{value}
		</Text>
	</View>
)
