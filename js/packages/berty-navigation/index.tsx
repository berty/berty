import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Onboarding, Main, Settings } from '@berty-tech/berty-storybook'

const Stack = createNativeStackNavigator()

export const Navigation: React.FC<{}> = () => (
	<Stack.Navigator>
		<Stack.Screen name='Onboarding.GetStarted' component={Onboarding.GetStarted} />
		<Stack.Screen name='Onboarding.SelectMode' component={Onboarding.SelectMode} />
		<Stack.Screen name='Onboarding.Performance' component={Onboarding.Performance} />
		<Stack.Screen name='Onboarding.Privacy' component={Onboarding.Privacy} />
		<Stack.Screen name='Main.List' component={Main.List} />
		<Stack.Screen name='Main.ContactRequest' component={Main.ContactRequest} />
		<Stack.Screen name='Main.GroupRequest' component={Main.GroupRequest} />
		<Stack.Screen name='Main.ChatGroup' component={Main.ChatGroup} />
		<Stack.Screen name='Main.Chat' component={Main.Chat} />
		<Stack.Screen name='Main.ScanRequest' component={Main.ScanRequest} />
		<Stack.Screen name='Main.Scan' component={Main.Scan} />
		<Stack.Screen name='Main.InvalidScan' component={Main.InvalidScan} />
		<Stack.Screen name='Main.ChatSettings' component={Main.ChatSettings} />
		<Stack.Screen name='Main.ContactChatSettings' component={Main.ContactChatSettings} />
		<Stack.Screen name='Main.GroupChatSettings' component={Main.GroupChatSettings} />
		<Stack.Screen name='Settings.Home' component={Settings.Home} />
		<Stack.Screen name='Settings.MyBertyId' component={Settings.MyBertyId} />
		<Stack.Screen name='Settings.EditProfile' component={Settings.EditProfile} />
		<Stack.Screen name='Settings.AppUpdates' component={Settings.AppUpdates} />
		<Stack.Screen name='Settings.Help' component={Settings.Help} />
		<Stack.Screen name='Settings.Mode' component={Settings.Mode} />
		<Stack.Screen name='Settings.BlockedContacts' component={Settings.BlockedContacts} />
		<Stack.Screen name='Settings.Notifications' component={Settings.Notifications} />
		<Stack.Screen name='Settings.Bluetooth' component={Settings.Bluetooth} />
		<Stack.Screen name='Settings.AboutBerty' component={Settings.AboutBerty} />
		<Stack.Screen name='Settings.TermsOfUse' component={Settings.TermsOfUse} />
		<Stack.Screen name='Settings.DevTools' component={Settings.DevTools} />
	</Stack.Navigator>
)

export default Navigation
