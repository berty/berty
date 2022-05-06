import Long from 'long'

export const numberifyLong = (longNumber: number | Long | undefined | null): number => {
	if (longNumber === undefined || longNumber === null) {
		longNumber = 0
	}

	if (longNumber instanceof Long) {
		longNumber = longNumber.toNumber()
	}

	longNumber = parseInt(String(longNumber), 10)

	return longNumber
}
