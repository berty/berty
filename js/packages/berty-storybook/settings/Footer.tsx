import React from 'react'
import { useStyles } from '@berty-tech/styles'
import { Footer as SharedFooter } from '../shared-components/Footer'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'

export const Footer = ({ navigate }) => {
	const [{ color }] = useStyles()
	return (
		<Store.AccountGet request={{ id: 0 }}>
			{(response) => (
				<Store.ContactGet request={{ id: response?.account?.contactId || 0 }}>
					{(response) => (
						<SharedFooter
							left={{ icon: 'search-outline', onPress: navigate.main.search }}
							center={{ icon: 'message-circle-outline', onPress: navigate.main.list }}
							right={{
								avatarUri: response?.contact?.avatarUri,
								backgroundColor: color.blue,
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
