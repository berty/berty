import React, { useState } from 'react'
import { View, TouchableOpacity, StyleSheet, StyleProp } from 'react-native'
import { Text, Icon, Toggle } from 'react-native-ui-kitten'
import { styles, colors, useStyles, ColorsTypes } from '@berty-tech/styles'
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
	iconColor?: ColorsTypes
	iconDependToggle?: boolean
	children?: React.ReactNode
	state?: {
		value: string
		color: ColorsTypes
		bgColor: string
		icon?: string
		iconSize?: number
		iconColor?: ColorsTypes
		stateIcon?: string
		stateIconColor?: ColorsTypes
	}
	alone?: boolean
	toggled?: boolean
	actionIcon?: string
	actionIconSize?: number
	actionIconColor?: ColorsTypes
	actionToggle?: React.Dispatch<React.SetStateAction<any>>
	varToggle?: boolean
	style?: StyleProp<any>[]
	// action
	previewValue?: string
	previewValueColor?: ColorsTypes
	onPress?: () => void
	//
	disabled?: boolean
}

// Style
const useStylesSettingButton = () => {
	const [{ flex, padding, margin }] = useStyles()
	return {
		settingButton: flex.tiny,
		statePaddingBox: [padding.vertical.scale(2), padding.horizontal.scale(8)],
		descBox: [margin.left.scale(20), margin.bottom.medium],
	}
}

export const ButtonSetting: React.FC<SettingButtonProps> = ({
	name,
	image = null,
	icon = null,
	iconSize = 30,
	iconColor = 'blue',
	iconDependToggle = false,
	children = null,
	state = {},
	actionIconColor = 'black',
	actionIconSize = 25,
	actionToggle = null,
	varToggle = null,
	previewValue = null,
	previewValueColor = 'black',
	alone = true,
	toggled = false,
	style = null,
	actionIcon = !toggled && 'arrow-ios-forward',
	onPress,
	disabled = false,
}) => {
	const [isToggle, setIsToggle] = useState()
	const _styles = useStylesSettingButton()
	const [{ background, margin, row, flex, padding, opacity, text, border }] = useStyles()

	return (
		<TouchableOpacity
			activeOpacity={
				toggled && !disabled
					? 1
					: 0.2 || (disabled && !toggled)
					? 0.5
					: 0.2 || (toggled && disabled)
					? 0.5
					: 0.2
			}
			style={[
				_styles.settingButton,
				background.white,
				style,
				{ minHeight: 60 },
				alone ? border.radius.medium : null,
				alone ? border.shadow.medium : null,
				alone ? margin.top.scale(20) : null,
				disabled ? opacity(0.5) : null,
			]}
			onPress={onPress}
		>
			<View
				style={[
					flex.tiny,
					row.fill,
					alone && padding.horizontal.medium,
					children && alone && padding.top.medium,
					{ alignItems: 'center' },
				]}
			>
				<View style={[row.left, { alignItems: 'center' }]}>
					{icon && iconSize && iconColor && (
						<View>
							<Icon
								style={[
									iconDependToggle &&
										((actionToggle && !varToggle) || (!actionToggle && !isToggle)) &&
										opacity(0.3),
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
						<Text style={[padding.left.small, text.color.black]}>{name}</Text>
					</View>
				</View>
				<View style={[row.center, { alignItems: 'center' }]}>
					{state && state.value && state.color && state.bgColor && (
						<View style={[row.left, margin.right.medium, { alignItems: 'center' }]}>
							{state && state.icon && (
								<Icon
									style={[margin.right.small]}
									name={state.icon}
									width={state.iconSize}
									height={state.iconSize}
									fill={state.iconColor}
								/>
							)}
							<View
								style={[
									row.fill,
									border.radius.medium,
									{ backgroundColor: state.bgColor, alignItems: 'center' },
									_styles.statePaddingBox,
								]}
							>
								{state.stateIcon && (
									<Icon
										style={[row.item.justify, margin.right.scale(5)]}
										name={state.stateIcon}
										width={13}
										height={13}
										fill={state.stateIconColor}
									/>
								)}
								<Text
									style={[
										text.align.center,
										text.size.scale(8),
										text.bold.medium,
										{ color: state.color },
									]}
								>
									{state.value}
								</Text>
							</View>
						</View>
					)}
					{previewValue && (
						<View>
							<Text style={[padding.right.small, text.bold.medium, { color: previewValueColor }]}>
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
							disabled={disabled}
							style={padding.right.scale(5)}
							status='primary'
							checked={varToggle || isToggle}
							onChange={
								actionToggle ? () => actionToggle(!varToggle) : () => setIsToggle(!isToggle)
							}
						/>
					)}
				</View>
			</View>
			{children && <View style={[_styles.descBox]}>{children}</View>}
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
	iconColor?: ColorsTypes
	state?: {
		value: string
		color: ColorsTypes
		bgColor: ColorsTypes
		icon?: string
		iconSize?: number
		iconColor?: ColorsTypes
		stateIcon?: string
		stateIconColor?: ColorsTypes
	}
	style?: StyleProp<any>
	disabled?: boolean
}

// Styles
export const FactionButtonSetting: React.FC<FactionButtonSettingProps> = ({
	children,
	name = null,
	icon = null,
	iconSize = 30,
	iconColor = 'blue',
	state = {},
	style = null,
	disabled = false,
}) => {
	const _styles = useStylesSettingButton()
	const [{ background, border, padding, flex, height, row, opacity, margin, text }] = useStyles()
	return (
		<View
			style={[
				background.white,
				border.shadow.medium,
				border.radius.medium,
				padding.horizontal.medium,
				disabled && opacity(0.5),
				style,
			]}
		>
			{name && icon && iconSize && iconColor && (
				<View style={[height(60), flex.tiny]}>
					<View style={[row.left, flex.tiny, { alignItems: 'center' }]}>
						{icon && iconSize && iconColor && (
							<View>
								<Icon name={icon} width={iconSize} height={iconSize} fill={iconColor} />
							</View>
						)}
						<View>
							<Text style={[padding.left.small]}>{name}</Text>
						</View>
						{state && state.value && state.color && state.bgColor && (
							<View
								style={[
									margin.right.medium,
									flex.tiny,
									{ flexDirection: 'row-reverse', alignItems: 'center' },
								]}
							>
								{state && state.icon && (
									<Icon
										style={[margin.right.small]}
										name={state.icon}
										width={state.iconSize}
										height={state.iconSize}
										fill={state.iconColor}
									/>
								)}
								<View
									style={[
										row.center,
										border.radius.medium,
										{ backgroundColor: state.bgColor, alignItems: 'center' },
										_styles.statePaddingBox,
									]}
								>
									{state.stateIcon && (
										<Icon
											style={[row.item.justify, margin.right.scale(5)]}
											name={state.stateIcon}
											width={13}
											height={13}
											fill={state.stateIconColor}
										/>
									)}
									<Text
										style={[
											row.item.justify,
											text.size.scale(8),
											text.bold.medium,
											{ color: state.color },
										]}
									>
										{state.value}
									</Text>
								</View>
							</View>
						)}
					</View>
					<View style={[border.color.grey, border.medium, opacity(0.2), margin.horizontal.small]} />
				</View>
			)}
			{children && Array.isArray(children) ? (
				children.map((child, key) => (
					<View>
						{child}
						{key + 1 < children.length && (
							<View
								style={[border.color.grey, border.medium, opacity(0.2), margin.horizontal.small]}
							/>
						)}
					</View>
				))
			) : (
				<View>{children}</View>
			)}
		</View>
	)
}
//
// ButtonSettingRow => The tree buttons in many settings screens (chat and settings)
//

// Types
type ButtonSettingRowProps = {
	state: {
		name: string
		icon: string
		color: ColorsTypes
		style: StyleProp<any>
		onPress?: () => void
		disabled?: boolean
	}[]
	numberOfLines?: number
	style?: StyleProp<any>
	styleText?: StyleProp<any>
}

// Styles
const useStylesButtonSettingRow = () => {
	const [{ padding }] = useStyles()
	return {
		textPadding: padding.top.scale(6),
	}
}

export const ButtonSettingRow: React.FC<ButtonSettingRowProps> = ({
	state,
	numberOfLines = 1,
	style = null,
	styleText = null,
}) => {
	const _styles = useStylesButtonSettingRow()
	const [{ flex, row, margin, padding, border, background, text, opacity }] = useStyles()
	return (
		<View style={[flex.tiny, row.fill, margin.top.medium, style, { alignItems: 'center' }]}>
			{state.map((obj) => (
				<TouchableOpacity
					activeOpacity={obj.disabled ? 0.5 : 1}
					style={[
						flex.tiny,
						padding.medium,
						border.radius.medium,
						border.shadow.medium,
						background.white,
						obj.style,
						obj.disabled ? opacity(0.5) : null,
						{ alignItems: 'center', justifyContent: 'center' },
					]}
					onPress={obj.onPress}
				>
					<Icon name={obj.icon} width={30} height={30} fill={obj.color} />
					<Text
						style={[
							text.align.center,
							text.color.black,
							text.size.medium,
							styleText,
							_styles.textPadding,
						]}
						numberOfLines={numberOfLines}
					>
						{obj.name}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	)
}

//
// ButtonSettingItem
//

// Types
type ButtonSettingItem = {
	value: string
	color?: ColorsTypes
	icon?: string
	iconSize?: number
	iconColor?: ColorsTypes
}

// Styles
const useStylesButtonSettingItem = () => {
	const [{ text, padding }] = useStyles()
	return {
		updateFeatureText: [text.size.scale(11), padding.left.scale(8)],
	}
}

export const ButtonSettingItem: React.FC<ButtonSettingItem> = ({
	value,
	color = 'white',
	icon = 'checkmark-circle-2',
	iconSize = 12,
	iconColor = colors.lightBlue,
}) => {
	const _styles = useStylesButtonSettingItem()
	const [{ row, padding, text }] = useStyles()
	return (
		<View style={[row.left, padding.left.small, { alignItems: 'center' }]}>
			<Icon name={icon} width={iconSize} height={iconSize} fill={iconColor} />
			<Text style={[text.bold.medium, _styles.updateFeatureText, { color }]}>{value}</Text>
		</View>
	)
}
