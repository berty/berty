import { Icon } from '@ui-kitten/components'
import { Stack, useNavigationContainerRef } from 'expo-router'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, TouchableOpacity, View } from 'react-native'

import { ErrorScreen } from '@berty/components/error'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import AppCommonProviders from '@berty/contexts/AppCommonProviders'
import NotificationProvider from '@berty/contexts/notification.context'
import { PermissionsProvider } from '@berty/contexts/permissions.context'
import { UIKittenProvider } from '@berty/contexts/uiKitten.context'
import { useThemeColor } from '@berty/hooks'
import { initI18N } from '@berty/i18n'
import { useNavigation } from '@berty/navigation'
import { CustomTitleStyle } from '@berty/navigation/screenOptions'
import { isReadyRef, navigationRef } from '@berty/navigation/rootRef'
import 'intl-pluralrules'

initI18N()

const Background = ({ children }: { children: React.ReactNode }) => {
	const colors = useThemeColor()
	return <View style={{ flex: 1, backgroundColor: colors['main-background'] }}>{children}</View>
}

const RootStack: React.FC = () => {
	const colors = useThemeColor()
	const { scaleSize } = useAppDimensions()
	const { t } = useTranslation()

	const chatScreenOptions = (additionalProps?: object) => ({
		headerStyle: { backgroundColor: colors['main-background'] },
		headerTintColor: colors['main-text'],
		headerBackButtonDisplayMode: 'minimal' as const,
		headerShadowVisible: false,
		...additionalProps,
	})

	const backgroundHeaderScreenOptions = (additionalProps?: object) => ({
		headerStyle: { backgroundColor: colors['background-header'] },
		headerTintColor: colors['reverted-main-text'],
		headerBackButtonDisplayMode: 'minimal' as const,
		headerShadowVisible: false,
		...additionalProps,
	})

	const altBackgroundHeaderScreenOptions = (additionalProps?: object) => ({
		headerStyle: { backgroundColor: colors['alt-secondary-background-header'] },
		headerTintColor: colors['reverted-main-text'],
		headerBackButtonDisplayMode: 'minimal' as const,
		headerShadowVisible: false,
		...additionalProps,
	})

	const secondaryHeaderScreenOptions = (additionalProps?: object) => ({
		headerStyle: { backgroundColor: colors['secondary-background'] },
		headerTintColor: colors['main-text'],
		headerBackButtonDisplayMode: 'minimal' as const,
		...additionalProps,
	})

	return (
		<Stack
			screenOptions={{
				headerLeft:
					Platform.OS === 'web'
						? (props: { tintColor?: string }) => <WebBackButton tintColor={props.tintColor} />
						: undefined,
			}}
		>
			{/* Account */}
			<Stack.Screen
				name='account/select-node'
				options={{
					headerShown: false,
					// Full-screen card on both: a root formSheet renders empty on Android and jumps on iOS.
					presentation: 'card',
				}}
			/>
			<Stack.Screen name='account/login-or-create' options={{ headerShown: false }} />
			<Stack.Screen name='account/creating' options={{ headerShown: false }} />
			<Stack.Screen name='account/opening' options={{ headerShown: false }} />
			<Stack.Screen name='account/closing' options={{ headerShown: false }} />
			<Stack.Screen name='account/importing' options={{ headerShown: false }} />
			<Stack.Screen name='account/deleting' options={{ headerShown: false }} />

			{/* Onboarding */}
			<Stack.Screen
				name='onboarding/get-started'
				options={{ headerShown: false, title: t('onboarding.getstarted.screenTitle') }}
			/>
			<Stack.Screen
				name='onboarding/create-account'
				options={{
					headerStyle: { backgroundColor: colors['background-header'] },
					headerTintColor: colors['reverted-main-text'],
					headerBackButtonDisplayMode: 'minimal',
					title: t('onboarding.getstarted.create-button'),
					headerTitle: () => <></>,
				}}
			/>
			<Stack.Screen
				name='onboarding/setup-finished'
				options={{ headerShown: false, title: t('onboarding.setup-finished.title') }}
			/>
			<Stack.Screen
				name='onboarding/custom-mode-settings'
				options={{
					headerStyle: { backgroundColor: colors['background-header'] },
					headerTintColor: colors['reverted-main-text'],
					headerBackButtonDisplayMode: 'minimal',
					title: t('onboarding.custom-mode.summary.screenTitle'),
					headerTitle: () => <></>,
				}}
			/>
			<Stack.Screen
				name='onboarding/web-views'
				options={{
					title: t('onboarding.web-views.title'),
					headerTitle: () => <></>,
					headerBackTitle: '',
					headerTintColor: colors['main-text'],
				}}
			/>
			<Stack.Screen
				name='onboarding/default-mode'
				options={{
					headerStyle: { backgroundColor: colors['background-header'] },
					headerTintColor: colors['reverted-main-text'],
					headerBackButtonDisplayMode: 'minimal',
					title: t('onboarding.default-mode.summary.screenTitle'),
					headerTitle: () => <></>,
				}}
			/>
			<Stack.Screen
				name='onboarding/custom-mode'
				options={{
					headerStyle: { backgroundColor: colors['background-header'] },
					headerTintColor: colors['reverted-main-text'],
					headerBackButtonDisplayMode: 'minimal',
					title: t('onboarding.custom-mode.summary.screenTitle'),
					headerTitle: () => <></>,
				}}
			/>

			{/* Chat */}
			<Stack.Screen
				name='chat/home'
				options={{ headerShown: false, title: t('main.home.title') }}
			/>
			<Stack.Screen
				name='chat/contact-request'
				options={{ headerShown: false, title: t('main.home.requests.title') }}
			/>
			<Stack.Screen
				name='chat/share'
				options={backgroundHeaderScreenOptions({
					title: t('main.home.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='chat/create-group-add-members'
				options={backgroundHeaderScreenOptions({
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
			<Stack.Screen
				name='chat/create-group-finalize'
				options={backgroundHeaderScreenOptions({
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
			<Stack.Screen name='chat/one-to-one' options={chatScreenOptions({ ...CustomTitleStyle() })} />
			<Stack.Screen name='chat/multi-member' options={chatScreenOptions()} />
			<Stack.Screen
				name='chat/one-to-one-settings'
				options={backgroundHeaderScreenOptions({
					title: t('chat.one-to-one-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='chat/contact-settings'
				options={backgroundHeaderScreenOptions({
					title: t('chat.one-to-one-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='chat/multi-member-settings'
				options={backgroundHeaderScreenOptions({
					title: t('chat.multi-member-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='chat/settings-member-detail'
				options={backgroundHeaderScreenOptions({
					title: t('chat.multi-member-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='chat/multi-member-qr'
				options={backgroundHeaderScreenOptions({
					title: t('chat.multi-member-qr.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='chat/multi-member-add-members'
				options={backgroundHeaderScreenOptions({
					title: t('chat.add-members.members'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='chat/replicate-group-settings'
				options={backgroundHeaderScreenOptions({
					title: t('chat.replicate-group-settings.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='chat/manage-deep-link'
				options={{
					presentation: 'containedTransparentModal',
					animation: 'fade',
					headerShown: false,
				}}
			/>

			{/* Settings */}
			<Stack.Screen
				name='settings/home'
				options={secondaryHeaderScreenOptions({ title: t('settings.home.title') })}
			/>
			<Stack.Screen
				name='settings/network'
				options={secondaryHeaderScreenOptions({
					title: t('settings.network.title'),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/notifications'
				options={{
					headerStyle: { backgroundColor: colors['secondary-background'] },
					title: t('settings.notifications.title'),
					presentation: 'formSheet',
				}}
			/>
			<Stack.Screen
				name='settings/contact-and-conversations'
				options={{
					headerStyle: { backgroundColor: colors['secondary-background'] },
					title: t('settings.contact-convs.title'),
					presentation: 'formSheet',
				}}
			/>
			<Stack.Screen
				name='settings/appearance'
				options={{
					headerStyle: { backgroundColor: colors['secondary-background'] },
					title: t('settings.appearance.title'),
					presentation: 'formSheet',
				}}
			/>
			<Stack.Screen
				name='settings/theme-editor'
				options={{
					headerStyle: { backgroundColor: colors['alt-secondary-background-header'] },
					headerTintColor: colors['reverted-main-text'],
					title: t('settings.appearance.theme-editor.title'),
					presentation: 'formSheet',
				}}
			/>
			<Stack.Screen
				name='settings/accounts'
				options={{
					headerStyle: { backgroundColor: colors['secondary-background'] },
					title: t('settings.accounts.title'),
					presentation: 'formSheet',
				}}
			/>
			<Stack.Screen
				name='settings/linked-identities'
				options={{
					headerStyle: { backgroundColor: colors['secondary-background'] },
					title: t('settings.linked-identities.title'),
					presentation: 'formSheet',
				}}
			/>
			<Stack.Screen
				name='settings/directory-search'
				options={{
					headerStyle: { backgroundColor: colors['secondary-background'] },
					title: t('settings.directory-search.title'),
					presentation: 'formSheet',
				}}
			/>
			<Stack.Screen
				name='settings/about-berty'
				options={{
					headerStyle: { backgroundColor: colors['secondary-background'] },
					title: t('settings.about.title'),
					presentation: 'formSheet',
				}}
			/>
			<Stack.Screen
				name='settings/my-berty-id'
				options={backgroundHeaderScreenOptions({
					title: t('settings.my-berty-ID.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/terms-of-use'
				options={backgroundHeaderScreenOptions({
					title: t('settings.about.terms-of-use'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/delete-account'
				options={{
					headerShown: false,
					presentation: 'formSheet',
					title: t('settings.accounts.delete-title'),
				}}
			/>
			<Stack.Screen
				name='settings/dev-tools'
				options={altBackgroundHeaderScreenOptions({
					title: t('settings.devtools.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/fake-data'
				options={altBackgroundHeaderScreenOptions({
					title: t('settings.fake-data.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/system-info'
				options={altBackgroundHeaderScreenOptions({
					title: t('settings.system-info.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/add-dev-conversations'
				options={altBackgroundHeaderScreenOptions({
					title: t('settings.add-dev-conversations.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/ipfs-webui'
				options={altBackgroundHeaderScreenOptions({
					title: t('settings.ipfs-webui.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/dev-text'
				options={altBackgroundHeaderScreenOptions({ title: '', presentation: 'formSheet' })}
			/>
			<Stack.Screen
				name='settings/roadmap'
				options={backgroundHeaderScreenOptions({
					title: t('settings.roadmap.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/faq'
				options={backgroundHeaderScreenOptions({
					title: t('settings.faq.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/privacy-policy'
				options={backgroundHeaderScreenOptions({
					title: t('settings.privacy-policy.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/code-license'
				options={backgroundHeaderScreenOptions({
					title: t('settings.license.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<Stack.Screen
				name='settings/permissions'
				options={{
					headerShown: false,
					// fullScreenModal uses the fixed native height; a formSheet sizes to JS layout and jumps.
					presentation: 'fullScreenModal',
				}}
			/>
		</Stack>
	)
}

const WebBackButton: React.FC<{ tintColor?: string }> = ({ tintColor }) => {
	const { goBack } = useNavigation()
	return (
		<TouchableOpacity style={{ justifyContent: 'center' }} onPress={goBack}>
			<Icon name='arrow-back' width={24} height={24} fill={tintColor} />
		</TouchableOpacity>
	)
}

export default function RootLayout() {
	const containerRef = useNavigationContainerRef()

	useEffect(() => {
		navigationRef.current = containerRef as unknown as typeof navigationRef.current
		isReadyRef.current = true
		return () => {
			isReadyRef.current = false
			navigationRef.current = null
		}
	}, [containerRef])

	return (
		<AppCommonProviders>
			<UIKittenProvider>
				<Background>
					<ErrorScreen>
						<PermissionsProvider>
							<NotificationProvider>
								<RootStack />
							</NotificationProvider>
						</PermissionsProvider>
					</ErrorScreen>
				</Background>
			</UIKittenProvider>
		</AppCommonProviders>
	)
}
