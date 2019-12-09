import React from 'react'
import { colors } from '../styles'
import { Footer as SharedFooter } from '../shared-components/Footer'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { useNavigation } from '@berty-tech/berty-navigation'

export const Footer = ({ navigate }) => {
	return (
		<Store.AccountGet request={{ id: 0 }}>
			{(response) => (
				<Store.ContactGet request={{ id: response?.account?.contactId || 0 }}>
					{(response) => (
						<SharedFooter
							left={{ icon: 'search-outline' }}
							center={{ icon: 'message-circle-outline', onPress: navigate.tab.main }}
							right={{
								avatarUri: response?.contact?.avatarUri,
								backgroundColor: colors.blue,
								size: 50,
								elemSize: 45,
								onPress: navigate.settings.home,
							}}
						/>
					)}
				</Store.ContactGet>
			)}
		</Store.AccountGet>
	)
}
