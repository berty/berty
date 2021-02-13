import React from 'react'
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'
import { Translation, useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useAccount } from '@berty-tech/store/hooks'

import { ButtonSetting, ButtonSettingRow } from '../common/SettingsButtons'
import HeaderSettings from '../common/Header'
import { SwipeNavRecognizer } from '../common/SwipeNavRecognizer'
import logo from '../main/1_berty_picto.png'
import { AccountAvatar } from '../avatars'

const useStylesHome = () => {
	const [{ height, margin, padding, text }] = useStyles()
	return {
		firstHeaderButton: [margin.right.scale(20), height(90)],
		secondHeaderButton: [margin.right.scale(20), height(90)],
		thirdHeaderButton: height(90),
		headerNameText: text.size.scale(13),
		scrollViewPadding: padding.bottom.scale(50),
	}
}

const HomeHeaderGroupButton: React.FC = () => {
	const _styles = useStylesHome()
	const [{ padding, color }] = useStyles()
	const { navigate } = useNavigation()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View
					style={[
						padding.horizontal.medium,
						padding.top.small,
						{ position: 'absolute', width: '100%', bottom: -40 },
					]}
				>
					<ButtonSettingRow
						state={[
							{
								name: t('settings.home.header-left-button'),
								icon: 'question-mark-circle-outline',
								color: color.red,
								style: _styles.firstHeaderButton,
								onPress: () => navigate.settings.help(),
							},
							{
								name: t('settings.home.header-center-button'),
								icon: 'options-2-outline',
								color: color.dark.grey,
								style: _styles.secondHeaderButton,
								onPress: () => navigate.settings.devTools(),
							},
							{
								name: t('settings.home.header-right-button'),
								icon: 'settings-2-outline',
								color: color.blue,
								style: _styles.thirdHeaderButton,
								onPress: () => navigate.settings.mode(),
							},
						]}
					/>
				</View>
			)}
		</Translation>
	)
}

const HomeHeaderAvatar: React.FC = () => {
	const _styles = useStylesHome()
	const [
		{ row, margin, background, border, padding },
		{ windowWidth, windowHeight, scaleHeight },
	] = useStyles()
	const account = useAccount()
	const navigation = useNavigation()
	const qrCodeSize = Math.min(windowHeight, windowWidth) * 0.3

	return (
		<View style={[row.center, margin.top.scale(30), padding.bottom.scale(70)]}>
			<TouchableOpacity
				style={[background.white, border.radius.medium, padding.scale(20), padding.top.scale(40)]}
				onPress={() => navigation.navigate.settings.myBertyId()}
			>
				<View style={[{ alignItems: 'center' }]}>
					<View
						style={{
							position: 'absolute',
							top: -73,
						}}
					>
						<AccountAvatar size={64} />
					</View>
					<Text style={[_styles.headerNameText]}>{account?.displayName || ''}</Text>
					<View style={[padding.top.scale(20 * scaleHeight)]}>
						{(account?.link && (
							<QRCode size={qrCodeSize} value={account.link} logo={logo} color='#3845E0' />
						)) ||
							null}
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const HomeHeader: React.FC = () => {
	const navigation = useNativeNavigation()
	const [{ color, margin }] = useStyles()
	const { t }: { t: any } = useTranslation()

	return (
		<View style={{ width: '100%' }}>
			<View
				style={[
					margin.top.scale(10),
					{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
				]}
			>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Icon name='arrow-back-outline' width={30} height={30} fill={color.white} />
				</TouchableOpacity>
				<View />
				<TouchableOpacity
					onPress={() => navigation.navigate('Settings.EditProfile')}
					style={{
						flexDirection: 'row',
						alignContent: 'center',
						alignItems: 'center',
					}}
				>
					<Text style={[{ color: color.white }, margin.right.small]}>
						{t('settings.home.edit-profile')}
					</Text>
					<Icon name='edit-outline' width={30} height={30} fill={color.white} />
				</TouchableOpacity>
			</View>
			<HomeHeaderAvatar />
		</View>
	)
}

const HomeBodySettings: React.FC<{}> = () => {
	const [{ flex, color, padding }] = useStyles()
	const navigation = useNativeNavigation()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[flex.tiny, padding.horizontal.medium]}>
					<ButtonSetting
						name={t('settings.home.network-button')}
						icon='earth'
						iconPack='custom'
						iconColor={color.blue}
						onPress={() => navigation.navigate('Settings.NetworkMap')}
					/>
				</View>
			)}
		</Translation>
	)
}

export const Home: React.FC<ScreenProps.Settings.Home> = () => {
	const account = useAccount()
	const [{ flex, background, row, margin }] = useStyles()
	const navigation = useNativeNavigation()

	return (
		<>
			<View style={[flex.tiny, background.white]}>
				<SwipeNavRecognizer
					onSwipeUp={() => navigation.goBack()}
					onSwipeLeft={() => navigation.goBack()}
					onSwipeRight={() => navigation.goBack()}
					onSwipeDown={() => navigation.goBack()}
				>
					{account == null ? (
						<ActivityIndicator size='large' style={[row.center]} />
					) : (
						<ScrollView bounces={false}>
							<View style={[margin.bottom.scale(20)]}>
								<HeaderSettings>
									<View>
										<HomeHeader />
										<HomeHeaderGroupButton />
									</View>
								</HeaderSettings>
							</View>
							<HomeBodySettings />
						</ScrollView>
					)}
				</SwipeNavRecognizer>
			</View>
		</>
	)
}
