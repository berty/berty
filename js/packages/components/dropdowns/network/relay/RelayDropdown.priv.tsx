import React from 'react'
import { useTranslation } from 'react-i18next'

import { DividerItem } from '@berty/components/items'
import { AccordionAdd } from '@berty/components/modals/AccordionAdd.modal'
import { AccordionEdit } from '@berty/components/modals/AccordionEdit.modal'
import { useModal } from '@berty/contexts/modal.context'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import {
	addToStaticRelay,
	modifyFromStaticRelay,
	removeFromStaticRelay,
	selectStaticRelay,
	toggleFromStaticRelay,
} from '@berty/redux/reducers/networkConfig.reducer'

import { AddButtonPriv } from '../AddButton.priv'
import { MenuToggleWithEditPriv } from '../MenuToggleWithEdit.priv'

export const RelayDropdownPriv = () => {
	const dispatch = useAppDispatch()
	const { hide, show } = useModal()
	const { t } = useTranslation()
	const staticRelay = useAppSelector(selectStaticRelay)

	return (
		<>
			{(staticRelay || []).map(({ alias, url, isEnabled, isEditable }, index) => (
				<>
					<DividerItem />
					<MenuToggleWithEditPriv
						key={`relay-item-${index}`}
						isToggleOn={isEnabled}
						onPress={() => dispatch(toggleFromStaticRelay(url))}
						onPressModify={
							isEditable
								? () =>
										show(
											<AccordionEdit
												title={t('onboarding.custom-mode.settings.modals.edit.title.relay')}
												onEdit={data => {
													dispatch(modifyFromStaticRelay({ url, changes: data }))
													hide()
												}}
												onDelete={() => {
													dispatch(removeFromStaticRelay(url))
													hide()
												}}
												defaultAlias={alias}
												defaultUrl={url}
												alreadyExistingUrls={staticRelay
													.map(({ url }) => url)
													.filter((url): url is string => url !== undefined)}
												alreadyExistingAliases={staticRelay
													.map(({ alias }) => alias)
													.filter((alias): alias is string => alias !== undefined)}
											/>,
										)
								: undefined
						}
					>
						{alias}
					</MenuToggleWithEditPriv>
				</>
			))}
			<DividerItem />
			<AddButtonPriv
				onPress={() =>
					show(
						<AccordionAdd
							title={t('onboarding.custom-mode.settings.modals.add.title.relay')}
							onSubmit={data => {
								dispatch(addToStaticRelay(data))
								hide()
							}}
							alreadyExistingAliases={staticRelay
								.map(({ alias }) => alias)
								.filter((alias): alias is string => alias !== undefined)}
							alreadyExistingUrls={staticRelay
								.map(({ url }) => url)
								.filter((url): url is string => url !== undefined)}
						/>,
					)
				}
			/>
		</>
	)
}
