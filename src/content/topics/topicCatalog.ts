import type { TopicSummary } from '../../domain/algorithms/types.ts'

const createTopic = (topic: TopicSummary): TopicSummary => topic

const topicCatalog: readonly TopicSummary[] = [
  createTopic({
    id: 'topic-1',
    shortLabel: '01',
    title: 'Complexity and Correctness',
    summary:
      'Growth rates, invariants, and machine-cost intuition for reasoning about algorithms before animating them.',
    algorithms: [
      { id: 'complexity-analysis', label: 'Complexity Analysis' },
      { id: 'correctness-invariants', label: 'Correctness and Invariants' },
      { id: 'physical-machine-metaphor', label: 'Physical Machine Metaphor' },
    ],
  }),
  createTopic({
    id: 'topic-2',
    shortLabel: '02',
    title: 'Sorting',
    summary:
      'Selection, insertion, divide-and-conquer, heap-based, and non-comparison sorting strategies with stability tradeoffs.',
    algorithms: [
      { id: 'bubble-sort', label: 'Bubble Sort' },
      { id: 'selection-sort', label: 'Selection Sort' },
      { id: 'insertion-sort', label: 'Insertion Sort' },
      { id: 'merge-sort', label: 'Merge Sort' },
      { id: 'quicksort', label: 'Quicksort' },
      { id: 'quickselect', label: 'Quickselect' },
      { id: 'median-of-medians', label: 'Median of Medians' },
      { id: 'heapsort', label: 'Heapsort' },
      { id: 'counting-sort', label: 'Counting Sort' },
      { id: 'radix-sort', label: 'Radix Sort' },
      { id: 'stability', label: 'Stability' },
    ],
  }),
  createTopic({
    id: 'topic-3',
    shortLabel: '03',
    title: 'Graph',
    summary:
      'Representations, traversals, components, shortest paths, spanning trees, and disjoint-set reasoning on graphs.',
    algorithms: [
      { id: 'graph-representation', label: 'Graph Representation' },
      { id: 'breadth-first-search', label: 'Breadth First Search' },
      { id: 'depth-first-search', label: 'Depth First Search' },
      { id: 'connected-components', label: 'Connected Components' },
      { id: 'topological-sorting', label: 'Topological Sorting' },
      { id: 'dijkstra-algorithm', label: 'Dijkstra Algorithm' },
      { id: 'bellman-ford-algorithm', label: 'Bellman Ford Algorithm' },
      { id: 'floyd-warshall-algorithm', label: 'Floyd Warshall Algorithm' },
      { id: 'prim-algorithm', label: 'Prim Algorithm' },
      { id: 'kruskal-algorithm', label: 'Kruskal Algorithm' },
      { id: 'union-find', label: 'Union Find' },
    ],
  }),
  createTopic({
    id: 'topic-4',
    shortLabel: '04',
    title: 'Dynamic Programming',
    summary:
      'Top-down and bottom-up formulations, state transitions, reconstruction, and classic optimization problems.',
    algorithms: [
      { id: 'top-down-dynamic-programming', label: 'Top Down Dynamic Programming' },
      { id: 'bottom-up-dynamic-programming', label: 'Bottom Up Dynamic Programming' },
      { id: 'state-transitions', label: 'State Transitions' },
      { id: 'solution-reconstruction', label: 'Solution Reconstruction' },
      { id: 'unbounded-knapsack', label: 'Unbounded Knapsack' },
      { id: 'zero-one-knapsack', label: 'Zero One Knapsack' },
      { id: 'edit-distance', label: 'Edit Distance' },
      { id: 'matrix-chain-multiplication', label: 'Matrix Chain Multiplication' },
    ],
  }),
  createTopic({
    id: 'topic-5',
    shortLabel: '05',
    title: 'Trees',
    summary:
      'Search trees, balancing rotations, multiway trees, and trie-based structures for hierarchical lookup.',
    algorithms: [
      { id: 'binary-search-trees', label: 'Binary Search Trees' },
      { id: 'avl-trees', label: 'AVL Trees' },
      { id: 'red-black-trees', label: 'Red Black Trees' },
      { id: '2-3-trees', label: '2 3 Trees' },
      { id: 'tree-rotations', label: 'Tree Rotations' },
      { id: 'prefix-tries', label: 'Prefix Tries' },
      { id: 'suffix-trees', label: 'Suffix Trees' },
    ],
  }),
  createTopic({
    id: 'topic-6',
    shortLabel: '06',
    title: 'Flow Network',
    summary:
      'Network flow structure, residual reasoning, augmenting-path methods, cuts, and matching reductions.',
    algorithms: [
      { id: 'flow-networks', label: 'Flow Networks' },
      { id: 'residual-graphs', label: 'Residual Graphs' },
      { id: 'augmenting-paths', label: 'Augmenting Paths' },
      { id: 'ford-fulkerson-algorithm', label: 'Ford Fulkerson Algorithm' },
      { id: 'minimum-cut', label: 'Minimum Cut' },
      { id: 'maximum-flow-minimum-cut-theorem', label: 'Maximum Flow Minimum Cut Theorem' },
      { id: 'bipartite-matching', label: 'Bipartite Matching' },
    ],
  }),
] as const

export { topicCatalog }
