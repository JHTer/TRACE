import type { TopicSummary } from '../../domain/algorithms/types.ts'

const createTopic = (topic: TopicSummary): TopicSummary => topic

const topicCatalog: readonly TopicSummary[] = [
  createTopic({
    id: 'topic-1',
    shortLabel: 'Topic 1',
    title: 'Analysis and Foundations',
    summary:
      'Correctness, complexity, recurrences, and the reasoning tools needed before algorithm animation becomes meaningful.',
    algorithms: [
      { id: 'binary-search', label: 'Binary Search' },
      { id: 'merge-sort', label: 'Merge Sort' },
      { id: 'counting-inversions', label: 'Counting Inversions' },
    ],
  }),
  createTopic({
    id: 'topic-2',
    shortLabel: 'Topic 2',
    title: 'Sorting, Selection, and Arrays',
    summary:
      'Partitioning, heaps, linear-time integer sorting, and array-based decision making.',
    algorithms: [
      { id: 'heapsort', label: 'Heapsort' },
      { id: 'quicksort', label: 'Quicksort' },
      { id: 'quickselect', label: 'Quickselect' },
    ],
  }),
  createTopic({
    id: 'topic-3',
    shortLabel: 'Topic 3',
    title: 'Graph Traversal and Structure',
    summary:
      'Graph representations, traversal order, connectivity, and dependency handling.',
    algorithms: [
      { id: 'dfs', label: 'DFS' },
      { id: 'bfs', label: 'BFS' },
      { id: 'topological-sort', label: 'Topological Sort' },
    ],
  }),
  createTopic({
    id: 'topic-4',
    shortLabel: 'Topic 4',
    title: 'Greedy Graph Optimisation',
    summary:
      'Relaxation, shortest paths, and spanning trees built from locally sound choices.',
    algorithms: [
      { id: 'dijkstra', label: 'Dijkstra' },
      { id: 'prim', label: 'Prim' },
      { id: 'kruskal', label: 'Kruskal' },
    ],
  }),
  createTopic({
    id: 'topic-5',
    shortLabel: 'Topic 5',
    title: 'Dynamic Programming, Negative Weights, and Flow',
    summary:
      'State tables, reconstruction, negative edges, and constrained optimization on graphs and networks.',
    algorithms: [
      { id: 'knapsack', label: 'Knapsack' },
      { id: 'bellman-ford', label: 'Bellman-Ford' },
      { id: 'floyd-warshall', label: 'Floyd-Warshall' },
    ],
  }),
  createTopic({
    id: 'topic-6',
    shortLabel: 'Topic 6',
    title: 'Trees and String Structures',
    summary:
      'Balanced search trees, tries, suffix structures, and hierarchical retrieval.',
    algorithms: [
      { id: 'avl-tree', label: 'AVL Trees' },
      { id: 'prefix-tries', label: 'Prefix Tries' },
      { id: 'suffix-trees', label: 'Suffix Trees' },
    ],
  }),
] as const

export { topicCatalog }
