import React from 'react'
import { Translation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'

import { servicesAuthViaDefault, useAccountServices } from '@berty-tech/store/services'
import { useMsgrContext } from '@berty-tech/store/hooks'

import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'

const ServicesAuthBody: React.FC<{ next: () => void }> = ({ next }) => {
	const ctx = useMsgrContext()
	const accountServices = useAccountServices() || []

	React.useEffect(() => {
		if (accountServices.length > 0) {
			next()
		}
	}, [next, accountServices.length])

	return (
		<Translation>
			{(t) => (
				<SwiperCard
					header={t('onboarding.services-auth.header')}
					label={t('onboarding.services-auth.recommended')}
					title={t('onboarding.services-auth.title')}
					description={t('onboarding.services-auth.desc')}
					button={
						accountServices.length > 0
							? undefined
							: {
									text: t('onboarding.services-auth.button'),
									onPress: async () => {
										await servicesAuthViaDefault(ctx)
									},
							  }
					}
					skip={{
						text: t('onboarding.notifications.skip'),
						onPress: next,
					}}
				/>
			)}
		</Translation>
	)
}

export const ServicesAuth: React.FC<{}> = () => {
	const { navigate } = useNavigation()

	return (
		<OnboardingWrapper>
			<ServicesAuthBody next={() => navigate('Onboarding.SetupFinished')} />
		</OnboardingWrapper>
	)
}

export default ServicesAuth
