import React from 'react'
import renderer from 'react-test-renderer'

import { TestProvider } from '@berty-tech/testutil'

import ManageGroupInvitation from '../ManageGroupInvitation'

test('ManageGroupInvitation modal renders correctly', () => {
	const props: React.ComponentProps<typeof ManageGroupInvitation> = {
		publicKey: 'ShNdInuJKER0Nh_puXWMYDlydH8BX_hEt0joqiBeBso',
		isPassword: false,
		type: 'link',
		displayName: 'some-group',
		link: 'https://berty.tech/id#group/5QdUv6Fn3uvsxRCYb9hUn6UCe26QK7s7sqmFQGsQrNjj4TZmViFRyEwRr8dz3qMzGThz3QUTTj3NrAkg3WC6PqjXDvAp5UUrfzGqw8BxHiKye8QyRp46dJGAKQEjQfvkSx9GKm5QevrrDzsmfyUSkj6HqKVzPRZxr7X1FebqM7xxweY9K69tJoJC41an3fdbAr/name=some+group',
	}
	const tree = renderer
		.create(
			<TestProvider>
				<ManageGroupInvitation {...props} />
			</TestProvider>,
		)
		.toJSON()
	expect(tree).toMatchSnapshot()
})
