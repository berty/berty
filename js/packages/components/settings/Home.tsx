import React, { ComponentProps, useState } from 'react'
import { ActivityIndicator, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import QRCode from 'react-native-qrcode-svg'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { ScreenFC } from '@berty-tech/navigation'
import {
	useAccount,
	useMessengerContext,
	useThemeColor,
	PersistentOptionsKeys,
} from '@berty-tech/store'
import { languages } from '@berty-tech/berty-i18n/locale/languages'
import { setAccountLanguage } from '@berty-tech/redux/reducers/accountSettings.reducer'
import { useAppDispatch } from '@berty-tech/redux/react-redux'

import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { DropDownPicker, Item } from '../shared-components/DropDownPicker'
import { AccountAvatar } from '../avatars'
import { EditProfile } from './EditProfile'
import logo from '../main/1_berty_picto.png'
import { WelcomeChecklist } from './WelcomeChecklist'

const _verticalOffset = 30

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

const HomeHeaderGroupButton: React.FC<{ navigation: ComponentProps<typeof Home>['navigation'] }> =
	({ navigation: { navigate } }) => {
		const _styles = useStylesHome()
		const [{ padding }] = useStyles()
		const colors = useThemeColor()
		const { t }: any = useTranslation()

		return (
			<View style={[padding.horizontal.medium]}>
				<ButtonSettingRow
					isScroll
					state={[
						{
							name: t('settings.help.updates-button'),
							icon: 'arrow-upward-outline',
							color: colors['background-header'],
							style: _styles.firstHeaderButton,
							onPress: () => navigate('Settings.AppUpdates'),
						},
						{
							name: t('settings.faq.title'),
							icon: 'question-mark-circle-outline',
							color: colors['secondary-background-header'],
							style: _styles.firstHeaderButton,
							onPress: () => navigate('Settings.Faq'),
						},
						{
							name: t('settings.home.header-right-button'),
							icon: 'settings-2-outline',
							color: colors['background-header'],
							style: _styles.firstHeaderButton,
							onPress: () => navigate('Settings.Mode'),
						},
						{
							name: t('settings.roadmap.title'),
							icon: 'calendar-outline',
							color: colors['background-header'],
							style: _styles.thirdHeaderButton,
							onPress: () => navigate('Settings.Roadmap'),
						},
					]}
				/>
			</View>
		)
	}

const HomeHeaderAvatar: React.FC<{ navigation: ComponentProps<typeof Home>['navigation'] }> = ({
	navigation,
}) => {
	const _styles = useStylesHome()
	const [{ row, border, padding }, { windowWidth, windowHeight, scaleHeight, scaleSize }] =
		useStyles()
	const colors = useThemeColor()
	const account = useAccount()
	const qrCodeSize = Math.min(windowHeight, windowWidth) * 0.3

	return (
		<View style={[row.center, padding.top.small]}>
			<TouchableOpacity
				style={[
					border.radius.medium,
					padding.scale(20),
					padding.top.scale(40),
					{ backgroundColor: colors['main-background'] },
				]}
				onPress={() => navigation.navigate('Settings.MyBertyId')}
			>
				<View style={[{ alignItems: 'center' }]}>
					<View style={{ position: 'absolute', top: -73 }}>
						<AccountAvatar size={60 * scaleSize} />
					</View>
					<Text style={[_styles.headerNameText, { color: colors['main-text'] }]}>
						{account?.displayName || ''}
					</Text>
					<View style={[padding.top.scale(18 * scaleHeight)]}>
						{(account?.link && (
							<QRCode
								size={qrCodeSize}
								value={account.link}
								logo={logo}
								color={colors['background-header']}
								mode='circle'
								backgroundColor={colors['main-background']}
							/>
						)) ||
							null}
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const HomeBodySettings: React.FC<{ navigation: ComponentProps<typeof Home>['navigation'] }> = ({
	navigation,
}) => {
	const [{ flex, padding }] = useStyles()
	const colors = useThemeColor()
	const ctx = useMessengerContext()
	const { t, i18n } = useTranslation()
	const enableNotif = ctx.persistentOptions.notifications.enable
	const dispatch = useAppDispatch()
	console.log(i18n.language)

	const items = Object.entries(languages).map(([key, attrs]) => ({
		label: attrs.localName,
		value: key,
	}))

	items.push({ label: 'Debug', value: 'cimode' })
	return (
		<View style={[flex.tiny, padding.horizontal.medium, padding.bottom.small]}>
			<ButtonSetting
				name={t('settings.home.expert-setup')}
				icon='options-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				onPress={() => navigation.navigate('Onboarding.ExpertSetup')}
			/>
			<DropDownPicker
				items={items}
				defaultValue={i18n.language}
				onChangeItem={(item: Item) => dispatch(setAccountLanguage(item.value))}
			/>
			<ButtonSetting
				name={t('settings.home.notifications-button.title')}
				icon='bell-outline'
				iconColor={colors['background-header']}
				state={{
					value: enableNotif
						? t('settings.home.notifications-button.tag-enabled')
						: t('settings.home.notifications-button.tag-disabled'),
					color: enableNotif ? colors['background-header'] : colors['secondary-text'],
					bgColor: enableNotif ? colors['positive-asset'] : `${colors['negative-asset']}40`,
				}}
				onPress={() => navigation.navigate('Settings.Notifications')}
			/>
			<ButtonSetting
				name={t('settings.home.bluetooth-button.title')}
				icon='bluetooth-outline'
				iconColor={colors['background-header']}
				onPress={() => navigation.navigate('Settings.Bluetooth')}
			/>
			<ButtonSetting
				name={t('settings.home.dark-mode-button')}
				icon='moon-outline'
				iconColor={colors['background-header']}
				toggled
				varToggle={ctx.persistentOptions.themeColor.isDark}
				actionToggle={async () => {
					await ctx.setPersistentOption({
						type: PersistentOptionsKeys.ThemeColor,
						payload: {
							...ctx.persistentOptions.themeColor,
							isDark: !ctx.persistentOptions.themeColor.isDark,
						},
					})
				}}
			/>
			<ButtonSetting
				name={t('settings.devtools.theme-editor')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				onPress={() => navigation.navigate('Settings.ThemeEditor')}
			/>
			<ButtonSetting
				name={t('settings.home.header-center-button')}
				icon='options-2-outline'
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => navigation.navigate('Settings.DevTools')}
			/>
		</View>
	)
}

export const Home: ScreenFC<'Settings.Home'> = ({ navigation }) => {
	const [openModal, setOpenModal] = useState(false)
	const account = useAccount()
	const [{ row, margin, text, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: ({ tintColor }: any) => (
				<TouchableOpacity
					onPress={() => setOpenModal(true)}
					style={{
						flexDirection: 'row',
						alignContent: 'center',
						alignItems: 'center',
						justifyContent: 'flex-end',
						paddingVertical: 5 * scaleSize,
					}}
				>
					<Text style={[{ color: tintColor }, margin.right.small, text.size.medium]}>
						{t('settings.home.edit-profile')}
					</Text>
					<Icon
						name='edit-outline'
						width={25 * scaleSize}
						height={25 * scaleSize}
						fill={tintColor}
					/>
				</TouchableOpacity>
			),
		})
	}, [margin.right.small, navigation, scaleSize, t, text.size.medium])

	React.useEffect(() => {
		if (openModal) {
			navigation.setOptions({
				headerShown: false,
			})
		} else {
			navigation.setOptions({
				headerShown: true,
			})
		}
	})

	return (
		<>
			<View style={{ backgroundColor: colors['main-background'], flex: 1 }}>
				<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
				{account == null ? (
					<ActivityIndicator size='large' style={[row.center]} />
				) : (
					<ScrollView
						bounces={false}
						nestedScrollEnabled
						contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
						showsVerticalScrollIndicator={false}
					>
						<View
							style={[
								{ backgroundColor: colors['background-header'] },
								border.radius.bottom.medium,
								margin.bottom.scale(_verticalOffset),
							]}
						>
							<View style={{ bottom: -_verticalOffset }}>
								<HomeHeaderAvatar navigation={navigation} />
								<WelcomeChecklist openEditProfile={() => setOpenModal(true)} />
								<HomeHeaderGroupButton navigation={navigation} />
							</View>
						</View>
						<HomeBodySettings navigation={navigation} />
					</ScrollView>
				)}
			</View>
			{openModal && <EditProfile closeModal={() => setOpenModal(false)} />}
		</>
	)
}
