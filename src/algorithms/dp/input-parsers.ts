import type {
  DynamicProgrammingInput,
  ParsedDynamicProgrammingInput,
  DynamicProgrammingMazeInput,
  DynamicProgrammingMazeBlockedCell,
} from '../../domain/algorithms/types.ts'

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const splitAndValidateNumbers = (
  raw: string,
  options?: Readonly<{ minLength?: number; maxLength?: number }>,
): Readonly<{ values: number[]; errors: string[] }> => {
  const maxLength = options?.maxLength ?? 20
  const minLength = options?.minLength ?? 2
  const tokens = raw
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)

  const errors: string[] = []

  if (tokens.length === 0) {
    errors.push('Provide at least one number.')
  }

  if (tokens.length > maxLength) {
    errors.push(`Limit numbers to ${maxLength} items.`)
  }

  if (tokens.length < minLength) {
    errors.push(`Provide at least ${minLength} numbers.`)
  }

  const values: number[] = []
  tokens.forEach((token, index) => {
    const parsed = Number(token)
    if (!Number.isFinite(parsed)) {
      errors.push(`Token ${index + 1} is not a number: "${token}"`)
      return
    }
    values.push(clampNumber(Math.round(parsed), -999, 999))
  })

  return { values, errors }
}

const parseNumberCsvForAlgorithm = (
  algorithmId: 'salesman-house' | 'longest-increasing-subsequence' | 'maximum-subarray',
  raw: string,
  options?: Readonly<{ minLength?: number; maxLength?: number }>,
): ParsedDynamicProgrammingInput => {
  const { values, errors } = splitAndValidateNumbers(raw, options)
  if (errors.length > 0) {
    return { input: null, errors }
  }

  return {
    input: { algorithmId, values },
    errors,
  }
}

const sanitizeString = (value: string) => value.trim().toUpperCase()

const parseStringPair = (
  algorithmId: 'longest-common-subsequence' | 'edit-distance',
  leftRaw: string,
  rightRaw: string,
  options?: Readonly<{ maxLength?: number }>,
): ParsedDynamicProgrammingInput => {
  const maxLength = options?.maxLength ?? 12
  const left = sanitizeString(leftRaw)
  const right = sanitizeString(rightRaw)
  const errors: string[] = []

  if (left.length === 0 || right.length === 0) {
    errors.push('Both strings must be non-empty.')
  }

  if (left.length > maxLength || right.length > maxLength) {
    errors.push(`Strings must be at most ${maxLength} characters.`)
  }

  if (errors.length > 0) {
    return { input: null, errors }
  }

  return {
    input: {
      algorithmId,
      left,
      right,
    },
    errors,
  }
}

const parseMaze = (
  sizeRaw: string,
  blocked: ReadonlySet<string>,
  options?: Readonly<{ minSize?: number; maxSize?: number }>,
): ParsedDynamicProgrammingInput => {
  const minSize = options?.minSize ?? 3
  const maxSize = options?.maxSize ?? 8
  const sizeNumber = Number(sizeRaw)
  const errors: string[] = []

  if (!Number.isInteger(sizeNumber)) {
    errors.push('Size must be an integer.')
  }

  const clampedSize = clampNumber(sizeNumber, minSize, maxSize)
  if (sizeNumber !== clampedSize) {
    errors.push(`Size must be between ${minSize} and ${maxSize}.`)
  }

  const blockedCells: DynamicProgrammingMazeBlockedCell[] = []
  blocked.forEach((key) => {
    const [row, column] = key.split(':').map((part) => Number(part))
    if (Number.isInteger(row) && Number.isInteger(column)) {
      if ((row === 0 && column === 0) || (row === clampedSize - 1 && column === clampedSize - 1)) {
        return
      }
      if (row >= 0 && row < clampedSize && column >= 0 && column < clampedSize) {
        blockedCells.push({ rowIndex: row, columnIndex: column })
      }
    }
  })

  const input: DynamicProgrammingMazeInput = {
    algorithmId: 'maze',
    size: clampedSize,
    blockedCells,
  }

  return { input, errors }
}

export {
  parseMaze,
  parseNumberCsvForAlgorithm,
  parseStringPair,
  splitAndValidateNumbers,
}
export type { DynamicProgrammingInput, ParsedDynamicProgrammingInput }
