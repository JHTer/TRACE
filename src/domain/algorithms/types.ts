type AlgorithmSummary = Readonly<{
  id: string
  label: string
}>

type TopicSummary = Readonly<{
  id: string
  shortLabel: string
  title: string
  summary: string
  algorithms: readonly AlgorithmSummary[]
}>

type ElementarySortAlgorithmId = 'bubble-sort' | 'selection-sort' | 'insertion-sort'

type PartitionSelectionAlgorithmId =
  | 'quicksort'
  | 'quickselect'
  | 'median-of-medians'

type QuicksortVariantId = 'out-of-place' | 'hoare' | 'lomuto' | 'dnf'

type QuickselectStrategyId = 'lomuto' | 'hoare'

type Topic02AdvancedSortAlgorithmId = 'heapsort' | 'counting-sort' | 'radix-sort'

type HeapInstructionModeId =
  | 'sort-trace'
  | 'build-heap'
  | 'insert'
  | 'delete-max'
  | 'rise'
  | 'fall'

type RadixBase = 2 | 10

type SortPresetId = 'random' | 'already-sorted' | 'reverse' | 'with-duplicates'

type SortPreset = Readonly<{
  id: SortPresetId
  label: string
  values: readonly number[]
}>

type SortPseudocodeLine = Readonly<{
  lineNumber: number
  text: string
}>

type SortPointers = Readonly<{
  i?: number
  j?: number
  minIndex?: number
  keyIndex?: number
}>

type SortCounters = {
  comparisons: number
  writes: number
  swaps: number
  passes: number
}

type SortRegion = Readonly<{
  start: number
  end: number
}>

type SortValueItem = Readonly<{
  id: string
  value: number
  initialIndex: number
}>

type SortFrame = Readonly<{
  items: readonly SortValueItem[]
  executedLines: readonly number[]
  pointers: SortPointers
  activeIndices: readonly number[]
  sortedRegion: SortRegion | null
  operationText: string
  counters: SortCounters
}>

type SortComplexityProfile = Readonly<{
  best: string
  average: string
  worst: string
  auxiliary: string
  stable: boolean
  inPlace: boolean
}>

type SortSpaceProfile = Readonly<{
  inputStorage: string
  workingStorage: string
  auxiliaryStorage: string
}>

type SortTimeline = Readonly<{
  algorithmId: ElementarySortAlgorithmId
  title: string
  pseudocodeLines: readonly SortPseudocodeLine[]
  frames: readonly SortFrame[]
  complexityProfile: SortComplexityProfile
  spaceProfile: SortSpaceProfile
}>

type PartitionPointer = Readonly<{
  label: string
  index: number
}>

type PartitionFrame = Readonly<{
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
}>

type PartitionTimeline = Readonly<{
  algorithmId: PartitionSelectionAlgorithmId
  title: string
  pseudocodeLines: readonly SortPseudocodeLine[]
  frames: readonly PartitionFrame[]
  complexityProfile: SortComplexityProfile
  spaceProfile: SortSpaceProfile
}>

type LineEvent = Readonly<{
  frameIndex: number
  lineNumber: number
}>

type AdvancedSortCounters = {
  comparisons: number
  writes: number
  swaps: number
  passes: number
  bucketWrites: number
}

type HeapFrameState = Readonly<{
  mode: HeapInstructionModeId
  heapSize: number
  comparePair: readonly number[]
  swapPair: readonly number[]
  insertedValue: number | null
  removedValue: number | null
}>

type CountingFrameState = Readonly<{
  maxValue: number
  counts: readonly number[]
  prefix: readonly number[]
  output: readonly (SortValueItem | null)[]
  placementIndex: number | null
  countIndex: number | null
  scanningIndex: number | null
}>

type RadixFrameState = Readonly<{
  base: RadixBase
  exponent: number
  passNumber: number
  counts: readonly number[]
  prefix: readonly number[]
  output: readonly (SortValueItem | null)[]
  digitByIndex: readonly number[]
  placementIndex: number | null
  countIndex: number | null
  scanningIndex: number | null
}>

type AdvancedSortFrame = Readonly<{
  items: readonly SortValueItem[]
  executedLines: readonly number[]
  operationText: string
  activeIndices: readonly number[]
  counters: AdvancedSortCounters
  heapState: HeapFrameState | null
  countingState: CountingFrameState | null
  radixState: RadixFrameState | null
}>

type AdvancedSortTimeline = Readonly<{
  algorithmId: Topic02AdvancedSortAlgorithmId
  title: string
  pseudocodeLines: readonly SortPseudocodeLine[]
  frames: readonly AdvancedSortFrame[]
  complexityProfile: SortComplexityProfile
  spaceProfile: SortSpaceProfile
  validationError: string | null
}>

type HeapModeOption = Readonly<{
  id: HeapInstructionModeId
  label: string
}>

type RadixBaseOption = Readonly<{
  id: RadixBase
  label: string
}>

type MergeTreeNodeStatus = 'pending' | 'splitting' | 'merging' | 'done'

type MergeTreeNode = Readonly<{
  id: string
  lo: number
  hi: number
  depth: number
  mid: number | null
  status: MergeTreeNodeStatus
}>

type MergeStackPhase = 'split' | 'merge' | 'return'

type MergeStackFrame = Readonly<{
  id: string
  lo: number
  hi: number
  phase: MergeStackPhase
}>

type MergeTempBufferCell = {
  id: string
  value: number
  source: 'left' | 'right'
  consumed: boolean
}

type MergeCounters = {
  comparisons: number
  arrayWrites: number
  bufferWrites: number
  swaps: number
  passes: number
}

type MergeFrame = Readonly<{
  items: readonly SortValueItem[]
  executedLines: readonly number[]
  operationText: string
  activeIndices: readonly number[]
  currentRange: SortRegion | null
  leftRange: SortRegion | null
  rightRange: SortRegion | null
  mergeWriteIndex: number | null
  tempBuffer: readonly MergeTempBufferCell[]
  stack: readonly MergeStackFrame[]
  treeNodes: readonly MergeTreeNode[]
  counters: MergeCounters
}>

type MergeTimeline = Readonly<{
  algorithmId: 'merge-sort'
  title: string
  pseudocodeLines: readonly SortPseudocodeLine[]
  frames: readonly MergeFrame[]
  complexityProfile: SortComplexityProfile
  spaceProfile: SortSpaceProfile
}>

type CardSuit = 'spades' | 'clubs'

type CardItem = Readonly<{
  id: string
  rankKey: string
  suit: CardSuit
  originTag: string
  initialIndex: number
}>

type LaneStep = Readonly<{
  cards: readonly CardItem[]
  activeIndices: readonly number[]
  operationText: string
}>

type StabilityLaneId = 'insertion' | 'selection'

type StabilitySnapshotGroup = Readonly<{
  rankKey: string
  initialOrder: readonly string[]
  currentOrder: readonly string[]
  preserved: boolean
}>

type StabilitySnapshot = Readonly<{
  laneId: StabilityLaneId
  groups: readonly StabilitySnapshotGroup[]
}>

type DynamicProgrammingAlgorithmId =
  | 'salesman-house'
  | 'maze'
  | 'longest-increasing-subsequence'
  | 'longest-common-subsequence'
  | 'edit-distance'
  | 'maximum-subarray'

type DynamicProgrammingPseudocodeLine = Readonly<{
  lineNumber: number
  text: string
}>

type DynamicProgrammingCellTone = 'default' | 'active' | 'dependency' | 'path' | 'best'

type DynamicProgrammingCell = Readonly<{
  label: string
  value: string
  tone: DynamicProgrammingCellTone
}>

type DynamicProgrammingMatrixRow = Readonly<{
  label: string
  cells: readonly DynamicProgrammingCell[]
}>

type DynamicProgrammingPanel =
  | Readonly<{
      kind: 'array'
      title: string
      cells: readonly DynamicProgrammingCell[]
    }>
  | Readonly<{
      kind: 'matrix'
      title: string
      columnLabels: readonly string[]
      rows: readonly DynamicProgrammingMatrixRow[]
    }>

type DynamicProgrammingMetric = Readonly<{
  label: string
  value: string
}>

type DynamicProgrammingPreset = Readonly<{
  id: string
  label: string
}>

type DynamicProgrammingComplexityProfile = Readonly<{
  time: string
  space: string
  note: string
}>

type DynamicProgrammingFrame = Readonly<{
  executedLines: readonly number[]
  operationText: string
  detailText: string
  panels: readonly DynamicProgrammingPanel[]
  metrics: readonly DynamicProgrammingMetric[]
  reconstructionText: string | null
  isComplete: boolean
}>

type DynamicProgrammingTimeline = Readonly<{
  algorithmId: DynamicProgrammingAlgorithmId
  title: string
  subtitle: string
  recurrence: string
  directionNote: string | null
  pseudocodeLines: readonly DynamicProgrammingPseudocodeLine[]
  complexityProfile: DynamicProgrammingComplexityProfile
  presets: readonly DynamicProgrammingPreset[]
  activePresetId: string
  frames: readonly DynamicProgrammingFrame[]
}>

type GraphAlgorithmId =
  | 'graph-representation'
  | 'breadth-first-search'
  | 'depth-first-search'
  | 'connected-components'
  | 'topological-sorting'
  | 'dijkstra-algorithm'
  | 'bellman-ford-algorithm'
  | 'floyd-warshall-algorithm'
  | 'prim-algorithm'
  | 'kruskal-algorithm'
  | 'union-find'

type GraphTraversalAlgorithmId = Exclude<GraphAlgorithmId, 'graph-representation'>

type GraphTraversalScope = 'start-only' | 'full-graph'

type UnionFindModeId =
  | 'baseline'
  | 'path-compression'
  | 'union-by-rank'
  | 'combined'

type GraphEditorMode = 'build' | 'run'

type GraphNode = Readonly<{
  id: string
  label: string
  x: number
  y: number
  order: number
}>

type GraphEdge = Readonly<{
  id: string
  from: string
  to: string
  weight: number
}>

type GraphModel = Readonly<{
  nodes: readonly GraphNode[]
  edges: readonly GraphEdge[]
}>

type GraphNeighbor = Readonly<{
  nodeId: string
  label: string
  weight: number
}>

type GraphAdjacencyEntry = Readonly<{
  nodeId: string
  label: string
  neighbors: readonly GraphNeighbor[]
}>

type GraphAdjacencyMatrix = Readonly<{
  labels: readonly string[]
  rows: readonly (readonly (number | null)[])[]
}>

type GraphPseudocodeLine = Readonly<{
  lineNumber: number
  text: string
}>

type GraphRepresentationFrame = Readonly<{
  graph: GraphModel
  executedLines: readonly number[]
  operationText: string
  adjacencyList: readonly GraphAdjacencyEntry[]
  adjacencyMatrix: GraphAdjacencyMatrix
}>

type GraphRepresentationTimeline = Readonly<{
  algorithmId: 'graph-representation'
  title: string
  pseudocodeLines: readonly GraphPseudocodeLine[]
  frames: readonly GraphRepresentationFrame[]
}>

type GraphTraversalFrame = Readonly<{
  graph: GraphModel
  executedLines: readonly number[]
  operationText: string
  adjacencyList: readonly GraphAdjacencyEntry[]
  adjacencyMatrix: GraphAdjacencyMatrix
  activeNodeId: string | null
  activeEdgeId: string | null
  discoveredNodeIds: readonly string[]
  processingNodeIds: readonly string[]
  completedNodeIds: readonly string[]
  queueNodeIds: readonly string[]
  callStackNodeIds: readonly string[]
  parentByNodeId: Readonly<Record<string, string | null>>
  distanceByNodeId: Readonly<Record<string, number | null>>
  visitOrderNodeIds: readonly string[]
  traversalTreeEdgeIds: readonly string[]
  reconstructedPathNodeIds: readonly string[]
  reconstructedPathEdgeIds: readonly string[]
  componentByNodeId?: Readonly<Record<string, number | null>>
  componentCount?: number
  finishOrderNodeIds?: readonly string[]
  topologicalOrderNodeIds?: readonly string[]
  cycleDetected?: boolean
  priorityQueueEntries?: readonly Readonly<{ nodeId: string; key: number }>[]
  finalizedNodeIds?: readonly string[]
  currentPass?: number
  negativeCycleNodeIds?: readonly string[]
  distanceMatrix?: readonly (readonly (number | null)[])[]
  currentK?: number | null
  currentI?: number | null
  currentJ?: number | null
  mstEdgeIds?: readonly string[]
  edgeDecisionById?: Readonly<Record<string, 'accepted' | 'rejected' | 'pending'>>
  ufParentByNodeId?: Readonly<Record<string, string>>
  ufRankByNodeId?: Readonly<Record<string, number>>
  ufRepresentativeByNodeId?: Readonly<Record<string, string>>
  ufMode?: UnionFindModeId
  sortedEdgeIds?: readonly string[]
  currentEdgeId?: string | null
  isComplete: boolean
}>

type GraphTraversalTimeline = Readonly<{
  algorithmId: GraphTraversalAlgorithmId
  title: string
  pseudocodeLines: readonly GraphPseudocodeLine[]
  frames: readonly GraphTraversalFrame[]
  startNodeId: string | null
  targetNodeId: string | null
  scope: GraphTraversalScope
}>

type GraphEditorSelection = Readonly<{
  nodeId: string | null
  edgeId: string | null
}>

type GraphEditorValidationCode =
  | 'node-limit'
  | 'self-loop'
  | 'duplicate-edge'
  | 'negative-edge'

type GraphEditorValidation = Readonly<{
  code: GraphEditorValidationCode
  message: string
}>

type GraphEditorState = Readonly<{
  mode: GraphEditorMode
  maxNodeCount: number
  selection: GraphEditorSelection
  validation: GraphEditorValidation | null
}>

export type {
  AdvancedSortCounters,
  AdvancedSortFrame,
  AdvancedSortTimeline,
  AlgorithmSummary,
  CardItem,
  CardSuit,
  CountingFrameState,
  DynamicProgrammingAlgorithmId,
  DynamicProgrammingCell,
  DynamicProgrammingCellTone,
  DynamicProgrammingComplexityProfile,
  DynamicProgrammingFrame,
  DynamicProgrammingMatrixRow,
  DynamicProgrammingMetric,
  DynamicProgrammingPanel,
  DynamicProgrammingPreset,
  DynamicProgrammingPseudocodeLine,
  DynamicProgrammingTimeline,
  ElementarySortAlgorithmId,
  GraphAdjacencyEntry,
  GraphAdjacencyMatrix,
  GraphAlgorithmId,
  GraphEdge,
  GraphEditorMode,
  GraphEditorSelection,
  GraphEditorState,
  GraphEditorValidation,
  GraphEditorValidationCode,
  GraphModel,
  GraphNeighbor,
  GraphNode,
  GraphPseudocodeLine,
  GraphRepresentationFrame,
  GraphRepresentationTimeline,
  GraphTraversalAlgorithmId,
  GraphTraversalFrame,
  GraphTraversalScope,
  GraphTraversalTimeline,
  HeapFrameState,
  HeapInstructionModeId,
  HeapModeOption,
  RadixBase,
  RadixBaseOption,
  RadixFrameState,
  PartitionFrame,
  PartitionPointer,
  PartitionSelectionAlgorithmId,
  PartitionTimeline,
  QuickselectStrategyId,
  QuicksortVariantId,
  LaneStep,
  LineEvent,
  MergeCounters,
  MergeFrame,
  MergeStackFrame,
  MergeStackPhase,
  MergeTempBufferCell,
  MergeTimeline,
  MergeTreeNode,
  MergeTreeNodeStatus,
  StabilityLaneId,
  StabilitySnapshot,
  StabilitySnapshotGroup,
  SortComplexityProfile,
  SortCounters,
  SortFrame,
  SortPointers,
  SortPreset,
  SortPresetId,
  SortPseudocodeLine,
  SortRegion,
  SortSpaceProfile,
  SortTimeline,
  SortValueItem,
  Topic02AdvancedSortAlgorithmId,
  TopicSummary,
  UnionFindModeId,
}
