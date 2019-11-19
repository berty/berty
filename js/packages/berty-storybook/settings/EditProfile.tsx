import React, { useState } from 'react'
import {
	SafeAreaView,
	View,
	Animated,
	TouchableWithoutFeedback,
	ScrollView,
	TouchableOpacity,
	Modal,
	LayoutChangeEvent,
	StyleSheet,
	StyleProp,
} from 'react-native'
import { Layout, Text, Icon, Input } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'

//
// Edit Profile
//

// Types
type ChildToggleProps = {
	expanded: boolean
	minHeight: number
	maxHeight: number
	animation?: Animated.Value
}

type ToggleProps = {
	children: React.ReactNode
	label: string
	icon: string
	colorIcon: string

	toggle1: ChildToggleProps
	toggle2: ChildToggleProps

	setToggle1: React.Dispatch<React.SetStateAction<any>>
	setToggle2: React.Dispatch<React.SetStateAction<any>>

	style?: StyleProp<any>

	expandedProps?: boolean
}

// Style
const _stylesEditProfile = StyleSheet.create({
	profileCircleAvatar: { width: 90, height: 90, borderRadius: 45 },
	profileButton: { width: '80%', height: 50 },
	profileInfo: { width: '100%', height: 60 },
})

const animate = (animation: Animated.Value, initialValue: number, finalValue: number) => {
	animation.setValue(initialValue)
	Animated.spring(animation, {
		toValue: finalValue,
		bounciness: 0,
	}).start()
}

const handleToggle = (
	toggle1: ChildToggleProps,
	toggle2: ChildToggleProps,
	setToggle1: React.Dispatch<React.SetStateAction<any>>,
	setToggle2: React.Dispatch<React.SetStateAction<any>>,
) => {
	const initialValue = toggle1.expanded ? toggle1.maxHeight + toggle1.minHeight : toggle1.minHeight
	const finalValue = toggle1.expanded ? toggle1.minHeight : toggle1.maxHeight + toggle1.minHeight

	const initialValue2 = toggle2.expanded ? toggle2.maxHeight + toggle2.minHeight : toggle2.minHeight

	setToggle1({ ...toggle1, expanded: !toggle1.expanded })
	setToggle2({ ...toggle2, expanded: false })
	if (toggle1.animation) {
		animate(toggle1.animation, initialValue, finalValue)
	}
	if (toggle2.animation) {
		animate(toggle2.animation, initialValue2, toggle2.minHeight)
	}
}

const handleSetMaxHeight = (
	event: LayoutChangeEvent,
	toggle: ChildToggleProps,
	setToggle: React.Dispatch<React.SetStateAction<any>>,
) => {
	if (toggle.maxHeight === 0) {
		setToggle({ ...toggle, maxHeight: event.nativeEvent.layout.height })
	}
}

const handleSetMinHeight = (
	event: LayoutChangeEvent,
	toggle: ChildToggleProps,
	setToggle: React.Dispatch<React.SetStateAction<any>>,
) => {
	const animation = new Animated.Value(event.nativeEvent.layout.height)
	setToggle({
		...toggle,
		animation,
		minHeight: event.nativeEvent.layout.height,
	})
}

const EditMyProfile: React.FC<{}> = () => (
	<View
		style={[
			styles.bigPaddingLeft,
			styles.bigPaddingRight,
			styles.bigMarginBottom,
			styles.bigMarginTop,
		]}
	>
		<View style={[styles.row, styles.marginBottom]}>
			<View style={[_stylesEditProfile.profileCircleAvatar, styles.bgLightBlue, styles.shadow]} />
			<View style={[styles.flex, styles.bigMarginLeft, styles.alignItems]}>
				<Input label='Name' placeholder='Name...' />
			</View>
		</View>
		<View style={[styles.paddingLeft, styles.paddingRight]}>
			<View style={[styles.littlePaddingTop, styles.row, styles.alignItems]}>
				<Icon name='checkmark-outline' width={20} height={20} fill='#20D6B5' />
				<Text category='s2' style={[styles.textLight, styles.marginLeft]}>
					Your Berty ID (QR code) will be updated
				</Text>
			</View>
			<View style={[styles.littlePaddingTop, styles.row, styles.alignItems]}>
				<Icon name='close-outline' width={20} height={20} fill='#FF1F62' />
				<Text category='s2' style={[styles.textLight, styles.marginLeft]}>
					Your pending contact requests won’t be updated
				</Text>
			</View>
		</View>
		<View>
			<View
				style={[
					_stylesEditProfile.profileButton,
					styles.flex,
					styles.center,
					styles.littleBorderRadius,
					styles.bgLightBlue,
					styles.bigMarginTop,
					styles.justifyContent,
				]}
			>
				<Text style={[styles.center, styles.textBlue]} category='h6'>
					SAVE CHANGES
				</Text>
			</View>
		</View>
	</View>
)

const ResetMyQrCode: React.FC<{}> = () => (
	<View
		style={[
			styles.bigPaddingLeft,
			styles.bigPaddingRight,
			styles.bigMarginTop,
			styles.bigMarginBottom,
		]}
	>
		<TouchableOpacity
			style={[
				styles.center,
				styles.row,
				styles.justifyContent,
				styles.alignItems,
				styles.spaceBetween,
				styles.paddingLeft,
				styles.paddingRight,
				_stylesEditProfile.profileInfo,
				styles.bgWhite,
				styles.shadow,
				styles.littleBorderRadius,
				styles.marginBottom,
			]}
		>
			<Icon name='info-outline' width={30} height={30} />
			<Text style={[styles.bigPaddingRight]} category='s1'>
				Why reset my QR Code ?
			</Text>
			<Icon name='arrow-ios-downward-outline' width={30} height={30} />
		</TouchableOpacity>
		<View style={[styles.paddingLeft, styles.paddingTop, styles.paddingRight]}>
			<View style={[styles.littlePaddingTop, styles.row, styles.alignItems]}>
				<Icon name='checkmark-outline' width={20} height={20} fill='#20D6B5' />
				<Text category='s2' style={[styles.textLight, styles.marginLeft]}>
					Your Berty ID (QR code) will be updated
				</Text>
			</View>
			<View style={[styles.littlePaddingTop, styles.row, styles.alignItems]}>
				<Icon name='close-outline' width={20} height={20} fill='#FF1F62' />
				<Text category='s2' style={[styles.textLight, styles.marginLeft]}>
					Your pending contact requests won’t be updated
				</Text>
			</View>
			<View style={[styles.littlePaddingTop, styles.row, styles.alignItems]}>
				<Icon name='close-outline' width={20} height={20} fill='#FF1F62' />
				<Text category='s2' style={[styles.textLight, styles.marginLeft]}>
					People won’t be able to send you a contact request using your former credentials
				</Text>
			</View>
		</View>
		<TouchableOpacity
			style={[
				_stylesEditProfile.profileButton,
				styles.flex,
				styles.center,
				styles.littleBorderRadius,
				styles.bgLightRed,
				styles.bigMarginTop,
				styles.justifyContent,
			]}
		>
			<Text style={[styles.center, styles.textRed]} category='h6'>
				RESET MY QR CODE
			</Text>
		</TouchableOpacity>
		<Text category='s2' style={[styles.center, styles.textRed, styles.littlePaddingTop]}>
			This action can't be undone
		</Text>
	</View>
)

const Toggle: React.FC<ToggleProps> = ({
	children,
	label,
	icon,
	colorIcon,

	toggle1,
	toggle2,

	setToggle1,
	setToggle2,

	style = null,
	expandedProps = false,
}) => {
	return (
		<Animated.View
			style={[
				styles.flex,
				{ height: toggle1.animation, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
				styles.bgWhite,
				styles.borderTopLeftRadius,
				styles.borderTopRightRadius,
				style,
			]}
		>
			<TouchableWithoutFeedback
				onPress={() => handleToggle(toggle1, toggle2, setToggle1, setToggle2)}
				onLayout={(e) => handleSetMinHeight(e, toggle1, setToggle1)}
			>
				<View>
					<View
						style={[
							styles.littleMarginTop,
							styles.center,
							{ borderWidth: 2.5, borderColor: colors.lightGrey, width: '14%', borderRadius: 4 },
						]}
					/>
					<View style={[styles.row, styles.padding, styles.spaceBetween, styles.alignItems]}>
						<Text style={[styles.fontFamily]} category='h4'>
							{label}
						</Text>
						<Icon
							style={[styles.flex, styles.right]}
							name={icon}
							width={50}
							height={50}
							fill={colorIcon}
						/>
					</View>
				</View>
			</TouchableWithoutFeedback>
			<View onLayout={(e) => handleSetMaxHeight(e, toggle1, setToggle1)}>{children}</View>
		</Animated.View>
	)
}

const ToggleMenu: React.FC<{}> = () => {
	const [toggle1, setToggle1] = useState({
		expanded: false,
		minHeight: 0,
		maxHeight: 0,
	})

	const [toggle2, setToggle2] = useState({
		expanded: false,
		minHeight: 0,
		maxHeight: 0,
	})

	return (
		<View>
			<Toggle
				label='Edit my profile'
				icon='edit-outline'
				colorIcon={colors.blue}
				toggle1={toggle1}
				toggle2={toggle2}
				setToggle1={setToggle1}
				setToggle2={setToggle2}
			>
				<EditMyProfile />
			</Toggle>
			<Toggle
				label='Reset my QR Code'
				icon='sync-outline'
				colorIcon={colors.red}
				toggle1={toggle2}
				toggle2={toggle1}
				setToggle1={setToggle2}
				setToggle2={setToggle1}
				style={styles.shadow}
			>
				<ResetMyQrCode />
			</Toggle>
		</View>
	)
}

export const EditProfile: React.FC<{}> = () => {
	const [visible, setVisible] = useState(false)

	const handleVisible = (bool: boolean) => {
		setVisible(bool)
	}

	return (
		<Layout style={[styles.bgBlue, styles.flex]}>
			<SafeAreaView>
				<Modal animationType='slide' visible={visible} transparent={true}>
					<SafeAreaView style={[styles.flex]}>
						<TouchableOpacity style={[styles.center]} onPress={() => handleVisible(false)}>
							<Text>Dismiss Modal</Text>
						</TouchableOpacity>
						<View style={styles.flex}>
							<ScrollView
								bounces={false}
								style={[
									styles.bgWhite,
									styles.absolute,
									styles.bottom,
									styles.left,
									styles.right,
									{ borderRadius: 25 },
								]}
							>
								<ToggleMenu />
							</ScrollView>
						</View>
					</SafeAreaView>
				</Modal>
				{!visible ? (
					<TouchableOpacity style={[styles.center]} onPress={() => handleVisible(true)}>
						<Text>Show Modal</Text>
					</TouchableOpacity>
				) : null}
			</SafeAreaView>
		</Layout>
	)
}
