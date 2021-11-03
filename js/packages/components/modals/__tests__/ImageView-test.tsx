import React from 'react'
import renderer from 'react-test-renderer'

import { TestProvider } from '@berty-tech/testutil'

import { ImageView } from '../ImageView'

test('ImageView modal renders correctly', () => {
	// FIXME: add Media fixture
	const props: React.ComponentProps<typeof ImageView> = {
		route: {
			params: {
				images: [],
			},
		},
	}
	const tree = renderer
		.create(
			<TestProvider>
				<ImageView {...props} />
			</TestProvider>,
		)
		.toJSON()
	expect(tree).toMatchSnapshot()
})
