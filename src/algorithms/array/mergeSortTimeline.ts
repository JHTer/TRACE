import type {
  LineEvent,
  MergeCounters,
  MergeFrame,
  MergeStackFrame,
  MergeTempBufferCell,
  MergeTimeline,
  MergeTreeNode,
  SortComplexityProfile,
  SortPreset,
  SortPseudocodeLine,
  SortRegion,
  SortSpaceProfile,
  SortValueItem,
} from '../../domain/algorithms/types.ts'

type MutableMergeTreeNode = {
  id: string
  lo: number
  hi: number
  depth: number
  mid: number | null
  leftChildId: string | null
  rightChildId: string | null
}

const mergeSortPresets: readonly SortPreset[] = [
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

const mergeSortPseudocodeLines: readonly SortPseudocodeLine[] = [
  { lineNumber: 1, text: 'mergeSort(A, lo, hi):' },
  { lineNumber: 2, text: '    if lo >= hi: return' },
  { lineNumber: 3, text: '    mid <- floor((lo + hi) / 2)' },
  { lineNumber: 4, text: '    mergeSort(A, lo, mid)' },
  { lineNumber: 5, text: '    mergeSort(A, mid + 1, hi)' },
  { lineNumber: 6, text: '    merge(A, lo, mid, hi)' },
  { lineNumber: 7, text: 'merge(A, lo, mid, hi):' },
  { lineNumber: 8, text: '    copy left/right halves into temp buffers' },
  { lineNumber: 9, text: '    while both buffers non-empty: write smaller to A' },
  { lineNumber: 10, text: '    copy remaining buffer values to A' },
]

const mergeSortComplexityProfile: SortComplexityProfile = {
  best: 'O(n log n)',
  average: 'O(n log n)',
  worst: 'O(n log n)',
  auxiliary: 'O(n)',
  stable: true,
  inPlace: false,
}

const mergeSortSpaceProfile: SortSpaceProfile = {
  inputStorage: 'O(n) input array',
  workingStorage: 'O(log n) recursion stack',
  auxiliaryStorage: 'O(n) temporary merge buffer',
}

const createValueItems = (values: readonly number[]): SortValueItem[] =>
  values.map((value, index) => ({
    id: `item-${index}`,
    value,
    initialIndex: index,
  }))

const cloneItems = (items: readonly SortValueItem[]): readonly SortValueItem[] => [...items]

const cloneRange = (range: SortRegion | null): SortRegion | null =>
  range === null ? null : { ...range }

const toRegion = (start: number, end: number): SortRegion | null =>
  start <= end ? { start, end } : null

const createMergeCounters = (): MergeCounters => ({
  comparisons: 0,
  arrayWrites: 0,
  bufferWrites: 0,
  swaps: 0,
  passes: 0,
})

const cloneCounters = (counters: MergeCounters): MergeCounters => ({ ...counters })

const cloneStack = (stack: readonly MergeStackFrame[]): readonly MergeStackFrame[] =>
  stack.map((frame) => ({ ...frame }))

const cloneTempBuffer = (
  tempBuffer: readonly MergeTempBufferCell[],
): readonly MergeTempBufferCell[] => tempBuffer.map((cell) => ({ ...cell }))

const createTreeNodeId = (lo: number, hi: number) => `node-${lo}-${hi}`

const buildMergeTree = (
  lo: number,
  hi: number,
  depth: number,
  nodes: MutableMergeTreeNode[],
): string => {
  const id = createTreeNodeId(lo, hi)
  if (lo >= hi) {
    nodes.push({
      id,
      lo,
      hi,
      depth,
      mid: null,
      leftChildId: null,
      rightChildId: null,
    })
    return id
  }

  const mid = lo + Math.floor((hi - lo) / 2)
  const leftChildId = buildMergeTree(lo, mid, depth + 1, nodes)
  const rightChildId = buildMergeTree(mid + 1, hi, depth + 1, nodes)

  nodes.push({
    id,
    lo,
    hi,
    depth,
    mid,
    leftChildId,
    rightChildId,
  })

  return id
}

const createEmptyMergeFrame = (): MergeFrame => ({
  items: [],
  executedLines: [],
  operationText: 'no frame',
  activeIndices: [],
  currentRange: null,
  leftRange: null,
  rightRange: null,
  mergeWriteIndex: null,
  tempBuffer: [],
  stack: [],
  treeNodes: [],
  counters: createMergeCounters(),
})

const createMergeSortTimeline = (values: readonly number[]): MergeTimeline => {
  const items = createValueItems(values)
  const counters = createMergeCounters()
  const stack: MergeStackFrame[] = []
  const frames: MergeFrame[] = []
  const treeNodes: MutableMergeTreeNode[] = []
  const treeStatusById: Record<string, MergeTreeNode['status']> = {}
  const nodeById: Record<string, MutableMergeTreeNode> = {}
  const n = items.length

  if (n > 0) {
    buildMergeTree(0, n - 1, 0, treeNodes)
  }

  treeNodes.forEach((node) => {
    nodeById[node.id] = node
    treeStatusById[node.id] = 'pending'
  })

  const getTreeSnapshot = (): readonly MergeTreeNode[] =>
    treeNodes.map((node) => ({
      id: node.id,
      lo: node.lo,
      hi: node.hi,
      depth: node.depth,
      mid: node.mid,
      status: treeStatusById[node.id] ?? 'pending',
    }))

  const addFrame = ({
    executedLines,
    operationText,
    activeIndices = [],
    currentRange = null,
    leftRange = null,
    rightRange = null,
    mergeWriteIndex = null,
    tempBuffer = [],
  }: {
    executedLines: readonly number[]
    operationText: string
    activeIndices?: readonly number[]
    currentRange?: SortRegion | null
    leftRange?: SortRegion | null
    rightRange?: SortRegion | null
    mergeWriteIndex?: number | null
    tempBuffer?: readonly MergeTempBufferCell[]
  }) => {
    frames.push({
      items: cloneItems(items),
      executedLines: [...executedLines],
      operationText,
      activeIndices: [...activeIndices],
      currentRange: cloneRange(currentRange),
      leftRange: cloneRange(leftRange),
      rightRange: cloneRange(rightRange),
      mergeWriteIndex,
      tempBuffer: cloneTempBuffer(tempBuffer),
      stack: cloneStack(stack),
      treeNodes: getTreeSnapshot(),
      counters: cloneCounters(counters),
    })
  }

  addFrame({
    executedLines: [],
    operationText: 'initial dataset loaded',
  })

  const runMerge = (lo: number, mid: number, hi: number, nodeId: string) => {
    addFrame({
      executedLines: [7],
      operationText: `merge(A, ${lo}, ${mid}, ${hi})`,
      currentRange: toRegion(lo, hi),
      leftRange: toRegion(lo, mid),
      rightRange: toRegion(mid + 1, hi),
    })

    const left = items.slice(lo, mid + 1)
    const right = items.slice(mid + 1, hi + 1)
    const leftBuffer: MergeTempBufferCell[] = left.map((item, index) => ({
      id: `left-${nodeId}-${index}`,
      value: item?.value ?? Number.NaN,
      source: 'left',
      consumed: false,
    }))
    const rightBuffer: MergeTempBufferCell[] = right.map((item, index) => ({
      id: `right-${nodeId}-${index}`,
      value: item?.value ?? Number.NaN,
      source: 'right',
      consumed: false,
    }))
    const mergedBuffer = [...leftBuffer, ...rightBuffer]

    counters.bufferWrites += left.length + right.length
    addFrame({
      executedLines: [8],
      operationText: `copied ${left.length + right.length} items into temporary buffers`,
      currentRange: toRegion(lo, hi),
      leftRange: toRegion(lo, mid),
      rightRange: toRegion(mid + 1, hi),
      mergeWriteIndex: lo,
      tempBuffer: mergedBuffer,
    })

    let leftIndex = 0
    let rightIndex = 0
    let writeIndex = lo

    while (leftIndex < left.length && rightIndex < right.length) {
      const leftItem = left[leftIndex]
      const rightItem = right[rightIndex]

      if (leftItem === undefined || rightItem === undefined) {
        break
      }

      counters.comparisons += 1
      const chooseLeft = leftItem.value <= rightItem.value
      const chosenItem = chooseLeft ? leftItem : rightItem

      if (chooseLeft) {
        const cell = leftBuffer[leftIndex]
        if (cell !== undefined) {
          cell.consumed = true
        }
        leftIndex += 1
      } else {
        const cell = rightBuffer[rightIndex]
        if (cell !== undefined) {
          cell.consumed = true
        }
        rightIndex += 1
      }

      items[writeIndex] = chosenItem
      counters.arrayWrites += 1

      addFrame({
        executedLines: [9],
        operationText: `write ${chosenItem.value} to A[${writeIndex}] from ${chooseLeft ? 'left' : 'right'} buffer`,
        activeIndices: [writeIndex],
        currentRange: toRegion(lo, hi),
        leftRange: toRegion(lo, mid),
        rightRange: toRegion(mid + 1, hi),
        mergeWriteIndex: writeIndex,
        tempBuffer: mergedBuffer,
      })

      writeIndex += 1
    }

    while (leftIndex < left.length) {
      const leftItem = left[leftIndex]
      const leftCell = leftBuffer[leftIndex]
      if (leftItem === undefined || leftCell === undefined) {
        break
      }

      leftCell.consumed = true
      items[writeIndex] = leftItem
      counters.arrayWrites += 1

      addFrame({
        executedLines: [10],
        operationText: `drain left buffer value ${leftItem.value} to A[${writeIndex}]`,
        activeIndices: [writeIndex],
        currentRange: toRegion(lo, hi),
        leftRange: toRegion(lo, mid),
        rightRange: toRegion(mid + 1, hi),
        mergeWriteIndex: writeIndex,
        tempBuffer: mergedBuffer,
      })

      leftIndex += 1
      writeIndex += 1
    }

    while (rightIndex < right.length) {
      const rightItem = right[rightIndex]
      const rightCell = rightBuffer[rightIndex]
      if (rightItem === undefined || rightCell === undefined) {
        break
      }

      rightCell.consumed = true
      items[writeIndex] = rightItem
      counters.arrayWrites += 1

      addFrame({
        executedLines: [10],
        operationText: `drain right buffer value ${rightItem.value} to A[${writeIndex}]`,
        activeIndices: [writeIndex],
        currentRange: toRegion(lo, hi),
        leftRange: toRegion(lo, mid),
        rightRange: toRegion(mid + 1, hi),
        mergeWriteIndex: writeIndex,
        tempBuffer: mergedBuffer,
      })

      rightIndex += 1
      writeIndex += 1
    }

    counters.passes += 1
    addFrame({
      executedLines: [10],
      operationText: `merge pass complete for range [${lo}..${hi}]`,
      currentRange: toRegion(lo, hi),
      leftRange: toRegion(lo, mid),
      rightRange: toRegion(mid + 1, hi),
      tempBuffer: mergedBuffer,
    })
  }

  const runSort = (lo: number, hi: number, nodeId: string) => {
    const node = nodeById[nodeId]
    stack.push({ id: nodeId, lo, hi, phase: 'split' })
    treeStatusById[nodeId] = 'splitting'

    addFrame({
      executedLines: [1],
      operationText: `enter mergeSort(A, ${lo}, ${hi})`,
      currentRange: toRegion(lo, hi),
    })

    const isBaseCase = lo >= hi
    addFrame({
      executedLines: [2],
      operationText: isBaseCase ? `base case reached at [${lo}..${hi}], return` : 'continue splitting',
      currentRange: toRegion(lo, hi),
    })

    if (isBaseCase || node === undefined || node.mid === null) {
      treeStatusById[nodeId] = 'done'
      stack[stack.length - 1] = { id: nodeId, lo, hi, phase: 'return' }
      addFrame({
        executedLines: [2],
        operationText: `return from mergeSort(A, ${lo}, ${hi})`,
        currentRange: toRegion(lo, hi),
      })
      stack.pop()
      return
    }

    const mid = node.mid
    addFrame({
      executedLines: [3],
      operationText: `mid <- ${mid}`,
      currentRange: toRegion(lo, hi),
      leftRange: toRegion(lo, mid),
      rightRange: toRegion(mid + 1, hi),
    })

    addFrame({
      executedLines: [4],
      operationText: `recurse left range [${lo}..${mid}]`,
      currentRange: toRegion(lo, hi),
      leftRange: toRegion(lo, mid),
      rightRange: toRegion(mid + 1, hi),
    })

    if (node.leftChildId !== null) {
      runSort(lo, mid, node.leftChildId)
    }

    addFrame({
      executedLines: [5],
      operationText: `recurse right range [${mid + 1}..${hi}]`,
      currentRange: toRegion(lo, hi),
      leftRange: toRegion(lo, mid),
      rightRange: toRegion(mid + 1, hi),
    })

    if (node.rightChildId !== null) {
      runSort(mid + 1, hi, node.rightChildId)
    }

    stack[stack.length - 1] = { id: nodeId, lo, hi, phase: 'merge' }
    treeStatusById[nodeId] = 'merging'

    addFrame({
      executedLines: [6],
      operationText: `merge left [${lo}..${mid}] and right [${mid + 1}..${hi}]`,
      currentRange: toRegion(lo, hi),
      leftRange: toRegion(lo, mid),
      rightRange: toRegion(mid + 1, hi),
    })

    runMerge(lo, mid, hi, nodeId)

    treeStatusById[nodeId] = 'done'
    stack[stack.length - 1] = { id: nodeId, lo, hi, phase: 'return' }
    addFrame({
      executedLines: [6],
      operationText: `range [${lo}..${hi}] sorted and returned`,
      currentRange: toRegion(lo, hi),
    })
    stack.pop()
  }

  if (n > 0) {
    const rootId = createTreeNodeId(0, n - 1)
    runSort(0, n - 1, rootId)
  }

  return {
    algorithmId: 'merge-sort',
    title: 'Merge Sort',
    pseudocodeLines: mergeSortPseudocodeLines,
    frames,
    complexityProfile: mergeSortComplexityProfile,
    spaceProfile: mergeSortSpaceProfile,
  }
}

const createMergeLineEvents = (frames: readonly MergeFrame[]): readonly LineEvent[] =>
  frames.flatMap((frame, frameIndex) =>
    frame.executedLines.map((lineNumber) => ({
      frameIndex,
      lineNumber,
    })),
  )

const getMergeFrameByLineEvent = (
  timeline: MergeTimeline,
  lineEvents: readonly LineEvent[],
  lineEventIndex: number,
): MergeFrame => {
  if (timeline.frames.length === 0) {
    return createEmptyMergeFrame()
  }

  if (lineEvents.length === 0) {
    return timeline.frames[0] ?? createEmptyMergeFrame()
  }

  const boundedIndex = Math.max(0, Math.min(lineEventIndex, lineEvents.length - 1))
  const activeEvent = lineEvents[boundedIndex]
  const frameIndex = activeEvent?.frameIndex ?? 0

  return timeline.frames[frameIndex] ?? timeline.frames[0] ?? createEmptyMergeFrame()
}

export {
  createMergeLineEvents,
  createMergeSortTimeline,
  getMergeFrameByLineEvent,
  mergeSortPseudocodeLines,
  mergeSortPresets,
}
