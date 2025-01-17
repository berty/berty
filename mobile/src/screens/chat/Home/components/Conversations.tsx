import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, ViewProps } from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { Suggestion, Configuration } from '@berty/redux/reducers/persistentOptions.reducer'

import { ConversationItem } from './conversation/ConversationItem'
import { AddBotCallback } from './suggestion/interfaces'
import { SuggestionItem } from './suggestion/SuggestionItem'

export const Conversations: React.FC<
	ViewProps & {
		items: beapi.messenger.IConversation[]
		suggestions: Suggestion[]
		configurations: Configuration[]
		addBot: AddBotCallback
	}
> = React.memo(({ items, suggestions, configurations, addBot }) => {
	const { padding } = useStyles()
	const { t } = useTranslation()
	const colors = useThemeColor()

	return items.length || suggestions.length || configurations.length ? (
		<View
			style={[
				padding.bottom.medium,
				{
					flex: 1,
					backgroundColor: colors['main-background'],
				},
			]}
		>
			{/* TODO configurations conv ? */}
			{items.map((conv, index) => (
				<ConversationItem
					key={conv.publicKey}
					{...conv}
					isLast={!suggestions.length && index === items.length - 1}
				/>
			))}
			{suggestions.map((suggestion, index) => (
				<SuggestionItem
					key={`__suggestion_${index}`}
					isLast={index === suggestions.length - 1}
					{...suggestion}
					desc={`${t('main.suggestion-display-name-initial')} ${suggestion.displayName}`}
					addBot={addBot}
				/>
			))}
		</View>
	) : null
})
