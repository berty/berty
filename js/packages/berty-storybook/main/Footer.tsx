import React from 'react'
import { Footer as SharedFooter } from '../shared-components/Footer'
import { useStyles } from '@berty-tech/styles'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { ScreenProps } from '@berty-tech/berty-navigation'
import { Chat } from '@berty-tech/hooks'

export const Footer: React.FC<ScreenProps.Tab.Main> = (props) => {
	const { navigate } = props
	const client = Chat.useClient()
	const [{ color }] = useStyles()

	return (
		<Store.AccountGet request={{ id: 0 }}>
			{(response) => (
				<Store.ContactGet request={{ id: response?.account?.contactId || 0 }}>
					{(response) => (
						<SharedFooter
							left={{ icon: 'search-outline', onPress: navigate.main.search }}
							center={{
								icon: 'plus-outline',
								backgroundColor: color.blue,
								size: 50,
								elemSize: 30,
								elemColor: color.white,
								onPress: navigate.main.listModal,
							}}
							right={{
								seed: client?.accountPk,
								backgroundColor: color.white,
								size: 50,
								elemSize: 35,
								onPress: navigate.settings.home,
							}}
						/>
					)}
				</Store.ContactGet>
			)}
		</Store.AccountGet>
	)
}
