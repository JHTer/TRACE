import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
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
  quicksortVariantLabel,
} from '../../algorithms/array/partitionSelectionTimeline.ts'
import type {
  PartitionFrame,
  PartitionSelectionAlgorithmId,
  QuickselectStrategyId,
  QuicksortVariantId,
  SortCounters,
  SortPresetId,
  SortRegion,
} from '../../domain/algorithms/types.ts'

const animationMs = 280
const cellWidthPx = 56
const defaultPresetId: SortPresetId = 'with-duplicates'

const algorithmSubtitle: Record<PartitionSelectionAlgorithmId, string> = {
  quicksort:
    'Partition-driven recursive sorting with explicit pivot behavior and region bands.',
  quickselect:
    'Order-statistic selection with pivot partitioning and shrinking search intervals.',
  'median-of-medians':
    'Deterministic linear-time selection using group-of-five pivot construction.',
}

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLElement && target.isContentEditable)

const inRange = (index: number, range: SortRegion | null) =>
  range !== null && index >= range.start && index <= range.end

const formatRange = (range: SortRegion | null) =>
  range === null ? '-' : `[${range.start}..${range.end}]`

const formatCounters = (counters: SortCounters) => [
  { label: 'Comparisons', value: counters.comparisons },
  { label: 'Writes', value: counters.writes },
  { label: 'Swaps', value: counters.swaps },
  { label: 'Partition Passes', value: counters.passes },
]

function PartitionArrayStrip({ frame }: Readonly<{ frame: PartitionFrame }>) {
  const activeIndices = useMemo(() => new Set(frame.activeIndices), [frame.activeIndices])
  const pointerLabelsByIndex = useMemo(() => {
    const mapping = new Map<number, string[]>()

    frame.pointers.forEach((pointer) => {
      const currentLabels = mapping.get(pointer.index) ?? []
      mapping.set(pointer.index, [...currentLabels, pointer.label])
    })

    return mapping
  }, [frame.pointers])

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

    const cleanupTimeoutId = window.setTimeout(() => {
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

    return () => window.clearTimeout(cleanupTimeoutId)
  }, [frame.items])

  return (
    <div className="space-y-2 overflow-hidden">
      <div className="flex flex-wrap gap-2">
        {frame.items.map((_, index) => {
          const labels = pointerLabelsByIndex.get(index) ?? []

          return (
            <div
              key={`pointer-${index}`}
              className="text-center font-mono text-[0.66rem] tracking-[0.04em] text-[#666666]"
              style={{ width: `${cellWidthPx}px` }}
            >
              {labels.join('/')}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {frame.items.map((item, index) => {
          const isActive = activeIndices.has(index)
          const isPivot = frame.pivotIndex === index
          const isTarget = frame.targetIndex === index
          const isResult = frame.resultIndex === index
          const isLess = inRange(index, frame.lessRange)
          const isEqual = inRange(index, frame.equalRange)
          const isGreater = inRange(index, frame.greaterRange)
          const isCurrent = inRange(index, frame.currentRange)

          let visualClass = 'border-[#E5E5E5] bg-white text-[#111111]'
          if (isCurrent) {
            visualClass = 'border-[#111111] bg-[#FAFAFA] text-[#111111]'
          }
          if (isLess) {
            visualClass = 'border-[#111111] border-dashed bg-[#FAFAFA] text-[#111111]'
          }
          if (isEqual) {
            visualClass = 'border-2 border-[#111111] bg-[#F4F4F4] text-[#111111]'
          }
          if (isGreater) {
            visualClass = 'border-[#111111] border-double bg-white text-[#111111]'
          }
          if (isPivot) {
            visualClass = `${visualClass} ring-1 ring-[#111111]`
          }
          if (isResult) {
            visualClass = `${visualClass} border-2`
          }
          if (isTarget) {
            visualClass = `${visualClass} underline decoration-1 underline-offset-2`
          }
          if (isActive) {
            visualClass = 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
          }

          const tags: string[] = []
          if (isLess) {
            tags.push('L')
          }
          if (isEqual) {
            tags.push('E')
          }
          if (isGreater) {
            tags.push('G')
          }
          if (isPivot) {
            tags.push('P')
          }
          if (isTarget) {
            tags.push('K')
          }
          if (isResult) {
            tags.push('R')
          }
          const tagsText = tags.length === 0 ? '-' : tags.join('/')

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
                  visualClass,
                ].join(' ')}
              >
                {item.value}
              </div>
              <div className="text-center font-mono text-[0.65rem] text-[#666666]">[{index}]</div>
              <div className="text-center font-mono text-[0.58rem] tracking-[0.05em] text-[#666666]">
                {tagsText}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Topic02PartitionSelectionLab({
  algorithmId,
  quicksortVariant,
  quickselectStrategy,
}: Readonly<{
  algorithmId: PartitionSelectionAlgorithmId
  quicksortVariant: QuicksortVariantId
  quickselectStrategy: QuickselectStrategyId
}>) {
  const [presetId, setPresetId] = useState<SortPresetId>(defaultPresetId)
  const [kRank, setKRank] = useState<number>(
    getDefaultRank1Based(
      partitionSelectionPresets.find((preset) => preset.id === defaultPresetId)?.values ??
        partitionSelectionPresets[0]?.values ??
        [],
    ),
  )
  const [lineEventIndex, setLineEventIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const selectedPreset =
    partitionSelectionPresets.find((preset) => preset.id === presetId) ??
    partitionSelectionPresets[0]

  const isSelectionView = isSelectionAlgorithm(algorithmId)

  useEffect(() => {
    if (!isSelectionView) {
      return
    }

    setKRank(getDefaultRank1Based(selectedPreset.values))
  }, [isSelectionView, presetId, selectedPreset.values])

  const boundedRank = normalizeRank1Based(kRank, selectedPreset.values)

  const timeline = useMemo(() => {
    if (algorithmId === 'quicksort') {
      return createQuicksortTimeline(quicksortVariant, selectedPreset.values)
    }

    if (algorithmId === 'quickselect') {
      return createQuickselectTimeline(quickselectStrategy, selectedPreset.values, boundedRank)
    }

    return createMedianOfMediansTimeline(selectedPreset.values, boundedRank)
  }, [
    algorithmId,
    boundedRank,
    quickselectStrategy,
    quicksortVariant,
    selectedPreset.values,
  ])

  const lineEvents = useMemo(
    () => createPartitionLineEvents(timeline.frames),
    [timeline.frames],
  )
  const hasLineEvents = lineEvents.length > 0
  const lastLineEventIndex = Math.max(0, lineEvents.length - 1)
  const boundedLineEventIndex = Math.max(0, Math.min(lineEventIndex, lastLineEventIndex))
  const activeEvent = lineEvents[boundedLineEventIndex]
  const activeFrame = getPartitionFrameByLineEvent(
    timeline,
    lineEvents,
    boundedLineEventIndex,
  )
  const activeLine = activeEvent?.lineNumber ?? timeline.pseudocodeLines[0]?.lineNumber ?? 1
  const frameProgress = (activeEvent?.frameIndex ?? 0) + 1
  const totalFrames = Math.max(1, timeline.frames.length)
  const resultValue =
    activeFrame.resultIndex === null
      ? null
      : (activeFrame.items[activeFrame.resultIndex]?.value ?? null)

  const algorithmModeLabel =
    algorithmId === 'quicksort'
      ? `Variant: ${quicksortVariantLabel[quicksortVariant]}`
      : algorithmId === 'quickselect'
        ? `Strategy: ${quickselectStrategyLabel[quickselectStrategy]}`
        : 'Strategy: Deterministic Pivot'

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
  }, [algorithmId, quicksortVariant, quickselectStrategy, presetId, boundedRank])

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
          {algorithmSubtitle[algorithmId]} {algorithmModeLabel}.
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
          <div className="font-mono text-[0.8rem] tracking-[0.06em] text-[#666666]">DATASET PRESET</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {partitionSelectionPresets.map((preset) => {
              const isActive = preset.id === presetId

              return (
                <button
                  key={preset.id}
                  className={[
                    'border px-2.5 py-1 font-mono text-[0.8rem] transition-colors',
                    isActive
                      ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                      : 'border-[#E5E5E5] bg-white text-[#111111]',
                  ].join(' ')}
                  onClick={() => setPresetId(preset.id)}
                  type="button"
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
          <div className="mt-1.5 font-mono text-[0.76rem] text-[#666666]">
            values: [{selectedPreset.values.join(', ')}]
          </div>
        </div>

        {isSelectionView ? (
          <div className="border-t border-[#E5E5E5] px-4 py-3">
            <div className="font-mono text-[0.8rem] tracking-[0.06em] text-[#666666]">K RANK (1-BASED)</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedPreset.values.map((_, index) => {
                const rank = index + 1
                const isActive = rank === boundedRank

                return (
                  <button
                    key={`rank-${rank}`}
                    className={[
                      'border px-2.5 py-1 font-mono text-[0.8rem] transition-colors',
                      isActive
                        ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                        : 'border-[#E5E5E5] bg-white text-[#111111]',
                    ].join(' ')}
                    onClick={() => setKRank(rank)}
                    type="button"
                  >
                    {rank}
                  </button>
                )
              })}
            </div>
            <div className="mt-1.5 font-mono text-[0.76rem] text-[#666666]">
              target: {boundedRank}-th smallest
            </div>
          </div>
        ) : null}

        <div className="border-t border-[#E5E5E5] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-mono text-[0.9rem] text-[#111111]">Partition State</h3>
            <div className="font-mono text-[0.76rem] text-[#666666]">
              frame: {frameProgress} / {totalFrames}
            </div>
          </div>

          <div className="mt-2 border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1.5 font-mono text-[0.8rem] text-[#111111]">
            op: {activeFrame.operationText}
          </div>

          <div className="mt-1.5 grid gap-1 font-mono text-[0.74rem] text-[#666666] md:grid-cols-2 xl:grid-cols-4">
            <div>current: {formatRange(activeFrame.currentRange)}</div>
            <div>&lt; pivot: {formatRange(activeFrame.lessRange)}</div>
            <div>= pivot: {formatRange(activeFrame.equalRange)}</div>
            <div>&gt; pivot: {formatRange(activeFrame.greaterRange)}</div>
            <div>
              pivot: {activeFrame.pivotValue === null ? '-' : activeFrame.pivotValue}
              {activeFrame.pivotIndex === null ? '' : ` @${activeFrame.pivotIndex}`}
            </div>
            <div>
              target k: {activeFrame.targetIndex === null ? '-' : activeFrame.targetIndex + 1}
            </div>
            <div>
              result index: {activeFrame.resultIndex === null ? '-' : activeFrame.resultIndex}
            </div>
            <div>result value: {resultValue === null ? '-' : resultValue}</div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 font-mono text-[0.68rem] text-[#666666]">
            <div className="border border-dashed border-[#111111] bg-[#FAFAFA] px-2 py-0.5">
              L: &lt; pivot
            </div>
            <div className="border-2 border-[#111111] bg-[#F4F4F4] px-2 py-0.5">E: = pivot</div>
            <div className="border border-double border-[#111111] bg-white px-2 py-0.5">
              G: &gt; pivot
            </div>
            <div className="border border-[#111111] bg-[#111111] px-2 py-0.5 text-[#FAFAFA]">
              active
            </div>
            <div className="border border-[#111111] bg-[#FAFAFA] px-2 py-0.5">P: pivot</div>
            <div className="border border-[#111111] bg-[#FAFAFA] px-2 py-0.5">K: target k</div>
            <div className="border-2 border-[#111111] bg-[#FAFAFA] px-2 py-0.5">
              R: selected result
            </div>
          </div>

          <div className="mt-3">
            <PartitionArrayStrip frame={activeFrame} />
          </div>
        </div>

        <div className="grid min-w-0 gap-0 border-t border-[#E5E5E5] xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 px-4 py-3">
            <h3 className="font-mono text-[0.9rem] text-[#111111]">Pseudocode</h3>
            <div className="mt-2 border border-[#E5E5E5] bg-[#FAFAFA] p-1.5 font-mono text-[0.84rem] leading-6">
              {timeline.pseudocodeLines.map((line) => {
                const isCurrent = line.lineNumber === activeLine

                return (
                  <div
                    key={line.lineNumber}
                    className={[
                      'flex gap-3 px-2 py-0.5 transition-colors',
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
              <div className="font-mono text-[0.8rem] tracking-[0.06em] text-[#666666]">Live Counters</div>
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

export { Topic02PartitionSelectionLab }
