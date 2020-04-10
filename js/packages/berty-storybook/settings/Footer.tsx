import React from 'react'
import { useStyles } from '@berty-tech/styles'
import { Footer as SharedFooter } from '../shared-components/Footer'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { Chat } from '@berty-tech/hooks'

export const Footer: React.FC<{ navigate: any; hidden: boolean }> = ({ navigate, hidden }) => {
	const [{ color }] = useStyles()
	const client = Chat.useClient()
	return (
		<Store.AccountGet request={{ id: 0 }}>
			{(response) => (
				<Store.ContactGet request={{ id: response?.account?.contactId || 0 }}>
					{(response) => (
						<SharedFooter
							left={{ icon: 'search-outline', onPress: navigate.main.search }}
							center={{ icon: 'message-circle-outline', onPress: navigate.main.list }}
							right={{
								seed: client?.accountPk,
								backgroundColor: color.blue,
								size: 50,
								elemSize: 35,
								onPress: navigate.settings.home,
							}}
							hidden={hidden}
						/>
					)}
				</Store.ContactGet>
			)}
		</Store.AccountGet>
	)
}
