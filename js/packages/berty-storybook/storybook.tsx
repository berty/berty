import { ApplicationProvider } from 'react-native-ui-kitten'
import { linkTo } from '@storybook/addon-links'
import { mapping, light } from '@eva-design/eva'
import React, { useState } from 'react'
import { storiesOf } from '@storybook/react-native'
import { View, Button } from 'react-native'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { Layout, Select, IconRegistry } from 'react-native-ui-kitten'
import { promiseResolved, fakeRequests, fakeConversations, fakeUsers, fakeOneUser } from './faker'
import * as Onboarding from './Onboarding'
import * as Main from './Main'
import * as Settings from './settings/Settings'

import addons from '@storybook/addons'
import { I18nextProvider } from 'react-i18next'
import i18n from '@berty-tech/berty-i18n'

const stories = storiesOf('Berty', module)

stories.addDecorator((storyFn) => (
	<I18nextProvider i18n={i18n}>
		<IconRegistry icons={EvaIconsPack} />
		<ApplicationProvider mapping={mapping} theme={light}>
			{storyFn()}
		</ApplicationProvider>
	</I18nextProvider>
))

// Stories
stories
	.add('Onboarding.GetStarted', () => <Onboarding.GetStarted selectMode={linkTo('Onboarding.SelectMode')} />)
	.add('Onboarding.SelectMode', () => (
		<Onboarding.SelectMode performance={linkTo('Onboarding.Performance')} privacy={linkTo('Onboarding.Privacy')} />
	))
	.add('Onboarding.Performance', () => (
		<Onboarding.Performance
			createAccount={promiseResolved}
			generateKey={promiseResolved}
			authorizeNotifications={promiseResolved}
			authorizeBluetooth={promiseResolved}
			startApp={linkTo('Onboarding.Privacy')}
		/>
	))
	.add('Onboarding.Privacy', () => (
		<Onboarding.Privacy
			createAccount={promiseResolved}
			generateKey={promiseResolved}
			startApp={linkTo('Onboarding.Privacy')}
		/>
	))
	.add('Main.List', () => (
		<Main.List
			requests={fakeRequests}
			conversations={fakeConversations}
			footer={{
				search: (): void => {},
				plus: (): void => {},
				account: (): void => {},
			}}
		/>
	))
	.add('Settings.Home', () => <Settings.Home user={fakeOneUser} />)
	.add('Settings.MyBertyId', () => <Settings.MyBertyId />)
	.add('Settings.EditProfile', () => <Settings.EditProfile />)
	.add('Settings.AppUpdates', () => <Settings.AppUpdates />)
	.add('Settings.Help', () => <Settings.Help />)
	.add('Settings.Mode', () => <Settings.Mode />)
	.add('Settings.BlockedContacts', () => <Settings.BlockedContacts blocked={fakeUsers} />)
	.add('Settings.Notifications', () => <Settings.Notifications />)
	.add('Settings.Bluetooth', () => <Settings.Bluetooth />)
	.add('Settings.AboutBerty', () => <Settings.AboutBerty />)
	.add('Settings.TermsOfUse', () => <Settings.TermsOfUse />)
	.add('Settings.DevTools', () => <Settings.DevTools />)

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
