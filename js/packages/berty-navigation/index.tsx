// TODO: create /api/js-internal/bertychatnavigation.proto and generate this file

import React, { useMemo, useState } from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import * as Stories from '@berty-tech/berty-storybook'
import {
	useNavigation as useReactNavigation,
	NavigationProp,
	CommonActions,
} from '@react-navigation/native'
import {
	createBottomTabNavigator,
	BottomTabNavigationProp,
	BottomTabBarProps,
} from '@react-navigation/bottom-tabs'
import { berty } from '@berty-tech/api'
import { Chat as ChatHooks } from '@berty-tech/hooks'
import { chat } from '@berty-tech/store'
import { Text, SafeAreaView } from 'react-native'
import LinkHandler from '@berty-tech/berty-storybook/LinkHandler'

export namespace ScreenProps {
	export namespace Onboarding {
		export type GetStarted = {}
		export type SelectMode = {}
		export type Performance = {}
		export type Privacy = {}
	}
	export namespace Main {
		export type ContactRequest = { route: { params: berty.chatmodel.IContact } }
		export type GroupRequest = {
			route: {
				params: berty.chatmodel.IConversation & {
					kind: berty.chatmodel.Conversation.Kind.PrivateGroup
				}
			}
		}
		export type ScanRequest = {}
		export type Scan = { route: { params: berty.chatmodel.IContact } }

		export type ListModal = {}
		export type Search = {}
		export type RequestSent = {}
		export namespace CreateGroup {
			export type CreateGroup = {}
			export type CreateGroup2 = {}
			export type CreateGroup3 = {}
		}
	}
	export namespace Chat {
		export type List = {}
		export type One2One = { route: { params: { convId: string } } }
		export type Group = {
			route: {
				params: berty.chatmodel.IConversation & {
					kind: berty.chatmodel.Conversation.Kind.PrivateGroup
				}
			}
		}
		export type Settings = { route: { params: berty.chatmodel.IConversation } }
		export type One2OneSettings = { route: { params: berty.chatmodel.IContact } }
		export type GroupSettings = { route: { params: berty.chatmodel.IConversation } }
	}
	export namespace Settings {
		export type Home = {}
		export type MyBertyId = {}
		export type EditProfile = {}
		export type AppUpdates = {}
		export type Help = {}
		export type Mode = {}
		export type BlockedContacts = {}
		export type Notifications = {}
		export type Bluetooth = {}
		export type AboutBerty = {}
		export type TermsOfUse = {}
		export type DevTools = {}
	}
}

export namespace Routes {
	export enum Onboarding {
		GetStarted = 'Onboarding.GetStarted',
		SelectMode = 'Onboarding.SelectMode',
		Performance = 'Onboarding.Performance',
		Privacy = 'Onboarding.Privacy',
	}
	export enum Main {
		List = 'Main.List',
		ContactRequest = 'Main.ContactRequest',
		GroupRequest = 'Main.GroupRequest',
		ScanRequest = 'Main.ScanRequest',
		Scan = 'Main.Scan',
		ListModal = 'Main.ListModal',
		Search = 'Main.Search',
		RequestSent = 'Main.RequestSent',
	}
	export enum CreateGroup {
		CreateGroup1 = 'Main.CreateGroup1',
		CreateGroup2 = 'Main.CreateGroup2',
		CreateGroup3 = 'Main.CreateGroup3',
	}
	export enum Chat {
		One2One = 'Chat.One2One',
		Group = 'Chat.Group',
		Settings = 'Chat.Settings',
		One2OneSettings = 'Chat.One2OneSettings',
		GroupSettings = 'Group.GroupSettings',
	}
	export enum Settings {
		Home = 'Settings.Home',
		MyBertyId = 'Settings.MyBertyId',
		EditProfile = 'Settings.EditProfile',
		AppUpdates = 'Settings.AppUpdates',
		Help = 'Settings.Help',
		Mode = 'Settings.Mode',
		BlockedContacts = 'Settings.BlockedContacts',
		Notifications = 'Settings.Notifications',
		Bluetooth = 'Settings.Bluetooth',
		AboutBerty = 'Settings.AboutBerty',
		TermsOfUse = 'Settings.TermsOfUse',
		DevTools = 'Settings.DevTools',
	}
}

const createNavigateFunc = <TParams extends {} | undefined = {}>(
	navigate: (route: string, params?: {}) => void,
	route: string,
) => (params?: TParams) => navigate(route, params)

const createNavigation = ({
	navigate,
	goBack,
	dispatch,
}: NavigationProp<any> | BottomTabNavigationProp<any>) => {
	return {
		dispatch: (action: any) => dispatch(action),
		goBack: () => goBack(),
		reset: (type: string) => {
			if (type === 'Onboarding') {
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Onboarding.GetStarted }],
					}),
				)
				dispatch(CommonActions.navigate('A', { screen: Routes.Main.List }))
			} else {
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Main.List }],
					}),
				)
				dispatch(CommonActions.navigate('B', { screen: Routes.Onboarding.GetStarted }))
			}
		},
		navigate: {
			onboarding: {
				getStarted: createNavigateFunc(navigate, Routes.Onboarding.GetStarted),
				selectMode: createNavigateFunc(navigate, Routes.Onboarding.SelectMode),
				performance: createNavigateFunc(navigate, Routes.Onboarding.Performance),
				privacy: createNavigateFunc(navigate, Routes.Onboarding.Privacy),
			},
			main: {
				list: createNavigateFunc(navigate, Routes.Main.List),
				contactRequest: createNavigateFunc<berty.chatmodel.IContact>(
					navigate,
					Routes.Main.ContactRequest,
				),
				groupRequest: createNavigateFunc<berty.chatmodel.IConversation>(
					navigate,
					Routes.Main.GroupRequest,
				),
				scanRequest: createNavigateFunc(navigate, Routes.Main.ScanRequest),
				scan: createNavigateFunc(navigate, Routes.Main.Scan),

				listModal: createNavigateFunc(navigate, Routes.Main.ListModal),
				search: createNavigateFunc(navigate, Routes.Main.Search),
				requestSent: createNavigateFunc(navigate, Routes.Main.RequestSent),
				createGroup: {
					createGroup1: createNavigateFunc(navigate, Routes.CreateGroup.CreateGroup1),
					createGroup2: createNavigateFunc(navigate, Routes.CreateGroup.CreateGroup2),
					createGroup3: createNavigateFunc(navigate, Routes.CreateGroup.CreateGroup3),
				},
			},
			chat: {
				one2One: createNavigateFunc<berty.chatmodel.IConversation>(navigate, Routes.Chat.One2One),
				group: createNavigateFunc<berty.chatmodel.IConversation>(navigate, Routes.Chat.Group),
				settings: createNavigateFunc<berty.chatmodel.IConversation>(navigate, Routes.Chat.Settings),
				one2OneSettings: createNavigateFunc<berty.chatmodel.IConversation>(
					navigate,
					Routes.Chat.One2OneSettings,
				),
				groupSettings: createNavigateFunc<berty.chatmodel.IConversation>(
					navigate,
					Routes.Chat.GroupSettings,
				),
			},
			settings: {
				home: createNavigateFunc(navigate, Routes.Settings.Home),
				myBertyId: createNavigateFunc(navigate, Routes.Settings.MyBertyId),
				editProfile: createNavigateFunc(navigate, Routes.Settings.EditProfile),
				appUpdates: createNavigateFunc(navigate, Routes.Settings.AppUpdates),
				help: createNavigateFunc(navigate, Routes.Settings.Help),
				mode: createNavigateFunc(navigate, Routes.Settings.Mode),
				blockedContacts: createNavigateFunc(navigate, Routes.Settings.BlockedContacts),
				notifications: createNavigateFunc(navigate, Routes.Settings.Notifications),
				bluetooth: createNavigateFunc(navigate, Routes.Settings.Bluetooth),
				aboutBerty: createNavigateFunc(navigate, Routes.Settings.AboutBerty),
				termsOfUse: createNavigateFunc(navigate, Routes.Settings.TermsOfUse),
				devTools: createNavigateFunc(navigate, Routes.Settings.DevTools),
			},
		},
	}
}

export const useNavigation = () => {
	const reactNav = useReactNavigation()
	return useMemo(() => createNavigation(reactNav), [reactNav])
}

const FakeStack = createNativeStackNavigator()
export const FakeNavigation: React.FC = ({ children }) => {
	return (
		<FakeStack.Navigator screenOptions={{ headerShown: false }}>
			<FakeStack.Screen name='Fake' component={() => children} />
		</FakeStack.Navigator>
	)
}

const OnboardingStack = createNativeStackNavigator()
export const OnboardingNavigation: React.FC = () => (
	<OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
		<OnboardingStack.Screen
			name={Routes.Onboarding.GetStarted}
			component={Stories.Onboarding.GetStarted}
		/>
		<OnboardingStack.Screen
			name={Routes.Onboarding.SelectMode}
			component={Stories.Onboarding.SelectMode}
		/>
		<OnboardingStack.Screen
			name={Routes.Onboarding.Performance}
			component={Stories.Onboarding.Performance}
		/>
		<OnboardingStack.Screen
			name={Routes.Onboarding.Privacy}
			component={Stories.Onboarding.Privacy}
		/>
	</OnboardingStack.Navigator>
)

const CreateGroupStack = createNativeStackNavigator()
export const CreateGroupNavigation: React.FC<BottomTabBarProps> = () => {
	const [members, setMembers] = useState([] as chat.contact.Entity[])
	const setMember = (contact: chat.contact.Entity) => {
		if (members.find((member) => member.id === contact.id)) {
			return
		}
		setMembers([...members, contact])
	}
	const removeMember = (id: string) => {
		const filtered = members.filter((member) => member.id !== id)
		if (filtered.length !== members.length) {
			setMembers(filtered)
		}
	}

	return (
		<CreateGroupStack.Navigator screenOptions={{ headerShown: false }}>
			<CreateGroupStack.Screen
				name={Routes.CreateGroup.CreateGroup2}
				component={() => (
					// should use setParams ? maybe, tis weird
					<Stories.Main.CreateGroup2
						members={members}
						onRemoveMember={removeMember}
						onSetMember={setMember}
					/>
				)}
				options={{ presentation: 'transparentModal' }}
			/>
			<CreateGroupStack.Screen
				name={Routes.CreateGroup.CreateGroup3}
				component={() => (
					<Stories.Main.CreateGroup3 members={members} onRemoveMember={removeMember} />
				)}
				options={{ presentation: 'transparentModal' }}
			/>
			<CreateGroupStack.Screen
				name={Routes.CreateGroup.CreateGroup1}
				component={() => (
					<Stories.Main.CreateGroup
						members={members}
						onRemoveMember={removeMember}
						onSetMember={setMember}
					/>
				)}
				options={{ presentation: 'transparentModal' }}
			/>
		</CreateGroupStack.Navigator>
	)
}

const MainStack = createNativeStackNavigator()
export const MainNavigation: React.FC<BottomTabBarProps> = () => (
	<MainStack.Navigator screenOptions={{ headerShown: false }}>
		<MainStack.Screen name={Routes.Main.List} component={Stories.Main.List} />
		<MainStack.Screen
			name={Routes.Main.ContactRequest}
			component={Stories.Main.ContactRequest}
			options={{
				contentStyle: { backgroundColor: 'transparent' },
			}}
		/>
		<MainStack.Screen
			name={Routes.Main.GroupRequest}
			component={Stories.Main.GroupRequest}
			options={{
				contentStyle: { backgroundColor: 'transparent' },
			}}
		/>
		<MainStack.Screen name={Routes.Main.ScanRequest} component={Stories.Main.ScanRequest} />
		<MainStack.Screen
			name={'SomeScan'}
			options={{ stackPresentation: 'modal' }}
			component={Stories.Main.Scan}
		/>
		<MainStack.Screen name={Routes.Chat.One2One} component={Stories.Chat.Chat} />
		<MainStack.Screen name={Routes.Chat.Group} component={Stories.Chat.ChatGroup} />
		<MainStack.Screen name={Routes.Chat.Settings} component={Stories.Chat.ChatSettings} />
		<MainStack.Screen
			name={Routes.Chat.One2OneSettings}
			component={Stories.Chat.ContactChatSettings}
		/>
		<MainStack.Screen name={Routes.Chat.GroupSettings} component={Stories.Chat.GroupChatSettings} />

		<MainStack.Screen
			name={Routes.Main.ListModal}
			component={Stories.Main.ListModal}
			options={{
				stackPresentation: 'transparentModal',
				contentStyle: { backgroundColor: 'transparent' },
			}}
		/>
		<MainStack.Screen
			name={'MyBertyId'}
			component={Stories.Settings.MyBertyId}
			options={{
				stackPresentation: 'modal',
			}}
		/>
		<MainStack.Screen
			name={Routes.Main.RequestSent}
			component={Stories.Main.RequestSent}
			options={{ stackPresentation: 'transparentModal' }}
		/>
		<MainStack.Screen
			name={Routes.CreateGroup.CreateGroup2}
			component={CreateGroupNavigation}
			options={{ stackPresentation: 'transparentModal' }}
		/>
	</MainStack.Navigator>
)

const SettingsStack = createNativeStackNavigator()
export const SettingsNavigation: React.FC = () => (
	<SettingsStack.Navigator screenOptions={{ headerShown: false }}>
		<SettingsStack.Screen name={Routes.Settings.Home} component={Stories.Settings.Home} />
		<SettingsStack.Screen
			name={Routes.Settings.MyBertyId}
			component={Stories.Settings.MyBertyId}
			options={{ stackPresentation: 'transparentModal' }}
		/>
		<SettingsStack.Screen
			name={Routes.Settings.EditProfile}
			component={Stories.Settings.EditProfile}
			options={{
				contentStyle: { backgroundColor: 'transparent' },
			}}
		/>
		<SettingsStack.Screen
			name={Routes.Settings.AppUpdates}
			component={Stories.Settings.AppUpdates}
		/>
		<SettingsStack.Screen name={Routes.Settings.Help} component={Stories.Settings.Help} />
		<SettingsStack.Screen name={Routes.Settings.Mode} component={Stories.Settings.Mode} />
		<SettingsStack.Screen
			name={Routes.Settings.BlockedContacts}
			component={Stories.Settings.BlockedContacts}
		/>
		<SettingsStack.Screen
			name={Routes.Settings.Notifications}
			component={Stories.Settings.Notifications}
		/>
		<SettingsStack.Screen name={Routes.Settings.Bluetooth} component={Stories.Settings.Bluetooth} />
		<SettingsStack.Screen
			name={Routes.Settings.AboutBerty}
			component={Stories.Settings.AboutBerty}
		/>
		<SettingsStack.Screen
			name={Routes.Settings.TermsOfUse}
			component={Stories.Settings.TermsOfUse}
		/>
		<SettingsStack.Screen name={Routes.Settings.DevTools} component={Stories.Settings.DevTools} />
	</SettingsStack.Navigator>
)

const TabBar: React.FC<BottomTabBarProps> = ({ state: { routes, index } }) => {
	const currentRoute = routes[index]
	return <Stories.Settings.Footer currentRouteName={currentRoute.name} />
}

const TabStack = createBottomTabNavigator()
export const TabScreen: React.FC = () => {
	return (
		<TabStack.Navigator tabBar={TabBar}>
			<TabStack.Screen name={'Main'} component={MainNavigation} />
			<TabStack.Screen name={'Settings'} component={SettingsNavigation} />
		</TabStack.Navigator>
	)
}

const ModalsStack = createNativeStackNavigator()
const ModalsScreen: React.FC = () => (
	<ModalsStack.Navigator>
		<ModalsStack.Screen name={'InvalidScan'} component={InvalidScan} />
		<ModalsStack.Screen name={'AddThisContact'} component={AddThisContact} />
	</ModalsStack.Navigator>
)

// TODO: fix navigation with switchNavigator
const RootStack = createNativeStackNavigator()
export const Navigation: React.FC = () => {
	const length = ChatHooks.useAccountLength()
	return (
		<RootStack.Navigator
			initialRouteName={length >= 1 ? 'Tabs' : 'Onboarding'}
			screenOptions={{ headerShown: false }}
		>
			<RootStack.Screen name={'Tabs'} component={TabScreen} />
			<RootStack.Screen name={'Onboarding'} component={OnboardingNavigation} />
			<RootStack.Screen name={'Modals'} component={ModalsScreen} />
			<RootStack.Screen
				name={'Search'}
				component={Stories.Main.Search}
				options={{ stackPresentation: 'modal' }}
			/>
		</RootStack.Navigator>
	)
}

export default Navigation
