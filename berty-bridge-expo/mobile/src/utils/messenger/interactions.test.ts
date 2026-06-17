import beapi from '@berty/api'

import { parseInteraction } from './interactions'

describe('parseInteraction', () => {
	const payload = beapi.messenger.AppMessage.UserMessage.encode({ body: '39' }).finish()
	const baseInteraction = {
		cid: 'cid',
		conversationPublicKey: 'conversation',
		payload,
		sentDate: '1781645894714',
	}

	it('parses protobuf JSON enum strings', () => {
		const interaction = parseInteraction({
			...baseInteraction,
			type: 'TypeUserMessage' as any,
		})

		expect(interaction.type).toBe(beapi.messenger.AppMessage.Type.TypeUserMessage)
		expect(interaction.payload).toEqual({ body: '39' })
	})

	it('parses generated numeric enum values', () => {
		const interaction = parseInteraction({
			...baseInteraction,
			type: beapi.messenger.AppMessage.Type.TypeUserMessage,
		})

		expect(interaction.type).toBe(beapi.messenger.AppMessage.Type.TypeUserMessage)
		expect(interaction.payload).toEqual({ body: '39' })
	})

	it('falls back for missing message types', () => {
		const warn = jest.spyOn(console, 'warn').mockImplementation()
		const interaction = parseInteraction(baseInteraction)

		expect(interaction.type).toBe(beapi.messenger.AppMessage.Type.Undefined)
		expect(interaction.payload).toBeUndefined()
		warn.mockRestore()
	})
})
