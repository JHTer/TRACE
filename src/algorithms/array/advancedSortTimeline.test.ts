import { describe, expect, it } from 'vitest'

import {
  MAX_COUNTING_SORT_VALUE,
  MAX_RADIX_SORT_VALUE,
} from '../../domain/algorithms/topic02SortLimits.ts'
import {
  createAdvancedLineEvents,
  createAdvancedSortTimeline,
  getAdvancedFrameByLineEvent,
  heapModeOptions,
} from './advancedSortTimeline.ts'

const toValues = (values: readonly { value: number }[]) => values.map((item) => item.value)

const isSortedAscending = (values: readonly number[]) =>
  values.every((value, index) => index === 0 || values[index - 1] <= value)

const getLastFrame = <T,>(frames: readonly T[]): T | undefined =>
  frames[frames.length - 1]

describe('advancedSortTimeline', () => {
  it('heapsort sort-trace ends sorted ascending and preserves multiset', () => {
    const input = [7, 1, 7, 3, 0, 9, 4]
    const timeline = createAdvancedSortTimeline({
      algorithmId: 'heapsort',
      values: input,
      heapMode: 'sort-trace',
      radixBase: 10,
    })

    const finalFrame = timeline.frames[timeline.frames.length - 1]
    expect(finalFrame).toBeDefined()

    const resultValues = toValues(finalFrame?.items ?? [])
    expect(isSortedAscending(resultValues)).toBe(true)

    const expected = [...input].sort((left, right) => left - right)
    expect(resultValues).toEqual(expected)
  })

  it('heapsort sort-trace heap boundary shrinks monotonically', () => {
    const timeline = createAdvancedSortTimeline({
      algorithmId: 'heapsort',
      values: [9, 2, 8, 1, 6, 3],
      heapMode: 'sort-trace',
      radixBase: 10,
    })

    const heapSizes = timeline.frames
      .map((frame) => frame.heapState?.heapSize)
      .filter((value): value is number => value !== undefined)

    for (let index = 1; index < heapSizes.length; index += 1) {
      expect(heapSizes[index]).toBeLessThanOrEqual(heapSizes[index - 1])
    }
  })

  it('heap operation modes produce deterministic and expected shape changes', () => {
    const values = [9, 3, 6, 1, 8, 2]

    const insertTimeline = createAdvancedSortTimeline({
      algorithmId: 'heapsort',
      values,
      heapMode: 'insert',
      radixBase: 10,
    })

    const deleteTimeline = createAdvancedSortTimeline({
      algorithmId: 'heapsort',
      values,
      heapMode: 'delete-max',
      radixBase: 10,
    })

    const riseTimeline = createAdvancedSortTimeline({
      algorithmId: 'heapsort',
      values,
      heapMode: 'rise',
      radixBase: 10,
    })

    const fallTimeline = createAdvancedSortTimeline({
      algorithmId: 'heapsort',
      values,
      heapMode: 'fall',
      radixBase: 10,
    })

    expect(getLastFrame(insertTimeline.frames)?.items.length).toBe(values.length + 1)
    expect(getLastFrame(deleteTimeline.frames)?.items.length).toBe(values.length - 1)
    expect(getLastFrame(riseTimeline.frames)?.heapState?.insertedValue).not.toBeNull()
    expect(getLastFrame(fallTimeline.frames)?.heapState?.heapSize).toBe(values.length)
  })

  it('counting sort output is sorted and stable for duplicates', () => {
    const input = [4, 2, 4, 1, 3, 2, 4]
    const timeline = createAdvancedSortTimeline({
      algorithmId: 'counting-sort',
      values: input,
      heapMode: 'sort-trace',
      radixBase: 10,
    })

    const finalFrame = getLastFrame(timeline.frames)
    expect(finalFrame).toBeDefined()

    const resultItems = finalFrame?.items ?? []
    const resultValues = resultItems.map((item: { value: number }) => item.value)
    expect(isSortedAscending(resultValues)).toBe(true)

    const byValue = new Map<number, number[]>()
    resultItems.forEach((item: { value: number; initialIndex: number }) => {
      const current = byValue.get(item.value) ?? []
      byValue.set(item.value, [...current, item.initialIndex])
    })

    byValue.forEach((indices) => {
      expect(indices).toEqual([...indices].sort((left, right) => left - right))
    })
  })

  it('counting sort and radix sort reject negative values', () => {
    const input = [3, -1, 2]

    const countingTimeline = createAdvancedSortTimeline({
      algorithmId: 'counting-sort',
      values: input,
      heapMode: 'sort-trace',
      radixBase: 10,
    })

    const radixTimeline = createAdvancedSortTimeline({
      algorithmId: 'radix-sort',
      values: input,
      heapMode: 'sort-trace',
      radixBase: 2,
    })

    expect(countingTimeline.validationError).toMatch(/non-negative/)
    expect(radixTimeline.validationError).toMatch(/non-negative/)
    expect(countingTimeline.frames).toHaveLength(1)
    expect(radixTimeline.frames).toHaveLength(1)
  })

  it('counting sort rejects values above the configured max bucket cap', () => {
    const input = [0, MAX_COUNTING_SORT_VALUE + 1]

    const timeline = createAdvancedSortTimeline({
      algorithmId: 'counting-sort',
      values: input,
      heapMode: 'sort-trace',
      radixBase: 10,
    })

    expect(timeline.validationError).toMatch(/exceeds limit/i)
    expect(timeline.frames).toHaveLength(1)
  })

  it('radix sort rejects values above the configured max input cap', () => {
    const input = [0, MAX_RADIX_SORT_VALUE + 1]

    const timeline = createAdvancedSortTimeline({
      algorithmId: 'radix-sort',
      values: input,
      heapMode: 'sort-trace',
      radixBase: 10,
    })

    expect(timeline.validationError).toMatch(/exceeds limit/i)
    expect(timeline.frames).toHaveLength(1)
  })

  it('counting sort and radix sort reject non-integer values', () => {
    const input = [3, 2.5, 1]

    const countingTimeline = createAdvancedSortTimeline({
      algorithmId: 'counting-sort',
      values: input,
      heapMode: 'sort-trace',
      radixBase: 10,
    })

    const radixTimeline = createAdvancedSortTimeline({
      algorithmId: 'radix-sort',
      values: input,
      heapMode: 'sort-trace',
      radixBase: 2,
    })

    expect(countingTimeline.validationError).toMatch(/integer/i)
    expect(radixTimeline.validationError).toMatch(/integer/i)
    expect(countingTimeline.frames).toHaveLength(1)
    expect(radixTimeline.frames).toHaveLength(1)
  })

  it('radix sort base 2 and base 10 produce same sorted output', () => {
    const values = [14, 3, 9, 1, 25, 17, 8]

    const base2Timeline = createAdvancedSortTimeline({
      algorithmId: 'radix-sort',
      values,
      heapMode: 'sort-trace',
      radixBase: 2,
    })

    const base10Timeline = createAdvancedSortTimeline({
      algorithmId: 'radix-sort',
      values,
      heapMode: 'sort-trace',
      radixBase: 10,
    })

    const base2Values = toValues(getLastFrame(base2Timeline.frames)?.items ?? [])
    const base10Values = toValues(getLastFrame(base10Timeline.frames)?.items ?? [])

    expect(base2Values).toEqual(base10Values)
    expect(isSortedAscending(base2Values)).toBe(true)
  })

  it('line-event mapping resolves to valid frame indices for all advanced timelines', () => {
    const values = [6, 2, 9, 1, 5, 3]

    const timelines = [
      ...heapModeOptions.map((option) =>
        createAdvancedSortTimeline({
          algorithmId: 'heapsort',
          values,
          heapMode: option.id,
          radixBase: 10,
        }),
      ),
      createAdvancedSortTimeline({
        algorithmId: 'counting-sort',
        values,
        heapMode: 'sort-trace',
        radixBase: 10,
      }),
      createAdvancedSortTimeline({
        algorithmId: 'radix-sort',
        values,
        heapMode: 'sort-trace',
        radixBase: 2,
      }),
      createAdvancedSortTimeline({
        algorithmId: 'radix-sort',
        values,
        heapMode: 'sort-trace',
        radixBase: 10,
      }),
    ]

    timelines.forEach((timeline) => {
      const lineEvents = createAdvancedLineEvents(timeline.frames)
      if (lineEvents.length === 0) {
        expect(timeline.frames.length).toBeGreaterThan(0)
        return
      }

      lineEvents.forEach((_, lineEventIndex) => {
        const frame = getAdvancedFrameByLineEvent(timeline, lineEvents, lineEventIndex)
        expect(timeline.frames.includes(frame)).toBe(true)
      })
    })
  })
})
