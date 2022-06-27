import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { MultiMemberSettings } from './MultiMemberSettings'

test('Group.MultiMemberSettings renders correctly', async () => {
	const { toJSON } = renderScreen('Group.MultiMemberSettings', MultiMemberSettings, { convId: '' })
	expect(toJSON()).toMatchSnapshot()
})
