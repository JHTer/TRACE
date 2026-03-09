import type {
  AdvancedSortFrame,
  AdvancedSortTimeline,
  HeapInstructionModeId,
  HeapModeOption,
  LineEvent,
  RadixBase,
  RadixBaseOption,
  SortComplexityProfile,
  SortPreset,
  SortPseudocodeLine,
  SortSpaceProfile,
  SortValueItem,
  Topic02AdvancedSortAlgorithmId,
} from '../../domain/algorithms/types.ts'

type BuildTimelineParams = Readonly<{
  algorithmId: Topic02AdvancedSortAlgorithmId
  values: readonly number[]
  heapMode: HeapInstructionModeId
  radixBase: RadixBase
}>

type MutableCounters = {
  comparisons: number
  writes: number
  swaps: number
  passes: number
  bucketWrites: number
}

const advancedSortPresets: readonly SortPreset[] = [
  {
    id: 'random',
    label: 'Random',
    values: [9, 3, 6, 1, 8, 2, 7, 4],
  },
  {
    id: 'already-sorted',
    label: 'Already Sorted',
    values: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'reverse',
    label: 'Reverse',
    values: [9, 8, 7, 6, 5, 4, 3, 2],
  },
  {
    id: 'with-duplicates',
    label: 'With Duplicates',
    values: [4, 2, 4, 1, 3, 2, 0, 3],
  },
] as const

const radixSortPresets: readonly SortPreset[] = [
  {
    id: 'random',
    label: 'Random (3-Digit)',
    values: [329, 457, 657, 839, 436, 720, 355, 101],
  },
  {
    id: 'already-sorted',
    label: 'Already Sorted (3-Digit)',
    values: [101, 124, 237, 349, 456, 578, 689, 790],
  },
  {
    id: 'reverse',
    label: 'Reverse (3-Digit)',
    values: [987, 876, 765, 654, 543, 432, 321, 210],
  },
  {
    id: 'with-duplicates',
    label: 'With Duplicates (3-Digit)',
    values: [305, 112, 305, 248, 112, 487, 248, 563],
  },
] as const

const advancedSortPresetsByAlgorithm: Readonly<
  Record<Topic02AdvancedSortAlgorithmId, readonly SortPreset[]>
> = {
  heapsort: advancedSortPresets,
  'counting-sort': advancedSortPresets,
  'radix-sort': radixSortPresets,
}

const heapModeOptions: readonly HeapModeOption[] = [
  { id: 'sort-trace', label: 'Sort Trace' },
  { id: 'build-heap', label: 'Build Heap' },
  { id: 'insert', label: 'Insert' },
  { id: 'delete-max', label: 'Delete Max' },
  { id: 'rise', label: 'Rise' },
  { id: 'fall', label: 'Fall' },
] as const

const radixBaseOptions: readonly RadixBaseOption[] = [
  { id: 10, label: 'Base 10' },
  { id: 2, label: 'Base 2' },
] as const

const heapModeLabel: Record<HeapInstructionModeId, string> = {
  'sort-trace': 'Sort Trace',
  'build-heap': 'Build Heap',
  insert: 'Insert',
  'delete-max': 'Delete Max',
  rise: 'Rise',
  fall: 'Fall',
}

const heapPseudocodeByMode: Record<HeapInstructionModeId, readonly SortPseudocodeLine[]> = {
  'sort-trace': [
    { lineNumber: 1, text: 'buildMaxHeap(A)' },
    { lineNumber: 2, text: 'for end <- n - 1 down to 1:' },
    { lineNumber: 3, text: '    swap(A[0], A[end])' },
    { lineNumber: 4, text: '    heapSize <- end' },
    { lineNumber: 5, text: '    siftDown(A, 0, heapSize)' },
    { lineNumber: 6, text: 'siftDown(A, i, heapSize):' },
    { lineNumber: 7, text: '    child <- largerChild(i)' },
    { lineNumber: 8, text: '    if A[i] < A[child]: swap and continue' },
  ],
  'build-heap': [
    { lineNumber: 1, text: 'for i <- floor(n / 2) - 1 down to 0:' },
    { lineNumber: 2, text: '    siftDown(A, i, n)' },
    { lineNumber: 3, text: '    child <- largerChild(i)' },
    { lineNumber: 4, text: '    if A[i] < A[child]: swap and continue' },
    { lineNumber: 5, text: 'heap construction complete' },
  ],
  insert: [
    { lineNumber: 1, text: 'append value x to heap tail' },
    { lineNumber: 2, text: 'i <- tail index' },
    { lineNumber: 3, text: 'while i > 0 and A[parent(i)] < A[i]:' },
    { lineNumber: 4, text: '    swap(A[parent(i)], A[i]); i <- parent(i)' },
    { lineNumber: 5, text: 'insert complete' },
  ],
  'delete-max': [
    { lineNumber: 1, text: 'max <- A[0]' },
    { lineNumber: 2, text: 'swap(A[0], A[last]); remove tail' },
    { lineNumber: 3, text: 'heapSize <- heapSize - 1' },
    { lineNumber: 4, text: 'siftDown(A, 0, heapSize)' },
    { lineNumber: 5, text: 'return max' },
  ],
  rise: [
    { lineNumber: 1, text: 'i <- index of rising node' },
    { lineNumber: 2, text: 'while i > 0 and A[parent(i)] < A[i]:' },
    { lineNumber: 3, text: '    swap(A[parent(i)], A[i])' },
    { lineNumber: 4, text: '    i <- parent(i)' },
    { lineNumber: 5, text: 'rise complete' },
  ],
  fall: [
    { lineNumber: 1, text: 'i <- root after key drop' },
    { lineNumber: 2, text: 'while i has child:' },
    { lineNumber: 3, text: '    child <- largerChild(i)' },
    { lineNumber: 4, text: '    if A[i] < A[child]: swap and continue' },
    { lineNumber: 5, text: 'fall complete' },
  ],
}

const countingPseudocodeLines: readonly SortPseudocodeLine[] = [
  { lineNumber: 1, text: 'for each x in A: count[x] <- count[x] + 1' },
  { lineNumber: 2, text: 'for v <- 1 to k: count[v] <- count[v] + count[v - 1]' },
  { lineNumber: 3, text: 'for i <- n - 1 down to 0:' },
  { lineNumber: 4, text: '    output[count[A[i]] - 1] <- A[i]; count[A[i]]--' },
  { lineNumber: 5, text: 'copy output into A (stable order preserved)' },
]

const radixPseudocodeLines: readonly SortPseudocodeLine[] = [
  { lineNumber: 1, text: 'exp <- 1; while max(A) / exp > 0:' },
  { lineNumber: 2, text: '    count digits for current exp (base b)' },
  { lineNumber: 3, text: '    prefix counts to positions' },
  { lineNumber: 4, text: '    stable place from right to left into output' },
  { lineNumber: 5, text: '    copy output to A; exp <- exp * b' },
]

const heapsortComplexityByMode: Record<HeapInstructionModeId, SortComplexityProfile> = {
  'sort-trace': {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    auxiliary: 'O(1)',
    stable: false,
    inPlace: true,
  },
  'build-heap': {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    auxiliary: 'O(1)',
    stable: false,
    inPlace: true,
  },
  insert: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    auxiliary: 'O(1)',
    stable: false,
    inPlace: true,
  },
  'delete-max': {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
    auxiliary: 'O(1)',
    stable: false,
    inPlace: true,
  },
  rise: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    auxiliary: 'O(1)',
    stable: false,
    inPlace: true,
  },
  fall: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    auxiliary: 'O(1)',
    stable: false,
    inPlace: true,
  },
}

const heapsortSpaceByMode: Record<HeapInstructionModeId, SortSpaceProfile> = {
  'sort-trace': {
    inputStorage: 'O(n) array-backed heap',
    workingStorage: 'O(1) index variables',
    auxiliaryStorage: 'O(1) in-place heap operations',
  },
  'build-heap': {
    inputStorage: 'O(n) array-backed heap',
    workingStorage: 'O(1) index variables',
    auxiliaryStorage: 'O(1) in-place heapify',
  },
  insert: {
    inputStorage: 'O(n) heap array',
    workingStorage: 'O(1) parent/child indices',
    auxiliaryStorage: 'O(1) rise operation',
  },
  'delete-max': {
    inputStorage: 'O(n) heap array',
    workingStorage: 'O(1) parent/child indices',
    auxiliaryStorage: 'O(1) fall operation',
  },
  rise: {
    inputStorage: 'O(n) heap array',
    workingStorage: 'O(1) parent index tracking',
    auxiliaryStorage: 'O(1) upward swaps',
  },
  fall: {
    inputStorage: 'O(n) heap array',
    workingStorage: 'O(1) child index tracking',
    auxiliaryStorage: 'O(1) downward swaps',
  },
}

const countingComplexity: SortComplexityProfile = {
  best: 'O(n + k)',
  average: 'O(n + k)',
  worst: 'O(n + k)',
  auxiliary: 'O(n + k)',
  stable: true,
  inPlace: false,
}

const countingSpace: SortSpaceProfile = {
  inputStorage: 'O(n) input array',
  workingStorage: 'O(k) counting and prefix arrays',
  auxiliaryStorage: 'O(n) output array (stable placement)',
}

const radixComplexity: SortComplexityProfile = {
  best: 'O(d * (n + b))',
  average: 'O(d * (n + b))',
  worst: 'O(d * (n + b))',
  auxiliary: 'O(n + b)',
  stable: true,
  inPlace: false,
}

const radixSpace: SortSpaceProfile = {
  inputStorage: 'O(n) input array',
  workingStorage: 'O(b) digit counting array',
  auxiliaryStorage: 'O(n) stable output array per pass',
}

const createValueItems = (values: readonly number[]): SortValueItem[] =>
  values.map((value, index) => ({
    id: `item-${index}`,
    value,
    initialIndex: index,
  }))

const createCounters = (): MutableCounters => ({
  comparisons: 0,
  writes: 0,
  swaps: 0,
  passes: 0,
  bucketWrites: 0,
})

const cloneItems = (items: readonly SortValueItem[]): readonly SortValueItem[] => [...items]

const cloneCounters = (counters: MutableCounters) => ({ ...counters })

const cloneNumberArray = (values: readonly number[]): readonly number[] => [...values]

const cloneNullableItems = (
  values: readonly (SortValueItem | null)[],
): readonly (SortValueItem | null)[] => [...values]

const toEmptyAdvancedFrame = (): AdvancedSortFrame => ({
  items: [],
  executedLines: [],
  operationText: 'no frame',
  activeIndices: [],
  counters: createCounters(),
  heapState: null,
  countingState: null,
  radixState: null,
})

const addFrameFactory = (
  frames: AdvancedSortFrame[],
  items: SortValueItem[],
  counters: MutableCounters,
) =>
  ({
    executedLines,
    operationText,
    activeIndices = [],
    heapState = null,
    countingState = null,
    radixState = null,
  }: {
    executedLines: readonly number[]
    operationText: string
    activeIndices?: readonly number[]
    heapState?: AdvancedSortFrame['heapState']
    countingState?: AdvancedSortFrame['countingState']
    radixState?: AdvancedSortFrame['radixState']
  }) => {
    frames.push({
      items: cloneItems(items),
      executedLines: [...executedLines],
      operationText,
      activeIndices: [...activeIndices],
      counters: cloneCounters(counters),
      heapState,
      countingState,
      radixState,
    })
  }

const parentIndex = (index: number) => Math.floor((index - 1) / 2)

const createSiftDown = (
  items: SortValueItem[],
  counters: MutableCounters,
  addFrame: ReturnType<typeof addFrameFactory>,
  mode: HeapInstructionModeId,
  lines: Readonly<{ compare: number; swap: number }>,
) =>
  (startIndex: number, heapSize: number, linePrefixText: string) => {
    let index = startIndex

    while (true) {
      const left = index * 2 + 1
      const right = left + 1

      if (left >= heapSize) {
        break
      }

      let largest = index
      const largestItemBefore = items[largest]
      const leftItem = items[left]

      if (largestItemBefore === undefined || leftItem === undefined) {
        break
      }

      counters.comparisons += 1
      addFrame({
        executedLines: [lines.compare],
        operationText: `${linePrefixText}: compare parent @${largest} with child @${left}`,
        activeIndices: [largest, left],
        heapState: {
          mode,
          heapSize,
          comparePair: [largest, left],
          swapPair: [],
          insertedValue: null,
          removedValue: null,
        },
      })

      if (leftItem.value > largestItemBefore.value) {
        largest = left
      }

      const largestItemAfterLeft = items[largest]
      const rightItem = items[right]

      if (right < heapSize && largestItemAfterLeft !== undefined && rightItem !== undefined) {
        counters.comparisons += 1
        addFrame({
          executedLines: [lines.compare],
          operationText: `${linePrefixText}: compare current best @${largest} with child @${right}`,
          activeIndices: [largest, right],
          heapState: {
            mode,
            heapSize,
            comparePair: [largest, right],
            swapPair: [],
            insertedValue: null,
            removedValue: null,
          },
        })

        if (rightItem.value > largestItemAfterLeft.value) {
          largest = right
        }
      }

      if (largest === index) {
        break
      }

      const current = items[index]
      const promoted = items[largest]

      if (current === undefined || promoted === undefined) {
        break
      }

      items[index] = promoted
      items[largest] = current
      counters.swaps += 1
      counters.writes += 2

      addFrame({
        executedLines: [lines.swap],
        operationText: `${linePrefixText}: swap @${index} with @${largest}`,
        activeIndices: [index, largest],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [index, largest],
          insertedValue: null,
          removedValue: null,
        },
      })

      index = largest
    }
  }

const buildHeapTimeline = (
  mode: HeapInstructionModeId,
  values: readonly number[],
): AdvancedSortTimeline => {
  const items = createValueItems(values)
  const counters = createCounters()
  const frames: AdvancedSortFrame[] = []
  const addFrame = addFrameFactory(frames, items, counters)
  let heapSize = items.length

  const siftDownBuild = createSiftDown(items, counters, addFrame, mode, {
    compare: mode === 'sort-trace' ? 7 : 3,
    swap: mode === 'sort-trace' ? 8 : 4,
  })

  const runBuildHeapFrames = (lineNumber: number) => {
    for (let index = Math.floor(heapSize / 2) - 1; index >= 0; index -= 1) {
      addFrame({
        executedLines: [lineNumber],
        operationText: `heapify subtree rooted at index ${index}`,
        activeIndices: [index],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [],
          insertedValue: null,
          removedValue: null,
        },
      })

      siftDownBuild(index, heapSize, 'siftDown')
      counters.passes += 1
    }
  }

  addFrame({
    executedLines: [],
    operationText: 'initial dataset loaded',
    heapState: {
      mode,
      heapSize,
      comparePair: [],
      swapPair: [],
      insertedValue: null,
      removedValue: null,
    },
  })

  if (mode === 'build-heap') {
    runBuildHeapFrames(1)
    addFrame({
      executedLines: [5],
      operationText: 'max-heap construction complete',
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue: null,
        removedValue: null,
      },
    })

    return {
      algorithmId: 'heapsort',
      title: `Heapsort (${heapModeLabel[mode]})`,
      pseudocodeLines: heapPseudocodeByMode[mode],
      frames,
      complexityProfile: heapsortComplexityByMode[mode],
      spaceProfile: heapsortSpaceByMode[mode],
      validationError: null,
    }
  }

  if (mode === 'sort-trace') {
    addFrame({
      executedLines: [1],
      operationText: 'build max-heap phase',
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue: null,
        removedValue: null,
      },
    })

    runBuildHeapFrames(1)

    const siftDownSort = createSiftDown(items, counters, addFrame, mode, {
      compare: 7,
      swap: 8,
    })

    for (let end = items.length - 1; end > 0; end -= 1) {
      addFrame({
        executedLines: [2],
        operationText: `extract max to sorted suffix position ${end}`,
        activeIndices: [0, end],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [],
          insertedValue: null,
          removedValue: null,
        },
      })

      const root = items[0]
      const tail = items[end]
      if (root !== undefined && tail !== undefined) {
        items[0] = tail
        items[end] = root
        counters.swaps += 1
        counters.writes += 2
      }

      addFrame({
        executedLines: [3],
        operationText: `swap root with index ${end}`,
        activeIndices: [0, end],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [0, end],
          insertedValue: null,
          removedValue: root?.value ?? null,
        },
      })

      heapSize = end
      counters.passes += 1

      addFrame({
        executedLines: [4],
        operationText: `heap boundary shrinks to [0..${Math.max(0, heapSize - 1)}]`,
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [],
          insertedValue: null,
          removedValue: root?.value ?? null,
        },
      })

      addFrame({
        executedLines: [5],
        operationText: 'restore heap with siftDown from root',
        activeIndices: heapSize > 0 ? [0] : [],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [],
          insertedValue: null,
          removedValue: root?.value ?? null,
        },
      })

      siftDownSort(0, heapSize, 'siftDown')
    }

    addFrame({
      executedLines: [2],
      operationText: 'heapsort complete with ascending order',
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue: null,
        removedValue: null,
      },
    })

    return {
      algorithmId: 'heapsort',
      title: `Heapsort (${heapModeLabel[mode]})`,
      pseudocodeLines: heapPseudocodeByMode[mode],
      frames,
      complexityProfile: heapsortComplexityByMode[mode],
      spaceProfile: heapsortSpaceByMode[mode],
      validationError: null,
    }
  }

  runBuildHeapFrames(1)

  if (mode === 'insert') {
    const insertedValue = Math.max(...items.map((item) => item.value), 0) + 3
    items.push({
      id: `item-insert-${items.length}`,
      value: insertedValue,
      initialIndex: items.length,
    })
    heapSize = items.length
    counters.writes += 1

    addFrame({
      executedLines: [1],
      operationText: `append value ${insertedValue} at heap tail`,
      activeIndices: [heapSize - 1],
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue,
        removedValue: null,
      },
    })

    let index = heapSize - 1
    addFrame({
      executedLines: [2],
      operationText: `start rise at index ${index}`,
      activeIndices: [index],
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue,
        removedValue: null,
      },
    })

    while (index > 0) {
      const parent = parentIndex(index)
      const parentItem = items[parent]
      const childItem = items[index]
      if (parentItem === undefined || childItem === undefined) {
        break
      }

      counters.comparisons += 1

      addFrame({
        executedLines: [3],
        operationText: `compare parent @${parent} with child @${index}`,
        activeIndices: [parent, index],
        heapState: {
          mode,
          heapSize,
          comparePair: [parent, index],
          swapPair: [],
          insertedValue,
          removedValue: null,
        },
      })

      if (parentItem.value >= childItem.value) {
        break
      }

      items[parent] = childItem
      items[index] = parentItem
      counters.swaps += 1
      counters.writes += 2

      addFrame({
        executedLines: [4],
        operationText: `swap parent @${parent} with child @${index}`,
        activeIndices: [parent, index],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [parent, index],
          insertedValue,
          removedValue: null,
        },
      })

      index = parent
    }

    counters.passes += 1
    addFrame({
      executedLines: [5],
      operationText: 'insert operation complete',
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue,
        removedValue: null,
      },
    })
  }

  if (mode === 'delete-max') {
    const removedValue = items[0]?.value ?? null

    addFrame({
      executedLines: [1],
      operationText: removedValue === null ? 'heap is empty' : `max value is ${removedValue}`,
      activeIndices: removedValue === null ? [] : [0],
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue: null,
        removedValue,
      },
    })

    if (heapSize > 1) {
      const lastIndex = heapSize - 1
      const root = items[0]
      const tail = items[lastIndex]
      if (root !== undefined && tail !== undefined) {
        items[0] = tail
        items[lastIndex] = root
      }

      counters.swaps += 1
      counters.writes += 2

      addFrame({
        executedLines: [2],
        operationText: `swap root with tail @${lastIndex}, then remove tail`,
        activeIndices: [0, lastIndex],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [0, lastIndex],
          insertedValue: null,
          removedValue,
        },
      })

      items.pop()
      heapSize -= 1
      counters.passes += 1

      addFrame({
        executedLines: [3],
        operationText: `heap size reduced to ${heapSize}`,
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [],
          insertedValue: null,
          removedValue,
        },
      })

      addFrame({
        executedLines: [4],
        operationText: 'restore heap with siftDown from root',
        activeIndices: heapSize > 0 ? [0] : [],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [],
          insertedValue: null,
          removedValue,
        },
      })

      const siftDownDelete = createSiftDown(items, counters, addFrame, mode, {
        compare: 4,
        swap: 4,
      })
      siftDownDelete(0, heapSize, 'fall')
    }

    addFrame({
      executedLines: [5],
      operationText: removedValue === null ? 'delete-max finished' : `returned max ${removedValue}`,
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue: null,
        removedValue,
      },
    })
  }

  if (mode === 'rise') {
    const riseValue = Math.max(...items.map((item) => item.value), 0) + 5
    items.push({
      id: `item-rise-${items.length}`,
      value: riseValue,
      initialIndex: items.length,
    })
    heapSize = items.length
    counters.writes += 1

    let index = heapSize - 1

    addFrame({
      executedLines: [1],
      operationText: `rising node starts at tail index ${index}`,
      activeIndices: [index],
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue: riseValue,
        removedValue: null,
      },
    })

    while (index > 0) {
      const parent = parentIndex(index)
      const parentItem = items[parent]
      const childItem = items[index]
      if (parentItem === undefined || childItem === undefined) {
        break
      }

      counters.comparisons += 1
      addFrame({
        executedLines: [2],
        operationText: `compare parent @${parent} with rising node @${index}`,
        activeIndices: [parent, index],
        heapState: {
          mode,
          heapSize,
          comparePair: [parent, index],
          swapPair: [],
          insertedValue: riseValue,
          removedValue: null,
        },
      })

      if (parentItem.value >= childItem.value) {
        break
      }

      items[parent] = childItem
      items[index] = parentItem
      counters.swaps += 1
      counters.writes += 2

      addFrame({
        executedLines: [3],
        operationText: `swap @${parent} and @${index}`,
        activeIndices: [parent, index],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [parent, index],
          insertedValue: riseValue,
          removedValue: null,
        },
      })

      index = parent

      addFrame({
        executedLines: [4],
        operationText: `move to parent index ${index}`,
        activeIndices: [index],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [],
          insertedValue: riseValue,
          removedValue: null,
        },
      })
    }

    counters.passes += 1
    addFrame({
      executedLines: [5],
      operationText: 'rise operation complete',
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue: riseValue,
        removedValue: null,
      },
    })
  }

  if (mode === 'fall') {
    if (heapSize > 0) {
      const replacement = Math.min(...items.map((item) => item.value), 0)
      items[0] = {
        id: items[0]?.id ?? 'item-fall-root',
        value: replacement,
        initialIndex: items[0]?.initialIndex ?? 0,
      }
      counters.writes += 1

      addFrame({
        executedLines: [1],
        operationText: `root key dropped to ${replacement}, begin fall`,
        activeIndices: [0],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [],
          insertedValue: null,
          removedValue: null,
        },
      })

      const siftDownFall = createSiftDown(items, counters, addFrame, mode, {
        compare: 3,
        swap: 4,
      })

      addFrame({
        executedLines: [2],
        operationText: 'scan children while a swap is needed',
        activeIndices: [0],
        heapState: {
          mode,
          heapSize,
          comparePair: [],
          swapPair: [],
          insertedValue: null,
          removedValue: null,
        },
      })

      siftDownFall(0, heapSize, 'fall')
    }

    counters.passes += 1
    addFrame({
      executedLines: [5],
      operationText: 'fall operation complete',
      heapState: {
        mode,
        heapSize,
        comparePair: [],
        swapPair: [],
        insertedValue: null,
        removedValue: null,
      },
    })
  }

  return {
    algorithmId: 'heapsort',
    title: `Heapsort (${heapModeLabel[mode]})`,
    pseudocodeLines: heapPseudocodeByMode[mode],
    frames,
    complexityProfile: heapsortComplexityByMode[mode],
    spaceProfile: heapsortSpaceByMode[mode],
    validationError: null,
  }
}

const validateNonNegative = (values: readonly number[]) => {
  const firstNegativeIndex = values.findIndex((value) => value < 0)
  if (firstNegativeIndex < 0) {
    return null
  }

  const invalidValue = values[firstNegativeIndex]
  return `negative value ${invalidValue} at index ${firstNegativeIndex}; this workbench accepts non-negative integers only`
}

const createValidationFailureTimeline = (
  algorithmId: Topic02AdvancedSortAlgorithmId,
  values: readonly number[],
  validationError: string,
): AdvancedSortTimeline => {
  const items = createValueItems(values)
  const counters = createCounters()

  const frame: AdvancedSortFrame = {
    items,
    executedLines: [],
    operationText: `input rejected: ${validationError}`,
    activeIndices: [],
    counters,
    heapState:
      algorithmId === 'heapsort'
        ? {
            mode: 'sort-trace',
            heapSize: items.length,
            comparePair: [],
            swapPair: [],
            insertedValue: null,
            removedValue: null,
          }
        : null,
    countingState:
      algorithmId === 'counting-sort'
        ? {
            maxValue: 0,
            counts: [],
            prefix: [],
            output: [],
            placementIndex: null,
            countIndex: null,
            scanningIndex: null,
          }
        : null,
    radixState:
      algorithmId === 'radix-sort'
        ? {
            base: 10,
            exponent: 1,
            passNumber: 0,
            counts: [],
            prefix: [],
            output: [],
            digitByIndex: [],
            placementIndex: null,
            countIndex: null,
            scanningIndex: null,
          }
        : null,
  }

  return {
    algorithmId,
    title: algorithmId === 'counting-sort' ? 'Counting Sort' : 'Radix Sort (LSD)',
    pseudocodeLines: algorithmId === 'counting-sort' ? countingPseudocodeLines : radixPseudocodeLines,
    frames: [frame],
    complexityProfile: algorithmId === 'counting-sort' ? countingComplexity : radixComplexity,
    spaceProfile: algorithmId === 'counting-sort' ? countingSpace : radixSpace,
    validationError,
  }
}

const buildCountingTimeline = (values: readonly number[]): AdvancedSortTimeline => {
  const validationError = validateNonNegative(values)
  if (validationError !== null) {
    return createValidationFailureTimeline('counting-sort', values, validationError)
  }

  const items = createValueItems(values)
  const counters = createCounters()
  const frames: AdvancedSortFrame[] = []
  const addFrame = addFrameFactory(frames, items, counters)

  const maxValue = Math.max(0, ...values)
  const counts = Array.from({ length: maxValue + 1 }, () => 0)
  const prefix = Array.from({ length: maxValue + 1 }, () => 0)
  const output: (SortValueItem | null)[] = Array.from({ length: items.length }, () => null)

  addFrame({
    executedLines: [],
    operationText: 'initial dataset loaded',
    countingState: {
      maxValue,
      counts,
      prefix,
      output,
      placementIndex: null,
      countIndex: null,
      scanningIndex: null,
    },
  })

  items.forEach((item, index) => {
    counts[item.value] += 1
    counters.writes += 1
    counters.bucketWrites += 1

    addFrame({
      executedLines: [1],
      operationText: `count[${item.value}] increments to ${counts[item.value]}`,
      activeIndices: [index],
      countingState: {
        maxValue,
        counts: cloneNumberArray(counts),
        prefix: cloneNumberArray(prefix),
        output: cloneNullableItems(output),
        placementIndex: null,
        countIndex: item.value,
        scanningIndex: index,
      },
    })
  })

  counters.passes += 1

  for (let value = 0; value <= maxValue; value += 1) {
    if (value === 0) {
      prefix[value] = counts[value] ?? 0
    } else {
      prefix[value] = (prefix[value - 1] ?? 0) + (counts[value] ?? 0)
    }

    counters.writes += 1
    counters.bucketWrites += 1

    addFrame({
      executedLines: [2],
      operationText: `prefix[${value}] updates to ${prefix[value]}`,
      countingState: {
        maxValue,
        counts: cloneNumberArray(counts),
        prefix: cloneNumberArray(prefix),
        output: cloneNullableItems(output),
        placementIndex: null,
        countIndex: value,
        scanningIndex: null,
      },
    })
  }

  counters.passes += 1

  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index]
    if (item === undefined) {
      continue
    }

    addFrame({
      executedLines: [3],
      operationText: `scan input index ${index} from right to left`,
      activeIndices: [index],
      countingState: {
        maxValue,
        counts: cloneNumberArray(counts),
        prefix: cloneNumberArray(prefix),
        output: cloneNullableItems(output),
        placementIndex: null,
        countIndex: item.value,
        scanningIndex: index,
      },
    })

    const placementIndex = (prefix[item.value] ?? 0) - 1
    output[placementIndex] = item
    prefix[item.value] = placementIndex
    counters.writes += 2
    counters.bucketWrites += 1

    addFrame({
      executedLines: [4],
      operationText: `place value ${item.value} at output[${placementIndex}] (stable)` ,
      activeIndices: [index, placementIndex],
      countingState: {
        maxValue,
        counts: cloneNumberArray(counts),
        prefix: cloneNumberArray(prefix),
        output: cloneNullableItems(output),
        placementIndex,
        countIndex: item.value,
        scanningIndex: index,
      },
    })
  }

  counters.passes += 1

  const finalItems = output.flatMap((item) => (item === null ? [] : [item]))
  finalItems.forEach((item, index) => {
    items[index] = item
    counters.writes += 1
  })

  addFrame({
    executedLines: [5],
    operationText: 'counting sort complete (stable output copied)',
    countingState: {
      maxValue,
      counts: cloneNumberArray(counts),
      prefix: cloneNumberArray(prefix),
      output: cloneNullableItems(output),
      placementIndex: null,
      countIndex: null,
      scanningIndex: null,
    },
  })

  return {
    algorithmId: 'counting-sort',
    title: 'Counting Sort',
    pseudocodeLines: countingPseudocodeLines,
    frames,
    complexityProfile: countingComplexity,
    spaceProfile: countingSpace,
    validationError: null,
  }
}

const buildRadixTimeline = (values: readonly number[], base: RadixBase): AdvancedSortTimeline => {
  const validationError = validateNonNegative(values)
  if (validationError !== null) {
    return createValidationFailureTimeline('radix-sort', values, validationError)
  }

  const items = createValueItems(values)
  const counters = createCounters()
  const frames: AdvancedSortFrame[] = []
  const addFrame = addFrameFactory(frames, items, counters)

  let working = [...items]
  const maxValue = Math.max(0, ...values)

  const toDigit = (value: number, exponent: number) => Math.floor(value / exponent) % base

  addFrame({
    executedLines: [],
    operationText: `initial dataset loaded (base ${base})`,
    radixState: {
      base,
      exponent: 1,
      passNumber: 0,
      counts: Array.from({ length: base }, () => 0),
      prefix: Array.from({ length: base }, () => 0),
      output: Array.from({ length: working.length }, () => null),
      digitByIndex: working.map((item) => toDigit(item.value, 1)),
      placementIndex: null,
      countIndex: null,
      scanningIndex: null,
    },
  })

  let exponent = 1
  let passNumber = 1

  while (Math.floor(maxValue / exponent) > 0 || passNumber === 1) {
    const counts = Array.from({ length: base }, () => 0)
    const prefix = Array.from({ length: base }, () => 0)
    const output: (SortValueItem | null)[] = Array.from({ length: working.length }, () => null)
    const digitByIndex = working.map((item) => toDigit(item.value, exponent))

    addFrame({
      executedLines: [1],
      operationText: `pass ${passNumber}: exponent=${exponent}`,
      radixState: {
        base,
        exponent,
        passNumber,
        counts: cloneNumberArray(counts),
        prefix: cloneNumberArray(prefix),
        output: cloneNullableItems(output),
        digitByIndex: cloneNumberArray(digitByIndex),
        placementIndex: null,
        countIndex: null,
        scanningIndex: null,
      },
    })

    working.forEach((item, index) => {
      const digit = digitByIndex[index] ?? 0
      counts[digit] += 1
      counters.writes += 1
      counters.bucketWrites += 1

      addFrame({
        executedLines: [2],
        operationText: `count digit ${digit} from value ${item.value}`,
        activeIndices: [index],
        radixState: {
          base,
          exponent,
          passNumber,
          counts: cloneNumberArray(counts),
          prefix: cloneNumberArray(prefix),
          output: cloneNullableItems(output),
          digitByIndex: cloneNumberArray(digitByIndex),
          placementIndex: null,
          countIndex: digit,
          scanningIndex: index,
        },
      })
    })

    for (let digit = 0; digit < base; digit += 1) {
      if (digit === 0) {
        prefix[digit] = counts[digit] ?? 0
      } else {
        prefix[digit] = (prefix[digit - 1] ?? 0) + (counts[digit] ?? 0)
      }

      counters.writes += 1
      counters.bucketWrites += 1

      addFrame({
        executedLines: [3],
        operationText: `prefix[${digit}] updates to ${prefix[digit]}`,
        radixState: {
          base,
          exponent,
          passNumber,
          counts: cloneNumberArray(counts),
          prefix: cloneNumberArray(prefix),
          output: cloneNullableItems(output),
          digitByIndex: cloneNumberArray(digitByIndex),
          placementIndex: null,
          countIndex: digit,
          scanningIndex: null,
        },
      })
    }

    for (let index = working.length - 1; index >= 0; index -= 1) {
      const item = working[index]
      if (item === undefined) {
        continue
      }

      const digit = toDigit(item.value, exponent)
      const placementIndex = (prefix[digit] ?? 0) - 1
      output[placementIndex] = item
      prefix[digit] = placementIndex
      counters.writes += 2
      counters.bucketWrites += 1

      addFrame({
        executedLines: [4],
        operationText: `place ${item.value} into output[${placementIndex}] using digit ${digit}`,
        activeIndices: [index, placementIndex],
        radixState: {
          base,
          exponent,
          passNumber,
          counts: cloneNumberArray(counts),
          prefix: cloneNumberArray(prefix),
          output: cloneNullableItems(output),
          digitByIndex: cloneNumberArray(digitByIndex),
          placementIndex,
          countIndex: digit,
          scanningIndex: index,
        },
      })
    }

    working = output.flatMap((item) => (item === null ? [] : [item]))
    working.forEach((item, index) => {
      items[index] = item
      counters.writes += 1
    })

    counters.passes += 1

    addFrame({
      executedLines: [5],
      operationText: `pass ${passNumber} complete; copy output back to array`,
      radixState: {
        base,
        exponent,
        passNumber,
        counts: cloneNumberArray(counts),
        prefix: cloneNumberArray(prefix),
        output: cloneNullableItems(output),
        digitByIndex: cloneNumberArray(digitByIndex),
        placementIndex: null,
        countIndex: null,
        scanningIndex: null,
      },
    })

    exponent *= base
    passNumber += 1

    if (Math.floor(maxValue / (exponent / base)) === 0) {
      break
    }
  }

  return {
    algorithmId: 'radix-sort',
    title: 'Radix Sort (LSD)',
    pseudocodeLines: radixPseudocodeLines,
    frames,
    complexityProfile: radixComplexity,
    spaceProfile: radixSpace,
    validationError: null,
  }
}

const createAdvancedSortTimeline = ({
  algorithmId,
  values,
  heapMode,
  radixBase,
}: BuildTimelineParams): AdvancedSortTimeline => {
  if (algorithmId === 'heapsort') {
    return buildHeapTimeline(heapMode, values)
  }

  if (algorithmId === 'counting-sort') {
    return buildCountingTimeline(values)
  }

  return buildRadixTimeline(values, radixBase)
}

const createAdvancedLineEvents = (
  frames: readonly AdvancedSortFrame[],
): readonly LineEvent[] =>
  frames.flatMap((frame, frameIndex) =>
    frame.executedLines.map((lineNumber) => ({
      frameIndex,
      lineNumber,
    })),
  )

const getAdvancedFrameByLineEvent = (
  timeline: AdvancedSortTimeline,
  lineEvents: readonly LineEvent[],
  lineEventIndex: number,
): AdvancedSortFrame => {
  if (timeline.frames.length === 0) {
    return toEmptyAdvancedFrame()
  }

  if (lineEvents.length === 0) {
    return timeline.frames[0] ?? toEmptyAdvancedFrame()
  }

  const boundedIndex = Math.max(0, Math.min(lineEventIndex, lineEvents.length - 1))
  const activeEvent = lineEvents[boundedIndex]
  const frameIndex = activeEvent?.frameIndex ?? 0

  return timeline.frames[frameIndex] ?? timeline.frames[0] ?? toEmptyAdvancedFrame()
}

export {
  advancedSortPresets,
  advancedSortPresetsByAlgorithm,
  createAdvancedLineEvents,
  createAdvancedSortTimeline,
  getAdvancedFrameByLineEvent,
  heapModeLabel,
  heapModeOptions,
  radixBaseOptions,
}
