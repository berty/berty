import { mapping, light } from '@eva-design/eva'
import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { View, Button } from 'react-native'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { ApplicationProvider, IconRegistry } from 'react-native-ui-kitten'
import { promiseResolved, fakeUsers, fakeOneUser } from './faker'
import * as Onboarding from './Onboarding'
import * as Main from './main'
import * as Chat from './chat'
import * as Settings from './settings'
import addons from '@storybook/addons'
import { I18nextProvider } from 'react-i18next'
import i18n from '@berty-tech/berty-i18n'
import { faker } from './faker.gen'
import { BertyChatChatService as LegacyStore } from '@berty-tech/berty-store'
import { berty } from '@berty-tech/api'
import { Routes, FakeNavigation } from '@berty-tech/berty-navigation'
import { NavigationContainer } from '@react-navigation/native'
import { enableScreens } from 'react-native-screens'
import { Chat as ChatHooks } from '@berty-tech/hooks'

enableScreens()

console.disableYellowBox = true

const stories = storiesOf('Berty', module)

stories.addDecorator((storyFn) => (
	<NavigationContainer>
		<LegacyStore.Provider rpcImpl={faker.berty.chat.ChatService.rpcImpl}>
			<I18nextProvider i18n={i18n}>
				<IconRegistry icons={EvaIconsPack} />
				<ApplicationProvider mapping={mapping} theme={light}>
					<FakeNavigation>{storyFn()}</FakeNavigation>
				</ApplicationProvider>
			</I18nextProvider>
		</LegacyStore.Provider>
	</NavigationContainer>
))

stories.addDecorator((storyFn) => {
	return (
		<ChatHooks.Provider>
			{React.createElement(() => {
				const generateAccount = ChatHooks.useAccountGenerate()
				React.useEffect(() => {
					generateAccount()
				})
				return storyFn()
			})}
		</ChatHooks.Provider>
	)
})

// Stories
stories
	.add(Routes.Onboarding.GetStarted, () => <Onboarding.GetStarted />)
	.add(Routes.Onboarding.SelectMode, () => <Onboarding.SelectMode />)
	.add(Routes.Onboarding.Performance, () => (
		<Onboarding.Performance
			authorizeNotifications={promiseResolved}
			authorizeBluetooth={promiseResolved}
		/>
	))
	.add(Routes.Onboarding.Privacy, () => <Onboarding.Privacy />)
	.add(Routes.Main.List, () => <Main.List />)
	.add(Routes.Main.ContactRequest, () => (
		<Main.ContactRequest route={{ params: faker.berty.chatmodel.Contact[0] }} />
	))
	.add(Routes.Main.GroupRequest, () => (
		<Main.GroupRequest
			route={{
				params: faker.berty.chatmodel.Conversation.filter(
					(_) => _.kind === berty.chatmodel.Conversation.Kind.PrivateGroup,
				)[0] as berty.chatmodel.IConversation & {
					kind: berty.chatmodel.Conversation.Kind.PrivateGroup
				},
			}}
		/>
	))
	.add(Routes.Main.ScanRequest, () => <Main.ScanRequest user={fakeOneUser} />)
	.add(Routes.Main.Scan, () => <Main.Scan />)
	.add(Routes.Main.InvalidScan, () => <Main.InvalidScan />)
	.add(Routes.Chat.One2One, () => <Chat.Chat />)
	.add(Routes.Chat.Group, () => (
		<Chat.ChatGroup route={{ params: faker.berty.chatmodel.Conversation[0] }} />
	))
	.add(Routes.Chat.Settings, () => (
		<Chat.ChatSettings route={{ params: faker.berty.chatmodel.Conversation[0] }} />
	))
	.add(Routes.Chat.One2OneSettings, () => (
		<Chat.ContactChatSettings route={{ params: faker.berty.chatmodel.Conversation[0] }} />
	))
	.add(Routes.Chat.GroupSettings, () => (
		<Chat.GroupChatSettings route={{ params: faker.berty.chatmodel.Conversation[0] }} />
	))
	.add('Main.RequestSent', () => <Main.RequestSent user={fakeOneUser} />)
	.add('Main.ListModal', () => <Main.ListModal />)
	.add('Main.CreateGroup', () => <Main.CreateGroup />)
	.add('Main.CreateGroup2', () => <Main.CreateGroup2 />)
	.add('Main.CreateGroup3', () => <Main.CreateGroup3 />)
	.add('Main.Search', () => <Main.Search />)
	// .add('Main.SearchResults', () => <Main.SearchResults user={fakeOneUser} />)
	.add(Routes.Settings.Home, () => <Settings.Home />)
	.add(Routes.Settings.MyBertyId, () => <Settings.MyBertyId user={fakeOneUser} />)
	.add(Routes.Settings.EditProfile, () => <Settings.EditProfile />)
	.add(Routes.Settings.AppUpdates, () => <Settings.AppUpdates />)
	.add(Routes.Settings.Help, () => <Settings.Help />)
	.add(Routes.Settings.Mode, () => <Settings.Mode />)
	.add(Routes.Settings.BlockedContacts, () => <Settings.BlockedContacts blocked={fakeUsers} />)
	.add(Routes.Settings.Notifications, () => <Settings.Notifications />)
	.add(Routes.Settings.Bluetooth, () => <Settings.Bluetooth />)
	.add(Routes.Settings.AboutBerty, () => <Settings.AboutBerty />)
	.add(Routes.Settings.TermsOfUse, () => <Settings.TermsOfUse />)
	.add(Routes.Settings.DevTools, () => <Settings.DevTools />)

// Addons
addons.register('i18n', () => {
	const channel = addons.getChannel()
	addons.addPanel('i18n', {
		title: 'language',
		// eslint-disable-next-line react/prop-types
		render: () =>
			React.createElement(() => {
				return (
					<View>
						<Button title='en' onPress={() => i18n.changeLanguage('en')}>
							En
						</Button>
						<Button title='fr' onPress={() => i18n.changeLanguage('fr')}>
							Fr
						</Button>
					</View>
				)
			}),
		paramKey: 'i18n',
	})
})
