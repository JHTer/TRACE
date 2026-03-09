import type {
  CardItem,
  LaneStep,
  StabilityLaneId,
  StabilitySnapshot,
  StabilitySnapshotGroup,
} from '../../domain/algorithms/types.ts'

type StabilityTimeline = Readonly<{
  initialCards: readonly CardItem[]
  insertionSteps: readonly LaneStep[]
  selectionSteps: readonly LaneStep[]
  stepCount: number
}>

const rankOrder: Record<string, number> = {
  A: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
}

const getRankValue = (rankKey: string) => rankOrder[rankKey] ?? Number.POSITIVE_INFINITY

const compareCardsByRank = (left: CardItem, right: CardItem) =>
  getRankValue(left.rankKey) - getRankValue(right.rankKey)

const cloneCards = (cards: readonly CardItem[]): readonly CardItem[] => [...cards]

const createStep = (
  cards: readonly CardItem[],
  activeIndices: readonly number[],
  operationText: string,
): LaneStep => ({
  cards: cloneCards(cards),
  activeIndices,
  operationText,
})

const buildInsertionSteps = (initialCards: readonly CardItem[]): readonly LaneStep[] => {
  const cards = [...initialCards]
  const steps: LaneStep[] = [
    createStep(cards, [], 'initial sequence loaded'),
  ]

  for (let i = 1; i < cards.length; i += 1) {
    const keyCard = cards[i]

    if (keyCard === undefined) {
      continue
    }

    let keyIndex = i
    let hasShift = false

    while (keyIndex > 0) {
      const leftIndex = keyIndex - 1
      const leftCard = cards[leftIndex]
      const rightCard = cards[keyIndex]

      if (leftCard === undefined || rightCard === undefined) {
        break
      }

      if (compareCardsByRank(leftCard, rightCard) <= 0) {
        break
      }

      cards[leftIndex] = rightCard
      cards[keyIndex] = leftCard
      hasShift = true
      steps.push(
        createStep(
          cards,
          [leftIndex, keyIndex],
          `shift key=${keyCard.rankKey} from i=${keyIndex} to i=${leftIndex}`,
        ),
      )
      keyIndex -= 1
    }

    steps.push(
      createStep(
        cards,
        [keyIndex],
        hasShift
          ? `insert key=${keyCard.rankKey} at i=${keyIndex}`
          : `keep key=${keyCard.rankKey} at i=${keyIndex}`,
      ),
    )
  }

  return steps
}

const buildSelectionSteps = (initialCards: readonly CardItem[]): readonly LaneStep[] => {
  const cards = [...initialCards]
  const steps: LaneStep[] = [
    createStep(cards, [], 'initial sequence loaded'),
  ]

  for (let i = 0; i < cards.length - 1; i += 1) {
    let minIndex = i

    for (let j = i + 1; j < cards.length; j += 1) {
      const minCard = cards[minIndex]
      const candidateCard = cards[j]

      if (minCard === undefined || candidateCard === undefined) {
        continue
      }

      if (compareCardsByRank(candidateCard, minCard) < 0) {
        minIndex = j
        steps.push(
          createStep(cards, [i, j], `min update: min@${minIndex} while scanning i=${i}`),
        )
      }
    }

    if (minIndex !== i) {
      const currentCard = cards[i]
      const minCard = cards[minIndex]

      if (currentCard !== undefined && minCard !== undefined) {
        cards[i] = minCard
        cards[minIndex] = currentCard
      }

      steps.push(createStep(cards, [i, minIndex], `swap min@${minIndex} with i=${i}`))
    } else {
      steps.push(createStep(cards, [i], `keep i=${i}; min already fixed`))
    }
  }

  return steps
}

const createStabilityTimeline = (cards: readonly CardItem[]): StabilityTimeline => {
  const initialCards = cloneCards(cards)
  const insertionSteps = buildInsertionSteps(initialCards)
  const selectionSteps = buildSelectionSteps(initialCards)

  return {
    initialCards,
    insertionSteps,
    selectionSteps,
    stepCount: Math.max(insertionSteps.length, selectionSteps.length),
  }
}

const getLaneStepAt = (steps: readonly LaneStep[], stepIndex: number): LaneStep => {
  const clampedIndex = Math.max(0, Math.min(stepIndex, steps.length - 1))
  return (
    steps[clampedIndex] ??
    createStep([], [], 'no step')
  )
}

const getDuplicateRankKeys = (cards: readonly CardItem[]): readonly string[] => {
  const rankFrequency = cards.reduce<Record<string, number>>((accumulator, card) => {
    const currentCount = accumulator[card.rankKey] ?? 0
    return {
      ...accumulator,
      [card.rankKey]: currentCount + 1,
    }
  }, {})

  return Object.keys(rankFrequency)
    .filter((rankKey) => (rankFrequency[rankKey] ?? 0) > 1)
    .sort((left, right) => getRankValue(left) - getRankValue(right))
}

const getOrderForRankKey = (cards: readonly CardItem[], rankKey: string): readonly string[] =>
  cards
    .filter((card) => card.rankKey === rankKey)
    .map((card) => card.originTag)

const createStabilitySnapshot = (
  laneId: StabilityLaneId,
  initialCards: readonly CardItem[],
  currentCards: readonly CardItem[],
): StabilitySnapshot => {
  const duplicateRankKeys = getDuplicateRankKeys(initialCards)
  const groups: StabilitySnapshotGroup[] = duplicateRankKeys.map((rankKey) => {
    const initialOrder = getOrderForRankKey(initialCards, rankKey)
    const currentOrder = getOrderForRankKey(currentCards, rankKey)
    const preserved =
      initialOrder.length === currentOrder.length &&
      initialOrder.every((tag, index) => tag === currentOrder[index])

    return {
      rankKey,
      initialOrder,
      currentOrder,
      preserved,
    }
  })

  return {
    laneId,
    groups,
  }
}

export { createStabilitySnapshot, createStabilityTimeline, getLaneStepAt }
export type { StabilityTimeline }
