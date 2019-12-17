import React from 'react'
import {
	SafeAreaView,
	View,
	Animated,
	TouchableWithoutFeedback,
	TouchableOpacity,
	Dimensions,
	StyleSheet,
	StyleProp,
	KeyboardAvoidingView,
} from 'react-native'
import { Text, Icon, Input } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { BlurView } from '@react-native-community/blur'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'

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

const Screen = Dimensions.get('window')

export const EditProfile: React.FC<ScreenProps.Settings.EditProfile> = () => {
	const { goBack } = useNavigation()
	const firstNotToggledPoint = Screen.height - 20 // 90 = header height component // 20 = padding // 10 = safeAreaview // 497 = height of the third component
	const firstToggledPoint = firstNotToggledPoint - 440 + 10 // 379.5 = height of first component / 10 = padding

	const secondNotToggledPoint = firstToggledPoint - 190
	const secondToggledPoint = secondNotToggledPoint - 358 + 20

	return (
		<>
			<TouchableWithoutFeedback onPress={goBack} style={[StyleSheet.absoluteFill]}>
				<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			</TouchableWithoutFeedback>
			<SafeAreaView style={styles.flex}>
				<KeyboardAvoidingView style={[styles.flex]} behavior='padding'>
					<SDTSModalComponent
						rows={[
							{
								toggledPoint: firstToggledPoint,
								notToggledPoint: firstNotToggledPoint,
								title: 'Reset my QR Code',
								icon: 'sync-outline',
								iconColor: colors.red,
							},
							{
								toggledPoint: secondToggledPoint,
								notToggledPoint: secondNotToggledPoint,
								title: 'Edit my profile',
								icon: 'edit-outline',
							},
						]}
					>
						<ResetMyQrCode />
						<EditMyProfile />
					</SDTSModalComponent>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</>
	)
}
