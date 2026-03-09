import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  createStabilitySnapshot,
  createStabilityTimeline,
  getLaneStepAt,
} from '../../algorithms/array/stabilityTimeline.ts'
import type {
  CardItem,
  LaneStep,
  StabilityLaneId,
  StabilitySnapshot,
} from '../../domain/algorithms/types.ts'
import { faceSvgByCardCode } from './cardFaces.ts'

type Topic02View = 'stability'

const laneLabels: Record<StabilityLaneId, string> = {
  insertion: 'Lane 1: Insertion Sort (stable)',
  selection: 'Lane 2: Selection Sort (unstable)',
}

const suitCodeBySuit = {
  spades: 'S',
  clubs: 'C',
} as const

const defaultDemoCards: readonly CardItem[] = [
  { id: '5C-A', rankKey: '5', suit: 'clubs', originTag: 'A', initialIndex: 0 },
  { id: '3S-A', rankKey: '3', suit: 'spades', originTag: 'A', initialIndex: 1 },
  { id: '5S-B', rankKey: '5', suit: 'spades', originTag: 'B', initialIndex: 2 },
  { id: 'AC-A', rankKey: 'A', suit: 'clubs', originTag: 'A', initialIndex: 3 },
  { id: '3C-B', rankKey: '3', suit: 'clubs', originTag: 'B', initialIndex: 4 },
  { id: '7S-A', rankKey: '7', suit: 'spades', originTag: 'A', initialIndex: 5 },
  { id: 'AS-B', rankKey: 'A', suit: 'spades', originTag: 'B', initialIndex: 6 },
  { id: '7C-B', rankKey: '7', suit: 'clubs', originTag: 'B', initialIndex: 7 },
]

const toCardCode = (card: CardItem) => `${card.rankKey}${suitCodeBySuit[card.suit]}`

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLElement && target.isContentEditable)

function TimelineControls({
  currentStep,
  lastStep,
  isPlaying,
  onPrevious,
  onTogglePlay,
  onNext,
  onReset,
}: Readonly<{
  currentStep: number
  lastStep: number
  isPlaying: boolean
  onPrevious: () => void
  onTogglePlay: () => void
  onNext: () => void
  onReset: () => void
}>) {
  return (
    <div className="border border-[#E5E5E5] bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[0.86rem] text-[#666666]">
          Use <span className="text-[#111111]">←</span> and{' '}
          <span className="text-[#111111]">→</span> to step,{' '}
          <span className="text-[#111111]">Space</span> to play/pause.
        </div>
        <div className="font-mono text-[0.86rem] text-[#111111]">
          t = {currentStep} / {lastStep}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="border border-[#111111] bg-white px-3 py-1.5 font-mono text-[0.85rem] text-[#111111] transition-colors hover:bg-[#111111] hover:text-[#FAFAFA]"
          onClick={onPrevious}
          type="button"
        >
          Previous
        </button>
        <button
          className="border border-[#111111] bg-[#111111] px-3 py-1.5 font-mono text-[0.85rem] text-[#FAFAFA] transition-colors hover:bg-white hover:text-[#111111]"
          onClick={onTogglePlay}
          type="button"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          className="border border-[#111111] bg-white px-3 py-1.5 font-mono text-[0.85rem] text-[#111111] transition-colors hover:bg-[#111111] hover:text-[#FAFAFA]"
          onClick={onNext}
          type="button"
        >
          Next
        </button>
        <button
          className="border border-[#E5E5E5] bg-white px-3 py-1.5 font-mono text-[0.85rem] text-[#111111] transition-colors hover:border-[#111111]"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function PlayingCard({
  card,
  isActive,
}: Readonly<{
  card: CardItem
  isActive: boolean
}>) {
  const cardCode = toCardCode(card)
  const faceSource = faceSvgByCardCode[cardCode] ?? faceSvgByCardCode.AS

  return (
    <div className="w-[58px] shrink-0 sm:w-[68px]">
      <div
        className={[
          'relative overflow-hidden rounded-[5px] bg-white',
          isActive ? 'outline outline-2 outline-[#111111]' : 'outline outline-1 outline-[#E5E5E5]',
        ].join(' ')}
      >
        <img alt={`${card.rankKey} of ${card.suit}`} className="block h-auto w-full" src={faceSource} />
      </div>
    </div>
  )
}

function LanePanel({
  laneId,
  step,
}: Readonly<{
  laneId: StabilityLaneId
  step: LaneStep
}>) {
  const activeIndices = new Set(step.activeIndices)
  const cardNodeByIdRef = useRef<Record<string, HTMLDivElement | null>>({})
  const previousRectByIdRef = useRef<Record<string, DOMRect>>({})

  useLayoutEffect(() => {
    const nextRectById: Record<string, DOMRect> = {}

    step.cards.forEach((card) => {
      const node = cardNodeByIdRef.current[card.id]
      if (node !== null && node !== undefined) {
        nextRectById[card.id] = node.getBoundingClientRect()
      }
    })

    step.cards.forEach((card) => {
      const node = cardNodeByIdRef.current[card.id]
      const previousRect = previousRectByIdRef.current[card.id]
      const nextRect = nextRectById[card.id]

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
        node.style.transition = 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)'
        node.style.transform = 'translate(0, 0)'
      })
    })

    const cleanupTimeoutId = window.setTimeout(() => {
      step.cards.forEach((card) => {
        const node = cardNodeByIdRef.current[card.id]
        if (node !== null && node !== undefined) {
          node.style.transition = ''
          node.style.transform = ''
          node.style.willChange = ''
          node.style.zIndex = ''
        }
      })
    }, 320)

    previousRectByIdRef.current = nextRectById

    return () => window.clearTimeout(cleanupTimeoutId)
  }, [step.cards])

  return (
    <section className="min-w-0 border border-[#E5E5E5] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-mono text-[0.94rem] text-[#111111]">{laneLabels[laneId]}</h3>
        <span className="font-mono text-[0.78rem] tracking-[0.06em] text-[#666666]">
          {laneId === 'insertion' ? '[stable]' : '[unstable]'}
        </span>
      </div>

      <div className="mt-3 border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 font-mono text-[0.82rem] text-[#111111]">
        op: {step.operationText}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
        {step.cards.map((card, index) => (
          <div
            key={card.id}
            ref={(node) => {
              cardNodeByIdRef.current[card.id] = node
            }}
          >
            <PlayingCard card={card} isActive={activeIndices.has(index)} />
          </div>
        ))}
      </div>
    </section>
  )
}

const renderOrder = (order: readonly string[]) =>
  order.length === 0 ? '[]' : `[${order.join(' > ')}]`

function LedgerLane({
  title,
  snapshot,
}: Readonly<{
  title: string
  snapshot: StabilitySnapshot
}>) {
  return (
    <section className="min-w-0 border border-[#E5E5E5] bg-white p-4">
      <h3 className="font-mono text-[0.92rem] text-[#111111]">{title}</h3>
      <div className="mt-3 space-y-2">
        {snapshot.groups.map((group) => (
          <div
            key={`${snapshot.laneId}-${group.rankKey}`}
            className={[
              'border border-[#111111] bg-[#FAFAFA] px-3 py-2 font-mono text-[0.8rem] text-[#111111]',
              group.preserved ? 'border-solid' : 'border-dashed',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-2">
              <span>key={group.rankKey}</span>
              <span>{group.preserved ? '[ok]' : '[x]'}</span>
            </div>
            <div className="mt-1 text-[#666666]">
              initial order: {renderOrder(group.initialOrder)}
            </div>
            <div className="text-[#666666]">current order: {renderOrder(group.currentOrder)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Topic02StabilityLab() {
  const timeline = useMemo(
    () => createStabilityTimeline(defaultDemoCards),
    [],
  )
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const lastStepIndex = Math.max(0, timeline.stepCount - 1)

  const insertionStep = getLaneStepAt(timeline.insertionSteps, stepIndex)
  const selectionStep = getLaneStepAt(timeline.selectionSteps, stepIndex)

  const insertionSnapshot = useMemo(
    () => createStabilitySnapshot('insertion', timeline.initialCards, insertionStep.cards),
    [insertionStep.cards, timeline.initialCards],
  )
  const selectionSnapshot = useMemo(
    () => createStabilitySnapshot('selection', timeline.initialCards, selectionStep.cards),
    [selectionStep.cards, timeline.initialCards],
  )

  const goToPreviousStep = () => {
    setIsPlaying(false)
    setStepIndex((currentStep) => Math.max(0, currentStep - 1))
  }

  const goToNextStep = () => {
    setIsPlaying(false)
    setStepIndex((currentStep) => Math.min(lastStepIndex, currentStep + 1))
  }

  const resetTimeline = () => {
    setIsPlaying(false)
    setStepIndex(0)
  }

  const togglePlay = () => {
    setIsPlaying((currentState) => {
      if (currentState) {
        return false
      }

      if (stepIndex >= lastStepIndex) {
        setStepIndex(0)
      }

      return true
    })
  }

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    if (stepIndex >= lastStepIndex) {
      setIsPlaying(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setStepIndex((currentStep) => Math.min(lastStepIndex, currentStep + 1))
    }, 850)

    return () => window.clearTimeout(timeoutId)
  }, [isPlaying, lastStepIndex, stepIndex])

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
        setIsPlaying(false)
        setStepIndex((currentStep) => Math.max(0, currentStep - 1))
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setIsPlaying(false)
        setStepIndex((currentStep) => Math.min(lastStepIndex, currentStep + 1))
      }

      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault()
        setIsPlaying((currentState) => {
          if (currentState) {
            return false
          }

          if (stepIndex >= lastStepIndex) {
            setStepIndex(0)
          }

          return true
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lastStepIndex, stepIndex])

  return (
    <section className="mt-4 space-y-6">
      <div className="space-y-3">
        <div className="font-mono text-[0.86rem] tracking-[0.16em] text-[#666666]">
          TRACE / CONTENT / STABILITY / INSERTION VS SELECTION
        </div>
        <p className="max-w-[820px] text-[1rem] leading-7 text-[#666666]">
          Two lanes consume the same 8-card input and step together on a shared timeline.
          Insertion Sort preserves duplicate-key order; Selection Sort can break it when a
          minimum swap jumps across equal keys.
        </p>
      </div>

      <TimelineControls
        currentStep={stepIndex}
        isPlaying={isPlaying}
        lastStep={lastStepIndex}
        onNext={goToNextStep}
        onPrevious={goToPreviousStep}
        onReset={resetTimeline}
        onTogglePlay={togglePlay}
      />

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <LanePanel laneId="insertion" step={insertionStep} />
        <LanePanel laneId="selection" step={selectionStep} />
      </div>

      <section className="space-y-3">
        <h3 className="font-mono text-[0.95rem] text-[#111111]">Stability Ledger</h3>
        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <LedgerLane title="Insertion Lane Ledger" snapshot={insertionSnapshot} />
          <LedgerLane title="Selection Lane Ledger" snapshot={selectionSnapshot} />
        </div>
      </section>
    </section>
  )
}

export { Topic02StabilityLab }
export type { Topic02View }
