import React, { useCallback, useEffect, useState } from 'react'
import { Linking, Platform, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
	createNativeStackNavigator,
	NativeStackNavigationOptions,
} from '@react-navigation/native-stack'
import { CommonActions, NavigationProp, useNavigation } from '@react-navigation/native'
import { Icon } from '@ui-kitten/components'
import mapValues from 'lodash/mapValues'
import { useSelector } from 'react-redux'

import * as RawComponents from '@berty/screens'
import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import {
	MESSENGER_APP_STATE,
	selectAppState,
	selectHandledLink,
	setHandledLink,
} from '@berty/redux/reducers/ui.reducer'
import { useAppDispatch } from '@berty/hooks'

import { ScreensParams } from './types'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const CustomTitleStyle: () => any = () => {
	const { text } = useStyles()

	return [
		text.size.large,
		{
			headerTitleStyle: {
				...text.bold,
			},
		},
	]
}

const ChatScreenOptions: (
	additionalProps?: NativeStackNavigationOptions,
) => NativeStackNavigationOptions = additionalProps => {
	const colors = useThemeColor()
	return {
		headerStyle: {
			backgroundColor: colors['main-background'],
		},
		headerTintColor: colors['main-text'],
		headerBackTitleVisible: false,
		headerShadowVisible: false,
		...additionalProps,
	}
}

const BackgroundHeaderScreenOptions: (
	additionalProps?: NativeStackNavigationOptions,
) => NativeStackNavigationOptions = additionalProps => {
	const colors = useThemeColor()
	return {
		headerStyle: {
			backgroundColor: colors['background-header'],
		},
		headerTintColor: colors['reverted-main-text'],
		headerBackTitleVisible: false,
		headerShadowVisible: false,
		...additionalProps,
	}
}

const AltBackgroundHeaderScreenOptions: (
	additionalProps?: NativeStackNavigationOptions,
) => NativeStackNavigationOptions = additionalProps => {
	const colors = useThemeColor()
	return {
		headerStyle: {
			backgroundColor: colors['alt-secondary-background-header'],
		},
		headerTintColor: colors['reverted-main-text'],
		headerBackTitleVisible: false,
		headerShadowVisible: false,
		...additionalProps,
	}
}

function useLinking(): [string | null, unknown] {
	const [url, setUrl] = useState<string | null>(null)
	const [error, setError] = useState<unknown>()

	const initialUrl = useCallback(async () => {
		try {
			const linkingUrl = await Linking.getInitialURL()
			if (linkingUrl) {
				setUrl(linkingUrl)
			}
		} catch (ex) {
			setError(ex)
		}
	}, [])

	useEffect(() => {
		const handleOpenUrl = (ev: any) => {
			console.log('handleOpenUrl:', ev.url)
			setUrl(null)
			setUrl(ev.url)
		}

		// for initial render
		initialUrl().then(() => {
			Linking.addEventListener('url', handleOpenUrl)
		})

		return () => Linking.removeEventListener('url', handleOpenUrl)
	}, [initialUrl])

	return [url, error]
}

const DeepLinkBridge: React.FC = React.memo(() => {
	const [url, error] = useLinking()
	const navigation = useNavigation<NavigationProp<ScreensParams>>()
	const dispatch = useAppDispatch()
	const handledLink = useSelector(selectHandledLink)

	useEffect(() => {
		if (!handledLink && url && !error && !(url as string).startsWith('berty://services-auth')) {
			dispatch(setHandledLink(true))
			navigation.navigate('Chat.ManageDeepLink', { type: 'link', value: url })
		}
	}, [dispatch, handledLink, error, navigation, url])

	return null
})

let Components: typeof RawComponents

// @ts-ignore
Components = mapValues(RawComponents, SubComponents =>
	mapValues(
		SubComponents,
		(Component: React.FC): React.FC =>
			React.memo(props => (
				<>
					{Platform.OS !== 'web' ? <DeepLinkBridge /> : null}
					<Component {...props} />
				</>
			)),
	),
)

const NavigationStack = createNativeStackNavigator<ScreensParams>()

export const Navigation: React.FC = React.memo(() => {
	const appState = useSelector(selectAppState)
	const colors = useThemeColor()
	const { scaleSize } = useAppDimensions()
	const { t }: any = useTranslation()
	const { dispatch } = useNavigation()

	useEffect(() => {
		console.log('context app State', appState)
		switch (appState) {
			case MESSENGER_APP_STATE.READY:
				dispatch(
					CommonActions.reset({
						routes: [{ name: 'Chat.Home' }],
					}),
				)
				return
			case MESSENGER_APP_STATE.PRE_READY:
				dispatch(
					CommonActions.reset({
						routes: [{ name: 'Onboarding.SetupFinished' }],
					}),
				)
				return
			case MESSENGER_APP_STATE.GET_STARTED:
				if (Platform.OS === 'web') {
					dispatch(
						CommonActions.reset({
							routes: [{ name: 'Onboarding.GetStarted' }],
						}),
					)
				}
				return
		}
	}, [appState, dispatch])

	return (
		<NavigationStack.Navigator
			initialRouteName={
				appState === MESSENGER_APP_STATE.GET_STARTED ? 'Onboarding.GetStarted' : 'Chat.Home'
			}
			screenOptions={{
				headerLeft:
					Platform.OS === 'web'
						? props => (
								<TouchableOpacity
									style={{ justifyContent: 'center' }}
									onPress={() => dispatch(CommonActions.goBack())}
								>
									<Icon name='arrow-back' width={24} height={24} fill={props.tintColor} />
								</TouchableOpacity>
						  )
						: undefined,
			}}
		>
			{/* OnBoarding */}
			<NavigationStack.Screen
				name={'Onboarding.GetStarted'}
				component={Components.Onboarding.GetStarted}
				options={{ headerShown: false, title: t('onboarding.getstarted.screenTitle') }}
			/>
			<NavigationStack.Screen
				name={'Onboarding.CreateAccount'}
				component={Components.Onboarding.CreateAccount}
				options={{
					headerStyle: {
						backgroundColor: colors['background-header'],
					},
					headerTintColor: colors['reverted-main-text'],
					headerBackTitleVisible: false,
					title: t('onboarding.getstarted.create-button'),
					headerTitle: () => <></>,
				}}
			/>
			<NavigationStack.Screen
				name={'Onboarding.SetupFinished'}
				component={Components.Onboarding.SetupFinished}
				options={{ headerShown: false, title: t('onboarding.setup-finished.title') }}
			/>
			<NavigationStack.Screen
				name={'Onboarding.CustomModeSettings'}
				component={Components.Onboarding.CustomModeSettings}
				options={{
					headerStyle: {
						backgroundColor: colors['background-header'],
					},
					headerTintColor: colors['reverted-main-text'],
					headerBackTitleVisible: false,
					title: t('onboarding.custom-mode.summary.screenTitle'),
					headerTitle: () => <></>,
				}}
			/>
			<NavigationStack.Screen
				name={'Onboarding.WebViews'}
				component={Components.Onboarding.WebViews}
				options={{
					title: t('onboarding.web-views.title'),
					headerTitle: () => <></>,
					headerBackTitle: '',
					headerTintColor: colors['main-text'],
				}}
			/>
			<NavigationStack.Screen
				name={'Onboarding.DefaultMode'}
				component={Components.Onboarding.DefaultMode}
				options={{
					headerStyle: {
						backgroundColor: colors['background-header'],
					},
					headerTintColor: colors['reverted-main-text'],
					headerBackTitleVisible: false,
					title: t('onboarding.default-mode.summary.screenTitle'),
					headerTitle: () => <></>,
				}}
			/>
			<NavigationStack.Screen
				name={'Onboarding.CustomMode'}
				component={Components.Onboarding.CustomMode}
				options={{
					headerStyle: {
						backgroundColor: colors['background-header'],
					},
					headerTintColor: colors['reverted-main-text'],
					headerBackTitleVisible: false,
					title: t('onboarding.custom-mode.summary.screenTitle'),
					headerTitle: () => <></>,
				}}
			/>
			{/* Chat */}
			<NavigationStack.Screen
				name={'Chat.Home'}
				component={Components.Chat.Home}
				options={{
					headerShown: false,
					title: t('main.home.title'),
				}}
			/>
			<NavigationStack.Screen
				name={'Chat.ContactRequest'}
				component={Components.Chat.ContactRequest}
				options={{
					headerShown: false,
					title: t('main.home.requests.page-title'),
				}}
			/>
			<NavigationStack.Screen
				name={'Chat.Permissions'}
				component={Components.Chat.Permissions}
				options={{
					headerShown: false,
					presentation: 'formSheet',
					title: t('permission.request.title'),
				}}
			/>
			<NavigationStack.Screen
				name={'Chat.BlePermission'}
				component={Components.Chat.BlePermission}
				options={{
					headerShown: false,
					presentation: 'formSheet',
					title: t('permission.proximity.title'),
				}}
			/>
			<NavigationStack.Screen
				name={'Chat.Share'}
				component={Components.Chat.ShareModal}
				options={BackgroundHeaderScreenOptions({
					title: t('main.home.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.CreateGroupAddMembers'}
				component={Components.Chat.CreateGroupAddMembers}
				options={BackgroundHeaderScreenOptions({
					title: t('main.home.create-group.title'),
					headerRight: () => (
						<Icon
							name='users'
							pack='custom'
							width={35 * scaleSize}
							height={35 * scaleSize}
							fill={colors['reverted-main-text']}
						/>
					),
					presentation: 'formSheet',
					...CustomTitleStyle(),
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.CreateGroupFinalize'}
				component={Components.Chat.CreateGroupFinalize}
				options={BackgroundHeaderScreenOptions({
					title: t('main.home.create-group.title'),
					headerRight: () => (
						<Icon
							name='users'
							pack='custom'
							width={35 * scaleSize}
							height={35 * scaleSize}
							fill={colors['reverted-main-text']}
						/>
					),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.OneToOne'}
				component={Components.Chat.OneToOne}
				options={ChatScreenOptions({
					...CustomTitleStyle(),
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.Group'}
				component={Components.Chat.MultiMember}
				options={ChatScreenOptions({
					...ChatScreenOptions(),
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.OneToOneSettings'}
				component={Components.Chat.OneToOneSettings}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.one-to-one-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.ContactSettings'}
				component={Components.Chat.ContactSettings}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.one-to-one-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Group.MultiMemberSettings'}
				component={Components.Chat.MultiMemberSettings}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.multi-member-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Group.ChatSettingsMemberDetail'}
				component={Components.Chat.ChatSettingsMemberDetail}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.multi-member-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.MultiMemberQR'}
				component={Components.Chat.MultiMemberQR}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.multi-member-qr.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.MultiMemberSettingsAddMembers'}
				component={Components.Chat.MultiMemberSettingsAddMembers}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.add-members.members'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.ReplicateGroupSettings'}
				component={Components.Chat.ReplicateGroupSettings}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.replicate-group-settings.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.SharedMedias'}
				component={Components.Chat.SharedMedias}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.shared-medias.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			{/* Settings */}
			<NavigationStack.Screen
				name={'Settings.Home'}
				component={Components.Settings.SettingsHome}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},

					headerTintColor: colors['main-text'],
					headerBackTitleVisible: false,
					title: t('settings.home.title'),
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.Network'}
				component={Components.Settings.Network}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					headerTintColor: colors['main-text'],
					headerBackTitleVisible: false,
					title: t('settings.network.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.Notifications'}
				component={Components.Settings.Notifications}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.notifications.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.ContactAndConversations'}
				component={Components.Settings.ContactAndConversations}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.contact-convs.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.Appearance'}
				component={Components.Settings.Appearance}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.appearance.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.ThemeEditor'}
				component={Components.Settings.ThemeEditor}
				options={{
					headerStyle: {
						backgroundColor: colors['alt-secondary-background-header'],
					},
					headerTintColor: colors['reverted-main-text'],
					title: t('settings.appearance.theme-editor.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.DevicesAndBackup'}
				component={Components.Settings.DevicesAndBackup}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.devices-backup.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.Security'}
				component={Components.Settings.Security}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.security.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.Accounts'}
				component={Components.Settings.Accounts}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.accounts.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.AboutBerty'}
				component={Components.Settings.AboutBerty}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.about.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.MyBertyId'}
				component={Components.Settings.MyBertyId}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.my-berty-ID.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.TermsOfUse'}
				component={Components.Settings.TermsOfUse}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.about.terms-of-use'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.NetworkMap'}
				component={Components.Settings.NetworkMap}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.network-map.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.ServicesAuth'}
				component={Components.Settings.ServicesAuth}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.services-auth.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.DeleteAccount'}
				component={Components.Settings.DeleteAccount}
				options={{
					headerShown: false,
					presentation: 'formSheet',
					title: t('settings.accounts.delete-title'),
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.DevTools'}
				component={Components.Settings.DevTools}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.devtools.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.FakeData'}
				component={Components.Settings.FakeData}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.fake-data.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>

			<NavigationStack.Screen
				name={'Settings.SystemInfo'}
				component={Components.Settings.SystemInfo}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.system-info.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.AddDevConversations'}
				component={Components.Settings.AddDevConversations}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.add-dev-conversations.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.IpfsWebUI'}
				component={Components.Settings.IpfsWebUI}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.ipfs-webui.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.DevText'}
				component={Components.Settings.DevText}
				options={AltBackgroundHeaderScreenOptions({
					title: '',
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.BertyServices'}
				component={Components.Settings.BertyServices}
				options={{
					headerShown: false,
					presentation: 'formSheet',
					title: t('settings.berty-services.title'),
				}}
			/>
			<NavigationStack.Screen
				name={'Settings.Roadmap'}
				component={Components.Settings.Roadmap}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.roadmap.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.Faq'}
				component={Components.Settings.Faq}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.faq.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.PrivacyPolicy'}
				component={Components.Settings.PrivacyPolicy}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.privacy-policy.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.ManageDeepLink'}
				component={Components.Chat.ManageDeepLink}
				options={{
					presentation: 'containedTransparentModal',
					animation: 'fade',
					headerShown: false,
				}}
			/>
			<NavigationStack.Screen
				name={'Modals.ImageView'}
				component={Components.Chat.ImageView}
				options={{
					presentation: 'containedTransparentModal',
					headerShown: false,
				}}
			/>
		</NavigationStack.Navigator>
	)
})
