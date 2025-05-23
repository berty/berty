import { getFirstMultiMemberConv } from '@berty/utils/testing/helpers'
import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { SettingsMemberDetail } from './SettingsMemberDetail'

test('Chat.SettingsMemberDetail renders correctly', async () => {
	await mockServices()

	const conv = getFirstMultiMemberConv()

	const { toJSON } = renderScreen('Chat.SettingsMemberDetail', SettingsMemberDetail, {
		convId: conv?.publicKey || '',
		memberPk: conv?.members ? conv.members[0].publicKey || '' : '',
		displayName: conv?.members ? conv.members[0].displayName || '' : '',
	})
	expect(toJSON()).toMatchSnapshot()
})
