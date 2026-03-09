import type {
  GraphAdjacencyEntry,
  GraphAdjacencyMatrix,
  GraphEdge,
  GraphModel,
  GraphNeighbor,
  GraphNode,
  GraphPseudocodeLine,
  GraphRepresentationFrame,
  GraphRepresentationTimeline,
  GraphTraversalAlgorithmId,
  GraphTraversalFrame,
  GraphTraversalScope,
  GraphTraversalTimeline,
  LineEvent,
  UnionFindModeId,
} from '../../domain/algorithms/types.ts'

type FrameWithExecutedLines = Readonly<{
  executedLines: readonly number[]
}>

const graphRepresentationPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'load vertices and undirected edges from canvas' },
  { lineNumber: 2, text: 'build adjacency list by scanning all edges' },
  { lineNumber: 3, text: 'build adjacency matrix using sorted vertex order' },
]

const bfsPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'BFS(G, start, scope):' },
  { lineNumber: 2, text: '  init visited, dist, pred' },
  { lineNumber: 3, text: '  for each root in order:' },
  { lineNumber: 4, text: '    if root already visited: continue' },
  { lineNumber: 5, text: '    set root:' },
  { lineNumber: 6, text: '      dist[root] <- 0' },
  { lineNumber: 7, text: '      visited[root] <- true' },
  { lineNumber: 8, text: '      q.push(root)' },
  { lineNumber: 9, text: '    while q not empty:' },
  { lineNumber: 10, text: '      u <- q.pop_front()' },
  { lineNumber: 11, text: '      for each v adjacent to u:' },
  { lineNumber: 12, text: '        if dist[v] is INF:' },
  { lineNumber: 13, text: '          dist[v] <- dist[u] + 1' },
  { lineNumber: 14, text: '          pred[v] <- u' },
  { lineNumber: 15, text: '          q.push(v)' },
  { lineNumber: 16, text: '  if target set: rebuild path via pred' },
]

const dfsPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'TRAVERSE(G, start, scope):' },
  { lineNumber: 2, text: '  init visited and pred' },
  { lineNumber: 3, text: '  for each root in order:' },
  { lineNumber: 4, text: '    if not visited[root]: DFS(root)' },
  { lineNumber: 5, text: 'DFS(u):' },
  { lineNumber: 6, text: '  visited[u] <- true' },
  { lineNumber: 7, text: '  for each v adjacent to u:' },
  { lineNumber: 8, text: '    if not visited[v]:' },
  { lineNumber: 9, text: '      pred[v] <- u' },
  { lineNumber: 10, text: '      DFS(v)' },
  { lineNumber: 11, text: '  finish u' },
  { lineNumber: 12, text: 'traversal complete' },
]

const connectedComponentsPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'CONNECTED_COMPONENTS(G):' },
  { lineNumber: 2, text: '  component[v] <- null for all v' },
  { lineNumber: 3, text: '  comp <- 0' },
  { lineNumber: 4, text: '  for each vertex u in order:' },
  { lineNumber: 5, text: '    if component[u] = null:' },
  { lineNumber: 6, text: '      comp <- comp + 1' },
  { lineNumber: 7, text: '      DFS(u, comp)' },
  { lineNumber: 8, text: 'DFS(u, comp):' },
  { lineNumber: 9, text: '  component[u] <- comp' },
  { lineNumber: 10, text: '  for each vertex v adjacent to u:' },
  { lineNumber: 11, text: '    if component[v] = null:' },
  { lineNumber: 12, text: '      DFS(v, comp)' },
  { lineNumber: 13, text: 'return comp, component' },
]

const topologicalSortPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'TOPOLOGICAL_SORT(G):' },
  { lineNumber: 2, text: '  order <- []' },
  { lineNumber: 3, text: '  state[v] <- UNVISITED for all v' },
  { lineNumber: 4, text: '  for each vertex u in order:' },
  { lineNumber: 5, text: '    if state[u] = UNVISITED:' },
  { lineNumber: 6, text: '      if DFS(u) detects cycle: fail' },
  { lineNumber: 7, text: '  return reverse(order)' },
  { lineNumber: 8, text: 'DFS(u):' },
  { lineNumber: 9, text: '  state[u] <- VISITING' },
  { lineNumber: 10, text: '  for each v adjacent to u:' },
  { lineNumber: 11, text: '    if state[v] = VISITING: cycle' },
  { lineNumber: 12, text: '    if state[v] = UNVISITED: DFS(v)' },
  { lineNumber: 13, text: '  state[u] <- DONE' },
  { lineNumber: 14, text: '  order.append(u)' },
]

const dijkstraPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'DIJKSTRA(G, s):' },
  { lineNumber: 2, text: '  init dist=INF, pred=null' },
  { lineNumber: 3, text: '  dist[s] <- 0' },
  { lineNumber: 4, text: '  push (s, 0) into min-priority-queue Q' },
  { lineNumber: 5, text: '  while Q not empty:' },
  { lineNumber: 6, text: '    (u, key) <- pop_min(Q)' },
  { lineNumber: 7, text: '    if key != dist[u]: continue // stale entry' },
  { lineNumber: 8, text: '    for each directed edge (u, v):' },
  { lineNumber: 9, text: '      cand <- dist[u] + w(u, v)' },
  { lineNumber: 10, text: '      if cand < dist[v]:' },
  { lineNumber: 11, text: '        dist[v] <- cand; pred[v] <- u; push(v, dist[v])' },
  { lineNumber: 12, text: '  return dist, pred' },
]

const bellmanFordPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'BELLMAN_FORD(G, s):' },
  { lineNumber: 2, text: '  init dist=INF, pred=null' },
  { lineNumber: 3, text: '  dist[s] <- 0' },
  { lineNumber: 4, text: '  for pass = 1 to |V|-1:' },
  { lineNumber: 5, text: '    for each directed edge (u, v): relax(u, v)' },
  { lineNumber: 6, text: '  // textbook post-processing for negative cycles' },
  { lineNumber: 7, text: '  repeat |V| times over all edges:' },
  { lineNumber: 8, text: '    if edge still relaxable: mark v as -INF-affected' },
  { lineNumber: 9, text: '  set dist[x] <- -INF for all affected x' },
  { lineNumber: 10, text: '  return dist, pred' },
]

const floydWarshallPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'FLOYD_WARSHALL(G):' },
  { lineNumber: 2, text: '  dist[u][v] <- INF' },
  { lineNumber: 3, text: '  dist[v][v] <- 0; dist[u][v] <- w(u,v) for edges' },
  { lineNumber: 4, text: '  for k = 1 to n:' },
  { lineNumber: 5, text: '    for i = 1 to n:' },
  { lineNumber: 6, text: '      for j = 1 to n:' },
  { lineNumber: 7, text: '        dist[i][j] <- min(dist[i][j], dist[i][k] + dist[k][j])' },
  { lineNumber: 8, text: '  if any dist[v][v] < 0: negative cycle exists' },
  { lineNumber: 9, text: '  return dist' },
]

const primPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'PRIM(G = (V, E), r)' },
  { lineNumber: 2, text: '  dist[1..n] <- INF' },
  { lineNumber: 3, text: '  parent[1..n] <- null' },
  { lineNumber: 4, text: '  T <- ({r}, ∅)' },
  { lineNumber: 5, text: '  dist[r] <- 0' },
  { lineNumber: 6, text: '  Q <- priority_queue(V[1..n], key(v) = dist[v])' },
  { lineNumber: 7, text: '  while Q is not empty do' },
  { lineNumber: 8, text: '    u <- Q.pop_min()' },
  { lineNumber: 9, text: '    T.add_vertex(u)' },
  { lineNumber: 10, text: '    T.add_edge(parent[u], u)' },
  { lineNumber: 11, text: '    for each edge e = (u, v) adjacent to u do' },
  { lineNumber: 12, text: '      if not v ∈ T and dist[v] > w(u, v) then' },
  { lineNumber: 13, text: '        // Remember to update the key of v in the priority queue!' },
  { lineNumber: 14, text: '        dist[v] <- w(u, v)' },
  { lineNumber: 15, text: '        parent[v] <- u' },
  { lineNumber: 16, text: '  return T' },
]

const kruskalPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'KRUSKAL(G = (V, E))' },
  { lineNumber: 2, text: '  sort(E, key((u, v)) = w(u, v)) // ascending weight' },
  { lineNumber: 3, text: '  forest <- UnionFind.initialise(n)' },
  { lineNumber: 4, text: '  T <- (V, ∅)' },
  { lineNumber: 5, text: '  for each edge (u, v) in E do' },
  { lineNumber: 6, text: '    if forest.FIND(u) != forest.FIND(v) then' },
  { lineNumber: 7, text: '      forest.UNION(u, v)' },
  { lineNumber: 8, text: '      T.add_edge(u, v)' },
  { lineNumber: 9, text: '  return T' },
]

const unionFindBaselinePseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'INITIALISE(n)' },
  { lineNumber: 2, text: '  parent[1..n] <- 1..n' },
  { lineNumber: 3, text: 'FIND(x)' },
  { lineNumber: 4, text: '  if parent[x] = x then return x' },
  { lineNumber: 5, text: '  else return FIND(parent[x])' },
  { lineNumber: 6, text: 'UNION(x, y)' },
  { lineNumber: 7, text: '  parent[FIND(x)] <- FIND(y)' },
]

const unionFindPathCompressionPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'FIND(x) with path compression' },
  { lineNumber: 2, text: '  if parent[x] != x then' },
  { lineNumber: 3, text: '    parent[x] <- FIND(parent[x])' },
  { lineNumber: 4, text: '  return parent[x]' },
  { lineNumber: 5, text: 'UNION(x, y)' },
  { lineNumber: 6, text: '  parent[FIND(x)] <- FIND(y)' },
]

const unionFindUnionByRankPseudocodeLines: readonly GraphPseudocodeLine[] = [
  { lineNumber: 1, text: 'INITIALISE(n)' },
  { lineNumber: 2, text: '  parent[1..n] <- 1..n; rank[1..n] <- 0' },
  { lineNumber: 3, text: 'UNION(x, y)' },
  { lineNumber: 4, text: '  x <- FIND(x); y <- FIND(y)' },
  { lineNumber: 5, text: '  if rank[x] < rank[y] then parent[x] <- y' },
  { lineNumber: 6, text: '  else parent[y] <- x' },
  { lineNumber: 7, text: '  if rank[x] = rank[y] then rank[x] <- rank[x] + 1' },
]

const unionFindPseudocodeLinesByMode: Readonly<Record<UnionFindModeId, readonly GraphPseudocodeLine[]>> = {
  baseline: unionFindBaselinePseudocodeLines,
  'path-compression': unionFindPathCompressionPseudocodeLines,
  'union-by-rank': unionFindUnionByRankPseudocodeLines,
  combined: unionFindUnionByRankPseudocodeLines,
}

type GraphDirectionOptions = Readonly<{
  directed?: boolean
  weighted?: boolean
}>

const emptyGraphModel: GraphModel = {
  nodes: [],
  edges: [],
}

const emptyAdjacencyMatrix: GraphAdjacencyMatrix = {
  labels: [],
  rows: [],
}

const compareLabels = (left: string, right: string) =>
  left.localeCompare(right, 'en-US', {
    numeric: true,
    sensitivity: 'base',
  })

const compareNodesByLabel = (left: GraphNode, right: GraphNode) => {
  const labelComparison = compareLabels(left.label, right.label)
  if (labelComparison !== 0) {
    return labelComparison
  }

  return left.order - right.order
}

const cloneGraphModel = (graph: GraphModel): GraphModel => ({
  nodes: graph.nodes.map((node) => ({ ...node })),
  edges: graph.edges.map((edge) => ({ ...edge })),
})

const cloneAdjacencyList = (adjacencyList: readonly GraphAdjacencyEntry[]): readonly GraphAdjacencyEntry[] =>
  adjacencyList.map((entry) => ({
    nodeId: entry.nodeId,
    label: entry.label,
    neighbors: entry.neighbors.map((neighbor) => ({ ...neighbor })),
  }))

const cloneAdjacencyMatrix = (adjacencyMatrix: GraphAdjacencyMatrix): GraphAdjacencyMatrix => ({
  labels: [...adjacencyMatrix.labels],
  rows: adjacencyMatrix.rows.map((row) => [...row]),
})

const createUndirectedEdgeKey = (leftNodeId: string, rightNodeId: string) =>
  leftNodeId < rightNodeId
    ? `${leftNodeId}::${rightNodeId}`
    : `${rightNodeId}::${leftNodeId}`

const createDirectedEdgeKey = (fromNodeId: string, toNodeId: string) =>
  `${fromNodeId}->${toNodeId}`

const createEdgeLookupKey = (
  fromNodeId: string,
  toNodeId: string,
  options?: GraphDirectionOptions,
) =>
  options?.directed === true
    ? createDirectedEdgeKey(fromNodeId, toNodeId)
    : createUndirectedEdgeKey(fromNodeId, toNodeId)

const createEdgeIdByKey = (
  edges: readonly GraphEdge[],
  options?: GraphDirectionOptions,
) =>
  edges.reduce<Record<string, string>>((accumulator, edge) => {
    accumulator[createEdgeLookupKey(edge.from, edge.to, options)] = edge.id
    return accumulator
  }, {})

const sortNodeIdsByLabel = (
  nodeIds: readonly string[],
  labelByNodeId: Readonly<Record<string, string>>,
) =>
  [...nodeIds].sort((left, right) => compareLabels(labelByNodeId[left] ?? '', labelByNodeId[right] ?? ''))

const sortEdgeIds = (edgeIds: readonly string[]) => [...edgeIds].sort(compareLabels)

const compareEdgeByWeightAndLabels = (
  left: GraphEdge,
  right: GraphEdge,
  labelByNodeId: Readonly<Record<string, string>>,
) => {
  if (left.weight !== right.weight) {
    return left.weight - right.weight
  }

  const leftFromLabel = labelByNodeId[left.from] ?? left.from
  const rightFromLabel = labelByNodeId[right.from] ?? right.from
  const fromComparison = compareLabels(leftFromLabel, rightFromLabel)
  if (fromComparison !== 0) {
    return fromComparison
  }

  const leftToLabel = labelByNodeId[left.to] ?? left.to
  const rightToLabel = labelByNodeId[right.to] ?? right.to
  const toComparison = compareLabels(leftToLabel, rightToLabel)
  if (toComparison !== 0) {
    return toComparison
  }

  return compareLabels(left.id, right.id)
}

const isUndirectedGraphConnected = (graph: GraphModel): boolean => {
  if (graph.nodes.length <= 1) {
    return true
  }

  const adjacencyList = buildAdjacencyList(graph, { weighted: true })
  const neighborsByNodeId = adjacencyList.reduce<Record<string, readonly GraphNeighbor[]>>(
    (accumulator, entry) => {
      accumulator[entry.nodeId] = entry.neighbors
      return accumulator
    },
    {},
  )
  const orderedNodeIds = [...graph.nodes].sort(compareNodesByLabel).map((node) => node.id)
  const rootNodeId = orderedNodeIds[0]
  if (rootNodeId === undefined) {
    return true
  }

  const visitedNodeIds = new Set<string>([rootNodeId])
  const queueNodeIds = [rootNodeId]
  while (queueNodeIds.length > 0) {
    const currentNodeId = queueNodeIds.shift()
    if (currentNodeId === undefined) {
      continue
    }

    const neighbors = neighborsByNodeId[currentNodeId] ?? []
    neighbors.forEach((neighbor) => {
      if (visitedNodeIds.has(neighbor.nodeId)) {
        return
      }

      visitedNodeIds.add(neighbor.nodeId)
      queueNodeIds.push(neighbor.nodeId)
    })
  }

  return visitedNodeIds.size === graph.nodes.length
}

const buildAdjacencyList = (
  graph: GraphModel,
  options?: GraphDirectionOptions,
): readonly GraphAdjacencyEntry[] => {
  const isDirected = options?.directed === true
  const isWeighted = options?.weighted === true
  const orderedNodes = [...graph.nodes].sort(compareNodesByLabel)
  const nodeById = graph.nodes.reduce<Record<string, GraphNode>>((accumulator, node) => {
    accumulator[node.id] = node
    return accumulator
  }, {})
  const neighborsByNodeId = orderedNodes.reduce<Record<string, GraphNeighbor[]>>(
    (accumulator, node) => {
      accumulator[node.id] = []
      return accumulator
    },
    {},
  )

  graph.edges.forEach((edge) => {
    const leftNode = nodeById[edge.from]
    const rightNode = nodeById[edge.to]
    if (leftNode === undefined || rightNode === undefined) {
      return
    }

    const leftNeighbors = neighborsByNodeId[leftNode.id]
    const rightNeighbors = neighborsByNodeId[rightNode.id]
    if (leftNeighbors === undefined || rightNeighbors === undefined) {
      return
    }

    leftNeighbors.push({
      nodeId: rightNode.id,
      label: rightNode.label,
      weight: isWeighted ? edge.weight : 1,
    })

    if (!isDirected) {
      rightNeighbors.push({
        nodeId: leftNode.id,
        label: leftNode.label,
        weight: isWeighted ? edge.weight : 1,
      })
    }
  })

  return orderedNodes.map((node) => ({
    nodeId: node.id,
    label: node.label,
    neighbors: [...(neighborsByNodeId[node.id] ?? [])].sort((left, right) =>
      compareLabels(left.label, right.label),
    ),
  }))
}

const buildAdjacencyMatrix = (
  graph: GraphModel,
  options?: GraphDirectionOptions,
): GraphAdjacencyMatrix => {
  const isDirected = options?.directed === true
  const isWeighted = options?.weighted === true
  const orderedNodes = [...graph.nodes].sort(compareNodesByLabel)
  const indexByNodeId = orderedNodes.reduce<Record<string, number>>((accumulator, node, index) => {
    accumulator[node.id] = index
    return accumulator
  }, {})
  const rows: (number | null)[][] = orderedNodes.map((_, rowIndex) =>
    orderedNodes.map((__, columnIndex) =>
      isWeighted
        ? (rowIndex === columnIndex ? 0 : null)
        : 0,
    ),
  )

  graph.edges.forEach((edge) => {
    const leftIndex = indexByNodeId[edge.from]
    const rightIndex = indexByNodeId[edge.to]
    if (leftIndex === undefined || rightIndex === undefined) {
      return
    }

    const leftRow = rows[leftIndex]
    const rightRow = rows[rightIndex]
    if (leftRow === undefined || rightRow === undefined) {
      return
    }

    leftRow[rightIndex] = isWeighted ? edge.weight : 1
    if (!isDirected) {
      rightRow[leftIndex] = isWeighted ? edge.weight : 1
    }
  })

  return {
    labels: orderedNodes.map((node) => node.label),
    rows,
  }
}

const createGraphLineEvents = (frames: readonly FrameWithExecutedLines[]): readonly LineEvent[] =>
  frames.flatMap((frame, frameIndex) =>
    frame.executedLines.map((lineNumber) => ({
      frameIndex,
      lineNumber,
    })),
  )

const createEmptyRepresentationFrame = (): GraphRepresentationFrame => ({
  graph: emptyGraphModel,
  executedLines: [],
  operationText: 'graph is empty',
  adjacencyList: [],
  adjacencyMatrix: emptyAdjacencyMatrix,
})

const getGraphRepresentationFrameByLineEvent = (
  timeline: GraphRepresentationTimeline,
  lineEvents: readonly LineEvent[],
  lineEventIndex: number,
): GraphRepresentationFrame => {
  if (timeline.frames.length === 0) {
    return createEmptyRepresentationFrame()
  }

  if (lineEvents.length === 0) {
    return timeline.frames[0] ?? createEmptyRepresentationFrame()
  }

  const boundedLineEventIndex = Math.max(0, Math.min(lineEventIndex, lineEvents.length - 1))
  const activeEvent = lineEvents[boundedLineEventIndex]
  const frameIndex = activeEvent?.frameIndex ?? 0
  return timeline.frames[frameIndex] ?? timeline.frames[0] ?? createEmptyRepresentationFrame()
}

const createEmptyTraversalFrame = (): GraphTraversalFrame => ({
  graph: emptyGraphModel,
  executedLines: [],
  operationText: 'graph is empty',
  adjacencyList: [],
  adjacencyMatrix: emptyAdjacencyMatrix,
  activeNodeId: null,
  activeEdgeId: null,
  discoveredNodeIds: [],
  processingNodeIds: [],
  completedNodeIds: [],
  queueNodeIds: [],
  callStackNodeIds: [],
  parentByNodeId: {},
  distanceByNodeId: {},
  visitOrderNodeIds: [],
  traversalTreeEdgeIds: [],
  reconstructedPathNodeIds: [],
  reconstructedPathEdgeIds: [],
  isComplete: true,
})

const getGraphTraversalFrameByLineEvent = (
  timeline: GraphTraversalTimeline,
  lineEvents: readonly LineEvent[],
  lineEventIndex: number,
): GraphTraversalFrame => {
  if (timeline.frames.length === 0) {
    return createEmptyTraversalFrame()
  }

  if (lineEvents.length === 0) {
    return timeline.frames[0] ?? createEmptyTraversalFrame()
  }

  const boundedLineEventIndex = Math.max(0, Math.min(lineEventIndex, lineEvents.length - 1))
  const activeEvent = lineEvents[boundedLineEventIndex]
  const frameIndex = activeEvent?.frameIndex ?? 0
  return timeline.frames[frameIndex] ?? timeline.frames[0] ?? createEmptyTraversalFrame()
}

const toTraversalRoots = (
  graph: GraphModel,
  startNodeId: string | null,
  scope: GraphTraversalScope,
): readonly string[] => {
  const orderedNodes = [...graph.nodes].sort(compareNodesByLabel)
  if (orderedNodes.length === 0) {
    return []
  }

  const firstNodeId = orderedNodes[0]?.id ?? null
  const rootNodeId =
    startNodeId !== null && orderedNodes.some((node) => node.id === startNodeId)
      ? startNodeId
      : firstNodeId

  if (rootNodeId === null) {
    return []
  }

  if (scope === 'start-only') {
    return [rootNodeId]
  }

  return [
    rootNodeId,
    ...orderedNodes
      .map((node) => node.id)
      .filter((nodeId) => nodeId !== rootNodeId),
  ]
}

const createPathEdgeIds = (
  nodeIds: readonly string[],
  edgeIdByKey: Readonly<Record<string, string>>,
  options?: GraphDirectionOptions,
): readonly string[] => {
  if (nodeIds.length <= 1) {
    return []
  }

  const edgeIds: string[] = []
  for (let index = 0; index < nodeIds.length - 1; index += 1) {
    const leftNodeId = nodeIds[index]
    const rightNodeId = nodeIds[index + 1]
    if (leftNodeId === undefined || rightNodeId === undefined) {
      continue
    }

    const edgeId = edgeIdByKey[createEdgeLookupKey(leftNodeId, rightNodeId, options)]
    if (edgeId !== undefined) {
      edgeIds.push(edgeId)
    }
  }

  return edgeIds
}

const reconstructPathFromPred = (
  startNodeId: string | null,
  targetNodeId: string | null,
  parentByNodeId: Readonly<Record<string, string | null>>,
): readonly string[] => {
  if (startNodeId === null || targetNodeId === null) {
    return []
  }

  const reversedPath: string[] = []
  const guardNodeIds = new Set<string>()
  let cursorNodeId: string | null = targetNodeId

  while (cursorNodeId !== null) {
    if (guardNodeIds.has(cursorNodeId)) {
      return []
    }

    guardNodeIds.add(cursorNodeId)
    reversedPath.push(cursorNodeId)
    if (cursorNodeId === startNodeId) {
      return [...reversedPath].reverse()
    }

    cursorNodeId = parentByNodeId[cursorNodeId] ?? null
  }

  return []
}

const NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY

const formatDistance = (value: number | null) => {
  if (value === null) {
    return 'INF'
  }

  if (value === NEGATIVE_INFINITY) {
    return '-INF'
  }

  return `${value}`
}

const cloneDistanceMatrix = (
  matrix: readonly (readonly (number | null)[])[],
): readonly (readonly (number | null)[])[] =>
  matrix.map((row) => [...row])

const createGraphRepresentationTimeline = (graph: GraphModel): GraphRepresentationTimeline => {
  const adjacencyList = buildAdjacencyList(graph)
  const adjacencyMatrix = buildAdjacencyMatrix(graph)
  const graphSnapshot = cloneGraphModel(graph)

  return {
    algorithmId: 'graph-representation',
    title: 'Graph Representation',
    pseudocodeLines: graphRepresentationPseudocodeLines,
    frames: [
      {
        graph: graphSnapshot,
        executedLines: [1],
        operationText: 'loaded graph model from editor canvas',
        adjacencyList: [],
        adjacencyMatrix: emptyAdjacencyMatrix,
      },
      {
        graph: graphSnapshot,
        executedLines: [2],
        operationText: 'built adjacency list from undirected edge set',
        adjacencyList,
        adjacencyMatrix: emptyAdjacencyMatrix,
      },
      {
        graph: graphSnapshot,
        executedLines: [3],
        operationText: 'built adjacency matrix using sorted node order',
        adjacencyList,
        adjacencyMatrix,
      },
    ],
  }
}

const createBfsTimeline = ({
  graph,
  startNodeId,
  targetNodeId,
  scope,
}: Readonly<{
  graph: GraphModel
  startNodeId: string | null
  targetNodeId?: string | null
  scope: GraphTraversalScope
}>): GraphTraversalTimeline => {
  const adjacencyList = buildAdjacencyList(graph)
  const adjacencyMatrix = buildAdjacencyMatrix(graph)
  const labelByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.label
    return accumulator
  }, {})
  const edgeIdByKey = createEdgeIdByKey(graph.edges)
  const frames: GraphTraversalFrame[] = []
  const roots = toTraversalRoots(graph, startNodeId, scope)
  const resolvedStartNodeId = roots[0] ?? null
  const resolvedTargetNodeId =
    targetNodeId !== undefined &&
    targetNodeId !== null &&
    graph.nodes.some((node) => node.id === targetNodeId)
      ? targetNodeId
      : null
  const parentByNodeId = graph.nodes.reduce<Record<string, string | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const distanceByNodeId = graph.nodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const visitedNodeIds = new Set<string>()
  const completedNodeIds = new Set<string>()
  const queueNodeIds: string[] = []
  const visitOrderNodeIds: string[] = []
  const treeEdgeIds = new Set<string>()
  let reconstructedPathNodeIds: readonly string[] = []
  let reconstructedPathEdgeIds: readonly string[] = []

  const addFrame = ({
    executedLines,
    operationText,
    activeNodeId = null,
    activeEdgeId = null,
    processingNodeIds = [],
    isComplete = false,
  }: Readonly<{
    executedLines: readonly number[]
    operationText: string
    activeNodeId?: string | null
    activeEdgeId?: string | null
    processingNodeIds?: readonly string[]
    isComplete?: boolean
  }>) => {
    frames.push({
      graph: cloneGraphModel(graph),
      executedLines: [...executedLines],
      operationText,
      adjacencyList: cloneAdjacencyList(adjacencyList),
      adjacencyMatrix: cloneAdjacencyMatrix(adjacencyMatrix),
      activeNodeId,
      activeEdgeId,
      discoveredNodeIds: sortNodeIdsByLabel([...visitedNodeIds], labelByNodeId),
      processingNodeIds: [...processingNodeIds],
      completedNodeIds: sortNodeIdsByLabel([...completedNodeIds], labelByNodeId),
      queueNodeIds: [...queueNodeIds],
      callStackNodeIds: [],
      parentByNodeId: { ...parentByNodeId },
      distanceByNodeId: { ...distanceByNodeId },
      visitOrderNodeIds: [...visitOrderNodeIds],
      traversalTreeEdgeIds: sortEdgeIds([...treeEdgeIds]),
      reconstructedPathNodeIds: [...reconstructedPathNodeIds],
      reconstructedPathEdgeIds: [...reconstructedPathEdgeIds],
      isComplete,
    })
  }

  addFrame({
    executedLines: [1],
    operationText:
      resolvedStartNodeId === null
        ? 'BFS initialised with an empty graph'
        : `BFS initialised from start ${labelByNodeId[resolvedStartNodeId]}`,
  })

  addFrame({
    executedLines: [2],
    operationText: 'visited, dist, and pred tables initialised',
  })

  roots.forEach((rootNodeId) => {
    addFrame({
      executedLines: [3],
      operationText: `evaluate root ${labelByNodeId[rootNodeId]}`,
      activeNodeId: rootNodeId,
    })

    if (visitedNodeIds.has(rootNodeId)) {
      addFrame({
        executedLines: [4],
        operationText: `root ${labelByNodeId[rootNodeId]} already visited, skip`,
        activeNodeId: rootNodeId,
      })
      return
    }

    visitedNodeIds.add(rootNodeId)
    if (distanceByNodeId[rootNodeId] === null) {
      distanceByNodeId[rootNodeId] = 0
    }
    queueNodeIds.push(rootNodeId)
    visitOrderNodeIds.push(rootNodeId)

    addFrame({
      executedLines: [5, 6, 7, 8],
      operationText: `discover root ${labelByNodeId[rootNodeId]} and enqueue`,
      activeNodeId: rootNodeId,
      processingNodeIds: [rootNodeId],
    })

    while (queueNodeIds.length > 0) {
      addFrame({
        executedLines: [9],
        operationText: 'queue not empty, continue BFS loop',
        processingNodeIds: queueNodeIds.length > 0 ? [queueNodeIds[0] ?? rootNodeId] : [],
      })

      const currentNodeId = queueNodeIds.shift()
      if (currentNodeId === undefined) {
        continue
      }

      addFrame({
        executedLines: [10],
        operationText: `pop ${labelByNodeId[currentNodeId]} from queue`,
        activeNodeId: currentNodeId,
        processingNodeIds: [currentNodeId],
      })

      const neighborEntries = adjacencyList.find((entry) => entry.nodeId === currentNodeId)?.neighbors ?? []
      neighborEntries.forEach((neighbor) => {
        const edgeId = edgeIdByKey[createUndirectedEdgeKey(currentNodeId, neighbor.nodeId)] ?? null

        addFrame({
          executedLines: [11],
          operationText: `inspect edge ${labelByNodeId[currentNodeId]} - ${neighbor.label}`,
          activeNodeId: currentNodeId,
          activeEdgeId: edgeId,
          processingNodeIds: [currentNodeId],
        })

        const isUndiscovered = !visitedNodeIds.has(neighbor.nodeId)
        addFrame({
          executedLines: [12],
          operationText: isUndiscovered
            ? `${neighbor.label} is undiscovered`
            : `${neighbor.label} already discovered, skip`,
          activeNodeId: neighbor.nodeId,
          activeEdgeId: edgeId,
          processingNodeIds: [currentNodeId],
        })

        if (!isUndiscovered) {
          return
        }

        visitedNodeIds.add(neighbor.nodeId)
        parentByNodeId[neighbor.nodeId] = currentNodeId
        const baseDistance = distanceByNodeId[currentNodeId] ?? 0
        distanceByNodeId[neighbor.nodeId] = baseDistance + 1
        visitOrderNodeIds.push(neighbor.nodeId)
        if (edgeId !== null) {
          treeEdgeIds.add(edgeId)
        }

        addFrame({
          executedLines: [13, 14],
          operationText: `set dist[${neighbor.label}] = ${baseDistance + 1}, pred[${neighbor.label}] = ${labelByNodeId[currentNodeId]}`,
          activeNodeId: neighbor.nodeId,
          activeEdgeId: edgeId,
          processingNodeIds: [currentNodeId],
        })

        queueNodeIds.push(neighbor.nodeId)
        addFrame({
          executedLines: [15],
          operationText: `enqueue ${neighbor.label}`,
          activeNodeId: neighbor.nodeId,
          activeEdgeId: edgeId,
          processingNodeIds: [currentNodeId],
        })
      })

      completedNodeIds.add(currentNodeId)
      addFrame({
        executedLines: [9],
        operationText: `${labelByNodeId[currentNodeId]} marked complete`,
        activeNodeId: currentNodeId,
      })
    }
  })

  reconstructedPathNodeIds = reconstructPathFromPred(
    resolvedStartNodeId,
    resolvedTargetNodeId,
    parentByNodeId,
  )
  reconstructedPathEdgeIds = createPathEdgeIds(reconstructedPathNodeIds, edgeIdByKey)

  addFrame({
    executedLines: [16],
    operationText:
      resolvedTargetNodeId === null
        ? 'target not set, skip path reconstruction'
        : reconstructedPathNodeIds.length > 0
          ? `shortest path: ${reconstructedPathNodeIds
              .map((nodeId) => labelByNodeId[nodeId] ?? nodeId)
              .join(' -> ')}`
          : `target ${labelByNodeId[resolvedTargetNodeId]} unreachable from start`,
    activeNodeId: resolvedTargetNodeId,
    isComplete: true,
  })

  return {
    algorithmId: 'breadth-first-search',
    title: 'Breadth First Search',
    pseudocodeLines: bfsPseudocodeLines,
    frames,
    startNodeId: resolvedStartNodeId,
    targetNodeId: resolvedTargetNodeId,
    scope,
  }
}

const createDfsTimeline = ({
  graph,
  startNodeId,
  scope,
}: Readonly<{
  graph: GraphModel
  startNodeId: string | null
  scope: GraphTraversalScope
}>): GraphTraversalTimeline => {
  const adjacencyList = buildAdjacencyList(graph)
  const adjacencyMatrix = buildAdjacencyMatrix(graph)
  const labelByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.label
    return accumulator
  }, {})
  const edgeIdByKey = createEdgeIdByKey(graph.edges)
  const frames: GraphTraversalFrame[] = []
  const roots = toTraversalRoots(graph, startNodeId, scope)
  const resolvedStartNodeId = roots[0] ?? null
  const parentByNodeId = graph.nodes.reduce<Record<string, string | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const distanceByNodeId = graph.nodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const visitedNodeIds = new Set<string>()
  const completedNodeIds = new Set<string>()
  const callStackNodeIds: string[] = []
  const visitOrderNodeIds: string[] = []
  const treeEdgeIds = new Set<string>()

  const addFrame = ({
    executedLines,
    operationText,
    activeNodeId = null,
    activeEdgeId = null,
    processingNodeIds = [],
    isComplete = false,
  }: Readonly<{
    executedLines: readonly number[]
    operationText: string
    activeNodeId?: string | null
    activeEdgeId?: string | null
    processingNodeIds?: readonly string[]
    isComplete?: boolean
  }>) => {
    frames.push({
      graph: cloneGraphModel(graph),
      executedLines: [...executedLines],
      operationText,
      adjacencyList: cloneAdjacencyList(adjacencyList),
      adjacencyMatrix: cloneAdjacencyMatrix(adjacencyMatrix),
      activeNodeId,
      activeEdgeId,
      discoveredNodeIds: sortNodeIdsByLabel([...visitedNodeIds], labelByNodeId),
      processingNodeIds: [...processingNodeIds],
      completedNodeIds: sortNodeIdsByLabel([...completedNodeIds], labelByNodeId),
      queueNodeIds: [],
      callStackNodeIds: [...callStackNodeIds],
      parentByNodeId: { ...parentByNodeId },
      distanceByNodeId: { ...distanceByNodeId },
      visitOrderNodeIds: [...visitOrderNodeIds],
      traversalTreeEdgeIds: sortEdgeIds([...treeEdgeIds]),
      reconstructedPathNodeIds: [],
      reconstructedPathEdgeIds: [],
      isComplete,
    })
  }

  const runDfs = (currentNodeId: string, incomingNodeId: string | null) => {
    addFrame({
      executedLines: [5],
      operationText: `enter DFS(${labelByNodeId[currentNodeId]})`,
      activeNodeId: currentNodeId,
      processingNodeIds: [currentNodeId],
    })

    callStackNodeIds.push(currentNodeId)
    visitedNodeIds.add(currentNodeId)
    if (incomingNodeId !== null) {
      parentByNodeId[currentNodeId] = incomingNodeId
      const edgeId = edgeIdByKey[createUndirectedEdgeKey(incomingNodeId, currentNodeId)]
      if (edgeId !== undefined) {
        treeEdgeIds.add(edgeId)
      }
    }
    visitOrderNodeIds.push(currentNodeId)

    addFrame({
      executedLines: [6],
      operationText: `mark ${labelByNodeId[currentNodeId]} as visited`,
      activeNodeId: currentNodeId,
      processingNodeIds: [currentNodeId],
    })

    const neighbors = adjacencyList.find((entry) => entry.nodeId === currentNodeId)?.neighbors ?? []
    neighbors.forEach((neighbor) => {
      const edgeId = edgeIdByKey[createUndirectedEdgeKey(currentNodeId, neighbor.nodeId)] ?? null
      addFrame({
        executedLines: [7],
        operationText: `inspect edge ${labelByNodeId[currentNodeId]} - ${neighbor.label}`,
        activeNodeId: currentNodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      const shouldRecurse = !visitedNodeIds.has(neighbor.nodeId)
      addFrame({
        executedLines: [8],
        operationText: shouldRecurse
          ? `${neighbor.label} not visited, recurse`
          : `${neighbor.label} already visited, skip`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      if (!shouldRecurse) {
        return
      }

      parentByNodeId[neighbor.nodeId] = currentNodeId
      addFrame({
        executedLines: [9],
        operationText: `set pred[${neighbor.label}] = ${labelByNodeId[currentNodeId]}`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      addFrame({
        executedLines: [10],
        operationText: `call DFS(${neighbor.label})`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })
      runDfs(neighbor.nodeId, currentNodeId)
    })

    completedNodeIds.add(currentNodeId)
    callStackNodeIds.pop()
    addFrame({
      executedLines: [11],
      operationText: `finish ${labelByNodeId[currentNodeId]} and return`,
      activeNodeId: currentNodeId,
      processingNodeIds: callStackNodeIds.length > 0 ? [callStackNodeIds[callStackNodeIds.length - 1] ?? currentNodeId] : [],
    })
  }

  addFrame({
    executedLines: [1],
    operationText:
      resolvedStartNodeId === null
        ? 'DFS initialised with an empty graph'
        : `DFS initialised from start ${labelByNodeId[resolvedStartNodeId]}`,
  })

  addFrame({
    executedLines: [2],
    operationText: 'visited and predecessor tables initialised',
  })

  roots.forEach((rootNodeId) => {
    addFrame({
      executedLines: [3],
      operationText: `evaluate root ${labelByNodeId[rootNodeId]}`,
      activeNodeId: rootNodeId,
    })

    if (visitedNodeIds.has(rootNodeId)) {
      addFrame({
        executedLines: [4],
        operationText: `${labelByNodeId[rootNodeId]} already visited, skip`,
        activeNodeId: rootNodeId,
      })
      return
    }

    addFrame({
      executedLines: [4],
      operationText: `call DFS(${labelByNodeId[rootNodeId]})`,
      activeNodeId: rootNodeId,
    })
    runDfs(rootNodeId, null)
  })

  addFrame({
    executedLines: [12],
    operationText: 'DFS traversal complete',
    isComplete: true,
  })

  return {
    algorithmId: 'depth-first-search',
    title: 'Depth First Search',
    pseudocodeLines: dfsPseudocodeLines,
    frames,
    startNodeId: resolvedStartNodeId,
    targetNodeId: null,
    scope,
  }
}

const createConnectedComponentsTimeline = ({
  graph,
  scope,
}: Readonly<{
  graph: GraphModel
  scope: GraphTraversalScope
}>): GraphTraversalTimeline => {
  const adjacencyList = buildAdjacencyList(graph)
  const adjacencyMatrix = buildAdjacencyMatrix(graph)
  const labelByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.label
    return accumulator
  }, {})
  const edgeIdByKey = createEdgeIdByKey(graph.edges)
  const orderedNodeIds = [...graph.nodes]
    .sort(compareNodesByLabel)
    .map((node) => node.id)
  const roots = scope === 'start-only' ? orderedNodeIds.slice(0, 1) : orderedNodeIds
  const resolvedStartNodeId = roots[0] ?? null
  const parentByNodeId = graph.nodes.reduce<Record<string, string | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const distanceByNodeId = graph.nodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const componentByNodeId = graph.nodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const discoveredNodeIds = new Set<string>()
  const completedNodeIds = new Set<string>()
  const callStackNodeIds: string[] = []
  const visitOrderNodeIds: string[] = []
  const treeEdgeIds = new Set<string>()
  const frames: GraphTraversalFrame[] = []
  let componentCount = 0

  const addFrame = ({
    executedLines,
    operationText,
    activeNodeId = null,
    activeEdgeId = null,
    processingNodeIds = [],
    isComplete = false,
  }: Readonly<{
    executedLines: readonly number[]
    operationText: string
    activeNodeId?: string | null
    activeEdgeId?: string | null
    processingNodeIds?: readonly string[]
    isComplete?: boolean
  }>) => {
    frames.push({
      graph: cloneGraphModel(graph),
      executedLines: [...executedLines],
      operationText,
      adjacencyList: cloneAdjacencyList(adjacencyList),
      adjacencyMatrix: cloneAdjacencyMatrix(adjacencyMatrix),
      activeNodeId,
      activeEdgeId,
      discoveredNodeIds: sortNodeIdsByLabel([...discoveredNodeIds], labelByNodeId),
      processingNodeIds: [...processingNodeIds],
      completedNodeIds: sortNodeIdsByLabel([...completedNodeIds], labelByNodeId),
      queueNodeIds: [],
      callStackNodeIds: [...callStackNodeIds],
      parentByNodeId: { ...parentByNodeId },
      distanceByNodeId: { ...distanceByNodeId },
      visitOrderNodeIds: [...visitOrderNodeIds],
      traversalTreeEdgeIds: sortEdgeIds([...treeEdgeIds]),
      reconstructedPathNodeIds: [],
      reconstructedPathEdgeIds: [],
      componentByNodeId: { ...componentByNodeId },
      componentCount,
      isComplete,
    })
  }

  const runComponentDfs = (currentNodeId: string, componentId: number, incomingNodeId: string | null) => {
    addFrame({
      executedLines: [8],
      operationText: `enter DFS(${labelByNodeId[currentNodeId]}, c=${componentId})`,
      activeNodeId: currentNodeId,
      processingNodeIds: [currentNodeId],
    })

    callStackNodeIds.push(currentNodeId)
    componentByNodeId[currentNodeId] = componentId
    discoveredNodeIds.add(currentNodeId)
    visitOrderNodeIds.push(currentNodeId)

    if (incomingNodeId !== null) {
      parentByNodeId[currentNodeId] = incomingNodeId
      const edgeId = edgeIdByKey[createUndirectedEdgeKey(incomingNodeId, currentNodeId)]
      if (edgeId !== undefined) {
        treeEdgeIds.add(edgeId)
      }
    }

    addFrame({
      executedLines: [9],
      operationText: `assign component[${labelByNodeId[currentNodeId]}] = ${componentId}`,
      activeNodeId: currentNodeId,
      processingNodeIds: [currentNodeId],
    })

    const neighbors = adjacencyList.find((entry) => entry.nodeId === currentNodeId)?.neighbors ?? []
    neighbors.forEach((neighbor) => {
      const edgeId = edgeIdByKey[createUndirectedEdgeKey(currentNodeId, neighbor.nodeId)] ?? null
      addFrame({
        executedLines: [10],
        operationText: `inspect edge ${labelByNodeId[currentNodeId]} - ${neighbor.label}`,
        activeNodeId: currentNodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      const hasComponent = componentByNodeId[neighbor.nodeId] !== null
      addFrame({
        executedLines: [11],
        operationText: hasComponent
          ? `component[${neighbor.label}] already assigned, skip`
          : `component[${neighbor.label}] is null`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      if (hasComponent) {
        return
      }

      addFrame({
        executedLines: [12],
        operationText: `recurse DFS(${neighbor.label}, c=${componentId})`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })
      runComponentDfs(neighbor.nodeId, componentId, currentNodeId)
    })

    completedNodeIds.add(currentNodeId)
    callStackNodeIds.pop()
    addFrame({
      executedLines: [8],
      operationText: `finish DFS(${labelByNodeId[currentNodeId]})`,
      activeNodeId: currentNodeId,
      processingNodeIds:
        callStackNodeIds.length > 0
          ? [callStackNodeIds[callStackNodeIds.length - 1] ?? currentNodeId]
          : [],
    })
  }

  addFrame({
    executedLines: [1],
    operationText: 'initialise connected-components DFS driver',
  })

  addFrame({
    executedLines: [2],
    operationText: 'component[v] set to null for all vertices',
  })

  addFrame({
    executedLines: [3],
    operationText: 'component counter set to 0',
  })

  roots.forEach((rootNodeId) => {
    addFrame({
      executedLines: [4],
      operationText: `evaluate vertex ${labelByNodeId[rootNodeId]}`,
      activeNodeId: rootNodeId,
    })

    const hasComponent = componentByNodeId[rootNodeId] !== null
    addFrame({
      executedLines: [5],
      operationText: hasComponent
        ? `${labelByNodeId[rootNodeId]} already belongs to a component`
        : `${labelByNodeId[rootNodeId]} starts a new component`,
      activeNodeId: rootNodeId,
    })

    if (hasComponent) {
      return
    }

    componentCount += 1
    addFrame({
      executedLines: [6],
      operationText: `increment component counter to ${componentCount}`,
      activeNodeId: rootNodeId,
    })

    addFrame({
      executedLines: [7],
      operationText: `call DFS(${labelByNodeId[rootNodeId]}, c=${componentCount})`,
      activeNodeId: rootNodeId,
    })
    runComponentDfs(rootNodeId, componentCount, null)
  })

  addFrame({
    executedLines: [13],
    operationText: `found ${componentCount} connected component(s), O(|V| + |E|)`,
    isComplete: true,
  })

  return {
    algorithmId: 'connected-components',
    title: 'Connected Components',
    pseudocodeLines: connectedComponentsPseudocodeLines,
    frames,
    startNodeId: resolvedStartNodeId,
    targetNodeId: null,
    scope,
  }
}

const createTopologicalSortTimeline = ({
  graph,
  scope,
}: Readonly<{
  graph: GraphModel
  scope: GraphTraversalScope
}>): GraphTraversalTimeline => {
  const adjacencyList = buildAdjacencyList(graph, { directed: true })
  const adjacencyMatrix = buildAdjacencyMatrix(graph, { directed: true })
  const labelByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.label
    return accumulator
  }, {})
  const edgeIdByKey = createEdgeIdByKey(graph.edges, { directed: true })
  const orderedNodeIds = [...graph.nodes]
    .sort(compareNodesByLabel)
    .map((node) => node.id)
  const roots = scope === 'start-only' ? orderedNodeIds.slice(0, 1) : orderedNodeIds
  const resolvedStartNodeId = roots[0] ?? null
  const parentByNodeId = graph.nodes.reduce<Record<string, string | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const distanceByNodeId = graph.nodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const discoveredNodeIds = new Set<string>()
  const processingNodeIds = new Set<string>()
  const completedNodeIds = new Set<string>()
  const callStackNodeIds: string[] = []
  const visitOrderNodeIds: string[] = []
  const treeEdgeIds = new Set<string>()
  const finishOrderNodeIds: string[] = []
  let cycleDetected = false
  const frames: GraphTraversalFrame[] = []

  const addFrame = ({
    executedLines,
    operationText,
    activeNodeId = null,
    activeEdgeId = null,
    processingNodeId = null,
    isComplete = false,
  }: Readonly<{
    executedLines: readonly number[]
    operationText: string
    activeNodeId?: string | null
    activeEdgeId?: string | null
    processingNodeId?: string | null
    isComplete?: boolean
  }>) => {
    frames.push({
      graph: cloneGraphModel(graph),
      executedLines: [...executedLines],
      operationText,
      adjacencyList: cloneAdjacencyList(adjacencyList),
      adjacencyMatrix: cloneAdjacencyMatrix(adjacencyMatrix),
      activeNodeId,
      activeEdgeId,
      discoveredNodeIds: sortNodeIdsByLabel([...discoveredNodeIds], labelByNodeId),
      processingNodeIds:
        processingNodeId === null ? [] : [processingNodeId],
      completedNodeIds: sortNodeIdsByLabel([...completedNodeIds], labelByNodeId),
      queueNodeIds: [],
      callStackNodeIds: [...callStackNodeIds],
      parentByNodeId: { ...parentByNodeId },
      distanceByNodeId: { ...distanceByNodeId },
      visitOrderNodeIds: [...visitOrderNodeIds],
      traversalTreeEdgeIds: sortEdgeIds([...treeEdgeIds]),
      reconstructedPathNodeIds: [],
      reconstructedPathEdgeIds: [],
      finishOrderNodeIds: [...finishOrderNodeIds],
      topologicalOrderNodeIds: [...finishOrderNodeIds].reverse(),
      cycleDetected,
      isComplete,
    })
  }

  const runTopoDfs = (currentNodeId: string, incomingNodeId: string | null) => {
    if (cycleDetected) {
      return
    }

    addFrame({
      executedLines: [8],
      operationText: `enter DFS(${labelByNodeId[currentNodeId]})`,
      activeNodeId: currentNodeId,
      processingNodeId: currentNodeId,
    })

    callStackNodeIds.push(currentNodeId)
    discoveredNodeIds.add(currentNodeId)
    processingNodeIds.add(currentNodeId)
    visitOrderNodeIds.push(currentNodeId)

    if (incomingNodeId !== null) {
      parentByNodeId[currentNodeId] = incomingNodeId
      const edgeId = edgeIdByKey[createDirectedEdgeKey(incomingNodeId, currentNodeId)]
      if (edgeId !== undefined) {
        treeEdgeIds.add(edgeId)
      }
    }

    addFrame({
      executedLines: [9],
      operationText: `${labelByNodeId[currentNodeId]} marked VISITING`,
      activeNodeId: currentNodeId,
      processingNodeId: currentNodeId,
    })

    const neighbors = adjacencyList.find((entry) => entry.nodeId === currentNodeId)?.neighbors ?? []
    for (const neighbor of neighbors) {
      if (cycleDetected) {
        break
      }

      const edgeId = edgeIdByKey[createDirectedEdgeKey(currentNodeId, neighbor.nodeId)] ?? null
      addFrame({
        executedLines: [10],
        operationText: `inspect directed edge ${labelByNodeId[currentNodeId]} -> ${neighbor.label}`,
        activeNodeId: currentNodeId,
        activeEdgeId: edgeId,
        processingNodeId: currentNodeId,
      })

      if (processingNodeIds.has(neighbor.nodeId)) {
        cycleDetected = true
        addFrame({
          executedLines: [11],
          operationText: `cycle detected at back-edge ${labelByNodeId[currentNodeId]} -> ${neighbor.label}`,
          activeNodeId: neighbor.nodeId,
          activeEdgeId: edgeId,
          processingNodeId: currentNodeId,
        })
        break
      }

      if (discoveredNodeIds.has(neighbor.nodeId)) {
        addFrame({
          executedLines: [12],
          operationText: `${neighbor.label} already visited, skip`,
          activeNodeId: neighbor.nodeId,
          activeEdgeId: edgeId,
          processingNodeId: currentNodeId,
        })
        continue
      }

      addFrame({
        executedLines: [12],
        operationText: `recurse DFS(${neighbor.label})`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeId: currentNodeId,
      })
      runTopoDfs(neighbor.nodeId, currentNodeId)
    }

    if (cycleDetected) {
      return
    }

    processingNodeIds.delete(currentNodeId)
    completedNodeIds.add(currentNodeId)
    callStackNodeIds.pop()
    finishOrderNodeIds.push(currentNodeId)

    addFrame({
      executedLines: [13, 14],
      operationText: `mark ${labelByNodeId[currentNodeId]} DONE, append to finish-order stack`,
      activeNodeId: currentNodeId,
      processingNodeId:
        callStackNodeIds.length > 0
          ? (callStackNodeIds[callStackNodeIds.length - 1] ?? null)
          : null,
    })
  }

  addFrame({
    executedLines: [1],
    operationText: 'initialise DFS-based topological sort',
  })

  addFrame({
    executedLines: [2],
    operationText: 'postorder stack initialised as empty',
  })

  addFrame({
    executedLines: [3],
    operationText: 'all vertex states set to UNVISITED',
  })

  for (const rootNodeId of roots) {
    addFrame({
      executedLines: [4],
      operationText: `evaluate vertex ${labelByNodeId[rootNodeId]}`,
      activeNodeId: rootNodeId,
    })

    const isUnvisited = !discoveredNodeIds.has(rootNodeId)
    addFrame({
      executedLines: [5],
      operationText: isUnvisited
        ? `${labelByNodeId[rootNodeId]} is UNVISITED`
        : `${labelByNodeId[rootNodeId]} already visited`,
      activeNodeId: rootNodeId,
    })

    if (!isUnvisited) {
      continue
    }

    addFrame({
      executedLines: [6],
      operationText: `call DFS(${labelByNodeId[rootNodeId]})`,
      activeNodeId: rootNodeId,
    })
    runTopoDfs(rootNodeId, null)

    if (cycleDetected) {
      addFrame({
        executedLines: [6],
        operationText: 'cycle detected, topological ordering is impossible',
        isComplete: true,
      })
      break
    }
  }

  if (!cycleDetected) {
    addFrame({
      executedLines: [7],
      operationText: `topological order built: ${[...finishOrderNodeIds]
        .reverse()
        .map((nodeId) => labelByNodeId[nodeId] ?? nodeId)
        .join(' -> ') || '(empty)'}`,
      isComplete: true,
    })
  }

  return {
    algorithmId: 'topological-sorting',
    title: 'Topological Sorting (DFS)',
    pseudocodeLines: topologicalSortPseudocodeLines,
    frames,
    startNodeId: resolvedStartNodeId,
    targetNodeId: null,
    scope,
  }
}

const createDijkstraTimeline = ({
  graph,
  startNodeId,
  targetNodeId,
  scope,
}: Readonly<{
  graph: GraphModel
  startNodeId: string | null
  targetNodeId?: string | null
  scope: GraphTraversalScope
}>): GraphTraversalTimeline => {
  const adjacencyList = buildAdjacencyList(graph, { directed: true, weighted: true })
  const adjacencyMatrix = buildAdjacencyMatrix(graph, { directed: true, weighted: true })
  const labelByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.label
    return accumulator
  }, {})
  const edgeIdByKey = createEdgeIdByKey(graph.edges, { directed: true })
  const roots = toTraversalRoots(graph, startNodeId, 'start-only')
  const resolvedStartNodeId = roots[0] ?? null
  const resolvedTargetNodeId =
    targetNodeId !== undefined &&
    targetNodeId !== null &&
    graph.nodes.some((node) => node.id === targetNodeId)
      ? targetNodeId
      : null
  const parentByNodeId = graph.nodes.reduce<Record<string, string | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const distanceByNodeId = graph.nodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const discoveredNodeIds = new Set<string>()
  const finalizedNodeIds = new Set<string>()
  const treeEdgeIds = new Set<string>()
  const queueEntries: Array<Readonly<{ nodeId: string; key: number }>> = []
  const frames: GraphTraversalFrame[] = []
  let reconstructedPathNodeIds: readonly string[] = []
  let reconstructedPathEdgeIds: readonly string[] = []

  const addFrame = ({
    executedLines,
    operationText,
    activeNodeId = null,
    activeEdgeId = null,
    processingNodeIds = [],
    isComplete = false,
  }: Readonly<{
    executedLines: readonly number[]
    operationText: string
    activeNodeId?: string | null
    activeEdgeId?: string | null
    processingNodeIds?: readonly string[]
    isComplete?: boolean
  }>) => {
    frames.push({
      graph: cloneGraphModel(graph),
      executedLines: [...executedLines],
      operationText,
      adjacencyList: cloneAdjacencyList(adjacencyList),
      adjacencyMatrix: cloneAdjacencyMatrix(adjacencyMatrix),
      activeNodeId,
      activeEdgeId,
      discoveredNodeIds: sortNodeIdsByLabel([...discoveredNodeIds], labelByNodeId),
      processingNodeIds: [...processingNodeIds],
      completedNodeIds: sortNodeIdsByLabel([...finalizedNodeIds], labelByNodeId),
      queueNodeIds: queueEntries.map((entry) => entry.nodeId),
      callStackNodeIds: [],
      parentByNodeId: { ...parentByNodeId },
      distanceByNodeId: { ...distanceByNodeId },
      visitOrderNodeIds: [],
      traversalTreeEdgeIds: sortEdgeIds([...treeEdgeIds]),
      reconstructedPathNodeIds: [...reconstructedPathNodeIds],
      reconstructedPathEdgeIds: [...reconstructedPathEdgeIds],
      priorityQueueEntries: [...queueEntries].sort((left, right) => left.key - right.key),
      finalizedNodeIds: sortNodeIdsByLabel([...finalizedNodeIds], labelByNodeId),
      isComplete,
    })
  }

  addFrame({
    executedLines: [1],
    operationText:
      resolvedStartNodeId === null
        ? 'Dijkstra initialised with an empty graph'
        : `Dijkstra initialised from start ${labelByNodeId[resolvedStartNodeId]}`,
  })

  addFrame({
    executedLines: [2],
    operationText: 'distance and predecessor tables initialised',
  })

  const negativeWeightEdge = graph.edges.find((edge) => edge.weight < 0) ?? null
  if (negativeWeightEdge !== null) {
    addFrame({
      executedLines: [1],
      operationText: `invalid for Dijkstra: negative weight edge ${labelByNodeId[negativeWeightEdge.from]} -> ${labelByNodeId[negativeWeightEdge.to]} with w=${negativeWeightEdge.weight}`,
      activeEdgeId: negativeWeightEdge.id,
      isComplete: true,
    })

    return {
      algorithmId: 'dijkstra-algorithm',
      title: 'Dijkstra (Improved Priority Queue)',
      pseudocodeLines: dijkstraPseudocodeLines,
      frames,
      startNodeId: resolvedStartNodeId,
      targetNodeId: resolvedTargetNodeId,
      scope,
    }
  }

  if (resolvedStartNodeId === null) {
    addFrame({
      executedLines: [12],
      operationText: 'empty graph, nothing to process',
      isComplete: true,
    })
    return {
      algorithmId: 'dijkstra-algorithm',
      title: 'Dijkstra (Improved Priority Queue)',
      pseudocodeLines: dijkstraPseudocodeLines,
      frames,
      startNodeId: null,
      targetNodeId: resolvedTargetNodeId,
      scope,
    }
  }

  distanceByNodeId[resolvedStartNodeId] = 0
  discoveredNodeIds.add(resolvedStartNodeId)
  addFrame({
    executedLines: [3],
    operationText: `set dist[${labelByNodeId[resolvedStartNodeId]}] = 0`,
    activeNodeId: resolvedStartNodeId,
  })

  queueEntries.push({ nodeId: resolvedStartNodeId, key: 0 })
  addFrame({
    executedLines: [4],
    operationText: `push (${labelByNodeId[resolvedStartNodeId]}, 0) into priority queue`,
    activeNodeId: resolvedStartNodeId,
  })

  while (queueEntries.length > 0) {
    addFrame({
      executedLines: [5],
      operationText: 'priority queue not empty, continue',
      processingNodeIds: queueEntries.length > 0 ? [queueEntries[0]?.nodeId ?? resolvedStartNodeId] : [],
    })

    let bestIndex = 0
    for (let index = 1; index < queueEntries.length; index += 1) {
      const entry = queueEntries[index]
      const bestEntry = queueEntries[bestIndex]
      if (entry !== undefined && bestEntry !== undefined && entry.key < bestEntry.key) {
        bestIndex = index
      }
    }

    const poppedEntry = queueEntries.splice(bestIndex, 1)[0]
    if (poppedEntry === undefined) {
      continue
    }

    const currentNodeId = poppedEntry.nodeId
    addFrame({
      executedLines: [6],
      operationText: `pop (${labelByNodeId[currentNodeId]}, ${poppedEntry.key})`,
      activeNodeId: currentNodeId,
      processingNodeIds: [currentNodeId],
    })

    const currentDist = distanceByNodeId[currentNodeId]
    const isStale = currentDist === null || currentDist !== poppedEntry.key
    if (isStale) {
      addFrame({
        executedLines: [7],
        operationText: `stale queue entry for ${labelByNodeId[currentNodeId]}, skip`,
        activeNodeId: currentNodeId,
      })
      continue
    }

    finalizedNodeIds.add(currentNodeId)
    addFrame({
      executedLines: [7],
      operationText: `${labelByNodeId[currentNodeId]} key is current, process outgoing edges`,
      activeNodeId: currentNodeId,
      processingNodeIds: [currentNodeId],
    })

    const neighbors = adjacencyList.find((entry) => entry.nodeId === currentNodeId)?.neighbors ?? []
    neighbors.forEach((neighbor) => {
      const edgeId = edgeIdByKey[createDirectedEdgeKey(currentNodeId, neighbor.nodeId)] ?? null
      addFrame({
        executedLines: [8],
        operationText: `inspect edge ${labelByNodeId[currentNodeId]} -> ${neighbor.label}`,
        activeNodeId: currentNodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      const sourceDist = distanceByNodeId[currentNodeId]
      if (sourceDist === null) {
        return
      }

      const candidate = sourceDist + neighbor.weight
      const prevDist = distanceByNodeId[neighbor.nodeId]
      addFrame({
        executedLines: [9],
        operationText: `candidate = ${formatDistance(sourceDist)} + ${neighbor.weight} = ${candidate}`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      const shouldRelax = prevDist === null || candidate < prevDist
      if (!shouldRelax) {
        addFrame({
          executedLines: [10],
          operationText: `no relax for ${neighbor.label}; current dist is ${formatDistance(prevDist)}`,
          activeNodeId: neighbor.nodeId,
          activeEdgeId: edgeId,
          processingNodeIds: [currentNodeId],
        })
        return
      }

      distanceByNodeId[neighbor.nodeId] = candidate
      parentByNodeId[neighbor.nodeId] = currentNodeId
      discoveredNodeIds.add(neighbor.nodeId)
      queueEntries.push({ nodeId: neighbor.nodeId, key: candidate })
      if (edgeId !== null) {
        treeEdgeIds.add(edgeId)
      }
      addFrame({
        executedLines: [10, 11],
        operationText: `relax ${neighbor.label}: dist=${candidate}, pred=${labelByNodeId[currentNodeId]}, push to queue`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })
    })
  }

  reconstructedPathNodeIds = reconstructPathFromPred(
    resolvedStartNodeId,
    resolvedTargetNodeId,
    parentByNodeId,
  )
  reconstructedPathEdgeIds = createPathEdgeIds(reconstructedPathNodeIds, edgeIdByKey, { directed: true })
  const targetDistance =
    resolvedTargetNodeId === null
      ? null
      : (distanceByNodeId[resolvedTargetNodeId] ?? null)
  addFrame({
    executedLines: [12],
    operationText:
      resolvedTargetNodeId === null
        ? 'Dijkstra complete (target not set)'
        : reconstructedPathNodeIds.length > 0
          ? `shortest path to ${labelByNodeId[resolvedTargetNodeId]}: ${reconstructedPathNodeIds
              .map((nodeId) => labelByNodeId[nodeId] ?? nodeId)
              .join(' -> ')} (cost ${formatDistance(targetDistance)})`
          : `target ${labelByNodeId[resolvedTargetNodeId]} unreachable from start`,
    activeNodeId: resolvedTargetNodeId,
    isComplete: true,
  })

  return {
    algorithmId: 'dijkstra-algorithm',
    title: 'Dijkstra (Improved Priority Queue)',
    pseudocodeLines: dijkstraPseudocodeLines,
    frames,
    startNodeId: resolvedStartNodeId,
    targetNodeId: resolvedTargetNodeId,
    scope,
  }
}

const createBellmanFordTimeline = ({
  graph,
  startNodeId,
  scope,
}: Readonly<{
  graph: GraphModel
  startNodeId: string | null
  scope: GraphTraversalScope
}>): GraphTraversalTimeline => {
  const adjacencyList = buildAdjacencyList(graph, { directed: true, weighted: true })
  const adjacencyMatrix = buildAdjacencyMatrix(graph, { directed: true, weighted: true })
  const labelByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.label
    return accumulator
  }, {})
  const edgeIdByKey = createEdgeIdByKey(graph.edges, { directed: true })
  const roots = toTraversalRoots(graph, startNodeId, 'start-only')
  const resolvedStartNodeId = roots[0] ?? null
  const parentByNodeId = graph.nodes.reduce<Record<string, string | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const distanceByNodeId = graph.nodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const discoveredNodeIds = new Set<string>()
  const negativeCycleNodeIds = new Set<string>()
  const relaxedEdgeIds = new Set<string>()
  const frames: GraphTraversalFrame[] = []
  let currentPass = 0

  const addFrame = ({
    executedLines,
    operationText,
    activeNodeId = null,
    activeEdgeId = null,
    processingNodeIds = [],
    isComplete = false,
  }: Readonly<{
    executedLines: readonly number[]
    operationText: string
    activeNodeId?: string | null
    activeEdgeId?: string | null
    processingNodeIds?: readonly string[]
    isComplete?: boolean
  }>) => {
    frames.push({
      graph: cloneGraphModel(graph),
      executedLines: [...executedLines],
      operationText,
      adjacencyList: cloneAdjacencyList(adjacencyList),
      adjacencyMatrix: cloneAdjacencyMatrix(adjacencyMatrix),
      activeNodeId,
      activeEdgeId,
      discoveredNodeIds: sortNodeIdsByLabel([...discoveredNodeIds], labelByNodeId),
      processingNodeIds: [...processingNodeIds],
      completedNodeIds: [],
      queueNodeIds: [],
      callStackNodeIds: [],
      parentByNodeId: { ...parentByNodeId },
      distanceByNodeId: { ...distanceByNodeId },
      visitOrderNodeIds: [],
      traversalTreeEdgeIds: sortEdgeIds([...relaxedEdgeIds]),
      reconstructedPathNodeIds: [],
      reconstructedPathEdgeIds: [],
      currentPass,
      negativeCycleNodeIds: sortNodeIdsByLabel([...negativeCycleNodeIds], labelByNodeId),
      isComplete,
    })
  }

  addFrame({
    executedLines: [1],
    operationText:
      resolvedStartNodeId === null
        ? 'Bellman-Ford initialised with an empty graph'
        : `Bellman-Ford initialised from start ${labelByNodeId[resolvedStartNodeId]}`,
  })

  addFrame({
    executedLines: [2],
    operationText: 'distance and predecessor tables initialised',
  })

  if (resolvedStartNodeId === null) {
    addFrame({
      executedLines: [10],
      operationText: 'empty graph, nothing to process',
      isComplete: true,
    })
    return {
      algorithmId: 'bellman-ford-algorithm',
      title: 'Bellman-Ford',
      pseudocodeLines: bellmanFordPseudocodeLines,
      frames,
      startNodeId: null,
      targetNodeId: null,
      scope,
    }
  }

  distanceByNodeId[resolvedStartNodeId] = 0
  discoveredNodeIds.add(resolvedStartNodeId)
  addFrame({
    executedLines: [3],
    operationText: `set dist[${labelByNodeId[resolvedStartNodeId]}] = 0`,
    activeNodeId: resolvedStartNodeId,
  })

  const nodeCount = graph.nodes.length
  for (let pass = 1; pass <= Math.max(0, nodeCount - 1); pass += 1) {
    currentPass = pass
    addFrame({
      executedLines: [4],
      operationText: `start relaxation pass ${pass}/${Math.max(0, nodeCount - 1)}`,
    })

    graph.edges.forEach((edge) => {
      const sourceDist = distanceByNodeId[edge.from]
      const targetDist = distanceByNodeId[edge.to]
      const edgeId = edgeIdByKey[createDirectedEdgeKey(edge.from, edge.to)] ?? edge.id
      addFrame({
        executedLines: [5],
        operationText: `scan edge ${labelByNodeId[edge.from]} -> ${labelByNodeId[edge.to]} (w=${edge.weight})`,
        activeNodeId: edge.to,
        activeEdgeId: edgeId,
      })

      if (sourceDist === null || sourceDist === NEGATIVE_INFINITY) {
        return
      }

      const candidate = sourceDist + edge.weight
      const shouldRelax = targetDist === null || candidate < targetDist
      if (!shouldRelax) {
        return
      }

      distanceByNodeId[edge.to] = candidate
      parentByNodeId[edge.to] = edge.from
      discoveredNodeIds.add(edge.to)
      relaxedEdgeIds.add(edgeId)
      addFrame({
        executedLines: [5],
        operationText: `relax ${labelByNodeId[edge.to]}: dist=${candidate}, pred=${labelByNodeId[edge.from]}`,
        activeNodeId: edge.to,
        activeEdgeId: edgeId,
      })
    })
  }

  addFrame({
    executedLines: [6],
    operationText: 'start textbook negative-cycle propagation phase',
  })

  for (let propagationRound = 1; propagationRound <= nodeCount; propagationRound += 1) {
    currentPass = Math.max(0, nodeCount - 1) + propagationRound
    addFrame({
      executedLines: [7],
      operationText: `negative-cycle propagation round ${propagationRound}/${nodeCount}`,
    })

    graph.edges.forEach((edge) => {
      const edgeId = edgeIdByKey[createDirectedEdgeKey(edge.from, edge.to)] ?? edge.id
      const sourceDist = distanceByNodeId[edge.from]
      const targetDist = distanceByNodeId[edge.to]
      const candidate =
        sourceDist === null || sourceDist === NEGATIVE_INFINITY
          ? null
          : sourceDist + edge.weight
      const isRelaxable =
        (sourceDist === NEGATIVE_INFINITY && targetDist !== NEGATIVE_INFINITY) ||
        (sourceDist !== null &&
          targetDist !== NEGATIVE_INFINITY &&
          candidate !== null &&
          (targetDist === null || candidate < targetDist))

      if (!isRelaxable) {
        return
      }

      negativeCycleNodeIds.add(edge.from)
      negativeCycleNodeIds.add(edge.to)
      distanceByNodeId[edge.to] = NEGATIVE_INFINITY
      addFrame({
        executedLines: [8, 9],
        operationText: `mark ${labelByNodeId[edge.to]} as -INF affected via ${labelByNodeId[edge.from]} -> ${labelByNodeId[edge.to]}`,
        activeNodeId: edge.to,
        activeEdgeId: edgeId,
      })
    })
  }

  addFrame({
    executedLines: [10],
    operationText: 'Bellman-Ford complete',
    isComplete: true,
  })

  return {
    algorithmId: 'bellman-ford-algorithm',
    title: 'Bellman-Ford',
    pseudocodeLines: bellmanFordPseudocodeLines,
    frames,
    startNodeId: resolvedStartNodeId,
    targetNodeId: null,
    scope,
  }
}

const createFloydWarshallTimeline = ({
  graph,
  scope,
}: Readonly<{
  graph: GraphModel
  scope: GraphTraversalScope
}>): GraphTraversalTimeline => {
  const adjacencyList = buildAdjacencyList(graph, { directed: true, weighted: true })
  const adjacencyMatrix = buildAdjacencyMatrix(graph, { directed: true, weighted: true })
  const orderedNodes = [...graph.nodes].sort(compareNodesByLabel)
  const orderedNodeIds = orderedNodes.map((node) => node.id)
  const labelByNodeId = orderedNodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.label
    return accumulator
  }, {})
  const indexByNodeId = orderedNodes.reduce<Record<string, number>>((accumulator, node, index) => {
    accumulator[node.id] = index
    return accumulator
  }, {})
  const edgeIdByKey = createEdgeIdByKey(graph.edges, { directed: true })
  const distanceByNodeId = orderedNodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const parentByNodeId = orderedNodes.reduce<Record<string, string | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const dist: (number | null)[][] = orderedNodes.map((_, rowIndex) =>
    orderedNodes.map((__, columnIndex) => (rowIndex === columnIndex ? 0 : null)),
  )
  graph.edges.forEach((edge) => {
    const rowIndex = indexByNodeId[edge.from]
    const columnIndex = indexByNodeId[edge.to]
    if (rowIndex === undefined || columnIndex === undefined) {
      return
    }
    const currentValue = dist[rowIndex]?.[columnIndex]
    if (currentValue === null || edge.weight < currentValue) {
      const row = dist[rowIndex]
      if (row !== undefined) {
        row[columnIndex] = edge.weight
      }
    }
  })

  const negativeCycleNodeIds = new Set<string>()
  const frames: GraphTraversalFrame[] = []
  let currentK: number | null = null
  let currentI: number | null = null
  let currentJ: number | null = null

  const addFrame = ({
    executedLines,
    operationText,
    activeEdgeId = null,
    isComplete = false,
  }: Readonly<{
    executedLines: readonly number[]
    operationText: string
    activeEdgeId?: string | null
    isComplete?: boolean
  }>) => {
    frames.push({
      graph: cloneGraphModel(graph),
      executedLines: [...executedLines],
      operationText,
      adjacencyList: cloneAdjacencyList(adjacencyList),
      adjacencyMatrix: cloneAdjacencyMatrix(adjacencyMatrix),
      activeNodeId: currentI === null ? null : orderedNodeIds[currentI] ?? null,
      activeEdgeId,
      discoveredNodeIds: [],
      processingNodeIds: [],
      completedNodeIds: [],
      queueNodeIds: [],
      callStackNodeIds: [],
      parentByNodeId: { ...parentByNodeId },
      distanceByNodeId: { ...distanceByNodeId },
      visitOrderNodeIds: [],
      traversalTreeEdgeIds: [],
      reconstructedPathNodeIds: [],
      reconstructedPathEdgeIds: [],
      distanceMatrix: cloneDistanceMatrix(dist),
      currentK,
      currentI,
      currentJ,
      negativeCycleNodeIds: sortNodeIdsByLabel([...negativeCycleNodeIds], labelByNodeId),
      isComplete,
    })
  }

  addFrame({
    executedLines: [1],
    operationText: 'initialise Floyd-Warshall all-pairs shortest paths',
  })

  addFrame({
    executedLines: [2, 3],
    operationText: 'distance matrix initialised from directed weighted graph',
  })

  const n = orderedNodes.length
  for (let k = 0; k < n; k += 1) {
    currentK = k
    addFrame({
      executedLines: [4],
      operationText: `set intermediate vertex k=${labelByNodeId[orderedNodeIds[k] ?? ''] ?? k + 1}`,
    })

    for (let i = 0; i < n; i += 1) {
      currentI = i
      addFrame({
        executedLines: [5],
        operationText: `scan row i=${labelByNodeId[orderedNodeIds[i] ?? ''] ?? i + 1}`,
      })

      for (let j = 0; j < n; j += 1) {
        currentJ = j
        const directValue = dist[i]?.[j] ?? null
        const left = dist[i]?.[k] ?? null
        const right = dist[k]?.[j] ?? null
        const viaK = left === null || right === null ? null : left + right
        const nextValue =
          viaK === null
            ? directValue
            : directValue === null
              ? viaK
              : Math.min(directValue, viaK)
        const sourceNodeId = orderedNodeIds[i]
        const targetNodeId = orderedNodeIds[j]
        const activeEdgeId =
          sourceNodeId !== undefined && targetNodeId !== undefined
            ? (edgeIdByKey[createDirectedEdgeKey(sourceNodeId, targetNodeId)] ?? null)
            : null

        if (dist[i] !== undefined) {
          dist[i][j] = nextValue
        }

        addFrame({
          executedLines: [6, 7],
          operationText: `dist[i][j] = min(${formatDistance(directValue)}, ${formatDistance(left)} + ${formatDistance(right)}) = ${formatDistance(nextValue)}`,
          activeEdgeId,
        })
      }
    }
  }

  orderedNodeIds.forEach((nodeId, index) => {
    const diagonal = dist[index]?.[index] ?? null
    if (diagonal !== null && diagonal < 0) {
      negativeCycleNodeIds.add(nodeId)
    }
  })

  addFrame({
    executedLines: [8, 9],
    operationText:
      negativeCycleNodeIds.size > 0
        ? 'negative cycle detected from dist[v][v] < 0 on diagonal'
        : 'Floyd-Warshall complete with no negative cycles detected',
    isComplete: true,
  })

  return {
    algorithmId: 'floyd-warshall-algorithm',
    title: 'Floyd-Warshall',
    pseudocodeLines: floydWarshallPseudocodeLines,
    frames,
    startNodeId: null,
    targetNodeId: null,
    scope,
  }
}

const createPrimTimeline = ({
  graph,
  startNodeId,
  scope,
}: Readonly<{
  graph: GraphModel
  startNodeId: string | null
  scope: GraphTraversalScope
}>): GraphTraversalTimeline => {
  const adjacencyList = buildAdjacencyList(graph, { weighted: true })
  const adjacencyMatrix = buildAdjacencyMatrix(graph, { weighted: true })
  const labelByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.label
    return accumulator
  }, {})
  const edgeIdByKey = createEdgeIdByKey(graph.edges)
  const roots = toTraversalRoots(graph, startNodeId, 'start-only')
  const resolvedStartNodeId = roots[0] ?? null
  const parentByNodeId = graph.nodes.reduce<Record<string, string | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const distanceByNodeId = graph.nodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const discoveredNodeIds = new Set<string>()
  const inTreeNodeIds = new Set<string>()
  const visitOrderNodeIds: string[] = []
  const mstEdgeIds = new Set<string>()
  const queueEntries: Array<Readonly<{ nodeId: string; key: number }>> = []
  const frames: GraphTraversalFrame[] = []

  const addFrame = ({
    executedLines,
    operationText,
    activeNodeId = null,
    activeEdgeId = null,
    processingNodeIds = [],
    isComplete = false,
  }: Readonly<{
    executedLines: readonly number[]
    operationText: string
    activeNodeId?: string | null
    activeEdgeId?: string | null
    processingNodeIds?: readonly string[]
    isComplete?: boolean
  }>) => {
    const sortedQueueEntries = [...queueEntries].sort((left, right) => {
      if (left.key !== right.key) {
        return left.key - right.key
      }
      return compareLabels(labelByNodeId[left.nodeId] ?? left.nodeId, labelByNodeId[right.nodeId] ?? right.nodeId)
    })
    frames.push({
      graph: cloneGraphModel(graph),
      executedLines: [...executedLines],
      operationText,
      adjacencyList: cloneAdjacencyList(adjacencyList),
      adjacencyMatrix: cloneAdjacencyMatrix(adjacencyMatrix),
      activeNodeId,
      activeEdgeId,
      discoveredNodeIds: sortNodeIdsByLabel([...discoveredNodeIds], labelByNodeId),
      processingNodeIds: [...processingNodeIds],
      completedNodeIds: sortNodeIdsByLabel([...inTreeNodeIds], labelByNodeId),
      queueNodeIds: queueEntries.map((entry) => entry.nodeId),
      callStackNodeIds: [],
      parentByNodeId: { ...parentByNodeId },
      distanceByNodeId: { ...distanceByNodeId },
      visitOrderNodeIds: [...visitOrderNodeIds],
      traversalTreeEdgeIds: sortEdgeIds([...mstEdgeIds]),
      reconstructedPathNodeIds: [],
      reconstructedPathEdgeIds: [],
      mstEdgeIds: sortEdgeIds([...mstEdgeIds]),
      priorityQueueEntries: sortedQueueEntries,
      isComplete,
    })
  }

  addFrame({
    executedLines: [1],
    operationText:
      resolvedStartNodeId === null
        ? 'Prim initialised with an empty graph'
        : `Prim initialised from root ${labelByNodeId[resolvedStartNodeId]}`,
  })

  addFrame({
    executedLines: [2, 3],
    operationText: 'dist and parent arrays initialised',
  })

  if (graph.nodes.length === 0 || resolvedStartNodeId === null) {
    addFrame({
      executedLines: [16],
      operationText: 'empty graph, nothing to process',
      isComplete: true,
    })
    return {
      algorithmId: 'prim-algorithm',
      title: "Prim's Algorithm",
      pseudocodeLines: primPseudocodeLines,
      frames,
      startNodeId: null,
      targetNodeId: null,
      scope,
    }
  }

  if (!isUndirectedGraphConnected(graph)) {
    addFrame({
      executedLines: [1],
      operationText: 'precondition failed: Prim requires a connected undirected weighted graph',
      isComplete: true,
    })
    return {
      algorithmId: 'prim-algorithm',
      title: "Prim's Algorithm",
      pseudocodeLines: primPseudocodeLines,
      frames,
      startNodeId: resolvedStartNodeId,
      targetNodeId: null,
      scope,
    }
  }

  addFrame({
    executedLines: [4],
    operationText: `T starts from root ${labelByNodeId[resolvedStartNodeId]}`,
    activeNodeId: resolvedStartNodeId,
  })

  distanceByNodeId[resolvedStartNodeId] = 0
  discoveredNodeIds.add(resolvedStartNodeId)
  addFrame({
    executedLines: [5],
    operationText: `set key[${labelByNodeId[resolvedStartNodeId]}] = 0`,
    activeNodeId: resolvedStartNodeId,
  })

  graph.nodes.forEach((node) => {
    queueEntries.push({
      nodeId: node.id,
      key: node.id === resolvedStartNodeId ? 0 : Number.POSITIVE_INFINITY,
    })
  })
  addFrame({
    executedLines: [6],
    operationText: 'insert all vertices into priority queue by current key',
  })

  while (queueEntries.length > 0) {
    addFrame({
      executedLines: [7],
      operationText: 'priority queue not empty, continue',
    })

    let bestIndex = 0
    for (let index = 1; index < queueEntries.length; index += 1) {
      const entry = queueEntries[index]
      const bestEntry = queueEntries[bestIndex]
      if (entry === undefined || bestEntry === undefined) {
        continue
      }
      if (entry.key < bestEntry.key) {
        bestIndex = index
        continue
      }
      if (entry.key === bestEntry.key) {
        const entryLabel = labelByNodeId[entry.nodeId] ?? entry.nodeId
        const bestLabel = labelByNodeId[bestEntry.nodeId] ?? bestEntry.nodeId
        if (compareLabels(entryLabel, bestLabel) < 0) {
          bestIndex = index
        }
      }
    }

    const poppedEntry = queueEntries.splice(bestIndex, 1)[0]
    if (poppedEntry === undefined) {
      continue
    }
    const currentNodeId = poppedEntry.nodeId

    addFrame({
      executedLines: [8],
      operationText: `pop_min -> ${labelByNodeId[currentNodeId]}`,
      activeNodeId: currentNodeId,
      processingNodeIds: [currentNodeId],
    })

    inTreeNodeIds.add(currentNodeId)
    visitOrderNodeIds.push(currentNodeId)
    addFrame({
      executedLines: [9],
      operationText: `add vertex ${labelByNodeId[currentNodeId]} to T`,
      activeNodeId: currentNodeId,
      processingNodeIds: [currentNodeId],
    })

    const parentNodeId = parentByNodeId[currentNodeId]
    if (parentNodeId !== null) {
      const edgeId = edgeIdByKey[createUndirectedEdgeKey(parentNodeId, currentNodeId)] ?? null
      if (edgeId !== null) {
        mstEdgeIds.add(edgeId)
      }
      addFrame({
        executedLines: [10],
        operationText: `add edge (${labelByNodeId[parentNodeId]}, ${labelByNodeId[currentNodeId]})`,
        activeNodeId: currentNodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })
    }

    const neighbors = adjacencyList.find((entry) => entry.nodeId === currentNodeId)?.neighbors ?? []
    neighbors.forEach((neighbor) => {
      const edgeId = edgeIdByKey[createUndirectedEdgeKey(currentNodeId, neighbor.nodeId)] ?? null
      addFrame({
        executedLines: [11],
        operationText: `scan edge (${labelByNodeId[currentNodeId]}, ${neighbor.label})`,
        activeNodeId: currentNodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      const isNeighborInTree = inTreeNodeIds.has(neighbor.nodeId)
      const currentKey = distanceByNodeId[neighbor.nodeId]
      const shouldUpdate = !isNeighborInTree && (currentKey === null || currentKey > neighbor.weight)

      addFrame({
        executedLines: [12],
        operationText: shouldUpdate
          ? `${neighbor.label} outside T and key improves to ${neighbor.weight}`
          : `${neighbor.label} does not satisfy update condition`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      if (!shouldUpdate) {
        return
      }

      addFrame({
        executedLines: [13],
        operationText: `decrease-key for ${neighbor.label} in priority queue`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      distanceByNodeId[neighbor.nodeId] = neighbor.weight
      discoveredNodeIds.add(neighbor.nodeId)
      addFrame({
        executedLines: [14],
        operationText: `key[${neighbor.label}] <- ${neighbor.weight}`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      parentByNodeId[neighbor.nodeId] = currentNodeId
      addFrame({
        executedLines: [15],
        operationText: `parent[${neighbor.label}] <- ${labelByNodeId[currentNodeId]}`,
        activeNodeId: neighbor.nodeId,
        activeEdgeId: edgeId,
        processingNodeIds: [currentNodeId],
      })

      const queueIndex = queueEntries.findIndex((entry) => entry.nodeId === neighbor.nodeId)
      if (queueIndex >= 0) {
        const queueEntry = queueEntries[queueIndex]
        if (queueEntry !== undefined) {
          queueEntries[queueIndex] = {
            ...queueEntry,
            key: neighbor.weight,
          }
        }
      }
    })
  }

  const mstWeight = graph.edges
    .filter((edge) => mstEdgeIds.has(edge.id))
    .reduce((accumulator, edge) => accumulator + edge.weight, 0)
  addFrame({
    executedLines: [16],
    operationText: `Prim complete: MST has ${mstEdgeIds.size} edge(s), total weight = ${mstWeight}`,
    isComplete: true,
  })

  return {
    algorithmId: 'prim-algorithm',
    title: "Prim's Algorithm",
    pseudocodeLines: primPseudocodeLines,
    frames,
    startNodeId: resolvedStartNodeId,
    targetNodeId: null,
    scope,
  }
}

const createKruskalTimeline = ({
  graph,
  scope,
}: Readonly<{
  graph: GraphModel
  scope: GraphTraversalScope
}>): GraphTraversalTimeline => {
  const adjacencyList = buildAdjacencyList(graph, { weighted: true })
  const adjacencyMatrix = buildAdjacencyMatrix(graph, { weighted: true })
  const labelByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.label
    return accumulator
  }, {})
  const sortedEdges = [...graph.edges].sort((left, right) =>
    compareEdgeByWeightAndLabels(left, right, labelByNodeId),
  )
  const parentByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.id
    return accumulator
  }, {})
  const rankByNodeId = graph.nodes.reduce<Record<string, number>>((accumulator, node) => {
    accumulator[node.id] = 0
    return accumulator
  }, {})
  const distanceByNodeId = graph.nodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const mstEdgeIds = new Set<string>()
  const discoveredNodeIds = new Set<string>()
  const edgeDecisionById: Record<string, 'accepted' | 'rejected' | 'pending'> = {}
  sortedEdges.forEach((edge) => {
    edgeDecisionById[edge.id] = 'pending'
  })
  const frames: GraphTraversalFrame[] = []
  let currentEdgeId: string | null = null

  const findRepresentative = (nodeId: string, compress = true): string => {
    const parentNodeId = parentByNodeId[nodeId]
    if (parentNodeId === undefined || parentNodeId === nodeId) {
      return nodeId
    }

    const representativeNodeId = findRepresentative(parentNodeId, compress)
    if (compress) {
      parentByNodeId[nodeId] = representativeNodeId
    }
    return representativeNodeId
  }

  const representativeByNodeId = () =>
    graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
      accumulator[node.id] = findRepresentative(node.id, false)
      return accumulator
    }, {})

  const addFrame = ({
    executedLines,
    operationText,
    activeEdgeId = null,
    activeNodeId = null,
    isComplete = false,
  }: Readonly<{
    executedLines: readonly number[]
    operationText: string
    activeEdgeId?: string | null
    activeNodeId?: string | null
    isComplete?: boolean
  }>) => {
    frames.push({
      graph: cloneGraphModel(graph),
      executedLines: [...executedLines],
      operationText,
      adjacencyList: cloneAdjacencyList(adjacencyList),
      adjacencyMatrix: cloneAdjacencyMatrix(adjacencyMatrix),
      activeNodeId,
      activeEdgeId,
      discoveredNodeIds: sortNodeIdsByLabel([...discoveredNodeIds], labelByNodeId),
      processingNodeIds: activeNodeId === null ? [] : [activeNodeId],
      completedNodeIds: [],
      queueNodeIds: [],
      callStackNodeIds: [],
      parentByNodeId: {},
      distanceByNodeId: { ...distanceByNodeId },
      visitOrderNodeIds: [],
      traversalTreeEdgeIds: sortEdgeIds([...mstEdgeIds]),
      reconstructedPathNodeIds: [],
      reconstructedPathEdgeIds: [],
      mstEdgeIds: sortEdgeIds([...mstEdgeIds]),
      edgeDecisionById: { ...edgeDecisionById },
      ufParentByNodeId: { ...parentByNodeId },
      ufRankByNodeId: { ...rankByNodeId },
      ufRepresentativeByNodeId: representativeByNodeId(),
      sortedEdgeIds: sortedEdges.map((edge) => edge.id),
      currentEdgeId,
      isComplete,
    })
  }

  addFrame({
    executedLines: [1],
    operationText: "Kruskal initialised on G = (V, E)",
  })

  if (!isUndirectedGraphConnected(graph)) {
    addFrame({
      executedLines: [1],
      operationText: 'precondition failed: Kruskal requires a connected undirected weighted graph',
      isComplete: true,
    })
    return {
      algorithmId: 'kruskal-algorithm',
      title: "Kruskal's Algorithm",
      pseudocodeLines: kruskalPseudocodeLines,
      frames,
      startNodeId: null,
      targetNodeId: null,
      scope,
    }
  }

  addFrame({
    executedLines: [2],
    operationText: 'edges sorted in ascending order of weight',
  })

  addFrame({
    executedLines: [3],
    operationText: 'Union-Find forest initialised',
  })

  addFrame({
    executedLines: [4],
    operationText: 'MST edge set T initialised empty',
  })

  sortedEdges.forEach((edge) => {
    currentEdgeId = edge.id
    discoveredNodeIds.add(edge.from)
    discoveredNodeIds.add(edge.to)
    addFrame({
      executedLines: [5],
      operationText: `scan edge (${labelByNodeId[edge.from]}, ${labelByNodeId[edge.to]}) with w=${edge.weight}`,
      activeEdgeId: edge.id,
      activeNodeId: edge.from,
    })

    const leftRepresentative = findRepresentative(edge.from)
    const rightRepresentative = findRepresentative(edge.to)
    const canAccept = leftRepresentative !== rightRepresentative
    addFrame({
      executedLines: [6],
      operationText: canAccept
        ? `FIND(${labelByNodeId[edge.from]}) != FIND(${labelByNodeId[edge.to]}), accept`
        : `FIND(${labelByNodeId[edge.from]}) = FIND(${labelByNodeId[edge.to]}), reject`,
      activeEdgeId: edge.id,
      activeNodeId: edge.from,
    })

    if (!canAccept) {
      edgeDecisionById[edge.id] = 'rejected'
      return
    }

    edgeDecisionById[edge.id] = 'accepted'
    const leftRank = rankByNodeId[leftRepresentative] ?? 0
    const rightRank = rankByNodeId[rightRepresentative] ?? 0
    if (leftRank < rightRank) {
      parentByNodeId[leftRepresentative] = rightRepresentative
    } else if (leftRank > rightRank) {
      parentByNodeId[rightRepresentative] = leftRepresentative
    } else {
      parentByNodeId[rightRepresentative] = leftRepresentative
      rankByNodeId[leftRepresentative] = leftRank + 1
    }

    addFrame({
      executedLines: [7],
      operationText: `UNION(${labelByNodeId[edge.from]}, ${labelByNodeId[edge.to]})`,
      activeEdgeId: edge.id,
      activeNodeId: edge.from,
    })

    mstEdgeIds.add(edge.id)
    addFrame({
      executedLines: [8],
      operationText: `add edge (${labelByNodeId[edge.from]}, ${labelByNodeId[edge.to]}) to T`,
      activeEdgeId: edge.id,
      activeNodeId: edge.to,
    })
  })

  const mstWeight = graph.edges
    .filter((edge) => mstEdgeIds.has(edge.id))
    .reduce((accumulator, edge) => accumulator + edge.weight, 0)
  addFrame({
    executedLines: [9],
    operationText: `Kruskal complete: MST has ${mstEdgeIds.size} edge(s), total weight = ${mstWeight}`,
    isComplete: true,
  })

  return {
    algorithmId: 'kruskal-algorithm',
    title: "Kruskal's Algorithm",
    pseudocodeLines: kruskalPseudocodeLines,
    frames,
    startNodeId: null,
    targetNodeId: null,
    scope,
  }
}

const createUnionFindTimeline = ({
  graph,
  mode,
  scope,
}: Readonly<{
  graph: GraphModel
  mode: UnionFindModeId
  scope: GraphTraversalScope
}>): GraphTraversalTimeline => {
  const adjacencyList = buildAdjacencyList(graph, { weighted: true })
  const adjacencyMatrix = buildAdjacencyMatrix(graph, { weighted: true })
  const labelByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.label
    return accumulator
  }, {})
  const sortedEdges = [...graph.edges].sort((left, right) =>
    compareEdgeByWeightAndLabels(left, right, labelByNodeId),
  )
  const parentByNodeId = graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
    accumulator[node.id] = node.id
    return accumulator
  }, {})
  const rankByNodeId = graph.nodes.reduce<Record<string, number>>((accumulator, node) => {
    accumulator[node.id] = 0
    return accumulator
  }, {})
  const distanceByNodeId = graph.nodes.reduce<Record<string, number | null>>((accumulator, node) => {
    accumulator[node.id] = null
    return accumulator
  }, {})
  const acceptedEdgeIds = new Set<string>()
  const discoveredNodeIds = new Set<string>()
  const edgeDecisionById: Record<string, 'accepted' | 'rejected' | 'pending'> = {}
  sortedEdges.forEach((edge) => {
    edgeDecisionById[edge.id] = 'pending'
  })
  const frames: GraphTraversalFrame[] = []
  let currentEdgeId: string | null = null

  const findRepresentativeNoCompression = (nodeId: string): string => {
    let cursorNodeId = nodeId
    const guardNodeIds = new Set<string>()
    while (true) {
      const parentNodeId = parentByNodeId[cursorNodeId]
      if (parentNodeId === undefined || parentNodeId === cursorNodeId) {
        return cursorNodeId
      }
      if (guardNodeIds.has(cursorNodeId)) {
        return cursorNodeId
      }
      guardNodeIds.add(cursorNodeId)
      cursorNodeId = parentNodeId
    }
  }

  const findRepresentativeWithCompression = (nodeId: string): string => {
    const parentNodeId = parentByNodeId[nodeId]
    if (parentNodeId === undefined || parentNodeId === nodeId) {
      return nodeId
    }

    const representativeNodeId = findRepresentativeWithCompression(parentNodeId)
    parentByNodeId[nodeId] = representativeNodeId
    return representativeNodeId
  }

  const representativeByNodeId = () =>
    graph.nodes.reduce<Record<string, string>>((accumulator, node) => {
      accumulator[node.id] = findRepresentativeNoCompression(node.id)
      return accumulator
    }, {})

  const addFrame = ({
    executedLines,
    operationText,
    activeEdgeId = null,
    activeNodeId = null,
    isComplete = false,
  }: Readonly<{
    executedLines: readonly number[]
    operationText: string
    activeEdgeId?: string | null
    activeNodeId?: string | null
    isComplete?: boolean
  }>) => {
    frames.push({
      graph: cloneGraphModel(graph),
      executedLines: [...executedLines],
      operationText,
      adjacencyList: cloneAdjacencyList(adjacencyList),
      adjacencyMatrix: cloneAdjacencyMatrix(adjacencyMatrix),
      activeNodeId,
      activeEdgeId,
      discoveredNodeIds: sortNodeIdsByLabel([...discoveredNodeIds], labelByNodeId),
      processingNodeIds: activeNodeId === null ? [] : [activeNodeId],
      completedNodeIds: [],
      queueNodeIds: [],
      callStackNodeIds: [],
      parentByNodeId: {},
      distanceByNodeId: { ...distanceByNodeId },
      visitOrderNodeIds: [],
      traversalTreeEdgeIds: sortEdgeIds([...acceptedEdgeIds]),
      reconstructedPathNodeIds: [],
      reconstructedPathEdgeIds: [],
      edgeDecisionById: { ...edgeDecisionById },
      ufParentByNodeId: { ...parentByNodeId },
      ufRankByNodeId: { ...rankByNodeId },
      ufRepresentativeByNodeId: representativeByNodeId(),
      ufMode: mode,
      sortedEdgeIds: sortedEdges.map((edge) => edge.id),
      currentEdgeId,
      isComplete,
    })
  }

  addFrame({
    executedLines: [1],
    operationText: `Union-Find initialised (${mode})`,
  })

  addFrame({
    executedLines: [2],
    operationText:
      mode === 'union-by-rank' || mode === 'combined'
        ? 'parent and rank arrays initialised'
        : 'parent array initialised',
  })

  const findForMode = (nodeId: string) =>
    mode === 'path-compression' || mode === 'combined'
      ? findRepresentativeWithCompression(nodeId)
      : findRepresentativeNoCompression(nodeId)

  sortedEdges.forEach((edge) => {
    currentEdgeId = edge.id
    discoveredNodeIds.add(edge.from)
    discoveredNodeIds.add(edge.to)
    addFrame({
      executedLines: [3],
      operationText: `process LINK(${labelByNodeId[edge.from]}, ${labelByNodeId[edge.to]})`,
      activeEdgeId: edge.id,
      activeNodeId: edge.from,
    })

    const leftRepresentative = findForMode(edge.from)
    const rightRepresentative = findForMode(edge.to)
    addFrame({
      executedLines: mode === 'path-compression' ? [1, 2, 3, 4] : [4],
      operationText: `FIND(${labelByNodeId[edge.from]})=${labelByNodeId[leftRepresentative]}, FIND(${labelByNodeId[edge.to]})=${labelByNodeId[rightRepresentative]}`,
      activeEdgeId: edge.id,
      activeNodeId: edge.from,
    })

    if (leftRepresentative === rightRepresentative) {
      edgeDecisionById[edge.id] = 'rejected'
      addFrame({
        executedLines: [3],
        operationText: 'same representative, skip UNION',
        activeEdgeId: edge.id,
        activeNodeId: edge.to,
      })
      return
    }

    edgeDecisionById[edge.id] = 'accepted'
    if (mode === 'union-by-rank' || mode === 'combined') {
      const leftRank = rankByNodeId[leftRepresentative] ?? 0
      const rightRank = rankByNodeId[rightRepresentative] ?? 0
      if (leftRank < rightRank) {
        parentByNodeId[leftRepresentative] = rightRepresentative
        addFrame({
          executedLines: [5],
          operationText: `rank[${labelByNodeId[leftRepresentative]}] < rank[${labelByNodeId[rightRepresentative]}], parent <- ${labelByNodeId[rightRepresentative]}`,
          activeEdgeId: edge.id,
          activeNodeId: edge.from,
        })
      } else if (leftRank > rightRank) {
        parentByNodeId[rightRepresentative] = leftRepresentative
        addFrame({
          executedLines: [6],
          operationText: `rank[${labelByNodeId[leftRepresentative]}] > rank[${labelByNodeId[rightRepresentative]}], parent <- ${labelByNodeId[leftRepresentative]}`,
          activeEdgeId: edge.id,
          activeNodeId: edge.to,
        })
      } else {
        parentByNodeId[rightRepresentative] = leftRepresentative
        rankByNodeId[leftRepresentative] = leftRank + 1
        addFrame({
          executedLines: [6, 7],
          operationText: `equal rank, attach ${labelByNodeId[rightRepresentative]} under ${labelByNodeId[leftRepresentative]} and increment rank`,
          activeEdgeId: edge.id,
          activeNodeId: edge.to,
        })
      }
    } else {
      parentByNodeId[leftRepresentative] = rightRepresentative
      addFrame({
        executedLines: mode === 'path-compression' ? [5, 6] : [6, 7],
        operationText: `UNION: parent[${labelByNodeId[leftRepresentative]}] <- ${labelByNodeId[rightRepresentative]}`,
        activeEdgeId: edge.id,
        activeNodeId: edge.to,
      })
    }

    acceptedEdgeIds.add(edge.id)
  })

  const complexityText =
    mode === 'path-compression'
      ? 'with path compression: O(m log(n))'
      : mode === 'union-by-rank'
        ? 'with union by rank: O(m log(n))'
        : mode === 'combined'
          ? 'with both optimisations: O(m α(n))'
          : 'without optimisations: can degrade to O(n) FIND in long chains'
  addFrame({
    executedLines: [mode === 'path-compression' ? 4 : mode === 'union-by-rank' || mode === 'combined' ? 7 : 7],
    operationText: `Union-Find complete, ${complexityText}`,
    isComplete: true,
  })

  return {
    algorithmId: 'union-find',
    title: 'Union-Find (Disjoint Set)',
    pseudocodeLines: unionFindPseudocodeLinesByMode[mode],
    frames,
    startNodeId: null,
    targetNodeId: null,
    scope,
  }
}

const createGraphTraversalTimeline = ({
  algorithmId,
  graph,
  startNodeId,
  targetNodeId,
  unionFindMode,
  scope,
}: Readonly<{
  algorithmId: GraphTraversalAlgorithmId
  graph: GraphModel
  startNodeId: string | null
  targetNodeId?: string | null
  unionFindMode?: UnionFindModeId
  scope: GraphTraversalScope
}>): GraphTraversalTimeline =>
  algorithmId === 'breadth-first-search'
    ? createBfsTimeline({
        graph,
        startNodeId,
        targetNodeId,
        scope,
      })
    : algorithmId === 'depth-first-search'
      ? createDfsTimeline({
          graph,
          startNodeId,
          scope,
        })
      : algorithmId === 'connected-components'
        ? createConnectedComponentsTimeline({
            graph,
            scope,
          })
        : algorithmId === 'topological-sorting'
          ? createTopologicalSortTimeline({
              graph,
              scope,
            })
          : algorithmId === 'dijkstra-algorithm'
            ? createDijkstraTimeline({
                graph,
                startNodeId,
                targetNodeId,
                scope,
              })
            : algorithmId === 'bellman-ford-algorithm'
              ? createBellmanFordTimeline({
                  graph,
                  startNodeId,
                  scope,
                })
              : algorithmId === 'floyd-warshall-algorithm'
                ? createFloydWarshallTimeline({
                    graph,
                    scope,
                  })
                : algorithmId === 'prim-algorithm'
                  ? createPrimTimeline({
                      graph,
                      startNodeId,
                      scope,
                    })
                  : algorithmId === 'kruskal-algorithm'
                    ? createKruskalTimeline({
                        graph,
                        scope,
                      })
                    : createUnionFindTimeline({
                        graph,
                        mode: unionFindMode ?? 'combined',
                        scope,
                      })

export {
  bellmanFordPseudocodeLines,
  bfsPseudocodeLines,
  buildAdjacencyList,
  buildAdjacencyMatrix,
  connectedComponentsPseudocodeLines,
  createBellmanFordTimeline,
  createBfsTimeline,
  createConnectedComponentsTimeline,
  createDfsTimeline,
  createDijkstraTimeline,
  createFloydWarshallTimeline,
  createGraphLineEvents,
  createGraphRepresentationTimeline,
  createGraphTraversalTimeline,
  createKruskalTimeline,
  createPrimTimeline,
  createTopologicalSortTimeline,
  createUnionFindTimeline,
  dijkstraPseudocodeLines,
  floydWarshallPseudocodeLines,
  getGraphRepresentationFrameByLineEvent,
  getGraphTraversalFrameByLineEvent,
  graphRepresentationPseudocodeLines,
  kruskalPseudocodeLines,
  primPseudocodeLines,
  topologicalSortPseudocodeLines,
  unionFindBaselinePseudocodeLines,
  unionFindPathCompressionPseudocodeLines,
  unionFindUnionByRankPseudocodeLines,
}
