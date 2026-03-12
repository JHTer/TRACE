import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { buildDynamicProgrammingTimeline } from '../../algorithms/dp/index.ts'
import {
  parseMaze,
  parseNumberCsvForAlgorithm,
  parseStringPair,
} from '../../algorithms/dp/input-parsers.ts'
import type {
  DynamicProgrammingAlgorithmId,
  DynamicProgrammingPanel,
} from '../../domain/algorithms/types.ts'
import { getDynamicProgrammingCellToneClassName } from '../../visualizers/dp/index.ts'

type Topic04View = DynamicProgrammingAlgorithmId

const playbackStepMs = 900
const inputClass =
  'border border-[#E5E5E5] bg-white px-2.5 py-1 font-mono text-[0.84rem] text-[#111111] outline-none transition-colors focus:border-[#111111]'

const toCsv = (values: readonly number[]) => values.join(', ')

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLElement && target.isContentEditable)

const getPseudocodeIndentLevel = (lineText: string) => {
  const leadingWhitespace = lineText.match(/^\s*/)?.[0].length ?? 0
  return Math.floor(leadingWhitespace / 4)
}

function ArrayPanel({ panel }: Readonly<{ panel: Extract<DynamicProgrammingPanel, { kind: 'array' }> }>) {
  return (
    <>
      <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">{panel.title}</div>
      <div
        className="mt-2 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${Math.max(panel.cells.length, 1)}, minmax(0, 1fr))` }}
      >
          {panel.cells.map((cell, index) => (
            <div
              key={`${panel.title}-${cell.label}-${index}`}
              className="space-y-1"
            >
              <div
                className={[
                  'flex h-10 items-center justify-center border font-mono text-[0.86rem] transition-colors',
                  getDynamicProgrammingCellToneClassName(cell.tone),
                ].join(' ')}
              >
                {cell.value}
              </div>
              <div className="text-center font-mono text-[0.65rem] text-[#666666]">
                {cell.label.length > 0 ? cell.label : `[${index}]`}
              </div>
            </div>
          ))}
      </div>
    </>
  )
}

function MatrixPanel({
  panel,
}: Readonly<{
  panel: Extract<DynamicProgrammingPanel, { kind: 'matrix' }>
}>) {
  return (
    <>
      <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">{panel.title}</div>
      <div className="mt-2 overflow-x-auto">
        <div className="min-w-max">
          <div className="flex">
            <div className="w-[54px] shrink-0" />
            {panel.columnLabels.map((label, columnIndex) => (
              <div
                key={`${panel.title}-column-${columnIndex}-${label}`}
                className="w-[62px] shrink-0 px-1 pb-1 text-center font-mono text-[0.72rem] tracking-[0.08em] text-[#666666]"
              >
                {label}
              </div>
            ))}
          </div>

          {panel.rows.map((row, rowIndex) => (
            <div key={`${panel.title}-row-${rowIndex}-${row.label}`} className="flex items-start">
              <div className="w-[54px] shrink-0 px-1 py-2 text-center font-mono text-[0.72rem] tracking-[0.08em] text-[#666666]">
                {row.label}
              </div>
              {row.cells.map((cell, index) => (
                <div
                  key={`${panel.title}-${row.label}-${index}`}
                  className={[
                    'relative mx-[2px] my-[2px] flex h-[54px] w-[58px] shrink-0 items-center justify-center border px-1 font-mono',
                    getDynamicProgrammingCellToneClassName(cell.tone),
                  ].join(' ')}
                >
                  <div className="pointer-events-none absolute left-1 right-1 top-1 min-h-[12px] text-center text-[0.6rem] tracking-[0.08em] opacity-70">
                    {cell.label.length > 0 ? cell.label : '\u00A0'}
                  </div>
                  <div className="flex h-full w-full items-center justify-center text-[0.82rem]">
                    {cell.value}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function RenderPanel({ panel }: Readonly<{ panel: DynamicProgrammingPanel }>) {
  if (panel.kind === 'array') {
    return <ArrayPanel panel={panel} />
  }

  return <MatrixPanel panel={panel} />
}

function Topic04DynamicProgrammingLab({
  algorithmId,
}: Readonly<{
  algorithmId: Topic04View
}>) {
  const baselineTimeline = useMemo(() => buildDynamicProgrammingTimeline(algorithmId), [algorithmId])
  const [selectedPresetId, setSelectedPresetId] = useState(baselineTimeline.activePresetId)
  const [salesmanValuesText, setSalesmanValuesText] = useState(() => {
    const presetInput = baselineTimeline.presetInputs[baselineTimeline.activePresetId]
    return presetInput?.algorithmId === 'salesman-house' ? toCsv(presetInput.values) : ''
  })
  const [mazeSizeText, setMazeSizeText] = useState(() => {
    const presetInput = baselineTimeline.presetInputs[baselineTimeline.activePresetId]
    return presetInput?.algorithmId === 'maze' ? String(presetInput.size) : '5'
  })
  const [mazeBlockedKeys, setMazeBlockedKeys] = useState<Set<string>>(() => {
    const presetInput = baselineTimeline.presetInputs[baselineTimeline.activePresetId]
    if (presetInput?.algorithmId === 'maze') {
      return new Set(presetInput.blockedCells.map((cell) => `${cell.rowIndex}:${cell.columnIndex}`))
    }
    return new Set<string>()
  })
  const [lisValuesText, setLisValuesText] = useState(() => {
    const presetInput = baselineTimeline.presetInputs[baselineTimeline.activePresetId]
    return presetInput?.algorithmId === 'longest-increasing-subsequence' ? toCsv(presetInput.values) : ''
  })
  const [lcsLeftText, setLcsLeftText] = useState(() => {
    const presetInput = baselineTimeline.presetInputs[baselineTimeline.activePresetId]
    return presetInput?.algorithmId === 'longest-common-subsequence' ? presetInput.left : ''
  })
  const [lcsRightText, setLcsRightText] = useState(() => {
    const presetInput = baselineTimeline.presetInputs[baselineTimeline.activePresetId]
    return presetInput?.algorithmId === 'longest-common-subsequence' ? presetInput.right : ''
  })
  const [editLeftText, setEditLeftText] = useState(() => {
    const presetInput = baselineTimeline.presetInputs[baselineTimeline.activePresetId]
    return presetInput?.algorithmId === 'edit-distance' ? presetInput.left : ''
  })
  const [editRightText, setEditRightText] = useState(() => {
    const presetInput = baselineTimeline.presetInputs[baselineTimeline.activePresetId]
    return presetInput?.algorithmId === 'edit-distance' ? presetInput.right : ''
  })
  const [maximumSubarrayText, setMaximumSubarrayText] = useState(() => {
    const presetInput = baselineTimeline.presetInputs[baselineTimeline.activePresetId]
    return presetInput?.algorithmId === 'maximum-subarray' ? toCsv(presetInput.values) : ''
  })
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const applyPresetInput = useCallback(
    (presetId: string) => {
      const presetInput = baselineTimeline.presetInputs[presetId]
      if (presetInput === undefined) {
        return
      }

      if (presetInput.algorithmId === 'salesman-house') {
        setSalesmanValuesText(toCsv(presetInput.values))
      }

      if (presetInput.algorithmId === 'maze') {
        setMazeSizeText(String(presetInput.size))
        setMazeBlockedKeys(
          new Set(presetInput.blockedCells.map((cell) => `${cell.rowIndex}:${cell.columnIndex}`)),
        )
      }

      if (presetInput.algorithmId === 'longest-increasing-subsequence') {
        setLisValuesText(toCsv(presetInput.values))
      }

      if (presetInput.algorithmId === 'longest-common-subsequence') {
        setLcsLeftText(presetInput.left)
        setLcsRightText(presetInput.right)
      }

      if (presetInput.algorithmId === 'edit-distance') {
        setEditLeftText(presetInput.left)
        setEditRightText(presetInput.right)
      }

      if (presetInput.algorithmId === 'maximum-subarray') {
        setMaximumSubarrayText(toCsv(presetInput.values))
      }
    },
    [baselineTimeline.presetInputs],
  )

  useEffect(() => {
    setSelectedPresetId(baselineTimeline.activePresetId)
    applyPresetInput(baselineTimeline.activePresetId)
    setFrameIndex(0)
    setIsPlaying(false)
  }, [applyPresetInput, baselineTimeline.activePresetId, algorithmId])

  const parsedInput = useMemo(() => {
    switch (algorithmId) {
      case 'salesman-house':
        return parseNumberCsvForAlgorithm('salesman-house', salesmanValuesText, { minLength: 2 })
      case 'maze':
        return parseMaze(mazeSizeText, mazeBlockedKeys)
      case 'longest-increasing-subsequence':
        return parseNumberCsvForAlgorithm('longest-increasing-subsequence', lisValuesText, { minLength: 2 })
      case 'longest-common-subsequence':
        return parseStringPair('longest-common-subsequence', lcsLeftText, lcsRightText, { maxLength: 12 })
      case 'edit-distance':
        return parseStringPair('edit-distance', editLeftText, editRightText, { maxLength: 12 })
      case 'maximum-subarray':
        return parseNumberCsvForAlgorithm('maximum-subarray', maximumSubarrayText, { minLength: 2 })
    }
  }, [
    algorithmId,
    editLeftText,
    editRightText,
    lcsLeftText,
    lcsRightText,
    lisValuesText,
    mazeBlockedKeys,
    mazeSizeText,
    maximumSubarrayText,
    salesmanValuesText,
  ])

  const requestedPresetId =
    selectedPresetId === 'custom' ? baselineTimeline.activePresetId : selectedPresetId

  const timeline = useMemo(
    () => buildDynamicProgrammingTimeline(algorithmId, requestedPresetId, parsedInput?.input ?? null),
    [algorithmId, parsedInput?.input, requestedPresetId],
  )

  useEffect(() => {
    setFrameIndex(0)
    setIsPlaying(false)
  }, [selectedPresetId])

  useEffect(() => {
    if (selectedPresetId === 'custom') {
      return
    }
    applyPresetInput(selectedPresetId)
  }, [applyPresetInput, selectedPresetId])

  const validationErrors = parsedInput?.errors ?? []
  const hasValidationError = validationErrors.length > 0

  useEffect(() => {
    if (hasValidationError) {
      setIsPlaying(false)
    }
  }, [hasValidationError])

  const lastFrameIndex = timeline.frames.length - 1
  const boundedFrameIndex = Math.min(frameIndex, Math.max(0, lastFrameIndex))
  const activeFrame = timeline.frames[boundedFrameIndex] ?? timeline.frames[0]
  const activeLineNumber =
    activeFrame.executedLines[activeFrame.executedLines.length - 1] ?? null
  const highlightedLineNumbers = useMemo(
    () => new Set<number>(activeFrame.executedLines),
    [activeFrame.executedLines],
  )
  const pseudocodeContainerRef = useRef<HTMLDivElement | null>(null)
  const [pseudocodeFontPx, setPseudocodeFontPx] = useState(12)
  const [pseudocodeIndentPx, setPseudocodeIndentPx] = useState(6)

  useLayoutEffect(() => {
    const containerNode = pseudocodeContainerRef.current
    if (containerNode === null) {
      return
    }

    const estimateAndSetSizing = () => {
      const containerWidth = containerNode.clientWidth
      if (containerWidth <= 0) {
        return
      }

      const maxVisualUnits = timeline.pseudocodeLines.reduce((currentMax, line) => {
        const indentLevel = getPseudocodeIndentLevel(line.text)
        const trimmedLength = line.text.trimStart().length
        // Each indent level should cost less than full 4 spaces visually.
        const weightedLength = trimmedLength + indentLevel * 1.6
        return Math.max(currentMax, weightedLength)
      }, 1)

      // Account for line number column and row paddings.
      const availableTextWidth = Math.max(120, containerWidth - 52)
      const estimatedCharWidthAt12Px = 7.2
      const rawFontPx = availableTextWidth / (maxVisualUnits * (estimatedCharWidthAt12Px / 12))
      const nextFontPx = Math.min(12, Math.max(8, rawFontPx))
      const nextIndentPx = Math.max(3, Math.round(nextFontPx * 0.52))

      setPseudocodeFontPx(nextFontPx)
      setPseudocodeIndentPx(nextIndentPx)
    }

    estimateAndSetSizing()

    const resizeObserver = new ResizeObserver(() => {
      estimateAndSetSizing()
    })
    resizeObserver.observe(containerNode)

    return () => {
      resizeObserver.disconnect()
    }
  }, [timeline.pseudocodeLines])

  const goToPreviousStep = () => {
    setIsPlaying(false)
    setFrameIndex((current) => Math.max(0, current - 1))
  }

  const goToNextStep = () => {
    if (hasValidationError) {
      return
    }
    setFrameIndex((current) => Math.min(lastFrameIndex, current + 1))
  }

  const resetPlayback = () => {
    setIsPlaying(false)
    setFrameIndex(0)
  }

  const activateCustomMode = () => {
    setSelectedPresetId('custom')
    setIsPlaying(false)
    setFrameIndex(0)
  }

  const togglePlay = () => {
    if (hasValidationError) {
      return
    }
    if (lastFrameIndex <= 0) {
      return
    }

    if (boundedFrameIndex >= lastFrameIndex) {
      setFrameIndex(0)
      setIsPlaying(true)
      return
    }

    setIsPlaying((current) => !current)
  }

  useEffect(() => {
    if (hasValidationError) {
      return
    }
    if (!isPlaying) {
      return
    }

    if (boundedFrameIndex >= lastFrameIndex) {
      setIsPlaying(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setFrameIndex((current) => {
        if (current >= lastFrameIndex) {
          return current
        }

        return current + 1
      })
    }, playbackStepMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [boundedFrameIndex, hasValidationError, isPlaying, lastFrameIndex])

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
        if (hasValidationError) {
          return
        }
        event.preventDefault()
        goToNextStep()
      }

      if (event.key === ' ' || event.code === 'Space') {
        if (hasValidationError) {
          return
        }
        event.preventDefault()
        togglePlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [boundedFrameIndex, hasValidationError, lastFrameIndex, isPlaying])

  const renderCustomDatasetControls = () => {
    if (algorithmId === 'salesman-house') {
      return (
        <div className="space-y-2">
          <label className="font-mono text-[0.78rem] tracking-[0.08em] text-[#666666]">
            House values (comma or space separated)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className={inputClass}
              onChange={(event) => {
                activateCustomMode()
                setSalesmanValuesText(event.target.value)
              }}
              placeholder="e.g. 5, 1, 9, 4, 10"
              value={salesmanValuesText}
            />
            <button
              className="border border-[#E5E5E5] bg-white px-2.5 py-1 font-mono text-[0.8rem] text-[#111111] transition-colors hover:border-[#111111]"
              onClick={() => {
                activateCustomMode()
                const tokenCount = salesmanValuesText.split(/[\s,]+/).filter((token) => token.length > 0).length
                const fallbackLength = 10
                const length = clamp(tokenCount || fallbackLength, 2, 20)
                const randomValues = Array.from({ length }, () => Math.floor(Math.random() * 99) + 1)
                setSalesmanValuesText(toCsv(randomValues))
              }}
              type="button"
            >
              Random
            </button>
          </div>
        </div>
      )
    }

    if (algorithmId === 'maze') {
      const sizeNumber = Number(mazeSizeText)
      const parsedSize = Number.isFinite(sizeNumber) ? clamp(Math.round(sizeNumber), 3, 8) : 5
      const rows = Array.from({ length: parsedSize }, (_, index) => index)
      const columns = rows

      const toggleBlocked = (rowIndex: number, columnIndex: number) => {
        if ((rowIndex === 0 && columnIndex === 0) || (rowIndex === parsedSize - 1 && columnIndex === parsedSize - 1)) {
          return
        }
        activateCustomMode()
        setMazeBlockedKeys((current) => {
          const next = new Set(current)
          const key = `${rowIndex}:${columnIndex}`
          if (next.has(key)) {
            next.delete(key)
          } else {
            next.add(key)
          }
          return next
        })
      }

      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="font-mono text-[0.78rem] tracking-[0.08em] text-[#666666]">Grid size (3-8)</label>
            <input
              className={inputClass}
              inputMode="numeric"
              min={3}
              max={8}
              onChange={(event) => {
                activateCustomMode()
                setMazeSizeText(event.target.value)
              }}
              type="number"
              value={mazeSizeText}
            />
          </div>
          <div className="space-y-1">
            {rows.map((rowIndex) => (
              <div key={`maze-row-${rowIndex}`} className="flex gap-1">
                {columns.map((columnIndex) => {
                  const key = `${rowIndex}:${columnIndex}`
                  const isBlocked = mazeBlockedKeys.has(key)
                  const isStart = rowIndex === 0 && columnIndex === 0
                  const isTarget = rowIndex === parsedSize - 1 && columnIndex === parsedSize - 1
                  const label = isStart ? 'S' : isTarget ? 'T' : isBlocked ? 'X' : '·'
                  const toneClass = isStart || isTarget ? 'bg-[#111111] text-[#FAFAFA]' : isBlocked ? 'bg-[#E5E5E5]' : 'bg-white'
                  return (
                    <button
                      key={key}
                      className={[
                        'h-8 w-8 border border-[#E5E5E5] text-[0.78rem] font-mono transition-colors',
                        toneClass,
                        isStart || isTarget ? 'cursor-not-allowed' : 'hover:border-[#111111]',
                      ].join(' ')}
                      disabled={isStart || isTarget}
                      onClick={() => toggleBlocked(rowIndex, columnIndex)}
                      type="button"
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (algorithmId === 'longest-increasing-subsequence') {
      return (
        <div className="space-y-2">
          <label className="font-mono text-[0.78rem] tracking-[0.08em] text-[#666666]">
            Input array (comma or space separated)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className={inputClass}
              onChange={(event) => {
                activateCustomMode()
                setLisValuesText(event.target.value)
              }}
              placeholder="e.g. 3, 4, 1, 2, 8, 5"
              value={lisValuesText}
            />
            <button
              className="border border-[#E5E5E5] bg-white px-2.5 py-1 font-mono text-[0.8rem] text-[#111111] transition-colors hover:border-[#111111]"
              onClick={() => {
                activateCustomMode()
                const tokenCount = lisValuesText.split(/[\s,]+/).filter((token) => token.length > 0).length
                const fallbackLength = 12
                const length = clamp(tokenCount || fallbackLength, 2, 20)
                const randomValues = Array.from({ length }, () => Math.floor(Math.random() * 99) + 1)
                setLisValuesText(toCsv(randomValues))
              }}
              type="button"
            >
              Random
            </button>
          </div>
        </div>
      )
    }

    if (algorithmId === 'longest-common-subsequence') {
      return (
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
          <div className="space-y-1">
            <label className="font-mono text-[0.78rem] tracking-[0.08em] text-[#666666]">Left string</label>
            <input
              className={inputClass}
              maxLength={12}
              onChange={(event) => {
                activateCustomMode()
                setLcsLeftText(event.target.value)
              }}
              placeholder="e.g. ABCDA"
              value={lcsLeftText}
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-[0.78rem] tracking-[0.08em] text-[#666666]">Right string</label>
            <input
              className={inputClass}
              maxLength={12}
              onChange={(event) => {
                activateCustomMode()
                setLcsRightText(event.target.value)
              }}
              placeholder="e.g. ACBA"
              value={lcsRightText}
            />
          </div>
        </div>
      )
    }

    if (algorithmId === 'edit-distance') {
      return (
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
          <div className="space-y-1">
            <label className="font-mono text-[0.78rem] tracking-[0.08em] text-[#666666]">Source</label>
            <input
              className={inputClass}
              maxLength={12}
              onChange={(event) => {
                activateCustomMode()
                setEditLeftText(event.target.value)
              }}
              placeholder="e.g. intention"
              value={editLeftText}
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-[0.78rem] tracking-[0.08em] text-[#666666]">Target</label>
            <input
              className={inputClass}
              maxLength={12}
              onChange={(event) => {
                activateCustomMode()
                setEditRightText(event.target.value)
              }}
              placeholder="e.g. execution"
              value={editRightText}
            />
          </div>
        </div>
      )
    }

    if (algorithmId === 'maximum-subarray') {
      return (
        <div className="space-y-2">
          <label className="font-mono text-[0.78rem] tracking-[0.08em] text-[#666666]">
            Input array (comma or space separated)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className={inputClass}
              onChange={(event) => {
                activateCustomMode()
                setMaximumSubarrayText(event.target.value)
              }}
              placeholder="e.g. -2, 1, -3, 4, -1, 2, 1, -5, 4"
              value={maximumSubarrayText}
            />
            <button
              className="border border-[#E5E5E5] bg-white px-2.5 py-1 font-mono text-[0.8rem] text-[#111111] transition-colors hover:border-[#111111]"
              onClick={() => {
                activateCustomMode()
                const tokenCount = maximumSubarrayText.split(/[\s,]+/).filter((token) => token.length > 0).length
                const fallbackLength = 10
                const length = clamp(tokenCount || fallbackLength, 2, 20)
                const randomValues = Array.from(
                  { length },
                  () => Math.floor(Math.random() * 41) - 20,
                )
                setMaximumSubarrayText(toCsv(randomValues))
              }}
              type="button"
            >
              Random
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  if (activeFrame === undefined) {
    return null
  }

  return (
    <section className="mt-4 space-y-2">
      <div className="space-y-2">
        <p className="max-w-[860px] text-[1rem] leading-7 text-[#666666]">{timeline.subtitle}</p>
      </div>

      <section className="border border-[#E5E5E5] bg-white">
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-[0.84rem] text-[#666666]">
              Use <span className="text-[#111111]">←</span> and{' '}
              <span className="text-[#111111]">→</span> to step frames,{' '}
              <span className="text-[#111111]">Space</span> to play or pause.
            </div>
            <div className="font-mono text-[0.82rem] text-[#111111]">
              step: {boundedFrameIndex + 1} / {timeline.frames.length}
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
                'border border-[#111111] px-2.5 py-1 font-mono text-[0.82rem] transition-colors',
                hasValidationError
                  ? 'bg-[#F4F4F4] text-[#999999] cursor-not-allowed'
                  : 'bg-[#111111] text-[#FAFAFA] hover:bg-white hover:text-[#111111]',
              ].join(' ')}
              disabled={hasValidationError}
              onClick={togglePlay}
              type="button"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              className={[
                'border px-2.5 py-1 font-mono text-[0.82rem] transition-colors',
                hasValidationError
                  ? 'border-[#E5E5E5] bg-[#F4F4F4] text-[#999999] cursor-not-allowed'
                  : 'border-[#111111] bg-white text-[#111111] hover:bg-[#111111] hover:text-[#FAFAFA]',
              ].join(' ')}
              disabled={hasValidationError}
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
              Reset
            </button>
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] px-4 py-3">
          <div className="font-mono text-[0.8rem] tracking-[0.08em] text-[#666666]">
            CUSTOM DATASET
          </div>
          <div className="mt-2 space-y-3">
            {renderCustomDatasetControls()}
            {selectedPresetId === 'custom' ? (
              <div className="font-mono text-[0.78rem] text-[#666666]">Custom input active.</div>
            ) : null}
            {hasValidationError ? (
              <div className="rounded border border-[#B42318] bg-[#FFF4F4] px-2 py-1 font-mono text-[0.78rem] text-[#B42318]">
                {validationErrors.join(' ')}
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] px-4 py-3">
          <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">TEXTBOOK RECURRENCE</div>
          <div className="mt-2 text-[0.92rem] leading-6 text-[#111111]">{timeline.recurrence}</div>
          <div className="mt-2 border-t border-[#E5E5E5] px-1 py-2 font-mono text-[0.76rem] text-[#666666]">
            complexity: {timeline.complexityProfile.time} time / {timeline.complexityProfile.space} space
          </div>
          {timeline.directionNote !== null ? (
            <div className="border-t border-[#E5E5E5] px-1 py-2 text-[0.88rem] leading-6 text-[#666666]">
              {timeline.directionNote}
            </div>
          ) : null}
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(340px,38%)]">
          <div className="min-w-0 border-t border-[#E5E5E5] xl:border-r xl:border-t-0 xl:border-[#E5E5E5]">
            {activeFrame.panels.map((panel, index) => (
              <section
                key={`${panel.kind}-${panel.title}`}
                className={index === 0 ? 'px-3 py-2' : 'border-t border-[#E5E5E5] px-3 py-2'}
              >
                <RenderPanel panel={panel} />
              </section>
            ))}
          </div>

          <div className="min-w-0 border-t border-[#E5E5E5] xl:border-t-0">
            <section className="px-4 py-3">
              <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">
                PSEUDOCODE
              </div>
              <div ref={pseudocodeContainerRef} className="mt-2 space-y-1">
                {timeline.pseudocodeLines.map((line) => {
                  const isActive = line.lineNumber === activeLineNumber
                  const isHighlighted = highlightedLineNumbers.has(line.lineNumber)
                  const indentLevel = getPseudocodeIndentLevel(line.text)
                  return (
                    <div
                      key={line.lineNumber}
                      className={[
                        'flex items-start gap-2 border-l-2 px-2 py-1 font-mono leading-5 transition-colors duration-150',
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
                      <span
                        className="min-w-0 whitespace-nowrap"
                        style={{
                          fontSize: `${pseudocodeFontPx}px`,
                          paddingLeft: `${indentLevel * pseudocodeIndentPx}px`,
                        }}
                      >
                        {line.text.trimStart()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="border-t border-[#E5E5E5] px-4 py-3">
              <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">
                EXECUTION LOG
              </div>
              <div className="mt-2 bg-[#FAFAFA] px-3 py-2 font-mono text-[0.8rem] text-[#111111]">
                {activeFrame.operationText}
              </div>
              <div className="mt-2 text-[0.76rem] text-[#666666]">
                <div className="border-t border-[#E5E5E5] px-1 py-1 leading-6">{activeFrame.detailText}</div>
                <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                  complete: {activeFrame.isComplete ? 'yes' : 'no'}
                </div>
                {activeFrame.reconstructionText !== null ? (
                  <div className="border-t border-[#E5E5E5] px-1 py-1 font-mono">
                    {activeFrame.reconstructionText}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="border-t border-[#E5E5E5] px-4 py-3">
              <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">METRICS</div>
              <div className="mt-2">
                {activeFrame.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-start justify-between gap-3 border-t border-[#E5E5E5] px-1 py-1 font-mono text-[0.78rem] text-[#111111]"
                  >
                    <span className="text-[#666666]">{metric.label}</span>
                    <span className="text-right">{metric.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 border-t border-[#E5E5E5] px-1 py-2">
                <div className="font-mono text-[0.74rem] tracking-[0.08em] text-[#666666]">
                  VISUALIZER NOTE
                </div>
                <div className="mt-1 text-[0.88rem] leading-6 text-[#666666]">
                  {timeline.complexityProfile.note}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </section>
  )
}

export { Topic04DynamicProgrammingLab }
export type { Topic04View }
