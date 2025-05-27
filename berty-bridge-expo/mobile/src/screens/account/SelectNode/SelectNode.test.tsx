import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { SelectNode } from './SelectNode'

test('Account.SelectNode renders correctly', () => {
	const { toJSON } = renderScreen('Account.SelectNode', SelectNode, {
		init: false,
		action: async () => {
			return false
		},
	})
	expect(toJSON()).toMatchSnapshot()
})
