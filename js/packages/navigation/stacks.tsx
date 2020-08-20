import React, { useState } from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import * as Components from '@berty-tech/components'
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Messenger } from '@berty-tech/hooks'
import { messenger } from '@berty-tech/store'
import { Routes } from './types'

const FakeStack = createNativeStackNavigator()
export const FakeNavigation: React.FC = ({ children }) => {
	return (
		<FakeStack.Navigator screenOptions={{ headerShown: false }}>
			<FakeStack.Screen name='Fake'>{() => children}</FakeStack.Screen>
		</FakeStack.Navigator>
	)
}

const ModalsStack = createNativeStackNavigator()
export const ModalsNavigation: React.FC = () => (
	<ModalsStack.Navigator screenOptions={{ headerShown: false }}>
		<ModalsStack.Screen
			name={Routes.Modals.DeleteAccount}
			component={Components.Modals.DeleteAccount}
			options={{
				stackPresentation: 'transparentModal',
				stackAnimation: 'fade',
			}}
		/>
		<ModalsStack.Screen
			name={Routes.Modals.ManageDeepLink}
			component={Components.Modals.ManageDeepLink}
			options={{
				stackPresentation: 'transparentModal',
				stackAnimation: 'fade',
			}}
		/>
	</ModalsStack.Navigator>
)

const CreateGroupStack = createNativeStackNavigator()
export const CreateGroupNavigation: React.FC<BottomTabBarProps> = () => {
	const [members, setMembers] = useState([] as messenger.contact.Entity[])
	const setMember = (contact: messenger.contact.Entity) => {
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
				name={Routes.CreateGroup.CreateGroupAddMembers}
				options={{ stackPresentation: 'transparentModal' }}
			>
				{() => (
					// should use setParams ? maybe, tis weird
					<Components.Main.CreateGroupAddMembers
						members={members}
						onRemoveMember={removeMember}
						onSetMember={setMember}
					/>
				)}
			</CreateGroupStack.Screen>
			<CreateGroupStack.Screen
				name={Routes.CreateGroup.CreateGroupFinalize}
				options={{ stackPresentation: 'transparentModal' }}
			>
				{() => (
					<Components.Main.CreateGroupFinalize members={members} onRemoveMember={removeMember} />
				)}
			</CreateGroupStack.Screen>
			<CreateGroupStack.Screen
				name={'Modals'}
				component={ModalsNavigation}
				options={{ stackPresentation: 'transparentModal', stackAnimation: 'fade' }}
			/>
		</CreateGroupStack.Navigator>
	)
}

const SearchStack = createNativeStackNavigator()
export const SearchNavigation: React.FC<BottomTabBarProps> = () => (
	<SearchStack.Navigator screenOptions={{ headerShown: false }}>
		<SearchStack.Screen name={Routes.Main.Search} component={Components.Main.Search} />
	</SearchStack.Navigator>
)

const TabStack = createBottomTabNavigator()
export const TabNavigation: React.FC = () => {
	return (
		<TabStack.Navigator
			tabBar={({ state }) => <Components.Main.Footer selected={state.routes[state.index].name} />}
		>
			<TabStack.Screen name={Routes.Main.Home} component={Components.Main.Home} />
			<TabStack.Screen name={Routes.Main.Search} component={SearchNavigation} />
			<TabStack.Screen name={Routes.Settings.Home} component={Components.Settings.Home} />
		</TabStack.Navigator>
	)
}

const NavigationStack = createNativeStackNavigator()
export const Navigation: React.FC = () => {
	const account = Messenger.useAccount()
	return (
		<NavigationStack.Navigator
			initialRouteName={account ? Routes.Root.Tabs : Routes.Onboarding.GetStarted}
			screenOptions={{ headerShown: false }}
		>
			<NavigationStack.Screen
				name={Routes.Main.ContactRequest}
				component={Components.Main.ContactRequest}
				options={{
					stackPresentation: 'transparentModal',
					stackAnimation: 'fade',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			{/*<NavigationStack.Screen
				name={Routes.Main.GroupRequest}
				component={Components.Main.GroupRequest}
				options={{
					stackPresentation: 'transparentModal',
					stackAnimation: 'fade',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>*/}
			<NavigationStack.Screen
				name={Routes.Main.ScanRequest}
				component={Components.Main.ScanRequest}
			/>
			<NavigationStack.Screen
				name={Routes.Main.Scan}
				component={Components.Main.Scan}
				options={{ stackPresentation: 'transparentModal' }}
			/>
			<NavigationStack.Screen name={Routes.Chat.OneToOne} component={Components.Chat.OneToOne} />
			<NavigationStack.Screen name={Routes.Chat.Group} component={Components.Chat.ChatGroup} />
			<NavigationStack.Screen name={Routes.Chat.Settings} component={Components.Chat.Settings} />
			<NavigationStack.Screen
				name={Routes.Chat.OneToOneSettings}
				component={Components.Chat.OneToOneSettings}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.GroupSettings}
				component={Components.Chat.GroupSettings}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.MultiMemberQR}
				component={Components.Chat.MultiMemberQR}
			/>
			<NavigationStack.Screen
				name={Routes.Main.HomeModal}
				component={Components.Main.HomeModal}
				options={{
					stackPresentation: 'transparentModal',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Main.RequestSent}
				component={Components.Main.RequestSent}
				options={{ stackPresentation: 'transparentModal' }}
			/>
			<NavigationStack.Screen
				name={Routes.CreateGroup.CreateGroupAddMembers}
				component={CreateGroupNavigation}
				options={{ stackPresentation: 'transparentModal' }}
			/>
			<NavigationStack.Screen name={Routes.Root.Tabs} component={TabNavigation} />
			<NavigationStack.Screen
				name={Routes.Settings.MyBertyId}
				component={Components.Settings.MyBertyId}
				options={{ stackPresentation: 'transparentModal' }}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.EditProfile}
				component={Components.Settings.EditProfile}
				options={{
					stackPresentation: 'transparentModal',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.AppUpdates}
				component={Components.Settings.AppUpdates}
			/>
			<NavigationStack.Screen name={Routes.Settings.Help} component={Components.Settings.Help} />
			<NavigationStack.Screen
				name={Routes.Settings.FakeDatas}
				component={Components.Settings.FakeDatas}
			/>
			<NavigationStack.Screen name={Routes.Settings.Mode} component={Components.Settings.Mode} />
			<NavigationStack.Screen
				name={Routes.Settings.BlockedContacts}
				component={Components.Settings.BlockedContacts}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Notifications}
				component={Components.Settings.Notifications}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Bluetooth}
				component={Components.Settings.Bluetooth}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.AboutBerty}
				component={Components.Settings.AboutBerty}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.TermsOfUse}
				component={Components.Settings.TermsOfUse}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.DevTools}
				component={Components.Settings.DevTools}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.SystemInfo}
				component={Components.Settings.SystemInfo}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Network}
				component={Components.Settings.Network}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.IpfsWebUI}
				component={Components.Settings.IpfsWebUI}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.DevText}
				component={Components.Settings.DevText}
			/>
			<NavigationStack.Screen
				name={'Modals'}
				component={ModalsNavigation}
				options={{ stackPresentation: 'transparentModal', stackAnimation: 'fade' }}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.GetStarted}
				component={Components.Onboarding.GetStarted}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.SelectMode}
				component={Components.Onboarding.SelectMode}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.Performance}
				component={Components.Onboarding.Performance}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.Privacy}
				component={Components.Onboarding.Privacy}
			/>
		</NavigationStack.Navigator>
	)
}
