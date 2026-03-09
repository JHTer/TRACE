import { useEffect, useMemo, useState, type ReactNode } from 'react'

type Topic01View =
  | 'complexity-analysis'
  | 'correctness-invariants'
  | 'physical-machine-metaphor'

type DiagnosticAlgorithm = 'merge-sort' | 'binary-search' | 'dp-table'

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

type DiagnosticProfile = Readonly<{
  cpuRate: number
  stackPercent: number
  auxiliaryPercent: number
  totalMemoryMb: number
  peakAuxKb: number
  complexity: string
  stackDepth: number
  logs: readonly string[]
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
    summary: 'A binary-search proof sketch rendered as state, transition, and invariant checks.',
  },
  {
    id: 'physical-machine-metaphor',
    label: 'Physical Machine Metaphor',
    summary: 'CPU, stack, and auxiliary-memory diagnostics translated into a machine-like panel.',
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
  { lineNumber: 2, text: 'R <- n              ' },
  { lineNumber: 3, text: 'while L <= R:' },
  { lineNumber: 4, text: '  mid <- L + floor((R - L) / 2)' },
  { lineNumber: 5, text: '  if A[mid] == target:' },
  { lineNumber: 6, text: '    return mid        ' },
  { lineNumber: 7, text: '  if A[mid] < target:' },
  { lineNumber: 8, text: '    L <- mid + 1   ' },
  { lineNumber: 9, text: '  else:' },
  { lineNumber: 10, text: '    R <- mid - 1 ' },
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

const diagnosticAlgorithmLabels: Record<DiagnosticAlgorithm, string> = {
  'merge-sort': 'Merge Sort',
  'binary-search': 'Binary Search',
  'dp-table': 'DP Table Fill',
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

const formatInteger = (value: number) => new Intl.NumberFormat('en-US').format(Math.round(value))

const formatFloat = (value: number, digits = 2) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)

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

const getDiagnosticProfile = (
  algorithm: DiagnosticAlgorithm,
  n: number,
): DiagnosticProfile => {
  if (algorithm === 'binary-search') {
    const depth = Math.max(1, Math.ceil(Math.log2(n)))

    return {
      cpuRate: 4200 + depth * 180,
      stackPercent: clampPercent(depth * 4),
      auxiliaryPercent: 8,
      totalMemoryMb: 0.22 + depth * 0.02,
      peakAuxKb: 24,
      complexity: 'O(log n)',
      stackDepth: depth,
      logs: [
        '[trace] Range narrowed after midpoint comparison.',
        '[trace] No auxiliary buffer allocated.',
        '[trace] Loop invariant preserved for next iteration.',
      ],
    }
  }

  if (algorithm === 'dp-table') {
    const gridSize = Math.max(4, Math.round(Math.sqrt(n)))

    return {
      cpuRate: 16000 + n * 62,
      stackPercent: 14,
      auxiliaryPercent: clampPercent(24 + gridSize * 4),
      totalMemoryMb: 0.9 + n / 180,
      peakAuxKb: 160 + gridSize * 22,
      complexity: 'O(n^2)',
      stackDepth: 2,
      logs: [
        '[trace] Table cell updated from top and left dependencies.',
        '[trace] Iterative fill keeps call-stack pressure low.',
        '[trace] Auxiliary memory grows with the table footprint.',
      ],
    }
  }

  const depth = Math.max(1, Math.ceil(Math.log2(n)))

  return {
    cpuRate: 12000 + n * 38,
    stackPercent: clampPercent(20 + depth * 5),
    auxiliaryPercent: clampPercent(24 + n / 4),
    totalMemoryMb: 0.55 + n / 128,
    peakAuxKb: 180 + n * 3.25,
    complexity: 'O(n log n)',
    stackDepth: depth,
    logs: [
      '[trace] Divide step pushed a new recursive frame.',
      '[trace] Temporary merge buffer allocated for the active subarray.',
      '[trace] CPU work rises during merge comparisons and writes.',
    ],
  }
}

const createRecursionBars = (depth: number) =>
  Array.from({ length: 12 }, (_, index) => {
    const distance = Math.abs(index - Math.min(depth, 11))
    return clampPercent(96 - distance * 11)
  })

function SectionFrame({
  heading,
  children,
}: Readonly<{
  heading: string
  children: ReactNode
}>) {
  return (
    <section className="border border-[#E5E5E5] bg-white">
      <div className="border-b border-[#E5E5E5] px-5 py-3">
        <h3 className="font-mono text-[0.98rem] text-[#111111]">{heading}</h3>
      </div>
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
      <SectionFrame heading="TRACE / Topic 01 / Complexity Analysis">
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

function CorrectnessAndInvariantsView() {
  const lineEvents = useMemo(
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
  const activeEvent = lineEvents[lineEventIndex] ?? lineEvents[0]
  const step = correctnessSteps[activeEvent?.stepIndex ?? 0] ?? correctnessSteps[0]
  const target = binarySearchTarget
  const arrayGridStyle = {
    gridTemplateColumns: `repeat(${binarySearchArray.length}, minmax(0, 1fr))`,
  }
  const isDenseArray = binarySearchArray.length >= 14
  const phaseLabel = `${step.phase[0].toUpperCase()}${step.phase.slice(1)}`
  const activeTraceLine =
    activeEvent?.lineNumber ??
    binarySearchPseudocodeLines[0]?.lineNumber ??
    1
  const lastLineEventIndex = Math.max(0, lineEvents.length - 1)

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

  return (
    <div className="space-y-6">
      <SectionFrame heading="TRACE / Topic 01 / Correctness and Invariants">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-[1.35rem] font-medium tracking-[-0.03em] text-[#111111]">
              Step Execution and Correctness
            </h4>
            <div className="font-mono text-[0.82rem] text-[#666666]">
              Use ← / → keys to step
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="border border-[#E5E5E5] bg-white p-4">
              <div className="font-mono text-[0.92rem] text-[#666666]">Binary Search Pseudocode</div>
              <div className="mt-3 border border-[#E5E5E5] bg-[#FAFAFA] p-2 font-mono text-[0.86rem] leading-6">
                {binarySearchPseudocodeLines.map((line) => {
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
                      <span>{line.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4">
              <div className="font-mono text-[0.92rem] text-[#666666]">
                Proof Checklist
              </div>
              <div className="mt-3 space-y-2 font-mono text-[0.9rem] leading-6 text-[#111111]">
                <div>[1] Initialization: closed interval starts at [1, n] for array length n.</div>
                <div>[2] Maintenance: each jump removes at least one element and keeps target in range.</div>
                <div>[3] Termination: when A[mid] == target, return position; when L &gt; R, return NOT_FOUND.</div>
                <div>
                  Bounds note: for [L, R], use R=n and updates mid+1 / mid-1. For [L, R), use R=n+1
                  and update R=mid instead of mid-1.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 border border-[#E5E5E5] bg-[#FAFAFA] p-4 font-mono text-[0.95rem] text-[#111111]">
              <div>step: {step.stepNumber} / {correctnessSteps.length}</div>
              <div>phase: {phaseLabel}</div>
              <div>target: {target}</div>
              <div>L: {toDisplayIndex(step.left)}</div>
              <div>mid: {toDisplayIndex(step.mid)}</div>
              <div>R: {toDisplayIndex(step.right)}</div>
              <div>
                A[mid]: A[{toDisplayIndex(step.mid)}] = {binarySearchArray[step.mid]}
              </div>
              <div className="pt-1 text-[0.86rem] text-[#666666]">{step.jump}</div>
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
                    isDenseArray ? 'gap-[2px] text-[0.66rem]' : 'gap-2 text-[0.86rem]',
                  ].join(' ')}
                  style={arrayGridStyle}
                >
                  {binarySearchArray.map((value, index) => (
                    <div key={`marker-${value}-${index}`} className="text-center">
                      {[
                        index === step.left ? 'L' : '',
                        index === step.mid ? 'M' : '',
                        index === step.right ? 'R' : '',
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
                    isDenseArray ? 'gap-[2px] text-[0.68rem]' : 'gap-2 text-[0.8rem]',
                  ].join(' ')}
                  style={arrayGridStyle}
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
                <div className={isDenseArray ? 'grid gap-[2px]' : 'grid gap-2'} style={arrayGridStyle}>
                  {binarySearchArray.map((value, index) => {
                    const isOutsideRange = index < step.left || index > step.right
                    const isMid = index === step.mid

                    return (
                      <div
                        key={`${value}-${index}`}
                        className={[
                          'flex items-center justify-center border font-mono transition-colors',
                          isDenseArray ? 'h-10 text-[0.72rem]' : 'h-14 text-[1rem]',
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

        </div>
      </SectionFrame>
    </div>
  )
}

function PhysicalMachineMetaphorView() {
  const [algorithm, setAlgorithm] = useState<DiagnosticAlgorithm>('merge-sort')
  const [inputSize, setInputSize] = useState(128)

  const profile = useMemo(
    () => getDiagnosticProfile(algorithm, inputSize),
    [algorithm, inputSize],
  )

  const recursionBars = useMemo(
    () => createRecursionBars(profile.stackDepth),
    [profile.stackDepth],
  )

  return (
    <div className="space-y-6">
      <SectionFrame heading="TRACE / Topic 01 / Physical Machine Metaphor">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(diagnosticAlgorithmLabels).map(([id, label]) => {
              const isActive = id === algorithm

              return (
                <button
                  key={id}
                  className={[
                    'border px-3 py-1.5 font-mono text-[0.88rem] transition-colors',
                    isActive
                      ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                      : 'border-[#E5E5E5] bg-white text-[#111111]',
                  ].join(' ')}
                  onClick={() => setAlgorithm(id as DiagnosticAlgorithm)}
                  type="button"
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-4">
            <span className="min-w-[6ch] rounded border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 font-mono text-[0.9rem] text-[#111111]">
              n = {inputSize}
            </span>
            <input
              aria-label="Diagnostic input size"
              className="w-full accent-[#111111]"
              max={256}
              min={16}
              onChange={(event) => setInputSize(Number(event.target.value))}
              type="range"
              value={inputSize}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="border border-[#E5E5E5] bg-white p-4">
                <div className="font-mono text-[0.92rem] text-[#666666]">CPU Work Meter</div>
                <div className="mt-3 h-8 overflow-hidden border border-[#111111] bg-[#FAFAFA]">
                  <div
                    className="h-full bg-[#111111]"
                    style={{ width: `${clampPercent(profile.cpuRate / 220)}%` }}
                  />
                </div>
                <div className="mt-3 font-mono text-[1rem] text-[#111111]">
                  CPU Activity: {formatInteger(profile.cpuRate)} ops/sec
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4">
                  <div className="font-mono text-[0.92rem] text-[#666666]">Stack Memory</div>
                  <div className="mt-3 h-8 overflow-hidden border border-[#111111] bg-white">
                    <div
                      className="h-full bg-[#111111]"
                      style={{ width: `${profile.stackPercent}%` }}
                    />
                  </div>
                  <div className="mt-3 font-mono text-[0.95rem] text-[#111111]">
                    Usage: {formatInteger(profile.stackPercent)}%
                  </div>
                </div>

                <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4">
                  <div className="font-mono text-[0.92rem] text-[#666666]">Auxiliary Memory</div>
                  <div className="mt-3 h-8 overflow-hidden border border-[#111111] bg-white">
                    <div
                      className="h-full bg-[#111111]"
                      style={{ width: `${profile.auxiliaryPercent}%` }}
                    />
                  </div>
                  <div className="mt-3 font-mono text-[0.95rem] text-[#111111]">
                    Usage: {formatInteger(profile.auxiliaryPercent)}%
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="border border-[#E5E5E5] bg-white px-3 py-3">
                  <div className="font-mono text-[0.8rem] tracking-[0.08em] text-[#666666]">
                    Total Memory
                  </div>
                  <div className="mt-2 font-mono text-[0.96rem] text-[#111111]">
                    {formatFloat(profile.totalMemoryMb)} MB
                  </div>
                </div>
                <div className="border border-[#E5E5E5] bg-white px-3 py-3">
                  <div className="font-mono text-[0.8rem] tracking-[0.08em] text-[#666666]">
                    Peak Aux
                  </div>
                  <div className="mt-2 font-mono text-[0.96rem] text-[#111111]">
                    {formatInteger(profile.peakAuxKb)} KB
                  </div>
                </div>
                <div className="border border-[#E5E5E5] bg-white px-3 py-3">
                  <div className="font-mono text-[0.8rem] tracking-[0.08em] text-[#666666]">
                    Complexity
                  </div>
                  <div className="mt-2 font-mono text-[0.96rem] text-[#111111]">
                    {profile.complexity}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4">
                <div className="font-mono text-[0.92rem] text-[#666666]">Recursion Monitor</div>
                <div className="mt-4 flex h-32 items-end gap-2 border border-[#E5E5E5] bg-white p-3">
                  {recursionBars.map((height, index) => (
                    <div
                      key={`bar-${index}`}
                      className="flex-1 bg-[#111111]"
                      style={{ height: `${Math.max(12, height)}%`, opacity: index <= profile.stackDepth ? 1 : 0.18 }}
                    />
                  ))}
                </div>
                <div className="mt-3 font-mono text-[0.95rem] text-[#111111]">
                  Call Stack Depth: {profile.stackDepth}
                </div>
              </div>

              <div className="border border-[#E5E5E5] bg-white p-4">
                <div className="font-mono text-[0.92rem] text-[#666666]">System Log</div>
                <div className="mt-3 space-y-2 font-mono text-[0.9rem] text-[#111111]">
                  {profile.logs.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionFrame>
    </div>
  )
}

function Topic01Lab({
  selectedView,
}: Readonly<{
  selectedView: Topic01View
}>) {
  const activeView = selectedView
  const activeSummary =
    topic01Views.find((view) => view.id === activeView)?.summary ??
    topic01Views[0].summary

  return (
    <section className="mt-16">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[0.88rem] tracking-[0.16em] text-[#666666]">
            TOPIC 01
          </div>
          <h2 className="mt-2 text-[clamp(1.8rem,3vw,2.5rem)] font-semibold tracking-[-0.04em] text-[#111111]">
            Complexity and Correctness
          </h2>
          <p className="mt-3 max-w-[760px] text-[1rem] leading-7 text-[#666666]">
            Topic 01 works best as an explanation lab: compare asymptotic growth, inspect invariants
            step by step, and translate abstract complexity into visible CPU, stack, and auxiliary
            memory signals.
          </p>
        </div>
        <div className="font-mono text-[0.84rem] text-[#666666]">
          {activeSummary}
        </div>
      </div>

      {activeView === 'complexity-analysis' ? <ComplexityAnalysisView /> : null}
      {activeView === 'correctness-invariants' ? <CorrectnessAndInvariantsView /> : null}
      {activeView === 'physical-machine-metaphor' ? <PhysicalMachineMetaphorView /> : null}
    </section>
  )
}

export { Topic01Lab }
export type { Topic01View }
