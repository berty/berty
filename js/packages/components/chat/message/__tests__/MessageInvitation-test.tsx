import React from 'react'
import renderer from 'react-test-renderer'

import beapi from '@berty-tech/api'
import { TestProvider } from '@berty-tech/testutil'

import { MessageInvitation } from '../MessageInvitation'

test('MessageInvitation renders correctly', () => {
	const props: React.ComponentProps<typeof MessageInvitation> = {
		message: {
			type: beapi.messenger.AppMessage.Type.TypeGroupInvitation,
			payload: {
				link: 'https://berty.tech/id#group/5QdUv6Fn3uvsxRCYb9hUn6UCe26QK7s7sqmFQGsQrNjj4TZmViFRyEwRr8dz3qMzGThz3QUTTj3NrAkg3WC6PqjXDvAp5UUrfzGqw8BxHiKye8QyRp46dJGAKQEjQfvkSx9GKm5QevrrDzsmfyUSkj6HqKVzPRZxr7X1FebqM7xxweY9K69tJoJC41an3fdbAr/name=some+group',
			},
		},
	}
	// FIXME: mock useContactRequest to get children in the snapshot
	const tree = renderer
		.create(
			<TestProvider>
				<MessageInvitation {...props} />
			</TestProvider>,
		)
		.toJSON()
	expect(tree).toMatchSnapshot()
})
