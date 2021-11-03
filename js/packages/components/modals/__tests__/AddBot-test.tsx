import React from 'react'
import renderer from 'react-test-renderer'

import { TestProvider } from '@berty-tech/testutil'

import AddBot from '../AddBot'

test('AddBot modal renders correctly', () => {
	const props: React.ComponentProps<typeof AddBot> = {
		displayName: 'Alice',
		link: 'https://berty.tech/id#contact/oZBLFWJdsE73yWa2BjceiUtKCfxpxVBuH8h6r3sJXDrgqaHyR1ACgLpWEZTMDD8DzGsSo679UjknhcuXGiqP6cgU66R5BTh/name=Alice',
		closeModal: () => {},
	}
	// FIXME: mock useContactRequest to get children in the snapshot
	const tree = renderer
		.create(
			<TestProvider>
				<AddBot {...props} />
			</TestProvider>,
		)
		.toJSON()
	expect(tree).toMatchSnapshot()
})
