import React from 'react'
import renderer from 'react-test-renderer'

import { fixtures, TestProvider } from '@berty-tech/testutil'

import { AudioMessage } from '../AudioMessage'

test('AudioMessage renders correctly', () => {
	const props: React.ComponentProps<typeof AudioMessage> = {
		medias: [fixtures.media.empty],
		onLongPress: () => {},
		isHighlight: false,
	}
	// FIXME: mock useContactRequest to get children in the snapshot
	const tree = renderer
		.create(
			<TestProvider>
				<AudioMessage {...props} />
			</TestProvider>,
		)
		.toJSON()
	expect(tree).toMatchSnapshot()
})
