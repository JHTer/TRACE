import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'

import {
  DirectoryTree,
  type DirectorySelection,
} from '../components/index/DirectoryTree.tsx'
import { Topic01Lab, type ProofAlgorithm, type Topic01View } from '../components/topic-01/Topic01Lab.tsx'
import { Topic02ElementarySortLab } from '../components/topic-02/Topic02ElementarySortLab.tsx'
import { Topic02AdvancedSortLab } from '../components/topic-02/Topic02AdvancedSortLab.tsx'
import { Topic02MergeSortLab } from '../components/topic-02/Topic02MergeSortLab.tsx'
import { Topic02PartitionSelectionLab } from '../components/topic-02/Topic02PartitionSelectionLab.tsx'
import { Topic02StabilityLab } from '../components/topic-02/Topic02StabilityLab.tsx'
import { Topic03GraphLab } from '../components/topic-03/Topic03GraphLab.tsx'
import { Topic04DynamicProgrammingLab } from '../components/topic-04/Topic04DynamicProgrammingLab.tsx'
import { Topic05TreeLab } from '../components/topic-05/Topic05TreeLab.tsx'
import { Topic06FlowNetworkLab } from '../components/topic-06'
import { CommandPalette } from '../components/shell/CommandPalette.tsx'
import { topicCatalog } from '../content/topics/topicCatalog.ts'
import {
  dynamicProgrammingDirectoryLabelByAlgorithm,
} from '../algorithms/dp/index.ts'
import { flowNetworkDirectoryLabelByAlgorithm } from '../algorithms/flow'
import { treeDirectoryLabelByAlgorithm } from '../algorithms/tree/index.ts'
import {
  quickselectStrategyOptions,
  quicksortVariantOptions,
} from '../algorithms/array/partitionSelectionTimeline.ts'
import type {
  DynamicProgrammingAlgorithmId,
  ElementarySortAlgorithmId,
  FlowNetworkAlgorithmId,
  GraphAlgorithmId,
  PartitionSelectionAlgorithmId,
  QuickselectStrategyId,
  QuicksortVariantId,
  TreeAlgorithmId,
  Topic02AdvancedSortAlgorithmId,
} from '../domain/algorithms/types.ts'

const topic01DirectoryLabelByView: Record<Topic01View, string> = {
  'complexity-analysis': 'COMPLEXITY ANALYSIS',
  'correctness-invariants': 'CORRECTNESS AND INVARIANTS',
}

const correctnessAlgorithmOptions: readonly PickerOption[] = [
  { id: 'binary-search', label: 'Binary Search' },
  { id: 'bubble-sort', label: 'Bubble Sort' },
  { id: 'selection-sort', label: 'Selection Sort' },
  { id: 'insertion-sort', label: 'Insertion Sort' },
] as const

type Topic02View =
  | ElementarySortAlgorithmId
  | PartitionSelectionAlgorithmId
  | Topic02AdvancedSortAlgorithmId
  | 'merge-sort'
  | 'stability'

const topic02DirectoryLabelByView: Record<Topic02View, string> = {
  'bubble-sort': 'BUBBLE SORT',
  'selection-sort': 'SELECTION SORT',
  'insertion-sort': 'INSERTION SORT',
  'merge-sort': 'MERGE SORT',
  quicksort: 'QUICKSORT',
  quickselect: 'QUICKSELECT',
  'median-of-medians': 'MEDIAN OF MEDIANS',
  heapsort: 'HEAPSORT',
  'counting-sort': 'COUNTING SORT',
  'radix-sort': 'RADIX SORT',
  stability: 'STABILITY',
}

type Topic03View = GraphAlgorithmId

const topic03DirectoryLabelByView: Record<Topic03View, string> = {
  'graph-representation': 'GRAPH REPRESENTATION',
  'breadth-first-search': 'BREADTH FIRST SEARCH',
  'depth-first-search': 'DEPTH FIRST SEARCH',
  'connected-components': 'CONNECTED COMPONENTS',
  'topological-sorting': 'TOPOLOGICAL SORTING',
  'dijkstra-algorithm': 'DIJKSTRA ALGORITHM',
  'bellman-ford-algorithm': 'BELLMAN FORD ALGORITHM',
  'floyd-warshall-algorithm': 'FLOYD WARSHALL ALGORITHM',
  'prim-algorithm': 'PRIM ALGORITHM',
  'kruskal-algorithm': 'KRUSKAL ALGORITHM',
  'union-find': 'UNION FIND',
}

type Topic04View = DynamicProgrammingAlgorithmId
type Topic05View = TreeAlgorithmId
type Topic06View = FlowNetworkAlgorithmId

type ActiveScreen =
  | Readonly<{ kind: 'menu' }>
  | Readonly<{ kind: 'topic-1'; view: Topic01View }>
  | Readonly<{ kind: 'topic-2'; view: Topic02View }>
  | Readonly<{ kind: 'topic-3'; view: Topic03View }>
  | Readonly<{ kind: 'topic-4'; view: Topic04View }>
  | Readonly<{ kind: 'topic-5'; view: Topic05View }>
  | Readonly<{ kind: 'topic-6'; view: Topic06View }>

const workbenchRouteMap: Readonly<Record<string, ActiveScreen>> = {
  'menu:home': { kind: 'menu' },
  'topic-1:complexity-analysis': { kind: 'topic-1', view: 'complexity-analysis' },
  'topic-1:correctness-invariants': { kind: 'topic-1', view: 'correctness-invariants' },
  'topic-2:bubble-sort': { kind: 'topic-2', view: 'bubble-sort' },
  'topic-2:selection-sort': { kind: 'topic-2', view: 'selection-sort' },
  'topic-2:insertion-sort': { kind: 'topic-2', view: 'insertion-sort' },
  'topic-2:merge-sort': { kind: 'topic-2', view: 'merge-sort' },
  'topic-2:quicksort': { kind: 'topic-2', view: 'quicksort' },
  'topic-2:quickselect': { kind: 'topic-2', view: 'quickselect' },
  'topic-2:median-of-medians': { kind: 'topic-2', view: 'median-of-medians' },
  'topic-2:heapsort': { kind: 'topic-2', view: 'heapsort' },
  'topic-2:counting-sort': { kind: 'topic-2', view: 'counting-sort' },
  'topic-2:radix-sort': { kind: 'topic-2', view: 'radix-sort' },
  'topic-2:stability': { kind: 'topic-2', view: 'stability' },
  'topic-3:graph-representation': { kind: 'topic-3', view: 'graph-representation' },
  'topic-3:breadth-first-search': { kind: 'topic-3', view: 'breadth-first-search' },
  'topic-3:depth-first-search': { kind: 'topic-3', view: 'depth-first-search' },
  'topic-3:connected-components': { kind: 'topic-3', view: 'connected-components' },
  'topic-3:topological-sorting': { kind: 'topic-3', view: 'topological-sorting' },
  'topic-3:dijkstra-algorithm': { kind: 'topic-3', view: 'dijkstra-algorithm' },
  'topic-3:bellman-ford-algorithm': { kind: 'topic-3', view: 'bellman-ford-algorithm' },
  'topic-3:floyd-warshall-algorithm': { kind: 'topic-3', view: 'floyd-warshall-algorithm' },
  'topic-3:prim-algorithm': { kind: 'topic-3', view: 'prim-algorithm' },
  'topic-3:kruskal-algorithm': { kind: 'topic-3', view: 'kruskal-algorithm' },
  'topic-3:union-find': { kind: 'topic-3', view: 'union-find' },
  'topic-4:salesman-house': { kind: 'topic-4', view: 'salesman-house' },
  'topic-4:maze': { kind: 'topic-4', view: 'maze' },
  'topic-4:longest-increasing-subsequence': {
    kind: 'topic-4',
    view: 'longest-increasing-subsequence',
  },
  'topic-4:longest-common-subsequence': {
    kind: 'topic-4',
    view: 'longest-common-subsequence',
  },
  'topic-4:edit-distance': { kind: 'topic-4', view: 'edit-distance' },
  'topic-4:maximum-subarray': { kind: 'topic-4', view: 'maximum-subarray' },
  'topic-5:avl-trees': { kind: 'topic-5', view: 'avl-trees' },
  'topic-5:2-3-trees': { kind: 'topic-5', view: '2-3-trees' },
  'topic-5:left-leaning-red-black-trees': {
    kind: 'topic-5',
    view: 'left-leaning-red-black-trees',
  },
  'topic-5:prefix-tries': { kind: 'topic-5', view: 'prefix-tries' },
  'topic-5:suffix-tries': { kind: 'topic-5', view: 'suffix-tries' },
  'topic-5:suffix-trees': { kind: 'topic-5', view: 'suffix-trees' },
  'topic-6:flow-networks': { kind: 'topic-6', view: 'flow-networks' },
  'topic-6:residual-graphs': { kind: 'topic-6', view: 'residual-graphs' },
  'topic-6:augmenting-paths': { kind: 'topic-6', view: 'augmenting-paths' },
  'topic-6:ford-fulkerson-algorithm': {
    kind: 'topic-6',
    view: 'ford-fulkerson-algorithm',
  },
  'topic-6:minimum-cut': { kind: 'topic-6', view: 'minimum-cut' },
  'topic-6:maximum-flow-minimum-cut-theorem': {
    kind: 'topic-6',
    view: 'maximum-flow-minimum-cut-theorem',
  },
  'topic-6:bipartite-matching': { kind: 'topic-6', view: 'bipartite-matching' },
}

const defaultRouteKey = 'menu:home'
const routeParamKey = 'screen'

const toRouteKey = (selection: DirectorySelection) =>
  `${selection.topicId}:${selection.algorithmId}`

const toRouteKeyForScreen = (screen: ActiveScreen) => {
  if (screen.kind === 'menu') {
    return defaultRouteKey
  }

  if (screen.kind === 'topic-1') {
    return `topic-1:${screen.view}`
  }

  if (screen.kind === 'topic-2') {
    return `topic-2:${screen.view}`
  }

  if (screen.kind === 'topic-3') {
    return `topic-3:${screen.view}`
  }

  if (screen.kind === 'topic-4') {
    return `topic-4:${screen.view}`
  }

  if (screen.kind === 'topic-5') {
    return `topic-5:${screen.view}`
  }

  return `topic-6:${screen.view}`
}

const resolveScreenByRouteKey = (routeKey: string): ActiveScreen =>
  workbenchRouteMap[routeKey] ?? workbenchRouteMap[defaultRouteKey] ?? { kind: 'menu' }

const getRouteKeyFromLocation = () => {
  if (typeof window === 'undefined') {
    return defaultRouteKey
  }

  const params = new URLSearchParams(window.location.search)
  return params.get(routeParamKey) ?? defaultRouteKey
}

const commitRouteKey = (routeKey: string, mode: 'push' | 'replace') => {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)
  if (routeKey === defaultRouteKey) {
    url.searchParams.delete(routeParamKey)
  } else {
    url.searchParams.set(routeParamKey, routeKey)
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  if (mode === 'push') {
    window.history.pushState({ routeKey }, '', nextUrl)
  } else {
    window.history.replaceState({ routeKey }, '', nextUrl)
  }
}

const resolveScreen = (selection: DirectorySelection): ActiveScreen | null => {
  const routeKey = toRouteKey(selection)
  return workbenchRouteMap[routeKey] ?? null
}

const isElementarySortView = (
  view: Topic02View,
): view is ElementarySortAlgorithmId =>
  view === 'bubble-sort' || view === 'selection-sort' || view === 'insertion-sort'

const isMergeSortView = (view: Topic02View): view is 'merge-sort' =>
  view === 'merge-sort'

const isPartitionSelectionView = (
  view: Topic02View,
): view is PartitionSelectionAlgorithmId =>
  view === 'quicksort' || view === 'quickselect' || view === 'median-of-medians'

const isAdvancedSortView = (
  view: Topic02View,
): view is Topic02AdvancedSortAlgorithmId =>
  view === 'heapsort' || view === 'counting-sort' || view === 'radix-sort'

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLElement && target.isContentEditable)

type PickerOption = Readonly<{
  id: string
  label: string
}>

function BreadcrumbDirectoryPicker({
  options,
  selectedId,
  onSelect,
  ariaLabel,
}: Readonly<{
  options: readonly PickerOption[]
  selectedId: string
  onSelect: (id: string) => void
  ariaLabel: string
}>) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.id === selectedId),
  )
  const [activeIndex, setActiveIndex] = useState(selectedIndex)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setActiveIndex(selectedIndex)
  }, [isOpen, selectedIndex])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      if (rootRef.current?.contains(target)) {
        return
      }

      setIsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((current) => (current + 1) % options.length)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((current) => (current - 1 + options.length) % options.length)
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        const activeOption = options[activeIndex]
        if (activeOption !== undefined) {
          onSelect(activeOption.id)
        }
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, isOpen, onSelect, options])

  const selectedOption = options[selectedIndex] ?? options[0]

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className="inline-flex items-center gap-1 border border-[#E5E5E5] bg-white px-1.5 py-0.5 font-mono text-[0.82rem] tracking-[0.12em] text-[#111111] transition-colors hover:border-[#111111]"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event: ReactKeyboardEvent<HTMLButtonElement>) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setIsOpen(true)
            return
          }

          if (event.key === 'Escape') {
            event.preventDefault()
            setIsOpen(false)
          }
        }}
        type="button"
      >
        {selectedOption?.label.toUpperCase() ?? ''}
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[220px] border border-[#111111] bg-white p-1"
          role="menu"
        >
          {options.map((option, index) => {
            const isActive = index === activeIndex
            const isSelected = option.id === selectedId

            return (
              <button
                key={option.id}
                className={[
                  'block w-full border-0 px-2 py-1 text-left font-mono text-[0.8rem] tracking-[0.08em] transition-colors',
                  isActive
                    ? 'bg-[#111111] text-[#FAFAFA]'
                    : 'bg-transparent text-[#111111] hover:bg-[#111111] hover:text-[#FAFAFA]',
                ].join(' ')}
                onClick={() => {
                  onSelect(option.id)
                  setIsOpen(false)
                }}
                onMouseEnter={() => setActiveIndex(index)}
                role="menuitem"
                type="button"
              >
                <span className="inline-block min-w-[1.5rem]">{isSelected ? '>' : '->'}</span>
                <span>{option.label.toUpperCase()}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function IndexPage() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(() =>
    resolveScreenByRouteKey(getRouteKeyFromLocation()),
  )
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [correctnessAlgorithm, setCorrectnessAlgorithm] =
    useState<ProofAlgorithm>('binary-search')
  const [quicksortVariant, setQuicksortVariant] = useState<QuicksortVariantId>('lomuto')
  const [quickselectStrategy, setQuickselectStrategy] =
    useState<QuickselectStrategyId>('lomuto')
  const pageMaxWidthClass =
    activeScreen.kind === 'topic-3' ||
    activeScreen.kind === 'topic-4' ||
    activeScreen.kind === 'topic-5' ||
    activeScreen.kind === 'topic-6'
      ? 'max-w-[1200px]'
      : 'max-w-[980px]'

  const applyScreen = useCallback((nextScreen: ActiveScreen) => {
    if (nextScreen.kind === 'topic-2' && nextScreen.view === 'quicksort') {
      setQuicksortVariant('lomuto')
    }

    if (nextScreen.kind === 'topic-2' && nextScreen.view === 'quickselect') {
      setQuickselectStrategy('lomuto')
    }

    if (nextScreen.kind !== 'topic-1' || nextScreen.view !== 'correctness-invariants') {
      setCorrectnessAlgorithm('binary-search')
    }

    setActiveScreen(nextScreen)
  }, [])

  const handleDirectorySelection = (selection: DirectorySelection) => {
    const nextScreen = resolveScreen(selection)
    if (nextScreen === null) {
      return
    }

    applyScreen(nextScreen)
    commitRouteKey(toRouteKey(selection), 'push')
  }

  useEffect(() => {
    const routeKey = getRouteKeyFromLocation()
    const nextScreen = resolveScreenByRouteKey(routeKey)
    const canonicalRouteKey = toRouteKeyForScreen(nextScreen)
    commitRouteKey(canonicalRouteKey, 'replace')
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      const routeKey = getRouteKeyFromLocation()
      const nextScreen = resolveScreenByRouteKey(routeKey)
      applyScreen(nextScreen)

      const canonicalRouteKey = toRouteKeyForScreen(nextScreen)
      if (canonicalRouteKey !== routeKey) {
        commitRouteKey(canonicalRouteKey, 'replace')
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [applyScreen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      event.preventDefault()
      setIsCommandPaletteOpen(true)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [activeScreen])

  const breadcrumbSuffixNode: ReactNode = useMemo(() => {
    if (activeScreen.kind === 'topic-1') {
      const baseLabel = topic01DirectoryLabelByView[activeScreen.view]
      if (activeScreen.view === 'correctness-invariants') {
        return (
          <>
            {baseLabel} /{' '}
            <BreadcrumbDirectoryPicker
              ariaLabel="Correctness algorithm"
              onSelect={(nextAlgorithmId) => {
                if (
                  nextAlgorithmId === 'binary-search' ||
                  nextAlgorithmId === 'bubble-sort' ||
                  nextAlgorithmId === 'selection-sort' ||
                  nextAlgorithmId === 'insertion-sort'
                ) {
                  setCorrectnessAlgorithm(nextAlgorithmId)
                }
              }}
              options={correctnessAlgorithmOptions}
              selectedId={correctnessAlgorithm}
            />
          </>
        )
      }
      return baseLabel
    }

    if (activeScreen.kind === 'topic-3') {
      return topic03DirectoryLabelByView[activeScreen.view]
    }

    if (activeScreen.kind === 'topic-4') {
      return dynamicProgrammingDirectoryLabelByAlgorithm[activeScreen.view]
    }

    if (activeScreen.kind === 'topic-5') {
      return treeDirectoryLabelByAlgorithm[activeScreen.view]
    }

    if (activeScreen.kind === 'topic-6') {
      return flowNetworkDirectoryLabelByAlgorithm[activeScreen.view]
    }

    if (activeScreen.kind !== 'topic-2') {
      return null
    }

    if (activeScreen.view === 'quicksort') {
      return (
        <>
          QUICKSORT /{' '}
          <BreadcrumbDirectoryPicker
            ariaLabel="Quicksort variant"
            onSelect={(nextVariantId) => {
              if (
                nextVariantId === 'lomuto' ||
                nextVariantId === 'hoare' ||
                nextVariantId === 'out-of-place' ||
                nextVariantId === 'dnf'
              ) {
                setQuicksortVariant(nextVariantId)
              }
            }}
            options={quicksortVariantOptions}
            selectedId={quicksortVariant}
          />
        </>
      )
    }

    if (activeScreen.view === 'quickselect') {
      return (
        <>
          QUICKSELECT /{' '}
          <BreadcrumbDirectoryPicker
            ariaLabel="Quickselect strategy"
            onSelect={(nextStrategyId) => {
              if (nextStrategyId === 'lomuto' || nextStrategyId === 'hoare') {
                setQuickselectStrategy(nextStrategyId)
              }
            }}
            options={quickselectStrategyOptions}
            selectedId={quickselectStrategy}
          />
        </>
      )
    }

    return topic02DirectoryLabelByView[activeScreen.view]
  }, [activeScreen, quickselectStrategy, quicksortVariant])

  const pageTitle = useMemo(() => {
    if (activeScreen.kind === 'menu') {
      return 'Topic Explorer'
    }

    if (activeScreen.kind === 'topic-1') {
      return topic01DirectoryLabelByView[activeScreen.view]
    }

    if (activeScreen.kind === 'topic-3') {
      return topic03DirectoryLabelByView[activeScreen.view]
    }

    if (activeScreen.kind === 'topic-4') {
      return dynamicProgrammingDirectoryLabelByAlgorithm[activeScreen.view]
    }

    if (activeScreen.kind === 'topic-5') {
      return treeDirectoryLabelByAlgorithm[activeScreen.view]
    }

    if (activeScreen.kind === 'topic-6') {
      return flowNetworkDirectoryLabelByAlgorithm[activeScreen.view]
    }

    if (activeScreen.view === 'quicksort') {
      const selectedVariantLabel =
        quicksortVariantOptions.find((option) => option.id === quicksortVariant)?.label ??
        quicksortVariant
      return `QUICKSORT / ${selectedVariantLabel.toUpperCase()}`
    }

    if (activeScreen.view === 'quickselect') {
      const selectedStrategyLabel =
        quickselectStrategyOptions.find((option) => option.id === quickselectStrategy)?.label ??
        quickselectStrategy
      return `QUICKSELECT / ${selectedStrategyLabel.toUpperCase()}`
    }

    return topic02DirectoryLabelByView[activeScreen.view]
  }, [activeScreen, quickselectStrategy, quicksortVariant])

  return (
    <section className="px-8 pb-20 pt-8">
      <div className={['mx-auto', pageMaxWidthClass].join(' ')}>
        {activeScreen.kind === 'menu' ? (
          <DirectoryTree onSelectEntry={handleDirectorySelection} topics={topicCatalog} />
        ) : (
          <>
            <div>
              <div className="font-mono text-[0.86rem] tracking-[0.16em] text-[#666666]">
                TRACE / CONTENT / {breadcrumbSuffixNode}
              </div>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.04em] text-[#111111]">
                {pageTitle}
              </h1>
            </div>

            {activeScreen.kind === 'topic-1' ? (
              <Topic01Lab
                proofAlgorithm={correctnessAlgorithm}
                selectedView={activeScreen.view}
              />
            ) : (
              <>
                {activeScreen.kind === 'topic-2' ? (
                  isElementarySortView(activeScreen.view) ? (
                    <Topic02ElementarySortLab algorithmId={activeScreen.view} />
                  ) : isMergeSortView(activeScreen.view) ? (
                    <Topic02MergeSortLab />
                  ) : isPartitionSelectionView(activeScreen.view) ? (
                    <Topic02PartitionSelectionLab
                      algorithmId={activeScreen.view}
                      quickselectStrategy={quickselectStrategy}
                      quicksortVariant={quicksortVariant}
                    />
                  ) : isAdvancedSortView(activeScreen.view) ? (
                    <Topic02AdvancedSortLab algorithmId={activeScreen.view} />
                  ) : (
                    <Topic02StabilityLab />
                  )
                ) : activeScreen.kind === 'topic-3' ? (
                  <Topic03GraphLab algorithmId={activeScreen.view} />
                ) : activeScreen.kind === 'topic-4' ? (
                  <Topic04DynamicProgrammingLab algorithmId={activeScreen.view} />
                ) : activeScreen.kind === 'topic-5' ? (
                  <Topic05TreeLab algorithmId={activeScreen.view} />
                ) : (
                  <Topic06FlowNetworkLab algorithmId={activeScreen.view} />
                )}
              </>
            )}
          </>
        )}
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelect={(selection) => {
          handleDirectorySelection(selection)
          setIsCommandPaletteOpen(false)
        }}
        topics={topicCatalog}
      />
    </section>
  )
}

export { IndexPage }
