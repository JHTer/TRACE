import { useMemo, useState, type ReactNode } from 'react'

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
  fn: (n: number) => number
}>

type CorrectnessStep = Readonly<{
  left: number
  right: number
  mid: number
  lines: readonly string[]
  invariant: readonly string[]
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
    fn: () => 1,
  },
  {
    id: 'logarithmic',
    label: 'O(log n)',
    className: 'Logarithmic',
    stroke: '#6B7280',
    dashPattern: '6 6',
    fn: (n) => Math.log2(Math.max(n, 1)),
  },
  {
    id: 'linear',
    label: 'O(n)',
    className: 'Linear',
    stroke: '#111111',
    fn: (n) => n,
  },
  {
    id: 'linearithmic',
    label: 'O(n log n)',
    className: 'Linearithmic',
    stroke: '#9CA3AF',
    dashPattern: '3 4',
    fn: (n) => n * Math.log2(Math.max(n, 1)),
  },
  {
    id: 'quadratic',
    label: 'O(n^2)',
    className: 'Quadratic',
    stroke: '#374151',
    dashPattern: '10 6',
    fn: (n) => n * n,
  },
] as const

const comparisonAlgorithms: readonly Readonly<{
  label: string
  complexity: string
}>[] = [
  { label: 'Algorithm A (Insertion Sort)', complexity: 'O(n^2)' },
  { label: 'Algorithm B (Merge Sort)', complexity: 'O(n log n)' },
  { label: 'Algorithm C (Binary Search)', complexity: 'O(log n)' },
] as const

const binarySearchArray = [10, 20, 30, 40, 48, 95, 101, 120, 125] as const

const correctnessSteps: readonly CorrectnessStep[] = [
  {
    left: 0,
    right: 8,
    mid: 4,
    lines: [
      'Comparing target 101 with array[mid] 48.',
      '101 is greater than 48, so the next search range moves right.',
      'Discard the left half because it can no longer contain the target.',
    ],
    invariant: [
      'If the target exists, it is still inside array[L..R].',
      'All values left of L are strictly too small for the target.',
    ],
  },
  {
    left: 5,
    right: 8,
    mid: 6,
    lines: [
      'Comparing target 101 with array[mid] 101.',
      'The target matches the midpoint value.',
      'Binary search can terminate because the postcondition is satisfied.',
    ],
    invariant: [
      'The active range still contains every candidate position.',
      'The search terminates because the goal state has been reached.',
    ],
  },
] as const

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

  const samples = useMemo(() => createSampleSizes(inputSize), [inputSize])
  const maxValue = useMemo(
    () => Math.max(...samples.map((sample) => sample * sample)),
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
                viewBox={`0 0 ${width + 48} ${height + 32}`}
              >
                <g transform="translate(32, 8)">
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
                      points={createPolylinePoints(samples, height, width, maxValue, curve.fn)}
                      stroke={curve.stroke}
                      strokeDasharray={curve.dashPattern}
                      strokeWidth={curve.id === 'linear' ? 2.2 : 1.7}
                    />
                  ))}
                  <text
                    fill="#111111"
                    fontFamily="'SF Mono', 'JetBrains Mono', Menlo, monospace"
                    fontSize="12"
                    transform={`translate(-20, ${height / 2}) rotate(-90)`}
                  >
                    Operation Count / Relative Cost
                  </text>
                  <text
                    x={width / 2 - 36}
                    y={height + 24}
                    fill="#111111"
                    fontFamily="'SF Mono', 'JetBrains Mono', Menlo, monospace"
                    fontSize="12"
                  >
                    Input Size (n)
                  </text>
                </g>
              </svg>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-4">
                <span className="min-w-[6ch] rounded border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-1 font-mono text-[0.9rem] text-[#111111]">
                  n = {inputSize}
                </span>
                <input
                  aria-label="Input size"
                  className="w-full accent-[#111111]"
                  max={256}
                  min={8}
                  onChange={(event) => setInputSize(Number(event.target.value))}
                  type="range"
                  value={inputSize}
                />
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {comparisonAlgorithms.map((algorithm) => (
                  <div key={algorithm.label} className="border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2">
                    <div className="font-mono text-[0.84rem] text-[#666666]">{algorithm.label}</div>
                    <div className="mt-1 font-mono text-[0.94rem] text-[#111111]">{algorithm.complexity}</div>
                  </div>
                ))}
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
                  n={inputSize}: {formatInteger(curve.fn(inputSize))} relative ops
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
  const [stepIndex, setStepIndex] = useState(0)
  const step = correctnessSteps[stepIndex] ?? correctnessSteps[0]
  const target = 101

  return (
    <div className="space-y-6">
      <SectionFrame heading="TRACE / Topic 01 / Correctness and Invariants">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-[1.35rem] font-medium tracking-[-0.03em] text-[#111111]">
              Step Execution and Correctness
            </h4>
            <div className="flex items-center gap-2">
              <button
                className="border border-[#E5E5E5] px-3 py-1.5 font-mono text-[0.88rem] text-[#111111] disabled:cursor-not-allowed disabled:text-[#999999]"
                disabled={stepIndex === 0}
                onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                type="button"
              >
                Prev
              </button>
              <button
                className="border border-[#111111] bg-[#111111] px-3 py-1.5 font-mono text-[0.88rem] text-[#FAFAFA] disabled:cursor-not-allowed disabled:border-[#E5E5E5] disabled:bg-[#FAFAFA] disabled:text-[#999999]"
                disabled={stepIndex === correctnessSteps.length - 1}
                onClick={() =>
                  setStepIndex((current) => Math.min(correctnessSteps.length - 1, current + 1))
                }
                type="button"
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2 border border-[#E5E5E5] bg-[#FAFAFA] p-4 font-mono text-[0.95rem] text-[#111111]">
              <div>target: {target}</div>
              <div>L: {step.left}</div>
              <div>mid: {step.mid}</div>
              <div>R: {step.right}</div>
              <div>array[mid]: {binarySearchArray[step.mid]}</div>
            </div>

            <div className="overflow-x-auto border border-[#E5E5E5] bg-white p-4">
              <div className="relative min-w-[640px]">
                <div className="mb-6 grid grid-cols-9 gap-2 font-mono text-[0.86rem] text-[#111111]">
                  {binarySearchArray.map((value, index) => (
                    <div key={`marker-${value}-${index}`} className="text-center">
                      {index === step.left ? 'L' : index === step.mid ? 'mid' : index === step.right ? 'R' : ''}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-9 gap-2">
                  {binarySearchArray.map((value, index) => {
                    const isOutsideRange = index < step.left || index > step.right
                    const isMid = index === step.mid

                    return (
                      <div
                        key={`${value}-${index}`}
                        className={[
                          'flex h-14 items-center justify-center border font-mono text-[1rem] transition-colors',
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

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4">
              <div className="font-mono text-[0.92rem] text-[#666666]">Next Operation</div>
              <div className="mt-3 space-y-2 font-mono text-[0.95rem] text-[#111111]">
                {step.lines.map((line) => (
                  <div key={line}>&gt; {line}</div>
                ))}
              </div>
            </div>
            <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4">
              <div className="font-mono text-[0.92rem] text-[#666666]">Invariant and Verification</div>
              <div className="mt-3 space-y-2 font-mono text-[0.95rem] text-[#111111]">
                {step.invariant.map((line) => (
                  <div key={line}>[ok] {line}</div>
                ))}
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
  onViewChange,
}: Readonly<{
  selectedView: Topic01View
  onViewChange: (view: Topic01View) => void
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

      <div className="mb-6 flex flex-wrap gap-2">
        {topic01Views.map((view) => {
          const isActive = view.id === activeView

          return (
            <button
              key={view.id}
              className={[
                'border px-3 py-1.5 font-mono text-[0.88rem] transition-colors',
                isActive
                  ? 'border-[#111111] bg-[#111111] text-[#FAFAFA]'
                  : 'border-[#E5E5E5] bg-white text-[#111111]',
              ].join(' ')}
              onClick={() => onViewChange(view.id)}
              type="button"
            >
              {view.label}
            </button>
          )
        })}
      </div>

      {activeView === 'complexity-analysis' ? <ComplexityAnalysisView /> : null}
      {activeView === 'correctness-invariants' ? <CorrectnessAndInvariantsView /> : null}
      {activeView === 'physical-machine-metaphor' ? <PhysicalMachineMetaphorView /> : null}
    </section>
  )
}

export { Topic01Lab }
export type { Topic01View }
