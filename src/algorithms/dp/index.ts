import type {
  DynamicProgrammingAlgorithmId,
  DynamicProgrammingCell,
  DynamicProgrammingCellTone,
  DynamicProgrammingFrame,
  DynamicProgrammingInput,
  DynamicProgrammingMetric,
  DynamicProgrammingPanel,
  DynamicProgrammingPreset,
  DynamicProgrammingPseudocodeLine,
  DynamicProgrammingTimeline,
} from '../../domain/algorithms/types.ts'

const dynamicProgrammingDirectoryLabelByAlgorithm: Record<DynamicProgrammingAlgorithmId, string> = {
  'salesman-house': 'SALESMAN HOUSE',
  maze: 'MAZE',
  'longest-increasing-subsequence': 'LONGEST INCREASING SUBSEQUENCE',
  'longest-common-subsequence': 'LONGEST COMMON SUBSEQUENCE',
  'edit-distance': 'EDIT DISTANCE',
  'maximum-subarray': 'MAXIMUM SUBARRAY',
}

type SalesmanHousePreset = Readonly<{
  id: string
  label: string
  values: readonly number[]
}>

type MazePreset = Readonly<{
  id: string
  label: string
  size: number
  blockedCells: readonly Readonly<{ rowIndex: number; columnIndex: number }>[]
}>

type SequencePreset = Readonly<{
  id: string
  label: string
  values: readonly number[]
}>

type StringPairPreset = Readonly<{
  id: string
  label: string
  left: string
  right: string
}>

const salesmanHousePresets: readonly SalesmanHousePreset[] = [
  {
    id: 'applied-sheet',
    label: 'Applied Sheet',
    values: [50, 10, 12, 65, 40, 95, 100, 12, 20, 30],
  },
  {
    id: 'extended-street',
    label: 'Extended Street',
    values: [14, 3, 27, 4, 18, 11, 40, 7, 29, 5, 16, 22],
  },
] as const

const mazePresets: readonly MazePreset[] = [
  {
    id: 'applied-style-19',
    label: 'Applied Style (19)',
    size: 5,
    blockedCells: [
      { rowIndex: 0, columnIndex: 4 },
      { rowIndex: 1, columnIndex: 1 },
      { rowIndex: 1, columnIndex: 2 },
    ],
  },
  {
    id: 'dense-obstacles',
    label: 'Dense Obstacles',
    size: 6,
    blockedCells: [
      { rowIndex: 0, columnIndex: 3 },
      { rowIndex: 1, columnIndex: 1 },
      { rowIndex: 1, columnIndex: 4 },
      { rowIndex: 2, columnIndex: 2 },
      { rowIndex: 3, columnIndex: 0 },
      { rowIndex: 3, columnIndex: 3 },
      { rowIndex: 4, columnIndex: 2 },
    ],
  },
] as const

const lisPresets: readonly SequencePreset[] = [
  {
    id: 'applied-sheet',
    label: 'Applied Sheet',
    values: [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15],
  },
  {
    id: 'staggered-growth',
    label: 'Staggered Growth',
    values: [9, 1, 11, 2, 10, 3, 12, 4, 13, 5, 14, 6],
  },
] as const

const lcsPresets: readonly StringPairPreset[] = [
  {
    id: 'classic-bdcaba',
    label: 'ABCBDAB vs BDCABA',
    left: 'ABCBDAB',
    right: 'BDCABA',
  },
  {
    id: 'banana-atana',
    label: 'BANANA vs ATANA',
    left: 'BANANA',
    right: 'ATANA',
  },
] as const

const editDistancePresets: readonly StringPairPreset[] = [
  {
    id: 'intention-execution',
    label: 'intention -> execution',
    left: 'intention',
    right: 'execution',
  },
  {
    id: 'algorithm-altruistic',
    label: 'algorithm -> altruistic',
    left: 'algorithm',
    right: 'altruistic',
  },
] as const

const maximumSubarrayPresets: readonly SequencePreset[] = [
  {
    id: 'clrs-classic',
    label: 'CLRS Classic',
    values: [13, -3, -25, 20, -3, -16, -23, 18, 20, -7, 12, -5, -22, 15, -4, 7],
  },
  {
    id: 'restart-heavy',
    label: 'Restart Heavy',
    values: [-2, 11, -4, 13, -5, 2, -1, 8, -21, 34, -3, 5],
  },
] as const

const selectPreset = <TPreset extends Readonly<{ id: string }>>(
  presets: readonly TPreset[],
  presetId: string | undefined,
) => presets.find((preset) => preset.id === presetId) ?? presets[0]

const toPresetInputMap = <TPreset extends Readonly<{ id: string }>, TInput>(
  presets: readonly TPreset[],
  mapFn: (preset: TPreset) => TInput,
): Readonly<Record<string, TInput>> =>
  presets.reduce<Record<string, TInput>>((accumulator, preset) => {
    accumulator[preset.id] = mapFn(preset)
    return accumulator
  }, {})

const createCell = (
  value: string | number,
  tone: DynamicProgrammingCellTone = 'default',
  label = '',
): DynamicProgrammingCell => ({
  label,
  tone,
  value: String(value),
})

const createArrayPanel = (
  title: string,
  cells: readonly DynamicProgrammingCell[],
): DynamicProgrammingPanel => ({
  kind: 'array',
  title,
  cells,
})

const createMatrixPanel = (
  title: string,
  columnLabels: readonly string[],
  rows: ReadonlyArray<Readonly<{ label: string; cells: readonly DynamicProgrammingCell[] }>>,
): DynamicProgrammingPanel => ({
  kind: 'matrix',
  title,
  columnLabels,
  rows,
})

const createMetrics = (entries: ReadonlyArray<Readonly<{ label: string; value: string }>>) =>
  entries.map((entry): DynamicProgrammingMetric => ({ label: entry.label, value: entry.value }))

const createFrame = (
  executedLines: readonly number[],
  operationText: string,
  detailText: string,
  panels: readonly DynamicProgrammingPanel[],
  metrics: readonly DynamicProgrammingMetric[],
  reconstructionText: string | null = null,
  isComplete = false,
): DynamicProgrammingFrame => ({
  detailText,
  executedLines,
  isComplete,
  metrics,
  operationText,
  panels,
  reconstructionText,
})

const toPresetSummaries = <TPreset extends Readonly<{ id: string; label: string }>>(
  presets: readonly TPreset[],
): readonly DynamicProgrammingPreset[] =>
  presets.map((preset) => ({ id: preset.id, label: preset.label }))

const formatNullableNumber = (value: number | null) => (value === null ? '·' : String(value))

const buildArrayCells = (
  values: readonly (string | number)[],
  resolveTone: (index: number) => DynamicProgrammingCellTone,
  resolveLabel: (index: number) => string,
) => values.map((value, index) => createCell(value, resolveTone(index), resolveLabel(index)))

const buildSalesmanHousePanels = (
  houseValues: readonly number[],
  dpValues: readonly (number | null)[],
  choices: readonly (string | null)[],
  activeIndex: number | null,
  chosenIndices: ReadonlySet<number> = new Set<number>(),
): readonly DynamicProgrammingPanel[] => [
  createArrayPanel(
    'HOUSE VALUES',
    buildArrayCells(
      houseValues,
      (index) => {
        if (chosenIndices.has(index)) {
          return 'path'
        }
        return activeIndex === index ? 'active' : 'default'
      },
      (index) => `H${index + 1}`,
    ),
  ),
  createArrayPanel(
    'BEST TOTAL TO HERE',
    dpValues.map((value, index) =>
      createCell(
        formatNullableNumber(value),
        chosenIndices.has(index) ? 'best' : activeIndex === index ? 'active' : 'default',
        `dp[${index}]`,
      ),
    ),
  ),
  createArrayPanel(
    'DECISION',
    choices.map((choice, index) =>
      createCell(choice ?? '·', activeIndex === index ? 'active' : 'default', `H${index + 1}`),
    ),
  ),
]

const reconstructSalesmanHousePath = (
  houseValues: readonly number[],
  dpValues: readonly number[],
): readonly number[] => {
  const chosen: number[] = []
  let index = houseValues.length - 1

  while (index >= 0) {
    if (index === 0 || dpValues[index] > (dpValues[index - 1] ?? 0)) {
      chosen.push(index)
      index -= 2
    } else {
      index -= 1
    }
  }

  return chosen.reverse()
}

const buildSalesmanHouseTimeline = (
  requestedPresetId?: string,
  customInput?: DynamicProgrammingInput | null,
): DynamicProgrammingTimeline => {
  const selectedPreset = selectPreset(salesmanHousePresets, requestedPresetId)
  const houseValues =
    customInput?.algorithmId === 'salesman-house'
      ? [...customInput.values]
      : [...selectedPreset.values]
  const dpValues: (number | null)[] = Array.from({ length: houseValues.length }, () => null)
  const choices: (string | null)[] = Array.from({ length: houseValues.length }, () => null)
  const frames: DynamicProgrammingFrame[] = []

  const pseudocodeLines: readonly DynamicProgrammingPseudocodeLine[] = [
    { lineNumber: 1, text: 'Set DP[0..n] = 0' },
    { lineNumber: 2, text: 'DP[1] = c1' },
    { lineNumber: 3, text: 'for i = 2 to n do' },
    { lineNumber: 4, text: '    DP[i] = max(DP[i - 1], DP[i - 2] + ci)' },
    { lineNumber: 5, text: 'Set i = n' },
    { lineNumber: 6, text: 'while i > 0 do' },
    { lineNumber: 7, text: '    if DP[i] > DP[i - 1] then append(i), i = i - 2 else i = i - 1' },
  ]

  frames.push(
    createFrame(
      [1],
      'Start a left-to-right DP strip for the houses.',
      'Each cell stores the best takings reachable from the prefix ending at that house.',
      buildSalesmanHousePanels(houseValues, dpValues, choices, null),
      createMetrics([
        { label: 'current house', value: '-' },
        { label: 'best total', value: '0' },
        { label: 'decision', value: 'waiting' },
      ]),
    ),
  )

  dpValues[0] = houseValues[0]
  choices[0] = 'take'
  frames.push(
    createFrame(
      [1, 2],
      `Seed H1 with ${houseValues[0]}.`,
      'The first house has no predecessor conflict, so the best total is its own value.',
      buildSalesmanHousePanels(houseValues, dpValues, choices, 0),
      createMetrics([
        { label: 'current house', value: 'H1' },
        { label: 'take', value: String(houseValues[0]) },
        { label: 'skip', value: '0' },
        { label: 'best total', value: String(dpValues[0]) },
      ]),
    ),
  )

  for (let index = 1; index < houseValues.length; index += 1) {
    const skipValue = dpValues[index - 1] ?? 0
    const takeValue = houseValues[index] + (index >= 2 ? (dpValues[index - 2] ?? 0) : 0)
    const decision = takeValue >= skipValue ? 'take' : 'skip'
    const bestValue = Math.max(skipValue, takeValue)

    dpValues[index] = bestValue
    choices[index] = decision

    frames.push(
      createFrame(
        [3, 4],
        `Evaluate H${index + 1}: compare taking it against skipping it.`,
        decision === 'take'
          ? `Taking this house gives ${takeValue}, which beats carrying forward ${skipValue}.`
          : `Skipping this house keeps ${skipValue}, which beats taking it for ${takeValue}.`,
        buildSalesmanHousePanels(houseValues, dpValues, choices, index),
        createMetrics([
          { label: 'current house', value: `H${index + 1}` },
          { label: 'take', value: String(takeValue) },
          { label: 'skip', value: String(skipValue) },
          { label: 'best total', value: String(bestValue) },
        ]),
      ),
    )
  }

  const resolvedDpValues = dpValues.map((value) => value ?? 0)
  const chosenIndices = reconstructSalesmanHousePath(houseValues, resolvedDpValues)
  frames.push(
    createFrame(
      [5, 6, 7],
      'Trace backwards through the table to recover the chosen houses.',
      'When taking a house matches the stored best total, jump back by two indices. Otherwise move one step left.',
      buildSalesmanHousePanels(
        houseValues,
        resolvedDpValues,
        choices,
        null,
        new Set<number>(chosenIndices),
      ),
      createMetrics([
        { label: 'best total', value: String(resolvedDpValues[resolvedDpValues.length - 1] ?? 0) },
        { label: 'chosen houses', value: chosenIndices.map((index) => `H${index + 1}`).join(', ') },
        { label: 'house count', value: String(chosenIndices.length) },
      ]),
      `Chosen houses: ${chosenIndices.map((index) => `H${index + 1}`).join(' -> ')}`,
      true,
    ),
  )

  return {
    activePresetId: selectedPreset.id,
    algorithmId: 'salesman-house',
    complexityProfile: {
      note: 'One pass fills the table; reconstruction walks backwards through the stored totals.',
      space: 'O(n)',
      time: 'O(n)',
    },
    directionNote: null,
    frames,
    presets: toPresetSummaries(salesmanHousePresets),
    presetInputs: toPresetInputMap(salesmanHousePresets, (preset) => ({
      algorithmId: 'salesman-house',
      values: preset.values,
    })),
    pseudocodeLines,
    recurrence: 'dp[i] = max(dp[i - 1], value[i] + dp[i - 2])',
    subtitle:
      'A left-to-right non-adjacent choice table: each house either extends the best plan from two steps back or yields to the prefix best.',
    title: dynamicProgrammingDirectoryLabelByAlgorithm['salesman-house'],
  }
}

const mazeKey = (rowIndex: number, columnIndex: number) => `${rowIndex}:${columnIndex}`

const buildMazePanels = (
  size: number,
  blockedKeys: ReadonlySet<string>,
  dpValues: readonly (readonly (number | null)[])[],
  activeKey: string | null,
  dependencyKeys: ReadonlySet<string>,
): readonly DynamicProgrammingPanel[] => {
  const columnLabels = Array.from({ length: size }, (_, index) => `c${index + 1}`)
  const rowOrder = Array.from({ length: size }, (_, index) => size - 1 - index)

  return [
    createMatrixPanel(
      'GRID',
      columnLabels,
      rowOrder.map((rowIndex) => ({
        cells: Array.from({ length: size }, (_, columnIndex) => {
          const key = mazeKey(rowIndex, columnIndex)
          const isBlocked = blockedKeys.has(key)
          const tone = isBlocked
            ? 'path'
            : activeKey === key
              ? 'active'
              : dependencyKeys.has(key)
                ? 'dependency'
                : 'default'
          const marker =
            rowIndex === 0 && columnIndex === 0
              ? 'S'
              : rowIndex === size - 1 && columnIndex === size - 1
                ? 'T'
                : isBlocked
                  ? 'X'
                  : '·'
          return createCell(marker, tone)
        }),
        label: `r${rowIndex + 1}`,
      })),
    ),
    createMatrixPanel(
      'PATH COUNTS TO TARGET',
      columnLabels,
      rowOrder.map((rowIndex) => ({
        cells: Array.from({ length: size }, (_, columnIndex) => {
          const key = mazeKey(rowIndex, columnIndex)
          const tone = blockedKeys.has(key)
            ? 'path'
            : activeKey === key
              ? 'active'
              : dependencyKeys.has(key)
                ? 'dependency'
                : 'default'
          const value = blockedKeys.has(key) ? 0 : formatNullableNumber(dpValues[rowIndex]?.[columnIndex] ?? null)
          return createCell(value, tone)
        }),
        label: `r${rowIndex + 1}`,
      })),
    ),
  ]
}

const buildMazeTimeline = (
  requestedPresetId?: string,
  customInput?: DynamicProgrammingInput | null,
): DynamicProgrammingTimeline => {
  const selectedPreset = selectPreset(mazePresets, requestedPresetId)
  const size = customInput?.algorithmId === 'maze' ? customInput.size : selectedPreset.size
  const blockedKeys = new Set<string>(
    (customInput?.algorithmId === 'maze'
      ? customInput.blockedCells
      : selectedPreset.blockedCells
    ).map((cell) => mazeKey(cell.rowIndex, cell.columnIndex)),
  )
  const dpValues = Array.from({ length: size }, () => Array.from({ length: size }, () => null as number | null))
  const frames: DynamicProgrammingFrame[] = []
  const lastRowIndex = size - 1
  const lastColumnIndex = size - 1

  const pseudocodeLines: readonly DynamicProgrammingPseudocodeLine[] = [
    { lineNumber: 1, text: 'for i = n downto 1 do' },
    { lineNumber: 2, text: '    for j = n downto 1 do' },
    { lineNumber: 3, text: '        if (i, j) is blocked then DP[i, j] = 0' },
    { lineNumber: 4, text: '        else if (i, j) = (n, n) then DP[i, j] = 1' },
    { lineNumber: 5, text: '        else if i = n then DP[i, j] = DP[i, j + 1]' },
    { lineNumber: 6, text: '        else if j = n then DP[i, j] = DP[i + 1, j]' },
    { lineNumber: 7, text: '        else DP[i, j] = DP[i + 1, j] + DP[i, j + 1]' },
  ]

  frames.push(
    createFrame(
      [1],
      'Set up a reverse-fill table from target back to the initial cell.',
      'This follows the applied-sheet recurrence by counting paths from each cell to the target, while the student story still reads from the initial cell to the target.',
      buildMazePanels(size, blockedKeys, dpValues, null, new Set<string>()),
      createMetrics([
        { label: 'current cell', value: '-' },
        { label: 'fill direction', value: 'target -> initial' },
        { label: 'answer location', value: 'DP[1, 1]' },
      ]),
    ),
  )

  for (let rowIndex = lastRowIndex; rowIndex >= 0; rowIndex -= 1) {
    for (let columnIndex = lastColumnIndex; columnIndex >= 0; columnIndex -= 1) {
      const currentKey = mazeKey(rowIndex, columnIndex)
      const isBlocked = blockedKeys.has(currentKey)

      if (isBlocked) {
        dpValues[rowIndex][columnIndex] = 0
        frames.push(
          createFrame(
            [1, 2, 3],
            `Cell (${rowIndex + 1}, ${columnIndex + 1}) is blocked, so it contributes zero paths.`,
            'Blocked cells are base cases with no valid continuation to the target.',
            buildMazePanels(size, blockedKeys, dpValues, currentKey, new Set<string>()),
            createMetrics([
              { label: 'current cell', value: `(${rowIndex + 1}, ${columnIndex + 1})` },
              { label: 'status', value: 'blocked' },
              { label: 'stored paths', value: '0' },
            ]),
          ),
        )
        continue
      }

      if (rowIndex === lastRowIndex && columnIndex === lastColumnIndex) {
        dpValues[rowIndex][columnIndex] = 1
        frames.push(
          createFrame(
            [1, 2, 4],
            'Anchor the target cell with one valid path to itself.',
            'The target-to-target path count is 1 because staying on the target is one completed path.',
            buildMazePanels(size, blockedKeys, dpValues, currentKey, new Set<string>()),
            createMetrics([
              { label: 'current cell', value: `(${rowIndex + 1}, ${columnIndex + 1})` },
              { label: 'status', value: 'target' },
              { label: 'stored paths', value: '1' },
            ]),
          ),
        )
        continue
      }

      const dependencyKeys = new Set<string>()
      const rightValue =
        columnIndex + 1 <= lastColumnIndex
          ? (dependencyKeys.add(mazeKey(rowIndex, columnIndex + 1)),
            dpValues[rowIndex]?.[columnIndex + 1] ?? null)
          : null
      const upValue =
        rowIndex + 1 <= lastRowIndex
          ? (dependencyKeys.add(mazeKey(rowIndex + 1, columnIndex)),
            dpValues[rowIndex + 1]?.[columnIndex] ?? null)
          : null
      const nextValue =
        rowIndex === lastRowIndex
          ? rightValue ?? 0
          : columnIndex === lastColumnIndex
            ? upValue ?? 0
            : (rightValue ?? 0) + (upValue ?? 0)

      dpValues[rowIndex][columnIndex] = nextValue

      frames.push(
        createFrame(
          [
            1,
            2,
            rowIndex === lastRowIndex ? 5 : columnIndex === lastColumnIndex ? 6 : 7,
          ],
          `Fill cell (${rowIndex + 1}, ${columnIndex + 1}) from the already-solved cells closer to the target.`,
          rowIndex === lastRowIndex
            ? 'On the top row, only the rightward continuation exists.'
            : columnIndex === lastColumnIndex
              ? 'On the rightmost column, only the upward continuation exists.'
              : 'Interior cells add the path counts from the upward and rightward continuations.',
          buildMazePanels(size, blockedKeys, dpValues, currentKey, dependencyKeys),
          createMetrics([
            { label: 'current cell', value: `(${rowIndex + 1}, ${columnIndex + 1})` },
            { label: 'right exit', value: formatNullableNumber(rightValue) },
            { label: 'up exit', value: formatNullableNumber(upValue) },
            { label: 'stored paths', value: String(dpValues[rowIndex]?.[columnIndex] ?? 0) },
          ]),
        ),
      )
    }
  }

  const resolvedDpValues = dpValues.map((row) => row.map((value) => value ?? 0))

  frames.push(
    createFrame(
      [7],
      'Read the total number of valid paths from the initial cell.',
      'Even though the table was filled backwards from the target, the final answer is still the number of valid paths from the initial cell to the target.',
      buildMazePanels(size, blockedKeys, resolvedDpValues, mazeKey(0, 0), new Set<string>()),
      createMetrics([
        { label: 'fill direction', value: 'target -> initial' },
        { label: 'story direction', value: 'initial -> target' },
        { label: 'valid paths', value: String(resolvedDpValues[0]?.[0] ?? 0) },
      ]),
      `Total valid paths from the initial cell: ${resolvedDpValues[0]?.[0] ?? 0}`,
      true,
    ),
  )

  return {
    activePresetId: selectedPreset.id,
    algorithmId: 'maze',
    complexityProfile: {
      note: 'The full grid is stored so the reverse fill and each boundary case can be replayed cell by cell.',
      space: 'O(rows * cols)',
      time: 'O(rows * cols)',
    },
    directionNote:
      'This page counts paths from each cell to the target, so the table is filled from target -> initial even though the question is asked from initial -> target.',
    frames,
    presets: toPresetSummaries(mazePresets),
    presetInputs: toPresetInputMap(mazePresets, (preset) => ({
      algorithmId: 'maze',
      size: preset.size,
      blockedCells: preset.blockedCells,
    })),
    pseudocodeLines,
    recurrence:
      'DP[i, j] = 0 if blocked, 1 at the target, otherwise DP[i + 1, j] + DP[i, j + 1] with boundary-row/column cases',
    subtitle:
      'A blocked-grid path-counting DP from the applied sheet: each cell stores how many valid routes reach the target, and the table is filled backwards from the target to the initial cell.',
    title: dynamicProgrammingDirectoryLabelByAlgorithm.maze,
  }
}

const buildLISPanels = (
  values: readonly number[],
  dpValues: readonly number[],
  predecessors: readonly (number | null)[],
  activeIndex: number | null,
  dependencyIndex: number | null,
  pathIndices: ReadonlySet<number> = new Set<number>(),
): readonly DynamicProgrammingPanel[] => [
  createArrayPanel(
    'INPUT ARRAY',
    values.map((value, index) =>
      createCell(
        value,
        pathIndices.has(index)
          ? 'path'
          : activeIndex === index
            ? 'active'
            : dependencyIndex === index
              ? 'dependency'
              : 'default',
        `a[${index}]`,
      ),
    ),
  ),
  createArrayPanel(
    'LIS LENGTH BY INDEX',
    dpValues.map((value, index) =>
      createCell(
        value,
        pathIndices.has(index)
          ? 'best'
          : activeIndex === index
            ? 'active'
            : dependencyIndex === index
              ? 'dependency'
              : 'default',
        `dp[${index}]`,
      ),
    ),
  ),
  createArrayPanel(
    'PREDECESSOR',
    predecessors.map((value, index) =>
      createCell(
        value === null ? '·' : `a[${value}]`,
        activeIndex === index ? 'active' : dependencyIndex === index ? 'dependency' : 'default',
        `prv[${index}]`,
      ),
    ),
  ),
]

const reconstructLISPath = (
  dpValues: readonly number[],
  predecessors: readonly (number | null)[],
): readonly number[] => {
  let bestIndex = 0
  for (let index = 1; index < dpValues.length; index += 1) {
    if (dpValues[index] > dpValues[bestIndex]) {
      bestIndex = index
    }
  }

  const indices: number[] = []
  let cursor: number | null = bestIndex
  while (cursor !== null) {
    indices.push(cursor)
    cursor = predecessors[cursor] ?? null
  }

  return indices.reverse()
}

const buildLongestIncreasingSubsequenceTimeline = (
  requestedPresetId?: string,
  customInput?: DynamicProgrammingInput | null,
): DynamicProgrammingTimeline => {
  const selectedPreset = selectPreset(lisPresets, requestedPresetId)
  const values =
    customInput?.algorithmId === 'longest-increasing-subsequence'
      ? [...customInput.values]
      : [...selectedPreset.values]
  const dpValues = Array.from({ length: values.length }, () => 1)
  const predecessors = Array.from({ length: values.length }, () => null as number | null)
  const frames: DynamicProgrammingFrame[] = []

  const pseudocodeLines: readonly DynamicProgrammingPseudocodeLine[] = [
    { lineNumber: 1, text: 'for i = 1 to n do' },
    { lineNumber: 2, text: '    DP[i] = 1' },
    { lineNumber: 3, text: '    for j = 1 to i - 1 do' },
    { lineNumber: 4, text: '        if a[j] < a[i] then' },
    { lineNumber: 5, text: '            DP[i] = max(DP[i], DP[j] + 1)' },
    { lineNumber: 6, text: 'return max DP[i]' },
  ]

  frames.push(
    createFrame(
      [1],
      'Prepare one DP cell per array index.',
      'Each cell answers: what is the longest increasing subsequence that must end at this position?',
      buildLISPanels(values, dpValues, predecessors, null, null),
      createMetrics([
        { label: 'current i', value: '-' },
        { label: 'best length', value: '1' },
        { label: 'status', value: 'ready' },
      ]),
    ),
  )

  for (let index = 0; index < values.length; index += 1) {
    dpValues[index] = 1
    predecessors[index] = null

    frames.push(
      createFrame(
        [1, 2],
        `Start index ${index} as a subsequence of length 1.`,
        'Every value can at least form an increasing subsequence containing only itself.',
        buildLISPanels(values, dpValues, predecessors, index, null),
        createMetrics([
          { label: 'current i', value: String(index) },
          { label: 'value', value: String(values[index]) },
          { label: 'dp[i]', value: String(dpValues[index]) },
        ]),
      ),
    )

    for (let previousIndex = 0; previousIndex < index; previousIndex += 1) {
      if (values[previousIndex] < values[index] && dpValues[previousIndex] + 1 > dpValues[index]) {
        dpValues[index] = dpValues[previousIndex] + 1
        predecessors[index] = previousIndex

        frames.push(
          createFrame(
            [3, 4, 5],
            `Extend through a[${previousIndex}] to improve the subsequence ending at a[${index}].`,
            `Since ${values[previousIndex]} < ${values[index]}, the candidate length becomes ${dpValues[index]}.`,
            buildLISPanels(values, dpValues, predecessors, index, previousIndex),
            createMetrics([
              { label: 'current i', value: String(index) },
              { label: 'candidate j', value: String(previousIndex) },
              { label: 'new dp[i]', value: String(dpValues[index]) },
              { label: 'best length', value: String(Math.max(...dpValues)) },
            ]),
          ),
        )
      }
    }
  }

  const pathIndices = reconstructLISPath(dpValues, predecessors)
  const sequenceValues = pathIndices.map((index) => values[index])
  const finalPanels = [
    ...buildLISPanels(values, dpValues, predecessors, null, null, new Set<number>(pathIndices)),
    createArrayPanel(
      'RECONSTRUCTED SUBSEQUENCE',
      sequenceValues.map((value, index) => createCell(value, 'best', `s${index + 1}`)),
    ),
  ] as const

  frames.push(
    createFrame(
      [6],
      'Read the answer from the maximum DP entry, then use the stored predecessor links to show one optimal subsequence.',
      'The applied-sheet recurrence returns the length directly; the visualizer keeps predecessor links so the chosen subsequence can still be shown.',
      finalPanels,
      createMetrics([
        { label: 'best length', value: String(sequenceValues.length) },
        { label: 'endpoint', value: `a[${pathIndices[pathIndices.length - 1] ?? 0}]` },
        { label: 'sequence', value: sequenceValues.join(', ') },
      ]),
      `LIS: ${sequenceValues.join(' -> ')}`,
      true,
    ),
  )

  return {
    activePresetId: selectedPreset.id,
    algorithmId: 'longest-increasing-subsequence',
    complexityProfile: {
      note: 'This first pass uses the classic O(n^2) recurrence so every dependency edge is visible in the workbench.',
      space: 'O(n)',
      time: 'O(n^2)',
    },
    directionNote: null,
    frames,
    presets: toPresetSummaries(lisPresets),
    presetInputs: toPresetInputMap(lisPresets, (preset) => ({
      algorithmId: 'longest-increasing-subsequence',
      values: preset.values,
    })),
    pseudocodeLines,
    recurrence: 'dp[i] = 1 + max(dp[j]) for all j < i with a[j] < a[i]',
    subtitle:
      'A predecessor-aware DP over indices: every position tries to extend smaller earlier values and remembers where the best chain came from.',
    title: dynamicProgrammingDirectoryLabelByAlgorithm['longest-increasing-subsequence'],
  }
}

const matrixKey = (rowIndex: number, columnIndex: number) => `${rowIndex}:${columnIndex}`

const buildStringMatrixPanel = (
  title: string,
  left: string,
  right: string,
  values: readonly (readonly number[])[],
  activeKey: string | null,
  dependencyKeys: ReadonlySet<string>,
  pathKeys: ReadonlySet<string> = new Set<string>(),
): DynamicProgrammingPanel =>
  createMatrixPanel(
    title,
    ['Ø', ...right.split('')],
    values.map((row, rowIndex) => ({
      cells: row.map((value, columnIndex) => {
        const key = matrixKey(rowIndex, columnIndex)
        const tone =
          pathKeys.has(key)
            ? 'path'
            : activeKey === key
              ? 'active'
              : dependencyKeys.has(key)
                ? 'dependency'
                : 'default'
        return createCell(value, tone)
      }),
      label: rowIndex === 0 ? 'Ø' : left[rowIndex - 1] ?? `r${rowIndex}`,
    })),
  )

const buildLongestCommonSubsequenceTimeline = (
  requestedPresetId?: string,
  customInput?: DynamicProgrammingInput | null,
): DynamicProgrammingTimeline => {
  const selectedPreset = selectPreset(lcsPresets, requestedPresetId)
  const left = customInput?.algorithmId === 'longest-common-subsequence' ? customInput.left : selectedPreset.left
  const right = customInput?.algorithmId === 'longest-common-subsequence' ? customInput.right : selectedPreset.right
  const rows = left.length + 1
  const columns = right.length + 1
  const table = Array.from({ length: rows }, () => Array.from({ length: columns }, () => 0))
  const frames: DynamicProgrammingFrame[] = []

  const pseudocodeLines: readonly DynamicProgrammingPseudocodeLine[] = [
    { lineNumber: 1, text: 'for i = 0 to n do DP[i, 0] = 0' },
    { lineNumber: 2, text: 'for j = 0 to m do DP[0, j] = 0' },
    { lineNumber: 3, text: 'for i = 1 to n do' },
    { lineNumber: 4, text: '    for j = 1 to m do' },
    { lineNumber: 5, text: '        if a[i] = b[j] then DP[i, j] = 1 + DP[i - 1, j - 1]' },
    { lineNumber: 6, text: '        else DP[i, j] = max(DP[i - 1, j], DP[i, j - 1])' },
    { lineNumber: 7, text: 'return DP[n, m]' },
  ]

  frames.push(
    createFrame(
      [1, 2],
      'Seed the zero row and zero column.',
      'An empty prefix shares no common subsequence with any string, so those boundary cells remain zero.',
      [buildStringMatrixPanel('LCS TABLE', left, right, table, null, new Set<string>())],
      createMetrics([
        { label: 'left', value: left },
        { label: 'right', value: right },
        { label: 'best length', value: '0' },
      ]),
    ),
  )

  for (let rowIndex = 1; rowIndex < rows; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex < columns; columnIndex += 1) {
      const activeKey = matrixKey(rowIndex, columnIndex)
      const dependencyKeys = new Set<string>()

      if (left[rowIndex - 1] === right[columnIndex - 1]) {
        dependencyKeys.add(matrixKey(rowIndex - 1, columnIndex - 1))
        table[rowIndex][columnIndex] = (table[rowIndex - 1]?.[columnIndex - 1] ?? 0) + 1

        frames.push(
          createFrame(
            [3, 4, 5],
            `Match ${left[rowIndex - 1]} with ${right[columnIndex - 1]} and grow diagonally.`,
            'A match means the best subsequence extends the diagonal dependency by one.',
            [buildStringMatrixPanel('LCS TABLE', left, right, table, activeKey, dependencyKeys)],
            createMetrics([
              { label: 'current pair', value: `${left[rowIndex - 1]} / ${right[columnIndex - 1]}` },
              { label: 'relation', value: 'match' },
              { label: 'cell value', value: String(table[rowIndex]?.[columnIndex] ?? 0) },
            ]),
          ),
        )
      } else {
        dependencyKeys.add(matrixKey(rowIndex - 1, columnIndex))
        dependencyKeys.add(matrixKey(rowIndex, columnIndex - 1))
        table[rowIndex][columnIndex] = Math.max(
          table[rowIndex - 1]?.[columnIndex] ?? 0,
          table[rowIndex]?.[columnIndex - 1] ?? 0,
        )

        frames.push(
          createFrame(
            [3, 4, 6],
            `Mismatch at ${left[rowIndex - 1]} / ${right[columnIndex - 1]}; inherit the better prefix answer.`,
            'When characters differ, the best answer comes from either dropping the left character or dropping the right one.',
            [buildStringMatrixPanel('LCS TABLE', left, right, table, activeKey, dependencyKeys)],
            createMetrics([
              { label: 'current pair', value: `${left[rowIndex - 1]} / ${right[columnIndex - 1]}` },
              { label: 'relation', value: 'mismatch' },
              { label: 'cell value', value: String(table[rowIndex]?.[columnIndex] ?? 0) },
            ]),
          ),
        )
      }
    }
  }

  const pathKeys = new Set<string>()
  const subsequence: string[] = []
  let rowIndex = rows - 1
  let columnIndex = columns - 1

  while (rowIndex > 0 && columnIndex > 0) {
    pathKeys.add(matrixKey(rowIndex, columnIndex))
    if (left[rowIndex - 1] === right[columnIndex - 1]) {
      subsequence.push(left[rowIndex - 1] ?? '')
      rowIndex -= 1
      columnIndex -= 1
      continue
    }

    if ((table[rowIndex - 1]?.[columnIndex] ?? 0) >= (table[rowIndex]?.[columnIndex - 1] ?? 0)) {
      rowIndex -= 1
    } else {
      columnIndex -= 1
    }
  }

  pathKeys.add(matrixKey(rowIndex, columnIndex))
  const resolvedSubsequence = subsequence.reverse()

  frames.push(
    createFrame(
      [7],
      'Trace back from the bottom-right corner to recover one optimal subsequence.',
      'Diagonal moves record matched characters; vertical and horizontal moves discard one character from a prefix.',
      [
        buildStringMatrixPanel('LCS TABLE', left, right, table, null, new Set<string>(), pathKeys),
        createArrayPanel(
          'RECONSTRUCTED SUBSEQUENCE',
          resolvedSubsequence.map((character, index) => createCell(character, 'best', `s${index + 1}`)),
        ),
      ],
      createMetrics([
        { label: 'left', value: left },
        { label: 'right', value: right },
        { label: 'best length', value: String(table[rows - 1]?.[columns - 1] ?? 0) },
      ]),
      `LCS: ${resolvedSubsequence.join('')}`,
      true,
    ),
  )

  return {
    activePresetId: selectedPreset.id,
    algorithmId: 'longest-common-subsequence',
    complexityProfile: {
      note: 'The matrix stays fully visible so recurrence choices and traceback decisions can be inspected cell by cell.',
      space: 'O(m * n)',
      time: 'O(m * n)',
    },
    directionNote: null,
    frames,
    presets: toPresetSummaries(lcsPresets),
    presetInputs: toPresetInputMap(lcsPresets, (preset) => ({
      algorithmId: 'longest-common-subsequence',
      left: preset.left,
      right: preset.right,
    })),
    pseudocodeLines,
    recurrence: 'dp[i][j] = if match then dp[i - 1][j - 1] + 1 else max(dp[i - 1][j], dp[i][j - 1])',
    subtitle:
      'A two-string table where every cell asks whether a character match should extend the diagonal or whether a mismatch should inherit a better prefix answer.',
    title: dynamicProgrammingDirectoryLabelByAlgorithm['longest-common-subsequence'],
  }
}

const buildEditDistanceTimeline = (
  requestedPresetId?: string,
  customInput?: DynamicProgrammingInput | null,
): DynamicProgrammingTimeline => {
  const selectedPreset = selectPreset(editDistancePresets, requestedPresetId)
  const left = customInput?.algorithmId === 'edit-distance' ? customInput.left : selectedPreset.left
  const right = customInput?.algorithmId === 'edit-distance' ? customInput.right : selectedPreset.right
  const rows = left.length + 1
  const columns = right.length + 1
  const table = Array.from({ length: rows }, () => Array.from({ length: columns }, () => 0))
  const frames: DynamicProgrammingFrame[] = []

  const pseudocodeLines: readonly DynamicProgrammingPseudocodeLine[] = [
    { lineNumber: 1, text: 'for i = 0 to n do DP[i, 0] = i' },
    { lineNumber: 2, text: 'for j = 0 to m do DP[0, j] = j' },
    { lineNumber: 3, text: 'for i = 1 to n do' },
    { lineNumber: 4, text: '    for j = 1 to m do' },
    { lineNumber: 5, text: '        if a[i] = b[j] then DP[i, j] = DP[i - 1, j - 1]' },
    { lineNumber: 6, text: '        else DP[i, j] = 1 + min(DP[i - 1, j], DP[i, j - 1], DP[i - 1, j - 1])' },
    { lineNumber: 7, text: 'return DP[n, m]' },
  ]

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    table[rowIndex][0] = rowIndex
  }
  for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
    table[0][columnIndex] = columnIndex
  }

  frames.push(
    createFrame(
      [1, 2],
      'Seed the boundary costs for insertions and deletions.',
      'Converting to or from the empty string costs exactly the prefix length.',
      [buildStringMatrixPanel('EDIT DISTANCE TABLE', left, right, table, null, new Set<string>())],
      createMetrics([
        { label: 'source', value: left },
        { label: 'target', value: right },
        { label: 'current cost', value: '0' },
      ]),
    ),
  )

  for (let rowIndex = 1; rowIndex < rows; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex < columns; columnIndex += 1) {
      const activeKey = matrixKey(rowIndex, columnIndex)
      const dependencyKeys = new Set<string>([
        matrixKey(rowIndex - 1, columnIndex),
        matrixKey(rowIndex, columnIndex - 1),
        matrixKey(rowIndex - 1, columnIndex - 1),
      ])

      if (left[rowIndex - 1] === right[columnIndex - 1]) {
        table[rowIndex][columnIndex] = table[rowIndex - 1]?.[columnIndex - 1] ?? 0
        frames.push(
          createFrame(
            [3, 4, 5],
            `Characters ${left[rowIndex - 1]} and ${right[columnIndex - 1]} already match.`,
            'A matching character pair carries the diagonal edit count forward unchanged.',
            [buildStringMatrixPanel('EDIT DISTANCE TABLE', left, right, table, activeKey, dependencyKeys)],
            createMetrics([
              { label: 'current pair', value: `${left[rowIndex - 1]} / ${right[columnIndex - 1]}` },
              { label: 'operation', value: 'keep' },
              { label: 'cell value', value: String(table[rowIndex]?.[columnIndex] ?? 0) },
            ]),
          ),
        )
      } else {
        const deleteCost = (table[rowIndex - 1]?.[columnIndex] ?? 0) + 1
        const insertCost = (table[rowIndex]?.[columnIndex - 1] ?? 0) + 1
        const substituteCost = (table[rowIndex - 1]?.[columnIndex - 1] ?? 0) + 1
        table[rowIndex][columnIndex] = Math.min(deleteCost, insertCost, substituteCost)

        const operation =
          table[rowIndex][columnIndex] === substituteCost
            ? 'substitute'
            : table[rowIndex][columnIndex] === insertCost
              ? 'insert'
              : 'delete'

        frames.push(
          createFrame(
            [3, 4, 6],
            `Resolve ${left[rowIndex - 1]} -> ${right[columnIndex - 1]} via the cheapest edit.`,
            'The active cell compares delete, insert, and substitute costs before storing the minimum.',
            [buildStringMatrixPanel('EDIT DISTANCE TABLE', left, right, table, activeKey, dependencyKeys)],
            createMetrics([
              { label: 'current pair', value: `${left[rowIndex - 1]} / ${right[columnIndex - 1]}` },
              { label: 'delete', value: String(deleteCost) },
              { label: 'insert', value: String(insertCost) },
              { label: 'substitute', value: String(substituteCost) },
              { label: 'chosen op', value: operation },
            ]),
          ),
        )
      }
    }
  }

  const pathKeys = new Set<string>()
  const script: string[] = []
  let rowIndex = rows - 1
  let columnIndex = columns - 1

  while (rowIndex > 0 || columnIndex > 0) {
    pathKeys.add(matrixKey(rowIndex, columnIndex))

    if (
      rowIndex > 0 &&
      columnIndex > 0 &&
      left[rowIndex - 1] === right[columnIndex - 1] &&
      table[rowIndex]?.[columnIndex] === table[rowIndex - 1]?.[columnIndex - 1]
    ) {
      script.push(`keep ${left[rowIndex - 1]}`)
      rowIndex -= 1
      columnIndex -= 1
      continue
    }

    const currentValue = table[rowIndex]?.[columnIndex] ?? 0
    const substituteValue =
      rowIndex > 0 && columnIndex > 0 ? (table[rowIndex - 1]?.[columnIndex - 1] ?? Infinity) : Infinity
    const insertValue = columnIndex > 0 ? (table[rowIndex]?.[columnIndex - 1] ?? Infinity) : Infinity

    if (rowIndex > 0 && columnIndex > 0 && currentValue === substituteValue + 1) {
      script.push(`sub ${left[rowIndex - 1]}→${right[columnIndex - 1]}`)
      rowIndex -= 1
      columnIndex -= 1
      continue
    }

    if (columnIndex > 0 && currentValue === insertValue + 1) {
      script.push(`ins ${right[columnIndex - 1]}`)
      columnIndex -= 1
      continue
    }

    script.push(`del ${left[rowIndex - 1] ?? ''}`.trim())
    rowIndex -= 1
  }

  pathKeys.add(matrixKey(rowIndex, columnIndex))
  const resolvedScript = script.reverse()

  frames.push(
    createFrame(
      [7],
      'Trace the chosen edits backwards from the bottom-right corner.',
      'The traceback shows which cells came from keeping, inserting, deleting, or substituting characters.',
      [
        buildStringMatrixPanel('EDIT DISTANCE TABLE', left, right, table, null, new Set<string>(), pathKeys),
        createArrayPanel(
          'EDIT SCRIPT',
          resolvedScript.map((step, index) => createCell(step, 'best', `s${index + 1}`)),
        ),
      ],
      createMetrics([
        { label: 'source', value: left },
        { label: 'target', value: right },
        { label: 'distance', value: String(table[rows - 1]?.[columns - 1] ?? 0) },
      ]),
      `Edit script: ${resolvedScript.join(' | ')}`,
      true,
    ),
  )

  return {
    activePresetId: selectedPreset.id,
    algorithmId: 'edit-distance',
    complexityProfile: {
      note: 'The visualizer keeps the full matrix so the chosen operations can be explained and traced back explicitly.',
      space: 'O(m * n)',
      time: 'O(m * n)',
    },
    directionNote: null,
    frames,
    presets: toPresetSummaries(editDistancePresets),
    presetInputs: toPresetInputMap(editDistancePresets, (preset) => ({
      algorithmId: 'edit-distance',
      left: preset.left,
      right: preset.right,
    })),
    pseudocodeLines,
    recurrence: 'dp[i][j] = min(delete, insert, substitute), with zero-cost diagonal carry on matches',
    subtitle:
      'A full edit matrix that compares delete, insert, and substitute choices at every cell before tracing the final edit script.',
    title: dynamicProgrammingDirectoryLabelByAlgorithm['edit-distance'],
  }
}

const buildMaximumSubarrayPanels = (
  values: readonly number[],
  bestEndingHere: readonly (number | null)[],
  activeIndex: number | null,
  currentRange: Readonly<{ start: number; end: number }> | null,
  bestRange: Readonly<{ start: number; end: number }> | null,
): readonly DynamicProgrammingPanel[] => [
  createArrayPanel(
    'INPUT ARRAY',
    values.map((value, index) => {
      const isBest = bestRange !== null && index >= bestRange.start && index <= bestRange.end
      const isCurrent =
        currentRange !== null && index >= currentRange.start && index <= currentRange.end
      const tone = isBest ? 'best' : activeIndex === index ? 'active' : isCurrent ? 'path' : 'default'
      return createCell(value, tone, `a[${index}]`)
    }),
  ),
  createArrayPanel(
    'BEST ENDING HERE',
    bestEndingHere.map((value, index) =>
      createCell(
        formatNullableNumber(value),
        activeIndex === index
          ? 'active'
          : bestRange !== null && index === bestRange.end
            ? 'best'
            : 'default',
        `dp[${index}]`,
      ),
    ),
  ),
]

const buildMaximumSubarrayTimeline = (
  requestedPresetId?: string,
  customInput?: DynamicProgrammingInput | null,
): DynamicProgrammingTimeline => {
  const selectedPreset = selectPreset(maximumSubarrayPresets, requestedPresetId)
  const values =
    customInput?.algorithmId === 'maximum-subarray'
      ? [...customInput.values]
      : [...selectedPreset.values]
  const bestEndingHere: (number | null)[] = Array.from({ length: values.length }, () => null)
  const frames: DynamicProgrammingFrame[] = []

  const pseudocodeLines: readonly DynamicProgrammingPseudocodeLine[] = [
    { lineNumber: 1, text: "DP'[0] = 0" },
    { lineNumber: 2, text: 'for j = 1 to n do' },
    { lineNumber: 3, text: "    if DP'[j - 1] > 0 then" },
    { lineNumber: 4, text: "        DP'[j] = DP'[j - 1] + a[j]" },
    { lineNumber: 5, text: "    else DP'[j] = a[j]" },
    { lineNumber: 6, text: "answer = max DP'[j]" },
  ]

  bestEndingHere[0] = values[0]
  let currentSum = values[0] ?? 0
  let bestSum = values[0] ?? 0
  let currentRange = { start: 0, end: 0 }
  let bestRange = { start: 0, end: 0 }

  frames.push(
    createFrame(
      [1],
      'Seed the running and global best sums at the first element.',
      'Kadane-style DP tracks the best segment ending at the current index and compares it against the global best.',
      buildMaximumSubarrayPanels(values, bestEndingHere, 0, currentRange, bestRange),
      createMetrics([
        { label: 'current sum', value: String(currentSum) },
        { label: 'best sum', value: String(bestSum) },
        { label: 'best range', value: '[0..0]' },
      ]),
    ),
  )

  for (let index = 1; index < values.length; index += 1) {
    const extend = currentSum + (values[index] ?? 0)
    const restart = values[index] ?? 0

    if (restart > extend) {
      currentSum = restart
      currentRange = { start: index, end: index }
    } else {
      currentSum = extend
      currentRange = { start: currentRange.start, end: index }
    }

    bestEndingHere[index] = currentSum

    if (currentSum > bestSum) {
      bestSum = currentSum
      bestRange = { ...currentRange }
    }

    frames.push(
      createFrame(
        [2, restart > extend ? 5 : 3, restart > extend ? 5 : 4, 6],
        `Compare extending the current segment with restarting at a[${index}].`,
        restart > extend
          ? 'Restarting here is stronger than carrying the previous sum forward.'
          : 'Extending the running segment keeps a better total than restarting at this cell.',
        buildMaximumSubarrayPanels(values, bestEndingHere, index, currentRange, bestRange),
        createMetrics([
          { label: 'index', value: String(index) },
          { label: 'extend', value: String(extend) },
          { label: 'restart', value: String(restart) },
          { label: 'current sum', value: String(currentSum) },
          { label: 'best sum', value: String(bestSum) },
        ]),
      ),
    )
  }

  const bestSegment = values.slice(bestRange.start, bestRange.end + 1)

  frames.push(
    createFrame(
      [6],
      'Read the global best segment from the stored running answers.',
      'The best range is the segment that achieved the largest best-ending-here value during the sweep.',
      buildMaximumSubarrayPanels(values, bestEndingHere, null, currentRange, bestRange),
      createMetrics([
        { label: 'best sum', value: String(bestSum) },
        { label: 'best range', value: `[${bestRange.start}..${bestRange.end}]` },
        { label: 'segment length', value: String(bestSegment.length) },
      ]),
      `Best segment: [${bestSegment.join(', ')}]`,
      true,
    ),
  )

  return {
    activePresetId: selectedPreset.id,
    algorithmId: 'maximum-subarray',
    complexityProfile: {
      note: 'The mathematical recurrence is O(1) space, but the workbench stores the sweep history for replay.',
      space: 'O(1) algorithm / O(n) visual history',
      time: 'O(n)',
    },
    directionNote: null,
    frames,
    presets: toPresetSummaries(maximumSubarrayPresets),
    presetInputs: toPresetInputMap(maximumSubarrayPresets, (preset) => ({
      algorithmId: 'maximum-subarray',
      values: preset.values,
    })),
    pseudocodeLines,
    recurrence: 'bestEndingHere[i] = max(a[i], a[i] + bestEndingHere[i - 1])',
    subtitle:
      'A compact linear DP that chooses at every index between extending the current segment or restarting from the current value.',
    title: dynamicProgrammingDirectoryLabelByAlgorithm['maximum-subarray'],
  }
}

const buildDynamicProgrammingTimeline = (
  algorithmId: DynamicProgrammingAlgorithmId,
  requestedPresetId?: string,
  customInput?: DynamicProgrammingInput | null,
): DynamicProgrammingTimeline => {
  switch (algorithmId) {
    case 'salesman-house':
      return buildSalesmanHouseTimeline(requestedPresetId, customInput)
    case 'maze':
      return buildMazeTimeline(requestedPresetId, customInput)
    case 'longest-increasing-subsequence':
      return buildLongestIncreasingSubsequenceTimeline(requestedPresetId, customInput)
    case 'longest-common-subsequence':
      return buildLongestCommonSubsequenceTimeline(requestedPresetId, customInput)
    case 'edit-distance':
      return buildEditDistanceTimeline(requestedPresetId, customInput)
    case 'maximum-subarray':
      return buildMaximumSubarrayTimeline(requestedPresetId, customInput)
  }
}

export { buildDynamicProgrammingTimeline, dynamicProgrammingDirectoryLabelByAlgorithm }
