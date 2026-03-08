import { useState } from 'react'

import {
  DirectoryTree,
  type DirectorySelection,
} from '../components/index/DirectoryTree.tsx'
import { Topic01Lab, type Topic01View } from '../components/topic-01/Topic01Lab.tsx'
import { topicCatalog } from '../content/topics/topicCatalog.ts'

function IndexPage() {
  const [selectedTopic01View, setSelectedTopic01View] =
    useState<Topic01View>('complexity-analysis')

  const handleDirectorySelection = (selection: DirectorySelection) => {
    if (selection.topicId !== 'topic-1') {
      return
    }

    if (
      selection.algorithmId === 'complexity-analysis' ||
      selection.algorithmId === 'correctness-invariants' ||
      selection.algorithmId === 'physical-machine-metaphor'
    ) {
      setSelectedTopic01View(selection.algorithmId)
    }
  }

  return (
    <section className="px-8 pb-20 pt-[7vh]">
      <div className="mx-auto max-w-[980px]">
        <div className="max-w-[780px]">
          <div className="font-mono text-[0.92rem] tracking-[0.18em] text-[#666666]">
            TRACE
          </div>
          <h1 className="mt-4 text-[clamp(3rem,6vw,5.2rem)] font-semibold tracking-[-0.06em] text-[#111111]">
            TRACE
          </h1>
          <p className="mt-5 max-w-[720px] text-[1.05rem] leading-8 text-[#666666]">
            Browse core algorithm ideas like a codebase, then inspect them from the inside through
            step traces, asymptotic views, and machine-style diagnostics.
          </p>
        </div>

        <div className="mt-10">
          <DirectoryTree onSelectEntry={handleDirectorySelection} topics={topicCatalog} />
        </div>

        <Topic01Lab onViewChange={setSelectedTopic01View} selectedView={selectedTopic01View} />
      </div>
    </section>
  )
}

export { IndexPage }
