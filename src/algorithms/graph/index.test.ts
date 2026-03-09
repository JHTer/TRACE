import { describe, expect, it } from 'vitest'

import {
  buildAdjacencyList,
  buildAdjacencyMatrix,
  createGraphTraversalTimeline,
} from './index.ts'
import type { GraphModel } from '../../domain/algorithms/types.ts'

const getLastFrame = <T,>(frames: readonly T[]): T | undefined =>
  frames[frames.length - 1]

describe('graph timeline algorithms', () => {
  it('connected components timeline labels disconnected subgraphs correctly', () => {
    const graph: GraphModel = {
      nodes: [
        { id: 'node-0', label: 'A', x: 0, y: 0, order: 0 },
        { id: 'node-1', label: 'B', x: 0, y: 0, order: 1 },
        { id: 'node-2', label: 'C', x: 0, y: 0, order: 2 },
        { id: 'node-3', label: 'D', x: 0, y: 0, order: 3 },
        { id: 'node-4', label: 'E', x: 0, y: 0, order: 4 },
      ],
      edges: [
        { id: 'edge-node-0-node-1', from: 'node-0', to: 'node-1', weight: 1 },
        { id: 'edge-node-1-node-2', from: 'node-1', to: 'node-2', weight: 1 },
        { id: 'edge-node-3-node-4', from: 'node-3', to: 'node-4', weight: 1 },
      ],
    }

    const timeline = createGraphTraversalTimeline({
      algorithmId: 'connected-components',
      graph,
      startNodeId: null,
      scope: 'full-graph',
    })

    const finalFrame = getLastFrame(timeline.frames)
    expect(finalFrame).toBeDefined()
    expect(finalFrame?.isComplete).toBe(true)
    expect(finalFrame?.componentCount).toBe(2)

    const componentByNodeId = finalFrame?.componentByNodeId ?? {}
    expect(componentByNodeId['node-0']).toBe(componentByNodeId['node-1'])
    expect(componentByNodeId['node-1']).toBe(componentByNodeId['node-2'])
    expect(componentByNodeId['node-3']).toBe(componentByNodeId['node-4'])
    expect(componentByNodeId['node-0']).not.toBe(componentByNodeId['node-3'])
  })

  it('connected components timeline handles empty graph', () => {
    const timeline = createGraphTraversalTimeline({
      algorithmId: 'connected-components',
      graph: { nodes: [], edges: [] },
      startNodeId: null,
      scope: 'full-graph',
    })

    const finalFrame = getLastFrame(timeline.frames)
    expect(finalFrame).toBeDefined()
    expect(finalFrame?.isComplete).toBe(true)
    expect(finalFrame?.componentCount).toBe(0)
    expect(finalFrame?.componentByNodeId).toEqual({})
  })

  it('topological sort DFS returns a valid order for DAG input', () => {
    const graph: GraphModel = {
      nodes: [
        { id: 'node-0', label: 'A', x: 0, y: 0, order: 0 },
        { id: 'node-1', label: 'B', x: 0, y: 0, order: 1 },
        { id: 'node-2', label: 'C', x: 0, y: 0, order: 2 },
        { id: 'node-3', label: 'D', x: 0, y: 0, order: 3 },
      ],
      edges: [
        { id: 'edge-dir-a-b', from: 'node-0', to: 'node-1', weight: 1 },
        { id: 'edge-dir-a-c', from: 'node-0', to: 'node-2', weight: 1 },
        { id: 'edge-dir-b-d', from: 'node-1', to: 'node-3', weight: 1 },
        { id: 'edge-dir-c-d', from: 'node-2', to: 'node-3', weight: 1 },
      ],
    }

    const timeline = createGraphTraversalTimeline({
      algorithmId: 'topological-sorting',
      graph,
      startNodeId: null,
      scope: 'full-graph',
    })

    const finalFrame = getLastFrame(timeline.frames)
    expect(finalFrame).toBeDefined()
    expect(finalFrame?.isComplete).toBe(true)
    expect(finalFrame?.cycleDetected).toBe(false)

    const order = finalFrame?.topologicalOrderNodeIds ?? []
    expect(order.length).toBe(graph.nodes.length)
    const indexByNodeId = order.reduce<Record<string, number>>((accumulator, nodeId, index) => {
      accumulator[nodeId] = index
      return accumulator
    }, {})

    graph.edges.forEach((edge) => {
      const fromIndex = indexByNodeId[edge.from]
      const toIndex = indexByNodeId[edge.to]
      expect(fromIndex).toBeLessThan(toIndex)
    })
  })

  it('topological sort DFS reports cycle and no valid order for cyclic graph', () => {
    const graph: GraphModel = {
      nodes: [
        { id: 'node-0', label: 'A', x: 0, y: 0, order: 0 },
        { id: 'node-1', label: 'B', x: 0, y: 0, order: 1 },
        { id: 'node-2', label: 'C', x: 0, y: 0, order: 2 },
      ],
      edges: [
        { id: 'edge-dir-a-b', from: 'node-0', to: 'node-1', weight: 1 },
        { id: 'edge-dir-b-c', from: 'node-1', to: 'node-2', weight: 1 },
        { id: 'edge-dir-c-a', from: 'node-2', to: 'node-0', weight: 1 },
      ],
    }

    const timeline = createGraphTraversalTimeline({
      algorithmId: 'topological-sorting',
      graph,
      startNodeId: null,
      scope: 'full-graph',
    })

    const finalFrame = getLastFrame(timeline.frames)
    expect(finalFrame).toBeDefined()
    expect(finalFrame?.isComplete).toBe(true)
    expect(finalFrame?.cycleDetected).toBe(true)
    expect(finalFrame?.topologicalOrderNodeIds ?? []).toHaveLength(0)
  })

  it('dijkstra improved priority queue computes shortest paths and ignores stale entries', () => {
    const graph: GraphModel = {
      nodes: [
        { id: 'node-0', label: 'A', x: 0, y: 0, order: 0 },
        { id: 'node-1', label: 'B', x: 0, y: 0, order: 1 },
        { id: 'node-2', label: 'C', x: 0, y: 0, order: 2 },
        { id: 'node-3', label: 'D', x: 0, y: 0, order: 3 },
      ],
      edges: [
        { id: 'edge-a-b', from: 'node-0', to: 'node-1', weight: 1 },
        { id: 'edge-a-c', from: 'node-0', to: 'node-2', weight: 10 },
        { id: 'edge-b-c', from: 'node-1', to: 'node-2', weight: 1 },
        { id: 'edge-c-d', from: 'node-2', to: 'node-3', weight: 2 },
      ],
    }

    const timeline = createGraphTraversalTimeline({
      algorithmId: 'dijkstra-algorithm',
      graph,
      startNodeId: 'node-0',
      scope: 'full-graph',
    })

    const finalFrame = getLastFrame(timeline.frames)
    expect(finalFrame).toBeDefined()
    expect(finalFrame?.distanceByNodeId['node-0']).toBe(0)
    expect(finalFrame?.distanceByNodeId['node-1']).toBe(1)
    expect(finalFrame?.distanceByNodeId['node-2']).toBe(2)
    expect(finalFrame?.distanceByNodeId['node-3']).toBe(4)
    expect(finalFrame?.parentByNodeId['node-2']).toBe('node-1')

    expect(
      timeline.frames.some((frame) => frame.operationText.toLowerCase().includes('stale queue entry')),
    ).toBe(true)
  })

  it('dijkstra marks graph invalid when a negative edge exists', () => {
    const graph: GraphModel = {
      nodes: [
        { id: 'node-0', label: 'A', x: 0, y: 0, order: 0 },
        { id: 'node-1', label: 'B', x: 0, y: 0, order: 1 },
      ],
      edges: [
        { id: 'edge-a-b', from: 'node-0', to: 'node-1', weight: -1 },
      ],
    }

    const timeline = createGraphTraversalTimeline({
      algorithmId: 'dijkstra-algorithm',
      graph,
      startNodeId: 'node-0',
      scope: 'full-graph',
    })

    const finalFrame = getLastFrame(timeline.frames)
    expect(finalFrame).toBeDefined()
    expect(finalFrame?.isComplete).toBe(true)
    expect(finalFrame?.operationText.toLowerCase()).toContain('negative weight edge')
  })

  it('bellman-ford computes shortest paths and propagates -INF for negative-cycle reachability', () => {
    const graph: GraphModel = {
      nodes: [
        { id: 'node-0', label: 'A', x: 0, y: 0, order: 0 },
        { id: 'node-1', label: 'B', x: 0, y: 0, order: 1 },
        { id: 'node-2', label: 'C', x: 0, y: 0, order: 2 },
        { id: 'node-3', label: 'D', x: 0, y: 0, order: 3 },
        { id: 'node-4', label: 'E', x: 0, y: 0, order: 4 },
        { id: 'node-5', label: 'F', x: 0, y: 0, order: 5 },
      ],
      edges: [
        { id: 'edge-a-b', from: 'node-0', to: 'node-1', weight: 1 },
        { id: 'edge-b-c', from: 'node-1', to: 'node-2', weight: 1 },
        { id: 'edge-c-b', from: 'node-2', to: 'node-1', weight: -3 },
        { id: 'edge-c-d', from: 'node-2', to: 'node-3', weight: 2 },
        { id: 'edge-d-e', from: 'node-3', to: 'node-4', weight: 2 },
      ],
    }

    const timeline = createGraphTraversalTimeline({
      algorithmId: 'bellman-ford-algorithm',
      graph,
      startNodeId: 'node-0',
      scope: 'full-graph',
    })

    const finalFrame = getLastFrame(timeline.frames)
    expect(finalFrame).toBeDefined()
    expect(finalFrame?.distanceByNodeId['node-0']).toBe(0)
    expect(finalFrame?.distanceByNodeId['node-1']).toBe(Number.NEGATIVE_INFINITY)
    expect(finalFrame?.distanceByNodeId['node-2']).toBe(Number.NEGATIVE_INFINITY)
    expect(finalFrame?.distanceByNodeId['node-3']).toBe(Number.NEGATIVE_INFINITY)
    expect(finalFrame?.distanceByNodeId['node-4']).toBe(Number.NEGATIVE_INFINITY)
    expect(finalFrame?.distanceByNodeId['node-5']).toBeNull()
  })

  it('floyd-warshall computes APSP and detects negative cycles from diagonal', () => {
    const acyclicGraph: GraphModel = {
      nodes: [
        { id: 'node-0', label: 'A', x: 0, y: 0, order: 0 },
        { id: 'node-1', label: 'B', x: 0, y: 0, order: 1 },
        { id: 'node-2', label: 'C', x: 0, y: 0, order: 2 },
      ],
      edges: [
        { id: 'edge-a-b', from: 'node-0', to: 'node-1', weight: 3 },
        { id: 'edge-b-c', from: 'node-1', to: 'node-2', weight: 1 },
        { id: 'edge-a-c', from: 'node-0', to: 'node-2', weight: 10 },
      ],
    }
    const cycleGraph: GraphModel = {
      nodes: [
        { id: 'node-0', label: 'A', x: 0, y: 0, order: 0 },
        { id: 'node-1', label: 'B', x: 0, y: 0, order: 1 },
      ],
      edges: [
        { id: 'edge-a-b', from: 'node-0', to: 'node-1', weight: 1 },
        { id: 'edge-b-a', from: 'node-1', to: 'node-0', weight: -3 },
      ],
    }

    const apspTimeline = createGraphTraversalTimeline({
      algorithmId: 'floyd-warshall-algorithm',
      graph: acyclicGraph,
      startNodeId: null,
      scope: 'full-graph',
    })
    const apspFinal = getLastFrame(apspTimeline.frames)
    expect(apspFinal).toBeDefined()
    const labels = apspFinal?.adjacencyMatrix.labels ?? []
    const aIndex = labels.indexOf('A')
    const cIndex = labels.indexOf('C')
    expect(apspFinal?.distanceMatrix?.[aIndex]?.[cIndex]).toBe(4)

    const cycleTimeline = createGraphTraversalTimeline({
      algorithmId: 'floyd-warshall-algorithm',
      graph: cycleGraph,
      startNodeId: null,
      scope: 'full-graph',
    })
    const cycleFinal = getLastFrame(cycleTimeline.frames)
    expect(cycleFinal).toBeDefined()
    expect(cycleFinal?.negativeCycleNodeIds?.length ?? 0).toBeGreaterThan(0)
  })

  it('directed adjacency structures are asymmetric for one-way edges', () => {
    const graph: GraphModel = {
      nodes: [
        { id: 'node-0', label: 'A', x: 0, y: 0, order: 0 },
        { id: 'node-1', label: 'B', x: 0, y: 0, order: 1 },
      ],
      edges: [
        { id: 'edge-dir-a-b', from: 'node-0', to: 'node-1', weight: 1 },
      ],
    }

    const directedList = buildAdjacencyList(graph, { directed: true })
    const directedMatrix = buildAdjacencyMatrix(graph, { directed: true })

    const aNeighbors = directedList.find((entry) => entry.label === 'A')?.neighbors ?? []
    const bNeighbors = directedList.find((entry) => entry.label === 'B')?.neighbors ?? []
    expect(aNeighbors.map((neighbor) => neighbor.label)).toEqual(['B'])
    expect(bNeighbors).toEqual([])

    const rowA = directedMatrix.labels.indexOf('A')
    const rowB = directedMatrix.labels.indexOf('B')
    expect(rowA).toBeGreaterThanOrEqual(0)
    expect(rowB).toBeGreaterThanOrEqual(0)
    expect(directedMatrix.rows[rowA]?.[rowB]).toBe(1)
    expect(directedMatrix.rows[rowB]?.[rowA]).toBe(0)
  })
})
