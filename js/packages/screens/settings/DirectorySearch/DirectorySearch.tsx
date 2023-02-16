import { phone } from 'phone'
import React, { useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'

import beapi from '@berty/api'
import { DebugServersAddrCapabilities, ItemSection, SmallInput } from '@berty/components'
import { PrimaryButton } from '@berty/components/buttons/primary/PrimaryButton'
import { ButtonSettingV2 } from '@berty/components/shared-components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import { useMessengerClient, useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { IdentityType } from '@berty/utils/linkedidentities/types'
import * as testIDs from '@berty/utils/testing/testIDs.json'

type SearchResult = {
	results: beapi.messenger.DirectoryServiceQuery.Reply[]
	errors: string[]
}

const searchOnDirectoryService = async (
	client: ServiceClientType<beapi.messenger.MessengerService>,
	knownDirectoryServices: { address: string; capabilities: string[] }[],
	identifiers: string[],
	searchId: number,
	setSearchResults: (arg0: number, arg1: SearchResult) => boolean,
) => {
	let results: beapi.messenger.DirectoryServiceQuery.Reply[] = []
	let errors: string[] = []

	await Promise.all(
		knownDirectoryServices.map(async service => {
			identifiers = identifiers.map(identifier => {
				const parsedPhone = phone(identifier, { validateMobilePrefix: false })
				if (parsedPhone.isValid) {
					return `tel:${parsedPhone.phoneNumber}`
				}

				return identifier
			})

			const stream = await client.directoryServiceQuery({
				identifiers: identifiers,
				serverAddr: service.address,
			})

			stream.onMessage((message, err) => {
				if (err !== null) {
					if (!err.EOF) {
						errors.push(err.message)
					}

					return
				}

				if (message !== null) {
					results.push(message)
				}
			})
			await stream.start().catch(err => errors.push(err))
		}),
	)

	if (results.length === 0) {
		// TODO: i18n
		errors.push('no results found')
	}

	return setSearchResults(searchId, { results, errors })
}

export const DirectorySearch: ScreenFC<'Settings.DirectorySearch'> = ({
	navigation: { navigate },
}) => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const [searchQuery, setSearchQuery] = React.useState('')
	const [searchId, setSearchId] = React.useState(0)
	const [searchResults, setSearchResults] = React.useState<SearchResult>({
		results: [],
		errors: [],
	})
	const messengerClient = useMessengerClient()
	const [knownDirectoryServices, setKnownDirectoryServices] = useState<
		{ address: string; capabilities: string[] }[]
	>([
		{
			address: 'localhost:9091',
			capabilities: [IdentityType.PHONE],
		},
	])

	const updateSearchResults = React.useCallback(
		(resultSearchId: number, results: SearchResult) => {
			if (resultSearchId !== searchId) {
				return false
			}

			setSearchResults(results)
			return true
		},
		[searchId, setSearchResults],
	)

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<ItemSection>
					<DebugServersAddrCapabilities
						onChange={setKnownDirectoryServices}
						values={knownDirectoryServices}
						possibleCapabilities={IdentityType}
						dropdownTitle={'Debug tool: directory server host:port' /* TODO: i18n */}
					/>
				</ItemSection>

				<ItemSection>
					<SmallInput
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholder={'Search query'}
					/>
					<PrimaryButton
						onPress={async () => {
							setSearchId(Date.now())
							setSearchResults({ results: [], errors: [] })
							const resultsShown = await searchOnDirectoryService(
								messengerClient!,
								knownDirectoryServices,
								[searchQuery],
								searchId,
								updateSearchResults,
							)

							if (resultsShown) {
								setSearchId(0)
							}
						}}
					>
						{'Search'}
					</PrimaryButton>
				</ItemSection>

				<ItemSection>
					{searchId !== 0 ? <ActivityIndicator /> : null}
					{searchResults.errors.map((error, idx) => (
						<UnifiedText key={idx}>{error}</UnifiedText>
					))}
					{searchResults.results.map((result, idx) => (
						<ButtonSettingV2
							key={idx}
							text={result.directoryIdentifier}
							icon='external-link-outline'
							testID={testIDs['open-berty-link']}
							onPress={() =>
								navigate('Chat.ManageDeepLink', { type: 'link', value: result.accountUri })
							}
						/>
					))}
				</ItemSection>
			</ScrollView>
		</View>
	)
}
