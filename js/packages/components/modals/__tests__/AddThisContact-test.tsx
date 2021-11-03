import React from 'react'
import renderer from 'react-test-renderer'

import { TestProvider } from '@berty-tech/testutil'

import AddThisContact from '../AddThisContact'

test('AddThisContact modal renders correctly', () => {
	const props: React.ComponentProps<typeof AddThisContact> = {
		displayName: 'Alice',
		publicKey: 'EnUWyQLZ728WjThgm3uMLMh636-joybm_1e-r2DMq3Q',
		link: 'https://berty.tech/id#contact/oZBLFWJdsE73yWa2BjceiUtKCfxpxVBuH8h6r3sJXDrgqaHyR1ACgLpWEZTMDD8DzGsSo679UjknhcuXGiqP6cgU66R5BTh/name=Alice',
		type: 'link',
		isPassword: false,
	}
	const tree = renderer
		.create(
			<TestProvider>
				<AddThisContact {...props} />
			</TestProvider>,
		)
		.toJSON()
	expect(tree).toMatchSnapshot()
})
