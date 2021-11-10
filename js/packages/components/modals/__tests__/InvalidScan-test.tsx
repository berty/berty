import React from 'react'
import renderer from 'react-test-renderer'

import { TestProvider } from '@berty-tech/testutil'

import InvalidScan from '../InvalidScan'

test('InvalidScan modal renders correctly', () => {
	const props: React.ComponentProps<typeof InvalidScan> = {
		type: 'link',
		error: new Error('Test error'),
	}
	const tree = renderer
		.create(
			<TestProvider>
				<InvalidScan {...props} />
			</TestProvider>,
		)
		.toJSON()
	expect(tree).toMatchSnapshot()
})
