import React from 'react'
import { useStyles } from '@berty-tech/styles'
import { Footer as SharedFooter } from '../shared-components/Footer'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { Chat } from '@berty-tech/hooks'

export const Footer = ({ navigate }) => {
	const [{ color }] = useStyles()
	const setNavigation = Chat.useSetNavigation()
	return (
		<Store.AccountGet request={{ id: 0 }}>
			{(response) => (
				<Store.ContactGet request={{ id: response?.account?.contactId || 0 }}>
					{(response) => (
						<SharedFooter
							left={{
								icon: 'search-outline',
								onPress: () => setNavigation({ stack: 'Search' }),
							}}
							center={{
								icon: 'message-circle-outline',
								onPress: () => setNavigation({ stack: 'Main' }),
							}}
							right={{
								avatarUri: response?.contact?.avatarUri,
								backgroundColor: color.blue,
								size: 50,
								elemSize: 45,
								onPress: () => setNavigation({ stack: 'Settings' }),
							}}
						/>
					)}
				</Store.ContactGet>
			)}
		</Store.AccountGet>
	)
}
