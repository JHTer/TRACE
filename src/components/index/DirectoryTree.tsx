import type { TopicSummary } from '../../domain/algorithms/types.ts'

const joinLabels = (labels: readonly string[]) => labels.join('   ')

function DirectoryTree({ topics }: { topics: readonly TopicSummary[] }) {
  return (
    <div className="rounded-sm border border-[#E5E5E5] bg-white">
      <div className="border-b border-[#E5E5E5] px-5 py-4 font-mono text-sm text-[#111111]">
        FIT2004: Algorithms and Data Structures
      </div>
      <div className="divide-y divide-[#E5E5E5]">
        {topics.map((topic) => (
          <section
            key={topic.id}
            className="group px-5 py-4 transition-colors duration-150 hover:bg-[#111111] hover:text-[#FAFAFA]"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-sm">
              <span className="text-[#999999] transition-colors group-hover:text-[#CCCCCC]">
                {topic.shortLabel}
              </span>
              <h2 className="text-base font-medium">{topic.title}</h2>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#666666] transition-colors group-hover:text-[#D4D4D4]">
              {topic.summary}
            </p>
            <p className="mt-3 font-mono text-sm leading-7">
              <span className="text-[#666666] transition-colors group-hover:text-[#D4D4D4]">
                -&gt;
              </span>{' '}
              {joinLabels(topic.algorithms.map((algorithm) => algorithm.label))}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}

export { DirectoryTree }
