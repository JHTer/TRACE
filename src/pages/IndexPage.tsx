import { DirectoryTree } from '../components/index/DirectoryTree.tsx'
import { topicCatalog } from '../content/topics/topicCatalog.ts'

function IndexPage() {
  return (
    <section className="px-8 pb-20 pt-[7vh]">
      <div className="mx-auto max-w-[820px]">
        <h1 className="text-[clamp(2.4rem,4vw,3.4rem)] font-semibold tracking-[-0.04em] text-[#111111]">
          FIT2004: Algorithms &amp; Data Structures
        </h1>
        <div className="mt-8">
          <DirectoryTree topics={topicCatalog} />
        </div>
      </div>
    </section>
  )
}

export { IndexPage }
