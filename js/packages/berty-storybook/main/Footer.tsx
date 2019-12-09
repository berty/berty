import React from 'react'
import { Footer as SharedFooter } from '../shared-components/Footer'
import { colors } from '../styles'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { ScreenProps } from '@berty-tech/berty-navigation'

export const Footer: React.FC<ScreenProps.Tab.Main> = (props) => {
	const { navigate } = props
	return (
		<Store.AccountGet request={{ id: 0 }}>
			{(response) => (
				<Store.ContactGet request={{ id: response?.account?.contactId || 0 }}>
					{(response) => (
						<SharedFooter
							left={{ icon: 'search-outline' }}
							center={{
								icon: 'plus-outline',
								backgroundColor: colors.blue,
								size: 50,
								elemSize: 30,
								elemColor: colors.white,
							}}
							right={{
								avatarUri: response?.contact?.avatarUri,
								elemSize: 40,
								onPress: navigate.tab.settings,
							}}
						/>
					)}
				</Store.ContactGet>
			)}
		</Store.AccountGet>
	)
}
