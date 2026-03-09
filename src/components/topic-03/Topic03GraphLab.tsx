import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import {
  buildAdjacencyList,
  buildAdjacencyMatrix,
  createGraphLineEvents,
  createGraphRepresentationTimeline,
  createGraphTraversalTimeline,
  getGraphRepresentationFrameByLineEvent,
  getGraphTraversalFrameByLineEvent,
} from '../../algorithms/graph/index.ts'
import type {
  GraphAlgorithmId,
  GraphEditorSelection,
  GraphEditorState,
  GraphEditorValidation,
  GraphModel,
  GraphNode,
  GraphRepresentationFrame,
  GraphTraversalFrame,
  GraphTraversalScope,
} from '../../domain/algorithms/types.ts'

const canvasWidth = 960
const canvasHeight = 540
const nodeRadius = 25
const playbackStepMs = 640
const maxNodeCount = 20
const doubleTapThresholdMs = 320
const dragMoveThresholdPx = 5
const deleteThresholdOffsetPx = nodeRadius / 2

const algorithmDirectoryLabel: Record<GraphAlgorithmId, string> = {
  'graph-representation': 'GRAPH REPRESENTATION',
  'breadth-first-search': 'BREADTH FIRST SEARCH',
  'depth-first-search': 'DEPTH FIRST SEARCH',
  'connected-components': 'CONNECTED COMPONENTS',
  'topological-sorting': 'TOPOLOGICAL SORTING',
  'dijkstra-algorithm': 'DIJKSTRA ALGORITHM',
  'bellman-ford-algorithm': 'BELLMAN FORD ALGORITHM',
  'floyd-warshall-algorithm': 'FLOYD WARSHALL ALGORITHM',
}

const algorithmSubtitle: Record<GraphAlgorithmId, string> = {
  'graph-representation':
    'Build one graph and inspect adjacency list/matrix side-by-side in a deterministic node order.',
  'breadth-first-search':
    'Queue-driven layer traversal with dist/pred tracking and optional shortest-path reconstruction.',
  'depth-first-search':
    'Recursive depth-first traversal with explicit call-stack snapshots and predecessor forest growth.',
  'connected-components':
    'Repeated depth-first traversals assign every vertex to one maximal connected component.',
  'topological-sorting':
    'DFS postorder on directed acyclic graphs; reverse finish order gives a valid dependency schedule.',
  'dijkstra-algorithm':
    'Improved Dijkstra with stale-priority-queue entries for non-negative directed weighted graphs.',
  'bellman-ford-algorithm':
    'Edge-relaxation dynamic programming with textbook negative-cycle influence propagation to -INF.',
  'floyd-warshall-algorithm':
    'All-pairs shortest paths via k,i,j dynamic programming with diagonal negative-cycle detection.',
}

type CanvasPoint = Readonly<{
  x: number
  y: number
}>

type DragState = Readonly<{
  pointerId: number
  nodeId: string
  pointerStartX: number
  pointerStartY: number
  hasMoved: boolean
  isPendingDelete: boolean
}>

type PendingEdgeState = Readonly<{
  sourceNodeId: string
  cursorX: number
  cursorY: number
}>

const defaultGraph: GraphModel = {
  nodes: [
    { id: 'node-0', label: 'A', x: 140, y: 120, order: 0 },
    { id: 'node-1', label: 'B', x: 340, y: 90, order: 1 },
    { id: 'node-2', label: 'C', x: 570, y: 130, order: 2 },
    { id: 'node-3', label: 'D', x: 220, y: 320, order: 3 },
    { id: 'node-4', label: 'E', x: 460, y: 290, order: 4 },
    { id: 'node-5', label: 'F', x: 690, y: 320, order: 5 },
  ],
  edges: [
    { id: 'edge-node-0-node-1', from: 'node-0', to: 'node-1', weight: 1 },
    { id: 'edge-node-0-node-3', from: 'node-0', to: 'node-3', weight: 1 },
    { id: 'edge-node-1-node-2', from: 'node-1', to: 'node-2', weight: 1 },
    { id: 'edge-node-1-node-4', from: 'node-1', to: 'node-4', weight: 1 },
    { id: 'edge-node-2-node-5', from: 'node-2', to: 'node-5', weight: 1 },
    { id: 'edge-node-3-node-4', from: 'node-3', to: 'node-4', weight: 1 },
    { id: 'edge-node-4-node-5', from: 'node-4', to: 'node-5', weight: 1 },
  ],
}

const connectedComponentsSampleGraph: GraphModel = {
  nodes: [
    { id: 'node-0', label: 'A', x: 160, y: 140, order: 0 },
    { id: 'node-1', label: 'B', x: 340, y: 115, order: 1 },
    { id: 'node-2', label: 'C', x: 510, y: 150, order: 2 },
    { id: 'node-3', label: 'D', x: 230, y: 330, order: 3 },
    { id: 'node-4', label: 'E', x: 420, y: 300, order: 4 },
    { id: 'node-5', label: 'F', x: 610, y: 335, order: 5 },
  ],
  edges: [
    { id: 'edge-node-0-node-1', from: 'node-0', to: 'node-1', weight: 1 },
    { id: 'edge-node-1-node-2', from: 'node-1', to: 'node-2', weight: 1 },
    { id: 'edge-node-3-node-4', from: 'node-3', to: 'node-4', weight: 1 },
    { id: 'edge-node-4-node-5', from: 'node-4', to: 'node-5', weight: 1 },
  ],
}

const topologicalSortSampleGraph: GraphModel = {
  nodes: [
    { id: 'node-0', label: 'A', x: 150, y: 130, order: 0 },
    { id: 'node-1', label: 'B', x: 360, y: 90, order: 1 },
    { id: 'node-2', label: 'C', x: 360, y: 210, order: 2 },
    { id: 'node-3', label: 'D', x: 560, y: 120, order: 3 },
    { id: 'node-4', label: 'E', x: 760, y: 200, order: 4 },
    { id: 'node-5', label: 'F', x: 560, y: 300, order: 5 },
  ],
  edges: [
    { id: 'edge-dir-node-0-node-1', from: 'node-0', to: 'node-1', weight: 1 },
    { id: 'edge-dir-node-0-node-2', from: 'node-0', to: 'node-2', weight: 1 },
    { id: 'edge-dir-node-1-node-3', from: 'node-1', to: 'node-3', weight: 1 },
    { id: 'edge-dir-node-2-node-3', from: 'node-2', to: 'node-3', weight: 1 },
    { id: 'edge-dir-node-1-node-5', from: 'node-1', to: 'node-5', weight: 1 },
    { id: 'edge-dir-node-3-node-4', from: 'node-3', to: 'node-4', weight: 1 },
    { id: 'edge-dir-node-5-node-4', from: 'node-5', to: 'node-4', weight: 1 },
  ],
}

const dijkstraSampleGraph: GraphModel = {
  nodes: [
    { id: 'node-0', label: 'A', x: 130, y: 140, order: 0 },
    { id: 'node-1', label: 'B', x: 320, y: 80, order: 1 },
    { id: 'node-2', label: 'C', x: 330, y: 240, order: 2 },
    { id: 'node-3', label: 'D', x: 540, y: 100, order: 3 },
    { id: 'node-4', label: 'E', x: 560, y: 270, order: 4 },
    { id: 'node-5', label: 'F', x: 760, y: 180, order: 5 },
  ],
  edges: [
    { id: 'edge-dir-node-0-node-1', from: 'node-0', to: 'node-1', weight: 2 },
    { id: 'edge-dir-node-0-node-2', from: 'node-0', to: 'node-2', weight: 6 },
    { id: 'edge-dir-node-1-node-3', from: 'node-1', to: 'node-3', weight: 5 },
    { id: 'edge-dir-node-1-node-2', from: 'node-1', to: 'node-2', weight: 1 },
    { id: 'edge-dir-node-2-node-4', from: 'node-2', to: 'node-4', weight: 2 },
    { id: 'edge-dir-node-4-node-3', from: 'node-4', to: 'node-3', weight: 1 },
    { id: 'edge-dir-node-3-node-5', from: 'node-3', to: 'node-5', weight: 3 },
    { id: 'edge-dir-node-4-node-5', from: 'node-4', to: 'node-5', weight: 4 },
  ],
}

const bellmanFordSampleGraph: GraphModel = {
  nodes: [
    { id: 'node-0', label: 'A', x: 140, y: 130, order: 0 },
    { id: 'node-1', label: 'B', x: 320, y: 85, order: 1 },
    { id: 'node-2', label: 'C', x: 330, y: 255, order: 2 },
    { id: 'node-3', label: 'D', x: 540, y: 110, order: 3 },
    { id: 'node-4', label: 'E', x: 560, y: 275, order: 4 },
    { id: 'node-5', label: 'F', x: 760, y: 190, order: 5 },
  ],
  edges: [
    { id: 'edge-dir-node-0-node-1', from: 'node-0', to: 'node-1', weight: 4 },
    { id: 'edge-dir-node-0-node-2', from: 'node-0', to: 'node-2', weight: 5 },
    { id: 'edge-dir-node-1-node-3', from: 'node-1', to: 'node-3', weight: 3 },
    { id: 'edge-dir-node-2-node-1', from: 'node-2', to: 'node-1', weight: -2 },
    { id: 'edge-dir-node-2-node-4', from: 'node-2', to: 'node-4', weight: 2 },
    { id: 'edge-dir-node-4-node-3', from: 'node-4', to: 'node-3', weight: -1 },
    { id: 'edge-dir-node-3-node-5', from: 'node-3', to: 'node-5', weight: 2 },
    { id: 'edge-dir-node-4-node-5', from: 'node-4', to: 'node-5', weight: 4 },
  ],
}

const floydWarshallSampleGraph: GraphModel = {
  nodes: [
    { id: 'node-0', label: 'A', x: 150, y: 100, order: 0 },
    { id: 'node-1', label: 'B', x: 360, y: 80, order: 1 },
    { id: 'node-2', label: 'C', x: 560, y: 120, order: 2 },
    { id: 'node-3', label: 'D', x: 220, y: 290, order: 3 },
    { id: 'node-4', label: 'E', x: 430, y: 320, order: 4 },
    { id: 'node-5', label: 'F', x: 670, y: 300, order: 5 },
  ],
  edges: [
    { id: 'edge-dir-node-0-node-1', from: 'node-0', to: 'node-1', weight: 3 },
    { id: 'edge-dir-node-1-node-2', from: 'node-1', to: 'node-2', weight: 4 },
    { id: 'edge-dir-node-0-node-3', from: 'node-0', to: 'node-3', weight: 8 },
    { id: 'edge-dir-node-3-node-4', from: 'node-3', to: 'node-4', weight: 2 },
    { id: 'edge-dir-node-4-node-2', from: 'node-4', to: 'node-2', weight: -1 },
    { id: 'edge-dir-node-2-node-5', from: 'node-2', to: 'node-5', weight: 1 },
    { id: 'edge-dir-node-4-node-5', from: 'node-4', to: 'node-5', weight: 6 },
  ],
}

const sampleGraphByAlgorithmId: Record<GraphAlgorithmId, GraphModel> = {
  'graph-representation': defaultGraph,
  'breadth-first-search': defaultGraph,
  'depth-first-search': defaultGraph,
  'connected-components': connectedComponentsSampleGraph,
  'topological-sorting': topologicalSortSampleGraph,
  'dijkstra-algorithm': dijkstraSampleGraph,
  'bellman-ford-algorithm': bellmanFordSampleGraph,
  'floyd-warshall-algorithm': floydWarshallSampleGraph,
}

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLElement && target.isContentEditable)

const clamp = (value: number, lowerBound: number, upperBound: number) =>
  Math.max(lowerBound, Math.min(upperBound, value))

const toNodeLabel = (order: number) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letter = alphabet[order % alphabet.length] ?? 'X'
  const suffix = Math.floor(order / alphabet.length)
  return suffix === 0 ? letter : `${letter}${suffix}`
}

const toCanvasPoint = (
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
  svgNode: SVGSVGElement | null,
): CanvasPoint => {
  if (svgNode === null) {
    return { x: canvasWidth / 2, y: canvasHeight / 2 }
  }

  const ctm = svgNode.getScreenCTM()
  if (ctm === null) {
    return { x: canvasWidth / 2, y: canvasHeight / 2 }
  }

  const svgPoint = svgNode.createSVGPoint()
  svgPoint.x = event.clientX
  svgPoint.y = event.clientY
  const localPoint = svgPoint.matrixTransform(ctm.inverse())

  return {
    x: clamp(localPoint.x, 0, canvasWidth),
    y: clamp(localPoint.y, 0, canvasHeight),
  }
}

const clampNodePointForAdd = (point: CanvasPoint): CanvasPoint => ({
  x: clamp(point.x, nodeRadius + 4, canvasWidth - nodeRadius - 4),
  y: clamp(point.y, nodeRadius + 4, canvasHeight - nodeRadius - 4),
})

const clampNodePointForDrag = (point: CanvasPoint): CanvasPoint => ({
  x: clamp(point.x, -deleteThresholdOffsetPx, canvasWidth + deleteThresholdOffsetPx),
  y: clamp(point.y, -deleteThresholdOffsetPx, canvasHeight + deleteThresholdOffsetPx),
})

const isPendingDeletePoint = (point: CanvasPoint) =>
  point.x <= deleteThresholdOffsetPx ||
  point.x >= canvasWidth - deleteThresholdOffsetPx ||
  point.y <= deleteThresholdOffsetPx ||
  point.y >= canvasHeight - deleteThresholdOffsetPx

const createUndirectedEdgeKey = (leftNodeId: string, rightNodeId: string) =>
  leftNodeId < rightNodeId
    ? `${leftNodeId}::${rightNodeId}`
    : `${rightNodeId}::${leftNodeId}`

const createDirectedEdgeKey = (fromNodeId: string, toNodeId: string) =>
  `${fromNodeId}->${toNodeId}`

const createEdgeKey = (
  leftNodeId: string,
  rightNodeId: string,
  isDirected: boolean,
) =>
  isDirected
    ? createDirectedEdgeKey(leftNodeId, rightNodeId)
    : createUndirectedEdgeKey(leftNodeId, rightNodeId)

const createEdgeId = (
  leftNodeId: string,
  rightNodeId: string,
  isDirected: boolean,
) =>
  isDirected
    ? `edge-dir-${leftNodeId}-${rightNodeId}`
    : `edge-${createUndirectedEdgeKey(leftNodeId, rightNodeId).replace('::', '-')}`

const toDirectedLineEndPoint = (
  sourceNode: GraphNode,
  targetNode: GraphNode,
): CanvasPoint => {
  const deltaX = targetNode.x - sourceNode.x
  const deltaY = targetNode.y - sourceNode.y
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  if (length === 0) {
    return { x: targetNode.x, y: targetNode.y }
  }

  const inset = nodeRadius + 6
  return {
    x: targetNode.x - (deltaX / length) * inset,
    y: targetNode.y - (deltaY / length) * inset,
  }
}

const toWeightLabelPoint = ({
  sourcePoint,
  targetPoint,
  isDirected,
  hasReverseDirectedEdge,
  isEmphasized,
}: Readonly<{
  sourcePoint: CanvasPoint
  targetPoint: CanvasPoint
  isDirected: boolean
  hasReverseDirectedEdge: boolean
  isEmphasized: boolean
}>): CanvasPoint => {
  const deltaX = targetPoint.x - sourcePoint.x
  const deltaY = targetPoint.y - sourcePoint.y
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  const midpointX = (sourcePoint.x + targetPoint.x) / 2
  const midpointY = (sourcePoint.y + targetPoint.y) / 2

  if (length === 0) {
    return { x: midpointX, y: midpointY - 8 }
  }

  const normalX = -deltaY / length
  const normalY = deltaX / length
  const baseOffset = isDirected ? 12 : 10
  const reverseDirectionOffset = hasReverseDirectedEdge ? 8 : 0
  const emphasizedOffset = isEmphasized ? 3 : 0
  const compactEdgeOffset = length < nodeRadius * 3 ? 6 : 0
  const offset = baseOffset + reverseDirectionOffset + emphasizedOffset + compactEdgeOffset

  return {
    x: midpointX + normalX * offset,
    y: midpointY + normalY * offset,
  }
}

const getNodeById = (graph: GraphModel, nodeId: string) =>
  graph.nodes.find((node) => node.id === nodeId) ?? null

const updateNodePosition = (
  graph: GraphModel,
  nodeId: string,
  point: CanvasPoint,
): GraphModel => ({
  ...graph,
  nodes: graph.nodes.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          x: point.x,
          y: point.y,
        }
      : node,
  ),
})

const removeNode = (graph: GraphModel, nodeId: string): GraphModel => ({
  ...graph,
  nodes: graph.nodes.filter((node) => node.id !== nodeId),
  edges: graph.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId),
})

const removeEdge = (graph: GraphModel, edgeId: string): GraphModel => ({
  ...graph,
  edges: graph.edges.filter((edge) => edge.id !== edgeId),
})

const sortedNodesByLabel = (nodes: readonly GraphNode[]) =>
  [...nodes].sort((left, right) =>
    left.label.localeCompare(right.label, 'en-US', {
      numeric: true,
      sensitivity: 'base',
    }),
  )

const formatQueueOrStack = (
  nodeIds: readonly string[],
  labelByNodeId: Readonly<Record<string, string>>,
) =>
  nodeIds.length === 0
    ? '[]'
    : `[${nodeIds.map((nodeId) => labelByNodeId[nodeId] ?? nodeId).join(', ')}]`

const isGraphTraversalFrame = (
  frame: GraphRepresentationFrame | GraphTraversalFrame,
): frame is GraphTraversalFrame => 'queueNodeIds' in frame

function Topic03GraphLab({ algorithmId }: Readonly<{ algorithmId: GraphAlgorithmId }>) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const suppressCanvasClickRef = useRef(false)
  const lastNodeTapRef = useRef<Readonly<{ nodeId: string; atMs: number }> | null>(null)
  const lastEdgeTapRef = useRef<Readonly<{ edgeId: string; atMs: number }> | null>(null)
  const initialSampleGraph = sampleGraphByAlgorithmId[algorithmId]

  const [graph, setGraph] = useState<GraphModel>(initialSampleGraph)
  const [nextNodeOrder, setNextNodeOrder] = useState(initialSampleGraph.nodes.length)
  const [selection, setSelection] = useState<GraphEditorSelection>({
    nodeId: null,
    edgeId: null,
  })
  const [validation, setValidation] = useState<GraphEditorValidation | null>(null)
  const traversalScope: GraphTraversalScope = 'full-graph'
  const [startNodeId, setStartNodeId] = useState<string | null>(initialSampleGraph.nodes[0]?.id ?? null)
  const [targetNodeId, setTargetNodeId] = useState<string | null>(
    initialSampleGraph.nodes[5]?.id ?? null,
  )
  const [edgeWeightInput, setEdgeWeightInput] = useState('1')
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [pendingEdge, setPendingEdge] = useState<PendingEdgeState | null>(null)

  const [lineEventIndex, setLineEventIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const isTraversalAlgorithm = algorithmId !== 'graph-representation'
  const isBfsAlgorithm = algorithmId === 'breadth-first-search'
  const isDfsAlgorithm = algorithmId === 'depth-first-search'
  const isConnectedComponentsAlgorithm = algorithmId === 'connected-components'
  const isTopologicalSortAlgorithm = algorithmId === 'topological-sorting'
  const isDijkstraAlgorithm = algorithmId === 'dijkstra-algorithm'
  const isBellmanFordAlgorithm = algorithmId === 'bellman-ford-algorithm'
  const isFloydWarshallAlgorithm = algorithmId === 'floyd-warshall-algorithm'
  const isWeightedPathAlgorithm =
    isDijkstraAlgorithm || isBellmanFordAlgorithm || isFloydWarshallAlgorithm
  const showsStartSelector =
    isBfsAlgorithm || isDfsAlgorithm || isDijkstraAlgorithm || isBellmanFordAlgorithm
  const showsTargetSelector = isBfsAlgorithm || isDijkstraAlgorithm
  const isRepresentationAlgorithm = algorithmId === 'graph-representation'
  const isDirectedGraphMode = isTopologicalSortAlgorithm || isWeightedPathAlgorithm
  const isWeightedGraphMode = isWeightedPathAlgorithm
  const isPlaybackLocked = isTraversalAlgorithm && (isPlaying || lineEventIndex > 0)

  const representationTimeline = useMemo(
    () => createGraphRepresentationTimeline(graph),
    [graph],
  )

  const traversalTimeline = useMemo(
    () =>
      !isTraversalAlgorithm
        ? null
        : createGraphTraversalTimeline({
            algorithmId,
            graph,
            startNodeId,
            targetNodeId,
            scope: traversalScope,
          }),
    [algorithmId, graph, isTraversalAlgorithm, startNodeId, targetNodeId, traversalScope],
  )

  const timelineFrames = useMemo(() => {
    if (!isTraversalAlgorithm || traversalTimeline === null) {
      return representationTimeline.frames
    }

    return traversalTimeline.frames
  }, [isTraversalAlgorithm, representationTimeline.frames, traversalTimeline])

  const lineEvents = useMemo(
    () => createGraphLineEvents(timelineFrames),
    [timelineFrames],
  )

  const hasLineEvents = lineEvents.length > 0
  const hasNodes = graph.nodes.length > 0
  const lastLineEventIndex = Math.max(0, lineEvents.length - 1)
  const boundedLineEventIndex = Math.max(0, Math.min(lineEventIndex, lastLineEventIndex))
  const activeLineEventIndex =
    isTraversalAlgorithm && isPlaybackLocked
      ? boundedLineEventIndex
      : 0

  const editorState: GraphEditorState = {
    mode: isPlaybackLocked ? 'run' : 'build',
    maxNodeCount,
    selection,
    validation,
  }

  const activeFrame = useMemo<GraphRepresentationFrame | GraphTraversalFrame>(() => {
    if (!isTraversalAlgorithm || traversalTimeline === null) {
      return getGraphRepresentationFrameByLineEvent(
        representationTimeline,
        lineEvents,
        activeLineEventIndex,
      )
    }

    return getGraphTraversalFrameByLineEvent(
      traversalTimeline,
      lineEvents,
      activeLineEventIndex,
    )
  }, [
    activeLineEventIndex,
    isTraversalAlgorithm,
    lineEvents,
    representationTimeline,
    traversalTimeline,
  ])

  const pseudocodeLines =
    !isTraversalAlgorithm || traversalTimeline === null
      ? representationTimeline.pseudocodeLines
      : traversalTimeline.pseudocodeLines

  const activeLineEvent = lineEvents[activeLineEventIndex]
  const activeLineNumber =
    activeLineEvent?.lineNumber ??
    pseudocodeLines[0]?.lineNumber ??
    1
  const highlightedLineNumbers = useMemo(
    () => new Set(activeFrame.executedLines),
    [activeFrame.executedLines],
  )

  const traversalFrame = isGraphTraversalFrame(activeFrame) ? activeFrame : null

  const displayGraph = isTraversalAlgorithm && isPlaybackLocked ? activeFrame.graph : graph

  const labelByNodeId = useMemo(
    () =>
      displayGraph.nodes.reduce<Record<string, string>>((accumulator, node) => {
        accumulator[node.id] = node.label
        return accumulator
      }, {}),
    [displayGraph.nodes],
  )

  const orderedNodes = useMemo(
    () => sortedNodesByLabel(displayGraph.nodes),
    [displayGraph.nodes],
  )

  const selectedStartNodeId =
    traversalTimeline?.startNodeId ??
    (startNodeId !== null && displayGraph.nodes.some((node) => node.id === startNodeId)
      ? startNodeId
      : null)

  const selectedTargetNodeId =
    traversalTimeline?.targetNodeId ??
    (targetNodeId !== null && displayGraph.nodes.some((node) => node.id === targetNodeId)
      ? targetNodeId
      : null)

  const selectedEdge =
    selection.edgeId === null
      ? null
      : graph.edges.find((edge) => edge.id === selection.edgeId) ?? null
  const dijkstraNegativeEdge =
    isDijkstraAlgorithm
      ? (graph.edges.find((edge) => edge.weight < 0) ?? null)
      : null

  useEffect(() => {
    const nodeIds = graph.nodes.map((node) => node.id)
    const edgeIds = graph.edges.map((edge) => edge.id)

    if (startNodeId !== null && !nodeIds.includes(startNodeId)) {
      setStartNodeId(nodeIds[0] ?? null)
    }

    if (targetNodeId !== null && !nodeIds.includes(targetNodeId)) {
      setTargetNodeId(null)
    }

    if (selection.nodeId !== null && !nodeIds.includes(selection.nodeId)) {
      setSelection((currentSelection) => ({
        ...currentSelection,
        nodeId: null,
      }))
    }

    if (selection.edgeId !== null && !edgeIds.includes(selection.edgeId)) {
      setSelection((currentSelection) => ({
        ...currentSelection,
        edgeId: null,
      }))
    }
  }, [graph.edges, graph.nodes, selection.edgeId, selection.nodeId, startNodeId, targetNodeId])

  useEffect(() => {
    if (selectedEdge === null) {
      setEdgeWeightInput('1')
      return
    }

    setEdgeWeightInput(`${selectedEdge.weight}`)
  }, [selectedEdge])

  useEffect(() => {
    setIsPlaying(false)
    setLineEventIndex(0)
  }, [algorithmId, graph, startNodeId, targetNodeId, traversalScope])

  useEffect(() => {
    if (!isPlaybackLocked) {
      return
    }

    setPendingEdge(null)
    lastNodeTapRef.current = null
    lastEdgeTapRef.current = null
  }, [isPlaybackLocked])

  useEffect(() => {
    if (pendingEdge === null) {
      return
    }

    const hasSourceNode = graph.nodes.some((node) => node.id === pendingEdge.sourceNodeId)
    if (!hasSourceNode) {
      setPendingEdge(null)
    }
  }, [graph.nodes, pendingEdge])

  useEffect(() => {
    if (!isTraversalAlgorithm || !isPlaying) {
      return
    }

    if (!hasLineEvents) {
      setIsPlaying(false)
      return
    }

    if (lineEventIndex >= lastLineEventIndex) {
      setIsPlaying(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setLineEventIndex((currentIndex) => Math.min(lastLineEventIndex, currentIndex + 1))
    }, playbackStepMs)

    return () => window.clearTimeout(timeoutId)
  }, [hasLineEvents, isPlaying, isTraversalAlgorithm, lastLineEventIndex, lineEventIndex])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      if (!isPlaybackLocked && event.key === 'Escape' && pendingEdge !== null) {
        event.preventDefault()
        cancelPendingEdge()
        setValidation(null)
        return
      }

      if (!isPlaybackLocked && (event.key === 'Backspace' || event.key === 'Delete')) {
        if (selection.nodeId !== null) {
          event.preventDefault()
          setGraph((currentGraph) => removeNode(currentGraph, selection.nodeId ?? ''))
          setSelection({ nodeId: null, edgeId: null })
          setValidation(null)
          return
        }

        if (selection.edgeId !== null) {
          event.preventDefault()
          setGraph((currentGraph) => removeEdge(currentGraph, selection.edgeId ?? ''))
          setSelection({ nodeId: null, edgeId: null })
          setValidation(null)
          return
        }
      }

      if (!isTraversalAlgorithm) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setIsPlaying(false)
        setLineEventIndex((currentIndex) => Math.max(0, currentIndex - 1))
      }

      if (event.key === 'ArrowRight') {
        if (!hasLineEvents) {
          return
        }

        event.preventDefault()
        setIsPlaying(false)
        setLineEventIndex((currentIndex) => Math.min(lastLineEventIndex, currentIndex + 1))
      }

      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault()
        if (!(isTraversalAlgorithm && hasNodes && hasLineEvents && dijkstraNegativeEdge === null)) {
          return
        }

        setIsPlaying((isCurrentlyPlaying) => {
          if (isCurrentlyPlaying) {
            return false
          }

          return true
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    dijkstraNegativeEdge,
    hasLineEvents,
    hasNodes,
    isPlaybackLocked,
    isTraversalAlgorithm,
    lastLineEventIndex,
    lineEventIndex,
    pendingEdge,
    selection.edgeId,
    selection.nodeId,
  ])

  const resetPlayback = () => {
    setIsPlaying(false)
    setLineEventIndex(0)
  }

  const togglePlayback = () => {
    if (!canPlayTraversal) {
      return
    }

    setIsPlaying((isCurrentlyPlaying) => {
      if (isCurrentlyPlaying) {
        return false
      }

      return true
    })
  }

  const addNodeAt = (point: CanvasPoint) => {
    if (editorState.mode !== 'build') {
      return
    }

    if (graph.nodes.length >= editorState.maxNodeCount) {
      setValidation({
        code: 'node-limit',
        message: `Node limit reached (${editorState.maxNodeCount}). Remove a node before adding more.`,
      })
      return
    }

    const nodeOrder = nextNodeOrder
    const anchoredPoint = clampNodePointForAdd(point)
    const newNodeId = `node-${nodeOrder}`
    const newNode: GraphNode = {
      id: newNodeId,
      label: toNodeLabel(nodeOrder),
      x: anchoredPoint.x,
      y: anchoredPoint.y,
      order: nodeOrder,
    }

    setGraph((currentGraph) => ({
      ...currentGraph,
      nodes: [...currentGraph.nodes, newNode],
    }))
    setNextNodeOrder((currentOrder) => currentOrder + 1)
    setSelection({ nodeId: newNodeId, edgeId: null })
    setValidation(null)

    if (startNodeId === null) {
      setStartNodeId(newNodeId)
    }
  }

  const connectNodes = (leftNodeId: string, rightNodeId: string) => {
    if (leftNodeId === rightNodeId) {
      setValidation({
        code: 'self-loop',
        message: 'Self-loops are disabled in this MVP.',
      })
      return
    }

    const edgeKey = createEdgeKey(leftNodeId, rightNodeId, isDirectedGraphMode)
    const hasDuplicate = graph.edges.some(
      (edge) => createEdgeKey(edge.from, edge.to, isDirectedGraphMode) === edgeKey,
    )

    if (hasDuplicate) {
      setValidation({
        code: 'duplicate-edge',
        message: isDirectedGraphMode
          ? 'Duplicate directed edge ignored.'
          : 'Duplicate undirected edge ignored.',
      })
      return
    }

    const edgeId = createEdgeId(leftNodeId, rightNodeId, isDirectedGraphMode)
    setGraph((currentGraph) => ({
      ...currentGraph,
      edges: [
        ...currentGraph.edges,
        {
          id: edgeId,
          from: leftNodeId,
          to: rightNodeId,
          weight: 1,
        },
      ],
    }))
    setSelection({ nodeId: rightNodeId, edgeId: null })
    setValidation(null)
  }

  const beginPendingEdge = (sourceNodeId: string, point: CanvasPoint) => {
    setPendingEdge({
      sourceNodeId,
      cursorX: point.x,
      cursorY: point.y,
    })
    setSelection({ nodeId: sourceNodeId, edgeId: null })
    setValidation(null)
  }

  const cancelPendingEdge = () => {
    setPendingEdge(null)
  }

  const handleNodeTap = (nodeId: string, point: CanvasPoint) => {
    if (editorState.mode !== 'build') {
      return
    }

    lastEdgeTapRef.current = null
    setSelection({ nodeId, edgeId: null })
    setValidation(null)

    if (pendingEdge !== null) {
      if (pendingEdge.sourceNodeId === nodeId) {
        cancelPendingEdge()
        return
      }

      connectNodes(pendingEdge.sourceNodeId, nodeId)
      cancelPendingEdge()
      lastNodeTapRef.current = null
      return
    }

    const nowMs = Date.now()
    const lastTap = lastNodeTapRef.current

    if (
      lastTap !== null &&
      lastTap.nodeId === nodeId &&
      nowMs - lastTap.atMs <= doubleTapThresholdMs
    ) {
      beginPendingEdge(nodeId, point)
      lastNodeTapRef.current = null
      return
    }

    lastNodeTapRef.current = {
      nodeId,
      atMs: nowMs,
    }
  }

  const handleEdgeTap = (edgeId: string) => {
    if (editorState.mode !== 'build') {
      return
    }

    lastNodeTapRef.current = null
    const nowMs = Date.now()
    const lastTap = lastEdgeTapRef.current

    if (
      lastTap !== null &&
      lastTap.edgeId === edgeId &&
      nowMs - lastTap.atMs <= doubleTapThresholdMs
    ) {
      setGraph((currentGraph) => removeEdge(currentGraph, edgeId))
      setSelection({ nodeId: null, edgeId: null })
      setValidation(null)
      lastEdgeTapRef.current = null
      return
    }

    lastEdgeTapRef.current = {
      edgeId,
      atMs: nowMs,
    }
    setSelection({ nodeId: null, edgeId })
    setValidation(null)
  }

  const handleCanvasClick = (event: ReactMouseEvent<SVGRectElement>) => {
    if (editorState.mode !== 'build') {
      return
    }

    if (suppressCanvasClickRef.current) {
      suppressCanvasClickRef.current = false
      return
    }

    if (pendingEdge !== null) {
      cancelPendingEdge()
      return
    }

    const point = toCanvasPoint(event.nativeEvent, svgRef.current)
    addNodeAt(point)
  }

  const handleNodePointerDown = (
    event: ReactPointerEvent<SVGCircleElement>,
    nodeId: string,
  ) => {
    if (editorState.mode !== 'build') {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const node = getNodeById(graph, nodeId)
    if (node === null) {
      return
    }

    const point = toCanvasPoint(event.nativeEvent, svgRef.current)
    setSelection({ nodeId, edgeId: null })
    setValidation(null)
    setDragState({
      pointerId: event.pointerId,
      nodeId,
      pointerStartX: point.x,
      pointerStartY: point.y,
      hasMoved: false,
      isPendingDelete: false,
    })

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleCanvasPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (editorState.mode !== 'build') {
      return
    }

    const point = toCanvasPoint(event.nativeEvent, svgRef.current)

    if (pendingEdge !== null) {
      setPendingEdge((currentPendingEdge) =>
        currentPendingEdge === null
          ? null
          : {
              ...currentPendingEdge,
              cursorX: point.x,
              cursorY: point.y,
            },
      )
    }

    if (dragState === null || dragState.pointerId !== event.pointerId) {
      return
    }

    const deltaX = point.x - dragState.pointerStartX
    const deltaY = point.y - dragState.pointerStartY
    const hasMoved =
      dragState.hasMoved ||
      Math.sqrt(deltaX * deltaX + deltaY * deltaY) >= dragMoveThresholdPx
    const dragPoint = clampNodePointForDrag(point)
    const isPendingDelete = hasMoved && isPendingDeletePoint(dragPoint)

    if (hasMoved) {
      setGraph((currentGraph) => updateNodePosition(currentGraph, dragState.nodeId, dragPoint))
    }

    setDragState((currentDragState) =>
      currentDragState === null
        ? null
        : {
            ...currentDragState,
            hasMoved,
            isPendingDelete,
          },
    )
  }

  const finishDrag = (pointerId: number, point: CanvasPoint) => {
    if (dragState === null || dragState.pointerId !== pointerId) {
      return
    }

    if (!dragState.hasMoved) {
      handleNodeTap(dragState.nodeId, point)
      setDragState(null)
      return
    }

    if (dragState.isPendingDelete) {
      setGraph((currentGraph) => removeNode(currentGraph, dragState.nodeId))
      setSelection({ nodeId: null, edgeId: null })
      setValidation(null)
    }

    setDragState(null)
    suppressCanvasClickRef.current = true
    window.setTimeout(() => {
      suppressCanvasClickRef.current = false
    }, 0)
  }

  const handleCanvasPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (editorState.mode !== 'build') {
      return
    }

    const point = toCanvasPoint(event.nativeEvent, svgRef.current)
    finishDrag(event.pointerId, point)
  }

  const handleCanvasPointerLeave = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (editorState.mode !== 'build') {
      return
    }

    if (dragState === null || dragState.pointerId !== event.pointerId) {
      return
    }
  }

  const applySelectedEdgeWeight = () => {
    if (selectedEdge === null) {
      return
    }

    const parsedWeight = Number(edgeWeightInput)
    if (!Number.isFinite(parsedWeight)) {
      setValidation({
        code: 'negative-edge',
        message: 'Invalid weight input. Enter a finite numeric weight.',
      })
      return
    }

    setGraph((currentGraph) => ({
      ...currentGraph,
      edges: currentGraph.edges.map((edge) =>
        edge.id === selectedEdge.id
          ? { ...edge, weight: parsedWeight }
          : edge,
      ),
    }))
    setValidation(null)
  }

  const clearGraph = () => {
    setGraph({ nodes: [], edges: [] })
    setSelection({ nodeId: null, edgeId: null })
    setValidation(null)
    setStartNodeId(null)
    setTargetNodeId(null)
    setDragState(null)
    setPendingEdge(null)
    lastNodeTapRef.current = null
    lastEdgeTapRef.current = null
  }

  const resetToSample = () => {
    const nextSampleGraph = sampleGraphByAlgorithmId[algorithmId]
    setGraph(nextSampleGraph)
    setNextNodeOrder(nextSampleGraph.nodes.length)
    setSelection({ nodeId: null, edgeId: null })
    setValidation(null)
    setStartNodeId(nextSampleGraph.nodes[0]?.id ?? null)
    setTargetNodeId(nextSampleGraph.nodes[5]?.id ?? null)
    setDragState(null)
    setPendingEdge(null)
    lastNodeTapRef.current = null
    lastEdgeTapRef.current = null
  }

  const discoveredNodeIds = new Set(traversalFrame?.discoveredNodeIds ?? [])
  const processingNodeIds = new Set(traversalFrame?.processingNodeIds ?? [])
  const completedNodeIds = new Set(traversalFrame?.completedNodeIds ?? [])
  const traversalTreeEdgeIds = new Set(traversalFrame?.traversalTreeEdgeIds ?? [])
  const reconstructedPathNodeIds = new Set(traversalFrame?.reconstructedPathNodeIds ?? [])
  const reconstructedPathEdgeIds = new Set(traversalFrame?.reconstructedPathEdgeIds ?? [])

  const activeNodeId = traversalFrame?.activeNodeId ?? null
  const activeEdgeId = traversalFrame?.activeEdgeId ?? null
  const componentByNodeId = traversalFrame?.componentByNodeId ?? null
  const componentCount = traversalFrame?.componentCount ?? 0
  const finishOrderNodeIds = traversalFrame?.finishOrderNodeIds ?? []
  const topologicalOrderNodeIds = traversalFrame?.topologicalOrderNodeIds ?? []
  const cycleDetected = traversalFrame?.cycleDetected ?? false
  const priorityQueueEntries = traversalFrame?.priorityQueueEntries ?? []
  const finalizedNodeIds = traversalFrame?.finalizedNodeIds ?? []
  const currentPass = traversalFrame?.currentPass ?? null
  const negativeCycleNodeIds = traversalFrame?.negativeCycleNodeIds ?? []
  const distanceMatrix = traversalFrame?.distanceMatrix ?? null
  const currentK = traversalFrame?.currentK ?? null
  const currentI = traversalFrame?.currentI ?? null
  const currentJ = traversalFrame?.currentJ ?? null

  const pendingEdgeSourceNode =
    pendingEdge === null ? null : getNodeById(graph, pendingEdge.sourceNodeId)
  const directedEdgeKeySet = useMemo(
    () =>
      new Set(
        displayGraph.edges.map((edge) => createDirectedEdgeKey(edge.from, edge.to)),
      ),
    [displayGraph.edges],
  )
  const finalHighlightedNodeIds = useMemo(() => {
    if (!isTraversalAlgorithm || traversalFrame?.isComplete !== true) {
      return new Set<string>()
    }

    if (isBfsAlgorithm || isDijkstraAlgorithm) {
      return traversalFrame.reconstructedPathNodeIds.length > 0
        ? new Set(traversalFrame.reconstructedPathNodeIds)
        : new Set(traversalFrame.discoveredNodeIds)
    }

    if (isBellmanFordAlgorithm) {
      const nodes = new Set<string>(traversalFrame.discoveredNodeIds)
      const negativeCycleNodeIds = traversalFrame.negativeCycleNodeIds ?? []
      negativeCycleNodeIds.forEach((nodeId) => nodes.add(nodeId))
      return nodes
    }

    if (isFloydWarshallAlgorithm) {
      const cycleNodeIds = traversalFrame.negativeCycleNodeIds ?? []
      if (cycleNodeIds.length > 0) {
        return new Set(cycleNodeIds)
      }

      return new Set(displayGraph.nodes.map((node) => node.id))
    }

    return new Set<string>()
  }, [
    displayGraph.nodes,
    isBellmanFordAlgorithm,
    isBfsAlgorithm,
    isDijkstraAlgorithm,
    isFloydWarshallAlgorithm,
    isTraversalAlgorithm,
    traversalFrame,
  ])
  const finalHighlightedEdgeIds = useMemo(() => {
    if (!isTraversalAlgorithm || traversalFrame?.isComplete !== true) {
      return new Set<string>()
    }

    if (isBfsAlgorithm || isDijkstraAlgorithm) {
      return new Set(traversalFrame.reconstructedPathEdgeIds)
    }

    if (isBellmanFordAlgorithm) {
      const edgeIds = new Set<string>()
      const parentByNodeId = traversalFrame.parentByNodeId
      const cycleNodeIdSet = new Set(traversalFrame.negativeCycleNodeIds ?? [])

      displayGraph.edges.forEach((edge) => {
        if (parentByNodeId[edge.to] === edge.from) {
          edgeIds.add(edge.id)
        }
        if (cycleNodeIdSet.has(edge.from) || cycleNodeIdSet.has(edge.to)) {
          edgeIds.add(edge.id)
        }
      })

      return edgeIds
    }

    if (isFloydWarshallAlgorithm) {
      const cycleNodeIdSet = new Set(traversalFrame.negativeCycleNodeIds ?? [])
      if (cycleNodeIdSet.size === 0) {
        return new Set(displayGraph.edges.map((edge) => edge.id))
      }

      const edgeIds = new Set<string>()
      displayGraph.edges.forEach((edge) => {
        if (cycleNodeIdSet.has(edge.from) || cycleNodeIdSet.has(edge.to)) {
          edgeIds.add(edge.id)
        }
      })
      return edgeIds
    }

    return new Set<string>()
  }, [
    displayGraph.edges,
    isBellmanFordAlgorithm,
    isBfsAlgorithm,
    isDijkstraAlgorithm,
    isFloydWarshallAlgorithm,
    isTraversalAlgorithm,
    traversalFrame,
  ])
  const hasFinalResultFocus =
    isTraversalAlgorithm &&
    traversalFrame?.isComplete === true &&
    (finalHighlightedNodeIds.size > 0 || finalHighlightedEdgeIds.size > 0)

  const shouldRenderTraversalFrame = isTraversalAlgorithm && isPlaybackLocked
  const renderedAdjacencyList =
    shouldRenderTraversalFrame
      ? activeFrame.adjacencyList
      : buildAdjacencyList(graph, {
          directed: isDirectedGraphMode,
          weighted: isWeightedGraphMode,
        })
  const renderedAdjacencyMatrix =
    shouldRenderTraversalFrame
      ? activeFrame.adjacencyMatrix
      : buildAdjacencyMatrix(graph, {
          directed: isDirectedGraphMode,
          weighted: isWeightedGraphMode,
        })
  const canPlayTraversal =
    isTraversalAlgorithm &&
    hasNodes &&
    hasLineEvents &&
    dijkstraNegativeEdge === null
  const canResetTraversal = isTraversalAlgorithm && (isPlaying || lineEventIndex > 0)
  const areTraversalSelectorsDisabled = !hasNodes || isPlaybackLocked

  return (
    <section className="mt-16 space-y-2">
      <div className="space-y-2">
        <div className="font-mono text-[0.86rem] tracking-[0.16em] text-[#666666]">
          TRACE / CONTENT / {algorithmDirectoryLabel[algorithmId]} / GRAPH WORKBENCH
        </div>
        <h2 className="text-[clamp(1.7rem,3.2vw,2.45rem)] font-semibold tracking-[-0.04em] text-[#111111]">
          {algorithmDirectoryLabel[algorithmId]}
        </h2>
        <p className="max-w-[760px] text-[0.98rem] leading-7 text-[#666666]">
          {algorithmSubtitle[algorithmId]}
        </p>
      </div>

      <section className="border border-[#E5E5E5] bg-white">
        <div className="px-3 py-2">
          {isTraversalAlgorithm ? (
            <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
              <div className="flex min-w-0 flex-wrap items-end gap-2">
                {showsStartSelector ? (
                  <>
                    <label className="w-[120px] text-[0.74rem] text-[#666666]">
                      <span className="mb-1 block font-mono tracking-[0.08em]">Start</span>
                      <select
                        className="w-full border border-[#E5E5E5] bg-white px-2 py-1.5 font-mono text-[0.8rem] text-[#111111] disabled:cursor-not-allowed disabled:bg-[#F4F4F4] disabled:text-[#999999]"
                        disabled={areTraversalSelectorsDisabled}
                        onChange={(event) => {
                          const nextNodeId = event.target.value
                          setStartNodeId(nextNodeId === '' ? null : nextNodeId)
                        }}
                        value={startNodeId ?? ''}
                      >
                        <option value="">(none)</option>
                        {sortedNodesByLabel(graph.nodes).map((node) => (
                          <option key={node.id} value={node.id}>
                            {node.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    {showsTargetSelector ? (
                      <label className="w-[152px] text-[0.74rem] text-[#666666]">
                        <span className="mb-1 block font-mono tracking-[0.08em]">Target</span>
                        <select
                          className="w-full border border-[#E5E5E5] bg-white px-2 py-1.5 font-mono text-[0.8rem] text-[#111111] disabled:cursor-not-allowed disabled:bg-[#F4F4F4] disabled:text-[#999999]"
                          disabled={areTraversalSelectorsDisabled}
                          onChange={(event) => {
                            const nextNodeId = event.target.value
                            setTargetNodeId(nextNodeId === '' ? null : nextNodeId)
                          }}
                          value={targetNodeId ?? ''}
                        >
                          <option value="">(none)</option>
                          {sortedNodesByLabel(graph.nodes).map((node) => (
                            <option key={node.id} value={node.id}>
                              {node.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </>
                ) : (
                  <div className="border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.74rem] text-[#666666]">
                    {isConnectedComponentsAlgorithm
                      ? 'Connected-components runs on the full undirected graph.'
                      : isTopologicalSortAlgorithm
                        ? 'Topological sort runs on a directed graph (DAG required).'
                        : 'All-pairs shortest paths run on directed weighted graphs.'}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-start gap-1 lg:justify-center">
                <button
                  className="border border-[#E5E5E5] bg-white px-2.5 py-1.5 font-mono text-[0.78rem] text-[#111111] transition-colors hover:border-[#111111] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!canResetTraversal}
                  onClick={resetPlayback}
                  type="button"
                >
                  Reset
                </button>
                <button
                  className="border border-[#111111] bg-[#111111] px-2.5 py-1.5 font-mono text-[0.78rem] text-[#FAFAFA] transition-colors hover:bg-white hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!canPlayTraversal}
                  onClick={togglePlayback}
                  type="button"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1 lg:justify-end">
                <button
                  className="border border-[#E5E5E5] bg-white px-2.5 py-1.5 font-mono text-[0.78rem] text-[#111111] transition-colors hover:border-[#111111]"
                  onClick={resetToSample}
                  type="button"
                >
                  Load Sample
                </button>
                <button
                  className="border border-[#E5E5E5] bg-white px-2.5 py-1.5 font-mono text-[0.78rem] text-[#111111] transition-colors hover:border-[#111111]"
                  onClick={clearGraph}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    className="border border-[#E5E5E5] bg-white px-2.5 py-1.5 font-mono text-[0.78rem] text-[#111111] transition-colors hover:border-[#111111]"
                    onClick={clearGraph}
                    type="button"
                  >
                    Clear Graph
                  </button>
                  <button
                    className="border border-[#E5E5E5] bg-white px-2.5 py-1.5 font-mono text-[0.78rem] text-[#111111] transition-colors hover:border-[#111111]"
                    onClick={resetToSample}
                    type="button"
                  >
                    Load Sample
                  </button>
                </div>
                <div className="font-mono text-[0.76rem] tracking-[0.05em] text-[#666666]">
                  nodes: {graph.nodes.length}/{editorState.maxNodeCount} | edges: {graph.edges.length}
                </div>
              </div>

              <div className="rounded-none border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.78rem] text-[#666666]">
                Representation mode visualises adjacency list and adjacency matrix from the current undirected graph.
              </div>
            </div>
          )}

          {dijkstraNegativeEdge !== null ? (
            <div className="mt-2 border border-[#111111] border-dashed bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.78rem] text-[#111111]">
              Dijkstra requires non-negative weights. Edge{' '}
              {labelByNodeId[dijkstraNegativeEdge.from] ?? dijkstraNegativeEdge.from}
              {' -> '}
              {labelByNodeId[dijkstraNegativeEdge.to] ?? dijkstraNegativeEdge.to}
              {' = '}
              {dijkstraNegativeEdge.weight}
            </div>
          ) : null}

          {editorState.validation !== null ? (
            <div className="mt-2 border border-[#111111] border-dashed bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.78rem] text-[#111111]">
              {editorState.validation.message}
            </div>
          ) : null}
        </div>

        <div className="border-t border-[#E5E5E5]">
        <div className={isRepresentationAlgorithm ? 'min-w-0' : 'grid lg:grid-cols-[360px_minmax(0,1fr)]'}>
          {!isRepresentationAlgorithm ? (
            <div className="min-w-0 border-b border-[#E5E5E5] lg:border-b-0 lg:border-r lg:border-[#E5E5E5]">
              <section className="px-2 py-2">
                <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">PSEUDOCODE</div>
                <div className="mt-2 space-y-1">
                  {pseudocodeLines.map((line) => {
                    const isActive = line.lineNumber === activeLineNumber
                    const isHighlighted = highlightedLineNumbers.has(line.lineNumber)
                    return (
                      <div
                        key={`${algorithmId}-line-${line.lineNumber}`}
                        className={[
                          'flex items-start gap-2 border-l-2 px-2 py-1 font-mono text-[0.8rem] leading-5 transition-colors duration-150',
                          isActive
                            ? 'border-l-[#111111] bg-[#F4F4F4] font-medium text-[#111111]'
                            : isHighlighted
                              ? 'border-l-transparent bg-[#FAFAFA] text-[#111111]'
                              : 'border-l-transparent bg-transparent text-[#666666]',
                        ].join(' ')}
                      >
                        <span className="inline-block min-w-[2ch] text-right text-[0.74rem] text-[#999999]">
                          {line.lineNumber}
                        </span>
                        <span className="whitespace-pre">{line.text}</span>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="border-t border-[#E5E5E5] px-2 py-2">
                <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">EXECUTION LOG</div>
                <div className="mt-2 bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.8rem] text-[#111111]">
                  {isPlaybackLocked
                    ? activeFrame.operationText
                    : 'Edit-ready: canvas unlocked. Press Play or Space to begin traversal.'}
                </div>

                <div className="mt-2 text-[0.76rem] text-[#666666]">
                  {showsStartSelector ? (
                    <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                      selected start: {selectedStartNodeId === null ? '-' : labelByNodeId[selectedStartNodeId]}
                    </div>
                  ) : null}
                  {showsTargetSelector ? (
                    <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                      selected target: {selectedTargetNodeId === null ? '-' : labelByNodeId[selectedTargetNodeId]}
                    </div>
                  ) : null}
                  <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                    visit order:{' '}
                    {traversalFrame === null
                      ? '-'
                      : formatQueueOrStack(traversalFrame.visitOrderNodeIds, labelByNodeId)}
                  </div>
                  {isConnectedComponentsAlgorithm ? (
                    <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                      components found: {componentCount}
                    </div>
                  ) : null}
                  {isTopologicalSortAlgorithm ? (
                    <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                      topo status: {cycleDetected ? 'cycle detected (invalid DAG)' : 'valid DAG order'}
                    </div>
                  ) : null}
                  {isDijkstraAlgorithm ? (
                    <>
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        finalized: {formatQueueOrStack(finalizedNodeIds, labelByNodeId)}
                      </div>
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        pq:{' '}
                        {priorityQueueEntries.length === 0
                          ? '[]'
                          : `[${priorityQueueEntries
                              .map((entry) => `${labelByNodeId[entry.nodeId] ?? entry.nodeId}:${entry.key}`)
                              .join(', ')}]`}
                      </div>
                    </>
                  ) : null}
                  {isBellmanFordAlgorithm ? (
                    <>
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        pass: {currentPass === null ? '-' : currentPass}
                      </div>
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        -INF affected: {formatQueueOrStack(negativeCycleNodeIds, labelByNodeId)}
                      </div>
                    </>
                  ) : null}
                  {isFloydWarshallAlgorithm ? (
                    <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                      k/i/j:{' '}
                      {currentK === null || currentI === null || currentJ === null
                        ? '-'
                        : `${currentK + 1}/${currentI + 1}/${currentJ + 1}`}
                    </div>
                  ) : null}
                  {isBfsAlgorithm || isDijkstraAlgorithm ? (
                    <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                      shortest path:{' '}
                      {traversalFrame === null
                        ? '-'
                        : traversalFrame.reconstructedPathNodeIds.length === 0
                          ? '(none)'
                          : traversalFrame.reconstructedPathNodeIds
                              .map((nodeId) => labelByNodeId[nodeId] ?? nodeId)
                              .join(' -> ')}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          ) : null}

          <div className="min-w-0">
            <section className="px-2 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">GRAPH CANVAS</div>
                <div className="font-mono text-[0.7rem] text-[#666666]">
                  {isPlaybackLocked
                    ? 'Playback lock active: canvas is read-only until reset or completion.'
                    : isDirectedGraphMode
                      ? 'Edit: click canvas to add node, drag node to move, double-tap source then tap target to add directed edge.'
                      : 'Edit: click canvas to add node, drag node to move, double-tap node then tap another node to connect.'}
                </div>
              </div>

              <div
                className={[
                  'relative mt-2 border transition-colors duration-150',
                  isPlaybackLocked ? 'border-[#D8D8D8] bg-[#F4F4F4]' : 'border-[#E5E5E5] bg-[#FAFAFA]',
                ].join(' ')}
              >
                <div className="pointer-events-none absolute left-2 top-2 z-20 border border-[#E5E5E5] bg-[rgba(255,255,255,0.84)] px-2 py-1 font-mono text-[0.7rem] tracking-[0.04em] text-[#666666]">
                  nodes: {graph.nodes.length}/{editorState.maxNodeCount} | edges: {graph.edges.length}
                </div>

                {isTraversalAlgorithm ? (
                  <div className="pointer-events-none absolute right-2 top-2 z-20 border border-[#E5E5E5] bg-[rgba(255,255,255,0.84)] px-2 py-1 font-mono text-[0.7rem] tracking-[0.04em] text-[#666666]">
                    t={activeLineEventIndex}/{lastLineEventIndex}
                  </div>
                ) : null}

                {isWeightedGraphMode ? (
                  <div className="absolute right-2 top-10 z-20 w-[180px] border border-[#E5E5E5] bg-[rgba(255,255,255,0.94)] px-2 py-1.5">
                    <div className="font-mono text-[0.7rem] tracking-[0.08em] text-[#666666]">EDGE WEIGHT</div>
                    {selectedEdge === null ? (
                      <div className="mt-1 font-mono text-[0.72rem] text-[#999999]">
                        select an edge to edit weight
                      </div>
                    ) : (
                      <div className="mt-1 space-y-1">
                        <div className="font-mono text-[0.72rem] text-[#666666]">
                          {labelByNodeId[selectedEdge.from] ?? selectedEdge.from}
                          {' -> '}
                          {labelByNodeId[selectedEdge.to] ?? selectedEdge.to}
                        </div>
                        <input
                          className="w-full border border-[#E5E5E5] bg-white px-1.5 py-1 font-mono text-[0.76rem] text-[#111111] disabled:bg-[#F4F4F4]"
                          disabled={editorState.mode !== 'build'}
                          onBlur={applySelectedEdgeWeight}
                          onChange={(event) => setEdgeWeightInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              applySelectedEdgeWeight()
                            }
                          }}
                          value={edgeWeightInput}
                        />
                        <button
                          className="w-full border border-[#E5E5E5] bg-white px-1.5 py-1 font-mono text-[0.72rem] text-[#111111] transition-colors hover:border-[#111111] disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={editorState.mode !== 'build' || selectedEdge === null}
                          onClick={applySelectedEdgeWeight}
                          type="button"
                        >
                          Apply Weight
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}

                {isTraversalAlgorithm ? (
                  <div className="pointer-events-none absolute bottom-2 right-2 z-20 space-y-1 border border-[#E5E5E5] bg-[rgba(255,255,255,0.84)] px-2 py-1.5 font-mono text-[0.68rem] text-[#666666]">
                    <div>
                      {isTopologicalSortAlgorithm
                        ? 'edge: directed / DFS-tree / active'
                        : isWeightedGraphMode
                          ? 'edge: directed weighted / relaxed / final-result'
                        : isBfsAlgorithm
                          ? 'edge: default / tree / shortest-path'
                          : 'edge: default / tree / active'}
                    </div>
                    <div>
                      {isConnectedComponentsAlgorithm
                        ? 'node: discovered / processing / completed'
                        : isWeightedGraphMode
                          ? 'node: discovered / finalized / final-result'
                          : 'node: outlined / active-filled'}
                    </div>
                  </div>
                ) : null}

                <svg
                  ref={svgRef}
                  className="h-[420px] w-full select-none"
                  onPointerLeave={handleCanvasPointerLeave}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={handleCanvasPointerUp}
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                >
                  <defs>
                    <marker
                      id="graph-edge-arrowhead"
                      markerHeight="8"
                      markerUnits="strokeWidth"
                      markerWidth="8"
                      orient="auto"
                      refX="7"
                      refY="3.5"
                    >
                      <path d="M0,0 L7,3.5 L0,7 z" fill="currentColor" />
                    </marker>
                  </defs>
                  <rect
                    fill="transparent"
                    height={canvasHeight}
                    onClick={handleCanvasClick}
                    width={canvasWidth}
                    x={0}
                    y={0}
                  />

                  {displayGraph.edges.map((edge) => {
                    const leftNode = getNodeById(displayGraph, edge.from)
                    const rightNode = getNodeById(displayGraph, edge.to)
                    if (leftNode === null || rightNode === null) {
                      return null
                    }

                    const isActive = edge.id === activeEdgeId
                    const isSelected = editorState.selection.edgeId === edge.id
                    const isTreeEdge = traversalTreeEdgeIds.has(edge.id)
                    const isPathEdge = reconstructedPathEdgeIds.has(edge.id)
                    const isResultEdge = finalHighlightedEdgeIds.has(edge.id)
                    const shouldDeemphasizeEdge = hasFinalResultFocus && !isResultEdge
                    const hasReverseDirectedEdge =
                      isDirectedGraphMode &&
                      directedEdgeKeySet.has(createDirectedEdgeKey(edge.to, edge.from))
                    const directedEdgeEndPoint = isDirectedGraphMode
                      ? toDirectedLineEndPoint(leftNode, rightNode)
                      : { x: rightNode.x, y: rightNode.y }
                    const weightLabelPoint = toWeightLabelPoint({
                      sourcePoint: { x: leftNode.x, y: leftNode.y },
                      targetPoint: directedEdgeEndPoint,
                      isDirected: isDirectedGraphMode,
                      hasReverseDirectedEdge,
                      isEmphasized: isActive || isTreeEdge || isPathEdge || isResultEdge,
                    })

                    let stroke = shouldDeemphasizeEdge ? '#ECECEC' : '#E5E5E5'
                    let strokeWidth = shouldDeemphasizeEdge ? 1.2 : 1.4
                    let dashArray: string | undefined

                    if (isTreeEdge && !hasFinalResultFocus) {
                      stroke = '#111111'
                      strokeWidth = 2.1
                    }

                    if (hasFinalResultFocus && isResultEdge && !isPathEdge) {
                      stroke = '#111111'
                      strokeWidth = Math.max(strokeWidth, 2.6)
                      dashArray = undefined
                    }

                    if (isPathEdge) {
                      stroke = '#111111'
                      strokeWidth = 3.4
                      dashArray = undefined
                    }

                    if (isActive && !shouldDeemphasizeEdge) {
                      stroke = '#111111'
                      strokeWidth = 3
                      dashArray = undefined
                    }

                    if (isSelected && !isActive && !shouldDeemphasizeEdge) {
                      dashArray = '5 4'
                    }

                    return (
                      <g key={edge.id}>
                        <line
                          onPointerUp={(event) => {
                            if (editorState.mode !== 'build') {
                              return
                            }

                            event.stopPropagation()
                            handleEdgeTap(edge.id)
                          }}
                          stroke="transparent"
                          strokeLinecap="round"
                          strokeWidth={Math.max(12, strokeWidth + 10)}
                          x1={leftNode.x}
                          x2={directedEdgeEndPoint.x}
                          y1={leftNode.y}
                          y2={directedEdgeEndPoint.y}
                        />
                        <line
                          pointerEvents="none"
                          markerEnd={isDirectedGraphMode ? 'url(#graph-edge-arrowhead)' : undefined}
                          stroke={stroke}
                          strokeDasharray={dashArray}
                          strokeLinecap="round"
                          strokeWidth={strokeWidth}
                          style={isDirectedGraphMode ? { color: stroke } : undefined}
                          x1={leftNode.x}
                          x2={directedEdgeEndPoint.x}
                          y1={leftNode.y}
                          y2={directedEdgeEndPoint.y}
                        />
                        {isWeightedGraphMode ? (
                          <text
                            dominantBaseline="middle"
                            fill={shouldDeemphasizeEdge ? '#999999' : '#111111'}
                            fontFamily="'SF Mono', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace"
                            fontSize={11}
                            fontWeight={500}
                            paintOrder="stroke"
                            pointerEvents="none"
                            stroke="rgba(250,250,250,0.96)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            textAnchor="middle"
                            x={weightLabelPoint.x}
                            y={weightLabelPoint.y}
                          >
                            {edge.weight}
                          </text>
                        ) : null}
                      </g>
                    )
                  })}

                  {editorState.mode === 'build' && pendingEdge !== null && pendingEdgeSourceNode !== null ? (
                    <line
                      markerEnd={isDirectedGraphMode ? 'url(#graph-edge-arrowhead)' : undefined}
                      stroke="#111111"
                      strokeDasharray="6 5"
                      strokeWidth={1.6}
                      style={isDirectedGraphMode ? { color: '#111111' } : undefined}
                      x1={pendingEdgeSourceNode.x}
                      x2={pendingEdge.cursorX}
                      y1={pendingEdgeSourceNode.y}
                      y2={pendingEdge.cursorY}
                    />
                  ) : null}

                  {displayGraph.nodes.map((node) => {
                    const isSelected = editorState.selection.nodeId === node.id
                    const isDiscovered = discoveredNodeIds.has(node.id)
                    const isProcessing = processingNodeIds.has(node.id)
                    const isCompleted = completedNodeIds.has(node.id)
                    const isActive = activeNodeId === node.id
                    const isPathNode = reconstructedPathNodeIds.has(node.id)
                    const isResultNode = finalHighlightedNodeIds.has(node.id)
                    const shouldDeemphasizeNode = hasFinalResultFocus && !isResultNode
                    const isPendingDeleteDrag =
                      editorState.mode === 'build' &&
                      dragState !== null &&
                      dragState.nodeId === node.id &&
                      dragState.isPendingDelete

                    let fill = '#FFFFFF'
                    let stroke = '#E5E5E5'
                    let strokeWidth = 1.6
                    let labelColor = '#111111'
                    let strokeDasharray: string | undefined

                    if (shouldDeemphasizeNode) {
                      fill = '#FFFFFF'
                      stroke = '#E5E5E5'
                      strokeWidth = 1.4
                      labelColor = '#888888'
                    } else {
                      if (isDiscovered) {
                        fill = '#FAFAFA'
                        stroke = '#111111'
                      }

                      if (isCompleted) {
                        fill = '#F4F4F4'
                        stroke = '#111111'
                      }

                      if (isPathNode) {
                        fill = '#FAFAFA'
                        stroke = '#111111'
                        strokeWidth = 2.8
                        strokeDasharray = undefined
                      }

                      if (hasFinalResultFocus && isResultNode && !isPathNode) {
                        fill = '#FAFAFA'
                        stroke = '#111111'
                        strokeWidth = Math.max(strokeWidth, 2.5)
                        strokeDasharray = undefined
                      }

                      if (isProcessing || isActive) {
                        fill = '#111111'
                        stroke = '#111111'
                        labelColor = '#FAFAFA'
                        strokeWidth = 2.4
                        strokeDasharray = undefined
                      }

                      if (isSelected) {
                        strokeWidth = Math.max(strokeWidth, 2.8)
                      }
                    }

                    return (
                      <g key={node.id} opacity={isPendingDeleteDrag ? 0.5 : 1}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          fill={fill}
                          onPointerDown={(event) => handleNodePointerDown(event, node.id)}
                          r={nodeRadius}
                          stroke={stroke}
                          strokeDasharray={strokeDasharray}
                          strokeWidth={strokeWidth}
                        />
                        <text
                          dominantBaseline="middle"
                          fill={isProcessing || isActive ? '#FFFFFF' : labelColor}
                          fontFamily="'SF Mono', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace"
                          fontSize={14}
                          fontWeight={isProcessing || isActive ? 600 : 500}
                          pointerEvents="none"
                          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                          textAnchor="middle"
                          x={node.x}
                          y={node.y}
                        >
                          {node.label}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {isPlaybackLocked ? (
                  <div className="pointer-events-none absolute inset-0 z-10 border border-[rgba(17,17,17,0.14)] bg-[rgba(250,250,250,0.3)]" />
                ) : null}
              </div>
            </section>

            <section className="border-t border-[#E5E5E5] grid xl:grid-cols-2">
              <div className="px-2 py-2">
                <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">ADJACENCY LIST</div>
                <div className="mt-2 text-[0.78rem] text-[#111111]">
                  {renderedAdjacencyList.length === 0 ? (
                    <div className="font-mono text-[#666666]">(empty graph)</div>
                  ) : (
                    renderedAdjacencyList.map((entry) => (
                      <div key={`list-${entry.nodeId}`} className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        {entry.label} {'->'}{' '}
                        {entry.neighbors.length === 0
                          ? '[]'
                          : isWeightedGraphMode
                            ? `[${entry.neighbors
                                .map((neighbor) => `${neighbor.label}(${neighbor.weight})`)
                                .join(', ')}]`
                            : `[${entry.neighbors.map((neighbor) => neighbor.label).join(', ')}]`}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] px-2 py-2 xl:border-l xl:border-t-0 xl:border-[#E5E5E5]">
                <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">ADJACENCY MATRIX</div>
                {renderedAdjacencyMatrix.labels.length === 0 ? (
                  <div className="mt-2 font-mono text-[0.78rem] text-[#666666]">(empty graph)</div>
                ) : (
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full border-collapse font-mono text-[0.74rem]">
                      <thead>
                        <tr className="bg-[#FAFAFA] text-[#666666]">
                          <th className="border border-[#E5E5E5] px-2 py-1 text-left">v</th>
                          {renderedAdjacencyMatrix.labels.map((label) => (
                            <th key={`matrix-header-${label}`} className="border border-[#E5E5E5] px-2 py-1 text-center">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {renderedAdjacencyMatrix.rows.map((row, rowIndex) => (
                          <tr key={`matrix-row-${renderedAdjacencyMatrix.labels[rowIndex] ?? rowIndex}`}>
                            <th className="border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 text-left font-normal text-[#666666]">
                              {renderedAdjacencyMatrix.labels[rowIndex]}
                            </th>
                            {row.map((value, columnIndex) => (
                              <td
                                key={`matrix-cell-${rowIndex}-${columnIndex}`}
                                className="border border-[#E5E5E5] px-2 py-1 text-center text-[#111111]"
                              >
                                {value === null ? '∞' : value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {traversalFrame !== null ? (
              isConnectedComponentsAlgorithm ? (
                <section className="border-t border-[#E5E5E5] grid xl:grid-cols-2">
                  <div className="px-2 py-2">
                    <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">CALL STACK</div>
                    <div className="mt-2 bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.82rem] text-[#111111]">
                      {formatQueueOrStack(traversalFrame.callStackNodeIds, labelByNodeId)}
                    </div>

                    <div className="mt-2 text-[0.74rem] text-[#666666]">
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        discovered: {formatQueueOrStack(traversalFrame.discoveredNodeIds, labelByNodeId)}
                      </div>
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        completed: {formatQueueOrStack(traversalFrame.completedNodeIds, labelByNodeId)}
                      </div>
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        components: {componentCount}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E5E5E5] px-2 py-2 xl:border-l xl:border-t-0 xl:border-[#E5E5E5]">
                    <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">COMPONENT TABLE</div>
                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-full border-collapse font-mono text-[0.74rem]">
                        <thead>
                          <tr className="bg-[#FAFAFA] text-[#666666]">
                            <th className="border border-[#E5E5E5] px-2 py-1 text-left">node</th>
                            <th className="border border-[#E5E5E5] px-2 py-1 text-left">component</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderedNodes.map((node) => {
                            const componentId = componentByNodeId?.[node.id] ?? null
                            return (
                              <tr key={`component-row-${node.id}`}>
                                <td className="border border-[#E5E5E5] px-2 py-1 text-[#111111]">{node.label}</td>
                                <td className="border border-[#E5E5E5] px-2 py-1 text-[#111111]">
                                  {componentId === null ? '-' : componentId}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              ) : isTopologicalSortAlgorithm ? (
                <section className="border-t border-[#E5E5E5] grid xl:grid-cols-2">
                  <div className="px-2 py-2">
                    <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">CALL STACK</div>
                    <div className="mt-2 bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.82rem] text-[#111111]">
                      {formatQueueOrStack(traversalFrame.callStackNodeIds, labelByNodeId)}
                    </div>

                    <div className="mt-2 font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">FINISH STACK</div>
                    <div className="mt-1 bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.82rem] text-[#111111]">
                      {formatQueueOrStack(finishOrderNodeIds, labelByNodeId)}
                    </div>

                    <div className="mt-2 text-[0.74rem] text-[#666666]">
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        discovered: {formatQueueOrStack(traversalFrame.discoveredNodeIds, labelByNodeId)}
                      </div>
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        processing: {formatQueueOrStack(traversalFrame.processingNodeIds, labelByNodeId)}
                      </div>
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        completed: {formatQueueOrStack(traversalFrame.completedNodeIds, labelByNodeId)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E5E5E5] px-2 py-2 xl:border-l xl:border-t-0 xl:border-[#E5E5E5]">
                    <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">TOPOLOGICAL ORDER</div>
                    <div className="mt-2 bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.82rem] text-[#111111]">
                      {cycleDetected
                        ? '(none)'
                        : topologicalOrderNodeIds.length === 0
                          ? '[]'
                          : `[${topologicalOrderNodeIds
                              .map((nodeId) => labelByNodeId[nodeId] ?? nodeId)
                              .join(', ')}]`}
                    </div>

                    {cycleDetected ? (
                      <div className="mt-2 border border-[#111111] border-dashed bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.74rem] text-[#111111]">
                        cycle detected: graph is not a DAG, so no valid topological ordering exists.
                      </div>
                    ) : null}

                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-full border-collapse font-mono text-[0.74rem]">
                        <thead>
                          <tr className="bg-[#FAFAFA] text-[#666666]">
                            <th className="border border-[#E5E5E5] px-2 py-1 text-left">node</th>
                            <th className="border border-[#E5E5E5] px-2 py-1 text-left">state</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderedNodes.map((node) => {
                            const stateLabel = completedNodeIds.has(node.id)
                              ? 'DONE'
                              : processingNodeIds.has(node.id)
                                ? 'VISITING'
                                : discoveredNodeIds.has(node.id)
                                  ? 'VISITED'
                                  : 'UNVISITED'
                            return (
                              <tr key={`topo-state-row-${node.id}`}>
                                <td className="border border-[#E5E5E5] px-2 py-1 text-[#111111]">{node.label}</td>
                                <td className="border border-[#E5E5E5] px-2 py-1 text-[#111111]">{stateLabel}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              ) : isWeightedPathAlgorithm ? (
                <section className="border-t border-[#E5E5E5] grid xl:grid-cols-2">
                  <div className="px-2 py-2">
                    <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">
                      {isDijkstraAlgorithm ? 'PRIORITY QUEUE' : isBellmanFordAlgorithm ? 'PASS STATUS' : 'ACTIVE INDICES'}
                    </div>
                    <div className="mt-2 bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.82rem] text-[#111111]">
                      {isDijkstraAlgorithm
                        ? priorityQueueEntries.length === 0
                          ? '[]'
                          : `[${priorityQueueEntries
                              .map((entry) => `${labelByNodeId[entry.nodeId] ?? entry.nodeId}:${entry.key}`)
                              .join(', ')}]`
                        : isBellmanFordAlgorithm
                          ? `pass ${currentPass ?? '-'}`
                          : `k=${currentK === null ? '-' : currentK + 1}, i=${currentI === null ? '-' : currentI + 1}, j=${currentJ === null ? '-' : currentJ + 1}`}
                    </div>

                    <div className="mt-2 text-[0.74rem] text-[#666666]">
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        discovered: {formatQueueOrStack(traversalFrame.discoveredNodeIds, labelByNodeId)}
                      </div>
                      {isDijkstraAlgorithm ? (
                        <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                          finalized: {formatQueueOrStack(finalizedNodeIds, labelByNodeId)}
                        </div>
                      ) : null}
                      {isBellmanFordAlgorithm ? (
                        <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                          -INF affected: {formatQueueOrStack(negativeCycleNodeIds, labelByNodeId)}
                        </div>
                      ) : null}
                      {isFloydWarshallAlgorithm ? (
                        <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                          negative-cycle nodes: {formatQueueOrStack(negativeCycleNodeIds, labelByNodeId)}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="border-t border-[#E5E5E5] px-2 py-2 xl:border-l xl:border-t-0 xl:border-[#E5E5E5]">
                    <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">
                      {isFloydWarshallAlgorithm ? 'DISTANCE MATRIX' : 'DISTANCE + PRED TABLE'}
                    </div>
                    {isFloydWarshallAlgorithm ? (
                      distanceMatrix === null || distanceMatrix.length === 0 ? (
                        <div className="mt-2 font-mono text-[0.78rem] text-[#666666]">(empty graph)</div>
                      ) : (
                        <div className="mt-2 overflow-x-auto">
                          <table className="min-w-full border-collapse font-mono text-[0.74rem]">
                            <thead>
                              <tr className="bg-[#FAFAFA] text-[#666666]">
                                <th className="border border-[#E5E5E5] px-2 py-1 text-left">i/j</th>
                                {orderedNodes.map((node) => (
                                  <th key={`fw-header-${node.id}`} className="border border-[#E5E5E5] px-2 py-1 text-center">
                                    {node.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {distanceMatrix.map((row, rowIndex) => (
                                <tr key={`fw-row-${rowIndex}`}>
                                  <th className="border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 text-left font-normal text-[#666666]">
                                    {orderedNodes[rowIndex]?.label ?? rowIndex + 1}
                                  </th>
                                  {row.map((value, columnIndex) => {
                                    const isActiveCell = currentI === rowIndex && currentJ === columnIndex
                                    const isKCell =
                                      (currentK === rowIndex && currentJ === columnIndex) ||
                                      (currentI === rowIndex && currentK === columnIndex)
                                    return (
                                      <td
                                        key={`fw-cell-${rowIndex}-${columnIndex}`}
                                        className={[
                                          'border border-[#E5E5E5] px-2 py-1 text-center text-[#111111]',
                                          isActiveCell
                                            ? 'bg-[#F4F4F4] font-medium'
                                            : isKCell
                                              ? 'bg-[#FAFAFA]'
                                              : 'bg-transparent',
                                        ].join(' ')}
                                      >
                                        {value === null ? '∞' : value}
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    ) : (
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full border-collapse font-mono text-[0.74rem]">
                          <thead>
                            <tr className="bg-[#FAFAFA] text-[#666666]">
                              <th className="border border-[#E5E5E5] px-2 py-1 text-left">node</th>
                              <th className="border border-[#E5E5E5] px-2 py-1 text-left">pred</th>
                              <th className="border border-[#E5E5E5] px-2 py-1 text-left">dist</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderedNodes.map((node) => {
                              const parentNodeId = traversalFrame.parentByNodeId[node.id] ?? null
                              const parentLabel =
                                parentNodeId === null ? '-' : (labelByNodeId[parentNodeId] ?? parentNodeId)
                              const distanceValue = traversalFrame.distanceByNodeId[node.id]
                              const distanceLabel =
                                distanceValue === null
                                  ? '∞'
                                  : distanceValue === Number.NEGATIVE_INFINITY
                                    ? '-∞'
                                    : `${distanceValue}`

                              return (
                                <tr key={`weighted-state-row-${node.id}`}>
                                  <td className="border border-[#E5E5E5] px-2 py-1 text-[#111111]">{node.label}</td>
                                  <td className="border border-[#E5E5E5] px-2 py-1 text-[#111111]">{parentLabel}</td>
                                  <td className="border border-[#E5E5E5] px-2 py-1 text-[#111111]">{distanceLabel}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                <section className="border-t border-[#E5E5E5] grid xl:grid-cols-2">
                  <div className="px-2 py-2">
                    <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">
                      {isBfsAlgorithm ? 'QUEUE' : 'CALL STACK'}
                    </div>
                    <div className="mt-2 bg-[#FAFAFA] px-2 py-1.5 font-mono text-[0.82rem] text-[#111111]">
                      {isBfsAlgorithm
                        ? formatQueueOrStack(traversalFrame.queueNodeIds, labelByNodeId)
                        : formatQueueOrStack(traversalFrame.callStackNodeIds, labelByNodeId)}
                    </div>

                    <div className="mt-2 text-[0.74rem] text-[#666666]">
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        discovered: {formatQueueOrStack(traversalFrame.discoveredNodeIds, labelByNodeId)}
                      </div>
                      <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                        completed: {formatQueueOrStack(traversalFrame.completedNodeIds, labelByNodeId)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E5E5E5] px-2 py-2 xl:border-l xl:border-t-0 xl:border-[#E5E5E5]">
                    <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">
                      PARENT {isBfsAlgorithm ? '+ DISTANCE' : 'TABLE'}
                    </div>
                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-full border-collapse font-mono text-[0.74rem]">
                        <thead>
                          <tr className="bg-[#FAFAFA] text-[#666666]">
                            <th className="border border-[#E5E5E5] px-2 py-1 text-left">node</th>
                            <th className="border border-[#E5E5E5] px-2 py-1 text-left">pred</th>
                            <th className="border border-[#E5E5E5] px-2 py-1 text-left">dist</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderedNodes.map((node) => {
                            const parentNodeId = traversalFrame.parentByNodeId[node.id] ?? null
                            const parentLabel =
                              parentNodeId === null ? '-' : (labelByNodeId[parentNodeId] ?? parentNodeId)
                            const distanceValue = traversalFrame.distanceByNodeId[node.id]
                            const distanceLabel =
                              isBfsAlgorithm
                                ? distanceValue === null
                                  ? '∞'
                                  : `${distanceValue}`
                                : '-'

                            return (
                              <tr key={`state-row-${node.id}`}>
                                <td className="border border-[#E5E5E5] px-2 py-1 text-[#111111]">{node.label}</td>
                                <td className="border border-[#E5E5E5] px-2 py-1 text-[#111111]">{parentLabel}</td>
                                <td className="border border-[#E5E5E5] px-2 py-1 text-[#111111]">{distanceLabel}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )
            ) : null}
          </div>
        </div>
        </div>
      </section>
    </section>
  )
}

export { Topic03GraphLab }
