import React from 'react'
import renderer from 'react-test-renderer'

import { TestProvider } from '@berty-tech/testutil'

import { ManageDeepLink } from '../ManageDeepLink'

test('ManageDeepLink modal renders correctly', () => {
	const props: React.ComponentProps<typeof ManageDeepLink> = {
		route: {
			params: {
				type: 'link',
				value:
					'https://berty.tech/id#contact/oZBLFWJdsE73yWa2BjceiUtKCfxpxVBuH8h6r3sJXDrgqaHyR1ACgLpWEZTMDD8DzGsSo679UjknhcuXGiqP6cgU66R5BTh/name=Alice',
			},
		},
	}
	const tree = renderer
		.create(
			<TestProvider>
				<ManageDeepLink {...props} />
			</TestProvider>,
		)
		.toJSON()
	expect(tree).toMatchSnapshot()
})
