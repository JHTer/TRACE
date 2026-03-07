type AlgorithmSummary = Readonly<{
  id: string
  label: string
}>

type TopicSummary = Readonly<{
  id: string
  shortLabel: string
  title: string
  summary: string
  algorithms: readonly AlgorithmSummary[]
}>

export type { AlgorithmSummary, TopicSummary }
