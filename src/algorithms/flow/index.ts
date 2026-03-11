import type {
  FlowComplexityProfile,
  FlowEdge,
  FlowEditorValidation,
  FlowFrame,
  FlowModel,
  FlowNetworkAlgorithmId,
  FlowPanelRow,
  FlowPanelSection,
  FlowTimeline,
} from '../../domain/algorithms/types.ts'

const flowNetworkDirectoryLabelByAlgorithm: Record<FlowNetworkAlgorithmId, string> = {
  'flow-networks': 'FLOW NETWORKS',
  'residual-graphs': 'RESIDUAL GRAPHS',
  'augmenting-paths': 'AUGMENTING PATHS',
  'ford-fulkerson-algorithm': 'FORD FULKERSON ALGORITHM',
  'minimum-cut': 'MINIMUM CUT',
  'maximum-flow-minimum-cut-theorem': 'MAXIMUM FLOW MINIMUM CUT THEOREM',
  'bipartite-matching': 'BIPARTITE MATCHING',
}

const flowNetworkSubtitleByAlgorithm: Record<FlowNetworkAlgorithmId, string> = {
  'flow-networks':
    'Build a directed capacity graph, then inspect feasible flow, conservation, and total flow value on your own network.',
  'residual-graphs':
    'Compare your original flow network with its derived residual graph so forward and reverse residual capacity stay explicit.',
  'augmenting-paths':
    'Highlight one augmenting path in the residual graph, mark its bottleneck, and show the resulting flow update.',
  'ford-fulkerson-algorithm':
    'Run the textbook Ford-Fulkerson loop on the current graph with residual search, augmentation, and live max-flow updates.',
  'minimum-cut':
    'After max flow completes, inspect the final source-reachable partition and the original cut edges it defines.',
  'maximum-flow-minimum-cut-theorem':
    'Use the terminal residual state to compare max-flow value and cut capacity side by side on the same graph.',
  'bipartite-matching':
    'Treat a unit-capacity reduction as max flow, then extract matching edges from the final flow state.',
}

const flowComplexityByAlgorithm: Record<FlowNetworkAlgorithmId, FlowComplexityProfile> = {
  'flow-networks': {
    note: 'This introductory page emphasizes valid flow state and conservation bookkeeping on the current graph.',
    space: 'O(|V| + |E|)',
    time: 'O(|V| + |E|)',
  },
  'residual-graphs': {
    note: 'Residual edges are rebuilt directly from the current flow by scanning each original edge once.',
    space: 'O(|V| + |E|)',
    time: 'O(|V| + |E|)',
  },
  'augmenting-paths': {
    note: 'One path search and one augmentation touch only the residual graph and the edges on that path.',
    space: 'O(|V| + |E|)',
    time: 'O(|V| + |E|)',
  },
  'ford-fulkerson-algorithm': {
    note: 'This implementation uses depth-first residual search to align with the notes and classroom presentation.',
    space: 'O(|V| + |E|)',
    time: 'O(|E| * |f_max|)',
  },
  'minimum-cut': {
    note: 'A single residual reachability pass identifies the source side once max flow terminates.',
    space: 'O(|V| + |E|)',
    time: 'O(|V| + |E|)',
  },
  'maximum-flow-minimum-cut-theorem': {
    note: 'The theorem page reuses the terminal max-flow state and compares two scalars: flow value and cut capacity.',
    space: 'O(|V| + |E|)',
    time: 'O(|V| + |E|)',
  },
  'bipartite-matching': {
    note: 'When the graph is a unit-capacity reduction, max-flow edges between the two partitions can be read as matches.',
    space: 'O(|V| + |E|)',
    time: 'O(|E| * |f_max|)',
  },
}

const defaultFlowModel: FlowModel = {
  nodes: [
    { id: 'node-0', label: 's', x: 110, y: 220, order: 0, role: 'source' },
    { id: 'node-1', label: 'A', x: 300, y: 110, order: 1, role: 'internal' },
    { id: 'node-2', label: 'C', x: 300, y: 330, order: 2, role: 'internal' },
    { id: 'node-3', label: 'B', x: 530, y: 110, order: 3, role: 'internal' },
    { id: 'node-4', label: 'D', x: 530, y: 330, order: 4, role: 'internal' },
    { id: 'node-5', label: 't', x: 760, y: 220, order: 5, role: 'sink' },
  ],
  edges: [
    { id: 'edge-node-0-node-1', from: 'node-0', to: 'node-1', capacity: 16, flow: 0, kind: 'original' },
    { id: 'edge-node-0-node-2', from: 'node-0', to: 'node-2', capacity: 13, flow: 0, kind: 'original' },
    { id: 'edge-node-1-node-3', from: 'node-1', to: 'node-3', capacity: 12, flow: 0, kind: 'original' },
    { id: 'edge-node-2-node-1', from: 'node-2', to: 'node-1', capacity: 4, flow: 0, kind: 'original' },
    { id: 'edge-node-2-node-4', from: 'node-2', to: 'node-4', capacity: 14, flow: 0, kind: 'original' },
    { id: 'edge-node-4-node-3', from: 'node-4', to: 'node-3', capacity: 7, flow: 0, kind: 'original' },
    { id: 'edge-node-3-node-5', from: 'node-3', to: 'node-5', capacity: 20, flow: 0, kind: 'original' },
    { id: 'edge-node-4-node-5', from: 'node-4', to: 'node-5', capacity: 4, flow: 0, kind: 'original' },
  ],
  sourceNodeId: 'node-0',
  sinkNodeId: 'node-5',
}

const defaultMatchingModel: FlowModel = {
  nodes: [
    { id: 'node-0', label: 's', x: 110, y: 220, order: 0, role: 'source' },
    { id: 'node-1', label: 'U1', x: 280, y: 120, order: 1, role: 'left-partition' },
    { id: 'node-2', label: 'U2', x: 280, y: 320, order: 2, role: 'left-partition' },
    { id: 'node-3', label: 'V1', x: 540, y: 120, order: 3, role: 'right-partition' },
    { id: 'node-4', label: 'V2', x: 540, y: 320, order: 4, role: 'right-partition' },
    { id: 'node-5', label: 't', x: 760, y: 220, order: 5, role: 'sink' },
  ],
  edges: [
    { id: 'edge-node-0-node-1', from: 'node-0', to: 'node-1', capacity: 1, flow: 0, kind: 'original' },
    { id: 'edge-node-0-node-2', from: 'node-0', to: 'node-2', capacity: 1, flow: 0, kind: 'original' },
    { id: 'edge-node-1-node-3', from: 'node-1', to: 'node-3', capacity: 1, flow: 0, kind: 'original' },
    { id: 'edge-node-1-node-4', from: 'node-1', to: 'node-4', capacity: 1, flow: 0, kind: 'original' },
    { id: 'edge-node-2-node-4', from: 'node-2', to: 'node-4', capacity: 1, flow: 0, kind: 'original' },
    { id: 'edge-node-3-node-5', from: 'node-3', to: 'node-5', capacity: 1, flow: 0, kind: 'original' },
    { id: 'edge-node-4-node-5', from: 'node-4', to: 'node-5', capacity: 1, flow: 0, kind: 'original' },
  ],
  sourceNodeId: 'node-0',
  sinkNodeId: 'node-5',
}

type ResidualPath = Readonly<{
  nodeIds: readonly string[]
  residualEdgeIds: readonly string[]
  originalEdgeIds: readonly string[]
  bottleneckValue: number
}>

type AugmentationStep = Readonly<{
  beforeModel: FlowModel
  beforeResidual: FlowModel
  path: ResidualPath
  afterModel: FlowModel
  afterResidual: FlowModel
}>

type FlowRunSummary = Readonly<{
  initialModel: FlowModel
  initialResidual: FlowModel
  steps: readonly AugmentationStep[]
  finalModel: FlowModel
  finalResidual: FlowModel
  reachableSourceSideNodeIds: readonly string[]
  sinkSideNodeIds: readonly string[]
  cutEdges: readonly FlowEdge[]
  cutCapacity: number
  matchingEdgeIds: readonly string[]
}>

const cloneFlowModel = (model: FlowModel): FlowModel => ({
  edges: model.edges.map((edge) => ({ ...edge })),
  nodes: model.nodes.map((node) => ({ ...node })),
  sinkNodeId: model.sinkNodeId,
  sourceNodeId: model.sourceNodeId,
})

const normalizeFlowModel = (model: FlowModel): FlowModel => ({
  edges: model.edges.map((edge) => ({
    ...edge,
    capacity: Math.max(1, Math.floor(edge.capacity)),
    flow: edge.kind === 'original' ? Math.max(0, edge.flow) : 0,
    kind: 'original',
    label: undefined,
    relatedEdgeId: undefined,
  })),
  nodes: model.nodes.map((node) => ({
    ...node,
    role:
      model.sourceNodeId === node.id
        ? 'source'
        : model.sinkNodeId === node.id
          ? 'sink'
          : node.role === 'left-partition' || node.role === 'right-partition'
            ? node.role
            : 'internal',
  })),
  sinkNodeId: model.sinkNodeId,
  sourceNodeId: model.sourceNodeId,
})

const createZeroFlowModel = (model: FlowModel): FlowModel =>
  normalizeFlowModel({
    ...model,
    edges: model.edges.map((edge) => ({ ...edge, flow: 0 })),
  })

const getFlowSampleModel = (algorithmId: FlowNetworkAlgorithmId): FlowModel =>
  cloneFlowModel(
    algorithmId === 'bipartite-matching' ? defaultMatchingModel : defaultFlowModel,
  )

const calculateMaxFlowValue = (model: FlowModel) => {
  if (model.sourceNodeId === null) {
    return 0
  }

  return model.edges
    .filter((edge) => edge.from === model.sourceNodeId)
    .reduce((total, edge) => total + edge.flow, 0)
}

const formatEdgeLabel = (edge: FlowEdge) => edge.label ?? `${edge.flow}/${edge.capacity}`

const buildEdgeRows = (title: string, model: FlowModel): FlowPanelSection => ({
  rows: model.edges.map(
    (edge): FlowPanelRow => ({
      label: `${edge.from} -> ${edge.to}`,
      value: formatEdgeLabel(edge),
    }),
  ),
  title,
})

const buildNodeBalanceRows = (model: FlowModel): FlowPanelSection => ({
  rows: model.nodes.map((node) => {
    const incoming = model.edges
      .filter((edge) => edge.to === node.id)
      .reduce((total, edge) => total + edge.flow, 0)
    const outgoing = model.edges
      .filter((edge) => edge.from === node.id)
      .reduce((total, edge) => total + edge.flow, 0)

    const value =
      node.role === 'source'
        ? `out ${outgoing}`
        : node.role === 'sink'
          ? `in ${incoming}`
          : `in ${incoming} / out ${outgoing}`

    return {
      label: node.label,
      value,
    }
  }),
  title: 'NODE FLOW BALANCE',
})

const buildPathSection = (pathNodeIds: readonly string[], bottleneckValue: number | null): FlowPanelSection => ({
  rows: [
    {
      label: 'augmenting path',
      value: pathNodeIds.length === 0 ? '-' : pathNodeIds.join(' -> '),
    },
    {
      label: 'bottleneck',
      value: bottleneckValue === null ? '-' : String(bottleneckValue),
    },
  ],
  title: 'PATH STATE',
})

const buildCutSection = (
  sourceSideNodeIds: readonly string[],
  sinkSideNodeIds: readonly string[],
  cutEdges: readonly FlowEdge[],
): FlowPanelSection => ({
  rows: [
    { label: 'source side', value: sourceSideNodeIds.length === 0 ? '[]' : `[${sourceSideNodeIds.join(', ')}]` },
    { label: 'sink side', value: sinkSideNodeIds.length === 0 ? '[]' : `[${sinkSideNodeIds.join(', ')}]` },
    {
      label: 'cut edges',
      value:
        cutEdges.length === 0
          ? '[]'
          : `[${cutEdges.map((edge) => `${edge.from}->${edge.to}:${edge.capacity}`).join(', ')}]`,
    },
  ],
  title: 'CUT PARTITION',
})

const buildMatchingSection = (matchingEdgeIds: readonly string[], model: FlowModel): FlowPanelSection => ({
  rows:
    matchingEdgeIds.length === 0
      ? [{ label: 'matching', value: '-' }]
      : matchingEdgeIds.map((edgeId) => {
          const edge = model.edges.find((candidate) => candidate.id === edgeId)
          return {
            label: edge?.from ?? edgeId,
            value: edge?.to ?? '-',
          }
        }),
  title: 'MATCHING',
})

const buildCorePanels = (
  originalNetwork: FlowModel,
  residualNetwork: FlowModel,
  pathNodeIds: readonly string[] = [],
  bottleneckValue: number | null = null,
) => [
  buildEdgeRows('FLOW / CAPACITY', originalNetwork),
  buildEdgeRows('RESIDUAL CAPACITY', residualNetwork),
  buildNodeBalanceRows(originalNetwork),
  buildPathSection(pathNodeIds, bottleneckValue),
]

const createFrame = (
  executedLines: readonly number[],
  operationText: string,
  detailText: string,
  originalNetwork: FlowModel,
  residualNetwork: FlowModel,
  panelSections: readonly FlowPanelSection[],
  options?: Readonly<{
    activeOriginalEdgeIds?: readonly string[]
    activeResidualEdgeIds?: readonly string[]
    activeNodeIds?: readonly string[]
    augmentingPathNodeIds?: readonly string[]
    bottleneckValue?: number | null
    cutSourceSideNodeIds?: readonly string[]
    cutSinkSideNodeIds?: readonly string[]
    matchingEdgeIds?: readonly string[]
    isComplete?: boolean
  }>,
): FlowFrame => ({
  activeNodeIds: options?.activeNodeIds ?? [],
  activeOriginalEdgeIds: options?.activeOriginalEdgeIds ?? [],
  activeResidualEdgeIds: options?.activeResidualEdgeIds ?? [],
  augmentingPathNodeIds: options?.augmentingPathNodeIds ?? [],
  bottleneckValue: options?.bottleneckValue ?? null,
  cutSinkSideNodeIds: options?.cutSinkSideNodeIds ?? [],
  cutSourceSideNodeIds: options?.cutSourceSideNodeIds ?? [],
  detailText,
  executedLines,
  isComplete: options?.isComplete ?? false,
  matchingEdgeIds: options?.matchingEdgeIds ?? [],
  maxFlowValue: calculateMaxFlowValue(originalNetwork),
  operationText,
  originalNetwork,
  panelSections,
  residualNetwork,
})

const createResidualModel = (model: FlowModel): FlowModel => ({
  edges: model.edges.flatMap((edge) => {
    const residualEdges: FlowEdge[] = []
    const forwardResidualCapacity = edge.capacity - edge.flow
    if (forwardResidualCapacity > 0) {
      residualEdges.push({
        capacity: forwardResidualCapacity,
        flow: 0,
        from: edge.from,
        id: `forward-${edge.id}`,
        kind: 'forward-residual',
        label: String(forwardResidualCapacity),
        relatedEdgeId: edge.id,
        to: edge.to,
      })
    }

    if (edge.flow > 0) {
      residualEdges.push({
        capacity: edge.flow,
        flow: 0,
        from: edge.to,
        id: `reverse-${edge.id}`,
        kind: 'reverse-residual',
        label: String(edge.flow),
        relatedEdgeId: edge.id,
        to: edge.from,
      })
    }

    return residualEdges
  }),
  nodes: model.nodes.map((node) => ({ ...node })),
  sinkNodeId: model.sinkNodeId,
  sourceNodeId: model.sourceNodeId,
})

const getReachableNodeIds = (residualModel: FlowModel): readonly string[] => {
  if (residualModel.sourceNodeId === null) {
    return []
  }

  const visited = new Set<string>([residualModel.sourceNodeId])
  const stack = [residualModel.sourceNodeId]

  while (stack.length > 0) {
    const currentNodeId = stack.pop()
    if (currentNodeId === undefined) {
      continue
    }

    residualModel.edges.forEach((edge) => {
      if (edge.from !== currentNodeId || edge.capacity <= 0 || visited.has(edge.to)) {
        return
      }

      visited.add(edge.to)
      stack.push(edge.to)
    })
  }

  return [...visited]
}

const findResidualPath = (residualModel: FlowModel): ResidualPath | null => {
  const sourceNodeId = residualModel.sourceNodeId
  const sinkNodeId = residualModel.sinkNodeId

  if (sourceNodeId === null || sinkNodeId === null) {
    return null
  }

  const visited = new Set<string>([sourceNodeId])
  const parentByNodeId: Record<string, { fromNodeId: string; edge: FlowEdge } | undefined> = {}
  const stack = [sourceNodeId]

  while (stack.length > 0) {
    const currentNodeId = stack.pop()
    if (currentNodeId === undefined) {
      continue
    }

    if (currentNodeId === sinkNodeId) {
      break
    }

    residualModel.edges.forEach((edge) => {
      if (edge.from !== currentNodeId || edge.capacity <= 0 || visited.has(edge.to)) {
        return
      }

      visited.add(edge.to)
      parentByNodeId[edge.to] = { fromNodeId: currentNodeId, edge }
      stack.push(edge.to)
    })
  }

  if (!visited.has(sinkNodeId)) {
    return null
  }

  const residualEdges: FlowEdge[] = []
  const nodeIds = [sinkNodeId]
  let cursorNodeId = sinkNodeId

  while (cursorNodeId !== sourceNodeId) {
    const parentRecord = parentByNodeId[cursorNodeId]
    if (parentRecord === undefined) {
      return null
    }

    residualEdges.unshift(parentRecord.edge)
    nodeIds.unshift(parentRecord.fromNodeId)
    cursorNodeId = parentRecord.fromNodeId
  }

  const bottleneckValue = residualEdges.reduce(
    (minimum, edge) => Math.min(minimum, edge.capacity),
    Number.POSITIVE_INFINITY,
  )

  return {
    bottleneckValue: Number.isFinite(bottleneckValue) ? bottleneckValue : 0,
    nodeIds,
    originalEdgeIds: residualEdges.map((edge) => edge.relatedEdgeId ?? edge.id),
    residualEdgeIds: residualEdges.map((edge) => edge.id),
  }
}

const applyAugmentingPath = (model: FlowModel, path: ResidualPath): FlowModel => ({
  ...model,
  edges: model.edges.map((edge) => {
    const forwardResidualEdgeId = `forward-${edge.id}`
    const reverseResidualEdgeId = `reverse-${edge.id}`

    if (path.residualEdgeIds.includes(forwardResidualEdgeId)) {
      return { ...edge, flow: edge.flow + path.bottleneckValue }
    }

    if (path.residualEdgeIds.includes(reverseResidualEdgeId)) {
      return { ...edge, flow: Math.max(0, edge.flow - path.bottleneckValue) }
    }

    return edge
  }),
})

const extractMatchingEdgeIds = (model: FlowModel): readonly string[] =>
  model.edges
    .filter((edge) => {
      if (edge.flow <= 0) {
        return false
      }

      const fromNode = model.nodes.find((node) => node.id === edge.from)
      const toNode = model.nodes.find((node) => node.id === edge.to)
      if (fromNode === undefined || toNode === undefined) {
        return false
      }

      return (
        (fromNode.role === 'left-partition' && toNode.role === 'right-partition') ||
        (fromNode.role === 'internal' && toNode.role === 'internal' && edge.capacity === 1)
      )
    })
    .map((edge) => edge.id)

const runFordFulkerson = (model: FlowModel): FlowRunSummary => {
  const initialModel = createZeroFlowModel(model)
  let currentModel = initialModel
  let currentResidual = createResidualModel(currentModel)
  const steps: AugmentationStep[] = []
  let guard = 0

  while (guard < 64) {
    const path = findResidualPath(currentResidual)
    if (path === null || path.bottleneckValue <= 0) {
      break
    }

    const beforeModel = currentModel
    const beforeResidual = currentResidual
    const afterModel = applyAugmentingPath(beforeModel, path)
    const afterResidual = createResidualModel(afterModel)

    steps.push({
      afterModel,
      afterResidual,
      beforeModel,
      beforeResidual,
      path,
    })

    currentModel = afterModel
    currentResidual = afterResidual
    guard += 1
  }

  const reachableSourceSideNodeIds = getReachableNodeIds(currentResidual)
  const sinkSideNodeIds = currentModel.nodes
    .map((node) => node.id)
    .filter((nodeId) => !reachableSourceSideNodeIds.includes(nodeId))
  const cutEdges = currentModel.edges.filter(
    (edge) =>
      reachableSourceSideNodeIds.includes(edge.from) &&
      sinkSideNodeIds.includes(edge.to),
  )
  const cutCapacity = cutEdges.reduce((total, edge) => total + edge.capacity, 0)

  return {
    cutCapacity,
    cutEdges,
    finalModel: currentModel,
    finalResidual: currentResidual,
    initialModel,
    initialResidual: createResidualModel(initialModel),
    matchingEdgeIds: extractMatchingEdgeIds(currentModel),
    reachableSourceSideNodeIds,
    sinkSideNodeIds,
    steps,
  }
}

const validateFlowModelForPlayback = (model: FlowModel): FlowEditorValidation | null => {
  if (model.nodes.length === 0) {
    return {
      code: 'empty-graph',
      message: 'Add nodes to start building a flow network.',
    }
  }

  if (model.sourceNodeId === null || !model.nodes.some((node) => node.id === model.sourceNodeId)) {
    return {
      code: 'missing-source',
      message: 'Select one node as the source before running the workbench.',
    }
  }

  if (model.sinkNodeId === null || !model.nodes.some((node) => node.id === model.sinkNodeId)) {
    return {
      code: 'missing-sink',
      message: 'Select one node as the sink before running the workbench.',
    }
  }

  if (model.sourceNodeId === model.sinkNodeId) {
    return {
      code: 'source-sink-same',
      message: 'Source and sink must be different nodes.',
    }
  }

  if (model.edges.length === 0) {
    return {
      code: 'no-augmenting-path',
      message: 'Add directed edges from source toward sink before running playback.',
    }
  }

  const firstPath = findResidualPath(createResidualModel(createZeroFlowModel(model)))
  if (firstPath === null) {
    return {
      code: 'no-augmenting-path',
      message: 'No source-to-sink path exists in the current graph, so max flow stays at zero.',
    }
  }

  return null
}

const buildEmptyTimeline = (
  algorithmId: FlowNetworkAlgorithmId,
  model: FlowModel,
  message: string,
): FlowTimeline => {
  const zeroModel = createZeroFlowModel(model)
  const residualModel = createResidualModel(zeroModel)

  return {
    algorithmId,
    complexityProfile: flowComplexityByAlgorithm[algorithmId],
    frames: [
      createFrame(
        [1],
        'Build a valid source-to-sink flow network to begin.',
        message,
        zeroModel,
        residualModel,
        [
          buildEdgeRows('FLOW / CAPACITY', zeroModel),
          buildEdgeRows('RESIDUAL CAPACITY', residualModel),
        ],
      ),
    ],
    pseudocodeLines: [
      { lineNumber: 1, text: 'construct a valid flow network with source s and sink t' },
    ],
    subtitle: flowNetworkSubtitleByAlgorithm[algorithmId],
    title: flowNetworkDirectoryLabelByAlgorithm[algorithmId],
  }
}

const buildFlowNetworksTimeline = (runSummary: FlowRunSummary): FlowTimeline => {
  const firstStep = runSummary.steps[0] ?? null
  return {
    algorithmId: 'flow-networks',
    complexityProfile: flowComplexityByAlgorithm['flow-networks'],
    frames: [
      createFrame(
        [1],
        'Start from the zero flow on your current network.',
        'A feasible flow must respect every edge capacity, while the source emits and the sink absorbs the total flow value.',
        runSummary.initialModel,
        runSummary.initialResidual,
        buildCorePanels(runSummary.initialModel, runSummary.initialResidual),
      ),
      createFrame(
        firstStep === null ? [2, 3] : [2, 3, 4],
        firstStep === null
          ? 'This graph currently has no augmenting path, so the zero flow is the visible feasible state.'
          : 'Inspect the first non-zero feasible flow produced by the algorithm.',
        firstStep === null
          ? 'Because no source-to-sink path exists, conservation still holds and the flow value remains zero.'
          : 'After one augmentation, internal nodes preserve in-flow equals out-flow while the source and sink show the total flow value.',
        firstStep?.afterModel ?? runSummary.initialModel,
        firstStep?.afterResidual ?? runSummary.initialResidual,
        buildCorePanels(
          firstStep?.afterModel ?? runSummary.initialModel,
          firstStep?.afterResidual ?? runSummary.initialResidual,
          firstStep?.path.nodeIds ?? [],
          firstStep?.path.bottleneckValue ?? null,
        ),
        {
          activeOriginalEdgeIds: firstStep?.path.originalEdgeIds ?? [],
          bottleneckValue: firstStep?.path.bottleneckValue ?? null,
        },
      ),
    ],
    pseudocodeLines: [
      { lineNumber: 1, text: 'for each edge (u, v) do set 0 <= f(u, v) <= c(u, v)' },
      { lineNumber: 2, text: 'for each internal vertex x do' },
      { lineNumber: 3, text: 'sum_in f(*, x) = sum_out f(x, *)' },
      { lineNumber: 4, text: 'value(f) = sum_out f(s, *)' },
    ],
    subtitle: flowNetworkSubtitleByAlgorithm['flow-networks'],
    title: flowNetworkDirectoryLabelByAlgorithm['flow-networks'],
  }
}

const buildResidualGraphsTimeline = (runSummary: FlowRunSummary): FlowTimeline => {
  const firstStep = runSummary.steps[0] ?? null
  const inspectedModel = firstStep?.afterModel ?? runSummary.initialModel
  const inspectedResidual = firstStep?.afterResidual ?? runSummary.initialResidual

  return {
    algorithmId: 'residual-graphs',
    complexityProfile: flowComplexityByAlgorithm['residual-graphs'],
    frames: [
      createFrame(
        [1],
        'Build the residual graph from the current feasible flow.',
        'Every unsaturated edge contributes forward residual capacity, while every positive-flow edge contributes a reverse residual edge.',
        inspectedModel,
        inspectedResidual,
        buildCorePanels(inspectedModel, inspectedResidual),
      ),
      createFrame(
        [2, 3],
        'Reverse residual edges make rerouting visible.',
        'These reverse edges are what let later augmentations undo earlier choices instead of getting stuck with a greedy path.',
        inspectedModel,
        inspectedResidual,
        buildCorePanels(inspectedModel, inspectedResidual),
        {
          activeResidualEdgeIds: inspectedResidual.edges
            .filter((edge) => edge.kind === 'reverse-residual')
            .map((edge) => edge.id),
        },
      ),
    ],
    pseudocodeLines: [
      { lineNumber: 1, text: 'for each edge (u, v) in G do' },
      { lineNumber: 2, text: 'if c(u, v) - f(u, v) > 0 then add forward residual edge' },
      { lineNumber: 3, text: 'if f(u, v) > 0 then add reverse residual edge' },
    ],
    subtitle: flowNetworkSubtitleByAlgorithm['residual-graphs'],
    title: flowNetworkDirectoryLabelByAlgorithm['residual-graphs'],
  }
}

const buildAugmentingPathsTimeline = (runSummary: FlowRunSummary): FlowTimeline => {
  const firstStep = runSummary.steps[0] ?? null
  if (firstStep === null) {
    return buildEmptyTimeline(
      'augmenting-paths',
      runSummary.initialModel,
      'This graph has no source-to-sink path, so there is no augmenting path to highlight.',
    )
  }

  return {
    algorithmId: 'augmenting-paths',
    complexityProfile: flowComplexityByAlgorithm['augmenting-paths'],
    frames: [
      createFrame(
        [1, 2],
        'Highlight one augmenting path in the residual graph.',
        'The bottleneck residual capacity on this path determines how much additional flow can be pushed in one augmentation.',
        firstStep.beforeModel,
        firstStep.beforeResidual,
        buildCorePanels(
          firstStep.beforeModel,
          firstStep.beforeResidual,
          firstStep.path.nodeIds,
          firstStep.path.bottleneckValue,
        ),
        {
          activeResidualEdgeIds: firstStep.path.residualEdgeIds,
          augmentingPathNodeIds: firstStep.path.nodeIds,
          bottleneckValue: firstStep.path.bottleneckValue,
        },
      ),
      createFrame(
        [3],
        'Augment by the bottleneck and rebuild the residual graph.',
        'Once the path is augmented, the original flow changes and the residual capacities update immediately.',
        firstStep.afterModel,
        firstStep.afterResidual,
        buildCorePanels(
          firstStep.afterModel,
          firstStep.afterResidual,
          firstStep.path.nodeIds,
          firstStep.path.bottleneckValue,
        ),
        {
          activeOriginalEdgeIds: firstStep.path.originalEdgeIds,
          bottleneckValue: firstStep.path.bottleneckValue,
          isComplete: true,
        },
      ),
    ],
    pseudocodeLines: [
      { lineNumber: 1, text: 'find an s-to-t path P in the residual graph' },
      { lineNumber: 2, text: 'delta <- minimum residual capacity on P' },
      { lineNumber: 3, text: 'augment every edge on P by delta' },
    ],
    subtitle: flowNetworkSubtitleByAlgorithm['augmenting-paths'],
    title: flowNetworkDirectoryLabelByAlgorithm['augmenting-paths'],
  }
}

const buildFordFulkersonTimeline = (runSummary: FlowRunSummary): FlowTimeline => {
  const frames: FlowFrame[] = [
    createFrame(
      [1],
      'Initialise flow to zero on every edge.',
      'Ford-Fulkerson starts from the zero flow and then repeatedly searches the residual graph for augmenting paths.',
      runSummary.initialModel,
      runSummary.initialResidual,
      buildCorePanels(runSummary.initialModel, runSummary.initialResidual),
    ),
  ]

  runSummary.steps.forEach((step, stepIndex) => {
    frames.push(
      createFrame(
        [2, 3],
        `Augmenting path ${stepIndex + 1} discovered.`,
        'The residual search returns one s-to-t path, and its bottleneck determines the amount of flow added this iteration.',
        step.beforeModel,
        step.beforeResidual,
        buildCorePanels(
          step.beforeModel,
          step.beforeResidual,
          step.path.nodeIds,
          step.path.bottleneckValue,
        ),
        {
          activeResidualEdgeIds: step.path.residualEdgeIds,
          augmentingPathNodeIds: step.path.nodeIds,
          bottleneckValue: step.path.bottleneckValue,
        },
      ),
    )

    frames.push(
      createFrame(
        [4],
        `Apply augmentation ${stepIndex + 1} and update the residual graph.`,
        'Used forward edges lose residual capacity, while reverse edges appear or grow so later searches can reroute flow.',
        step.afterModel,
        step.afterResidual,
        buildCorePanels(
          step.afterModel,
          step.afterResidual,
          step.path.nodeIds,
          step.path.bottleneckValue,
        ),
        {
          activeOriginalEdgeIds: step.path.originalEdgeIds,
          bottleneckValue: step.path.bottleneckValue,
          isComplete: stepIndex === runSummary.steps.length - 1,
        },
      ),
    )
  })

  if (runSummary.steps.length === 0) {
    frames.push(
      createFrame(
        [2],
        'No augmenting path exists in the current graph.',
        'Because there is no residual path from source to sink, the algorithm terminates immediately with max flow equal to zero.',
        runSummary.initialModel,
        runSummary.initialResidual,
        buildCorePanels(runSummary.initialModel, runSummary.initialResidual),
        { isComplete: true },
      ),
    )
  }

  return {
    algorithmId: 'ford-fulkerson-algorithm',
    complexityProfile: flowComplexityByAlgorithm['ford-fulkerson-algorithm'],
    frames,
    pseudocodeLines: [
      { lineNumber: 1, text: 'set f(e) <- 0 for every edge e' },
      { lineNumber: 2, text: 'while there exists an augmenting path P in G_f do' },
      { lineNumber: 3, text: 'delta <- bottleneck residual capacity on P' },
      { lineNumber: 4, text: 'augment the edges of P by delta' },
    ],
    subtitle: flowNetworkSubtitleByAlgorithm['ford-fulkerson-algorithm'],
    title: flowNetworkDirectoryLabelByAlgorithm['ford-fulkerson-algorithm'],
  }
}

const buildMinimumCutTimeline = (runSummary: FlowRunSummary): FlowTimeline => ({
  algorithmId: 'minimum-cut',
  complexityProfile: flowComplexityByAlgorithm['minimum-cut'],
  frames: [
    createFrame(
      [1, 2, 3, 4],
      'Use the terminal residual graph to extract the cut partition.',
      'After max flow completes, the nodes still reachable from the source in the residual graph define the source side of a minimum cut.',
      runSummary.finalModel,
      runSummary.finalResidual,
      [
        buildEdgeRows('FLOW / CAPACITY', runSummary.finalModel),
        buildEdgeRows('RESIDUAL CAPACITY', runSummary.finalResidual),
        buildCutSection(
          runSummary.reachableSourceSideNodeIds,
          runSummary.sinkSideNodeIds,
          runSummary.cutEdges,
        ),
      ],
      {
        cutSinkSideNodeIds: runSummary.sinkSideNodeIds,
        cutSourceSideNodeIds: runSummary.reachableSourceSideNodeIds,
        isComplete: true,
      },
    ),
  ],
  pseudocodeLines: [
    { lineNumber: 1, text: 'run Ford-Fulkerson to completion' },
    { lineNumber: 2, text: 'S <- vertices reachable from s in the final residual graph' },
    { lineNumber: 3, text: 'T <- V \\ S' },
    { lineNumber: 4, text: 'cut edges are all original edges from S to T' },
  ],
  subtitle: flowNetworkSubtitleByAlgorithm['minimum-cut'],
  title: flowNetworkDirectoryLabelByAlgorithm['minimum-cut'],
})

const buildTheoremTimeline = (runSummary: FlowRunSummary): FlowTimeline => ({
  algorithmId: 'maximum-flow-minimum-cut-theorem',
  complexityProfile: flowComplexityByAlgorithm['maximum-flow-minimum-cut-theorem'],
  frames: [
    createFrame(
      [1, 2, 3],
      'Compare the terminal flow value with the cut capacity.',
      'At termination, the maximum flow value equals the capacity of the minimum cut extracted from residual reachability.',
      runSummary.finalModel,
      runSummary.finalResidual,
      [
        buildCutSection(
          runSummary.reachableSourceSideNodeIds,
          runSummary.sinkSideNodeIds,
          runSummary.cutEdges,
        ),
        {
          rows: [
            { label: 'max-flow value', value: String(calculateMaxFlowValue(runSummary.finalModel)) },
            { label: 'cut capacity', value: String(runSummary.cutCapacity) },
            { label: 'conclusion', value: 'max flow = min cut' },
          ],
          title: 'THEOREM CHECK',
        },
      ],
      {
        cutSinkSideNodeIds: runSummary.sinkSideNodeIds,
        cutSourceSideNodeIds: runSummary.reachableSourceSideNodeIds,
        isComplete: true,
      },
    ),
  ],
  pseudocodeLines: [
    { lineNumber: 1, text: 'f <- max flow returned by Ford-Fulkerson' },
    { lineNumber: 2, text: '(S, T) <- cut extracted from final residual reachability' },
    { lineNumber: 3, text: 'verify value(f) = capacity(S, T)' },
  ],
  subtitle: flowNetworkSubtitleByAlgorithm['maximum-flow-minimum-cut-theorem'],
  title: flowNetworkDirectoryLabelByAlgorithm['maximum-flow-minimum-cut-theorem'],
})

const buildBipartiteMatchingTimeline = (runSummary: FlowRunSummary): FlowTimeline => ({
  algorithmId: 'bipartite-matching',
  complexityProfile: flowComplexityByAlgorithm['bipartite-matching'],
  frames: [
    createFrame(
      [1],
      'Interpret the current graph as a unit-capacity flow reduction.',
      'The clearest matching examples use source-to-left, left-to-right compatibility, and right-to-sink edges with capacity 1.',
      runSummary.initialModel,
      runSummary.initialResidual,
      [buildEdgeRows('UNIT CAPACITY NETWORK', runSummary.initialModel)],
    ),
    createFrame(
      [2, 3],
      'Extract matching edges from the final flow.',
      'Any partition-crossing edge carrying one unit of flow can be read as a matched pair.',
      runSummary.finalModel,
      runSummary.finalResidual,
      [
        buildEdgeRows('FLOW / CAPACITY', runSummary.finalModel),
        buildMatchingSection(runSummary.matchingEdgeIds, runSummary.finalModel),
      ],
      {
        matchingEdgeIds: runSummary.matchingEdgeIds,
        isComplete: true,
      },
    ),
  ],
  pseudocodeLines: [
    { lineNumber: 1, text: 'build source -> left -> right -> sink network with capacity 1 edges' },
    { lineNumber: 2, text: 'run max flow on the transformed network' },
    { lineNumber: 3, text: 'extract every left-to-right edge carrying flow 1 as a match' },
  ],
  subtitle: flowNetworkSubtitleByAlgorithm['bipartite-matching'],
  title: flowNetworkDirectoryLabelByAlgorithm['bipartite-matching'],
})

const buildFlowTimeline = (
  algorithmId: FlowNetworkAlgorithmId,
  model: FlowModel,
): FlowTimeline => {
  const normalizedModel = createZeroFlowModel(model)
  const validation = validateFlowModelForPlayback(normalizedModel)

  if (validation !== null) {
    return buildEmptyTimeline(algorithmId, normalizedModel, validation.message)
  }

  const runSummary = runFordFulkerson(normalizedModel)

  switch (algorithmId) {
    case 'flow-networks':
      return buildFlowNetworksTimeline(runSummary)
    case 'residual-graphs':
      return buildResidualGraphsTimeline(runSummary)
    case 'augmenting-paths':
      return buildAugmentingPathsTimeline(runSummary)
    case 'ford-fulkerson-algorithm':
      return buildFordFulkersonTimeline(runSummary)
    case 'minimum-cut':
      return buildMinimumCutTimeline(runSummary)
    case 'maximum-flow-minimum-cut-theorem':
      return buildTheoremTimeline(runSummary)
    case 'bipartite-matching':
      return buildBipartiteMatchingTimeline(runSummary)
  }
}

export {
  buildFlowTimeline,
  createResidualModel,
  flowNetworkDirectoryLabelByAlgorithm,
  getFlowSampleModel,
  validateFlowModelForPlayback,
}
