import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  createMergeLineEvents,
  createMergeSortTimeline,
  getMergeFrameByLineEvent,
  mergeSortPresets,
} from '../../algorithms/array/mergeSortTimeline.ts'
import { MAX_TOPIC02_SORT_DATASET_LENGTH } from '../../domain/algorithms/topic02SortLimits.ts'
import type {
  MergeCounters,
  MergeFrame,
  SortRegion,
} from '../../domain/algorithms/types.ts'
import { parseSortDataset } from './sortDatasetInput.ts'

const animationMs = 280
const cellWidthPx = 56
const defaultValues = mergeSortPresets[0]?.values ?? []

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLElement && target.isContentEditable)

const formatRange = (range: SortRegion | null) =>
  range === null ? '-' : `[${range.start}..${range.end}]`

const formatCounters = (counters: MergeCounters) => [
  { label: 'Comparisons', value: counters.comparisons },
  { label: 'Array Writes', value: counters.arrayWrites },
  { label: 'Buffer Writes', value: counters.bufferWrites },
  { label: 'Swaps', value: counters.swaps },
  { label: 'Merge Passes', value: counters.passes },
]

function MergeArrayStrip({ frame }: Readonly<{ frame: MergeFrame }>) {
  const activeIndices = useMemo(() => new Set(frame.activeIndices), [frame.activeIndices])
  const nodeByIdRef = useRef<Record<string, HTMLDivElement | null>>({})
  const previousRectByIdRef = useRef<Record<string, DOMRect>>({})

  useLayoutEffect(() => {
    const nextRectById: Record<string, DOMRect> = {}

    frame.items.forEach((item) => {
      const node = nodeByIdRef.current[item.id]
      if (node !== null && node !== undefined) {
        nextRectById[item.id] = node.getBoundingClientRect()
      }
    })

    frame.items.forEach((item) => {
      const node = nodeByIdRef.current[item.id]
      const previousRect = previousRectByIdRef.current[item.id]
      const nextRect = nextRectById[item.id]

      if (
        node === null ||
        node === undefined ||
        previousRect === undefined ||
        nextRect === undefined
      ) {
        return
      }

      const deltaX = previousRect.left - nextRect.left
      const deltaY = previousRect.top - nextRect.top
      const hasMovement = Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5

      if (!hasMovement) {
        return
      }

      node.style.transition = 'none'
      node.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      node.style.willChange = 'transform'
      node.style.zIndex = '3'

      window.requestAnimationFrame(() => {
        node.style.transition = `transform ${animationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
        node.style.transform = 'translate(0, 0)'
      })
    })

    const timeoutId = window.setTimeout(() => {
      frame.items.forEach((item) => {
        const node = nodeByIdRef.current[item.id]
        if (node !== null && node !== undefined) {
          node.style.transition = ''
          node.style.transform = ''
          node.style.willChange = ''
          node.style.zIndex = ''
        }
      })
    }, animationMs + 40)

    previousRectByIdRef.current = nextRectById

    return () => window.clearTimeout(timeoutId)
  }, [frame.items])

  const markerForIndex = (index: number) => {
    const labels: string[] = []
    const inLeft =
      frame.leftRange !== null &&
      index >= frame.leftRange.start &&
      index <= frame.leftRange.end
    const inRight =
      frame.rightRange !== null &&
      index >= frame.rightRange.start &&
      index <= frame.rightRange.end
    const isWrite = frame.mergeWriteIndex === index

    if (inLeft) {
      labels.push('L')
    }
    if (inRight) {
      labels.push('R')
    }
    if (isWrite) {
      labels.push('W')
    }
    if (activeIndices.has(index)) {
      labels.push('*')
    }

    return labels.join('/')
  }

  return (
    <div className="space-y-2 overflow-hidden">
      <div className="flex flex-wrap gap-2">
        {frame.items.map((_, index) => (
          <div
            key={`marker-${index}`}
            className="text-center font-mono text-[0.66rem] tracking-[0.04em] text-[#666666]"
            style={{ width: `${cellWidthPx}px` }}
          >
            {markerForIndex(index)}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {frame.items.map((item, index) => {
          const inCurrentRange =
            frame.currentRange !== null &&
            index >= frame.currentRange.start &&
            index <= frame.currentRange.end
          const isActive = activeIndices.has(index)

          return (
            <div
              key={item.id}
              ref={(node) => {
                nodeByIdRef.current[item.id] = node
              }}
              className="space-y-1"
              style={{ width: `${cellWidthPx}px` }}
            >
              <div
                className={[
                  'flex h-12 items-center justify-center border font-mono text-[0.96rem] transition-colors',
                  isActive
                    ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                    : inCurrentRange
                      ? 'border-[#111111] bg-[#F4F4F4] text-[#111111]'
                      : 'border-[#E5E5E5] bg-white text-[#111111]',
                ].join(' ')}
              >
                {item.value}
              </div>
              <div className="text-center font-mono text-[0.65rem] text-[#666666]">[{index}]</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MergeBufferStrip({ frame }: Readonly<{ frame: MergeFrame }>) {
  return (
    <div className="space-y-1.5">
      <div className="font-mono text-[0.74rem] tracking-[0.06em] text-[#666666]">TEMP BUFFER</div>
      <div className="flex flex-wrap gap-2">
        {frame.tempBuffer.length === 0 ? (
          <div className="font-mono text-[0.76rem] text-[#666666]">empty</div>
        ) : (
          frame.tempBuffer.map((cell) => (
            <div
              key={cell.id}
              className={[
                'w-[56px] border px-1 py-1 font-mono text-center transition-colors',
                cell.consumed
                  ? 'border-[#E5E5E5] bg-white text-[#999999]'
                  : 'border-[#111111] bg-[#FAFAFA] text-[#111111]',
              ].join(' ')}
            >
              <div className="text-[0.86rem]">{cell.value}</div>
              <div className="text-[0.62rem]">{cell.source === 'left' ? 'L' : 'R'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MergeRecursionLine({ frame }: Readonly<{ frame: MergeFrame }>) {
  const nodesByDepth = useMemo(() => {
    const groups = new Map<number, typeof frame.treeNodes>()
    frame.treeNodes.forEach((node) => {
      const current = groups.get(node.depth) ?? []
      groups.set(node.depth, [...current, node])
    })

    return Array.from(groups.entries())
      .sort((left, right) => left[0] - right[0])
      .map(([depth, nodes]) => ({
        depth,
        nodes: [...nodes].sort((left, right) => left.lo - right.lo),
      }))
  }, [frame.treeNodes])

  const maxDepth = useMemo(
    () => frame.treeNodes.reduce((accumulator, node) => Math.max(accumulator, node.depth), 0),
    [frame.treeNodes],
  )
  const stackNodeIds = useMemo(() => new Set(frame.stack.map((stackFrame) => stackFrame.id)), [frame.stack])
  const n = frame.items.length
  const approxLogDepth = n > 1 ? Math.ceil(Math.log2(n)) : 0
  const currentDepth = Math.max(0, frame.stack.length - 1)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.74rem] text-[#666666]">
        <div>RECURSION TREE</div>
        <div>
          depth: {currentDepth} / {maxDepth} (log2 n ≈ {approxLogDepth})
        </div>
      </div>

      <div className="overflow-x-auto border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-2">
        <div className="min-w-max space-y-1.5">
          {nodesByDepth.map((group) => (
            <div key={`depth-${group.depth}`} className="flex items-center gap-2">
              <div className="w-[4ch] font-mono text-[0.7rem] text-[#666666]">d{group.depth}</div>
              <div className="flex flex-wrap items-center gap-1.5">
                {group.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={[
                      'border px-2 py-0.5 font-mono text-[0.72rem]',
                      stackNodeIds.has(node.id)
                        ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                        : node.status === 'merging'
                          ? 'border-[#111111] bg-[#FAFAFA] text-[#111111]'
                          : node.status === 'done'
                            ? 'border-[#111111] bg-[#F4F4F4] text-[#111111]'
                            : 'border-[#E5E5E5] bg-white text-[#666666]',
                    ].join(' ')}
                  >
                    [{node.lo}..{node.hi}]
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Topic02MergeSortLab() {
  const [values, setValues] = useState<readonly number[]>(() => [...defaultValues])
  const [draft, setDraft] = useState(() => defaultValues.join(', '))
  const [validationError, setValidationError] = useState<string | null>(null)
  const [lineEventIndex, setLineEventIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const timeline = useMemo(
    () => createMergeSortTimeline(values),
    [values],
  )

  const lineEvents = useMemo(
    () => createMergeLineEvents(timeline.frames),
    [timeline.frames],
  )
  const hasLineEvents = lineEvents.length > 0
  const lastLineEventIndex = Math.max(0, lineEvents.length - 1)
  const boundedLineEventIndex = Math.max(0, Math.min(lineEventIndex, lastLineEventIndex))
  const activeEvent = lineEvents[boundedLineEventIndex]
  const activeFrame = getMergeFrameByLineEvent(timeline, lineEvents, boundedLineEventIndex)
  const activeLine =
    activeEvent?.lineNumber ??
    timeline.pseudocodeLines[0]?.lineNumber ??
    1
  const frameProgress = (activeEvent?.frameIndex ?? 0) + 1
  const totalFrames = Math.max(1, timeline.frames.length)

  const goToPreviousLine = () => {
    setIsPlaying(false)
    setLineEventIndex((current) => Math.max(0, current - 1))
  }

  const goToNextLine = () => {
    setIsPlaying(false)
    setLineEventIndex((current) => Math.min(lastLineEventIndex, current + 1))
  }

  const resetPlayback = () => {
    setIsPlaying(false)
    setLineEventIndex(0)
  }

  const togglePlay = () => {
    if (!hasLineEvents) {
      return
    }

    setIsPlaying((current) => {
      if (current) {
        return false
      }

      if (lineEventIndex >= lastLineEventIndex) {
        setLineEventIndex(0)
      }

      return true
    })
  }

  useEffect(() => {
    setIsPlaying(false)
    setLineEventIndex(0)
  }, [values])

  useEffect(() => {
    if (!isPlaying) {
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
      setLineEventIndex((current) => Math.min(lastLineEventIndex, current + 1))
    }, 520)

    return () => window.clearTimeout(timeoutId)
  }, [hasLineEvents, isPlaying, lineEventIndex, lastLineEventIndex])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPreviousLine()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNextLine()
      }

      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasLineEvents, lineEventIndex, lastLineEventIndex])

  return (
    <section className="mt-4 space-y-4">
      <div className="space-y-3">
        <p className="max-w-[820px] text-[1rem] leading-7 text-[#666666]">
          Line-by-line execution with full recursion state, range tracking, and temporary buffer writes.
          {` `}
          Use the same keyboard stepping model as other topic workbenches.
        </p>
      </div>

      <section className="border border-[#E5E5E5] bg-white">
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-[0.84rem] text-[#666666]">
              Use <span className="text-[#111111]">←</span> and{' '}
              <span className="text-[#111111]">→</span> to step lines,{' '}
              <span className="text-[#111111]">Space</span> to play/pause.
            </div>
            <div className="font-mono text-[0.82rem] text-[#111111]">
              line event: {hasLineEvents ? boundedLineEventIndex + 1 : 0} / {lineEvents.length}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className="border border-[#111111] bg-white px-2.5 py-1 font-mono text-[0.82rem] text-[#111111] transition-colors hover:bg-[#111111] hover:text-[#FAFAFA]"
              onClick={goToPreviousLine}
              type="button"
            >
              Previous
            </button>
            <button
              className="border border-[#111111] bg-[#111111] px-2.5 py-1 font-mono text-[0.82rem] text-[#FAFAFA] transition-colors hover:bg-white hover:text-[#111111]"
              onClick={togglePlay}
              type="button"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              className="border border-[#111111] bg-white px-2.5 py-1 font-mono text-[0.82rem] text-[#111111] transition-colors hover:bg-[#111111] hover:text-[#FAFAFA]"
              onClick={goToNextLine}
              type="button"
            >
              Next
            </button>
            <button
              className="border border-[#E5E5E5] bg-white px-2.5 py-1 font-mono text-[0.82rem] text-[#111111] transition-colors hover:border-[#111111]"
              onClick={resetPlayback}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] px-4 py-3">
          <div className="mt-1 space-y-1">
            <label className="font-mono text-[0.78rem] tracking-[0.05em] text-[#666666]">
              Enter integers (comma or space separated)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="min-w-0 flex-1 border border-[#E5E5E5] bg-white px-3 py-1.5 font-mono text-[0.86rem] text-[#111111] outline-none transition-colors focus:border-[#111111]"
                onChange={(event) => {
                  const nextDraft = event.target.value
                  setDraft(nextDraft)

                  const result = parseSortDataset(nextDraft, {
                    maxLength: MAX_TOPIC02_SORT_DATASET_LENGTH,
                    mode: 'comparison',
                  })

                  if (!result.ok) {
                    setValidationError(result.error)
                    return
                  }

                  setValidationError(null)
                  setValues(result.values)
                }}
                type="text"
                value={draft}
              />
              <button
                className="border px-2.5 py-1 font-mono text-[0.8rem] transition-colors hover:border-[#111111]"
                onClick={() => {
                  const length =
                    defaultValues.length > 0
                      ? Math.min(defaultValues.length, MAX_TOPIC02_SORT_DATASET_LENGTH)
                      : Math.min(8, MAX_TOPIC02_SORT_DATASET_LENGTH)
                  const randomValues = Array.from({ length }, () => Math.floor(Math.random() * 99) + 1)
                  setValidationError(null)
                  setValues(randomValues)
                  setDraft(randomValues.join(', '))
                }}
                type="button"
              >
                Random
              </button>
              <div className="font-mono text-[0.78rem] text-[#666666]">
                count: {values.length}/{MAX_TOPIC02_SORT_DATASET_LENGTH}
              </div>
            </div>
            {validationError !== null ? (
              <div className="font-mono text-[0.78rem] text-[#B42318]">{validationError}</div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-mono text-[0.9rem] text-[#111111]">Array and Merge Buffer</h3>
            <div className="font-mono text-[0.76rem] text-[#666666]">
              frame: {frameProgress} / {totalFrames}
            </div>
          </div>
          <div className="mt-2 border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1.5 font-mono text-[0.8rem] text-[#111111]">
            op: {activeFrame.operationText}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.74rem] text-[#666666]">
            <div>current: {formatRange(activeFrame.currentRange)}</div>
            <div>left: {formatRange(activeFrame.leftRange)}</div>
            <div>right: {formatRange(activeFrame.rightRange)}</div>
            <div>write index: {activeFrame.mergeWriteIndex ?? '-'}</div>
          </div>
          <div className="mt-3">
            <MergeArrayStrip frame={activeFrame} />
          </div>
          <div className="mt-3 border-t border-[#E5E5E5] pt-2">
            <MergeBufferStrip frame={activeFrame} />
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] px-4 py-3">
          <h3 className="font-mono text-[0.9rem] text-[#111111]">Recursion State</h3>
          <div className="mt-2">
            <MergeRecursionLine frame={activeFrame} />
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] grid min-w-0 gap-0 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 px-4 py-3">
            <h3 className="font-mono text-[0.9rem] text-[#111111]">Pseudocode</h3>
            <div className="mt-2 overflow-x-auto border border-[#E5E5E5] bg-[#FAFAFA] p-1.5 font-mono text-[0.84rem] leading-6">
              {timeline.pseudocodeLines.map((line) => {
                const isCurrent = line.lineNumber === activeLine

                return (
                  <div
                    key={line.lineNumber}
                    className={[
                      'flex min-w-max gap-3 px-2 py-0.5 transition-colors',
                      isCurrent ? 'bg-[#E5E5E5] text-[#111111]' : 'bg-transparent text-[#666666]',
                    ].join(' ')}
                  >
                    <span className="w-[2ch] text-right text-[#666666]">{line.lineNumber}</span>
                    <span className="whitespace-pre">{line.text}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="min-w-0 border-t border-[#E5E5E5] px-4 py-3 xl:border-l xl:border-t-0">
            <h3 className="font-mono text-[0.9rem] text-[#111111]">Complexity and Space</h3>
            <div className="mt-2 space-y-1.5 font-mono text-[0.79rem] text-[#111111]">
              <div>best: {timeline.complexityProfile.best}</div>
              <div>average: {timeline.complexityProfile.average}</div>
              <div>worst: {timeline.complexityProfile.worst}</div>
              <div>aux space: {timeline.complexityProfile.auxiliary}</div>
              <div>stable: {timeline.complexityProfile.stable ? 'yes' : 'no'}</div>
              <div>in-place: {timeline.complexityProfile.inPlace ? 'yes' : 'no'}</div>
            </div>

            <div className="mt-3 border-t border-[#E5E5E5] pt-2">
              <div className="font-mono text-[0.8rem] tracking-[0.06em] text-[#666666]">
                Live Counters
              </div>
              <div className="mt-2 space-y-1.5">
                {formatCounters(activeFrame.counters).map((entry) => (
                  <div
                    key={entry.label}
                    className="flex items-center justify-between border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 font-mono text-[0.8rem] text-[#111111]"
                  >
                    <span>{entry.label}</span>
                    <span>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 border-t border-[#E5E5E5] pt-2 font-mono text-[0.76rem] leading-5 text-[#666666]">
              <div>{timeline.spaceProfile.inputStorage}</div>
              <div>{timeline.spaceProfile.workingStorage}</div>
              <div>{timeline.spaceProfile.auxiliaryStorage}</div>
            </div>
          </section>
        </div>
      </section>
    </section>
  )
}

export { Topic02MergeSortLab }
