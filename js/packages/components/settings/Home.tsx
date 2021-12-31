import React from 'react'
import {
	ActivityIndicator,
	ScrollView,
	Share,
	StatusBar,
	TouchableOpacity,
	View,
} from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import QRCode from 'react-native-qrcode-svg'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import {
	MessengerActions,
	useMessengerContext,
	closeAccountWithProgress,
	useThemeColor,
} from '@berty-tech/store'
import { useAppDispatch, useAccount } from '@berty-tech/react-redux'

import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { AccountAvatar } from '../avatars'
import logo from '../main/1_berty_picto.png'
import { WelcomeChecklist } from './WelcomeChecklist'
import { LoaderDots } from '../gates'

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

const HomeHeaderGroupButton: React.FC = () => {
	const _styles = useStylesHome()
	const [{ padding }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const { navigate } = useNavigation()

	return (
		<View style={[padding.horizontal.medium]}>
			<ButtonSettingRow
				state={[
					{
						name: t('settings.faq.title'),
						icon: 'question-mark-circle-outline',
						color: colors['secondary-background-header'],
						style: _styles.firstHeaderButton,
						onPress: () => navigate('Settings.Faq'),
					},
					{
						name: t('settings.roadmap.title'),
						icon: 'calendar-outline',
						color: colors['background-header'],
						style: _styles.secondHeaderButton,
						onPress: () => navigate('Settings.Roadmap'),
					},
					{
						name: t('settings.mode.title'),
						icon: 'settings-2-outline',
						color: colors['background-header'],
						style: _styles.thirdHeaderButton,
						onPress: () => navigate('Settings.Mode'),
					},
				]}
			/>
		</View>
	)
}

const HomeHeaderAvatar: React.FC = () => {
	const _styles = useStylesHome()
	const { navigate } = useNavigation()
	const [{ row, border, padding }, { windowWidth, windowHeight, scaleHeight, scaleSize }] =
		useStyles()
	const ctx = useMessengerContext()
	const colors = useThemeColor()
	const account = useAccount()
	const qrCodeSize = Math.min(windowHeight, windowWidth) * 0.4
	const [link, setLink] = React.useState<string>('')

	React.useEffect(() => {
		const getAccountLink = async () => {
			if (account.displayName) {
				const ret = await ctx.client?.instanceShareableBertyID({
					reset: false,
					displayName: account.displayName,
				})
				if (ret?.internalUrl) {
					setLink(ret?.internalUrl)
				}
			}
		}
		getAccountLink().then()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<View style={[row.center, padding.top.small]}>
			<TouchableOpacity
				style={[
					border.radius.medium,
					padding.scale(20),
					padding.top.scale(55),
					{ backgroundColor: colors['main-background'] },
				]}
				onPress={() => navigate('Settings.MyBertyId')}
			>
				<View style={[{ alignItems: 'center' }]}>
					<View style={{ position: 'absolute', top: -(90 * scaleSize) }}>
						<AccountAvatar size={80 * scaleSize} />
					</View>
					<Text style={[_styles.headerNameText, { color: colors['main-text'] }]}>
						{account.displayName || ''}
					</Text>
					<View style={[padding.top.scale(18 * scaleHeight)]}>
						{link ? (
							<QRCode
								size={qrCodeSize}
								value={link}
								logo={logo}
								color={colors['background-header']}
								mode='circle'
								backgroundColor={colors['main-background']}
							/>
						) : (
							<View style={{ width: qrCodeSize, height: qrCodeSize, justifyContent: 'center' }}>
								<LoaderDots />
							</View>
						)}
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const HomeBodySettings: React.FC = () => {
	const [{ flex, padding }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const reduxDispatch = useAppDispatch()
	const { dispatch } = useMessengerContext()
	const account = useAccount()
	const url = account.link
	const { navigate } = useNavigation()

	return (
		<View style={[flex.tiny, padding.horizontal.medium, padding.bottom.small]}>
			<ButtonSetting
				name={t('settings.home.share-link')}
				icon='attach-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				onPress={async () => {
					if (url) {
						try {
							await Share.share({ url, message: url })
						} catch (e) {
							console.error(e)
						}
					}
				}}
			/>
			<ButtonSetting
				name={t('settings.home.create-group')}
				icon='add-new-group'
				iconPack='custom'
				iconSize={30}
				iconColor={colors['background-header']}
				onPress={() => navigate('Main.CreateGroupAddMembers')}
			/>
			<ButtonSetting
				name={t('settings.home.create-new-account')}
				icon='plus-circle'
				iconSize={30}
				iconColor={colors['background-header']}
				onPress={async () => {
					await closeAccountWithProgress(dispatch, reduxDispatch)
					await dispatch({ type: MessengerActions.SetStateOnBoardingReady })
				}}
			/>
		</View>
	)
}

export const Home: ScreenFC<'Settings.Home'> = () => {
	const account = useAccount()
	const [{ row, margin, text, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const { navigate, setOptions } = useNavigation()

	React.useLayoutEffect(() => {
		setOptions({
			headerRight: ({ tintColor }: any) => (
				<TouchableOpacity
					onPress={() => navigate('Modals.EditProfile')}
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
	}, [margin.right.small, navigate, setOptions, scaleSize, t, text.size.medium])

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
								<HomeHeaderAvatar />
								<WelcomeChecklist />
								<HomeHeaderGroupButton />
							</View>
						</View>
						<HomeBodySettings />
					</ScrollView>
				)}
			</View>
		</>
	)
}
