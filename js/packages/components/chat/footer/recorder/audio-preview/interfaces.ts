import React from 'react'

import { RecordingState } from '../constant'

export interface AudioPreviewProps {
	meteredValuesRef: React.MutableRefObject<number[]>
	recordDuration: number | null
	recordFilePath: string
	clearRecordingInterval: ReturnType<typeof setInterval> | null
	setRecordingState: React.Dispatch<React.SetStateAction<RecordingState>>
	setHelpMessageValue: ({ message, delay }: { message: string; delay?: number | undefined }) => void
}

export type AudioPreviewWrapperProps = Omit<
	AudioPreviewProps,
	'meteredValuesRef' | 'recordDuration' | 'recordFilePath'
>
