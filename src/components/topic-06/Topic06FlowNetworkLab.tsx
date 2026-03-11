import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react'

import {
  buildFlowTimeline,
  getFlowSampleModel,
  validateFlowModelForPlayback,
} from '../../algorithms/flow/index.ts'
import type {
  FlowEditorSelection,
  FlowEditorState,
  FlowEditorValidation,
  FlowModel,
  FlowNetworkAlgorithmId,
  FlowPanelSection,
} from '../../domain/algorithms/types.ts'

type Topic06View = FlowNetworkAlgorithmId

const playbackStepMs = 900
const canvasWidth = 860
const canvasHeight = 440
const nodeRadius = 26
const maxNodeCount = 6
const doubleTapThresholdMs = 320
const dragMoveThresholdPx = 5
const deleteThresholdOffsetPx = nodeRadius / 2
const bidirectionalEdgeOffsetPx = 26
const edgeEditorOverlayWidthPx = 88

const nonSelectableSvgStyle = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
} as const

type CanvasPoint = Readonly<{
  x: number
  y: number
}>

type EdgeRenderGeometry = Readonly<{
  endX: number
  endY: number
  labelWidth: number
  midX: number
  midY: number
  startX: number
  startY: number
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

const createDirectedEdgeKey = (fromNodeId: string, toNodeId: string) =>
  `${fromNodeId}->${toNodeId}`

const createEdgeId = (fromNodeId: string, toNodeId: string) =>
  `edge-dir-${fromNodeId}-${toNodeId}`

const getNodeById = (graph: FlowModel, nodeId: string) =>
  graph.nodes.find((node) => node.id === nodeId) ?? null

const getEdgeById = (graph: FlowModel, edgeId: string | null) =>
  graph.edges.find((edge) => edge.id === edgeId) ?? null

const hasOppositeDirectedEdge = (graph: FlowModel, edgeId: string, fromNodeId: string, toNodeId: string) =>
  graph.edges.some(
    (edge) => edge.id !== edgeId && edge.from === toNodeId && edge.to === fromNodeId,
  )

const getEdgeRenderGeometry = (
  graph: FlowModel,
  edge: FlowModel['edges'][number],
): EdgeRenderGeometry | null => {
  const fromNode = graph.nodes.find((node) => node.id === edge.from)
  const toNode = graph.nodes.find((node) => node.id === edge.to)
  if (fromNode === undefined || toNode === undefined) {
    return null
  }

  const dx = toNode.x - fromNode.x
  const dy = toNode.y - fromNode.y
  const edgeLength = Math.max(1, Math.hypot(dx, dy))
  const hasOppositeEdge = hasOppositeDirectedEdge(graph, edge.id, edge.from, edge.to)
  const usesCanonicalDirection = edge.from.localeCompare(edge.to) <= 0
  const canonicalFromNode = usesCanonicalDirection ? fromNode : toNode
  const canonicalToNode = usesCanonicalDirection ? toNode : fromNode
  const canonicalDx = canonicalToNode.x - canonicalFromNode.x
  const canonicalDy = canonicalToNode.y - canonicalFromNode.y
  const canonicalLength = Math.max(1, Math.hypot(canonicalDx, canonicalDy))
  const edgeLaneDirection = usesCanonicalDirection ? 1 : -1
  const laneOffsetX = hasOppositeEdge
    ? ((-canonicalDy / canonicalLength) * bidirectionalEdgeOffsetPx * edgeLaneDirection)
    : 0
  const laneOffsetY = hasOppositeEdge
    ? ((canonicalDx / canonicalLength) * bidirectionalEdgeOffsetPx * edgeLaneDirection)
    : 0
  const offsetX = (dx / edgeLength) * 28
  const offsetY = (dy / edgeLength) * 28
  const startX = fromNode.x + offsetX + laneOffsetX
  const startY = fromNode.y + offsetY + laneOffsetY
  const endX = toNode.x - offsetX + laneOffsetX
  const endY = toNode.y - offsetY + laneOffsetY
  const label = edge.label ?? `${edge.flow}/${edge.capacity}`

  return {
    endX,
    endY,
    labelWidth: Math.max(56, label.length * 7 + 18),
    midX: (startX + endX) / 2,
    midY: (startY + endY) / 2,
    startX,
    startY,
  }
}

const updateNodePosition = (
  graph: FlowModel,
  nodeId: string,
  point: CanvasPoint,
): FlowModel => ({
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

const withEndpointLabels = (graph: FlowModel): FlowModel => ({
  ...graph,
  nodes: graph.nodes.map((node) => {
    if (node.id === graph.sourceNodeId) {
      return { ...node, label: 's', role: 'source' }
    }

    if (node.id === graph.sinkNodeId) {
      return { ...node, label: 't', role: 'sink' }
    }

    const nextRole =
      node.role === 'left-partition' || node.role === 'right-partition' ? node.role : 'internal'

    return {
      ...node,
      label: node.label === 's' || node.label === 't' ? toNodeLabel(node.order) : node.label,
      role: nextRole,
    }
  }),
})

const removeEdge = (graph: FlowModel, edgeId: string): FlowModel => ({
  ...graph,
  edges: graph.edges.filter((edge) => edge.id !== edgeId),
})

const removeNode = (graph: FlowModel, nodeId: string): FlowModel => {
  const nodes = graph.nodes.filter((node) => node.id !== nodeId)
  const edges = graph.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId)
  const remainingIds = nodes.map((node) => node.id)

  let sourceNodeId =
    graph.sourceNodeId !== null && remainingIds.includes(graph.sourceNodeId)
      ? graph.sourceNodeId
      : remainingIds[0] ?? null

  let sinkNodeId =
    graph.sinkNodeId !== null && remainingIds.includes(graph.sinkNodeId)
      ? graph.sinkNodeId
      : remainingIds.find((candidateId) => candidateId !== sourceNodeId) ?? null

  if (sourceNodeId === sinkNodeId) {
    sinkNodeId = remainingIds.find((candidateId) => candidateId !== sourceNodeId) ?? null
  }

  return withEndpointLabels({
    ...graph,
    edges,
    nodes,
    sinkNodeId,
    sourceNodeId,
  })
}

const setSourceNode = (graph: FlowModel, nodeId: string): FlowModel => {
  const nextSinkNodeId =
    graph.sinkNodeId === nodeId ? graph.sourceNodeId : graph.sinkNodeId
  return withEndpointLabels({
    ...graph,
    sinkNodeId: nextSinkNodeId === nodeId ? null : nextSinkNodeId,
    sourceNodeId: nodeId,
  })
}

const setSinkNode = (graph: FlowModel, nodeId: string): FlowModel => {
  const nextSourceNodeId =
    graph.sourceNodeId === nodeId ? graph.sinkNodeId : graph.sourceNodeId
  return withEndpointLabels({
    ...graph,
    sinkNodeId: nodeId,
    sourceNodeId: nextSourceNodeId === nodeId ? null : nextSourceNodeId,
  })
}

function ArrowMarkerDefs() {
  return (
    <defs>
      <marker id="flow-arrow-muted" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
        <path d="M0,0 L8,4 L0,8 z" fill="#B8B8B8" />
      </marker>
      <marker id="flow-arrow-strong" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
        <path d="M0,0 L8,4 L0,8 z" fill="#111111" />
      </marker>
      <marker id="flow-arrow-soft" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
        <path d="M0,0 L8,4 L0,8 z" fill="#666666" />
      </marker>
    </defs>
  )
}

function FlowCanvas({
  model,
  title,
  activeEdgeIds,
  activeNodeIds,
  cutSourceSideNodeIds,
  cutSinkSideNodeIds,
  matchingEdgeIds,
  selectedNodeId,
  selectedEdgeId,
  pendingEdge,
  svgRef,
  onCanvasClick,
  onCanvasPointerMove,
  onCanvasPointerUp,
  onCanvasPointerLeave,
  onNodePointerDown,
  editingEdgeId,
  editingEdgeValue,
  edgeEditorInputRef,
  onEditingEdgeBlur,
  onEditingEdgeCancel,
  onEditingEdgeSubmit,
  onEditingEdgeValueChange,
  onEdgeLabelDoubleClick,
  onEdgeLineDoubleClick,
  onEdgeSelect,
}: Readonly<{
  model: FlowModel
  title: string
  activeEdgeIds: readonly string[]
  activeNodeIds: readonly string[]
  cutSourceSideNodeIds: readonly string[]
  cutSinkSideNodeIds: readonly string[]
  matchingEdgeIds: readonly string[]
  selectedNodeId?: string | null
  selectedEdgeId?: string | null
  pendingEdge?: PendingEdgeState | null
  svgRef?: Ref<SVGSVGElement>
  onCanvasClick?: (event: ReactMouseEvent<SVGRectElement>) => void
  onCanvasPointerMove?: (event: ReactPointerEvent<SVGSVGElement>) => void
  onCanvasPointerUp?: (event: ReactPointerEvent<SVGSVGElement>) => void
  onCanvasPointerLeave?: (event: ReactPointerEvent<SVGSVGElement>) => void
  onNodePointerDown?: (event: ReactPointerEvent<SVGCircleElement>, nodeId: string) => void
  editingEdgeId?: string | null
  editingEdgeValue?: string
  edgeEditorInputRef?: Ref<HTMLInputElement>
  onEditingEdgeBlur?: () => void
  onEditingEdgeCancel?: () => void
  onEditingEdgeSubmit?: () => void
  onEditingEdgeValueChange?: (value: string) => void
  onEdgeLabelDoubleClick?: (edgeId: string) => void
  onEdgeLineDoubleClick?: (edgeId: string) => void
  onEdgeSelect?: (edgeId: string) => void
}>) {
  const editingEdge =
    editingEdgeId === undefined || editingEdgeId === null ? null : getEdgeById(model, editingEdgeId)
  const editingGeometry =
    editingEdge === null ? null : getEdgeRenderGeometry(model, editingEdge)

  return (
    <section className="px-2 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">{title}</div>
      </div>

      <div className="relative mt-2 border border-[#E5E5E5] bg-[#FAFAFA]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="block h-auto w-full select-none"
          style={nonSelectableSvgStyle}
          onPointerLeave={onCanvasPointerLeave}
          onPointerMove={onCanvasPointerMove}
          onPointerUp={onCanvasPointerUp}
        >
          <ArrowMarkerDefs />
          <rect
            width={canvasWidth}
            height={canvasHeight}
            fill="transparent"
            onClick={onCanvasClick}
          />

          {model.edges.map((edge) => {
            const geometry = getEdgeRenderGeometry(model, edge)
            if (geometry === null) {
              return null
            }

            const isSelected = selectedEdgeId === edge.id
            const isHighlighted = activeEdgeIds.includes(edge.id)
            const isMatching = matchingEdgeIds.includes(edge.id)
            const markerId =
              edge.kind === 'reverse-residual'
                ? 'url(#flow-arrow-soft)'
                : isSelected || isHighlighted || isMatching
                  ? 'url(#flow-arrow-strong)'
                  : 'url(#flow-arrow-muted)'
            const strokeColor = isSelected || isHighlighted || isMatching
              ? '#111111'
              : edge.kind === 'reverse-residual'
                ? '#666666'
                : '#B8B8B8'
            const label = edge.label ?? `${edge.flow}/${edge.capacity}`
            const handleEdgeSelect = (event: ReactMouseEvent<SVGElement>) => {
              event.stopPropagation()
              onEdgeSelect?.(edge.id)
            }
            const handleEdgeLineDoubleClick = (event: ReactMouseEvent<SVGElement>) => {
              event.stopPropagation()
              onEdgeLineDoubleClick?.(edge.id)
            }
            const handleEdgeLabelDoubleClick = (event: ReactMouseEvent<SVGElement>) => {
              event.stopPropagation()
              onEdgeLabelDoubleClick?.(edge.id)
            }

            return (
              <g key={edge.id}>
                <line
                  x1={geometry.startX}
                  y1={geometry.startY}
                  x2={geometry.endX}
                  y2={geometry.endY}
                  stroke="transparent"
                  strokeWidth={16}
                  onClick={onEdgeSelect === undefined ? undefined : handleEdgeSelect}
                  onDoubleClick={
                    onEdgeLineDoubleClick === undefined ? undefined : handleEdgeLineDoubleClick
                  }
                />
                <line
                  x1={geometry.startX}
                  y1={geometry.startY}
                  x2={geometry.endX}
                  y2={geometry.endY}
                  stroke={strokeColor}
                  strokeWidth={isSelected || isHighlighted || isMatching ? 3 : 2}
                  strokeDasharray={edge.kind === 'reverse-residual' ? '6 4' : undefined}
                  markerEnd={markerId}
                  pointerEvents="none"
                />
                <rect
                  fill="rgba(255,255,255,0.96)"
                  height="22"
                  rx="4"
                  stroke={isSelected ? '#111111' : '#E5E5E5'}
                  width={geometry.labelWidth}
                  x={geometry.midX - geometry.labelWidth / 2}
                  y={geometry.midY - 11}
                  onClick={onEdgeSelect === undefined ? undefined : handleEdgeSelect}
                  onDoubleClick={
                    onEdgeLabelDoubleClick === undefined ? undefined : handleEdgeLabelDoubleClick
                  }
                  style={onEdgeSelect === undefined ? undefined : { cursor: 'pointer' }}
                />
                <text
                  fill="#111111"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace"
                  fontSize="12"
                  pointerEvents="none"
                  style={nonSelectableSvgStyle}
                  textAnchor="middle"
                  x={geometry.midX}
                  y={geometry.midY + 4}
                >
                  {label}
                </text>
              </g>
            )
          })}

          {pendingEdge != null ? (
            (() => {
              const sourceNode = model.nodes.find((node) => node.id === pendingEdge.sourceNodeId)
              if (sourceNode === undefined) {
                return null
              }

              return (
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={pendingEdge.cursorX}
                  y2={pendingEdge.cursorY}
                  stroke="#999999"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                />
              )
            })()
          ) : null}

          {model.nodes.map((node) => {
            const isSelected = selectedNodeId === node.id
            const isActive = activeNodeIds.includes(node.id)
            const isSourceSide = cutSourceSideNodeIds.includes(node.id)
            const isSinkSide = cutSinkSideNodeIds.includes(node.id)
            const fill = isActive
              ? '#111111'
              : isSelected
                ? '#F4F4F4'
                : isSourceSide
                  ? '#F4F4F4'
                  : isSinkSide
                    ? '#FFFFFF'
                    : '#FFFFFF'
            const textFill = isActive ? '#FAFAFA' : '#111111'
            const roleTag =
              node.role === 'source'
                ? 'SRC'
                : node.role === 'sink'
                  ? 'SNK'
                  : node.role === 'left-partition'
                    ? 'L'
                    : node.role === 'right-partition'
                      ? 'R'
                      : null

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  fill={fill}
                  r={nodeRadius}
                  stroke="#111111"
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  onPointerDown={
                    onNodePointerDown === undefined
                      ? undefined
                      : (event) => onNodePointerDown(event, node.id)
                  }
                />
                <text
                  fill={textFill}
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace"
                  fontSize="16"
                  fontWeight={node.role === 'source' || node.role === 'sink' ? '700' : '500'}
                  pointerEvents="none"
                  style={nonSelectableSvgStyle}
                  textAnchor="middle"
                  x={node.x}
                  y={node.y + 5}
                >
                  {node.label}
                </text>
                {roleTag === null ? null : (
                  <>
                    <rect
                      x={node.x - 13}
                      y={node.y - 40}
                      width={26}
                      height={14}
                      rx={3}
                      fill="#111111"
                      pointerEvents="none"
                    />
                    <text
                      fill="#FAFAFA"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace"
                      fontSize="8"
                      pointerEvents="none"
                      style={nonSelectableSvgStyle}
                      textAnchor="middle"
                      x={node.x}
                      y={node.y - 30}
                    >
                      {roleTag}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>
        {editingGeometry !== null &&
        editingEdgeValue !== undefined &&
        onEditingEdgeValueChange !== undefined &&
        onEditingEdgeSubmit !== undefined &&
        onEditingEdgeCancel !== undefined ? (
          <div
            className="absolute z-10"
            style={{
              left: `${(editingGeometry.midX / canvasWidth) * 100}%`,
              top: `${(editingGeometry.midY / canvasHeight) * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: `${Math.max(edgeEditorOverlayWidthPx, editingGeometry.labelWidth + 12)}px`,
            }}
          >
            <input
              ref={edgeEditorInputRef}
              autoFocus
              className="w-full border border-[#111111] bg-white px-2 py-1 text-center font-mono text-[0.78rem] text-[#111111] outline-none"
              onBlur={onEditingEdgeBlur}
              onChange={(event) => onEditingEdgeValueChange(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onEditingEdgeSubmit()
                } else if (event.key === 'Escape') {
                  event.preventDefault()
                  onEditingEdgeCancel()
                }
              }}
              step="1"
              type="number"
              value={editingEdgeValue}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}

function FlowPanelSectionView({ section }: Readonly<{ section: FlowPanelSection }>) {
  return (
    <section className="px-2 py-2">
      <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">{section.title}</div>
      <div className="mt-2 space-y-1">
        {section.rows.map((row) => (
          <div
            key={`${section.title}-${row.label}`}
            className="flex items-start justify-between gap-3 border-t border-[#E5E5E5] px-1 py-1 font-mono text-[0.76rem] text-[#111111]"
          >
            <span className="text-[#666666]">{row.label}</span>
            <span className="text-right">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function PanelShell({
  title,
  children,
}: Readonly<{
  title: string
  children: React.ReactNode
}>) {
  return (
    <section className="px-2 py-2">
      <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function Topic06FlowNetworkLab({
  algorithmId,
}: Readonly<{
  algorithmId: Topic06View
}>) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const edgeEditorInputRef = useRef<HTMLInputElement | null>(null)
  const suppressCanvasClickRef = useRef(false)
  const lastNodeTapRef = useRef<Readonly<{ nodeId: string; atMs: number }> | null>(null)
  const initialGraph = useMemo(() => withEndpointLabels(getFlowSampleModel(algorithmId)), [])

  const [graph, setGraph] = useState<FlowModel>(initialGraph)
  const [nextNodeOrder, setNextNodeOrder] = useState(
    Math.max(...initialGraph.nodes.map((node) => node.order), -1) + 1,
  )
  const [selection, setSelection] = useState<FlowEditorSelection>({
    nodeId: null,
    edgeId: null,
  })
  const [validation, setValidation] = useState<FlowEditorValidation | null>(null)
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null)
  const [editingEdgeValue, setEditingEdgeValue] = useState('1')
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [pendingEdge, setPendingEdge] = useState<PendingEdgeState | null>(null)
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const playbackValidation = useMemo(() => validateFlowModelForPlayback(graph), [graph])
  const editorState: FlowEditorState = {
    mode: isPlaying || frameIndex > 0 ? 'run' : 'build',
    maxNodeCount,
    selection,
    validation: validation ?? playbackValidation,
  }

  const timeline = useMemo(() => buildFlowTimeline(algorithmId, graph), [algorithmId, graph])

  useEffect(() => {
    setFrameIndex(0)
    setIsPlaying(false)
  }, [algorithmId])

  useEffect(() => {
    if (editingEdgeId === null) {
      return
    }

    const editingEdge = getEdgeById(graph, editingEdgeId)
    if (editingEdge === null) {
      setEditingEdgeId(null)
      setEditingEdgeValue('1')
    }
  }, [editingEdgeId, graph])

  useEffect(() => {
    if (editingEdgeId === null) {
      return
    }

    edgeEditorInputRef.current?.focus()
    edgeEditorInputRef.current?.select()
  }, [editingEdgeId])

  const lastFrameIndex = Math.max(0, timeline.frames.length - 1)
  const boundedFrameIndex = Math.max(0, Math.min(frameIndex, lastFrameIndex))
  const activeFrame = timeline.frames[boundedFrameIndex] ?? timeline.frames[0]
  const selectedNode = getNodeById(graph, selection.nodeId ?? '')

  const canRunPlayback = playbackValidation === null && timeline.frames.length > 1

  const resetPlayback = () => {
    setIsPlaying(false)
    setFrameIndex(0)
  }

  const clearSelection = () => {
    setSelection({ nodeId: null, edgeId: null })
    stopEditingEdge()
  }

  const clearSelectionForPlayback = () => {
    clearSelection()
  }

  const suppressNextCanvasClick = () => {
    suppressCanvasClickRef.current = true
    window.setTimeout(() => {
      suppressCanvasClickRef.current = false
    }, 0)
  }

  const stopEditingEdge = () => {
    setEditingEdgeId(null)
    setEditingEdgeValue('1')
  }

  const resetToSample = () => {
    const nextSampleGraph = withEndpointLabels(getFlowSampleModel(algorithmId))
    setGraph(nextSampleGraph)
    setNextNodeOrder(Math.max(...nextSampleGraph.nodes.map((node) => node.order), -1) + 1)
    setSelection({ nodeId: null, edgeId: null })
    setValidation(null)
    setPendingEdge(null)
    setDragState(null)
    setFrameIndex(0)
    setIsPlaying(false)
    lastNodeTapRef.current = null
    stopEditingEdge()
  }

  const clearGraph = () => {
    setGraph({
      edges: [],
      nodes: [],
      sinkNodeId: null,
      sourceNodeId: null,
    })
    setNextNodeOrder(0)
    setSelection({ nodeId: null, edgeId: null })
    setValidation(null)
    setPendingEdge(null)
    setDragState(null)
    setFrameIndex(0)
    setIsPlaying(false)
    lastNodeTapRef.current = null
    stopEditingEdge()
  }

  const goToPreviousStep = () => {
    setIsPlaying(false)
    clearSelectionForPlayback()
    setFrameIndex((current) => Math.max(0, current - 1))
  }

  const goToNextStep = () => {
    if (!canRunPlayback) {
      return
    }

    clearSelectionForPlayback()
    setFrameIndex((current) => Math.min(lastFrameIndex, current + 1))
  }

  const togglePlay = () => {
    if (!canRunPlayback) {
      return
    }

    clearSelectionForPlayback()

    if (boundedFrameIndex >= lastFrameIndex) {
      setFrameIndex(0)
      setIsPlaying(true)
      return
    }

    setIsPlaying((current) => !current)
  }

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    if (boundedFrameIndex >= lastFrameIndex) {
      setIsPlaying(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setFrameIndex((current) => Math.min(lastFrameIndex, current + 1))
    }, playbackStepMs)

    return () => window.clearTimeout(timeoutId)
  }, [boundedFrameIndex, isPlaying, lastFrameIndex])

  const addNodeAt = (point: CanvasPoint) => {
    if (editorState.mode !== 'build') {
      return
    }

    if (graph.nodes.length >= editorState.maxNodeCount) {
      setValidation((currentValidation) =>
        currentValidation?.code === 'node-limit' ? null : currentValidation,
      )
      return
    }

    const nodeOrder = nextNodeOrder
    const anchoredPoint = clampNodePointForAdd(point)
    const newNodeId = `node-${nodeOrder}`
    const shouldBecomeSource = graph.sourceNodeId === null
    const shouldBecomeSink = !shouldBecomeSource && graph.sinkNodeId === null
    const label = shouldBecomeSource ? 's' : shouldBecomeSink ? 't' : toNodeLabel(nodeOrder)

    const nextGraph = withEndpointLabels({
      ...graph,
      nodes: [
        ...graph.nodes,
        {
          id: newNodeId,
          label,
          order: nodeOrder,
          role: shouldBecomeSource ? 'source' : shouldBecomeSink ? 'sink' : 'internal',
          x: anchoredPoint.x,
          y: anchoredPoint.y,
        },
      ],
      sinkNodeId: shouldBecomeSink ? newNodeId : graph.sinkNodeId,
      sourceNodeId: shouldBecomeSource ? newNodeId : graph.sourceNodeId,
    })

    setGraph(nextGraph)
    setNextNodeOrder((currentOrder) => currentOrder + 1)
    setSelection({ nodeId: newNodeId, edgeId: null })
    setValidation(null)
  }

  const connectNodes = (leftNodeId: string, rightNodeId: string) => {
    if (leftNodeId === rightNodeId) {
      setValidation({
        code: 'self-loop',
        message: 'Self-loops are disabled in this flow editor.',
      })
      return
    }

    const edgeKey = createDirectedEdgeKey(leftNodeId, rightNodeId)
    const hasDuplicate = graph.edges.some(
      (edge) => createDirectedEdgeKey(edge.from, edge.to) === edgeKey,
    )

    if (hasDuplicate) {
      setValidation({
        code: 'duplicate-edge',
        message: 'Duplicate directed edge ignored.',
      })
      return
    }

    const edgeId = createEdgeId(leftNodeId, rightNodeId)
    setGraph((currentGraph) => ({
      ...currentGraph,
      edges: [
        ...currentGraph.edges,
        {
          capacity: 1,
          flow: 0,
          from: leftNodeId,
          id: edgeId,
          kind: 'original',
          to: rightNodeId,
        },
      ],
    }))
    setSelection({ nodeId: null, edgeId })
    setValidation(null)
    stopEditingEdge()
  }

  const beginPendingEdge = (sourceNodeId: string, point: CanvasPoint) => {
    setPendingEdge({
      cursorX: point.x,
      cursorY: point.y,
      sourceNodeId,
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

    stopEditingEdge()
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
      atMs: nowMs,
      nodeId,
    }
  }

  const handleEdgeSelect = (edgeId: string) => {
    if (editorState.mode !== 'build') {
      return
    }

    lastNodeTapRef.current = null
    if (selection.edgeId === edgeId) {
      clearSelection()
    } else {
      stopEditingEdge()
      setSelection({ nodeId: null, edgeId })
    }
    setValidation(null)
  }

  const deleteEdgeById = (edgeId: string) => {
    if (editorState.mode !== 'build') {
      return
    }

    lastNodeTapRef.current = null
    setGraph((currentGraph) => removeEdge(currentGraph, edgeId))
    setSelection({ nodeId: null, edgeId: null })
    setValidation(null)
    stopEditingEdge()
  }

  const startEditingEdge = (edgeId: string) => {
    if (editorState.mode !== 'build') {
      return
    }

    const edge = getEdgeById(graph, edgeId)
    if (edge === null) {
      return
    }

    lastNodeTapRef.current = null
    setSelection({ nodeId: null, edgeId })
    setEditingEdgeId(edgeId)
    setEditingEdgeValue(String(edge.capacity))
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

    if (selection.nodeId !== null || selection.edgeId !== null) {
      setSelection({ nodeId: null, edgeId: null })
      stopEditingEdge()
      setValidation(null)
      return
    }

    stopEditingEdge()
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

    const point = toCanvasPoint(event.nativeEvent, svgRef.current)
    setSelection({ nodeId, edgeId: null })
    setValidation(null)
    stopEditingEdge()
    setDragState({
      hasMoved: false,
      isPendingDelete: false,
      nodeId,
      pointerId: event.pointerId,
      pointerStartX: point.x,
      pointerStartY: point.y,
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
      dragState.hasMoved || Math.hypot(deltaX, deltaY) >= dragMoveThresholdPx
    const dragPoint = clampNodePointForDrag(point)
    const pendingDelete = hasMoved && isPendingDeletePoint(dragPoint)

    if (hasMoved) {
      setGraph((currentGraph) => updateNodePosition(currentGraph, dragState.nodeId, dragPoint))
    }

    setDragState((currentDragState) =>
      currentDragState === null
        ? null
        : {
            ...currentDragState,
            hasMoved,
            isPendingDelete: pendingDelete,
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
    suppressNextCanvasClick()
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

  const applyEdgeCapacity = (edgeId: string, rawCapacityInput: string) => {
    const edge = getEdgeById(graph, edgeId)
    if (edge === null) {
      return
    }

    const parsedCapacity = Number(rawCapacityInput)
    if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
      setValidation({
        code: 'invalid-capacity',
        message: 'Capacity must be a positive finite number.',
      })
      return
    }

    const nextCapacity = Math.max(1, Math.floor(parsedCapacity))
    setGraph((currentGraph) => ({
      ...currentGraph,
      edges: currentGraph.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, capacity: nextCapacity } : edge,
      ),
    }))
    setSelection({ nodeId: null, edgeId })
    setValidation(null)
    stopEditingEdge()
  }

  const submitEditingEdge = () => {
    if (editingEdgeId === null) {
      return
    }

    applyEdgeCapacity(editingEdgeId, editingEdgeValue)
  }

  const cancelEditingEdge = () => {
    if (editingEdgeId === null) {
      return
    }

    const editingEdge = getEdgeById(graph, editingEdgeId)
    setSelection({ nodeId: null, edgeId: editingEdgeId })
    setValidation(null)
    setEditingEdgeId(null)
    setEditingEdgeValue(editingEdge === null ? '1' : String(editingEdge.capacity))
  }

  const handleEditingEdgeBlur = () => {
    suppressNextCanvasClick()

    if (editingEdgeId === null) {
      return
    }

    submitEditingEdge()
  }

  const promoteSelectedNodeToSource = () => {
    if (selectedNode === null) {
      return
    }

    setGraph((currentGraph) => setSourceNode(currentGraph, selectedNode.id))
    setValidation(null)
  }

  const promoteSelectedNodeToSink = () => {
    if (selectedNode === null) {
      return
    }

    setGraph((currentGraph) => setSinkNode(currentGraph, selectedNode.id))
    setValidation(null)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPreviousStep()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNextStep()
      }

      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      }

      if (editorState.mode !== 'build') {
        return
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selection.nodeId !== null) {
          const selectedNodeId = selection.nodeId
          event.preventDefault()
          setGraph((currentGraph) => removeNode(currentGraph, selectedNodeId))
          setSelection({ nodeId: null, edgeId: null })
          setValidation(null)
          stopEditingEdge()
        } else if (selection.edgeId !== null) {
          const selectedEdgeId = selection.edgeId
          event.preventDefault()
          deleteEdgeById(selectedEdgeId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editorState.mode, selection, canRunPlayback, boundedFrameIndex, lastFrameIndex, isPlaying])

  if (activeFrame === undefined) {
    return null
  }

  const originalCanvasNodeIds =
    editorState.mode === 'build'
      ? pendingEdge === null
        ? selection.nodeId === null
          ? []
          : [selection.nodeId]
        : [pendingEdge.sourceNodeId]
      : activeFrame.activeNodeIds

  const originalCanvasEdgeIds =
    editorState.mode === 'build'
      ? selection.edgeId === null
        ? []
        : [selection.edgeId]
      : activeFrame.activeOriginalEdgeIds
  const [flowCapacitySection, residualCapacitySection, ...remainingPanelSections] =
    activeFrame.panelSections
  const mergedRemainingPanelSections = remainingPanelSections.map((section) =>
    section.title === 'PATH STATE'
      ? {
          ...section,
          rows: [
            { label: 'status', value: activeFrame.operationText },
            { label: 'detail', value: activeFrame.detailText },
            ...section.rows,
          ],
        }
      : section,
  )

  return (
    <section className="mt-4 space-y-2">
      <div className="space-y-2">
        <p className="max-w-[900px] text-[1rem] leading-7 text-[#666666]">{timeline.subtitle}</p>
      </div>

      <section className="border border-[#E5E5E5] bg-white">
        <div className="px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-[0.84rem] text-[#666666]">
              Build mode: click to add nodes, drag to move, double-click a node to start an edge, single-click an edge to select it, double-click an edge line to delete it, and double-click a label box to edit its capacity.
            </div>
            <div className="font-mono text-[0.82rem] text-[#111111]">
              nodes: {graph.nodes.length}/{editorState.maxNodeCount} | edges: {graph.edges.length}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className="border border-[#111111] bg-white px-2.5 py-1 font-mono text-[0.82rem] text-[#111111] transition-colors hover:bg-[#111111] hover:text-[#FAFAFA]"
              onClick={goToPreviousStep}
              type="button"
            >
              Previous
            </button>
            <button
              className={[
                'border px-2.5 py-1 font-mono text-[0.82rem] transition-colors',
                canRunPlayback
                  ? 'border-[#111111] bg-[#111111] text-[#FAFAFA] hover:bg-white hover:text-[#111111]'
                  : 'border-[#E5E5E5] bg-[#F4F4F4] text-[#999999]',
              ].join(' ')}
              disabled={!canRunPlayback}
              onClick={togglePlay}
              type="button"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              className={[
                'border px-2.5 py-1 font-mono text-[0.82rem] transition-colors',
                canRunPlayback
                  ? 'border-[#111111] bg-white text-[#111111] hover:bg-[#111111] hover:text-[#FAFAFA]'
                  : 'border-[#E5E5E5] bg-[#F4F4F4] text-[#999999]',
              ].join(' ')}
              disabled={!canRunPlayback}
              onClick={goToNextStep}
              type="button"
            >
              Next
            </button>
            <button
              className="border border-[#E5E5E5] bg-white px-2.5 py-1 font-mono text-[0.82rem] text-[#111111] transition-colors hover:border-[#111111]"
              onClick={resetPlayback}
              type="button"
            >
              Reset Stepper
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[0.78rem] text-[#666666]">
            <div className="border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 text-[#111111]">
              max flow value: {activeFrame.maxFlowValue}
            </div>
            <div className="border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 text-[#111111]">
              bottleneck: {activeFrame.bottleneckValue === null ? '-' : activeFrame.bottleneckValue}
            </div>
            <div className="border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 text-[#111111]">
              step: {boundedFrameIndex + 1} / {timeline.frames.length}
            </div>
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] px-3 py-2">
          <div className="font-mono text-[0.8rem] tracking-[0.08em] text-[#666666]">EDITOR CONTROLS</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              className="border border-[#111111] bg-white px-2.5 py-1 font-mono text-[0.8rem] text-[#111111] transition-colors hover:bg-[#111111] hover:text-[#FAFAFA]"
              onClick={resetToSample}
              type="button"
            >
              Reset Sample
            </button>
            <button
              className="border border-[#E5E5E5] bg-white px-2.5 py-1 font-mono text-[0.8rem] text-[#111111] transition-colors hover:border-[#111111]"
              onClick={clearGraph}
              type="button"
            >
              Clear Graph
            </button>
            <button
              className={[
                'border px-2.5 py-1 font-mono text-[0.8rem] transition-colors',
                selectedNode === null
                  ? 'border-[#E5E5E5] bg-[#F4F4F4] text-[#999999]'
                  : 'border-[#111111] bg-white text-[#111111] hover:bg-[#111111] hover:text-[#FAFAFA]',
              ].join(' ')}
              disabled={selectedNode === null}
              onClick={promoteSelectedNodeToSource}
              type="button"
            >
              Set Source
            </button>
            <button
              className={[
                'border px-2.5 py-1 font-mono text-[0.8rem] transition-colors',
                selectedNode === null
                  ? 'border-[#E5E5E5] bg-[#F4F4F4] text-[#999999]'
                  : 'border-[#111111] bg-white text-[#111111] hover:bg-[#111111] hover:text-[#FAFAFA]',
              ].join(' ')}
              disabled={selectedNode === null}
              onClick={promoteSelectedNodeToSink}
              type="button"
            >
              Set Sink
            </button>
          </div>

          {editorState.validation !== null ? (
            <div className="mt-2 border border-dashed border-[#111111] px-2 py-1.5 font-mono text-[0.76rem] text-[#111111]">
              {editorState.validation.message}
            </div>
          ) : null}
        </div>

        <div className="border-t border-[#E5E5E5]">
          <div className="grid xl:grid-cols-2">
            <FlowCanvas
              activeEdgeIds={originalCanvasEdgeIds}
              activeNodeIds={originalCanvasNodeIds}
              cutSinkSideNodeIds={editorState.mode === 'build' ? [] : activeFrame.cutSinkSideNodeIds}
              cutSourceSideNodeIds={editorState.mode === 'build' ? [] : activeFrame.cutSourceSideNodeIds}
              matchingEdgeIds={editorState.mode === 'build' ? [] : activeFrame.matchingEdgeIds}
              model={editorState.mode === 'build' ? graph : activeFrame.originalNetwork}
              onCanvasClick={handleCanvasClick}
              onCanvasPointerLeave={handleCanvasPointerLeave}
              onCanvasPointerMove={handleCanvasPointerMove}
              onCanvasPointerUp={handleCanvasPointerUp}
              editingEdgeId={editorState.mode === 'build' ? editingEdgeId : null}
              editingEdgeValue={editingEdgeValue}
              edgeEditorInputRef={edgeEditorInputRef}
              onEditingEdgeBlur={handleEditingEdgeBlur}
              onEditingEdgeCancel={cancelEditingEdge}
              onEditingEdgeSubmit={submitEditingEdge}
              onEditingEdgeValueChange={setEditingEdgeValue}
              onEdgeLabelDoubleClick={startEditingEdge}
              onEdgeLineDoubleClick={deleteEdgeById}
              onEdgeSelect={handleEdgeSelect}
              onNodePointerDown={handleNodePointerDown}
              pendingEdge={editorState.mode === 'build' ? pendingEdge : null}
              selectedEdgeId={editorState.mode === 'build' ? selection.edgeId : null}
              selectedNodeId={editorState.mode === 'build' ? selection.nodeId : null}
              svgRef={svgRef}
              title="EDITABLE FLOW NETWORK"
            />
            <div className="border-t border-[#E5E5E5] xl:border-l xl:border-t-0 xl:border-[#E5E5E5]">
              <FlowCanvas
                activeEdgeIds={activeFrame.activeResidualEdgeIds}
                activeNodeIds={activeFrame.augmentingPathNodeIds}
                cutSinkSideNodeIds={activeFrame.cutSinkSideNodeIds}
                cutSourceSideNodeIds={activeFrame.cutSourceSideNodeIds}
                matchingEdgeIds={[]}
                model={activeFrame.residualNetwork}
                title="RESIDUAL NETWORK"
              />
            </div>
          </div>

          <div className="border-t border-[#E5E5E5] grid lg:grid-cols-2">
            <div className="min-w-0">
              {flowCapacitySection !== undefined ? (
                <FlowPanelSectionView section={flowCapacitySection} />
              ) : null}
            </div>

            <div className="min-w-0 border-t border-[#E5E5E5] lg:border-l lg:border-t-0 lg:border-[#E5E5E5]">
              {residualCapacitySection !== undefined ? (
                <FlowPanelSectionView section={residualCapacitySection} />
              ) : null}
            </div>
          </div>

          <div className="border-t border-[#E5E5E5] grid lg:grid-cols-2">
            <div className="min-w-0">
              <PanelShell title="COMPLEXITY">
                <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono text-[0.76rem] text-[#111111]">
                  time: {timeline.complexityProfile.time}
                </div>
                <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono text-[0.76rem] text-[#111111]">
                  space: {timeline.complexityProfile.space}
                </div>
                <div className="border-t border-[#E5E5E5] px-1 py-1 text-[0.76rem] text-[#666666]">
                  {timeline.complexityProfile.note}
                </div>
              </PanelShell>
            </div>

            <div className="min-w-0 border-t border-[#E5E5E5] lg:border-l lg:border-t-0 lg:border-[#E5E5E5]">
              {mergedRemainingPanelSections.length === 0 ? null : (
                mergedRemainingPanelSections.map((section, index) => (
                  <div
                    key={`${section.title}-${index}`}
                    className={index === 0 ? '' : 'border-t border-[#E5E5E5]'}
                  >
                    <FlowPanelSectionView section={section} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}

export { Topic06FlowNetworkLab }
export type { Topic06View }
