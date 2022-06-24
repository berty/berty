import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { DividerItem } from '@berty/components/items'
import { AccordionAdd } from '@berty/components/modals/AccordionAdd.modal'
import { AccordionEdit } from '@berty/components/modals/AccordionEdit.modal'
import { useModal } from '@berty/contexts/modal.context'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import {
	addToBootstrap,
	modifyFromBootstrap,
	removeFromBootstrap,
	selectBootstrap,
	toggleFromBootstrap,
} from '@berty/redux/reducers/networkConfig.reducer'

import { AddButtonPriv } from '../AddButton.priv'
import { MenuToggleWithEditPriv } from '../MenuToggleWithEdit.priv'

export const BootstrapItemsPriv = () => {
	const dispatch = useAppDispatch()
	const { hide, show } = useModal()
	const { t } = useTranslation()
	const bootstrap = useAppSelector(selectBootstrap)

	return (
		<>
			{(bootstrap || []).map(({ alias, url, isEnabled, isEditable }, index) => (
				<View key={`bootstrap-item-${index}`}>
					<DividerItem />
					<MenuToggleWithEditPriv
						isToggleOn={isEnabled}
						onPress={() => dispatch(toggleFromBootstrap(url))}
						onPressModify={
							isEditable
								? () =>
										show(
											<AccordionEdit
												title={t('onboarding.custom-mode.settings.modals.edit.title.bootstrap')}
												onEdit={data => {
													dispatch(modifyFromBootstrap({ url, changes: data }))
													hide()
												}}
												onDelete={() => {
													dispatch(removeFromBootstrap(url))
													hide()
												}}
												defaultAlias={alias}
												defaultUrl={url}
												alreadyExistingUrls={bootstrap
													.map(({ url }) => url)
													.filter((url): url is string => url !== undefined)}
												alreadyExistingAliases={bootstrap
													.map(({ alias }) => alias)
													.filter((alias): alias is string => alias !== undefined)}
											/>,
										)
								: undefined
						}
					>
						{alias}
					</MenuToggleWithEditPriv>
				</View>
			))}
			<DividerItem />
			<AddButtonPriv
				onPress={() =>
					show(
						<AccordionAdd
							title={t('onboarding.custom-mode.settings.modals.add.title.bootstrap')}
							onSubmit={data => {
								dispatch(addToBootstrap(data))
								hide()
							}}
							alreadyExistingAliases={bootstrap
								.map(({ alias }) => alias)
								.filter((alias): alias is string => alias !== undefined)}
							alreadyExistingUrls={bootstrap
								.map(({ url }) => url)
								.filter((url): url is string => url !== undefined)}
						/>,
					)
				}
			/>
		</>
	)
}
