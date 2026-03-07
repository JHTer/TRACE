import { useMemo, useState } from 'react'

import type { TopicSummary } from '../../domain/algorithms/types.ts'

type SelectedEntry = Readonly<{
  topicId: string
  algorithmId: string
}>

const createEntryId = (topicId: string, algorithmId: string) =>
  `${topicId}:${algorithmId}`

const defaultSelectedEntry: SelectedEntry = {
  topicId: 'topic-4',
  algorithmId: 'dijkstra',
}

function DirectoryTree({ topics }: { topics: readonly TopicSummary[] }) {
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

  const selectByOffset = (offset: number) => {
    if (entryIds.length === 0) {
      return
    }

    const nextIndex = (selectedIndex + offset + entryIds.length) % entryIds.length
    setSelectedEntryId(entryIds[nextIndex] ?? entryIds[0] ?? '')
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
        <section key={topic.id} className="mb-7">
          <h2 className="text-[1.15rem] font-semibold tracking-[-0.035em] text-[#111111] sm:text-[1.25rem]">
            {topic.shortLabel}: {topic.title}
          </h2>
          <div className="mt-2 space-y-1">
            {topic.algorithms.map((algorithm) => {
              const entryId = createEntryId(topic.id, algorithm.id)
              const isSelected = entryId === selectedEntryId

              return (
                <button
                  key={algorithm.id}
                  className={[
                    'block w-full max-w-[640px] border-0 px-6 py-0.5 text-left font-mono text-[1.05rem] outline-none transition-colors',
                    isSelected ? 'bg-[#111111] text-[#FAFAFA]' : 'bg-transparent text-[#111111] hover:bg-[#111111] hover:text-[#FAFAFA]',
                  ].join(' ')}
                  onFocus={() => setSelectedEntryId(entryId)}
                  onMouseEnter={() => setSelectedEntryId(entryId)}
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
