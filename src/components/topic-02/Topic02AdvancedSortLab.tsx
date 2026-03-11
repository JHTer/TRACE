import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  advancedSortPresetsByAlgorithm,
  createAdvancedLineEvents,
  createAdvancedSortTimeline,
  getAdvancedFrameByLineEvent,
  heapModeLabel,
  heapModeOptions,
  radixBaseOptions,
} from '../../algorithms/array/advancedSortTimeline.ts'
import type {
  AdvancedSortCounters,
  AdvancedSortFrame,
  HeapInstructionModeId,
  RadixBase,
  SortPresetId,
  Topic02AdvancedSortAlgorithmId,
} from '../../domain/algorithms/types.ts'

const defaultPresetId: SortPresetId = 'with-duplicates'
const defaultHeapMode: HeapInstructionModeId = 'sort-trace'
const defaultRadixBase: RadixBase = 10
const animationMs = 280

const algorithmDirectoryLabel: Record<Topic02AdvancedSortAlgorithmId, string> = {
  heapsort: 'HEAPSORT',
  'counting-sort': 'COUNTING SORT',
  'radix-sort': 'RADIX SORT',
}

const algorithmSubtitle: Record<Topic02AdvancedSortAlgorithmId, string> = {
  heapsort:
    'Max-heap construction and extraction with synchronized array and tree state.',
  'counting-sort':
    'Frequency accumulation, prefix positions, and stable right-to-left output placement.',
  'radix-sort':
    'LSD digit passes on 3-digit values with stable counting placement and pass-by-pass copy back.',
}

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLElement && target.isContentEditable)

const formatCounters = (counters: AdvancedSortCounters) => [
  { label: 'Comparisons', value: counters.comparisons },
  { label: 'Writes', value: counters.writes },
  { label: 'Swaps', value: counters.swaps },
  { label: 'Passes', value: counters.passes },
  { label: 'Bucket Writes', value: counters.bucketWrites },
]

function HeapArrayStrip({ frame }: Readonly<{ frame: AdvancedSortFrame }>) {
  const heapState = frame.heapState
  if (heapState === null) {
    return null
  }

  const compareSet = new Set(heapState.comparePair)
  const swapSet = new Set(heapState.swapPair)
  const activeSet = new Set(frame.activeIndices)
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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {frame.items.map((item, index) => {
          const inHeap = index < heapState.heapSize
          const isActive = activeSet.has(index)
          const isCompare = compareSet.has(index)
          const isSwap = swapSet.has(index)

          const valueClass = isActive
            ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
            : isSwap
              ? 'border-[#111111] border-2 bg-[#F4F4F4] text-[#111111]'
              : isCompare
                ? 'border-[#111111] border-dashed bg-[#FAFAFA] text-[#111111]'
                : inHeap
                  ? 'border-[#111111] bg-white text-[#111111]'
                  : 'border-[#E5E5E5] bg-white text-[#999999]'

          return (
            <div
              key={item.id}
              ref={(node) => {
                nodeByIdRef.current[item.id] = node
              }}
              className="w-[56px] space-y-1"
            >
              <div
                className={[
                  'flex h-12 items-center justify-center border font-mono text-[0.92rem] transition-colors',
                  valueClass,
                ].join(' ')}
              >
                {item.value}
              </div>
              <div className="text-center font-mono text-[0.62rem] text-[#666666]">[{index}]</div>
            </div>
          )
        })}
      </div>
      <div className="font-mono text-[0.72rem] text-[#666666]">
        heap boundary: [0..{Math.max(0, heapState.heapSize - 1)}]
      </div>
    </div>
  )
}

function HeapTreeView({ frame }: Readonly<{ frame: AdvancedSortFrame }>) {
  const heapState = frame.heapState
  if (heapState === null || heapState.heapSize === 0) {
    return (
      <div className="border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 font-mono text-[0.76rem] text-[#666666]">
        heap is empty
      </div>
    )
  }

  const compareSet = new Set(heapState.comparePair)
  const swapSet = new Set(heapState.swapPair)
  const activeSet = new Set(frame.activeIndices)
  const nodeByIdRef = useRef<Record<string, HTMLDivElement | null>>({})
  const previousRectByIdRef = useRef<Record<string, DOMRect>>({})

  useLayoutEffect(() => {
    const nextRectById: Record<string, DOMRect> = {}
    const visibleItems = frame.items.slice(0, heapState.heapSize)

    visibleItems.forEach((item) => {
      const node = nodeByIdRef.current[item.id]
      if (node !== null && node !== undefined) {
        nextRectById[item.id] = node.getBoundingClientRect()
      }
    })

    visibleItems.forEach((item) => {
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
      visibleItems.forEach((item) => {
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
  }, [frame.items, heapState.heapSize])

  const rows: number[][] = []
  let start = 0
  let depth = 0

  while (start < heapState.heapSize) {
    const width = 2 ** depth
    const end = Math.min(heapState.heapSize, start + width)
    rows.push(Array.from({ length: end - start }, (_, offset) => start + offset))
    start = end
    depth += 1
  }

  const linkMapEntries = Array.from({ length: heapState.heapSize }, (_, parentIndex) => {
    const leftChildIndex = parentIndex * 2 + 1
    const rightChildIndex = leftChildIndex + 1
    const children = [leftChildIndex, rightChildIndex].filter(
      (childIndex) => childIndex < heapState.heapSize,
    )

    return {
      parentIndex,
      children,
    }
  }).filter((entry) => entry.children.length > 0)

  const isPairLinked = (pair: readonly number[], parentIndex: number, childIndex: number) =>
    pair.length === 2 &&
    ((pair[0] === parentIndex && pair[1] === childIndex) ||
      (pair[0] === childIndex && pair[1] === parentIndex))

  return (
    <div className="space-y-2">
      <div className="font-mono text-[0.74rem] tracking-[0.06em] text-[#666666]">HEAP TREE</div>
      <div className="overflow-x-auto border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-3">
        <div className="min-w-max space-y-2">
          {rows.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex items-center justify-center gap-2">
              {row.map((index) => {
                const item = frame.items[index]
                if (item === undefined) {
                  return null
                }

                const isActive = activeSet.has(index)
                const isCompare = compareSet.has(index)
                const isSwap = swapSet.has(index)
                const nodeClass = isActive
                  ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                  : isSwap
                    ? 'border-[#111111] border-2 bg-[#F4F4F4] text-[#111111]'
                    : isCompare
                      ? 'border-[#111111] border-dashed bg-[#FAFAFA] text-[#111111]'
                      : 'border-[#111111] bg-white text-[#111111]'

                return (
                  <div
                    key={item.id}
                    ref={(node) => {
                      nodeByIdRef.current[item.id] = node
                    }}
                    className="space-y-1"
                  >
                    <div
                      className={[
                        'flex h-10 w-10 items-center justify-center rounded-full border font-mono text-[0.76rem]',
                        nodeClass,
                      ].join(' ')}
                    >
                      {item.value}
                    </div>
                    <div className="text-center font-mono text-[0.6rem] text-[#666666]">{index}</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-1.5 border border-[#E5E5E5] bg-white px-3 py-2">
        <div className="font-mono text-[0.72rem] tracking-[0.06em] text-[#666666]">HEAP LINKS</div>
        <div className="flex flex-wrap gap-1.5">
          {linkMapEntries.map((entry) => {
            const childrenText = entry.children.join(', ')
            const hasComparedLink = entry.children.some((childIndex) =>
              isPairLinked(heapState.comparePair, entry.parentIndex, childIndex),
            )
            const hasSwappedLink = entry.children.some((childIndex) =>
              isPairLinked(heapState.swapPair, entry.parentIndex, childIndex),
            )

            const chipClass = hasSwappedLink
              ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
              : hasComparedLink
                ? 'border-[#111111] border-dashed bg-[#FAFAFA] text-[#111111]'
                : 'border-[#E5E5E5] bg-white text-[#666666]'

            return (
              <div
                key={`link-${entry.parentIndex}`}
                className={[
                  'border px-2 py-0.5 font-mono text-[0.68rem] transition-colors',
                  chipClass,
                ].join(' ')}
              >
                {entry.parentIndex} {'->'} {childrenText}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ValueRow({
  label,
  values,
  activeIndex,
  tone = 'default',
}: Readonly<{
  label: string
  values: readonly (number | null)[]
  activeIndex: number | null
  tone?: 'default' | 'accent'
}>) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-[0.72rem] tracking-[0.06em] text-[#666666]">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value, index) => {
          const isActive = activeIndex === index
          const className = isActive
            ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
            : tone === 'accent'
              ? 'border-[#111111] bg-[#F4F4F4] text-[#111111]'
              : 'border-[#E5E5E5] bg-white text-[#111111]'

          return (
            <div
              key={`${label}-${index}`}
              className={[
                'flex min-h-[34px] min-w-[42px] items-center justify-center border px-1 font-mono text-[0.76rem]',
                className,
              ].join(' ')}
            >
              {value === null ? '-' : value}
            </div>
          )
        })}
      </div>
    </div>
  )
}

type AnimatedValueItem = Readonly<{
  id: string
  value: number
}>

function AnimatedValueRow({
  label,
  items,
  activeIndex,
}: Readonly<{
  label: string
  items: readonly AnimatedValueItem[]
  activeIndex: number | null
}>) {
  const nodeByIdRef = useRef<Record<string, HTMLDivElement | null>>({})
  const previousRectByIdRef = useRef<Record<string, DOMRect>>({})

  useLayoutEffect(() => {
    const nextRectById: Record<string, DOMRect> = {}

    items.forEach((item) => {
      const node = nodeByIdRef.current[item.id]
      if (node !== null && node !== undefined) {
        nextRectById[item.id] = node.getBoundingClientRect()
      }
    })

    items.forEach((item) => {
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
      items.forEach((item) => {
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
  }, [items])

  return (
    <div className="space-y-1">
      <div className="font-mono text-[0.72rem] tracking-[0.06em] text-[#666666]">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => {
          const isActive = activeIndex === index

          return (
            <div
              key={item.id}
              ref={(node) => {
                nodeByIdRef.current[item.id] = node
              }}
              className={[
                'flex min-h-[34px] min-w-[42px] items-center justify-center border px-1 font-mono text-[0.76rem] transition-colors',
                isActive
                  ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                  : 'border-[#111111] bg-[#F4F4F4] text-[#111111]',
              ].join(' ')}
            >
              {item.value}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CountingStatePanel({ frame }: Readonly<{ frame: AdvancedSortFrame }>) {
  const state = frame.countingState
  if (state === null) {
    return null
  }

  const inputValues = frame.items.map((item) => item.value)
  const outputValues = state.output.map((item) => (item === null ? null : item.value))

  return (
    <div className="space-y-3">
      <ValueRow
        activeIndex={state.scanningIndex}
        label="INPUT"
        values={inputValues}
      />
      <ValueRow
        activeIndex={state.countIndex}
        label="COUNT"
        tone="accent"
        values={state.counts}
      />
      <ValueRow
        activeIndex={state.countIndex}
        label="PREFIX"
        values={state.prefix}
      />
      <ValueRow
        activeIndex={state.placementIndex}
        label="OUTPUT"
        tone="accent"
        values={outputValues}
      />
      <div className="font-mono text-[0.72rem] text-[#666666]">
        max value k: {state.maxValue}
      </div>
    </div>
  )
}

function RadixStatePanel({ frame }: Readonly<{ frame: AdvancedSortFrame }>) {
  const state = frame.radixState
  if (state === null) {
    return null
  }

  const inputValues = frame.items.map((item) => item.value)
  const outputValues = state.output.map((item) => (item === null ? null : item.value))
  const outputIndexByItemId = new Map(
    state.output.flatMap((item, outputIndex) => (item === null ? [] : [[item.id, outputIndex]])),
  )
  const placedItemIdSet = new Set(
    state.output.flatMap((item) => (item === null ? [] : [item.id])),
  )
  const remainingItems = frame.items.filter((item) => !placedItemIdSet.has(item.id))
  let remainingIndex = 0
  const livePassItems: AnimatedValueItem[] = state.output.map((placedItem, slotIndex) => {
    if (placedItem !== null) {
      return { id: placedItem.id, value: placedItem.value }
    }

    const fallbackItem = remainingItems[remainingIndex] ?? frame.items[slotIndex]
    remainingIndex += 1

    if (fallbackItem !== undefined) {
      return { id: fallbackItem.id, value: fallbackItem.value }
    }

    return { id: `radix-live-fallback-${slotIndex}`, value: 0 }
  })

  return (
    <div className="space-y-3">
      <div className="font-mono text-[0.74rem] text-[#666666]">
        pass: {state.passNumber} | base: {state.base} | exponent: {state.exponent}
      </div>
      <ValueRow
        activeIndex={state.scanningIndex}
        label="ARRAY"
        values={inputValues}
      />

      <section className="space-y-1.5">
        <div className="font-mono text-[0.72rem] tracking-[0.06em] text-[#666666]">
          RADIX COUNT MATRIX
        </div>
        <div className="overflow-x-auto border border-[#E5E5E5] bg-[#FAFAFA]">
          <table className="w-full border-collapse font-mono text-[0.72rem]">
            <thead>
              <tr>
                <th className="border border-[#E5E5E5] bg-white px-2 py-1 text-left text-[#666666]">
                  bucket
                </th>
                {state.counts.map((_, digit) => (
                  <th
                    key={`bucket-${digit}`}
                    className="border border-[#E5E5E5] bg-white px-2 py-1 text-center text-[#666666]"
                  >
                    {digit}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#E5E5E5] bg-white px-2 py-1 text-[#666666]">
                  count
                </td>
                {state.counts.map((count, digit) => {
                  const isActive = state.countIndex === digit
                  return (
                    <td
                      key={`count-${digit}`}
                      className={[
                        'border border-[#E5E5E5] px-2 py-1 text-center',
                        isActive ? 'bg-[#111111] text-[#FAFAFA]' : 'bg-white text-[#111111]',
                      ].join(' ')}
                    >
                      {count}
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td className="border border-[#E5E5E5] bg-white px-2 py-1 text-[#666666]">
                  prefix
                </td>
                {state.prefix.map((value, digit) => {
                  const isActive = state.countIndex === digit
                  return (
                    <td
                      key={`prefix-${digit}`}
                      className={[
                        'border border-[#E5E5E5] px-2 py-1 text-center',
                        isActive ? 'bg-[#F4F4F4] text-[#111111]' : 'bg-white text-[#111111]',
                      ].join(' ')}
                    >
                      {value}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-1.5">
        <div className="font-mono text-[0.72rem] tracking-[0.06em] text-[#666666]">
          PLACEMENT MATRIX
        </div>
        <div className="overflow-x-auto border border-[#E5E5E5] bg-white">
          <table className="w-full border-collapse font-mono text-[0.72rem]">
            <thead>
              <tr>
                <th className="border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 text-left text-[#666666]">
                  idx
                </th>
                <th className="border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 text-left text-[#666666]">
                  value
                </th>
                <th className="border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 text-left text-[#666666]">
                  digit
                </th>
                <th className="border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 text-left text-[#666666]">
                  output slot
                </th>
              </tr>
            </thead>
            <tbody>
              {frame.items.map((item, index) => {
                const outputSlot = outputIndexByItemId.get(item.id)
                const isScanning = state.scanningIndex === index

                return (
                  <tr key={`placement-${item.id}`}>
                    <td
                      className={[
                        'border border-[#E5E5E5] px-2 py-1',
                        isScanning ? 'bg-[#111111] text-[#FAFAFA]' : 'bg-white text-[#666666]',
                      ].join(' ')}
                    >
                      {index}
                    </td>
                    <td
                      className={[
                        'border border-[#E5E5E5] px-2 py-1',
                        isScanning ? 'bg-[#111111] text-[#FAFAFA]' : 'bg-white text-[#111111]',
                      ].join(' ')}
                    >
                      {item.value}
                    </td>
                    <td
                      className={[
                        'border border-[#E5E5E5] px-2 py-1',
                        isScanning ? 'bg-[#111111] text-[#FAFAFA]' : 'bg-white text-[#111111]',
                      ].join(' ')}
                    >
                      {state.digitByIndex[index] ?? '-'}
                    </td>
                    <td
                      className={[
                        'border border-[#E5E5E5] px-2 py-1',
                        outputSlot !== undefined ? 'bg-[#F4F4F4] text-[#111111]' : 'bg-white text-[#666666]',
                      ].join(' ')}
                    >
                      {outputSlot ?? '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <AnimatedValueRow
        activeIndex={state.placementIndex}
        label="LIVE PASS LIST"
        items={livePassItems}
      />
      <ValueRow
        activeIndex={state.placementIndex}
        label="OUTPUT BUFFER"
        values={outputValues}
      />
    </div>
  )
}

function Topic02AdvancedSortLab({
  algorithmId,
}: Readonly<{
  algorithmId: Topic02AdvancedSortAlgorithmId
}>) {
  const [presetId, setPresetId] = useState<SortPresetId>(defaultPresetId)
  const [heapMode, setHeapMode] = useState<HeapInstructionModeId>(defaultHeapMode)
  const [radixBase, setRadixBase] = useState<RadixBase>(defaultRadixBase)
  const [lineEventIndex, setLineEventIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const presetsForAlgorithm = advancedSortPresetsByAlgorithm[algorithmId]
  const selectedPreset =
    presetsForAlgorithm.find((preset) => preset.id === presetId) ??
    presetsForAlgorithm[0]

  const timeline = useMemo(
    () =>
      createAdvancedSortTimeline({
        algorithmId,
        values: selectedPreset.values,
        heapMode,
        radixBase,
      }),
    [algorithmId, heapMode, radixBase, selectedPreset.values],
  )

  const lineEvents = useMemo(
    () => createAdvancedLineEvents(timeline.frames),
    [timeline.frames],
  )

  const hasLineEvents = lineEvents.length > 0
  const lastLineEventIndex = Math.max(0, lineEvents.length - 1)
  const boundedLineEventIndex = Math.max(0, Math.min(lineEventIndex, lastLineEventIndex))
  const activeEvent = lineEvents[boundedLineEventIndex]
  const activeFrame = getAdvancedFrameByLineEvent(
    timeline,
    lineEvents,
    boundedLineEventIndex,
  )
  const activeLine = activeEvent?.lineNumber ?? timeline.pseudocodeLines[0]?.lineNumber ?? 1
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
    if (!hasLineEvents || timeline.validationError !== null) {
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
  }, [algorithmId, heapMode, presetId, radixBase])

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    if (!hasLineEvents || timeline.validationError !== null) {
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
  }, [hasLineEvents, isPlaying, lastLineEventIndex, lineEventIndex, timeline.validationError])

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
  }, [hasLineEvents, lineEventIndex, lastLineEventIndex, timeline.validationError])

  return (
    <section className="mt-4 space-y-4">
      <div className="space-y-3">
        <p className="max-w-[820px] text-[1rem] leading-7 text-[#666666]">
          {algorithmSubtitle[algorithmId]}
          {algorithmId === 'heapsort' ? ` Active mode: ${heapModeLabel[heapMode]}.` : ''}
          {algorithmId === 'radix-sort' ? ` Active base: ${radixBase}.` : ''}
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
            {presetsForAlgorithm.map((preset) => {
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

        {algorithmId === 'heapsort' ? (
          <div className="border-t border-[#E5E5E5] px-4 py-3">
            <div className="font-mono text-[0.8rem] tracking-[0.06em] text-[#666666]">HEAP MODE</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {heapModeOptions.map((option) => {
                const isActive = option.id === heapMode

                return (
                  <button
                    key={option.id}
                    className={[
                      'border px-2.5 py-1 font-mono text-[0.78rem] transition-colors',
                      isActive
                        ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                        : 'border-[#E5E5E5] bg-white text-[#111111]',
                    ].join(' ')}
                    onClick={() => setHeapMode(option.id)}
                    type="button"
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {algorithmId === 'radix-sort' ? (
          <div className="border-t border-[#E5E5E5] px-4 py-3">
            <div className="font-mono text-[0.8rem] tracking-[0.06em] text-[#666666]">RADIX BASE</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {radixBaseOptions.map((option) => {
                const isActive = option.id === radixBase

                return (
                  <button
                    key={option.id}
                    className={[
                      'border px-2.5 py-1 font-mono text-[0.78rem] transition-colors',
                      isActive
                        ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                        : 'border-[#E5E5E5] bg-white text-[#111111]',
                    ].join(' ')}
                    onClick={() => setRadixBase(option.id)}
                    type="button"
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="border-t border-[#E5E5E5] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-mono text-[0.9rem] text-[#111111]">State</h3>
            <div className="font-mono text-[0.76rem] text-[#666666]">
              frame: {frameProgress} / {totalFrames}
            </div>
          </div>
          <div className="mt-2 border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1.5 font-mono text-[0.8rem] text-[#111111]">
            op: {activeFrame.operationText}
          </div>

          {timeline.validationError !== null ? (
            <div className="mt-2 border border-[#B42318] bg-white px-3 py-2 font-mono text-[0.78rem] text-[#B42318]">
              input validation: {timeline.validationError}
            </div>
          ) : null}

          <div className="mt-3 space-y-3">
            {algorithmId === 'heapsort' ? (
              <>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.74rem] text-[#666666]">
                  <div>heap size: {activeFrame.heapState?.heapSize ?? 0}</div>
                  <div>
                    compare pair:{' '}
                    {activeFrame.heapState?.comparePair.length
                      ? activeFrame.heapState.comparePair.join(', ')
                      : '-'}
                  </div>
                  <div>
                    swap pair:{' '}
                    {activeFrame.heapState?.swapPair.length
                      ? activeFrame.heapState.swapPair.join(', ')
                      : '-'}
                  </div>
                </div>
                <HeapArrayStrip frame={activeFrame} />
                <HeapTreeView frame={activeFrame} />
              </>
            ) : algorithmId === 'counting-sort' ? (
              <CountingStatePanel frame={activeFrame} />
            ) : (
              <RadixStatePanel frame={activeFrame} />
            )}
          </div>
        </div>

        <div className="grid min-w-0 gap-0 border-t border-[#E5E5E5] xl:grid-cols-[minmax(0,1fr)_300px]">
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

export { Topic02AdvancedSortLab }
