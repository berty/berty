import React, { ReactNode, useEffect, useState } from 'react'
import {
	View,
	TouchableOpacity,
	StyleProp,
	Animated,
	Easing,
	TextInput,
	ScrollView,
} from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store/hooks'
import { Toggle } from '@berty/components/shared-components/Toggle'
import { UnifiedText } from './UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const Section: React.FC<{}> = ({ children }) => {
	const { margin, border, padding } = useStyles()
	const colors = useThemeColor()
	return (
		<View style={[margin.top.large, padding.horizontal.medium]}>
			<View
				style={[
					border.radius.medium,
					{
						flex: 1,
						backgroundColor: colors['main-background'],
					},
				]}
			>
				{children}
			</View>
		</View>
	)
}

export const ButtonSettingV2: React.FC<{
	text: string
	icon?: string
	arrowIcon?: string
	onPress?: (...args: any) => void
	toggle?: {
		enable: boolean
		value?: boolean
		action?: () => Promise<void>
	}
	color?: string
	pack?: string
	disabled?: boolean
	last?: boolean
}> = ({
	text,
	icon,
	arrowIcon = 'arrow-ios-forward',
	onPress,
	color,
	toggle,
	pack,
	disabled = false,
	last = false,
}) => {
	const { padding, margin, opacity } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	if (!color) {
		color = colors['background-header']
	}
	const heightButton = 55
	const disabledOpacity = 0.3

	return (
		<>
			<TouchableOpacity
				onPress={!disabled ? onPress : () => {}}
				activeOpacity={disabled ? disabledOpacity : 0.2}
				style={[
					padding.vertical.medium,
					padding.horizontal.medium,
					disabled && opacity(disabledOpacity),
					{
						height: heightButton * scaleSize,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
					},
				]}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{icon && (
						<View style={[{ height: heightButton, flexDirection: 'row', alignItems: 'center' }]}>
							<Icon
								name={icon}
								width={20 * scaleSize}
								height={20 * scaleSize}
								pack={pack}
								fill={color}
							/>
						</View>
					)}
					<View
						style={[
							margin.left.small,
							{ height: heightButton, flexDirection: 'row', alignItems: 'center' },
						]}
					>
						<UnifiedText>{text}</UnifiedText>
					</View>
				</View>

				{toggle?.enable && !disabled ? (
					<Toggle
						style={padding.right.scale(5)}
						status='primary'
						checked={toggle?.value}
						onChange={async () => {
							if (toggle && toggle?.action) {
								await toggle?.action()
							}
						}}
					/>
				) : (
					<Icon
						name={arrowIcon}
						width={20 * scaleSize}
						height={20 * scaleSize}
						fill={colors['main-text']}
					/>
				)}
			</TouchableOpacity>
			{!last && (
				<View style={{ flex: 1, height: 1, backgroundColor: colors['secondary-background'] }} />
			)}
		</>
	)
}

//
// Button Setting
//

// Type

export type SettingButtonStateType = {
	value: string
	color: string
	bgColor: string
	icon?: string
	iconSize?: number
	iconColor?: string
	stateIcon?: string
	stateIconColor?: string
}

type SettingButtonProps = {
	name: string
	color?: string
	textSize?: number | null
	image?: string
	icon?: string
	iconSize?: number
	iconColor?: string
	iconPack?: string
	iconDependToggle?: boolean
	children?: React.ReactNode
	state?: SettingButtonStateType
	alone?: boolean
	toggled?: boolean
	actionIcon?: string | null
	actionIconAngle?: Animated.AnimatedInterpolation | null
	actionIconSize?: number
	actionIconColor?: string
	actionToggle?: any
	varToggle?: boolean
	toggleStatus?: 'primary' | 'secondary'
	backgroundColor?: string
	style?: StyleProp<any>[]
	textStyle?: StyleProp<any>[]
	// action
	previewValue?: string
	previewValueColor?: string
	onPress?: (...args: any) => void
	disabled?: boolean
	rightComponent?: ReactNode
}

// Style
const useStylesSettingButton = () => {
	const { padding, margin } = useStyles()
	return {
		statePaddingBox: [padding.vertical.tiny, padding.horizontal.small],
		descBox: [margin.left.scale(20), margin.bottom.medium],
	}
}

export const ButtonSetting: React.FC<SettingButtonProps> = ({
	name,
	color = null,
	textSize,
	image = null,
	icon = null,
	iconSize = 30,
	iconPack,
	iconColor,
	iconDependToggle = false,
	children = null,
	state = {},
	actionIconColor,
	actionIconSize = 25,
	actionIconAngle = null,
	actionToggle = null,
	varToggle = null,
	toggleStatus = 'primary',
	previewValue = null,
	previewValueColor,
	alone = true,
	toggled = false,
	backgroundColor = null,
	style = null,
	textStyle = null,
	actionIcon = !toggled && 'arrow-ios-forward',
	onPress,
	disabled = false,
	rightComponent,
}) => {
	const [isToggle, setIsToggle] = useState<boolean>()
	const _styles = useStylesSettingButton()
	const { margin, row, flex, padding, opacity, text, border } = useStyles()
	const { windowWidth, scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	if (!iconColor) {
		iconColor = colors['background-header']
	}
	if (!actionIconColor) {
		actionIconColor = colors['main-text']
	}
	if (!previewValueColor) {
		previewValueColor = colors['main-text']
	}
	if (!backgroundColor) {
		backgroundColor = colors['main-background']
	}
	if (!color) {
		color = colors['main-text']
	}

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
				{ minHeight: 60 * scaleSize, backgroundColor, flex: 1 },
				alone ? border.radius.medium : null,
				alone ? border.shadow.medium : null,
				alone ? { shadowColor: colors.shadow } : null,
				alone ? margin.top.scale(20) : null,
				disabled ? opacity(0.5) : opacity(1),
				style,
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
								pack={iconPack}
								name={icon}
								width={iconSize * scaleSize}
								height={iconSize * scaleSize}
								fill={iconColor}
							/>
						</View>
					)}
					{image && (
						<View>{/*<CircleAvatar avatarUri={image} withCircle={false} size={35} />*/}</View>
					)}
					<View>
						<UnifiedText
							numberOfLines={2}
							style={[
								padding.left.small,
								text.size.scale(textSize || 15),
								{ maxWidth: windowWidth - 150, color },
								textStyle,
							]}
						>
							{name}
						</UnifiedText>
					</View>
				</View>
				<View style={[row.center, { alignItems: 'center' }]}>
					{state && state.value && state.color && state.bgColor ? (
						<View style={[row.left, margin.right.medium, { alignItems: 'center' }]}>
							{state.icon && (
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
								<UnifiedText
									style={[text.align.center, text.size.tiny, text.bold, { color: state.color }]}
								>
									{state.value}
								</UnifiedText>
							</View>
						</View>
					) : null}
					{previewValue && (
						<View>
							<UnifiedText style={[padding.right.small, text.bold, { color: previewValueColor }]}>
								{previewValue}
							</UnifiedText>
						</View>
					)}
					{rightComponent}
					{actionIcon && (
						<Animated.View style={actionIconAngle && { transform: [{ rotateZ: actionIconAngle }] }}>
							<Icon
								name={actionIcon}
								width={actionIconSize}
								height={actionIconSize}
								fill={actionIconColor}
							/>
						</Animated.View>
					)}
					{toggled && (
						<Toggle
							disabled={disabled}
							style={padding.right.scale(5)}
							status={toggleStatus}
							checked={varToggle || isToggle}
							onChange={
								actionToggle
									? () => actionToggle(varToggle ? false : true)
									: () => setIsToggle(!isToggle)
							}
						/>
					)}
				</View>
			</View>
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
	iconPack?: string
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
	disabled?: boolean
	isDropdown?: boolean
}

// Styles
export const FactionButtonSetting: React.FC<FactionButtonSettingProps> = ({
	children,
	name = null,
	icon = null,
	iconSize = 30,
	iconColor,
	iconPack,
	state = {},
	style = null,
	disabled = false,
	isDropdown = false,
}) => {
	const _styles = useStylesSettingButton()
	const { border, padding, flex, height, row, opacity, margin, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const [isCollapse, setIsCollapse] = React.useState<boolean>(true)

	if (!iconColor) {
		iconColor = colors['background-header']
	}

	return (
		<View
			style={[
				border.shadow.medium,
				border.radius.medium,
				padding.horizontal.medium,
				disabled ? opacity(0.5) : opacity(1),
				{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
				style,
			]}
		>
			{name && icon && iconSize && iconColor && (
				<TouchableOpacity
					style={[height(60), flex.tiny]}
					onPress={isDropdown ? () => setIsCollapse(!isCollapse) : () => {}}
				>
					<View
						style={[row.left, flex.tiny, { alignItems: 'center', justifyContent: 'space-between' }]}
					>
						<View style={[row.left, flex.tiny, { alignItems: 'center' }]}>
							{icon && iconSize && iconColor && (
								<View>
									<Icon
										name={icon}
										pack={iconPack}
										width={iconSize * scaleSize}
										height={iconSize * scaleSize}
										fill={iconColor}
									/>
								</View>
							)}
							<View>
								<UnifiedText style={[padding.left.small, text.size.medium]}>{name}</UnifiedText>
							</View>
						</View>
						<View>
							{state && state.value && state.color && state.bgColor && state.iconSize && (
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
											width={state.iconSize * scaleSize}
											height={state.iconSize * scaleSize}
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
												width={13 * scaleSize}
												height={13 * scaleSize}
												fill={state.stateIconColor}
											/>
										)}
										<UnifiedText
											style={[row.item.justify, text.size.tiny, text.bold, { color: state.color }]}
										>
											{state.value}
										</UnifiedText>
									</View>
								</View>
							)}
							{isDropdown ? (
								<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
									<Icon
										name={isCollapse ? 'arrow-ios-downward' : 'arrow-ios-upward'}
										width={25}
										height={25}
										fill={colors['main-text']}
									/>
								</View>
							) : null}
						</View>
					</View>
					<View
						style={[
							border.medium,
							opacity(0.2),
							margin.horizontal.small,
							{ borderColor: colors['secondary-text'] },
						]}
					/>
				</TouchableOpacity>
			)}
			{isDropdown ? (
				<>
					{!isCollapse ? (
						<>
							{children && Array.isArray(children) ? (
								children.map((child, key) => (
									<View key={key}>
										{child}
										{key + 1 < children.length && (
											<View
												style={[
													border.medium,
													opacity(0.2),
													margin.horizontal.small,
													{ borderColor: colors['secondary-text'] },
												]}
											/>
										)}
									</View>
								))
							) : (
								<View>{children}</View>
							)}
						</>
					) : (
						<></>
					)}
				</>
			) : (
				<>
					{children && Array.isArray(children) ? (
						children.map((child, key) => (
							<View key={key}>
								{child}
								{key + 1 < children.length && (
									<View
										style={[
											border.medium,
											opacity(0.2),
											margin.horizontal.small,
											{ borderColor: colors['secondary-text'] },
										]}
									/>
								)}
							</View>
						))
					) : (
						<View>{children}</View>
					)}
				</>
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
		color: string
		style: StyleProp<any>
		onPress?: () => void
		disabled?: boolean
		displayComponent?: ReactNode
	}[]
	numberOfLines?: number
	style?: StyleProp<any>
	styleText?: StyleProp<any>
	isScroll?: boolean
}

// Styles
const useStylesButtonSettingRow = () => {
	const { padding } = useStyles()
	return {
		textPadding: padding.top.scale(6),
	}
}

export const ButtonSettingRow: React.FC<ButtonSettingRowProps> = ({
	state,
	numberOfLines = 1,
	style = null,
	styleText = null,
	isScroll = false,
}) => {
	const _styles = useStylesButtonSettingRow()
	const { flex, row, margin, padding, border, text, opacity, width } = useStyles()
	const colors = useThemeColor()

	return (
		<ScrollView
			contentContainerStyle={[
				!isScroll && flex.tiny,
				row.fill,
				margin.top.medium,
				padding.bottom.small,
				style,
				{ justifyContent: 'center' },
			]}
			horizontal
			showsHorizontalScrollIndicator={false}
			scrollEnabled={isScroll}
		>
			{state.map((obj, key) => (
				<TouchableOpacity
					key={key}
					activeOpacity={obj.disabled ? 0.5 : undefined}
					style={[
						padding.medium,
						border.radius.medium,
						border.shadow.medium,
						width(100),
						obj.style,
						obj.disabled ? opacity(0.5) : null,
						{
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: colors['main-background'],
							shadowColor: colors.shadow,
						},
					]}
					onPress={obj.onPress}
				>
					{obj.displayComponent ? (
						obj.displayComponent
					) : (
						<>
							<Icon name={obj.icon} width={30} height={30} fill={obj.color} />
							<UnifiedText
								style={[text.align.center, text.size.medium, styleText, _styles.textPadding]}
								numberOfLines={numberOfLines}
							>
								{obj.name}
							</UnifiedText>
						</>
					)}
				</TouchableOpacity>
			))}
		</ScrollView>
	)
}

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
	styleContainer?: any
	styleText?: any
	disabled?: boolean
}

// Styles
const useStylesButtonSettingItem = () => {
	const { text, padding } = useStyles()
	return {
		updateFeatureText: [text.size.tiny, padding.left.scale(8)],
	}
}

export const ButtonSettingItem: React.FC<ButtonSettingItem> = ({
	value,
	color,
	icon = 'checkmark-circle-2',
	iconSize = 12,
	iconColor,
	styleContainer = {},
	styleText = {},
}) => {
	const _styles = useStylesButtonSettingItem()
	const { row, padding, text } = useStyles()
	const colors = useThemeColor()

	if (!color) {
		color = colors['reverted-main-text']
	}
	return (
		<View style={[row.left, padding.left.small, { alignItems: 'center' }, styleContainer]}>
			<Icon
				name={icon}
				width={iconSize}
				height={iconSize}
				fill={iconColor || colors['positive-asset']}
			/>
			<UnifiedText style={[text.bold, _styles.updateFeatureText, { color }, styleText]}>
				{value}
			</UnifiedText>
		</View>
	)
}

export const ButtonDropDown: React.FC<{ title: string; body: string }> = ({ title, body }) => {
	const [isOpen, setOpen] = useState(false)
	const { padding, margin, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	const [animateHeight] = useState(new Animated.Value(0))
	const [rotateValue] = useState(new Animated.Value(0))
	const rotateAnimation = rotateValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '180deg'],
	})

	return (
		<View
			style={{
				paddingVertical: 10,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				marginLeft: 20,
				paddingRight: 30,
			}}
		>
			<View style={[padding.right.small, { flex: 1, overflow: 'hidden' }]}>
				<UnifiedText style={[{ marginBottom: 12 }, text.size.medium]}>{title}</UnifiedText>
				<Animated.View style={{ maxHeight: animateHeight }}>
					<UnifiedText style={[margin.top.small, text.size.medium]}>{body}</UnifiedText>
				</Animated.View>
			</View>
			<TouchableOpacity
				activeOpacity={0.9}
				style={[{ alignSelf: 'flex-start' }]}
				onPress={() => {
					Animated.parallel([
						Animated.timing(animateHeight, {
							toValue: isOpen ? 0 : 1000,
							duration: isOpen ? 350 : 800,
							easing: isOpen ? Easing.out(Easing.circle) : Easing.linear,
							useNativeDriver: false,
						}),
						Animated.timing(rotateValue, {
							toValue: isOpen ? 0 : 1,
							duration: 150,
							useNativeDriver: true,
						}),
					]).start()

					setOpen(prev => !prev)
				}}
			>
				<Animated.View style={[padding.tiny, { transform: [{ rotate: rotateAnimation }] }]}>
					<Icon
						name='arrow-ios-upward'
						width={25 * scaleSize}
						height={25 * scaleSize}
						fill={colors['main-text']}
					/>
				</Animated.View>
			</TouchableOpacity>
		</View>
	)
}

export const StringOptionInput: React.FC<{
	name: string
	getOptionValue: () => Promise<string> | string
	setOptionValue: (value: string) => Promise<void> | void
	bulletPointValue?: string
	iconColor?: string | undefined
}> = ({ name, bulletPointValue, getOptionValue, setOptionValue, iconColor }) => {
	const { flex, row, text, margin, padding, border } = useStyles()
	const { scaleSize } = useAppDimensions()
	const [value, setValue] = useState('')
	useEffect(() => {
		;(async () => {
			setValue(await getOptionValue())
		})()
	}, [getOptionValue])
	const colors = useThemeColor()

	if (!iconColor) {
		iconColor = colors['alt-secondary-background-header']
	}

	return (
		<ButtonSetting
			name={name}
			icon='message-circle-outline'
			iconColor={iconColor}
			actionIcon={null}
		>
			<View style={[padding.right.small, padding.top.small]}>
				<View
					style={[
						flex.tiny,
						border.radius.medium,
						border.medium,
						padding.horizontal.small,
						row.fill,
						margin.bottom.small,
						{
							height: 45 * scaleSize,
							alignItems: 'center',
							borderColor: colors['main-text'],
						},
					]}
				>
					<TextInput
						autoCorrect={false}
						autoCapitalize='none'
						onChangeText={t => setValue(t)}
						value={value}
						style={[
							text.light,
							text.size.medium,
							flex.scale(8),
							{
								fontFamily: 'Open Sans',
								color: colors['main-text'],
							},
						]}
						multiline
					/>
					<TouchableOpacity
						onPress={async () => {
							await setOptionValue(value)
						}}
					>
						<Icon
							name='checkmark-outline'
							fill={colors['alt-secondary-background-header']}
							width={20}
							height={20}
						/>
					</TouchableOpacity>
				</View>

				{bulletPointValue ? (
					<ButtonSettingItem
						value={bulletPointValue}
						icon='info-outline'
						iconColor={colors['background-header']}
						iconSize={15}
						disabled
						styleText={{ color: colors['secondary-text'] }}
						styleContainer={[margin.bottom.tiny]}
					/>
				) : null}
			</View>
		</ButtonSetting>
	)
}
