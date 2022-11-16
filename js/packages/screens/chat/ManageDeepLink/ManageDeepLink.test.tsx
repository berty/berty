import { waitFor } from '@testing-library/react-native'

import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ManageDeepLink } from './ManageDeepLink'

test('Chat.ManageDeepLink renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Chat.ManageDeepLink', ManageDeepLink, {
		type: 'link',
		value: 'fake',
	})

	expect(toJSON()).toMatchSnapshot()
})

jest.setTimeout(15000)

test('Chat.ManageDeepLink renders ManageGroupInvitation when link kind is GroupV1Kind', async () => {
	await mockServices()

	const { getByA11yLabel } = renderScreen('Chat.ManageDeepLink', ManageDeepLink, {
		type: 'link',
		value:
			'https://berty.tech/id#group/8ejngpAxnMNv6cSAQjtdotrcD94sa9FypK3vLkddVmH6BtEvQqS8WxWYfKcNKfg26crBsLxk3H5NLNdvbpwXMBPCXq9A1PfMR3um5KtV5ZQbvd2AehhPj86YRvtjQVtF6Rd7iT5iyfgpAzSFmxJx71SbAbSCQryXu9efKYUbd9Dcc1kkNsgKRHzFraGsU5EQZFKZgq5mSB91o51o2P5aecgK8rZv671kZmgKmFEjr8RKJTfZPwnmRwqW89aN1iUchpYUcJLaJMnztMmJXK7FUsAFhh8E/name=some+group',
	})

	await waitFor(() => {
		expect(getByA11yLabel('ManageDeepLink-ManageGroupInvitation')).toBeDefined()
	})
})

test('Chat.ManageDeepLink renders AddThisContact when link kind is ContactInviteV1Kind', async () => {
	await mockServices()

	const { getByA11yLabel } = renderScreen('Chat.ManageDeepLink', ManageDeepLink, {
		type: 'link',
		value:
			'https://berty.tech/id#contact/oZBLG2F1R85jnheEgPebCjrBbBdmVqnnF3XpPjPWsDeyDigMUNzfwPGDjMZ8MJDw5vXiPKWWQbftSzBhYnWcnbosQrzKBa9/name=clegirar+%28cli%29',
	})

	await waitFor(() => {
		expect(getByA11yLabel('ManageDeepLink-AddThisContact')).toBeDefined()
	})
})
