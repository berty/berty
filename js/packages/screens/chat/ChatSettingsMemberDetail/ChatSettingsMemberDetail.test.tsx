import { getFirstMultiMemberConv } from '@berty/utils/testing/helpers'
import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ChatSettingsMemberDetail } from './ChatSettingsMemberDetail'

test('Group.ChatSettingsMemberDetail renders correctly', async () => {
	await mockServices()

	const conv = getFirstMultiMemberConv()

	const { toJSON } = renderScreen('Group.ChatSettingsMemberDetail', ChatSettingsMemberDetail, {
		convId: conv?.publicKey || '',
		memberPk: conv?.members ? conv.members[0].publicKey || '' : '',
		displayName: conv?.members ? conv.members[0].displayName || '' : '',
	})
	expect(toJSON()).toMatchSnapshot()
})
