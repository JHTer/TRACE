import { useMemo, useState } from 'react'

import type { TopicSummary } from '../../domain/algorithms/types.ts'

type DirectorySelection = Readonly<{
  topicId: string
  algorithmId: string
}>

const createEntryId = (topicId: string, algorithmId: string) =>
  `${topicId}:${algorithmId}`

const defaultSelectedEntry: DirectorySelection = {
  topicId: 'topic-1',
  algorithmId: 'complexity-analysis',
}

const parseEntryId = (entryId: string): DirectorySelection | null => {
  const [topicId, algorithmId] = entryId.split(':')

  if (topicId === undefined || algorithmId === undefined) {
    return null
  }

  return { topicId, algorithmId }
}

function DirectoryTree({
  topics,
  onSelectEntry,
}: {
  topics: readonly TopicSummary[]
  onSelectEntry?: (selection: DirectorySelection) => void
}) {
  const [selectedEntryId, setSelectedEntryId] = useState(
    createEntryId(defaultSelectedEntry.topicId, defaultSelectedEntry.algorithmId),
  )

  const entryIds = useMemo(
    () =>
      topics.flatMap((topic) =>
        topic.algorithms.map((algorithm) => createEntryId(topic.id, algorithm.id)),
      ),
    [topics],
  )

  const selectedIndex = Math.max(entryIds.indexOf(selectedEntryId), 0)

  const updateSelectedEntry = (entryId: string) => {
    setSelectedEntryId(entryId)

    const selection = parseEntryId(entryId)
    if (selection !== null) {
      onSelectEntry?.(selection)
    }
  }

  const selectByOffset = (offset: number) => {
    if (entryIds.length === 0) {
      return
    }

    const nextIndex = (selectedIndex + offset + entryIds.length) % entryIds.length
    const nextEntryId = entryIds[nextIndex] ?? entryIds[0]
    if (nextEntryId !== undefined) {
      updateSelectedEntry(nextEntryId)
    }
  }

  return (
    <div
      aria-label="Topic directory"
      className="outline-none"
      role="tree"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          selectByOffset(1)
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault()
          selectByOffset(-1)
        }
      }}
    >
      {topics.map((topic) => (
        <section key={topic.id} className="mb-8">
          <h2 className="font-mono text-[1rem] tracking-[-0.02em] text-[#111111] sm:text-[1.05rem]">
            {topic.shortLabel} {topic.title}
          </h2>
          <p className="mt-1 max-w-[720px] text-[0.92rem] leading-6 text-[#666666]">
            {topic.summary}
          </p>
          <div className="mt-3 space-y-1">
            {topic.algorithms.map((algorithm) => {
              const entryId = createEntryId(topic.id, algorithm.id)
              const isSelected = entryId === selectedEntryId

              return (
                <button
                  key={algorithm.id}
                  className={[
                    'block w-full max-w-[720px] border-0 px-4 py-0.5 text-left font-mono text-[0.98rem] outline-none transition-colors',
                    isSelected ? 'bg-[#111111] text-[#FAFAFA]' : 'bg-transparent text-[#111111] hover:bg-[#111111] hover:text-[#FAFAFA]',
                  ].join(' ')}
                  onClick={() => updateSelectedEntry(entryId)}
                  onFocus={() => updateSelectedEntry(entryId)}
                  onMouseEnter={() => updateSelectedEntry(entryId)}
                  type="button"
                >
                  <span className="inline-block min-w-[1.5rem]">
                    {isSelected ? '>' : '->'}
                  </span>
                  <span>{algorithm.label}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export { DirectoryTree }
export type { DirectorySelection }
