import React from 'react'
import { SafeAreaView, View, TouchableOpacity, Dimensions, StyleSheet, Text } from 'react-native'
import { Icon, Input } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { BlurView } from '@react-native-community/blur'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'

//
// Edit Profile
//

// Style
const useStylesEditProfile = () => {
	const [{ width, height, border }] = useStyles()
	return {
		profileCircleAvatar: [width(90), height(90), border.radius.scale(45)],
	}
}
const _stylesEditProfile = StyleSheet.create({
	profileButton: { width: '80%', height: 50 },
	profileInfo: { width: '100%', height: 60 },
})

const EditMyProfile: React.FC<{}> = () => {
	const _styles = useStylesEditProfile()
	const [{ padding, margin, row, background, border, flex, text, color, column }] = useStyles()
	return (
		<View style={[padding.horizontal.big, margin.vertical.big]}>
			<View style={[row.left, margin.bottom.medium]}>
				<View style={[_styles.profileCircleAvatar, background.light.blue, border.shadow.medium]} />
				<View style={[flex.tiny, margin.left.big]}>
					<Input label='Name' placeholder='Name...' />
				</View>
			</View>
			<View style={[padding.horizontal.medium]}>
				<View style={[padding.top.small, row.left]}>
					<Icon name='checkmark-outline' width={20} height={20} fill={color.green} />
					<Text style={[text.color.grey, margin.left.medium, text.size.scale(11)]}>
						Your Berty ID (QR code) will be updated
					</Text>
				</View>
				<View style={[padding.top.small, row.left]}>
					<Icon name='close-outline' width={20} height={20} fill={color.red} />
					<Text style={[text.color.grey, margin.left.medium, text.size.scale(11)]}>
						Your pending contact requests won’t be updated
					</Text>
				</View>
			</View>
			<View>
				<View
					style={[
						row.item.justify,
						column.justify,
						border.radius.small,
						background.light.blue,
						margin.top.big,
						_stylesEditProfile.profileButton,
					]}
				>
					<Text style={[text.align.center, text.color.blue, text.bold.medium, text.size.scale(16)]}>
						SAVE CHANGES
					</Text>
				</View>
			</View>
		</View>
	)
}

const ResetMyQrCode: React.FC<{}> = () => {
	const [{ padding, margin, row, column, background, border, text, color }] = useStyles()
	return (
		<View style={[padding.horizontal.big, margin.vertical.big]}>
			<TouchableOpacity
				style={[
					row.fill,
					padding.horizontal.medium,
					background.white,
					border.shadow.medium,
					border.radius.small,
					margin.bottom.medium,
					{ alignItems: 'center' },
					_stylesEditProfile.profileInfo,
				]}
			>
				<Icon name='info-outline' width={30} height={30} />
				<Text style={[padding.right.big]}>Why reset my QR Code ?</Text>
				<Icon name='arrow-ios-downward-outline' width={30} height={30} />
			</TouchableOpacity>
			<View style={[padding.horizontal.medium, padding.top.medium]}>
				<View style={[padding.top.small, row.left, { alignItems: 'center' }]}>
					<Icon name='checkmark-outline' width={20} height={20} fill={color.green} />
					<Text style={[text.color.grey, margin.left.medium, text.size.scale(11)]}>
						Your Berty ID (QR code) will be updated
					</Text>
				</View>
				<View style={[padding.top.small, row.left, { alignItems: 'center' }]}>
					<Icon name='close-outline' width={20} height={20} fill={color.red} />
					<Text style={[text.color.grey, margin.left.medium, text.size.scale(11)]}>
						Your pending contact requests won’t be updated
					</Text>
				</View>
				<View style={[padding.top.small, row.left, { alignItems: 'center' }]}>
					<Icon name='close-outline' width={20} height={20} fill={color.red} />
					<Text style={[text.color.grey, margin.left.medium, text.size.scale(11)]}>
						People won’t be able to send you a contact request using your former credentials
					</Text>
				</View>
			</View>
			<TouchableOpacity
				style={[
					_stylesEditProfile.profileButton,
					row.center,
					border.radius.small,
					background.light.red,
					margin.top.big,
					row.item.justify,
				]}
			>
				<Text style={[text.align.center, text.color.red, text.bold.medium, text.size.scale(16)]}>
					RESET MY QR CODE
				</Text>
			</TouchableOpacity>
			<Text style={[text.align.center, text.color.red, padding.top.small, text.size.small]}>
				This action can't be undone
			</Text>
		</View>
	)
}

const Screen = Dimensions.get('window')

export const EditProfile: React.FC<ScreenProps.Settings.EditProfile> = () => {
	const { goBack } = useNavigation()
	const firstNotToggledPoint = Screen.height - 110 // 90 = header height component // 20 = padding // 10 = safeAreaview // 497 = height of the third component
	const firstToggledPoint = firstNotToggledPoint - 370 // 379.5 = height of first component / 10 = padding

	const secondNotToggledPoint = firstToggledPoint - 190
	const secondToggledPoint = secondNotToggledPoint - 300
	const [{ flex, color }] = useStyles()

	return (
		<>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<SafeAreaView style={flex.tiny}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							title: 'Reset my QR Code',
							icon: 'sync-outline',
							iconColor: color.red,
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
			</SafeAreaView>
		</>
	)
}
