import { useEffect, useMemo, useState } from 'react'

import {
  buildTreeWorkbenchTimeline,
  sanitizeText,
  sanitizeWord,
  treeSampleOperationsByAlgorithm,
  type TreeCanvas,
  type TreeCanvasEdge,
  type TreeCanvasNode,
  type TreeWorkbenchOperation,
} from '../../algorithms/tree/index.ts'
import type { TreeAlgorithmId } from '../../domain/algorithms/types.ts'

const playbackStepMs = 880

const buttonClass =
  'border border-[#111111] bg-white px-2.5 py-1 font-mono text-[0.82rem] text-[#111111] transition-colors hover:bg-[#111111] hover:text-[#FAFAFA]'
const secondaryButtonClass =
  'border border-[#E5E5E5] bg-white px-2.5 py-1 font-mono text-[0.82rem] text-[#666666] transition-colors hover:border-[#111111] hover:text-[#111111]'
const inputClass =
  'border border-[#E5E5E5] bg-white px-2.5 py-1 font-mono text-[0.84rem] text-[#111111] outline-none transition-colors focus:border-[#111111]'

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLElement && target.isContentEditable)

const getNodeFill = (tone: TreeCanvasNode['tone']) => {
  if (tone === 'accent') {
    return '#111111'
  }

  if (tone === 'success') {
    return '#F4F4F4'
  }

  if (tone === 'warning') {
    return '#E5E5E5'
  }

  if (tone === 'muted') {
    return '#F4F4F4'
  }

  return '#FFFFFF'
}

const getNodeStroke = (_tone: TreeCanvasNode['tone']) => {
  return '#111111'
}

const getEdgeStroke = (tone: TreeCanvasEdge['tone']) => {
  if (tone === 'accent') {
    return '#111111'
  }

  if (tone === 'muted') {
    return '#999999'
  }

  return '#666666'
}

const getNodeTextFill = (node: TreeCanvasNode) =>
  node.textTone === 'inverse' || node.tone === 'accent' ? '#FAFAFA' : '#111111'

const getNodeSubLabelFill = (node: TreeCanvasNode) =>
  node.textTone === 'inverse' || node.tone === 'accent' ? '#D8D8D8' : '#666666'

const getCanvasBounds = (canvas: TreeCanvas) => {
  const width = Math.max(940, ...canvas.nodes.map((node) => node.x + node.width / 2 + 60))
  const height = Math.max(440, ...canvas.nodes.map((node) => node.y + node.height / 2 + 60))
  return { height, width }
}

function CanvasNodeView({ node }: Readonly<{ node: TreeCanvasNode }>) {
  const fill = getNodeFill(node.tone)
  const stroke = getNodeStroke(node.tone)
  const textFill = getNodeTextFill(node)
  const subLabelFill = getNodeSubLabelFill(node)
  const strokeDasharray = node.strokeStyle === 'dashed' ? '5 3' : undefined

  if (node.shape === 'circle') {
    const radius = node.width / 2
    return (
      <g>
        <circle
          cx={node.x}
          cy={node.y}
          fill={fill}
          r={radius}
          stroke={stroke}
          strokeDasharray={strokeDasharray}
          strokeWidth={1.5}
        />
        <text
          dominantBaseline="middle"
          fill={textFill}
          fontFamily="'SF Mono', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace"
          fontSize="13"
          textAnchor="middle"
          x={node.x}
          y={node.y}
        >
          {node.label}
        </text>
        {node.subLabel !== undefined ? (
          <text
            dominantBaseline="hanging"
            fill={subLabelFill}
            fontFamily="'SF Mono', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace"
            fontSize="10.5"
            textAnchor="middle"
            x={node.x}
            y={node.y + radius + 8}
          >
            {node.subLabel}
          </text>
        ) : null}
      </g>
    )
  }

  if (node.shape === 'box' && node.label === '') {
    return (
      <g>
        <circle cx={node.x} cy={node.y} fill="#111111" r={5} />
      </g>
    )
  }

  if (node.shape === 'box' && node.label === '$') {
    return (
      <g>
        <text
          dominantBaseline="middle"
          fill="#111111"
          fontFamily="'SF Mono', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace"
          fontSize="13"
          textAnchor="middle"
          x={node.x}
          y={node.y}
        >
          $
        </text>
      </g>
    )
  }

  return (
    <g>
      <rect
        fill={fill}
        height={node.height}
        rx={node.shape === 'pill' ? node.height / 2 : 6}
        ry={node.shape === 'pill' ? node.height / 2 : 6}
        stroke={stroke}
        strokeDasharray={strokeDasharray}
        strokeWidth={1.3}
        width={node.width}
        x={node.x - node.width / 2}
        y={node.y - node.height / 2}
      />
      <text
        dominantBaseline="middle"
        fill={textFill}
        fontFamily="'SF Mono', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace"
        fontSize="12.5"
        textAnchor="middle"
        x={node.x}
        y={node.y - (node.subLabel === undefined ? 0 : 5)}
      >
        {node.label}
      </text>
      {node.subLabel !== undefined ? (
        <text
          dominantBaseline="middle"
          fill={subLabelFill}
          fontFamily="'SF Mono', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace"
          fontSize="10.5"
          textAnchor="middle"
          x={node.x}
          y={node.y + 9}
        >
          {node.subLabel}
        </text>
      ) : null}
    </g>
  )
}

function TreeCanvasView({ canvas }: Readonly<{ canvas: TreeCanvas }>) {
  if (canvas.nodes.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center border border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[420px] text-center font-mono text-[0.85rem] leading-6 text-[#666666]">
          {canvas.emptyLabel}
        </div>
      </div>
    )
  }

  const bounds = getCanvasBounds(canvas)

  return (
    <div className="border border-[#E5E5E5] bg-[#FAFAFA]">
      <svg className="h-[440px] w-full" viewBox={`0 0 ${bounds.width} ${bounds.height}`}>
        {canvas.edges.map((edge) => {
          const midX = (edge.fromX + edge.toX) / 2
          const midY = (edge.fromY + edge.toY) / 2
          const stroke = getEdgeStroke(edge.tone)
          const labelWidth = edge.label === undefined ? 0 : Math.max(26, edge.label.length * 8 + 12)
          const strokeDasharray = edge.strokeStyle === 'dashed' ? '5 3' : undefined

          return (
            <g key={edge.id}>
              <line
                stroke={stroke}
                strokeDasharray={strokeDasharray}
                strokeWidth={edge.tone === 'accent' ? 2.3 : 1.4}
                x1={edge.fromX}
                x2={edge.toX}
                y1={edge.fromY}
                y2={edge.toY}
              />
              {edge.label !== undefined ? (
                <>
                  <rect
                    fill="#FFFFFF"
                    height={20}
                    rx={6}
                    stroke="#E5E5E5"
                    width={labelWidth}
                    x={midX - labelWidth / 2}
                    y={midY - 10}
                  />
                  <text
                    dominantBaseline="middle"
                    fill={stroke}
                    fontFamily="'SF Mono', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace"
                    fontSize="11.5"
                    textAnchor="middle"
                    x={midX}
                    y={midY}
                  >
                    {edge.label}
                  </text>
                </>
              ) : null}
            </g>
          )
        })}
        {canvas.nodes.map((node) => (
          <CanvasNodeView key={node.id} node={node} />
        ))}
      </svg>
    </div>
  )
}

function Topic05TreeLab({ algorithmId }: Readonly<{ algorithmId: TreeAlgorithmId }>) {
  const [operations, setOperations] = useState<readonly TreeWorkbenchOperation[]>([])
  const [nextOperationId, setNextOperationId] = useState(1)
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [numberInput, setNumberInput] = useState('')
  const [wordInput, setWordInput] = useState('')
  const [textInput, setTextInput] = useState('banana')
  const [patternInput, setPatternInput] = useState('')

  const timeline = useMemo(
    () => buildTreeWorkbenchTimeline(algorithmId, operations),
    [algorithmId, operations],
  )

  const lastFrameIndex = Math.max(0, timeline.frames.length - 1)
  const boundedFrameIndex = Math.max(0, Math.min(frameIndex, lastFrameIndex))
  const isRunMode = isPlaying || frameIndex > 0
  const activeFrame =
    isRunMode
      ? (timeline.frames[boundedFrameIndex] ?? timeline.frames[0])
      : (timeline.frames[lastFrameIndex] ?? timeline.frames[0])
  const canRunPlayback = timeline.frames.length > 1

  useEffect(() => {
    setOperations([])
    setNextOperationId(1)
    setFrameIndex(0)
    setIsPlaying(false)
  }, [algorithmId])

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

  const appendOperation = (operation: Omit<TreeWorkbenchOperation, 'id'>) => {
    const id = `op-${nextOperationId}`
    setNextOperationId((current) => current + 1)
    setOperations((current) => [...current, { ...operation, id }] as readonly TreeWorkbenchOperation[])
    setFrameIndex(0)
    setIsPlaying(false)
  }

  const loadSample = () => {
    setOperations(treeSampleOperationsByAlgorithm[algorithmId])
    setNextOperationId(treeSampleOperationsByAlgorithm[algorithmId].length + 1)
    setFrameIndex(0)
    setIsPlaying(false)
    if (algorithmId === 'suffix-tries' || algorithmId === 'suffix-trees') {
      setTextInput('banana')
    }
  }

  const clearOperations = () => {
    setOperations([])
    setNextOperationId(1)
    setFrameIndex(0)
    setIsPlaying(false)
  }

const submitNumberOperation = (kind: 'insert-key' | 'search-key' | 'delete-key') => {
    const parsedValue = Number.parseInt(numberInput, 10)
    if (!Number.isFinite(parsedValue)) {
      return
    }
    appendOperation({ kind, value: parsedValue })
    setNumberInput('')
  }

  const submitWordOperation = (kind: 'insert-word' | 'lookup-word', mode: 'prefix' | 'exact' = 'prefix') => {
    const sanitized = sanitizeWord(wordInput)
    if (sanitized.length === 0) {
      return
    }

    if (kind === 'insert-word') {
      appendOperation({ kind, value: sanitized })
    } else {
      appendOperation({ kind: 'lookup-word', mode, value: sanitized } as Omit<TreeWorkbenchOperation, 'id'>)
    }
    setWordInput('')
  }

  const submitTextOperation = () => {
    const sanitized = sanitizeText(textInput)
    if (sanitized.length === 0) {
      return
    }
    appendOperation({ kind: 'set-text', value: sanitized })
  }

  const submitPatternOperation = () => {
    const sanitized = sanitizeText(patternInput)
    if (sanitized.length === 0) {
      return
    }
    appendOperation({ kind: 'search-pattern', value: sanitized })
    setPatternInput('')
  }

  const highlightedLines = useMemo(
    () => new Set(activeFrame?.executedLines ?? []),
    [activeFrame?.executedLines],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setIsPlaying(false)
        setFrameIndex((current) => Math.max(0, current - 1))
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setIsPlaying(false)
        setFrameIndex((current) => Math.min(lastFrameIndex, current + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lastFrameIndex])

  return (
    <section className="mt-4 space-y-2">
      <div className="space-y-2">
        <p className="max-w-[920px] text-[1rem] leading-7 text-[#666666]">{timeline.subtitle}</p>
      </div>

      <section className="border border-[#E5E5E5] bg-white">
        <div className="border-b border-[#E5E5E5] px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-[0.84rem] text-[#666666]">
              Build mode records your own operations, then the playback controls walk through the generated timeline.
            </div>
            <div className="font-mono text-[0.82rem] text-[#111111]">
              steps: {timeline.frames.length} | mode: {isRunMode ? 'run' : 'build'}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className={canRunPlayback ? buttonClass : `${secondaryButtonClass} cursor-not-allowed`}
              disabled={!canRunPlayback}
              onClick={() => {
                if (!canRunPlayback) {
                  return
                }

                if (boundedFrameIndex >= lastFrameIndex) {
                  setFrameIndex(0)
                }
                setIsPlaying((current) => !current)
              }}
              type="button"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button className={secondaryButtonClass} onClick={loadSample} type="button">
              Load Sample
            </button>
            <button className={secondaryButtonClass} onClick={clearOperations} type="button">
              Clear
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {timeline.controlKind === 'balanced-tree' ? (
              <>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  onChange={(event) => setNumberInput(event.target.value)}
                  placeholder="key"
                  value={numberInput}
                />
                <button className={buttonClass} onClick={() => submitNumberOperation('insert-key')} type="button">
                  Insert
                </button>
                <button className={secondaryButtonClass} onClick={() => submitNumberOperation('search-key')} type="button">
                  Search
                </button>
                <button className={secondaryButtonClass} onClick={() => submitNumberOperation('delete-key')} type="button">
                  Delete
                </button>
              </>
            ) : timeline.controlKind === 'prefix-trie' ? (
              <>
                <input
                  className={inputClass}
                  onChange={(event) => setWordInput(event.target.value)}
                  placeholder="word"
                  value={wordInput}
                />
                <button className={buttonClass} onClick={() => submitWordOperation('insert-word')} type="button">
                  Insert Word
                </button>
                <button
                  className={secondaryButtonClass}
                  onClick={() => submitWordOperation('lookup-word', 'prefix')}
                  type="button"
                >
                  Prefix Lookup
                </button>
                <button
                  className={secondaryButtonClass}
                  onClick={() => submitWordOperation('lookup-word', 'exact')}
                  type="button"
                >
                  Exact Lookup
                </button>
              </>
            ) : (
              <>
                <input
                  className={inputClass}
                  onChange={(event) => setTextInput(event.target.value)}
                  placeholder="base string"
                  value={textInput}
                />
                <button className={buttonClass} onClick={submitTextOperation} type="button">
                  Rebuild From Text
                </button>
                <input
                  className={inputClass}
                  onChange={(event) => setPatternInput(event.target.value)}
                  placeholder="pattern"
                  value={patternInput}
                />
                <button className={secondaryButtonClass} onClick={submitPatternOperation} type="button">
                  Search Pattern
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="grid border-r border-[#E5E5E5]">
            <section className="border-b border-[#E5E5E5] px-3 py-3">
              <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">PSEUDOCODE</div>
              <div className="mt-3 space-y-1 font-mono text-[0.82rem] leading-6 text-[#111111]">
                {timeline.pseudocodeLines.map((line) => {
                  const isActive = highlightedLines.has(line.lineNumber)
                  return (
                    <div
                      key={line.lineNumber}
                      className={[
                        'flex gap-3 px-2 py-0.5 transition-colors',
                        isActive ? 'bg-[#F4F4F4]' : 'bg-transparent',
                      ].join(' ')}
                    >
                      <span className="min-w-[2rem] text-[#999999]">{line.lineNumber}</span>
                      <span>{line.text}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="px-3 py-3">
              <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">EXECUTION</div>
              <div className="mt-3 space-y-3">
                <div className="border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2">
                  <div className="font-mono text-[0.72rem] tracking-[0.08em] text-[#666666]">
                    {activeFrame?.status ?? 'Idle'}
                  </div>
                  <div className="mt-1 font-mono text-[0.86rem] text-[#111111]">
                    {activeFrame?.operationText ?? 'No operation'}
                  </div>
                  <p className="mt-2 text-[0.92rem] leading-6 text-[#666666]">
                    {activeFrame?.explanation ?? 'No explanation available.'}
                  </p>
                </div>

                <div className="border border-[#E5E5E5] bg-white">
                  <div className="border-b border-[#E5E5E5] px-3 py-2 font-mono text-[0.72rem] tracking-[0.08em] text-[#666666]">
                    LOG
                  </div>
                  <div className="space-y-1 px-3 py-2 font-mono text-[0.78rem] leading-6 text-[#111111]">
                    {(activeFrame?.logLines ?? ['No events recorded.']).map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>

                <div className="border border-[#E5E5E5] bg-white">
                  <div className="border-b border-[#E5E5E5] px-3 py-2 font-mono text-[0.72rem] tracking-[0.08em] text-[#666666]">
                    METRICS
                  </div>
                  <div className="px-3 py-2">
                    <div className="space-y-0.5">
                      {(activeFrame?.metrics ?? timeline.complexityRows).map((metric) => (
                        <div key={metric.label} className="flex items-baseline justify-between">
                          <div className="font-mono text-[0.72rem] tracking-[0.08em] text-[#999999]">
                            {metric.label}
                          </div>
                          <div className="font-mono text-[0.82rem] text-[#111111]">{metric.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">STRUCTURE CANVAS</div>
                <div className="font-mono text-[0.72rem] text-[#666666]">
                  {isRunMode
                    ? `Playback frame ${boundedFrameIndex}/${lastFrameIndex}`
                    : 'Build mode shows the latest valid structure from your own operations.'}
                </div>
                {algorithmId === 'left-leaning-red-black-trees' ? (
                  <div className="mt-0.5 font-mono text-[0.7rem] text-[#999999]">
                    dashed edges represent red links; solid edges represent black links.
                  </div>
                ) : null}
              </div>
              <div className="font-mono text-[0.74rem] text-[#666666]">
                operations: {operations.length} | timeline frames: {timeline.frames.length}
              </div>
            </div>
            <div className="mt-3">
              {(() => {
                const baseCanvas =
                  activeFrame?.canvas ??
                  timeline.frames[0]?.canvas ?? {
                    edges: [],
                    emptyLabel: 'Nothing to render.',
                    nodes: [],
                  }

                const canvas =
                  baseCanvas.nodes.length === 0 && operations.length > 0
                    ? { ...baseCanvas, emptyLabel: '' }
                    : baseCanvas

                return <TreeCanvasView canvas={canvas} />
              })()}
            </div>
          </section>
        </div>
      </section>
    </section>
  )
}

export { Topic05TreeLab }
