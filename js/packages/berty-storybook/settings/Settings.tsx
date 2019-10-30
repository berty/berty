import React, { useState, useRef, useEffect } from 'react'
import {
	SafeAreaView,
	View,
	Animated,
	TouchableWithoutFeedback,
	ScrollView,
	Image,
	TouchableOpacity,
	Modal,
	LayoutChangeEvent,
	StyleSheet,
} from 'react-native'
import { Layout, Text, Icon, Input } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'
import { ButtonSetting, HeaderInfoSettings, FactionButtonSetting, HeaderSettings } from './SharedComponentSettings'

//
// Home Vue
//

// Type
type HeaderButtonProps = {
	name: string
	icon: string
	color: string
}

type UserProps = {
	avatarUri: string
	name: string
}

type HomeProps = {
	user: UserProps
}

// Style
const _stylesHome = StyleSheet.create({
	homeHeaderPadding: { paddingBottom: 120 },
	homeAvatarBox: { width: 160, height: 180 },
	homeAvatar: { bottom: 37.5 },
	homeCircleAvatar: { width: 75, height: 75, borderRadius: 75 / 2 },
	homeButtonBox: { width: 100, height: 85 },
	home: { width: '100%', height: 60 },
	homeFooterButton: { width: 60, height: 60, borderRadius: 60 / 2 },
	homePaddingFooter: { paddingBottom: 120 },
})

const HomeHeaderButton: React.FC<HeaderButtonProps> = ({ name, icon, color }) => (
	<TouchableOpacity style={[_stylesHome.homeButtonBox, styles.bgWhite, styles.borderRadius, styles.buttonShadow]}>
		<View style={[styles.center, styles.littlePaddingTop]}>
			<Icon name={icon} width={35} height={35} fill={color} />
		</View>
		<View style={[styles.bottom, styles.absolute, styles.center, styles.littlePaddingBottom]}>
			<Text style={[styles.fontFamily]} category='s3'>
				{name}
			</Text>
		</View>
	</TouchableOpacity>
)

const HomeHeaderGroupButton: React.FC<{}> = () => (
	<View style={[styles.top, styles.left, styles.right, styles.row, styles.spaceEvenly, styles.marginTop, styles.flex]}>
		<HomeHeaderButton name='Updates' icon='arrow-upward-outline' color={colors.blue} />
		<HomeHeaderButton name='Help' icon='question-mark-circle-outline' color={colors.red} />
		<HomeHeaderButton name='Settings' icon='settings-2-outline' color={colors.blue} />
	</View>
)

const HomeHeaderAvatar: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View style={[styles.center, styles.marginTop]}>
		<View style={[_stylesHome.homeAvatarBox, styles.bgWhite, styles.borderRadius]}>
			<View style={[_stylesHome.homeAvatar]}>
				<View
					style={[
						_stylesHome.homeCircleAvatar,
						styles.bgWhite,
						styles.center,
						styles.buttonShadow,
						styles.justifyContent,
						styles.alignItems,
					]}
				>
					<Image source={{ uri: avatarUri }} style={{ width: 65, height: 65, borderRadius: 32.5 }} />
				</View>
				<View style={[styles.center]}>
					<Text style={[styles.fontFamily, styles.littlePaddingTop, { fontSize: 13 }]}>{name}</Text>
				</View>
			</View>
		</View>
	</View>
)

const HomeHeader: React.FC<HomeProps> = ({ user }) => (
	<SafeAreaView
		style={[
			styles.bgBlue,
			styles.paddingLeft,
			styles.paddingRight,
			styles.borderBottomLeftRadius,
			styles.borderBottomRightRadius,
			styles.flex,
		]}
	>
		<TouchableOpacity style={[styles.end, styles.paddingRight]}>
			<Icon name='edit-outline' width={40} height={40} fill='#FFFFFF' />
		</TouchableOpacity>
		<View style={[styles.alignVertical, styles.bigMarginBottom]}>
			<HomeHeaderAvatar {...user} />
		</View>
	</SafeAreaView>
)

const HomeBodySettings: React.FC<{}> = () => (
	<View style={[styles.flex, styles.paddingLeft, styles.paddingRight, styles.marginTop, _stylesHome.homePaddingFooter]}>
		<ButtonSetting
			name='Notifications'
			icon='bell-outline'
			iconSize={30}
			iconColor={colors.blue}
			state={{ value: 'Current', color: colors.white, bgColor: colors.blue }}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Bluetooth'
			icon='bluetooth-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting name='Dark mode' icon='moon-outline' iconSize={30} iconColor={colors.blue} toggled={true} />
		<ButtonSetting
			name='About Berty'
			icon='info-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Devtools'
			icon='options-2-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Devtools'
			icon='options-2-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Devtools'
			icon='options-2-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
	</View>
)

const HomeFooter: React.FC<{}> = () => (
	<View
		style={[
			styles.absolute,
			styles.bottom,
			styles.left,
			styles.right,
			styles.marginBottom,
			styles.padding,
			styles.row,
			styles.spaceAround,
			styles.alignItems,
		]}
	>
		<TouchableOpacity>
			<View style={[_stylesHome.homeFooterButton, styles.bgWhite, styles.buttonShadow, styles.justifyContent]}>
				<Icon style={[styles.center]} name='search-outline' width={30} height={30} fill={colors.blue} />
			</View>
		</TouchableOpacity>
		<TouchableOpacity>
			<View style={[_stylesHome.homeFooterButton, styles.bgWhite, styles.buttonShadow, styles.justifyContent]}>
				<Icon style={[styles.center]} name='message-circle-outline' width={30} height={30} fill={colors.blue} />
			</View>
		</TouchableOpacity>
		<TouchableOpacity>
			<View style={[_stylesHome.homeFooterButton, styles.bgWhite, styles.buttonShadow, styles.justifyContent]}>
				<Icon style={[styles.center]} name='person-outline' width={30} height={30} fill={colors.blue} />
			</View>
		</TouchableOpacity>
	</View>
)

export const Home: React.FC<HomeProps> = ({ user }) => (
	<Layout style={[styles.flex, styles.bgWhite]}>
		<ScrollView contentContainerStyle={[styles.bgWhite]}>
			<HomeHeader user={user} />
			<HomeHeaderGroupButton />
			<HomeBodySettings />
		</ScrollView>
		<HomeFooter />
	</Layout>
)

//
// Settings My Berty ID Vue
//

// Types
type BertyIdTabProps = {
	name: string
	icon: string
	enable?: boolean
}

// Style
const _stylesBertyId = StyleSheet.create({
	bertyLayout: { height: '95%' },
	bertyId: { width: '90%', height: '70%', marginTop: 70 },
	bertyIdAvatar: { bottom: 60 },
	bertyIdCircleAvatar: { width: 120, height: 120, borderRadius: 120 / 2 },
	bertyIdTab: { width: '30%' },
	bertyIdTabDisable: { opacity: 0.2 },
	bertyIdTabBarEnable: {
		width: '90%',
		borderWidth: 2,
		borderColor: colors.blue,
		marginTop: 5,
	},
	bertyIdTabBarDisable: {
		width: '90%',
		borderWidth: 2,
		borderColor: colors.black,
		marginTop: 5,
	},
	bertyIdButton: { width: 70, height: 70, borderRadius: 70 / 2 },
	bertyIdPaddingButton: { marginRight: 60, bottom: 35.5 },
})

const BertyIdHeader: React.FC<{}> = () => (
	<View style={[styles.padding, styles.margin, styles.spaceBetween, styles.row, styles.alignItems]}>
		<Text style={[styles.textWhite]} category='h3'>
			My Berty ID
		</Text>
		<Icon name='person' width={50} height={50} fill='#ffffff' />
	</View>
)

const BertyIdAvatar: React.FC<{}> = () => (
	<View style={[_stylesBertyId.bertyIdAvatar]}>
		<View style={[_stylesBertyId.bertyIdCircleAvatar, styles.bgWhite, styles.center, styles.buttonShadow]} />
		<View style={[styles.center]}>
			<Text style={styles.paddingTop} category='s1'>
				Bob
			</Text>
		</View>
	</View>
)

const BertyIdTab: React.FC<BertyIdTabProps> = ({ name, icon, enable = false }) => (
	<View style={[styles.alignItems, !enable ? _stylesBertyId.bertyIdTabDisable : null]}>
		<Icon fill={enable ? colors.blue : colors.black} name={icon} width={30} height={30} />
		<Text style={[enable ? styles.textBlue : styles.textBlack, styles.fontFamily]}>{name}</Text>
		<View style={[enable ? _stylesBertyId.bertyIdTabBarEnable : _stylesBertyId.bertyIdTabBarDisable]} />
	</View>
)

const BertyIdContent: React.FC<{}> = () => {
	const [enable, setEnable] = useState('QRCode')

	useEffect(() => {
		console.log(enable)
	})

	const handleEnable = (enable: string) => {
		setEnable(enable)
	}

	return (
		<View style={[styles.flex, styles.marginLeft, styles.marginRight, styles.paddingBottom]}>
			<View style={[styles.row, styles.spaceEvenly, styles.marginLeft, styles.marginRight, styles.paddingBottom]}>
				<TouchableOpacity onPress={() => handleEnable('QRCode')} style={[styles.flex, _stylesBertyId.bertyIdTab]}>
					<BertyIdTab name='QRCode' icon='code-outline' enable={enable === 'QRCode'} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleEnable('Fingerprint')} style={[styles.flex, _stylesBertyId.bertyIdTab]}>
					<BertyIdTab name='Fingerprint' icon='pricetags-outline' enable={enable === 'Fingerprint'} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleEnable('Devices')} style={[styles.flex, _stylesBertyId.bertyIdTab]}>
					<BertyIdTab name='Devices' icon='smartphone-outline' enable={enable === 'Devices'} />
				</TouchableOpacity>
			</View>
			<View style={[styles.flex, styles.margin, styles.justifyContent, styles.test]}>
				<Text style={styles.center}>{enable}</Text>
			</View>
		</View>
	)
}

const BertIdBody: React.FC<{}> = () => (
	<View style={[_stylesBertyId.bertyId, styles.bgWhite, styles.borderRadius, styles.center]}>
		<BertyIdAvatar />
		<BertyIdContent />
	</View>
)

export const MyBertyId: React.FC<{}> = () => (
	<Layout style={[styles.flex, styles.bgBlue]}>
		<SafeAreaView>
			{/* Draggable Container */}
			<View style={[styles.bgBlue, _stylesBertyId.bertyLayout]}>
				<BertyIdHeader />
				<BertIdBody />
				<TouchableOpacity
					style={[
						_stylesBertyId.bertyIdButton,
						_stylesBertyId.bertyIdPaddingButton,
						styles.end,
						styles.bgLightBlue,
						styles.buttonShadow,
					]}
				>
					<View style={[styles.flex, styles.justifyContent]}>
						<Icon style={[styles.center]} name='share-outline' width={40} height={40} fill={colors.blue} />
					</View>
				</TouchableOpacity>
			</View>
			{/* */}
		</SafeAreaView>
	</Layout>
)

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
	<View style={[styles.bigPaddingLeft, styles.bigPaddingRight, styles.bigMarginTop, styles.bigMarginBottom]}>
		<View style={[styles.row, styles.marginBottom]}>
			<View style={[_stylesEditProfile.profileCircleAvatar, styles.bgLightBlue, styles.buttonShadow]} />
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
	<View style={[styles.bigPaddingLeft, styles.bigPaddingRight, styles.bigMarginTop, styles.bigMarginBottom]}>
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
				styles.buttonShadow,
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

	expandedProps = false,
}) => {
	return (
		<Animated.View
			style={[
				styles.flex,
				{ height: toggle1.animation },
				styles.bgWhite,
				styles.buttonShadow,
				styles.borderTopLeftRadius,
				styles.borderTopRightRadius,
			]}
		>
			<TouchableWithoutFeedback
				onPress={() => handleToggle(toggle1, toggle2, setToggle1, setToggle2)}
				onLayout={(e) => handleSetMinHeight(e, toggle1, setToggle1)}
			>
				<View style={[styles.row, styles.padding, styles.spaceBetween, styles.alignItems]}>
					<Text style={[styles.fontFamily]} category='h4'>
						{label}
					</Text>
					<Icon style={[styles.flex, styles.right]} name={icon} width={50} height={50} fill={colorIcon} />
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
							<ScrollView bounces={false} style={[styles.absolute, styles.bottom, styles.left, styles.right]}>
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

//
// App Updates
//

// Types

type UpdateFeatureProps = {
	value: string
	color: string
	icon?: string
	iconSize?: number
	iconColor?: string
}

type HeaderAppUpdatesProps = {
	update: boolean
}

const UpdateFeature: React.FC<UpdateFeatureProps> = ({ value, color, icon, iconSize, iconColor }) => (
	<View style={[styles.row, styles.littlePaddingLeft, styles.alignItems]}>
		<Icon name={icon} width={iconSize} height={iconSize} fill={iconColor} />
		<Text style={[{ color, fontSize: 11, fontWeight: 'bold', paddingLeft: 8 }]}>{value}</Text>
	</View>
)

const HeaderAppUpdates: React.FC<HeaderAppUpdatesProps> = ({ update }) => (
	<View>
		{update ? (
			<HeaderInfoSettings bgColor={colors.lightBlue}>
				<Text style={[styles.textWhite, styles.fontFamily, styles.center]} category='h5'>
					A new version is available
				</Text>
				<Text style={[styles.textWhite, { fontSize: 12 }, styles.center, styles.marginBottom]}>
					New app version: 2.42.1.4
				</Text>
				<UpdateFeature
					value='Multiple bug fixes, improved reliability'
					color={colors.white}
					icon='checkmark-circle-2'
					iconSize={12}
					iconColor={colors.lightBlue}
				/>
				<UpdateFeature
					value='Multiple bug fixes, improved reliability'
					color={colors.white}
					icon='checkmark-circle-2'
					iconSize={12}
					iconColor={colors.lightBlue}
				/>
				<TouchableOpacity
					style={[
						styles.littlePaddingTop,
						styles.littlePaddingBottom,
						styles.paddingLeft,
						styles.paddingRight,
						styles.bgBlue,
						styles.row,
						styles.alignItems,
						styles.justifyContent,
						styles.bigMarginTop,
						styles.borderRadius,
					]}
				>
					<Icon name='download-outline' width={30} height={30} fill={colors.white} />
					<Text style={[styles.textWhite, styles.marginLeft, styles.littlePaddingRight]} category='s'>
						Download latest version on app
					</Text>
				</TouchableOpacity>
			</HeaderInfoSettings>
		) : (
			<View>
				<ButtonSetting
					name='Version 2.42.1.3'
					icon='pricetags-outline'
					iconSize={30}
					iconColor={colors.blue}
					state={{
						value: 'Current',
						color: colors.white,
						bgColor: colors.blue,
					}}
					actionIcon='arrow-ios-upward'
				>
					<View style={[styles.littlePaddingTop]}>
						<UpdateFeature
							value='Multiple bug fixes'
							color='rgba(43,46,77,0.8)'
							icon='checkmark-circle-2'
							iconSize={12}
							iconColor={colors.blue}
						/>
						<UpdateFeature
							value='More customization options for groups'
							color='rgba(43,46,77,0.8)'
							icon='checkmark-circle-2'
							iconSize={12}
							iconColor={colors.blue}
						/>
						<UpdateFeature
							value='Improve connection issues in 4G'
							color='rgba(43,46,77,0.8)'
							icon='checkmark-circle-2'
							iconSize={12}
							iconColor={colors.blue}
						/>
					</View>
				</ButtonSetting>
			</View>
		)}
	</View>
)

const BodyUpdates: React.FC<{ update: boolean }> = ({ update }) => (
	<View style={[styles.flex, styles.padding, styles.bigMarginBottom]}>
		{update && (
			<ButtonSetting
				name='Version 2.42.1.3'
				icon='pricetags-outline'
				iconSize={30}
				iconColor={colors.blue}
				state={{
					value: 'Current',
					color: colors.white,
					bgColor: colors.blue,
					icon: 'pricetags-outline',
					iconColor: colors.red,
					iconSize: 30,
				}}
				actionIcon='arrow-ios-downward'
			/>
		)}
		<ButtonSetting
			name='Version 2.42.1.2'
			icon='pricetags-outline'
			iconSize={30}
			iconColor={colors.blue}
			state={{
				value: 'Installed',
				color: colors.green,
				bgColor: colors.lightGreen,
			}}
			actionIcon='arrow-ios-downward'
		/>
		<ButtonSetting
			name='Version 2.42.1.1'
			icon='pricetags-outline'
			iconSize={30}
			iconColor={colors.blue}
			state={{
				value: 'Not installed',
				color: colors.red,
				bgColor: colors.lightRed,
			}}
			actionIcon='arrow-ios-downward'
		/>
		<ButtonSetting
			name='Version 2.41.9'
			icon='pricetags-outline'
			iconSize={30}
			iconColor={colors.blue}
			state={{
				value: 'Installed',
				color: colors.green,
				bgColor: colors.lightGreen,
			}}
			actionIcon='arrow-ios-downward'
		/>
		<ButtonSetting
			name='Version 2.41.8'
			icon='pricetags-outline'
			iconSize={30}
			iconColor={colors.blue}
			state={{
				value: 'Installed',
				color: colors.green,
				bgColor: colors.lightGreen,
			}}
			actionIcon='arrow-ios-downward'
		/>
		<ButtonSetting
			name='Version 2.41.7'
			icon='pricetags-outline'
			iconSize={30}
			iconColor={colors.blue}
			state={{
				value: 'Not installed',
				color: colors.red,
				bgColor: colors.lightRed,
			}}
			actionIcon='arrow-ios-downward'
		/>
		<ButtonSetting
			name='Version 2.41.6'
			icon='pricetags-outline'
			iconSize={30}
			iconColor={colors.blue}
			state={{
				value: 'Initial install',
				color: colors.blue,
				bgColor: colors.lightBlue,
			}}
			actionIcon='arrow-ios-downward'
		/>
	</View>
)

export const AppUpdates: React.FC<{}> = () => {
	const [update, setUpdate] = useState(false)

	return (
		<Layout style={[styles.flex, styles.bgWhite]}>
			<ScrollView>
				<HeaderSettings
					title="App updates"
					action={setUpdate}
					actionValue={update}
					desc={!update ? 'Your app is up to date' : null}
				>
					<HeaderAppUpdates update={update} />
				</HeaderSettings>
				<BodyUpdates update={update} />
			</ScrollView>
		</Layout>
	)
}

//
// Help
//

const HeaderHelp: React.FC<{}> = () => (
	<View>
		<ButtonSetting
			name='Security & Privacy'
			icon='shield-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		>
			<Text
				style={[
					{
						paddingLeft: 33,
						color: 'rgba(43,46,77,0.8)',
						fontSize: 10,
						fontWeight: 'bold',
						marginLeft: 6,
					},
				]}
			>
				Keep your data safe & your life private
			</Text>
		</ButtonSetting>
	</View>
)

const BodyHelp: React.FC<{}> = () => (
	<View style={[styles.padding]}>
		<ButtonSetting
			name='Account & Berty ID'
			icon='person-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Contacts & Requests'
			icon='person-add-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Messages'
			icon='paper-plane-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Groups'
			icon='people-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Settings'
			icon='settings-2-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
		<View style={[styles.flex, styles.row, styles.spaceBetween, styles.alignItems, { marginTop: 20 }]}>
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.buttonShadow,
					styles.bgWhite,
					styles.borderRadius,
					{ marginRight: 10 },
				]}
			>
				<Icon name='question-mark-circle-outline' width={30} height={30} fill={colors.red} />
				<Text style={[styles.fontFamily, styles.textBlack, { paddingTop: 6, fontWeight: 'bold' }]} category='s4'>
					Ask a question
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.buttonShadow,
					styles.bgWhite,
					styles.borderRadius,
					{ marginLeft: 10 },
				]}
			>
				<Icon name='bulb-outline' width={30} height={30} fill={colors.red} />
				<Text style={[styles.fontFamily, styles.textBlack, { paddingTop: 6, fontWeight: 'bold' }]} category='s4'>
					Report a bug
				</Text>
			</TouchableOpacity>
		</View>
	</View>
)

export const Help: React.FC<{}> = () => (
	<Layout style={[styles.bgWhite, styles.flex]}>
		<ScrollView>
			<HeaderSettings title="Help" bgColor={colors.red}>
				<HeaderHelp />
			</HeaderSettings>
			<BodyHelp />
		</ScrollView>
	</Layout>
)

//
// Mode
//

// Types
type BodyModeProps = {
	isMode: boolean
}

const BodyMode: React.FC<BodyModeProps> = ({ isMode }) => (
	<View style={[styles.flex, styles.padding, styles.marginBottom]}>
		<ButtonSetting
			name='App mode'
			icon='options-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
			state={{
				value: isMode ? 'Performance' : 'Privacy',
				color: colors.white,
				bgColor: isMode ? colors.blue : colors.red,
				stateIcon: isMode ? 'flash-outline' : 'lock-outline',
				stateIconColor: colors.white,
			}}
		>
			<Text
				style={[
					isMode ? styles.textBlue : styles.textRed,
					{ fontSize: 8, fontWeight: 'bold', marginRight: 60 },
					styles.end,
				]}
			>
				Easy to use - All the features
			</Text>
			<View style={[styles.littlePaddingRight]}>
				<UpdateFeature
					value='Receive push notifications'
					color='rgba(43,46,77,0.8)'
					icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
					iconSize={15}
					iconColor={isMode ? colors.blue : colors.red}
				/>
				<UpdateFeature
					value='Receive contact requests'
					color='rgba(43,46,77,0.8)'
					icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
					iconSize={15}
					iconColor={isMode ? colors.blue : colors.red}
				/>
				<UpdateFeature
					value='Local peer discovery (BLE & Multicast DNS)'
					color='rgba(43,46,77,0.8)'
					icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
					iconSize={15}
					iconColor={isMode ? colors.blue : colors.red}
				/>
			</View>
		</ButtonSetting>
		<ButtonSetting
			name='Notifications'
			icon='bell-outline'
			iconColor={colors.blue}
			iconSize={30}
			state={
				isMode
					? {
						value: 'Enabled',
						color: colors.green,
						bgColor: colors.lightGreen,
					  }
					: { value: 'Disabled', color: colors.red, bgColor: colors.lightRed }
			}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Bluetooth'
			icon='bluetooth-outline'
			iconColor={colors.blue}
			iconSize={30}
			state={
				isMode
					? {
						value: 'Enabled',
						color: colors.green,
						bgColor: colors.lightGreen,
					  }
					: {
						value: 'Disabled',
						color: colors.red,
						bgColor: colors.lightRed,
					  }
			}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Receive contact requests'
			icon='person-done-outline'
			iconColor={colors.blue}
			iconSize={30}
			toggled={true}
		/>
		<ButtonSetting name='Multicast DNS' icon='share-outline' iconColor={colors.blue} iconSize={30} toggled={true}>
			<Text
				style={[
					{
						fontSize: 9,
						fontWeight: 'bold',
						color: 'rgba(43,46,77,0.8)',
						marginLeft: 39,
					},
				]}
			>
				Local Peer discovery
			</Text>
		</ButtonSetting>
		<ButtonSetting
			name='Blocked contacts'
			icon='person-delete-outline'
			iconSize={30}
			iconColor={colors.blue}
			state={{
				value: '3 blocked',
				color: colors.blue,
				bgColor: colors.lightBlue,
			}}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Delete my account'
			icon='trash-2-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
	</View>
)

export const Mode: React.FC<{}> = () => {
	const [isMode, setIsMode] = useState(true)

	return (
		<Layout style={[styles.flex, styles.bgWhite]}>
			<ScrollView>
				<HeaderSettings
					title="Settings"
					action={setIsMode}
					actionValue={isMode}
					desc="Customize everything to get the app that fits your needs"
				/>
				<BodyMode isMode={isMode} />
			</ScrollView>
		</Layout>
	)
}

//
// Blocked Contacts
//

// Types
type BlockedContactsItempProps = {
	avatarUri: string
	name: string
}

type BlockedContactsListProps = {
	items: Array<BlockedContactsItempProps>
}

type BlockedContactsProps = {
	blocked: BlockedContactsListProps
}

const HeaderBlockedContacts: React.FC<{}> = () => (
	<View>
		<ButtonSetting
			name='Block a new user'
			icon='plus-circle-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
	</View>
)

const BlockedContactItem: React.FC<BlockedContactsItempProps> = ({ avatarUri, name }) => (
	<TouchableOpacity style={[styles.bgWhite, { flex: 1, minHeight: 60 }, styles.littlePadding]}>
		<View style={[styles.flex, styles.row, styles.alignItems]}>
			<View style={[styles.row, styles.alignVertical]}>
				<Image source={{ uri: avatarUri }} style={{ width: 40, height: 40, borderRadius: 20 }} />
				<View style={[styles.littlePaddingLeft]}>
					<Text style={[styles.fontFamily, { fontWeight: 'bold' }]} category='s4'>
						{name}
					</Text>
					<View style={[styles.row, styles.alignItems]}>
						<Icon name='slash-outline' width={12} height={12} fill={colors.red} />
						<Text
							style={{
								paddingLeft: 3,
								fontSize: 11,
								color: colors.black,
								opacity: 0.8,
							}}
						>
							Blocked since 2019-04-11
						</Text>
					</View>
				</View>
			</View>
			<View style={[styles.row, styles.center]}>
				<Icon name='arrow-ios-forward' width={30} height={30} fill={colors.black} />
			</View>
		</View>
	</TouchableOpacity>
)

const BodyBlockedContacts: React.FC<BlockedContactsListProps> = ({ items }) => (
	<View style={[styles.flex, styles.padding, styles.marginBottom]}>
		<FactionButtonSetting>
			{items.map((data) => (
				<BlockedContactItem avatarUri={data.avatarUri} name={data.name} />
			))}
		</FactionButtonSetting>
	</View>
)

export const BlockedContacts: React.FC<BlockedContactsProps> = ({ blocked }) => (
	<Layout style={[styles.flex, styles.bgWhite]}>
		<ScrollView>
			<HeaderSettings title="Blocked contacts" desc="Blocked contacts can't send you contact requests">
				<HeaderBlockedContacts />
			</HeaderSettings>
			<BodyBlockedContacts {...blocked} />
		</ScrollView>
	</Layout>
)

//
// Notifications
//

//Types
type NotificationsPorps = {
	isAuthorize: boolean
}

const HeaderNotifications: React.FC<NotificationsPorps> = ({ isAuthorize }) => (
	<View>
		{!isAuthorize && (
			<View>
				<Text style={[styles.textWhite, styles.center, { fontSize: 10 }]}>
					You have not yet activated notifications for this app
				</Text>
				<HeaderInfoSettings>
					<TouchableOpacity style={[styles.end]}>
						<Icon name='close-outline' width={20} height={20} fill={colors.lightBlue} />
					</TouchableOpacity>
					<View style={[styles.center, styles.row, styles.flex, styles.alignVertical]}>
						<Icon name='alert-circle' width={25} height={25} fill={colors.red} />
						<Text category='h6' style={[styles.textWhite, { fontWeight: 'bold', paddingLeft: 10 }]}>
							Authorize notifications
						</Text>
					</View>
					<View style={[styles.center, styles.marginTop, styles.marginLeft, styles.marginRight]}>
						<Text style={[{ fontSize: 11, fontWeight: 'bold' }, styles.textCenter, styles.textWhite, styles.center]}>
							You need to authorize notifications for the Berty app in order to receive notifications for new messages
							and contact requests
						</Text>
					</View>
					<TouchableOpacity
						style={[styles.bgBlue, styles.borderRadius, styles.marginTop, styles.marginLeft, styles.marginRight]}
					>
						<View style={[styles.marginTop, styles.marginBottom, styles.row, styles.spaceCenter, styles.alignItems]}>
							<Icon name='bell-outline' width={20} height={20} fill={colors.white} />
							<Text style={[{ fontSize: 15, fontWeight: 'bold' }, styles.textWhite, styles.littlePaddingLeft]}>
								Authorize notifications
							</Text>
						</View>
					</TouchableOpacity>
				</HeaderInfoSettings>
			</View>
		)}
	</View>
)

const BodyNotifications: React.FC<NotificationsPorps> = ({ isAuthorize }) => (
	<View style={[styles.flex, styles.padding, styles.marginBottom, !isAuthorize ? { opacity: 0.3 } : null]}>
		<ButtonSetting
			name='Activate notifications'
			icon='bell-outline'
			iconSize={30}
			iconColor={colors.blue}
			toggled={true}
		/>
		<ButtonSetting
			name='ContactRequests'
			toggled={true}
			icon='person-add-outline'
			iconSize={30}
			iconColor={colors.blue}
		>
			<Text style={{ fontSize: 10, paddingLeft: 39, paddingRight: 100 }}>
				Receive a notification everytime someones sends you a contact request
			</Text>
		</ButtonSetting>
		<FactionButtonSetting
			name='Messages notifications'
			icon='paper-plane-outline'
			iconSize={30}
			iconColor={colors.blue}
			style={[styles.marginTop]}
		>
			<ButtonSetting name='Display noitifications' toggled={true} alone={false} />
			<ButtonSetting name='Messages preview' toggled={true} alone={false} />
			<ButtonSetting name='Sound' actionIcon='arrow-ios-forward' previewValue='Note' alone={false} />
			<ButtonSetting name='Exceptions' actionIcon='arrow-ios-forward' previewValue='Add' alone={false} />
		</FactionButtonSetting>
		<FactionButtonSetting
			name='Groups notifications'
			icon='people-outline'
			iconSize={30}
			iconColor={colors.blue}
			style={[styles.marginTop]}
		>
			<ButtonSetting name='Display noitifications' toggled={true} alone={false} />
			<ButtonSetting name='Messages preview' toggled={true} alone={false} />
			<ButtonSetting name='Sound' actionIcon='arrow-ios-forward' previewValue='Bambou' alone={false} />
			<ButtonSetting
				name='Exceptions'
				actionIcon='arrow-ios-forward'
				state={{
					value: '3 exceptions',
					color: colors.blue,
					bgColor: colors.lightBlue,
				}}
				alone={false}
			/>
		</FactionButtonSetting>
	</View>
)

export const Notifications: React.FC<{}> = () => {
	const [isAuthorize, setIsAuthorize] = useState(false)

	return (
		<Layout style={[styles.flex, styles.bgWhite]}>
			<ScrollView>
				<HeaderSettings
					title="Notifications"
					action={setIsAuthorize}
					actionValue={isAuthorize}
					desc="You have not yet activated notifications for this app"
				>
					<HeaderNotifications isAuthorize={isAuthorize} />
				</HeaderSettings>

				<BodyNotifications isAuthorize={isAuthorize} />
			</ScrollView>
		</Layout>
	)
}

//
// Bluetooth
//

// Types
type BluetoothProps = {
	isBluetooth: boolean
}

const HeaderBluetooth: React.FC<BluetoothProps> = ({ isBluetooth }) => (
	<View>
		{!isBluetooth && (
			<HeaderInfoSettings>
				<TouchableOpacity style={[styles.end]}>
					<Icon name='close-outline' width={20} height={20} fill={colors.lightBlue} />
				</TouchableOpacity>
				<View style={[styles.center, styles.row, styles.flex, styles.alignVertical]}>
					<Icon name='alert-circle' width={25} height={25} fill={colors.red} />
					<Text category='h6' style={[styles.textWhite, { fontWeight: 'bold', paddingLeft: 10 }]}>
						Authorize bluetooth
					</Text>
				</View>
				<View style={[styles.center, styles.marginTop, styles.marginLeft, styles.marginRight]}>
					<Text style={[{ fontSize: 11, fontWeight: 'bold' }, styles.textCenter, styles.textWhite, styles.center]}>
						To use this feature you need to authorize the Berty app to use Bluetooth on your phone
					</Text>
				</View>
				<TouchableOpacity
					style={[styles.bgBlue, styles.borderRadius, styles.marginTop, styles.marginLeft, styles.marginRight]}
				>
					<View style={[styles.marginTop, styles.marginBottom, styles.row, styles.spaceCenter, styles.alignItems]}>
						<Icon name='bluetooth-outline' width={20} height={20} fill={colors.white} />
						<Text style={[{ fontSize: 15, fontWeight: 'bold' }, styles.textWhite, styles.littlePaddingLeft]}>
							Authorize Bluetooth
						</Text>
					</View>
				</TouchableOpacity>
			</HeaderInfoSettings>
		)}
	</View>
)

const BodyBluetooth: React.FC<BluetoothProps> = ({ isBluetooth }) => (
	<View style={[styles.flex, styles.padding, styles.marginBottom, !isBluetooth ? { opacity: 0.3 } : null]}>
		<ButtonSetting
			name='Activate Bluetooth'
			icon='bluetooth-outline'
			iconSize={30}
			iconColor={colors.blue}
			toggled={true}
		/>
	</View>
)

export const Bluetooth: React.FC<{}> = () => {
	const [isBluetooth, setIsBluetooth] = useState(false)

	return (
		<Layout style={[styles.flex, styles.bgWhite]}>
			<ScrollView>
				<HeaderSettings
					title="Bluetooth"
					action={setIsBluetooth}
					actionValue={isBluetooth}
					desc="Bluetooth allows you to use the Berty app when you don't have a network connection (wifi or data) by connecting
				your phone directly with peers nearby"
				>
					<HeaderBluetooth isBluetooth={isBluetooth} />
				</HeaderSettings>
				<BodyBluetooth isBluetooth={isBluetooth} />
			</ScrollView>
		</Layout>
	)
}

//
// About Berty
//

// Types
type AboutbertyProps = {
	version: boolean
}

const HeaderAboutBerty: React.FC<AboutbertyProps> = ({ version }) => (
	<View>
		{!version ? (
			<HeaderInfoSettings>
				<Text
					category='h6'
					style={[styles.textWhite, styles.littleMarginBottom, { fontWeight: 'bold', paddingLeft: 10 }]}
				>
					The berty app :
				</Text>
				<UpdateFeature
					value='Is Decentralised & Distributed (peer to peer)'
					color={colors.white}
					icon='checkmark-circle-2'
					iconSize={12}
					iconColor={colors.lightBlue}
				/>
				<UpdateFeature
					value='Works with or without internet access'
					color={colors.white}
					icon='checkmark-circle-2'
					iconSize={12}
					iconColor={colors.lightBlue}
				/>
				<UpdateFeature
					value='Is 100% private & secure'
					color={colors.white}
					icon='checkmark-circle-2'
					iconSize={12}
					iconColor={colors.lightBlue}
				/>
				<UpdateFeature
					value='Is fully open source'
					color={colors.white}
					icon='checkmark-circle-2'
					iconSize={12}
					iconColor={colors.lightBlue}
				/>
				<TouchableOpacity
					style={[styles.bgBlue, styles.borderRadius, styles.marginTop, styles.marginLeft, styles.marginRight]}
				>
					<View
						style={[
							styles.littleMarginTop,
							styles.littleMarginBottom,
							styles.row,
							styles.spaceCenter,
							styles.alignItems,
						]}
					>
						<Text
							style={[
								{ fontSize: 15, fontWeight: 'bold' },
								styles.marginRight,
								styles.textWhite,
								styles.littlePaddingLeft,
							]}
						>
							Learn more
						</Text>
						<Icon name='arrow-ios-forward' width={30} height={30} fill={colors.white} />
					</View>
				</TouchableOpacity>
			</HeaderInfoSettings>
		) : (
			<View>
				<View style={[styles.flex, styles.row, styles.spaceBetween, styles.alignItems, { marginTop: 20 }]}>
					<TouchableOpacity
						style={[
							styles.flex,
							styles.padding,
							styles.alignItems,
							styles.justifyContent,
							styles.buttonShadow,
							styles.bgWhite,
							styles.borderRadius,
							{ marginRight: 10, height: 90 },
						]}
					>
						<Icon name='lock-outline' width={30} height={30} fill={colors.yellow} />
						<Text
							style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6, fontWeight: 'bold' }]}
							category="s4"
						>
							Private & Secure
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.flex,
							styles.padding,
							styles.alignItems,
							styles.justifyContent,
							styles.buttonShadow,
							styles.bgWhite,
							styles.borderRadius,
							{ marginLeft: 10, height: 90 },
						]}
					>
						<Icon name='globe-outline' width={30} height={30} fill={colors.blue} />
						<Text
							style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6, fontWeight: 'bold' }]}
							category='s4'
						>
							Peer to peer network
						</Text>
					</TouchableOpacity>
				</View>
				<View style={[styles.flex, styles.row, styles.spaceBetween, styles.alignItems, { marginTop: 20 }]}>
					<TouchableOpacity
						style={[
							styles.flex,
							styles.padding,
							styles.alignItems,
							styles.justifyContent,
							styles.buttonShadow,
							styles.bgWhite,
							styles.borderRadius,
							{ marginRight: 10, height: 90 },
						]}
					>
						<Icon name='wifi-off-outline' width={30} height={30} fill={colors.red} />
						<Text
							style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6, fontWeight: 'bold' }]}
							category='s4'
						>
							No internet or data required
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.flex,
							styles.padding,
							styles.alignItems,
							styles.justifyContent,
							styles.buttonShadow,
							styles.bgWhite,
							styles.borderRadius,
							{ marginLeft: 10, height: 90 },
						]}
					>
						<Icon name='alert-triangle-outline' width={30} height={30} fill={colors.green} />
						<Text
							style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6, fontWeight: 'bold' }]}
							category='s4'
						>
							No network trust required
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		)}
	</View>
)

const BodyAboutBerty: React.FC<AboutbertyProps> = () => (
	<View style={[styles.flex, styles.padding, styles.marginBottom]}>
		<ButtonSetting
			name='Terms of use'
			icon='info-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Privacy policy'
			icon='book-open-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Software license'
			icon='award-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
		<View style={[styles.flex, styles.row, styles.spaceBetween, styles.alignItems, { marginTop: 20 }]}>
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.buttonShadow,
					styles.bgWhite,
					styles.borderRadius,
					{ marginRight: 10 },
				]}
			>
				<Icon name='email-outline' width={30} height={30} fill={colors.blue} />
				<Text style={[styles.fontFamily, styles.textBlack, { paddingTop: 6, fontWeight: 'bold' }]} category='s4'>
					Contact us
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.buttonShadow,
					styles.bgWhite,
					styles.borderRadius,
					{ marginLeft: 10 },
				]}
			>
				<Icon name='globe-outline' width={30} height={30} fill={colors.blue} />
				<Text style={[styles.fontFamily, styles.textBlack, { paddingTop: 6, fontWeight: 'bold' }]} category='s4'>
					Website
				</Text>
			</TouchableOpacity>
		</View>
	</View>
)

export const AboutBerty: React.FC<{}> = () => {
	const [version, setVersion] = useState(true)

	return (
		<Layout style={[styles.flex, styles.bgWhite]}>
			<ScrollView>
				<HeaderSettings title="About Berty" action={setVersion} actionValue={version}>
					<HeaderAboutBerty version={version} />
				</HeaderSettings>
				<BodyAboutBerty version={version} />
			</ScrollView>
		</Layout>
	)
}

//
// TermsOfUse
//

const BodyTermsOfUse: React.FC<{}> = () => (
	<View
		style={[
			styles.padding,
			styles.flex,
			styles.littleMarginBottom,
			styles.marginLeft,
			styles.marginTop,
			styles.marginRight,
		]}
	>
		<Text style={[styles.fontFamily, { fontSize: 12 }]}>
			Berty Technologies (“Berty”) utilizes state-of-the-art security and end-to-end encryption to provide private
			messaging, Internet calling, and other services to users worldwide. You agree to our Terms of Service (“Terms”) by
			installing or using our apps, services, or website (together, “Services”).
		</Text>
		<View style={[styles.bigMarginTop]}>
			<Text style={[{ fontSize: 15, fontWeight: 'bold' }]}>Minimum Age</Text>
			<Text style={[styles.fontFamily, { fontSize: 12 }]}>
				You must be at least 13 years old to use our Services. The minimum age to use our Services without parental
				approval may be higher in your home country.
			</Text>
		</View>
		<View style={[styles.bigMarginTop]}>
			<Text style={[{ fontSize: 15, fontWeight: 'bold' }]}>Privacy of user data</Text>
			<Text style={[styles.fontFamily, { fontSize: 12 }]}>
				Berty does not sell, rent or monetize your personal data or content in any way – ever.
			</Text>
		</View>
		<View style={[styles.marginTop]}>
			<Text style={[styles.fontFamily, { fontSize: 12 }]}>
				Please read our Privacy Policy to understand how we safeguard the information you provide when using our
				Services. For the purpose of operating our Services, you agree to our data practices as described in our Privacy
				Policy.
			</Text>
		</View>
		<View style={[styles.bigMarginTop]}>
			<Text style={[{ fontSize: 15, fontWeight: 'bold' }]}>Software</Text>
			<Text style={[styles.fontFamily, { fontSize: 12 }]}>
				In order to enable new features and enhanced functionality, you consent to downloading and installing updates to
				our Services.
			</Text>
		</View>
		<View style={[styles.bigMarginTop]}>
			<Text style={[{ fontSize: 15, fontWeight: 'bold' }]}>Fees and Taxes</Text>
			<Text style={[styles.fontFamily, { fontSize: 12 }]}>
				You are responsible for data and mobile carrier fees and taxes associated with the devices on which you use our
				Services.
			</Text>
		</View>
	</View>
)

export const TermsOfUse: React.FC<{}> = () => (
	<Layout style={[styles.flex, styles.bgWhite]}>
		<ScrollView>
			<HeaderSettings title="Terms of use" desc="Last updated: August 29th 2019" />
			<BodyTermsOfUse />
		</ScrollView>
	</Layout>
)

//
// DevTools
//

const HeaderDevTools: React.FC<{}> = () => (
	<View style={[styles.flex, styles.row, styles.spaceBetween, styles.alignItems, { marginTop: 20 }]}>
		<TouchableOpacity
			style={[
				styles.flex,
				styles.padding,
				styles.alignItems,
				styles.justifyContent,
				styles.buttonShadow,
				styles.bgWhite,
				styles.borderRadius,
				{ marginRight: 20, height: 90 },
			]}
		>
			<Icon name='smartphone-outline' width={30} height={30} fill={colors.darkGray} />
			<Text
				style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6, fontWeight: 'bold' }]}
				category='s4'
			>
				Device infos
			</Text>
		</TouchableOpacity>
		<TouchableOpacity
			style={[
				styles.flex,
				styles.padding,
				styles.alignItems,
				styles.justifyContent,
				styles.buttonShadow,
				styles.bgWhite,
				styles.borderRadius,
				{ marginRight: 20, height: 90 },
			]}
		>
			<Icon name='list-outline' width={30} height={30} fill={colors.darkGray} />
			<Text
				style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6, fontWeight: 'bold' }]}
				category='s4'
			>
				List events
			</Text>
		</TouchableOpacity>
		<TouchableOpacity
			style={[
				styles.flex,
				styles.padding,
				styles.alignItems,
				styles.justifyContent,
				styles.buttonShadow,
				styles.bgWhite,
				styles.borderRadius,
				{ height: 90 },
			]}
		>
			<Icon name='repeat-outline' width={30} height={30} fill={colors.blue} />
			<Text
				style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6, fontWeight: 'bold' }]}
				category='s4'
				numberOfLines={2}
			>
				Restart daemon
			</Text>
		</TouchableOpacity>
	</View>
)

const BodyDevTools: React.FC<{}> = () => (
	<View style={[styles.padding, styles.flex, styles.littleMarginBottom]}>
		<ButtonSetting name='Bot mode' icon='briefcase-outline' iconSize={30} iconColor={colors.green} toggled={true} />
		<ButtonSetting
			name='local gRPC'
			icon='hard-drive-outline'
			iconSize={30}
			iconColor={colors.darkGray}
			toggled={true}
		/>
		<ButtonSetting
			name='Console logs'
			icon='folder-outline'
			iconSize={30}
			iconColor={colors.darkGray}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Network'
			icon='activity-outline'
			iconSize={30}
			iconColor={colors.darkGray}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Notifications'
			icon='bell-outline'
			iconSize={30}
			iconColor={colors.darkGray}
			actionIcon='arrow-ios-forward'
		/>

		<View style={[styles.flex, styles.row, styles.spaceBetween, styles.alignItems, { marginTop: 20 }]}>
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.justifyContent,
					styles.buttonShadow,
					styles.bgWhite,
					styles.borderRadius,
					{ marginRight: 20, height: 90 },
				]}
			>
				<Icon name='smartphone-outline' width={30} height={30} fill={colors.darkGray} />
				<Text
					style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6, fontWeight: 'bold' }]}
					category='s4'
				>
					Device infos
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.justifyContent,
					styles.buttonShadow,
					styles.bgWhite,
					styles.borderRadius,
					{ marginRight: 20, height: 90 },
				]}
			>
				<Icon name='book-outline' width={30} height={30} fill={colors.darkGray} />
				<Text
					style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6, fontWeight: 'bold' }]}
					category='s4'
					numberOfLines={2}
				>
					Generate fake data
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.justifyContent,
					styles.buttonShadow,
					styles.bgWhite,
					styles.borderRadius,
					{ height: 90 },
				]}
			>
				<Icon name='trash-outline' width={30} height={30} fill={colors.red} />
				<Text
					style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6, fontWeight: 'bold' }]}
					category='s4'
					numberOfLines={2}
				>
					Drop database
				</Text>
			</TouchableOpacity>
		</View>
	</View>
)

export const DevTools: React.FC<{}> = () => (
	<Layout style={[styles.bgWhite, styles.flex]}>
		<ScrollView>
			<HeaderSettings title='Dev tools' bgColor={colors.darkGray}>
				<HeaderDevTools />
			</HeaderSettings>
			<BodyDevTools />
		</ScrollView>
	</Layout>
)
