import { useEffect, useMemo, useRef, useState } from 'react'

import type { DirectorySelection } from '../index/DirectoryTree.tsx'
import type { TopicSummary } from '../../domain/algorithms/types.ts'

type CommandPaletteItem = Readonly<{
  id: string
  selection: DirectorySelection
  label: string
  topicId: string
  topicLabel: string
  topicTitle: string
  summary: string
  searchText: string
}>

type CommandPaletteGroup = Readonly<{
  topicId: string
  topicLabel: string
  topicTitle: string
  items: readonly CommandPaletteItem[]
}>

const algorithmAliasMap: Readonly<Record<string, readonly string[]>> = {
  'breadth-first-search': ['bfs', 'queue'],
  'depth-first-search': ['dfs', 'stack', 'recursion'],
  'connected-components': ['components', 'cc'],
  'topological-sorting': ['topological sort', 'toposort', 'dag'],
  'dijkstra-algorithm': ['dijkstra', 'shortest path'],
  'bellman-ford-algorithm': ['bellman ford', 'negative weights'],
  'floyd-warshall-algorithm': ['floyd warshall', 'all pairs'],
  'counting-sort': ['counting'],
  'radix-sort': ['radix'],
  quicksort: ['partition'],
  quickselect: ['selection'],
  'median-of-medians': ['pivot'],
  'salesman-house': ['dp', 'house robber', 'take skip', 'adjacent houses'],
  maze: ['dp', 'grid', 'path', 'target to start'],
  'longest-increasing-subsequence': ['dp', 'lis', 'sequence'],
  'longest-common-subsequence': ['dp', 'lcs', 'sequence match'],
  'edit-distance': ['dp', 'levenshtein', 'string edits'],
  'maximum-subarray': ['dp', 'kadane', 'max subarray', 'best segment'],
  'flow-networks': ['max flow', 'capacity', 'conservation'],
  'residual-graphs': ['residual', 'reverse edges', 'residual network'],
  'augmenting-paths': ['augmenting path', 'bottleneck'],
  'ford-fulkerson-algorithm': ['ford fulkerson', 'max flow', 'augment'],
  'minimum-cut': ['min cut', 'cut'],
  'maximum-flow-minimum-cut-theorem': ['max flow min cut', 'theorem'],
  'bipartite-matching': ['matching', 'bipartite', 'reduction'],
}

const normalizeSearchText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const buildSearchText = (
  topic: TopicSummary,
  algorithm: TopicSummary['algorithms'][number],
) =>
  normalizeSearchText(
    [
      topic.shortLabel,
      topic.title,
      topic.summary,
      algorithm.id,
      algorithm.label,
      ...(algorithmAliasMap[algorithm.id] ?? []),
    ].join(' '),
  )

const navigationItems: readonly CommandPaletteItem[] = [
  {
    id: 'navigation:home',
    selection: {
      topicId: 'menu',
      algorithmId: 'home',
    },
    label: 'Homepage',
    topicId: 'navigation',
    topicLabel: 'Navigation',
    topicTitle: 'Workspace',
    summary: 'Return to the TRACE main menu.',
    searchText: normalizeSearchText(
      'homepage home menu main menu main directory start return back navigation workspace',
    ),
  },
]

const toCommandPaletteItems = (topics: readonly TopicSummary[]): readonly CommandPaletteItem[] =>
  [
    ...navigationItems,
    ...topics.flatMap((topic) =>
      topic.algorithms.map((algorithm) => ({
        id: `${topic.id}:${algorithm.id}`,
        selection: {
          topicId: topic.id,
          algorithmId: algorithm.id,
        },
        label: algorithm.label,
        topicId: topic.id,
        topicLabel: `Topic ${topic.shortLabel}`,
        topicTitle: topic.title,
        summary: topic.summary,
        searchText: buildSearchText(topic, algorithm),
      })),
    ),
  ]

const scoreCommandPaletteItem = (
  item: CommandPaletteItem,
  normalizedQuery: string,
  queryTokens: readonly string[],
) => {
  if (normalizedQuery.length === 0) {
    return 1
  }

  if (queryTokens.some((token) => !item.searchText.includes(token))) {
    return -1
  }

  const normalizedLabel = normalizeSearchText(item.label)
  const normalizedTopicTitle = normalizeSearchText(item.topicTitle)

  let score = queryTokens.length * 10

  if (normalizedLabel === normalizedQuery) {
    score += 120
  } else if (normalizedLabel.startsWith(normalizedQuery)) {
    score += 80
  } else if (normalizedLabel.includes(normalizedQuery)) {
    score += 50
  }

  if (normalizedTopicTitle.includes(normalizedQuery)) {
    score += 18
  }

  return score
}

function CommandPalette({
  isOpen,
  topics,
  onClose,
  onSelect,
}: Readonly<{
  isOpen: boolean
  topics: readonly TopicSummary[]
  onClose: () => void
  onSelect: (selection: DirectorySelection) => void
}>) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const allItems = useMemo(() => toCommandPaletteItems(topics), [topics])
  const normalizedQuery = useMemo(() => normalizeSearchText(query), [query])
  const queryTokens = useMemo(
    () => normalizedQuery.split(' ').filter((token) => token.length > 0),
    [normalizedQuery],
  )

  const results = useMemo(
    () =>
      [...allItems]
        .map((item) => ({
          item,
          score: scoreCommandPaletteItem(item, normalizedQuery, queryTokens),
        }))
        .filter((entry) => entry.score >= 0)
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score
          }

          return left.item.label.localeCompare(right.item.label)
        })
        .map((entry) => entry.item),
    [allItems, normalizedQuery, queryTokens],
  )

  const groupedResults = useMemo((): readonly CommandPaletteGroup[] => {
    const groupsByTopicId = new Map<string, CommandPaletteGroup>()

    results.forEach((item) => {
      const currentGroup = groupsByTopicId.get(item.topicId)
      if (currentGroup !== undefined) {
        groupsByTopicId.set(item.topicId, {
          ...currentGroup,
          items: [...currentGroup.items, item],
        })
        return
      }

      groupsByTopicId.set(item.topicId, {
        topicId: item.topicId,
        topicLabel: item.topicLabel,
        topicTitle: item.topicTitle,
        items: [item],
      })
    })

    const orderedGroups: CommandPaletteGroup[] = []
    const navigationGroup = groupsByTopicId.get('navigation')

    if (navigationGroup !== undefined) {
      orderedGroups.push(navigationGroup)
    }

    topics.forEach((topic) => {
      const group = groupsByTopicId.get(topic.id)
      if (group !== undefined) {
        orderedGroups.push(group)
      }
    })

    return orderedGroups
  }, [results, topics])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setQuery('')
    setActiveIndex(0)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [isOpen])

  useEffect(() => {
    if (results.length === 0) {
      setActiveIndex(0)
      return
    }

    setActiveIndex((currentIndex) =>
      currentIndex >= results.length ? results.length - 1 : currentIndex,
    )
  }, [results])

  if (!isOpen) {
    return null
  }

  const activeItem = results[activeIndex] ?? null

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[rgba(17,17,17,0.1)] px-4 pt-[14vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
    >
      <div className="mx-auto w-full max-w-[680px] rounded-[8px] bg-[#1E1E1E] text-[#CCCCCC] shadow-[0_20px_40px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between gap-4 px-6 pb-3 pt-5 font-mono text-[0.88rem] text-[#999999]">
          <span>TRACE</span>
          <span>[ Esc to close ]</span>
        </div>

        <div className="px-6 pb-3">
          <label className="flex items-center gap-3 border-b border-[#333333] pb-3 font-mono text-[1rem] text-[#CCCCCC]">
            <span>&gt;</span>
            <input
              ref={inputRef}
              aria-label="Search algorithms or navigation"
              className="w-full bg-transparent text-[1rem] text-[#FAFAFA] outline-none placeholder:text-[#777777]"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  onClose()
                  return
                }

                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setActiveIndex((currentIndex) =>
                    results.length === 0 ? 0 : (currentIndex + 1) % results.length,
                  )
                  return
                }

                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setActiveIndex((currentIndex) =>
                    results.length === 0
                      ? 0
                      : (currentIndex - 1 + results.length) % results.length,
                  )
                  return
                }

                if (event.key === 'Enter' && activeItem !== null) {
                  event.preventDefault()
                  onSelect(activeItem.selection)
                }
              }}
              placeholder="Search: dijkstra, knapsack, home"
              spellCheck={false}
              type="text"
              value={query}
            />
          </label>
        </div>

        <div className="max-h-[58vh] overflow-y-auto px-3 pb-3">
          {groupedResults.length > 0 ? (
            groupedResults.map((group) => (
              <section key={group.topicId} className="pb-2">
                <div className="px-3 py-2 font-mono text-[0.76rem] tracking-[0.1em] text-[#777777]">
                  {group.topicLabel} / {group.topicTitle.toUpperCase()}
                </div>

                {group.items.map((item) => {
                  const itemIndex = results.findIndex((result) => result.id === item.id)
                  const isActive = itemIndex === activeIndex

                  return (
                    <button
                      key={item.id}
                      className={[
                        'flex w-full items-start justify-between gap-4 rounded-[6px] px-3 py-2 text-left transition-colors',
                        isActive ? 'bg-[#2A2D2E]' : 'bg-transparent hover:bg-[#2A2D2E]',
                      ].join(' ')}
                      onClick={() => onSelect(item.selection)}
                      onMouseEnter={() => setActiveIndex(itemIndex)}
                      type="button"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-[1rem] text-[#FAFAFA]">{item.label}</div>
                        <div className="mt-1 text-[0.86rem] leading-5 text-[#999999]">
                          {item.summary}
                        </div>
                      </div>

                      <span className="shrink-0 border border-[#333333] px-2 py-1 font-mono text-[0.72rem] tracking-[0.08em] text-[#CCCCCC]">
                        {item.topicLabel}
                      </span>
                    </button>
                  )
                })}
              </section>
            ))
          ) : (
            <div className="px-3 py-6 font-mono text-[0.88rem] text-[#777777]">
              No matching algorithms.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { CommandPalette }
