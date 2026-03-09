import type {
  ElementarySortAlgorithmId,
  LineEvent,
  SortComplexityProfile,
  SortCounters,
  SortFrame,
  SortPointers,
  SortPreset,
  SortPseudocodeLine,
  SortRegion,
  SortSpaceProfile,
  SortTimeline,
  SortValueItem,
} from '../../domain/algorithms/types.ts'

const elementarySortPresets: readonly SortPreset[] = [
  {
    id: 'random',
    label: 'Random',
    values: [8, 3, 6, 1, 9, 2, 7, 4],
  },
  {
    id: 'already-sorted',
    label: 'Already Sorted',
    values: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 'reverse',
    label: 'Reverse',
    values: [8, 7, 6, 5, 4, 3, 2, 1],
  },
  {
    id: 'with-duplicates',
    label: 'With Duplicates',
    values: [5, 3, 5, 1, 3, 7, 2, 7],
  },
] as const

const algorithmTitles: Record<ElementarySortAlgorithmId, string> = {
  'bubble-sort': 'Bubble Sort',
  'selection-sort': 'Selection Sort',
  'insertion-sort': 'Insertion Sort',
}

const pseudocodeByAlgorithm: Record<
  ElementarySortAlgorithmId,
  readonly SortPseudocodeLine[]
> = {
  'bubble-sort': [
    { lineNumber: 1, text: 'for i <- 0 to n - 2:' },
    { lineNumber: 2, text: '    swapped <- false' },
    { lineNumber: 3, text: '    for j <- 0 to n - 2 - i:' },
    { lineNumber: 4, text: '        if A[j] > A[j + 1]:' },
    { lineNumber: 5, text: '            swap(A[j], A[j + 1])' },
    { lineNumber: 6, text: '            swapped <- true' },
    { lineNumber: 7, text: '    if not swapped: break' },
  ],
  'selection-sort': [
    { lineNumber: 1, text: 'for i <- 0 to n - 2:' },
    { lineNumber: 2, text: '    min <- i' },
    { lineNumber: 3, text: '    for j <- i + 1 to n - 1:' },
    { lineNumber: 4, text: '        if A[j] < A[min]:' },
    { lineNumber: 5, text: '            min <- j' },
    { lineNumber: 6, text: '    if min != i:' },
    { lineNumber: 7, text: '        swap(A[i], A[min])' },
  ],
  'insertion-sort': [
    { lineNumber: 1, text: 'for i <- 1 to n - 1:' },
    { lineNumber: 2, text: '    key <- A[i]' },
    { lineNumber: 3, text: '    j <- i - 1' },
    { lineNumber: 4, text: '    while j >= 0 and A[j] > key:' },
    { lineNumber: 5, text: '        A[j + 1] <- A[j]' },
    { lineNumber: 6, text: '        j <- j - 1' },
    { lineNumber: 7, text: '    A[j + 1] <- key' },
  ],
}

const complexityByAlgorithm: Record<
  ElementarySortAlgorithmId,
  SortComplexityProfile
> = {
  'bubble-sort': {
    best: 'O(n)',
    average: 'O(n^2)',
    worst: 'O(n^2)',
    auxiliary: 'O(1)',
    stable: true,
    inPlace: true,
  },
  'selection-sort': {
    best: 'O(n^2)',
    average: 'O(n^2)',
    worst: 'O(n^2)',
    auxiliary: 'O(1)',
    stable: false,
    inPlace: true,
  },
  'insertion-sort': {
    best: 'O(n)',
    average: 'O(n^2)',
    worst: 'O(n^2)',
    auxiliary: 'O(1)',
    stable: true,
    inPlace: true,
  },
}

const defaultSpaceProfile: SortSpaceProfile = {
  inputStorage: 'O(n) input array',
  workingStorage: 'O(1) scalar variables',
  auxiliaryStorage: 'O(1) no auxiliary array',
}

const createValueItems = (values: readonly number[]): SortValueItem[] =>
  values.map((value, index) => ({
    id: `item-${index}`,
    value,
    initialIndex: index,
  }))

const createCounters = (): SortCounters => ({
  comparisons: 0,
  writes: 0,
  swaps: 0,
  passes: 0,
})

const cloneItems = (items: readonly SortValueItem[]): readonly SortValueItem[] => [...items]

const cloneCounters = (counters: SortCounters): SortCounters => ({ ...counters })

const clonePointers = (pointers: SortPointers): SortPointers => ({ ...pointers })

const createRegion = (start: number, end: number): SortRegion | null =>
  start <= end ? { start, end } : null

const createFrame = (
  items: readonly SortValueItem[],
  executedLines: readonly number[],
  pointers: SortPointers,
  activeIndices: readonly number[],
  sortedRegion: SortRegion | null,
  operationText: string,
  counters: SortCounters,
): SortFrame => ({
  items: cloneItems(items),
  executedLines: [...executedLines],
  pointers: clonePointers(pointers),
  activeIndices: [...activeIndices],
  sortedRegion,
  operationText,
  counters: cloneCounters(counters),
})

const createInitialFrame = (
  items: readonly SortValueItem[],
  counters: SortCounters,
): SortFrame =>
  createFrame(
    items,
    [],
    {},
    [],
    null,
    'initial dataset loaded',
    counters,
  )

const buildBubbleSortFrames = (values: readonly number[]): readonly SortFrame[] => {
  const items = createValueItems(values)
  const counters = createCounters()
  const frames: SortFrame[] = [createInitialFrame(items, counters)]
  const n = items.length

  const getSortedSuffix = () =>
    counters.passes > 0 ? createRegion(n - counters.passes, n - 1) : null

  for (let i = 0; i < n - 1; i += 1) {
    frames.push(
      createFrame(
        items,
        [1],
        { i },
        [i],
        getSortedSuffix(),
        `start outer pass i=${i}`,
        counters,
      ),
    )

    let swapped = false
    frames.push(
      createFrame(
        items,
        [2],
        { i },
        [i],
        getSortedSuffix(),
        'swapped <- false',
        counters,
      ),
    )

    for (let j = 0; j < n - 1 - i; j += 1) {
      frames.push(
        createFrame(
          items,
          [3],
          { i, j },
          [j, j + 1],
          getSortedSuffix(),
          `scan adjacent pair at j=${j}`,
          counters,
        ),
      )

      const leftItem = items[j]
      const rightItem = items[j + 1]

      if (leftItem === undefined || rightItem === undefined) {
        continue
      }

      counters.comparisons += 1
      const shouldSwap = leftItem.value > rightItem.value

      frames.push(
        createFrame(
          items,
          [4],
          { i, j },
          [j, j + 1],
          getSortedSuffix(),
          `compare A[${j}]=${leftItem.value} with A[${j + 1}]=${rightItem.value}`,
          counters,
        ),
      )

      if (!shouldSwap) {
        continue
      }

      items[j] = rightItem
      items[j + 1] = leftItem
      counters.swaps += 1
      counters.writes += 2

      frames.push(
        createFrame(
          items,
          [5],
          { i, j },
          [j, j + 1],
          getSortedSuffix(),
          `swap A[${j}] with A[${j + 1}]`,
          counters,
        ),
      )

      swapped = true
      frames.push(
        createFrame(
          items,
          [6],
          { i, j },
          [j, j + 1],
          getSortedSuffix(),
          'swapped <- true',
          counters,
        ),
      )
    }

    counters.passes += 1

    if (!swapped) {
      frames.push(
        createFrame(
          items,
          [7],
          { i },
          [],
          createRegion(0, n - 1),
          'no swap in this pass, terminate early',
          counters,
        ),
      )
      break
    }

    frames.push(
      createFrame(
        items,
        [7],
        { i },
        [],
        getSortedSuffix(),
        'pass complete, continue next outer pass',
        counters,
      ),
    )
  }

  return frames
}

const buildSelectionSortFrames = (values: readonly number[]): readonly SortFrame[] => {
  const items = createValueItems(values)
  const counters = createCounters()
  const frames: SortFrame[] = [createInitialFrame(items, counters)]
  const n = items.length

  const getSortedPrefix = () =>
    counters.passes > 0 ? createRegion(0, counters.passes - 1) : null

  for (let i = 0; i < n - 1; i += 1) {
    frames.push(
      createFrame(
        items,
        [1],
        { i },
        [i],
        getSortedPrefix(),
        `start outer pass i=${i}`,
        counters,
      ),
    )

    let minIndex = i
    frames.push(
      createFrame(
        items,
        [2],
        { i, minIndex },
        [minIndex],
        getSortedPrefix(),
        `initialize min <- ${minIndex}`,
        counters,
      ),
    )

    for (let j = i + 1; j < n; j += 1) {
      frames.push(
        createFrame(
          items,
          [3],
          { i, j, minIndex },
          [j, minIndex],
          getSortedPrefix(),
          `scan candidate at j=${j}`,
          counters,
        ),
      )

      const currentMinItem = items[minIndex]
      const candidateItem = items[j]

      if (currentMinItem === undefined || candidateItem === undefined) {
        continue
      }

      counters.comparisons += 1
      const shouldUpdateMin = candidateItem.value < currentMinItem.value

      frames.push(
        createFrame(
          items,
          [4],
          { i, j, minIndex },
          [j, minIndex],
          getSortedPrefix(),
          `compare A[${j}]=${candidateItem.value} with A[min]=${currentMinItem.value}`,
          counters,
        ),
      )

      if (!shouldUpdateMin) {
        continue
      }

      minIndex = j
      frames.push(
        createFrame(
          items,
          [5],
          { i, j, minIndex },
          [minIndex],
          getSortedPrefix(),
          `update min <- ${minIndex}`,
          counters,
        ),
      )
    }

    const shouldSwap = minIndex !== i
    frames.push(
      createFrame(
        items,
        [6],
        { i, minIndex },
        [i, minIndex],
        getSortedPrefix(),
        shouldSwap
          ? `min (${minIndex}) differs from i (${i}), perform swap`
          : `min equals i (${i}), keep current position`,
        counters,
      ),
    )

    if (shouldSwap) {
      const leftItem = items[i]
      const rightItem = items[minIndex]
      if (leftItem !== undefined && rightItem !== undefined) {
        items[i] = rightItem
        items[minIndex] = leftItem
      }
      counters.swaps += 1
      counters.writes += 2
    }

    counters.passes += 1

    if (shouldSwap) {
      frames.push(
        createFrame(
          items,
          [7],
          { i, minIndex },
          [i, minIndex],
          getSortedPrefix(),
          `swap A[${i}] with A[${minIndex}]`,
          counters,
        ),
      )
    }
  }

  return frames
}

const buildInsertionSortFrames = (values: readonly number[]): readonly SortFrame[] => {
  const items = createValueItems(values)
  const counters = createCounters()
  const frames: SortFrame[] = [createInitialFrame(items, counters)]
  const n = items.length

  const getSortedPrefix = () =>
    counters.passes > 0 ? createRegion(0, counters.passes) : null

  for (let i = 1; i < n; i += 1) {
    frames.push(
      createFrame(
        items,
        [1],
        { i },
        [i],
        getSortedPrefix(),
        `start insertion pass i=${i}`,
        counters,
      ),
    )

    let keyIndex = i
    const keyItem = items[keyIndex]
    const keyValue = keyItem?.value ?? Number.NaN

    frames.push(
      createFrame(
        items,
        [2],
        { i, keyIndex },
        [keyIndex],
        getSortedPrefix(),
        `key <- A[${i}] = ${keyValue}`,
        counters,
      ),
    )

    let j = keyIndex - 1
    frames.push(
      createFrame(
        items,
        [3],
        { i, j, keyIndex },
        j >= 0 ? [j, keyIndex] : [keyIndex],
        getSortedPrefix(),
        `j <- ${j}`,
        counters,
      ),
    )

    while (true) {
      const leftItem = j >= 0 ? items[j] : undefined
      const currentKeyItem = items[keyIndex]
      const canCompareValue = leftItem !== undefined && currentKeyItem !== undefined
      const shouldShift =
        canCompareValue && leftItem.value > currentKeyItem.value

      if (canCompareValue) {
        counters.comparisons += 1
      }

      frames.push(
        createFrame(
          items,
          [4],
          { i, j, keyIndex },
          j >= 0 ? [j, keyIndex] : [keyIndex],
          getSortedPrefix(),
          shouldShift
            ? `A[${j}] > key, continue shifting`
            : 'while condition fails, stop shifting',
          counters,
        ),
      )

      if (!shouldShift || leftItem === undefined || currentKeyItem === undefined) {
        break
      }

      items[j] = currentKeyItem
      items[keyIndex] = leftItem
      keyIndex -= 1
      counters.writes += 1

      frames.push(
        createFrame(
          items,
          [5],
          { i, j, keyIndex },
          [keyIndex, keyIndex + 1],
          getSortedPrefix(),
          `shift key left to index ${keyIndex}`,
          counters,
        ),
      )

      j -= 1
      frames.push(
        createFrame(
          items,
          [6],
          { i, j, keyIndex },
          j >= 0 ? [j, keyIndex] : [keyIndex],
          getSortedPrefix(),
          `j <- ${j}`,
          counters,
        ),
      )
    }

    counters.writes += 1
    counters.passes += 1

    frames.push(
      createFrame(
        items,
        [7],
        { i, j, keyIndex },
        [keyIndex],
        getSortedPrefix(),
        `insert key at index ${keyIndex}`,
        counters,
      ),
    )
  }

  return frames
}

const createElementarySortTimeline = (
  algorithmId: ElementarySortAlgorithmId,
  values: readonly number[],
): SortTimeline => {
  const frames =
    algorithmId === 'bubble-sort'
      ? buildBubbleSortFrames(values)
      : algorithmId === 'selection-sort'
        ? buildSelectionSortFrames(values)
        : buildInsertionSortFrames(values)

  return {
    algorithmId,
    title: algorithmTitles[algorithmId],
    pseudocodeLines: pseudocodeByAlgorithm[algorithmId],
    frames,
    complexityProfile: complexityByAlgorithm[algorithmId],
    spaceProfile: defaultSpaceProfile,
  }
}

const createLineEvents = (frames: readonly SortFrame[]): readonly LineEvent[] =>
  frames.flatMap((frame, frameIndex) =>
    frame.executedLines.map((lineNumber) => ({
      frameIndex,
      lineNumber,
    })),
  )

const getFrameByLineEvent = (
  timeline: SortTimeline,
  lineEvents: readonly LineEvent[],
  lineEventIndex: number,
): SortFrame => {
  if (timeline.frames.length === 0) {
    return createInitialFrame([], createCounters())
  }

  if (lineEvents.length === 0) {
    return timeline.frames[0] ?? createInitialFrame([], createCounters())
  }

  const boundedIndex = Math.max(0, Math.min(lineEventIndex, lineEvents.length - 1))
  const activeEvent = lineEvents[boundedIndex]
  const frameIndex = activeEvent?.frameIndex ?? 0

  return timeline.frames[frameIndex] ?? timeline.frames[0] ?? createInitialFrame([], createCounters())
}

export {
  createElementarySortTimeline,
  createLineEvents,
  elementarySortPresets,
  getFrameByLineEvent,
}
