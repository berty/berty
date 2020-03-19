// TODO: create /api/js-internal/bertychatnavigation.proto and generate this file

import React, { useMemo, useState } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import * as Stories from '@berty-tech/berty-storybook'
import {
	useNavigation as useReactNavigation,
	NavigationProp,
	CommonActions,
} from '@react-navigation/core'
import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { berty } from '@berty-tech/api'
import { Chat as ChatHooks } from '@berty-tech/hooks'
import { chat } from '@berty-tech/store'

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
		export type InvalidScan = {}

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
		InvalidScan = 'Main.InvalidScan',
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
				dispatch(CommonActions.navigate(Routes.Main.List))
			} else {
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Main.List }],
					}),
				)
				dispatch(CommonActions.navigate(Routes.Onboarding.GetStarted))
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
				invalidScan: createNavigateFunc(navigate, Routes.Main.InvalidScan),

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

const FakeStack = createStackNavigator()
export const FakeNavigation: React.FC = ({ children }) => {
	return (
		<FakeStack.Navigator screenOptions={{ headerShown: false }}>
			<FakeStack.Screen name='Fake' component={() => children} />
		</FakeStack.Navigator>
	)
}

const OnboardingStack = createStackNavigator()
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

const CreateGroupStack = createStackNavigator()
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

const SearchStack = createStackNavigator()
export const SearchNavigation: React.FC<BottomTabBarProps> = () => (
	<SearchStack.Navigator screenOptions={{ headerShown: false }}>
		<SearchStack.Screen name={Routes.Main.Search} component={Stories.Main.Search} />
	</SearchStack.Navigator>
)

const MainStack = createStackNavigator()
export const MainNavigation: React.FC<BottomTabBarProps> = () => (
	<MainStack.Navigator screenOptions={{ headerShown: false }}>
		<MainStack.Screen name={Routes.Main.List} component={Stories.Main.List} />
		<MainStack.Screen
			name={Routes.Main.ContactRequest}
			component={Stories.Main.ContactRequest}
			options={{
				presentation: 'transparentModal',
				animation: 'fade',
				contentStyle: { backgroundColor: 'transparent' },
			}}
		/>
		<MainStack.Screen
			name={Routes.Main.GroupRequest}
			component={Stories.Main.GroupRequest}
			options={{
				presentation: 'transparentModal',
				animation: 'fade',
				contentStyle: { backgroundColor: 'transparent' },
			}}
		/>
		<MainStack.Screen name={Routes.Main.ScanRequest} component={Stories.Main.ScanRequest} />
		<MainStack.Screen
			name={Routes.Main.Scan}
			component={Stories.Main.Scan}
			options={{ presentation: 'transparentModal' }}
		/>
		<MainStack.Screen name={Routes.Main.InvalidScan} component={Stories.Main.InvalidScan} />
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
				presentation: 'transparentModal',
				contentStyle: { backgroundColor: 'transparent' },
			}}
		/>
		<MainStack.Screen
			name={Routes.Settings.MyBertyId}
			component={Stories.Settings.MyBertyId}
			options={{ presentation: 'transparentModal' }}
		/>
		<MainStack.Screen
			name={Routes.Main.RequestSent}
			component={Stories.Main.RequestSent}
			options={{ presentation: 'transparentModal' }}
		/>
		<MainStack.Screen
			name={Routes.CreateGroup.CreateGroup2}
			component={CreateGroupNavigation}
			options={{ presentation: 'transparentModal' }}
		/>
	</MainStack.Navigator>
)

const SettingsStack = createStackNavigator()
export const SettingsNavigation: React.FC<BottomTabBarProps> = () => (
	<SettingsStack.Navigator screenOptions={{ headerShown: false }}>
		<SettingsStack.Screen name={Routes.Settings.Home} component={Stories.Settings.Home} />
		<SettingsStack.Screen
			name={Routes.Settings.MyBertyId}
			component={Stories.Settings.MyBertyId}
			options={{ presentation: 'transparentModal' }}
		/>
		<SettingsStack.Screen
			name={Routes.Settings.EditProfile}
			component={Stories.Settings.EditProfile}
			options={{
				presentation: 'transparentModal',
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

const Footer: React.FC<BottomTabBarProps> = ({ navigation, state: { index, routeNames } }) => {
	const _navigation = useMemo(() => createNavigation(navigation), [navigation])
	if (routeNames[index].match(/^Settings\..*$/)) {
		return <Stories.Settings.Footer {..._navigation} />
	}
	return null
}

const TabStack = createBottomTabNavigator()
export const TabNavigation: React.FC = () => {
	return (
		<TabStack.Navigator tabBar={(props) => <Footer {...props} />}>
			<TabStack.Screen name={Routes.Main.List} component={MainNavigation} />
			<TabStack.Screen name={Routes.Main.Search} component={SearchNavigation} />
			<TabStack.Screen name={Routes.Settings.Home} component={SettingsNavigation} />
		</TabStack.Navigator>
	)
}

// TODO: fix navigation with switchNavigator
const NavigationStack = createStackNavigator()
export const Navigation: React.FC = () => {
	const length = ChatHooks.useAccountLength()
	return (
		<NavigationStack.Navigator screenOptions={{ headerShown: false }}>
			{length >= 1 ? (
				<NavigationStack.Screen name={Routes.Main.List} component={TabNavigation} />
			) : (
				<NavigationStack.Screen
					name={Routes.Onboarding.GetStarted}
					component={OnboardingNavigation}
				/>
			)}
		</NavigationStack.Navigator>
	)
}

export default Navigation
