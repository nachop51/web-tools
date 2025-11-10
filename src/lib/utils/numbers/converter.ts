export enum NumberMode {
	INT = 'int',
	INT32 = 'int32',
	FLOAT32 = 'float32',
	FLOAT64 = 'float64'
}

function floatToBinary(num: number, { bits = 32, littleEndian = true } = {}) {
	const buffer = new ArrayBuffer(bits / 8)
	const view = new DataView(buffer)

	if (bits === 32) {
		view.setFloat32(0, num, littleEndian)
	} else if (bits === 64) {
		view.setFloat64(0, num, littleEndian)
	} else {
		throw new Error('Unsupported bit size for float conversion')
	}

	let binary = ''

	if (bits === 32) {
		const u32 = view.getUint32(0, littleEndian)
		binary = u32.toString(2).padStart(32, '0')
	} else {
		const low = view.getUint32(littleEndian ? 0 : 4, littleEndian)
		const high = view.getUint32(littleEndian ? 4 : 0, littleEndian)

		const lowBits = low.toString(2).padStart(32, '0')
		const highBits = high.toString(2).padStart(32, '0')

		binary = highBits + lowBits
	}

	const sign = binary.charAt(0)
	const exponent = binary.slice(1, bits === 32 ? 9 : 12)
	const mantissa = binary.slice(bits === 32 ? 9 : 12)

	return { bits: binary, sign, exponent, mantissa }
}

export function validateNumberBase(
	input: string | number | null | undefined,
	base: string | number,
	mode: NumberMode = NumberMode.INT
): true | string {
	const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(
		0,
		parseInt(base?.toString() ?? '10')
	)

	if (input == null) {
		return true
	}

	let parsedInput = input?.toString().toUpperCase() ?? ''

	if (parsedInput.at(0) === '-') {
		parsedInput = parsedInput.slice(1)
	}

	for (const char of parsedInput) {
		if (!validChars.includes(char)) {
			if (mode === NumberMode.FLOAT32 || mode === NumberMode.FLOAT64) {
				if (char === '.') {
					continue
				}
			}

			return `Character "${char}" is not valid for base ${base} (0-${validChars.at(-1)})`
		}
	}

	return true
}

export function computeOutputNumber(
	input: string | number | null | undefined,
	valueBase: string | number,
	targetBase: string | number,
	mode: NumberMode = NumberMode.INT
) {
	let parsed: number

	try {
		parsed = parseInt(input?.toString() ?? '', parseInt(valueBase.toString()))
	} catch {
		return ''
	}

	if (isNaN(parsed)) {
		return ''
	}

	try {
		let result: number = parsed

		if (mode === NumberMode.INT32) {
			result = parsed >>> 0
		} else if (mode === NumberMode.INT) {
			result = parsed
		}

		if (targetBase === 2 && (mode === NumberMode.FLOAT32 || mode === NumberMode.FLOAT64)) {
			const bits = mode === NumberMode.FLOAT32 ? 32 : 64
			const floatBinary = floatToBinary(parsed, { bits, littleEndian: true })
			return floatBinary.bits
		}

		return result.toString(parseInt(targetBase.toString()))
	} catch {
		return ''
	}
}
