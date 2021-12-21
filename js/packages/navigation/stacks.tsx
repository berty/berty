import * as RawComponents from '@berty-tech/components'
import { MessengerAppState, useMessengerContext, useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import { CommonActions, NavigationProp, useNavigation } from '@react-navigation/native'
import {
	createNativeStackNavigator,
	NativeStackNavigationOptions,
} from '@react-navigation/native-stack'
import { Icon } from '@ui-kitten/components'
import mapValues from 'lodash/mapValues'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { dispatch } from './rootRef'
import { ScreensParams } from './types'

export const CustomTitleStyle: () => any = () => {
	const [, { scaleSize }] = useStyles()
	return {
		headerTitleStyle: {
			fontFamily: 'Open Sans',
			fontWeight: '700',
			fontSize: 25 * scaleSize,
		},
	}
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

const SecondaryBackgroundHeaderScreenOptions: (
	additionalProps?: NativeStackNavigationOptions,
) => NativeStackNavigationOptions = additionalProps => {
	const colors = useThemeColor()
	return {
		headerStyle: {
			backgroundColor: colors['secondary-background-header'],
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

	async function initialUrl() {
		try {
			const linkingUrl = await Linking.getInitialURL()
			if (linkingUrl) {
				setUrl(linkingUrl)
			}
		} catch (ex) {
			setError(ex)
		}
	}

	useEffect(() => {
		function handleOpenUrl(ev: any) {
			console.log('handleOpenUrl:', ev.url)
			setUrl(null)
			setUrl(ev.url)
		}

		// for initial render
		initialUrl().then(() => {
			Linking.addEventListener('url', handleOpenUrl)
		})

		return () => Linking.removeEventListener('url', handleOpenUrl)
	}, [])

	return [url, error]
}

const DeepLinkBridge: React.FC = React.memo(() => {
	const [url, error] = useLinking()
	const navigation = useNavigation<NavigationProp<ScreensParams>>()
	const ctx = useMessengerContext()

	useEffect(() => {
		if (!ctx.handledLink && url && !error && !(url as string).startsWith('berty://services-auth')) {
			ctx.setHandledLink(true)
			navigation.navigate('Modals.ManageDeepLink', { type: 'link', value: url })
		}
	}, [url, error, navigation, ctx])

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
					<DeepLinkBridge />
					<Component {...props} />
				</>
			)),
	),
)

const NavigationStack = createNativeStackNavigator<ScreensParams>()

export const Navigation: React.FC = React.memo(() => {
	const context = useMessengerContext()
	const colors = useThemeColor()
	const [, { scaleSize }] = useStyles()
	const { t }: any = useTranslation()

	useEffect(() => {
		console.log('context app State', context.appState)
		switch (context.appState) {
			case MessengerAppState.Ready:
				dispatch(
					CommonActions.reset({
						routes: [{ name: 'Main.Home' }],
					}),
				)
				return
			case MessengerAppState.PreReady:
				dispatch(
					CommonActions.reset({
						routes: [{ name: 'Onboarding.SetupFinished' }],
					}),
				)
				return
		}
	}, [context.appState])

	return (
		<NavigationStack.Navigator
			initialRouteName={
				context.appState === MessengerAppState.GetStarted ? 'Onboarding.GetStarted' : 'Main.Home'
			}
		>
			{/* OnBoarding */}
			<NavigationStack.Screen
				name={'Onboarding.GetStarted'}
				component={Components.Onboarding.GetStarted}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name={'Onboarding.CreateAccount'}
				component={Components.Onboarding.CreateAccount}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name={'Onboarding.SetupFinished'}
				component={Components.Onboarding.SetupFinished}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name={'Onboarding.AdvancedSettings'}
				component={Components.Onboarding.AdvancedSettings}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name={'Onboarding.WebViews'}
				component={Components.Onboarding.WebViews}
				options={{ title: '', headerBackTitle: '', headerTintColor: colors['main-text'] }}
			/>
			{/* Main */}
			<NavigationStack.Screen
				name={'Main.Home'}
				component={Components.Main.Home}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name={'Main.ContactRequest'}
				component={Components.Main.ContactRequest}
			/>
			<NavigationStack.Screen
				name={'Main.Scan'}
				component={Components.Main.Scan}
				options={SecondaryBackgroundHeaderScreenOptions({
					title: t('main.scan.title'),
					headerRight: () => (
						<Icon
							name='qr'
							pack='custom'
							width={35 * scaleSize}
							height={35 * scaleSize}
							fill={colors['reverted-main-text']}
						/>
					),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Main.Permissions'}
				component={Components.Main.Permissions}
				options={{ headerShown: false, presentation: 'formSheet' }}
			/>
			{/* CreateGroup */}
			<NavigationStack.Screen
				name={'Main.CreateGroupAddMembers'}
				component={Components.Main.CreateGroupAddMembers}
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
				name={'Main.CreateGroupFinalize'}
				component={Components.Main.CreateGroupFinalize}
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
			{/* Chat */}
			<NavigationStack.Screen
				name={'Chat.OneToOne'}
				component={Components.Chat.OneToOne}
				options={ChatScreenOptions()}
			/>
			<NavigationStack.Screen
				name={'Chat.Group'}
				component={Components.Chat.MultiMember}
				options={ChatScreenOptions()}
			/>
			<NavigationStack.Screen
				name={'Chat.OneToOneSettings'}
				component={Components.Chat.OneToOneSettings}
				options={BackgroundHeaderScreenOptions({
					title: '',
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Chat.ContactSettings'}
				component={Components.Chat.ContactSettings}
				options={BackgroundHeaderScreenOptions({
					title: '',
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Group.MultiMemberSettings'}
				component={Components.Chat.MultiMemberSettings}
				options={BackgroundHeaderScreenOptions({
					title: '',
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
				name={'Group.MultiMemberSettingsAddMembers'}
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
				component={Components.Settings.Home}
				options={BackgroundHeaderScreenOptions({
					title: '',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.MyBertyId'}
				component={Components.Settings.MyBertyId}
				options={BackgroundHeaderScreenOptions({
					title: 'My Berty ID',
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.AppUpdates'}
				component={Components.Settings.AppUpdates}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.updates.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.Help'}
				component={Components.Settings.Help}
				options={SecondaryBackgroundHeaderScreenOptions({
					title: t('settings.help.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.AboutBerty'}
				component={Components.Settings.AboutBerty}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.about.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.TermsOfUse'}
				component={Components.Settings.TermsOfUse}
				options={BackgroundHeaderScreenOptions({
					title: 'Terms of use',
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.Mode'}
				component={Components.Settings.Mode}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.mode.title'),
					...CustomTitleStyle(),
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
				name={'Settings.ThemeEditor'}
				component={Components.Settings.ThemeEditor}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.theme-editor.title'),
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
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={'Settings.BertyServices'}
				component={Components.Settings.BertyServices}
				options={{ headerShown: false, presentation: 'formSheet' }}
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
			{/* Modals */}
			<NavigationStack.Screen
				name={'Modals.ManageDeepLink'}
				component={Components.Modals.ManageDeepLink}
				options={{
					presentation: 'containedTransparentModal',
					animation: 'fade',
					headerShown: false,
				}}
			/>
			<NavigationStack.Screen
				name={'Modals.ImageView'}
				component={Components.Modals.ImageView}
				options={{
					presentation: 'containedTransparentModal',
					headerShown: false,
				}}
			/>
			<NavigationStack.Screen
				name={'Modals.EditProfile'}
				component={Components.Modals.EditProfile}
				options={{
					presentation: 'transparentModal',
					headerShown: false,
					animation: 'fade_from_bottom',
				}}
			/>
		</NavigationStack.Navigator>
	)
})
