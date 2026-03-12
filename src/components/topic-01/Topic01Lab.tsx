import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createElementarySortTimeline,
  createLineEvents as createElementaryLineEvents,
  elementarySortPresets,
  getFrameByLineEvent,
} from '../../algorithms/array/elementarySortTimeline.ts'
import type {
  ElementarySortAlgorithmId,
  LineEvent,
  SortFrame,
  SortTimeline,
} from '../../domain/algorithms/types.ts'

type Topic01View =
  | 'complexity-analysis'
  | 'correctness-invariants'
type ProofAlgorithm = 'binary-search' | ElementarySortAlgorithmId

type ComplexityCurve = Readonly<{
  id: string
  label: string
  className: string
  stroke: string
  dashPattern?: string
  weight: number
  fn: (n: number) => number
}>

type CorrectnessStep = Readonly<{
  stepNumber: number
  left: number
  right: number
  mid: number
  phase: 'initialization' | 'maintenance' | 'termination'
  jump: string
  executedLines: readonly number[]
  lines: readonly string[]
  invariant: readonly string[]
}>

type PseudocodeLine = Readonly<{
  lineNumber: number
  text: string
}>

const topic01Views: readonly Readonly<{
  id: Topic01View
  label: string
  summary: string
}>[] = [
  {
    id: 'complexity-analysis',
    label: 'Complexity Analysis',
    summary: 'Growth curves, discrete operation counts, and side-by-side asymptotic comparison.',
  },
  {
    id: 'correctness-invariants',
    label: 'Correctness and Invariants',
    summary: 'Binary search plus bubble, selection, and insertion correctness walkthroughs with stepwise invariants.',
  },
] as const

const complexityCurves: readonly ComplexityCurve[] = [
  {
    id: 'constant',
    label: 'O(1)',
    className: 'Constant',
    stroke: '#BFBFBF',
    weight: 180,
    fn: () => 1,
  },
  {
    id: 'logarithmic',
    label: 'O(log n)',
    className: 'Logarithmic',
    stroke: '#6B7280',
    dashPattern: '6 6',
    weight: 48,
    fn: (n) => Math.log2(Math.max(n, 1)),
  },
  {
    id: 'linear',
    label: 'O(n)',
    className: 'Linear',
    stroke: '#111111',
    weight: 6,
    fn: (n) => n,
  },
  {
    id: 'linearithmic',
    label: 'O(n log n)',
    className: 'Linearithmic',
    stroke: '#9CA3AF',
    dashPattern: '3 4',
    weight: 1.2,
    fn: (n) => n * Math.log2(Math.max(n, 1)),
  },
  {
    id: 'quadratic',
    label: 'O(n^2)',
    className: 'Quadratic',
    stroke: '#374151',
    dashPattern: '10 6',
    weight: 0.08,
    fn: (n) => n * n,
  },
] as const

const binarySearchArray = [4, 9, 13, 21, 34, 38, 47, 52, 61, 73, 78, 84, 91, 103, 117, 128] as const
const binarySearchTarget = 128

const binarySearchPseudocodeLines: readonly PseudocodeLine[] = [
  { lineNumber: 1, text: 'L <- 1' },
  { lineNumber: 2, text: 'R <- n' },
  { lineNumber: 3, text: 'while L <= R:' },
  { lineNumber: 4, text: '    mid <- L + floor((R - L) / 2)' },
  { lineNumber: 5, text: '    if A[mid] == target:' },
  { lineNumber: 6, text: '        return mid' },
  { lineNumber: 7, text: '    if A[mid] < target:' },
  { lineNumber: 8, text: '        L <- mid + 1' },
  { lineNumber: 9, text: '    else:' },
  { lineNumber: 10, text: '        R <- mid - 1' },
  { lineNumber: 11, text: 'return NOT_FOUND' },
] as const

const toDisplayIndex = (zeroBasedIndex: number) => zeroBasedIndex + 1
const formatDisplayInterval = (left: number, right: number) =>
  `[${toDisplayIndex(left)}, ${toDisplayIndex(right)}]`

const buildBinarySearchTrace = (
  values: readonly number[],
  target: number,
): readonly CorrectnessStep[] => {
  const steps: CorrectnessStep[] = []
  let left = 0
  let right = values.length - 1
  let stepNumber = 1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    const midValue = values[mid]

    if (midValue === undefined) {
      break
    }

    let nextLeft = left
    let nextRight = right
    let phase: CorrectnessStep['phase'] = stepNumber === 1 ? 'initialization' : 'maintenance'
    let operation = ''
    const displayMid = toDisplayIndex(mid)

    if (midValue === target) {
      phase = stepNumber === 1 ? 'initialization' : 'termination'
      operation = `Target ${target} equals array[mid], so search stops at position ${displayMid}.`
    } else if (midValue < target) {
      nextLeft = mid + 1
      operation = `${midValue} < ${target}, so jump right: L <- mid + 1 = ${toDisplayIndex(nextLeft)}.`
    } else {
      nextRight = mid - 1
      operation = `${midValue} > ${target}, so jump left: R <- mid - 1 = ${toDisplayIndex(nextRight)}.`
    }

    const previousWidth = right - left + 1
    const nextWidth = Math.max(0, nextRight - nextLeft + 1)
    const isInitializationStep = stepNumber === 1
    const executedLines: number[] = [3, 4, 5]
    const jump =
      midValue === target
        ? `Jump ${stepNumber}: ${formatDisplayInterval(left, right)} -> found at position ${displayMid}`
        : `Jump ${stepNumber}: ${formatDisplayInterval(left, right)} -> ${formatDisplayInterval(nextLeft, nextRight)}`

    const invariantLines: string[] = []
    if (isInitializationStep) {
      invariantLines.push(`Initialization: n=${values.length}, so start with [L, R] = [1, n].`)
      invariantLines.push('Invariant starts true: if target exists, it is inside A[L..R].')
    } else if (midValue !== target) {
      invariantLines.push(
        `Maintenance: interval shrinks from ${previousWidth} to ${nextWidth} candidates.`,
      )
      invariantLines.push('Invariant preserved: discarded half cannot contain the target.')
    } else {
      invariantLines.push('Termination: A[mid] = target, so postcondition is satisfied.')
      invariantLines.push('Correct index returned with no unresolved candidates.')
    }

    if (midValue === target) {
      executedLines.push(6)
    } else if (midValue < target) {
      executedLines.push(7, 8)
    } else {
      executedLines.push(7, 9, 10)
    }

    steps.push({
      stepNumber,
      left,
      right,
      mid,
      phase,
      jump,
      executedLines,
      lines: [
        `Compare target ${target} with A[${displayMid}] = ${midValue}.`,
        operation,
      ],
      invariant: invariantLines,
    })

    if (midValue === target) {
      break
    }

    left = nextLeft
    right = nextRight
    stepNumber += 1
  }

  return steps
}

const correctnessSteps = buildBinarySearchTrace(binarySearchArray, binarySearchTarget)

const formatInteger = (value: number) => new Intl.NumberFormat('en-US').format(Math.round(value))

const createSampleSizes = (maxN: number) =>
  Array.from({ length: 24 }, (_, index) => Math.max(1, Math.round(1 + (index / 23) * (maxN - 1))))

const createPolylinePoints = (
  samples: readonly number[],
  height: number,
  width: number,
  maxValue: number,
  fn: (n: number) => number,
) =>
  samples
    .map((n, index) => {
      const x = (index / (samples.length - 1)) * width
      const y = height - (fn(n) / maxValue) * height
      return `${x},${y}`
    })
    .join(' ')

function SectionFrame({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <section className="border border-[#E5E5E5] bg-white">
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

function ComplexityAnalysisView() {
  const [inputSize, setInputSize] = useState(256)

  const width = 520
  const height = 280
  const chartPadding = {
    top: 20,
    right: 16,
    bottom: 44,
    left: 60,
  }

  const samples = useMemo(() => createSampleSizes(inputSize), [inputSize])
  const maxValue = useMemo(
    () =>
      Math.max(
        ...samples.flatMap((sample) =>
          complexityCurves.map((curve) => curve.fn(sample) * curve.weight),
        ),
      ),
    [samples],
  )

  return (
    <div className="space-y-6">
      <SectionFrame>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <div className="overflow-hidden border border-[#E5E5E5] bg-[#FAFAFA] p-4">
              <svg
                aria-label="Complexity growth chart"
                className="h-auto w-full"
                viewBox={`0 0 ${width + chartPadding.left + chartPadding.right} ${
                  height + chartPadding.top + chartPadding.bottom
                }`}
              >
                <g transform={`translate(${chartPadding.left}, ${chartPadding.top})`}>
                  {Array.from({ length: 8 }, (_, row) => (
                    <line
                      key={`row-${row}`}
                      x1="0"
                      x2={width}
                      y1={(row / 7) * height}
                      y2={(row / 7) * height}
                      stroke="#E5E5E5"
                      strokeWidth="1"
                    />
                  ))}
                  {Array.from({ length: 8 }, (_, column) => (
                    <line
                      key={`column-${column}`}
                      x1={(column / 7) * width}
                      x2={(column / 7) * width}
                      y1="0"
                      y2={height}
                      stroke="#E5E5E5"
                      strokeWidth="1"
                    />
                  ))}
                  <line x1="0" x2="0" y1="0" y2={height} stroke="#111111" strokeWidth="1.2" />
                  <line x1="0" x2={width} y1={height} y2={height} stroke="#111111" strokeWidth="1.2" />
                  {complexityCurves.map((curve) => (
                    <polyline
                      key={curve.id}
                      fill="none"
                      points={createPolylinePoints(samples, height, width, maxValue, (n) =>
                        curve.fn(n) * curve.weight,
                      )}
                      stroke={curve.stroke}
                      strokeDasharray={curve.dashPattern}
                      strokeWidth={curve.id === 'linear' ? 2.2 : 1.7}
                    />
                  ))}
                  <text
                    fill="#111111"
                    fontFamily="'SF Mono', 'JetBrains Mono', Menlo, monospace"
                    fontSize="12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(-90, -34, ${height / 2})`}
                    x={-34}
                    y={height / 2}
                  >
                    Operation Count / Relative Cost
                  </text>
                  <text
                    x={width / 2}
                    y={height + 30}
                    fill="#111111"
                    fontFamily="'SF Mono', 'JetBrains Mono', Menlo, monospace"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    Input Size (n)
                  </text>
                </g>
              </svg>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="min-w-[6ch] shrink-0 rounded border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 font-mono text-[0.9rem] text-[#111111]">
                  n = {inputSize}
                </span>
                <input
                  aria-label="Input size"
                  className="ml-1 w-full accent-[#111111]"
                  max={256}
                  min={8}
                  onChange={(event) => setInputSize(Number(event.target.value))}
                  type="range"
                  value={inputSize}
                />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {complexityCurves.map((curve) => (
              <div key={curve.id} className="border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-3">
                <div className="font-mono text-[0.82rem] tracking-[0.08em] text-[#666666]">
                  {curve.className}
                </div>
                <div className="mt-1 font-mono text-[1rem] text-[#111111]">{curve.label}</div>
                <div className="mt-2 font-mono text-[0.88rem] text-[#111111]">
                  n={inputSize}: {formatInteger(curve.fn(inputSize) * curve.weight)} relative ops
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionFrame>
    </div>
  )
}

function CorrectnessAndInvariantsView({
  proofAlgorithm,
}: Readonly<{
  proofAlgorithm: ProofAlgorithm
}>) {
  const binaryLineEvents = useMemo(
    () =>
      correctnessSteps.flatMap((correctnessStep, index) =>
        correctnessStep.executedLines.map((lineNumber) => ({
          stepIndex: index,
          lineNumber,
        })),
      ),
    [],
  )
  const [lineEventIndex, setLineEventIndex] = useState(0)

  const sortDataset = useMemo(
    () => elementarySortPresets.find((preset) => preset.id === 'with-duplicates') ?? elementarySortPresets[0],
    [],
  )

  const sortTimeline = useMemo<SortTimeline | null>(() => {
    if (proofAlgorithm === 'binary-search') {
      return null
    }
    return createElementarySortTimeline(proofAlgorithm, sortDataset.values)
  }, [proofAlgorithm, sortDataset])

  const sortLineEvents = useMemo<readonly LineEvent[]>(() => {
    if (sortTimeline === null) {
      return []
    }
    return createElementaryLineEvents(sortTimeline.frames)
  }, [sortTimeline])

  const isBinary = proofAlgorithm === 'binary-search'
  const lineEvents = isBinary ? binaryLineEvents : sortLineEvents
  const activeEvent = lineEvents[lineEventIndex] ?? lineEvents[0]
  const activeTraceLine =
    activeEvent?.lineNumber ??
    (isBinary
      ? binarySearchPseudocodeLines[0]?.lineNumber
      : sortTimeline?.pseudocodeLines[0]?.lineNumber) ??
    1
  const lastLineEventIndex = Math.max(0, lineEvents.length - 1)

  const activeBinaryStep = isBinary
    ? correctnessSteps[(activeEvent as { stepIndex?: number })?.stepIndex ?? 0] ?? correctnessSteps[0]
    : null

  const activeSortFrame: SortFrame | null =
    !isBinary && sortTimeline !== null
      ? getFrameByLineEvent(sortTimeline, sortLineEvents, lineEventIndex)
      : null

  const pseudocodeLines = isBinary
    ? binarySearchPseudocodeLines
    : sortTimeline?.pseudocodeLines ?? []

  const pointerLabelsByIndex = useMemo(() => {
    if (activeSortFrame === null) {
      return new Map<number, string[]>()
    }
    const labels = new Map<number, string[]>()
    Object.entries(activeSortFrame.pointers).forEach(([label, index]) => {
      if (typeof index !== 'number') {
        return
      }
      const trimmedLabel = label.replace(/Index$/, '')
      const list = labels.get(index) ?? []
      list.push(trimmedLabel)
      labels.set(index, list)
    })
    return labels
  }, [activeSortFrame])

  useEffect(() => {
    setLineEventIndex(0)
  }, [proofAlgorithm])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setLineEventIndex((current) => Math.max(0, current - 1))
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setLineEventIndex((current) => Math.min(lastLineEventIndex, current + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lastLineEventIndex])

  const binaryArrayGridStyle = {
    gridTemplateColumns: `repeat(${binarySearchArray.length}, minmax(0, 1fr))`,
  }
  const isBinaryDense = binarySearchArray.length >= 14

  const sortArrayGridStyle =
    activeSortFrame !== null
      ? { gridTemplateColumns: `repeat(${activeSortFrame.items.length}, minmax(0, 1fr))` }
      : {}

  const checklistItems: readonly string[] = useMemo(() => {
    if (proofAlgorithm === 'bubble-sort') {
      return [
        'Initialization: unsorted array; sorted suffix is empty.',
        'Maintenance: each inner pass bubbles the max to the end, growing the sorted suffix.',
        'Termination: no swap in a pass ⇒ array already sorted; otherwise after n-1 passes suffix covers all.',
      ]
    }
    if (proofAlgorithm === 'selection-sort') {
      return [
        'Initialization: sorted prefix is empty.',
        'Maintenance: select smallest in the remaining unsorted region, swap into position i.',
        'Termination: after n-1 selections the entire array is sorted; prefix spans all indices.',
      ]
    }
    if (proofAlgorithm === 'insertion-sort') {
      return [
        'Initialization: prefix of length 1 is trivially sorted.',
        'Maintenance: shift larger elements right until the key fits; sorted prefix length increases by 1.',
        'Termination: after inserting last key, full array is sorted and stability preserved.',
      ]
    }
    return [
      'Initialization: closed interval starts at [1, n] for array length n.',
      'Maintenance: each jump removes at least one element and keeps target in range.',
      'Termination: when A[mid] == target, return position; when L > R, return NOT_FOUND.',
    ]
  }, [proofAlgorithm])

  return (
    <div className="space-y-6">
      <SectionFrame>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="text-[1.35rem] font-medium tracking-[-0.03em] text-[#111111]">
              Step Execution and Correctness
            </h4>
            <div className="font-mono text-[0.82rem] text-[#666666]">
              Use ← / → keys to step
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="flex h-full flex-col">
              <div className="font-mono text-[0.92rem] text-[#666666]">
                {proofAlgorithm === 'binary-search'
                  ? 'Binary Search Pseudocode'
                  : `${(sortTimeline?.title ?? '').toUpperCase()} Pseudocode`}
              </div>
              <div className="mt-3 flex-1 border border-[#E5E5E5] bg-[#FAFAFA] p-2 font-mono text-[0.86rem] leading-6">
                {pseudocodeLines.map((line) => {
                  const isCurrent = line.lineNumber === activeTraceLine

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
            </div>
            <div className="flex h-full flex-col">
              <div className="font-mono text-[0.92rem] text-[#666666]">
                Proof Checklist
              </div>
              <div className="mt-3 flex-1 border border-[#E5E5E5] bg-[#FAFAFA] p-4 font-mono text-[0.9rem] leading-6 text-[#111111] space-y-2">
                {checklistItems.map((item, index) => (
                  <div key={item}>[{index + 1}] {item}</div>
                ))}
              </div>
            </div>
          </div>

          {isBinary && activeBinaryStep !== null ? (
            <div className="space-y-4">
              <div className="space-y-2 border border-[#E5E5E5] bg-[#FAFAFA] p-4 font-mono text-[0.95rem] text-[#111111]">
                <div>step: {activeBinaryStep.stepNumber} / {correctnessSteps.length}</div>
                <div>phase: {`${activeBinaryStep.phase[0].toUpperCase()}${activeBinaryStep.phase.slice(1)}`}</div>
                <div>target: {binarySearchTarget}</div>
                <div>L: {toDisplayIndex(activeBinaryStep.left)}</div>
                <div>mid: {toDisplayIndex(activeBinaryStep.mid)}</div>
                <div>R: {toDisplayIndex(activeBinaryStep.right)}</div>
                <div>
                  A[mid]: A[{toDisplayIndex(activeBinaryStep.mid)}] = {binarySearchArray[activeBinaryStep.mid]}
                </div>
                <div className="pt-1 text-[0.86rem] text-[#666666]">{activeBinaryStep.jump}</div>
              </div>

              <div className="overflow-hidden border border-[#E5E5E5] bg-white p-3 sm:p-4">
                <div className="mb-2 font-mono text-[0.85rem] text-[#666666]">
                  Sorted List
                </div>
                <div className="relative">
                  <div className="mb-1 font-mono text-[0.78rem] tracking-[0.04em] text-[#666666]">
                    Pointer (L / mid / R)
                  </div>
                  <div
                    className={[
                      'mb-3 grid font-mono text-[#111111]',
                      isBinaryDense ? 'gap-[2px] text-[0.66rem]' : 'gap-2 text-[0.86rem]',
                    ].join(' ')}
                    style={binaryArrayGridStyle}
                  >
                    {binarySearchArray.map((value, index) => (
                      <div key={`marker-${value}-${index}`} className="text-center">
                        {[
                          index === activeBinaryStep.left ? 'L' : '',
                          index === activeBinaryStep.mid ? 'M' : '',
                          index === activeBinaryStep.right ? 'R' : '',
                        ]
                          .filter((label) => label.length > 0)
                          .join('/')}
                      </div>
                    ))}
                  </div>
                  <div className="mb-1 font-mono text-[0.78rem] tracking-[0.04em] text-[#666666]">
                    Index
                  </div>
                  <div
                    className={[
                      'mb-3 grid font-mono text-[#666666]',
                      isBinaryDense ? 'gap-[2px] text-[0.68rem]' : 'gap-2 text-[0.8rem]',
                    ].join(' ')}
                    style={binaryArrayGridStyle}
                  >
                    {binarySearchArray.map((_, index) => (
                      <div key={`index-${index}`} className="text-center">
                        {toDisplayIndex(index)}
                      </div>
                    ))}
                  </div>
                  <div className="mb-1 font-mono text-[0.78rem] tracking-[0.04em] text-[#666666]">
                    Value
                  </div>
                  <div className={isBinaryDense ? 'grid gap-[2px]' : 'grid gap-2'} style={binaryArrayGridStyle}>
                    {binarySearchArray.map((value, index) => {
                      const isOutsideRange = index < activeBinaryStep.left || index > activeBinaryStep.right
                      const isMid = index === activeBinaryStep.mid

                      return (
                        <div
                          key={`${value}-${index}`}
                          className={[
                            'flex items-center justify-center border font-mono transition-colors',
                            isBinaryDense ? 'h-10 text-[0.72rem]' : 'h-14 text-[1rem]',
                            isMid
                              ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                              : isOutsideRange
                                ? 'border-[#E5E5E5] bg-[#F4F4F4] text-[#999999]'
                                : 'border-[#111111] bg-white text-[#111111]',
                          ].join(' ')}
                        >
                          {value}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!isBinary && activeSortFrame !== null ? (
            <div className="space-y-4">
              <div className="space-y-2 border border-[#E5E5E5] bg-[#FAFAFA] p-4 font-mono text-[0.95rem] text-[#111111]">
                <div>frame: {lineEventIndex + 1} / {lineEvents.length}</div>
                <div>operation: {activeSortFrame.operationText}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>comparisons: {activeSortFrame.counters.comparisons}</div>
                  <div>writes: {activeSortFrame.counters.writes}</div>
                  <div>swaps: {activeSortFrame.counters.swaps}</div>
                  <div>passes: {activeSortFrame.counters.passes}</div>
                </div>
              </div>

              <div className="overflow-hidden border border-[#E5E5E5] bg-white p-3 sm:p-4">
                <div className="mb-2 font-mono text-[0.85rem] text-[#666666]">
                  Array View
                </div>
                <div className="relative">
                  <div className="mb-1 font-mono text-[0.78rem] tracking-[0.04em] text-[#666666]">
                    Pointer(s)
                  </div>
                  <div
                    className="mb-3 grid font-mono text-[#111111] gap-[2px] text-[0.7rem]"
                    style={sortArrayGridStyle}
                  >
                    {activeSortFrame.items.map((item, index) => (
                      <div key={`ptr-${item.id}`} className="text-center">
                        {(pointerLabelsByIndex.get(index) ?? []).join('/')}
                      </div>
                    ))}
                  </div>
                  <div className="mb-1 font-mono text-[0.78rem] tracking-[0.04em] text-[#666666]">
                    Index
                  </div>
                  <div
                    className="mb-3 grid font-mono text-[#666666] gap-[2px] text-[0.78rem]"
                    style={sortArrayGridStyle}
                  >
                    {activeSortFrame.items.map((_, index) => (
                      <div key={`s-index-${index}`} className="text-center">
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  <div className="mb-1 font-mono text-[0.78rem] tracking-[0.04em] text-[#666666]">
                    Value
                  </div>
                  <div
                    className="grid gap-[2px]"
                    style={sortArrayGridStyle}
                  >
                    {activeSortFrame.items.map((item, index) => {
                      const isActive = activeSortFrame.activeIndices.includes(index)
                      const sortedRegion = activeSortFrame.sortedRegion
                      const isSorted =
                        sortedRegion !== null &&
                        index >= sortedRegion.start &&
                        index <= sortedRegion.end

                      return (
                        <div
                          key={item.id}
                          className={[
                            'flex h-12 items-center justify-center border font-mono transition-colors text-[0.92rem]',
                            isActive
                              ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                              : isSorted
                                ? 'border-[#E5E5E5] bg-[#F4F4F4] text-[#666666]'
                                : 'border-[#111111] bg-white text-[#111111]',
                          ].join(' ')}
                        >
                          {item.value}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </SectionFrame>
    </div>
  )
}

function Topic01Lab({
  selectedView,
  proofAlgorithm,
}: Readonly<{
  selectedView: Topic01View
  proofAlgorithm: ProofAlgorithm
}>) {
  const activeView = selectedView
  const activeSummary =
    topic01Views.find((view) => view.id === activeView)?.summary ??
    topic01Views[0].summary

  return (
    <section className="mt-4">
      <div className="mb-4 space-y-1">
        <div className="font-mono text-[0.88rem] tracking-[0.16em] text-[#666666]">
          TOPIC 01
        </div>
        <div className="font-mono text-[0.84rem] text-[#666666]">{activeSummary}</div>
      </div>

      {activeView === 'complexity-analysis' ? <ComplexityAnalysisView /> : null}
      {activeView === 'correctness-invariants' ? (
        <CorrectnessAndInvariantsView
          proofAlgorithm={proofAlgorithm}
        />
      ) : null}
    </section>
  )
}

export { Topic01Lab }
export type { ProofAlgorithm, Topic01View }
