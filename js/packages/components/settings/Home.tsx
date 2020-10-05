import React from 'react'
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { SafeAreaView } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'

import { useStyles } from '@berty-tech/styles'

import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import HeaderSettings from '../shared-components/Header'
import { SwipeHelperReactNavTabBar } from '../shared-components/SwipeNavRecognizer'

import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useAccount } from '@berty-tech/store/hooks'

//
// Home Vue
//

// Type

// Style
const useStylesHome = () => {
	const [{ height, margin, padding, text }] = useStyles()
	return {
		firstHeaderButton: [margin.right.scale(20), height(90)],
		secondHeaderButton: [margin.right.scale(20), height(90)],
		thirdHeaderButton: height(90),
		headerNameText: text.size.scale(13),
		scrollViewPadding: padding.bottom.scale(116),
	}
}

const HomeHeaderGroupButton: React.FC = () => {
	const _styles = useStylesHome()
	const [{ padding, color }] = useStyles()
	const { navigate } = useNavigation()
	return (
		<View style={[padding.horizontal.medium]}>
			<ButtonSettingRow
				state={[
					{
						name: 'Updates',
						icon: 'arrow-upward-outline',
						color: color.blue,
						style: _styles.firstHeaderButton,
						onPress: navigate.settings.appUpdates,
					},
					{
						name: 'Help',
						icon: 'question-mark-circle-outline',
						color: color.red,
						style: _styles.secondHeaderButton,
						onPress: navigate.settings.help,
					},
					{
						name: 'Settings',
						icon: 'settings-2-outline',
						color: color.blue,
						style: _styles.thirdHeaderButton,
						onPress: navigate.settings.mode,
					},
				]}
			/>
		</View>
	)
}
const HomeHeaderAvatar: React.FC = () => {
	const _styles = useStylesHome()
	const [{ row, margin, background, border, color, padding }, { scaleSize }] = useStyles()
	const account = useAccount()
	const navigation = useNavigation()
	return (
		<View style={[row.center, margin.top.scale(50)]}>
			<TouchableOpacity
				style={[background.white, border.radius.medium, padding.scale(20), padding.top.scale(40)]}
				onPress={() => navigation.navigate.settings.myBertyId()}
			>
				<View style={[{ alignItems: 'center' }]}>
					<View style={{ position: 'absolute', top: -80 * scaleSize }}>
						<ProceduralCircleAvatar
							seed={account?.publicKey}
							size={80}
							diffSize={25}
							style={[border.shadow.big]}
						/>
					</View>
					<Text style={[_styles.headerNameText]}>{account?.displayName || ''}</Text>
					<View
						style={[
							// { paddingLeft: 12, paddingTop: 20 },
							padding.left.scale(12),
							padding.top.scale(20),
						]}
					>
						<Icon
							name='qr'
							pack='custom'
							width={140 * scaleSize}
							height={140 * scaleSize}
							fill={color.blue}
						/>
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const HomeHeader: React.FC = () => {
	const [{ margin }] = useStyles()
	return (
		<SafeAreaView style={[margin.bottom.medium]}>
			<HomeHeaderAvatar />
		</SafeAreaView>
	)
}

const HomeBodySettings: React.FC<{}> = () => {
	const [{ flex, color, padding, margin }] = useStyles()
	const { navigate } = useNavigation()
	return (
		<View style={[flex.tiny, padding.horizontal.medium, margin.top.medium]}>
			<ButtonSetting
				name='Notifications'
				icon='bell-outline'
				iconColor={color.blue}
				state={{ value: 'Current', color: color.white, bgColor: color.blue }}
				onPress={navigate.settings.notifications}
			/>
			<ButtonSetting
				name='Bluetooth'
				icon='bluetooth-outline'
				iconColor={color.blue}
				onPress={navigate.settings.bluetooth}
			/>

			<ButtonSetting
				name='External services'
				icon='cube-outline'
				iconColor={color.blue}
				iconSize={30}
				actionIcon='arrow-ios-forward'
				onPress={navigate.settings.servicesAuth}
			/>
			<ButtonSetting name='Dark mode' icon='moon-outline' iconColor={color.blue} toggled disabled />
			<ButtonSetting
				name='About Berty'
				icon='info-outline'
				iconColor={color.blue}
				onPress={navigate.settings.aboutBerty}
			/>
			<ButtonSetting
				name='DevTools'
				icon='options-2-outline'
				iconColor={color.blue}
				onPress={navigate.settings.devTools}
			/>
		</View>
	)
}

export const Home: React.FC<ScreenProps.Settings.Home> = () => {
	const account = useAccount()
	const _styles = useStylesHome()
	const [{ flex, background, row, absolute }] = useStyles()

	return (
		<>
			<View style={[flex.tiny, background.white]}>
				<SwipeHelperReactNavTabBar>
					{account == null ? (
						<ActivityIndicator size='large' style={[row.center]} />
					) : (
						<ScrollView bounces={false} contentContainerStyle={[_styles.scrollViewPadding]}>
							<HeaderSettings>
								<View>
									<HomeHeader />
									<HomeHeaderGroupButton />
								</View>
							</HeaderSettings>
							<HomeBodySettings />
						</ScrollView>
					)}
				</SwipeHelperReactNavTabBar>
			</View>
			<LinearGradient
				style={[
					absolute.bottom,
					{ alignItems: 'center', justifyContent: 'center', height: '15%', width: '100%' },
				]}
				colors={['#ffffff00', '#ffffff80', '#ffffffc0', '#ffffffff']}
			/>
		</>
	)
}
