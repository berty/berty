import { parseNumber, formatNumber, CountryCode } from 'libphonenumber-js'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, View, NativeModules } from 'react-native'
import { RESULTS } from 'react-native-permissions'

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
import { acquirePermission, PermissionType } from '@berty/utils/permissions/permissions'
import * as testIDs from '@berty/utils/testing/testIDs.json'

type AddressBookContact = {
	fullName: string
	emailAddresses: string[]
	phoneNumbers: string[]
}

type MatchedAddressBookContact = AddressBookContact & {
	identifier: string
}

type SearchResult = {
	results: beapi.messenger.DirectoryServiceQuery.Reply[]
	errors: string[]
}

const normalizePhoneNumber = (phoneNumber: string, deviceCountry: string | undefined) => {
	const parsedPhoneNumber = parseNumber(phoneNumber, {
		defaultCountry: deviceCountry as CountryCode | undefined,
		extended: true,
	})

	if (!('possible' in parsedPhoneNumber) || !parsedPhoneNumber.possible) {
		return ['', '']
	}

	const queryPhoneNumber = `tel:${formatNumber(parsedPhoneNumber, 'E.164')}`
	const displayPhoneNumber = formatNumber(parsedPhoneNumber, 'INTERNATIONAL')

	return [queryPhoneNumber, displayPhoneNumber]
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
	const [userMappedContacts, setUserMappedContacts] = useState<{
		[key: string]: MatchedAddressBookContact
	}>({})

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

	const sortedResults = React.useMemo(
		() =>
			searchResults.results
				.map(result => {
					let mappedContact: MatchedAddressBookContact | undefined
					let displayedIdentifier = result.directoryIdentifier

					if (result.directoryIdentifier in userMappedContacts) {
						mappedContact = userMappedContacts[result.directoryIdentifier]
						displayedIdentifier = mappedContact.identifier
					}

					return [result, mappedContact?.fullName || '', displayedIdentifier] as [
						beapi.messenger.DirectoryServiceQuery.Reply,
						string,
						string,
					]
				})
				.sort(
					([_, contactNameA, displayedIdentifierA], [__, contactNameB, displayedIdentifierB]) => {
						if (contactNameA !== '' && contactNameB !== '') {
							return contactNameA.localeCompare(contactNameB)
						} else if (contactNameA !== '' && contactNameB === '') {
							return 1
						} else if (contactNameA !== '' && contactNameB === '') {
							return -1
						}

						return displayedIdentifierA.localeCompare(displayedIdentifierB)
					},
				),
		[searchResults.results, userMappedContacts],
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
					<PrimaryButton
						onPress={async () => {
							const status = await acquirePermission(PermissionType.contacts)
							if (status !== RESULTS.GRANTED) {
								console.warn(status)
								Alert.alert('Access to address book has been denied, unable to search for contacts')
								return
							}

							try {
								let deviceCountry: string | undefined
								try {
									deviceCountry = (await NativeModules.AddressBook.getDeviceCountry()) as string
									if (deviceCountry.match(/^[A-Z]{2,3}$/) === null) {
										console.warn(`unusual locale retrieved: ${deviceCountry}`)
										deviceCountry = undefined
									}
								} catch (e) {
									console.warn("unable to retrieve device's locale")
								}

								const contactsJSON: string = await NativeModules.AddressBook.getAllContacts()
								const contacts = JSON.parse(contactsJSON) as AddressBookContact[]
								const userMappedContacts = Object.fromEntries(
									contacts
										.map(
											c =>
												c.phoneNumbers
													.map(phoneNumber => normalizePhoneNumber(phoneNumber, deviceCountry))
													.filter(
														([queryPhoneNumber, displayedPhoneNumber]) =>
															queryPhoneNumber !== '' && displayedPhoneNumber !== '',
													)
													.map(([queryPhoneNumber, displayedPhoneNumber]) => [
														queryPhoneNumber,
														{ ...c, identifier: displayedPhoneNumber },
													]) as [string, MatchedAddressBookContact][],
										)
										.reduce(
											(previousValue, currentValue) => [...previousValue, ...currentValue],
											[],
										),
								)
								setUserMappedContacts(userMappedContacts)

								setSearchId(Date.now())
								setSearchResults({ results: [], errors: [] })

								// TODO: make multiple queries when searching a large number of contacts
								const resultsShown = await searchOnDirectoryService(
									messengerClient!,
									knownDirectoryServices,
									Object.keys(userMappedContacts),
									searchId,
									updateSearchResults,
								)

								if (resultsShown) {
									setSearchId(0)
								}
							} catch (e) {
								console.warn(e)
							}
						}}
					>
						{'Search from address book'}
					</PrimaryButton>
				</ItemSection>

				<ItemSection>
					{searchId !== 0 ? <ActivityIndicator /> : null}
					{searchResults.errors.map((error, idx) => (
						<UnifiedText key={idx}>{error}</UnifiedText>
					))}
					{sortedResults.map(([result, contactName, displayedIdentifier]) => {
						return (
							<ButtonSettingV2
								key={result.directoryIdentifier}
								text={`${contactName ? contactName + '\n' : ''}${
									displayedIdentifier || result.directoryIdentifier
								}`}
								icon='external-link-outline'
								testID={testIDs['open-berty-link']}
								onPress={() =>
									navigate('Chat.ManageDeepLink', { type: 'link', value: result.accountUri })
								}
							/>
						)
					})}
				</ItemSection>
			</ScrollView>
		</View>
	)
}
