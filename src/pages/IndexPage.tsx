import { DirectoryTree } from '../components/index/DirectoryTree.tsx'
import { topicCatalog } from '../content/topics/topicCatalog.ts'

function IndexPage() {
  return (
    <section className="px-6 pb-20 pt-[10vh]">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#666666]">
            Root Directory
          </p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight text-[#111111]">
            FIT2004 Interactive Syllabus
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#666666]">
            A study workbench for algorithms and data structures. Open a topic
            like a directory, inspect an algorithm like a program, and move
            from theory to state-by-state execution without leaving the same
            interface.
          </p>
        </div>

        <div className="mt-10">
          <DirectoryTree topics={topicCatalog} />
        </div>
      </div>
    </section>
  )
}

export { IndexPage }
