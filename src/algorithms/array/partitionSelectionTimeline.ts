import type {
  LineEvent,
  PartitionFrame,
  PartitionPointer,
  PartitionSelectionAlgorithmId,
  PartitionTimeline,
  QuickselectStrategyId,
  QuicksortVariantId,
  SortComplexityProfile,
  SortCounters,
  SortPreset,
  SortPseudocodeLine,
  SortRegion,
  SortSpaceProfile,
  SortValueItem,
} from '../../domain/algorithms/types.ts'

const partitionSelectionPresets: readonly SortPreset[] = [
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

const quicksortVariantOptions: readonly Readonly<{
  id: QuicksortVariantId
  label: string
}>[] = [
  { id: 'lomuto', label: 'Lomuto' },
  { id: 'hoare', label: 'Hoare' },
  { id: 'out-of-place', label: 'Out-of-Place' },
  { id: 'dnf', label: 'DNF' },
] as const

const quickselectStrategyOptions: readonly Readonly<{
  id: QuickselectStrategyId
  label: string
}>[] = [
  { id: 'lomuto', label: 'Lomuto' },
  { id: 'hoare', label: 'Hoare' },
] as const

const quicksortVariantLabel: Record<QuicksortVariantId, string> = {
  'out-of-place': 'Out-of-Place',
  hoare: 'Hoare',
  lomuto: 'Lomuto',
  dnf: 'DNF',
}

const quickselectStrategyLabel: Record<QuickselectStrategyId, string> = {
  lomuto: 'Lomuto',
  hoare: 'Hoare',
}

const quicksortPseudocodeByVariant: Record<
  QuicksortVariantId,
  readonly SortPseudocodeLine[]
> = {
  lomuto: [
    { lineNumber: 1, text: 'quickSort(A, lo, hi):' },
    { lineNumber: 2, text: '    if lo >= hi: return' },
    { lineNumber: 3, text: '    pivot <- A[hi]' },
    { lineNumber: 4, text: '    store <- lo' },
    { lineNumber: 5, text: '    for j <- lo to hi - 1:' },
    { lineNumber: 6, text: '        if A[j] <= pivot: swap(A[store], A[j]); store <- store + 1' },
    { lineNumber: 7, text: '    swap(A[store], A[hi])' },
    { lineNumber: 8, text: '    quickSort(A, lo, store - 1)' },
    { lineNumber: 9, text: '    quickSort(A, store + 1, hi)' },
  ],
  hoare: [
    { lineNumber: 1, text: 'quickSort(A, lo, hi):' },
    { lineNumber: 2, text: '    if lo >= hi: return' },
    { lineNumber: 3, text: '    pivot <- A[floor((lo + hi) / 2)]' },
    { lineNumber: 4, text: '    i <- lo - 1; j <- hi + 1' },
    { lineNumber: 5, text: '    repeat i <- i + 1 until A[i] >= pivot' },
    { lineNumber: 6, text: '    repeat j <- j - 1 until A[j] <= pivot' },
    { lineNumber: 7, text: '    if i >= j: split <- j' },
    { lineNumber: 8, text: '    else swap(A[i], A[j]) and continue partition' },
    { lineNumber: 9, text: '    quickSort(A, lo, split)' },
    { lineNumber: 10, text: '    quickSort(A, split + 1, hi)' },
  ],
  dnf: [
    { lineNumber: 1, text: 'quickSort3(A, lo, hi):' },
    { lineNumber: 2, text: '    if lo >= hi: return' },
    { lineNumber: 3, text: '    pivot <- A[lo]' },
    { lineNumber: 4, text: '    lt <- lo; i <- lo; gt <- hi' },
    { lineNumber: 5, text: '    while i <= gt:' },
    { lineNumber: 6, text: '        if A[i] < pivot: swap(A[lt], A[i]); lt++; i++' },
    { lineNumber: 7, text: '        else if A[i] > pivot: swap(A[i], A[gt]); gt--' },
    { lineNumber: 8, text: '        else: i++' },
    { lineNumber: 9, text: '    quickSort3(A, lo, lt - 1)' },
    { lineNumber: 10, text: '    quickSort3(A, gt + 1, hi)' },
  ],
  'out-of-place': [
    { lineNumber: 1, text: 'quickSortCopy(A, lo, hi):' },
    { lineNumber: 2, text: '    if lo >= hi: return' },
    { lineNumber: 3, text: '    pivot <- A[floor((lo + hi) / 2)]' },
    { lineNumber: 4, text: '    less, equal, greater <- stable partition copy of A[lo..hi]' },
    { lineNumber: 5, text: '    write less + equal + greater back into A[lo..hi]' },
    { lineNumber: 6, text: '    leftEnd <- lo + |less| - 1' },
    { lineNumber: 7, text: '    rightStart <- hi - |greater| + 1' },
    { lineNumber: 8, text: '    quickSortCopy(A, lo, leftEnd)' },
    { lineNumber: 9, text: '    quickSortCopy(A, rightStart, hi)' },
  ],
}

const quickselectPseudocodeByStrategy: Record<
  QuickselectStrategyId,
  readonly SortPseudocodeLine[]
> = {
  lomuto: [
    { lineNumber: 1, text: 'quickSelect(A, lo, hi, k):' },
    { lineNumber: 2, text: '    if lo == hi: return lo' },
    { lineNumber: 3, text: '    pivot <- A[hi]' },
    { lineNumber: 4, text: '    store <- lo' },
    { lineNumber: 5, text: '    for j <- lo to hi - 1:' },
    { lineNumber: 6, text: '        if A[j] <= pivot: swap(A[store], A[j]); store++' },
    { lineNumber: 7, text: '    swap(A[store], A[hi])' },
    { lineNumber: 8, text: '    if k == store: return store' },
    { lineNumber: 9, text: '    if k < store: hi <- store - 1 else lo <- store + 1' },
  ],
  hoare: [
    { lineNumber: 1, text: 'quickSelectHoare(A, lo, hi, k):' },
    { lineNumber: 2, text: '    while lo < hi:' },
    { lineNumber: 3, text: '        pivot <- A[floor((lo + hi) / 2)]' },
    { lineNumber: 4, text: '        i <- lo - 1; j <- hi + 1' },
    { lineNumber: 5, text: '        repeat i <- i + 1 until A[i] >= pivot' },
    { lineNumber: 6, text: '        repeat j <- j - 1 until A[j] <= pivot' },
    { lineNumber: 7, text: '        if i >= j: split <- j' },
    { lineNumber: 8, text: '        else swap(A[i], A[j]) and continue partition' },
    { lineNumber: 9, text: '        if k <= split: hi <- split else lo <- split + 1' },
    { lineNumber: 10, text: '    return lo' },
  ],
}

const medianOfMediansPseudocode: readonly SortPseudocodeLine[] = [
  { lineNumber: 1, text: 'selectMoM(A, lo, hi, k):' },
  { lineNumber: 2, text: '    if lo == hi: return lo' },
  { lineNumber: 3, text: '    pivotIndex <- medianOfMedians(A, lo, hi)' },
  { lineNumber: 4, text: '    pivotValue <- A[pivotIndex]' },
  { lineNumber: 5, text: '    3-way partition A[lo..hi] around pivotValue' },
  { lineNumber: 6, text: '    if k < lt: recurse left' },
  { lineNumber: 7, text: '    else if k > gt: recurse right' },
  { lineNumber: 8, text: '    else return k' },
  { lineNumber: 9, text: 'medianOfMedians(A, lo, hi):' },
  { lineNumber: 10, text: '    split A[lo..hi] into groups of 5' },
  { lineNumber: 11, text: '    sort each group and move each group median to front' },
  { lineNumber: 12, text: '    recurse on median segment (or return small median)' },
]

const quicksortComplexityByVariant: Record<
  QuicksortVariantId,
  SortComplexityProfile
> = {
  lomuto: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n^2)',
    auxiliary: 'O(log n) recursion stack',
    stable: false,
    inPlace: true,
  },
  hoare: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n^2)',
    auxiliary: 'O(log n) recursion stack',
    stable: false,
    inPlace: true,
  },
  dnf: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n^2)',
    auxiliary: 'O(log n) recursion stack',
    stable: false,
    inPlace: true,
  },
  'out-of-place': {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n^2)',
    auxiliary: 'O(n) partition buffers',
    stable: false,
    inPlace: false,
  },
}

const quicksortSpaceByVariant: Record<QuicksortVariantId, SortSpaceProfile> = {
  lomuto: {
    inputStorage: 'O(n) input array',
    workingStorage: 'O(1) pointer variables',
    auxiliaryStorage: 'O(log n) recursion stack',
  },
  hoare: {
    inputStorage: 'O(n) input array',
    workingStorage: 'O(1) pointer variables',
    auxiliaryStorage: 'O(log n) recursion stack',
  },
  dnf: {
    inputStorage: 'O(n) input array',
    workingStorage: 'O(1) pointer variables',
    auxiliaryStorage: 'O(log n) recursion stack',
  },
  'out-of-place': {
    inputStorage: 'O(n) input array',
    workingStorage: 'O(n) less/equal/greater buffers',
    auxiliaryStorage: 'O(log n) recursion stack + O(n) partition copy',
  },
}

const quickselectComplexityProfile: SortComplexityProfile = {
  best: 'O(n)',
  average: 'O(n)',
  worst: 'O(n^2)',
  auxiliary: 'O(1) iterative partition state',
  stable: false,
  inPlace: true,
}

const quickselectSpaceProfile: SortSpaceProfile = {
  inputStorage: 'O(n) input array',
  workingStorage: 'O(1) pointer variables',
  auxiliaryStorage: 'O(1) in-place partition',
}

const momComplexityProfile: SortComplexityProfile = {
  best: 'O(n)',
  average: 'O(n)',
  worst: 'O(n)',
  auxiliary: 'O(log n) recursive selection depth',
  stable: false,
  inPlace: true,
}

const momSpaceProfile: SortSpaceProfile = {
  inputStorage: 'O(n) input array',
  workingStorage: 'O(1) group sorting and partition pointers',
  auxiliaryStorage: 'O(log n) recursion depth',
}

const createValueItems = (values: readonly number[]): SortValueItem[] =>
  values.map((value, index) => ({
    id: `item-${index}`,
    value,
    initialIndex: index,
  }))

const cloneItems = (items: readonly SortValueItem[]): readonly SortValueItem[] => [...items]

const clonePointers = (
  pointers: readonly PartitionPointer[],
): readonly PartitionPointer[] => pointers.map((pointer) => ({ ...pointer }))

const cloneCounters = (counters: SortCounters): SortCounters => ({ ...counters })

const createCounters = (): SortCounters => ({
  comparisons: 0,
  writes: 0,
  swaps: 0,
  passes: 0,
})

const toRegion = (start: number, end: number): SortRegion | null =>
  start <= end ? { start, end } : null

const createPointers = (
  itemCount: number,
  entries: readonly Readonly<{ label: string; index: number | null | undefined }>[],
): readonly PartitionPointer[] =>
  entries.flatMap((entry) => {
    const index = entry.index

    if (index === undefined || index === null || index < 0 || index >= itemCount) {
      return []
    }

    return [{ label: entry.label, index }]
  })

const createFrame = ({
  items,
  executedLines,
  operationText,
  activeIndices,
  pointers,
  currentRange,
  lessRange,
  equalRange,
  greaterRange,
  pivotIndex,
  pivotValue,
  targetIndex,
  resultIndex,
  counters,
}: {
  items: readonly SortValueItem[]
  executedLines: readonly number[]
  operationText: string
  activeIndices: readonly number[]
  pointers: readonly PartitionPointer[]
  currentRange: SortRegion | null
  lessRange: SortRegion | null
  equalRange: SortRegion | null
  greaterRange: SortRegion | null
  pivotIndex: number | null
  pivotValue: number | null
  targetIndex: number | null
  resultIndex: number | null
  counters: SortCounters
}): PartitionFrame => ({
  items: cloneItems(items),
  executedLines: [...executedLines],
  operationText,
  activeIndices: [...activeIndices],
  pointers: clonePointers(pointers),
  currentRange,
  lessRange,
  equalRange,
  greaterRange,
  pivotIndex,
  pivotValue,
  targetIndex,
  resultIndex,
  counters: cloneCounters(counters),
})

const createEmptyFrame = (): PartitionFrame =>
  createFrame({
    items: [],
    executedLines: [],
    operationText: 'no frame',
    activeIndices: [],
    pointers: [],
    currentRange: null,
    lessRange: null,
    equalRange: null,
    greaterRange: null,
    pivotIndex: null,
    pivotValue: null,
    targetIndex: null,
    resultIndex: null,
    counters: createCounters(),
  })

const swapItems = (
  items: SortValueItem[],
  leftIndex: number,
  rightIndex: number,
  counters: SortCounters,
) => {
  if (leftIndex === rightIndex) {
    return
  }

  const leftItem = items[leftIndex]
  const rightItem = items[rightIndex]

  if (leftItem === undefined || rightItem === undefined) {
    return
  }

  items[leftIndex] = rightItem
  items[rightIndex] = leftItem
  counters.swaps += 1
  counters.writes += 2
}

const clampTargetIndex = (values: readonly number[], kRank1Based: number) => {
  if (values.length === 0) {
    return 0
  }

  const boundedRank = Math.max(1, Math.min(kRank1Based, values.length))
  return boundedRank - 1
}

const createQuicksortTimeline = (
  variant: QuicksortVariantId,
  values: readonly number[],
): PartitionTimeline => {
  const items = createValueItems(values)
  const counters = createCounters()
  const frames: PartitionFrame[] = []

  const addFrame = ({
    executedLines,
    operationText,
    activeIndices = [],
    pointers = [],
    currentRange = null,
    lessRange = null,
    equalRange = null,
    greaterRange = null,
    pivotIndex = null,
    pivotValue = null,
  }: {
    executedLines: readonly number[]
    operationText: string
    activeIndices?: readonly number[]
    pointers?: readonly PartitionPointer[]
    currentRange?: SortRegion | null
    lessRange?: SortRegion | null
    equalRange?: SortRegion | null
    greaterRange?: SortRegion | null
    pivotIndex?: number | null
    pivotValue?: number | null
  }) => {
    frames.push(
      createFrame({
        items,
        executedLines,
        operationText,
        activeIndices,
        pointers,
        currentRange,
        lessRange,
        equalRange,
        greaterRange,
        pivotIndex,
        pivotValue,
        targetIndex: null,
        resultIndex: null,
        counters,
      }),
    )
  }

  const addInitialFrame = () => {
    addFrame({
      executedLines: [],
      operationText: 'initial dataset loaded',
    })
  }

  const runLomuto = (lo: number, hi: number) => {
    addFrame({
      executedLines: [1],
      operationText: `enter quickSort(A, ${lo}, ${hi})`,
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lo', index: lo },
        { label: 'hi', index: hi },
      ]),
    })

    const isBaseCase = lo >= hi
    addFrame({
      executedLines: [2],
      operationText: isBaseCase ? 'base case reached, return' : 'partition current range',
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lo', index: lo },
        { label: 'hi', index: hi },
      ]),
    })

    if (isBaseCase) {
      return
    }

    const pivotItem = items[hi]
    if (pivotItem === undefined) {
      return
    }

    const pivotValue = pivotItem.value
    addFrame({
      executedLines: [3],
      operationText: `pivot <- A[${hi}] = ${pivotValue}`,
      currentRange: toRegion(lo, hi),
      equalRange: toRegion(hi, hi),
      pivotIndex: hi,
      pivotValue,
      pointers: createPointers(items.length, [
        { label: 'pivot', index: hi },
      ]),
    })

    let store = lo
    addFrame({
      executedLines: [4],
      operationText: `store <- ${store}`,
      currentRange: toRegion(lo, hi),
      equalRange: toRegion(hi, hi),
      lessRange: toRegion(lo, store - 1),
      greaterRange: toRegion(store, hi - 1),
      pivotIndex: hi,
      pivotValue,
      pointers: createPointers(items.length, [
        { label: 'store', index: store },
        { label: 'pivot', index: hi },
      ]),
    })

    for (let j = lo; j < hi; j += 1) {
      counters.comparisons += 1
      const value = items[j]?.value ?? Number.NaN
      const shouldMove = value <= pivotValue

      addFrame({
        executedLines: [5],
        operationText: `scan j=${j}, compare ${value} <= ${pivotValue}`,
        activeIndices: [j, store],
        currentRange: toRegion(lo, hi),
        lessRange: toRegion(lo, store - 1),
        greaterRange: toRegion(store, hi - 1),
        equalRange: toRegion(hi, hi),
        pivotIndex: hi,
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'j', index: j },
          { label: 'store', index: store },
          { label: 'pivot', index: hi },
        ]),
      })

      if (!shouldMove) {
        continue
      }

      swapItems(items, store, j, counters)
      addFrame({
        executedLines: [6],
        operationText: `swap A[${store}] with A[${j}] and advance store`,
        activeIndices: [store, j],
        currentRange: toRegion(lo, hi),
        lessRange: toRegion(lo, store),
        greaterRange: toRegion(store + 1, hi - 1),
        equalRange: toRegion(hi, hi),
        pivotIndex: hi,
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'j', index: j },
          { label: 'store', index: store },
          { label: 'pivot', index: hi },
        ]),
      })
      store += 1
    }

    swapItems(items, store, hi, counters)
    counters.passes += 1
    addFrame({
      executedLines: [7],
      operationText: `place pivot at index ${store}`,
      activeIndices: [store, hi],
      currentRange: toRegion(lo, hi),
      lessRange: toRegion(lo, store - 1),
      equalRange: toRegion(store, store),
      greaterRange: toRegion(store + 1, hi),
      pivotIndex: store,
      pivotValue,
      pointers: createPointers(items.length, [
        { label: 'pivot', index: store },
      ]),
    })

    addFrame({
      executedLines: [8],
      operationText: `recurse left [${lo}..${store - 1}]`,
      currentRange: toRegion(lo, hi),
      lessRange: toRegion(lo, store - 1),
      equalRange: toRegion(store, store),
      greaterRange: toRegion(store + 1, hi),
      pivotIndex: store,
      pivotValue,
    })
    runLomuto(lo, store - 1)

    addFrame({
      executedLines: [9],
      operationText: `recurse right [${store + 1}..${hi}]`,
      currentRange: toRegion(lo, hi),
      lessRange: toRegion(lo, store - 1),
      equalRange: toRegion(store, store),
      greaterRange: toRegion(store + 1, hi),
      pivotIndex: store,
      pivotValue,
    })
    runLomuto(store + 1, hi)
  }

  const runHoare = (lo: number, hi: number) => {
    addFrame({
      executedLines: [1],
      operationText: `enter quickSort(A, ${lo}, ${hi})`,
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lo', index: lo },
        { label: 'hi', index: hi },
      ]),
    })

    const isBaseCase = lo >= hi
    addFrame({
      executedLines: [2],
      operationText: isBaseCase ? 'base case reached, return' : 'prepare Hoare partition',
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lo', index: lo },
        { label: 'hi', index: hi },
      ]),
    })

    if (isBaseCase) {
      return
    }

    const pivotIndex = lo + Math.floor((hi - lo) / 2)
    const pivotValue = items[pivotIndex]?.value ?? Number.NaN

    addFrame({
      executedLines: [3],
      operationText: `pivot <- A[${pivotIndex}] = ${pivotValue}`,
      currentRange: toRegion(lo, hi),
      equalRange: toRegion(pivotIndex, pivotIndex),
      pivotIndex,
      pivotValue,
      pointers: createPointers(items.length, [
        { label: 'pivot', index: pivotIndex },
      ]),
    })

    let i = lo - 1
    let j = hi + 1
    addFrame({
      executedLines: [4],
      operationText: `initialize i=${i}, j=${j}`,
      currentRange: toRegion(lo, hi),
      pivotIndex,
      pivotValue,
      pointers: createPointers(items.length, [
        { label: 'i', index: i + 1 },
        { label: 'j', index: j - 1 },
        { label: 'pivot', index: pivotIndex },
      ]),
    })

    while (true) {
      do {
        i += 1
        counters.comparisons += 1
        addFrame({
          executedLines: [5],
          operationText: `advance i -> ${i}`,
          activeIndices: [i],
          currentRange: toRegion(lo, hi),
          pivotIndex,
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'i', index: i },
            { label: 'j', index: j },
            { label: 'pivot', index: pivotIndex },
          ]),
        })
      } while ((items[i]?.value ?? Number.NaN) < pivotValue)

      do {
        j -= 1
        counters.comparisons += 1
        addFrame({
          executedLines: [6],
          operationText: `decrement j -> ${j}`,
          activeIndices: [j],
          currentRange: toRegion(lo, hi),
          pivotIndex,
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'i', index: i },
            { label: 'j', index: j },
            { label: 'pivot', index: pivotIndex },
          ]),
        })
      } while ((items[j]?.value ?? Number.NaN) > pivotValue)

      if (i >= j) {
        counters.passes += 1
        addFrame({
          executedLines: [7],
          operationText: `indices crossed at i=${i}, split=${j}`,
          currentRange: toRegion(lo, hi),
          lessRange: toRegion(lo, j),
          greaterRange: toRegion(j + 1, hi),
          pivotIndex,
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'split', index: j },
            { label: 'pivot', index: pivotIndex },
          ]),
        })

        addFrame({
          executedLines: [9],
          operationText: `recurse left [${lo}..${j}]`,
          currentRange: toRegion(lo, hi),
          lessRange: toRegion(lo, j),
          greaterRange: toRegion(j + 1, hi),
          pivotIndex,
          pivotValue,
        })
        runHoare(lo, j)

        addFrame({
          executedLines: [10],
          operationText: `recurse right [${j + 1}..${hi}]`,
          currentRange: toRegion(lo, hi),
          lessRange: toRegion(lo, j),
          greaterRange: toRegion(j + 1, hi),
          pivotIndex,
          pivotValue,
        })
        runHoare(j + 1, hi)
        return
      }

      swapItems(items, i, j, counters)
      addFrame({
        executedLines: [8],
        operationText: `swap A[${i}] with A[${j}]`,
        activeIndices: [i, j],
        currentRange: toRegion(lo, hi),
        pivotIndex,
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'i', index: i },
          { label: 'j', index: j },
          { label: 'pivot', index: pivotIndex },
        ]),
      })
    }
  }

  const runDnf = (lo: number, hi: number) => {
    addFrame({
      executedLines: [1],
      operationText: `enter quickSort3(A, ${lo}, ${hi})`,
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lo', index: lo },
        { label: 'hi', index: hi },
      ]),
    })

    const isBaseCase = lo >= hi
    addFrame({
      executedLines: [2],
      operationText: isBaseCase ? 'base case reached, return' : 'partition into three bands',
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lo', index: lo },
        { label: 'hi', index: hi },
      ]),
    })

    if (isBaseCase) {
      return
    }

    const pivotValue = items[lo]?.value ?? Number.NaN
    addFrame({
      executedLines: [3],
      operationText: `pivot <- A[${lo}] = ${pivotValue}`,
      currentRange: toRegion(lo, hi),
      pivotIndex: lo,
      pivotValue,
      equalRange: toRegion(lo, lo),
      pointers: createPointers(items.length, [
        { label: 'pivot', index: lo },
      ]),
    })

    let lt = lo
    let i = lo
    let gt = hi
    addFrame({
      executedLines: [4],
      operationText: `lt=${lt}, i=${i}, gt=${gt}`,
      currentRange: toRegion(lo, hi),
      pivotIndex: lo,
      pivotValue,
      pointers: createPointers(items.length, [
        { label: 'lt', index: lt },
        { label: 'i', index: i },
        { label: 'gt', index: gt },
      ]),
    })

    while (i <= gt) {
      const value = items[i]?.value ?? Number.NaN
      addFrame({
        executedLines: [5],
        operationText: `inspect A[${i}] = ${value}`,
        activeIndices: [i],
        currentRange: toRegion(lo, hi),
        lessRange: toRegion(lo, lt - 1),
        equalRange: toRegion(lt, i - 1),
        greaterRange: toRegion(gt + 1, hi),
        pivotIndex: lt,
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'lt', index: lt },
          { label: 'i', index: i },
          { label: 'gt', index: gt },
        ]),
      })

      counters.comparisons += 1
      if (value < pivotValue) {
        swapItems(items, lt, i, counters)
        addFrame({
          executedLines: [6],
          operationText: `A[${i}] < pivot, swap with lt=${lt}`,
          activeIndices: [lt, i],
          currentRange: toRegion(lo, hi),
          lessRange: toRegion(lo, lt),
          equalRange: toRegion(lt + 1, i),
          greaterRange: toRegion(gt + 1, hi),
          pivotIndex: lt,
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'lt', index: lt },
            { label: 'i', index: i },
            { label: 'gt', index: gt },
          ]),
        })
        lt += 1
        i += 1
        continue
      }

      counters.comparisons += 1
      if (value > pivotValue) {
        swapItems(items, i, gt, counters)
        addFrame({
          executedLines: [7],
          operationText: `A[${i}] > pivot, swap with gt=${gt}`,
          activeIndices: [i, gt],
          currentRange: toRegion(lo, hi),
          lessRange: toRegion(lo, lt - 1),
          equalRange: toRegion(lt, i - 1),
          greaterRange: toRegion(gt, hi),
          pivotIndex: lt,
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'lt', index: lt },
            { label: 'i', index: i },
            { label: 'gt', index: gt },
          ]),
        })
        gt -= 1
        continue
      }

      addFrame({
        executedLines: [8],
        operationText: `A[${i}] == pivot, move i`,
        activeIndices: [i],
        currentRange: toRegion(lo, hi),
        lessRange: toRegion(lo, lt - 1),
        equalRange: toRegion(lt, i),
        greaterRange: toRegion(gt + 1, hi),
        pivotIndex: lt,
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'lt', index: lt },
          { label: 'i', index: i },
          { label: 'gt', index: gt },
        ]),
      })
      i += 1
    }

    counters.passes += 1

    addFrame({
      executedLines: [9],
      operationText: `recurse left [${lo}..${lt - 1}]`,
      currentRange: toRegion(lo, hi),
      lessRange: toRegion(lo, lt - 1),
      equalRange: toRegion(lt, gt),
      greaterRange: toRegion(gt + 1, hi),
      pivotIndex: lt,
      pivotValue,
    })
    runDnf(lo, lt - 1)

    addFrame({
      executedLines: [10],
      operationText: `recurse right [${gt + 1}..${hi}]`,
      currentRange: toRegion(lo, hi),
      lessRange: toRegion(lo, lt - 1),
      equalRange: toRegion(lt, gt),
      greaterRange: toRegion(gt + 1, hi),
      pivotIndex: lt,
      pivotValue,
    })
    runDnf(gt + 1, hi)
  }

  const runOutOfPlace = (lo: number, hi: number) => {
    addFrame({
      executedLines: [1],
      operationText: `enter quickSortCopy(A, ${lo}, ${hi})`,
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lo', index: lo },
        { label: 'hi', index: hi },
      ]),
    })

    const isBaseCase = lo >= hi
    addFrame({
      executedLines: [2],
      operationText: isBaseCase ? 'base case reached, return' : 'partition copy of current range',
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lo', index: lo },
        { label: 'hi', index: hi },
      ]),
    })

    if (isBaseCase) {
      return
    }

    const pivotIndex = lo + Math.floor((hi - lo) / 2)
    const pivotValue = items[pivotIndex]?.value ?? Number.NaN
    addFrame({
      executedLines: [3],
      operationText: `pivot <- A[${pivotIndex}] = ${pivotValue}`,
      currentRange: toRegion(lo, hi),
      equalRange: toRegion(pivotIndex, pivotIndex),
      pivotIndex,
      pivotValue,
      pointers: createPointers(items.length, [
        { label: 'pivot', index: pivotIndex },
      ]),
    })

    const less: SortValueItem[] = []
    const equal: SortValueItem[] = []
    const greater: SortValueItem[] = []

    for (let scan = lo; scan <= hi; scan += 1) {
      const candidate = items[scan]
      if (candidate === undefined) {
        continue
      }

      counters.comparisons += 1
      if (candidate.value < pivotValue) {
        less.push(candidate)
      } else {
        counters.comparisons += 1
        if (candidate.value > pivotValue) {
          greater.push(candidate)
        } else {
          equal.push(candidate)
        }
      }

      addFrame({
        executedLines: [4],
        operationText: `scan A[${scan}] -> less=${less.length}, equal=${equal.length}, greater=${greater.length}`,
        activeIndices: [scan],
        currentRange: toRegion(lo, hi),
        pivotIndex,
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'scan', index: scan },
          { label: 'pivot', index: pivotIndex },
        ]),
      })
    }

    const merged = [...less, ...equal, ...greater]
    merged.forEach((item, offset) => {
      const writeIndex = lo + offset
      const current = items[writeIndex]

      if (current !== item) {
        items[writeIndex] = item
        counters.writes += 1
      }

      addFrame({
        executedLines: [5],
        operationText: `write partition item ${item.value} at A[${writeIndex}]`,
        activeIndices: [writeIndex],
        currentRange: toRegion(lo, hi),
        pivotValue,
      })
    })

    const leftEnd = lo + less.length - 1
    const equalStart = leftEnd + 1
    const rightStart = hi - greater.length + 1
    const equalEnd = rightStart - 1

    counters.passes += 1

    addFrame({
      executedLines: [6],
      operationText: `leftEnd <- ${leftEnd}`,
      currentRange: toRegion(lo, hi),
      lessRange: toRegion(lo, leftEnd),
      equalRange: toRegion(equalStart, equalEnd),
      greaterRange: toRegion(rightStart, hi),
      pivotIndex: equalStart <= equalEnd ? equalStart : null,
      pivotValue,
    })

    addFrame({
      executedLines: [7],
      operationText: `rightStart <- ${rightStart}`,
      currentRange: toRegion(lo, hi),
      lessRange: toRegion(lo, leftEnd),
      equalRange: toRegion(equalStart, equalEnd),
      greaterRange: toRegion(rightStart, hi),
      pivotIndex: equalStart <= equalEnd ? equalStart : null,
      pivotValue,
    })

    addFrame({
      executedLines: [8],
      operationText: `recurse left [${lo}..${leftEnd}]`,
      currentRange: toRegion(lo, hi),
      lessRange: toRegion(lo, leftEnd),
      equalRange: toRegion(equalStart, equalEnd),
      greaterRange: toRegion(rightStart, hi),
      pivotIndex: equalStart <= equalEnd ? equalStart : null,
      pivotValue,
    })
    runOutOfPlace(lo, leftEnd)

    addFrame({
      executedLines: [9],
      operationText: `recurse right [${rightStart}..${hi}]`,
      currentRange: toRegion(lo, hi),
      lessRange: toRegion(lo, leftEnd),
      equalRange: toRegion(equalStart, equalEnd),
      greaterRange: toRegion(rightStart, hi),
      pivotIndex: equalStart <= equalEnd ? equalStart : null,
      pivotValue,
    })
    runOutOfPlace(rightStart, hi)
  }

  addInitialFrame()

  if (items.length > 0) {
    if (variant === 'lomuto') {
      runLomuto(0, items.length - 1)
    } else if (variant === 'hoare') {
      runHoare(0, items.length - 1)
    } else if (variant === 'dnf') {
      runDnf(0, items.length - 1)
    } else {
      runOutOfPlace(0, items.length - 1)
    }
  }

  addFrame({
    executedLines: [],
    operationText: 'quicksort complete',
    currentRange: toRegion(0, items.length - 1),
  })

  return {
    algorithmId: 'quicksort',
    title: `Quicksort (${quicksortVariantLabel[variant]})`,
    pseudocodeLines: quicksortPseudocodeByVariant[variant],
    frames,
    complexityProfile: quicksortComplexityByVariant[variant],
    spaceProfile: quicksortSpaceByVariant[variant],
  }
}

const createQuickselectTimeline = (
  strategy: QuickselectStrategyId,
  values: readonly number[],
  kRank1Based: number,
): PartitionTimeline => {
  const items = createValueItems(values)
  const counters = createCounters()
  const frames: PartitionFrame[] = []
  const targetIndex = clampTargetIndex(values, kRank1Based)
  let resultIndex: number | null = null

  const addFrame = ({
    executedLines,
    operationText,
    activeIndices = [],
    pointers = [],
    currentRange = null,
    lessRange = null,
    equalRange = null,
    greaterRange = null,
    pivotIndex = null,
    pivotValue = null,
    nextResultIndex = resultIndex,
  }: {
    executedLines: readonly number[]
    operationText: string
    activeIndices?: readonly number[]
    pointers?: readonly PartitionPointer[]
    currentRange?: SortRegion | null
    lessRange?: SortRegion | null
    equalRange?: SortRegion | null
    greaterRange?: SortRegion | null
    pivotIndex?: number | null
    pivotValue?: number | null
    nextResultIndex?: number | null
  }) => {
    resultIndex = nextResultIndex

    frames.push(
      createFrame({
        items,
        executedLines,
        operationText,
        activeIndices,
        pointers,
        currentRange,
        lessRange,
        equalRange,
        greaterRange,
        pivotIndex,
        pivotValue,
        targetIndex,
        resultIndex,
        counters,
      }),
    )
  }

  addFrame({
    executedLines: [],
    operationText: `initial dataset loaded (target rank=${targetIndex + 1})`,
  })

  if (items.length === 0) {
    return {
      algorithmId: 'quickselect',
      title: `Quickselect (${quickselectStrategyLabel[strategy]})`,
      pseudocodeLines: quickselectPseudocodeByStrategy[strategy],
      frames,
      complexityProfile: quickselectComplexityProfile,
      spaceProfile: quickselectSpaceProfile,
    }
  }

  if (strategy === 'lomuto') {
    let lo = 0
    let hi = items.length - 1

    while (true) {
      addFrame({
        executedLines: [1],
        operationText: `quickSelect(A, ${lo}, ${hi}, k=${targetIndex})`,
        currentRange: toRegion(lo, hi),
        pointers: createPointers(items.length, [
          { label: 'lo', index: lo },
          { label: 'hi', index: hi },
          { label: 'k', index: targetIndex },
        ]),
      })

      if (lo === hi) {
        addFrame({
          executedLines: [2],
          operationText: `lo == hi == ${lo}, return`,
          currentRange: toRegion(lo, hi),
          nextResultIndex: lo,
          pointers: createPointers(items.length, [
            { label: 'k', index: targetIndex },
          ]),
        })
        break
      }

      const pivotValue = items[hi]?.value ?? Number.NaN
      addFrame({
        executedLines: [3],
        operationText: `pivot <- A[${hi}] = ${pivotValue}`,
        currentRange: toRegion(lo, hi),
        equalRange: toRegion(hi, hi),
        pivotIndex: hi,
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'pivot', index: hi },
          { label: 'k', index: targetIndex },
        ]),
      })

      let store = lo
      addFrame({
        executedLines: [4],
        operationText: `store <- ${store}`,
        currentRange: toRegion(lo, hi),
        lessRange: toRegion(lo, store - 1),
        greaterRange: toRegion(store, hi - 1),
        equalRange: toRegion(hi, hi),
        pivotIndex: hi,
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'store', index: store },
          { label: 'pivot', index: hi },
          { label: 'k', index: targetIndex },
        ]),
      })

      for (let j = lo; j < hi; j += 1) {
        counters.comparisons += 1
        const value = items[j]?.value ?? Number.NaN
        const shouldMove = value <= pivotValue

        addFrame({
          executedLines: [5],
          operationText: `scan j=${j}, compare ${value} <= ${pivotValue}`,
          activeIndices: [j, store],
          currentRange: toRegion(lo, hi),
          lessRange: toRegion(lo, store - 1),
          greaterRange: toRegion(store, hi - 1),
          equalRange: toRegion(hi, hi),
          pivotIndex: hi,
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'j', index: j },
            { label: 'store', index: store },
            { label: 'pivot', index: hi },
            { label: 'k', index: targetIndex },
          ]),
        })

        if (!shouldMove) {
          continue
        }

        swapItems(items, store, j, counters)
        addFrame({
          executedLines: [6],
          operationText: `swap A[${store}] with A[${j}] and advance store`,
          activeIndices: [store, j],
          currentRange: toRegion(lo, hi),
          lessRange: toRegion(lo, store),
          greaterRange: toRegion(store + 1, hi - 1),
          equalRange: toRegion(hi, hi),
          pivotIndex: hi,
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'j', index: j },
            { label: 'store', index: store },
            { label: 'pivot', index: hi },
            { label: 'k', index: targetIndex },
          ]),
        })
        store += 1
      }

      swapItems(items, store, hi, counters)
      counters.passes += 1
      addFrame({
        executedLines: [7],
        operationText: `pivot placed at index ${store}`,
        activeIndices: [store, hi],
        currentRange: toRegion(lo, hi),
        lessRange: toRegion(lo, store - 1),
        equalRange: toRegion(store, store),
        greaterRange: toRegion(store + 1, hi),
        pivotIndex: store,
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'pivot', index: store },
          { label: 'k', index: targetIndex },
        ]),
      })

      if (targetIndex === store) {
        addFrame({
          executedLines: [8],
          operationText: `k == pivotIndex (${store}), selection complete`,
          currentRange: toRegion(lo, hi),
          lessRange: toRegion(lo, store - 1),
          equalRange: toRegion(store, store),
          greaterRange: toRegion(store + 1, hi),
          pivotIndex: store,
          pivotValue,
          nextResultIndex: store,
          pointers: createPointers(items.length, [
            { label: 'k', index: targetIndex },
          ]),
        })
        break
      }

      if (targetIndex < store) {
        hi = store - 1
        addFrame({
          executedLines: [9],
          operationText: `k < pivotIndex, move hi <- ${hi}`,
          currentRange: toRegion(lo, hi),
          pointers: createPointers(items.length, [
            { label: 'lo', index: lo },
            { label: 'hi', index: hi },
            { label: 'k', index: targetIndex },
          ]),
        })
      } else {
        lo = store + 1
        addFrame({
          executedLines: [9],
          operationText: `k > pivotIndex, move lo <- ${lo}`,
          currentRange: toRegion(lo, hi),
          pointers: createPointers(items.length, [
            { label: 'lo', index: lo },
            { label: 'hi', index: hi },
            { label: 'k', index: targetIndex },
          ]),
        })
      }
    }
  } else {
    let lo = 0
    let hi = items.length - 1

    addFrame({
      executedLines: [1],
      operationText: `quickSelectHoare(A, ${lo}, ${hi}, k=${targetIndex})`,
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'k', index: targetIndex },
      ]),
    })

    while (lo < hi) {
      addFrame({
        executedLines: [2],
        operationText: `loop with lo=${lo}, hi=${hi}`,
        currentRange: toRegion(lo, hi),
        pointers: createPointers(items.length, [
          { label: 'lo', index: lo },
          { label: 'hi', index: hi },
          { label: 'k', index: targetIndex },
        ]),
      })

      const pivotIndex = lo + Math.floor((hi - lo) / 2)
      const pivotValue = items[pivotIndex]?.value ?? Number.NaN
      addFrame({
        executedLines: [3],
        operationText: `pivot <- A[${pivotIndex}] = ${pivotValue}`,
        currentRange: toRegion(lo, hi),
        pivotIndex,
        pivotValue,
        equalRange: toRegion(pivotIndex, pivotIndex),
        pointers: createPointers(items.length, [
          { label: 'pivot', index: pivotIndex },
          { label: 'k', index: targetIndex },
        ]),
      })

      let i = lo - 1
      let j = hi + 1
      addFrame({
        executedLines: [4],
        operationText: `initialize i=${i}, j=${j}`,
        currentRange: toRegion(lo, hi),
        pivotIndex,
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'i', index: i + 1 },
          { label: 'j', index: j - 1 },
          { label: 'k', index: targetIndex },
        ]),
      })

      let split = lo

      while (true) {
        do {
          i += 1
          counters.comparisons += 1
          addFrame({
            executedLines: [5],
            operationText: `advance i -> ${i}`,
            activeIndices: [i],
            currentRange: toRegion(lo, hi),
            pivotIndex,
            pivotValue,
            pointers: createPointers(items.length, [
              { label: 'i', index: i },
              { label: 'j', index: j },
              { label: 'k', index: targetIndex },
            ]),
          })
        } while ((items[i]?.value ?? Number.NaN) < pivotValue)

        do {
          j -= 1
          counters.comparisons += 1
          addFrame({
            executedLines: [6],
            operationText: `decrement j -> ${j}`,
            activeIndices: [j],
            currentRange: toRegion(lo, hi),
            pivotIndex,
            pivotValue,
            pointers: createPointers(items.length, [
              { label: 'i', index: i },
              { label: 'j', index: j },
              { label: 'k', index: targetIndex },
            ]),
          })
        } while ((items[j]?.value ?? Number.NaN) > pivotValue)

        if (i >= j) {
          split = j
          counters.passes += 1
          addFrame({
            executedLines: [7],
            operationText: `indices crossed, split=${split}`,
            currentRange: toRegion(lo, hi),
            lessRange: toRegion(lo, split),
            greaterRange: toRegion(split + 1, hi),
            pivotIndex,
            pivotValue,
            pointers: createPointers(items.length, [
              { label: 'split', index: split },
              { label: 'k', index: targetIndex },
            ]),
          })
          break
        }

        swapItems(items, i, j, counters)
        addFrame({
          executedLines: [8],
          operationText: `swap A[${i}] with A[${j}]`,
          activeIndices: [i, j],
          currentRange: toRegion(lo, hi),
          pivotIndex,
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'i', index: i },
            { label: 'j', index: j },
            { label: 'k', index: targetIndex },
          ]),
        })
      }

      if (targetIndex <= split) {
        hi = split
        addFrame({
          executedLines: [9],
          operationText: `k <= split, update hi <- ${hi}`,
          currentRange: toRegion(lo, hi),
          pointers: createPointers(items.length, [
            { label: 'lo', index: lo },
            { label: 'hi', index: hi },
            { label: 'k', index: targetIndex },
          ]),
        })
      } else {
        lo = split + 1
        addFrame({
          executedLines: [9],
          operationText: `k > split, update lo <- ${lo}`,
          currentRange: toRegion(lo, hi),
          pointers: createPointers(items.length, [
            { label: 'lo', index: lo },
            { label: 'hi', index: hi },
            { label: 'k', index: targetIndex },
          ]),
        })
      }
    }

    addFrame({
      executedLines: [10],
      operationText: `return index ${lo}`,
      currentRange: toRegion(lo, lo),
      nextResultIndex: lo,
      pointers: createPointers(items.length, [
        { label: 'k', index: targetIndex },
      ]),
    })
  }

  addFrame({
    executedLines: [],
    operationText:
      resultIndex === null
        ? 'quickselect complete'
        : `quickselect complete, value=${items[resultIndex]?.value ?? Number.NaN}`,
  })

  return {
    algorithmId: 'quickselect',
    title: `Quickselect (${quickselectStrategyLabel[strategy]})`,
    pseudocodeLines: quickselectPseudocodeByStrategy[strategy],
    frames,
    complexityProfile: quickselectComplexityProfile,
    spaceProfile: quickselectSpaceProfile,
  }
}

const createMedianOfMediansTimeline = (
  values: readonly number[],
  kRank1Based: number,
): PartitionTimeline => {
  const items = createValueItems(values)
  const counters = createCounters()
  const frames: PartitionFrame[] = []
  const targetIndex = clampTargetIndex(values, kRank1Based)
  let resultIndex: number | null = null

  const addFrame = ({
    executedLines,
    operationText,
    activeIndices = [],
    pointers = [],
    currentRange = null,
    lessRange = null,
    equalRange = null,
    greaterRange = null,
    pivotIndex = null,
    pivotValue = null,
    nextResultIndex = resultIndex,
  }: {
    executedLines: readonly number[]
    operationText: string
    activeIndices?: readonly number[]
    pointers?: readonly PartitionPointer[]
    currentRange?: SortRegion | null
    lessRange?: SortRegion | null
    equalRange?: SortRegion | null
    greaterRange?: SortRegion | null
    pivotIndex?: number | null
    pivotValue?: number | null
    nextResultIndex?: number | null
  }) => {
    resultIndex = nextResultIndex

    frames.push(
      createFrame({
        items,
        executedLines,
        operationText,
        activeIndices,
        pointers,
        currentRange,
        lessRange,
        equalRange,
        greaterRange,
        pivotIndex,
        pivotValue,
        targetIndex,
        resultIndex,
        counters,
      }),
    )
  }

  const insertionSortRange = (lo: number, hi: number, pivotValue: number | null) => {
    for (let i = lo + 1; i <= hi; i += 1) {
      let j = i
      while (j > lo) {
        counters.comparisons += 1
        const left = items[j - 1]
        const right = items[j]

        if (left === undefined || right === undefined || left.value <= right.value) {
          break
        }

        swapItems(items, j - 1, j, counters)
        addFrame({
          executedLines: [11],
          operationText: `sort group swap A[${j - 1}] with A[${j}]`,
          activeIndices: [j - 1, j],
          currentRange: toRegion(lo, hi),
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'i', index: i },
            { label: 'j', index: j },
            { label: 'k', index: targetIndex },
          ]),
        })
        j -= 1
      }
    }
  }

  const choosePivotIndex = (lo: number, hi: number): number => {
    addFrame({
      executedLines: [9],
      operationText: `medianOfMedians(A, ${lo}, ${hi})`,
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lo', index: lo },
        { label: 'hi', index: hi },
      ]),
    })

    const length = hi - lo + 1

    if (length <= 5) {
      addFrame({
        executedLines: [10],
        operationText: `small range length=${length}, direct median`,
        currentRange: toRegion(lo, hi),
      })
      insertionSortRange(lo, hi, null)
      const medianIndex = lo + Math.floor((length - 1) / 2)
      addFrame({
        executedLines: [12],
        operationText: `return median index ${medianIndex}`,
        currentRange: toRegion(lo, hi),
        pivotIndex: medianIndex,
      })
      return medianIndex
    }

    addFrame({
      executedLines: [10],
      operationText: 'split into groups of five',
      currentRange: toRegion(lo, hi),
    })

    let medianWrite = lo
    for (let groupStart = lo; groupStart <= hi; groupStart += 5) {
      const groupEnd = Math.min(groupStart + 4, hi)
      insertionSortRange(groupStart, groupEnd, null)
      const medianIndex = groupStart + Math.floor((groupEnd - groupStart) / 2)
      swapItems(items, medianWrite, medianIndex, counters)
      addFrame({
        executedLines: [11],
        operationText: `move group median from ${medianIndex} to ${medianWrite}`,
        activeIndices: [medianWrite, medianIndex],
        currentRange: toRegion(lo, hi),
        pointers: createPointers(items.length, [
          { label: 'median', index: medianWrite },
          { label: 'k', index: targetIndex },
        ]),
      })
      medianWrite += 1
    }

    const mediansHi = medianWrite - 1
    addFrame({
      executedLines: [12],
      operationText: `recurse on medians range [${lo}..${mediansHi}]`,
      currentRange: toRegion(lo, mediansHi),
    })
    return choosePivotIndex(lo, mediansHi)
  }

  const partitionByValue = (
    lo: number,
    hi: number,
    pivotValue: number,
  ): Readonly<{ lt: number; gt: number }> => {
    let lt = lo
    let i = lo
    let gt = hi

    addFrame({
      executedLines: [5],
      operationText: `start 3-way partition around pivotValue=${pivotValue}`,
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lt', index: lt },
        { label: 'i', index: i },
        { label: 'gt', index: gt },
      ]),
      pivotValue,
    })

    while (i <= gt) {
      const value = items[i]?.value ?? Number.NaN
      counters.comparisons += 1

      if (value < pivotValue) {
        swapItems(items, lt, i, counters)
        addFrame({
          executedLines: [5],
          operationText: `A[${i}] < pivot, swap with lt=${lt}`,
          activeIndices: [lt, i],
          currentRange: toRegion(lo, hi),
          lessRange: toRegion(lo, lt),
          equalRange: toRegion(lt + 1, i),
          greaterRange: toRegion(gt + 1, hi),
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'lt', index: lt },
            { label: 'i', index: i },
            { label: 'gt', index: gt },
            { label: 'k', index: targetIndex },
          ]),
        })
        lt += 1
        i += 1
        continue
      }

      counters.comparisons += 1
      if (value > pivotValue) {
        swapItems(items, i, gt, counters)
        addFrame({
          executedLines: [5],
          operationText: `A[${i}] > pivot, swap with gt=${gt}`,
          activeIndices: [i, gt],
          currentRange: toRegion(lo, hi),
          lessRange: toRegion(lo, lt - 1),
          equalRange: toRegion(lt, i - 1),
          greaterRange: toRegion(gt, hi),
          pivotValue,
          pointers: createPointers(items.length, [
            { label: 'lt', index: lt },
            { label: 'i', index: i },
            { label: 'gt', index: gt },
            { label: 'k', index: targetIndex },
          ]),
        })
        gt -= 1
        continue
      }

      addFrame({
        executedLines: [5],
        operationText: `A[${i}] == pivot, advance i`,
        activeIndices: [i],
        currentRange: toRegion(lo, hi),
        lessRange: toRegion(lo, lt - 1),
        equalRange: toRegion(lt, i),
        greaterRange: toRegion(gt + 1, hi),
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'lt', index: lt },
          { label: 'i', index: i },
          { label: 'gt', index: gt },
          { label: 'k', index: targetIndex },
        ]),
      })
      i += 1
    }

    counters.passes += 1

    return { lt, gt }
  }

  const runSelect = (lo: number, hi: number): number => {
    addFrame({
      executedLines: [1],
      operationText: `selectMoM(A, ${lo}, ${hi}, k=${targetIndex})`,
      currentRange: toRegion(lo, hi),
      pointers: createPointers(items.length, [
        { label: 'lo', index: lo },
        { label: 'hi', index: hi },
        { label: 'k', index: targetIndex },
      ]),
    })

    if (lo === hi) {
      addFrame({
        executedLines: [2],
        operationText: `single value remains at index ${lo}`,
        currentRange: toRegion(lo, hi),
        nextResultIndex: lo,
      })
      return lo
    }

    const pivotIndex = choosePivotIndex(lo, hi)
    const pivotValue = items[pivotIndex]?.value ?? Number.NaN

    addFrame({
      executedLines: [3],
      operationText: `pivotIndex <- ${pivotIndex}`,
      currentRange: toRegion(lo, hi),
      pivotIndex,
      pivotValue,
      pointers: createPointers(items.length, [
        { label: 'pivot', index: pivotIndex },
        { label: 'k', index: targetIndex },
      ]),
    })

    addFrame({
      executedLines: [4],
      operationText: `pivotValue <- ${pivotValue}`,
      currentRange: toRegion(lo, hi),
      pivotIndex,
      pivotValue,
      equalRange: toRegion(pivotIndex, pivotIndex),
      pointers: createPointers(items.length, [
        { label: 'pivot', index: pivotIndex },
        { label: 'k', index: targetIndex },
      ]),
    })

    const partitionResult = partitionByValue(lo, hi, pivotValue)

    if (targetIndex < partitionResult.lt) {
      addFrame({
        executedLines: [6],
        operationText: `k=${targetIndex} in left range [${lo}..${partitionResult.lt - 1}]`,
        currentRange: toRegion(lo, hi),
        lessRange: toRegion(lo, partitionResult.lt - 1),
        equalRange: toRegion(partitionResult.lt, partitionResult.gt),
        greaterRange: toRegion(partitionResult.gt + 1, hi),
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'k', index: targetIndex },
        ]),
      })
      return runSelect(lo, partitionResult.lt - 1)
    }

    if (targetIndex > partitionResult.gt) {
      addFrame({
        executedLines: [7],
        operationText: `k=${targetIndex} in right range [${partitionResult.gt + 1}..${hi}]`,
        currentRange: toRegion(lo, hi),
        lessRange: toRegion(lo, partitionResult.lt - 1),
        equalRange: toRegion(partitionResult.lt, partitionResult.gt),
        greaterRange: toRegion(partitionResult.gt + 1, hi),
        pivotValue,
        pointers: createPointers(items.length, [
          { label: 'k', index: targetIndex },
        ]),
      })
      return runSelect(partitionResult.gt + 1, hi)
    }

    addFrame({
      executedLines: [8],
      operationText: `k=${targetIndex} lies in equal band [${partitionResult.lt}..${partitionResult.gt}]`,
      currentRange: toRegion(lo, hi),
      lessRange: toRegion(lo, partitionResult.lt - 1),
      equalRange: toRegion(partitionResult.lt, partitionResult.gt),
      greaterRange: toRegion(partitionResult.gt + 1, hi),
      pivotValue,
      nextResultIndex: targetIndex,
      pointers: createPointers(items.length, [
        { label: 'k', index: targetIndex },
      ]),
    })
    return targetIndex
  }

  addFrame({
    executedLines: [],
    operationText: `initial dataset loaded (target rank=${targetIndex + 1})`,
  })

  if (items.length > 0) {
    runSelect(0, items.length - 1)
  }

  addFrame({
    executedLines: [],
    operationText:
      resultIndex === null
        ? 'median-of-medians selection complete'
        : `median-of-medians complete, value=${items[resultIndex]?.value ?? Number.NaN}`,
  })

  return {
    algorithmId: 'median-of-medians',
    title: 'Median of Medians',
    pseudocodeLines: medianOfMediansPseudocode,
    frames,
    complexityProfile: momComplexityProfile,
    spaceProfile: momSpaceProfile,
  }
}

const createPartitionLineEvents = (
  frames: readonly PartitionFrame[],
): readonly LineEvent[] =>
  frames.flatMap((frame, frameIndex) =>
    frame.executedLines.map((lineNumber) => ({
      frameIndex,
      lineNumber,
    })),
  )

const getPartitionFrameByLineEvent = (
  timeline: PartitionTimeline,
  lineEvents: readonly LineEvent[],
  lineEventIndex: number,
): PartitionFrame => {
  if (timeline.frames.length === 0) {
    return createEmptyFrame()
  }

  if (lineEvents.length === 0) {
    return timeline.frames[0] ?? createEmptyFrame()
  }

  const boundedIndex = Math.max(0, Math.min(lineEventIndex, lineEvents.length - 1))
  const activeEvent = lineEvents[boundedIndex]
  const frameIndex = activeEvent?.frameIndex ?? 0

  return timeline.frames[frameIndex] ?? timeline.frames[0] ?? createEmptyFrame()
}

const normalizeRank1Based = (kRank1Based: number, values: readonly number[]) => {
  if (values.length === 0) {
    return 1
  }

  return Math.max(1, Math.min(kRank1Based, values.length))
}

const getDefaultRank1Based = (values: readonly number[]) =>
  values.length === 0 ? 1 : Math.ceil(values.length / 2)

const isSelectionAlgorithm = (algorithmId: PartitionSelectionAlgorithmId) =>
  algorithmId === 'quickselect' || algorithmId === 'median-of-medians'

export {
  createMedianOfMediansTimeline,
  createPartitionLineEvents,
  createQuickselectTimeline,
  createQuicksortTimeline,
  getDefaultRank1Based,
  getPartitionFrameByLineEvent,
  isSelectionAlgorithm,
  normalizeRank1Based,
  partitionSelectionPresets,
  quickselectStrategyLabel,
  quickselectStrategyOptions,
  quicksortVariantLabel,
  quicksortVariantOptions,
}
