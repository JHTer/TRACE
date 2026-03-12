import {
  MAX_COUNTING_SORT_VALUE,
  MAX_RADIX_SORT_VALUE,
  MAX_TOPIC02_SORT_DATASET_LENGTH,
} from '../../domain/algorithms/topic02SortLimits.ts'

type ConstraintMode = 'comparison' | 'counting' | 'radix'

type Constraints = Readonly<{
  maxLength?: number
  mode: ConstraintMode
}>

type ParseResult =
  | Readonly<{ ok: true; values: readonly number[] }>
  | Readonly<{ ok: false; error: string }>

const defaultMaxLength = MAX_TOPIC02_SORT_DATASET_LENGTH

const parseSortDataset = (rawInput: string, constraints: Constraints): ParseResult => {
  const maxLength = constraints.maxLength ?? defaultMaxLength
  const tokens = rawInput
    .split(/[,\s]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)

  if (tokens.length === 0) {
    return { ok: false, error: 'enter at least one integer' }
  }

  if (tokens.length > maxLength) {
    return { ok: false, error: `maximum of ${maxLength} values` }
  }

  const values: number[] = []
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (!/^-?\d+$/.test(token)) {
      return { ok: false, error: `non-integer at position ${index + 1}` }
    }
    const parsed = Number.parseInt(token, 10)
    if (!Number.isSafeInteger(parsed)) {
      return { ok: false, error: `non-integer at position ${index + 1}` }
    }

    if (constraints.mode === 'comparison') {
      values.push(parsed)
      continue
    }

    if (parsed < 0) {
      return { ok: false, error: `non-negative required at position ${index + 1}` }
    }

    const cap =
      constraints.mode === 'counting' ? MAX_COUNTING_SORT_VALUE : MAX_RADIX_SORT_VALUE
    if (parsed > cap) {
      return { ok: false, error: `value ${parsed} exceeds limit ${cap}` }
    }

    values.push(parsed)
  }

  return { ok: true, values }
}

export type { ConstraintMode, Constraints, ParseResult }
export { parseSortDataset }
