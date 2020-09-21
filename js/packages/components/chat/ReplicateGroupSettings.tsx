import React from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@react-navigation/native'
import { useConversation, useMsgrContext } from '@berty-tech/store/hooks'
import { Messenger } from '@berty-tech/store/oldhooks'
import HeaderSettings from '../shared-components/Header'
import { ButtonSetting, FactionButtonSetting } from '../shared-components'
import { Layout } from 'react-native-ui-kitten'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { ScreenProps } from '@berty-tech/navigation'

const ReplicateGroupContent: React.FC<{
	conversationPublicKey: string
}> = ({ conversationPublicKey }) => {
	const ctx: any = useMsgrContext()
	const account = Messenger.useAccount()
	const navigation = useNavigation()
	const [{ margin, color, flex, padding }] = useStyles()

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<FactionButtonSetting
				name='Choose a replication server'
				icon='cloud-upload-outline'
				iconSize={30}
				iconColor={color.blue}
				style={[margin.top.medium]}
			>
				{account.serviceTokens
					.filter((t) => t.serviceType === 'rpl')
					.map((t) => (
						<ButtonSetting
							key={`${t.tokenId}-${t.serviceType}`}
							name={`${t.authenticationUrl}`}
							alone={false}
							onPress={async () => {
								if (
									!(await new Promise((resolve) => {
										Alert.alert(
											'Privacy warning',
											"The data for this conversation will be replicated on the selected server, while the messages and their metadata won't be readable by anyone outside the conversation this will lead to a decreased privacy protection for all the members' activity, do you want to proceed?",
											[
												{
													text: 'Replicate conversation contents',
													onPress: () => {
														resolve(true)
													},
												},
												{ text: 'Cancel', onPress: () => resolve(false) },
											],
										)
									}))
								) {
									return
								}

								try {
									await ctx.client.replicationServiceRegisterGroup({
										tokenId: t.tokenId,
										conversationPublicKey: conversationPublicKey,
									})

									Alert.alert(
										'Conversation registered on server',
										'The conversation contents will be replicated from now on',
									)

									navigation.goBack()
								} catch (e) {
									console.warn(e)
									Alert.alert(
										'Conversation not registered',
										'An error occurred while registering the conversation on the server',
									)
								}
							}}
						/>
					))}
			</FactionButtonSetting>
		</View>
	)
}

export const ReplicateGroupSettings: React.FC<ScreenProps.Chat.ReplicateGroupSettings> = ({
	route,
}) => {
	const { convId } = route.params
	const [{ padding, flex }] = useStyles()
	const { goBack } = useNavigation()
	const conv = useConversation(convId)

	if (!conv) {
		goBack()
		return null
	}

	return (
		<Layout style={[flex.tiny]}>
			<SwipeNavRecognizer>
				<ScrollView contentContainerStyle={[padding.bottom.huge]} bounces={false}>
					<HeaderSettings
						actionIcon='edit-outline'
						undo={goBack}
						title={'Register conversation on server'}
					/>
					<ReplicateGroupContent conversationPublicKey={conv.publicKey} />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}

export default ReplicateGroupSettings
