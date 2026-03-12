import type { TreeAlgorithmId } from '../../domain/algorithms/types.ts'

type TreeWorkbenchOperation =
  | Readonly<{ id: string; kind: 'insert-key'; value: number }>
  | Readonly<{ id: string; kind: 'search-key'; value: number }>
  | Readonly<{ id: string; kind: 'delete-key'; value: number }>
  | Readonly<{ id: string; kind: 'insert-word'; value: string }>
  | Readonly<{ id: string; kind: 'lookup-word'; value: string; mode: 'prefix' | 'exact' }>
  | Readonly<{ id: string; kind: 'set-text'; value: string }>
  | Readonly<{ id: string; kind: 'search-pattern'; value: string }>

type TreeWorkbenchPseudocodeLine = Readonly<{
  lineNumber: number
  text: string
}>

type TreeCanvasNodeTone = 'default' | 'accent' | 'muted' | 'success' | 'warning'
type TreeCanvasEdgeTone = 'default' | 'accent' | 'muted'

type TreeCanvasNode = Readonly<{
  id: string
  x: number
  y: number
  width: number
  height: number
  shape: 'circle' | 'pill' | 'box'
  label: string
  subLabel?: string
  tone: TreeCanvasNodeTone
  strokeStyle?: 'solid' | 'dashed'
  textTone?: 'primary' | 'inverse'
}>

type TreeCanvasEdge = Readonly<{
  id: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  tone: TreeCanvasEdgeTone
  label?: string
  strokeStyle?: 'solid' | 'dashed'
}>

type TreeCanvas = Readonly<{
  nodes: readonly TreeCanvasNode[]
  edges: readonly TreeCanvasEdge[]
  emptyLabel: string
}>

type TreeMetric = Readonly<{
  label: string
  value: string
}>

type TreeWorkbenchFrame = Readonly<{
  stepIndex: number
  executedLines: readonly number[]
  operationText: string
  explanation: string
  canvas: TreeCanvas
  metrics: readonly TreeMetric[]
  logLines: readonly string[]
  status: string
}>

type TreeWorkbenchTimeline = Readonly<{
  algorithmId: TreeAlgorithmId
  title: string
  subtitle: string
  controlKind: 'balanced-tree' | 'prefix-trie' | 'suffix-structure'
  pseudocodeLines: readonly TreeWorkbenchPseudocodeLine[]
  frames: readonly TreeWorkbenchFrame[]
  complexityRows: readonly TreeMetric[]
}>

type BinaryNodeColor = 'red' | 'black'

type BinaryNode = Readonly<{
  key: number
  left: BinaryNode | null
  right: BinaryNode | null
  height?: number
  color?: BinaryNodeColor
}>

type TwoThreeNode = Readonly<{
  keys: readonly number[]
  children: readonly TwoThreeNode[]
}>

type TrieNode = Readonly<{
  terminal: boolean
  children: Readonly<Record<string, TrieNode>>
}>

type TrieSearchResult = Readonly<{
  matched: boolean
  pathNodeIds: readonly string[]
  pathEdgeIds: readonly string[]
  terminalMatched: boolean
}>

const treeDirectoryLabelByAlgorithm: Record<TreeAlgorithmId, string> = {
  'avl-trees': 'AVL TREES',
  '2-3-trees': '2-3 TREES',
  'left-leaning-red-black-trees': 'LEFT-LEANING RED-BLACK TREES',
  'prefix-tries': 'PREFIX TRIES',
  'suffix-tries': 'SUFFIX TRIES',
  'suffix-trees': 'SUFFIX TREES',
}

const treeSubtitleByAlgorithm: Record<TreeAlgorithmId, string> = {
  'avl-trees':
    'Build an ordered set by insertions, then inspect balance factors, local imbalance shapes, and Ian-method repairs.',
  '2-3-trees':
    'Grow a perfectly balanced 2-3 search tree by inserting keys and watching 3-nodes split and middle keys promote upward.',
  'left-leaning-red-black-trees':
    'Insert keys into a left-leaning red-black tree and inspect rotations, flip steps, and the encoded 2-3 correspondence. Dashed links represent red links; solid links represent black links.',
  'prefix-tries':
    'Insert your own words, share prefixes automatically, and compare prefix lookup against exact word lookup.',
  'suffix-tries':
    'Choose any base string and build the full suffix trie so repeated suffix prefixes remain visible.',
  'suffix-trees':
    'Compact a suffix trie into a suffix tree with substring-labelled edges for fast pattern matching.',
}

const treeComplexityByAlgorithm: Record<TreeAlgorithmId, readonly TreeMetric[]> = {
  'avl-trees': [
    { label: 'Lookup', value: 'O(log n)' },
    { label: 'Insert', value: 'O(log n)' },
    { label: 'Balance rule', value: '|bf| <= 1' },
  ],
  '2-3-trees': [
    { label: 'Search', value: 'O(log n)' },
    { label: 'Insert', value: 'O(log n)' },
    { label: 'Leaf depth', value: 'perfectly balanced' },
  ],
  'left-leaning-red-black-trees': [
    { label: 'Search', value: 'O(log n)' },
    { label: 'Insert', value: 'O(log n)' },
    { label: 'Encoding', value: 'binary view of 2-3 trees' },
  ],
  'prefix-tries': [
    { label: 'Insert', value: 'O(m)' },
    { label: 'Lookup', value: 'O(m)' },
    { label: 'Structure', value: 'shared prefixes' },
  ],
  'suffix-tries': [
    { label: 'Build', value: 'O(n^2)' },
    { label: 'Pattern query', value: 'O(m)' },
    { label: 'Space', value: 'O(n^2)' },
  ],
  'suffix-trees': [
    { label: 'Pattern query', value: 'O(m)' },
    { label: 'Stored edges', value: 'substring ranges/labels' },
    { label: 'Space target', value: 'O(n) after compaction' },
  ],
}

const balancedTreePseudocodeByAlgorithm: Record<
  'avl-trees' | '2-3-trees' | 'left-leaning-red-black-trees',
  readonly TreeWorkbenchPseudocodeLine[]
> = {
  'avl-trees': [
    { lineNumber: 1, text: 'INSERT(key)' },
    { lineNumber: 2, text: '  descend as in BST until null child' },
    { lineNumber: 3, text: '  create new leaf node' },
    { lineNumber: 4, text: '  update heights on the way up' },
    { lineNumber: 5, text: '  if a node becomes imbalanced, apply Ian method' },
    { lineNumber: 6, text: '  choose middle key locally, smaller left, larger right' },
    { lineNumber: 7, text: 'DELETE(key)' },
    { lineNumber: 8, text: '  remove key as in BST deletion' },
    { lineNumber: 9, text: '  update heights and rebalance up the path' },
  ],
  '2-3-trees': [
    { lineNumber: 1, text: 'INSERT(key)' },
    { lineNumber: 2, text: '  search down to the destination leaf' },
    { lineNumber: 3, text: '  if leaf is a 2-node, absorb the key' },
    { lineNumber: 4, text: '  if leaf becomes a temporary 4-node, split it' },
    { lineNumber: 5, text: '  promote the middle key to the parent' },
    { lineNumber: 6, text: '  repeat upward until no 4-node remains' },
    { lineNumber: 7, text: 'DELETE(key)' },
    { lineNumber: 8, text: '  remove key; borrow or merge to fix 2-node deficit' },
    { lineNumber: 9, text: '  split/merge upward until all nodes valid' },
  ],
  'left-leaning-red-black-trees': [
    { lineNumber: 1, text: 'INSERT(key)' },
    { lineNumber: 2, text: '  insert the key as a red node' },
    { lineNumber: 3, text: '  if only the right child is red, rotate left' },
    { lineNumber: 4, text: '  if left and left.left are red, rotate right' },
    { lineNumber: 5, text: '  if both children are red, flip colors' },
    { lineNumber: 6, text: '  repaint the root black' },
    { lineNumber: 7, text: 'DELETE(key)' },
    { lineNumber: 8, text: '  rotate/flip on the path so deletion keeps lean-left' },
    { lineNumber: 9, text: '  fix double-black via rotations/color flips' },
  ],
}

const triePseudocodeByAlgorithm: Record<
  'prefix-tries' | 'suffix-tries' | 'suffix-trees',
  readonly TreeWorkbenchPseudocodeLine[]
> = {
  'prefix-tries': [
    { lineNumber: 1, text: 'INSERT(word)' },
    { lineNumber: 2, text: '  node = root' },
    { lineNumber: 3, text: '  for each character c in word + $' },
    { lineNumber: 4, text: '    create missing child for c if needed' },
    { lineNumber: 5, text: '    move to that child' },
    { lineNumber: 6, text: '  mark the last node terminal' },
  ],
  'suffix-tries': [
    { lineNumber: 1, text: 'BUILD_SUFFIX_TRIE(text)' },
    { lineNumber: 2, text: '  append $ if needed' },
    { lineNumber: 3, text: '  for each suffix text[i..n]' },
    { lineNumber: 4, text: '    insert that suffix into the trie' },
    { lineNumber: 5, text: 'LOOKUP(pattern)' },
    { lineNumber: 6, text: '  follow the pattern as a trie prefix' },
  ],
  'suffix-trees': [
    { lineNumber: 1, text: 'BUILD_SUFFIX_TREE(text)' },
    { lineNumber: 2, text: '  build the suffix trie of text + $' },
    { lineNumber: 3, text: '  compress every non-branching path' },
    { lineNumber: 4, text: '  store edge labels as shared substrings' },
    { lineNumber: 5, text: 'SEARCH(pattern)' },
    { lineNumber: 6, text: '  walk across substring-labelled edges' },
  ],
}

const initialTrieNode: TrieNode = {
  terminal: false,
  children: {},
}

const clampText = (value: string) => value.trim()

const sanitizeWord = (value: string) =>
  clampText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const sanitizeText = (value: string) =>
  clampText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const appendTerminal = (value: string) => (value.endsWith('$') ? value : `${value}$`)

const createFrame = (
  stepIndex: number,
  executedLines: readonly number[],
  operationText: string,
  explanation: string,
  canvas: TreeCanvas,
  metrics: readonly TreeMetric[],
  logLines: readonly string[],
  status: string,
): TreeWorkbenchFrame => ({
  canvas,
  executedLines,
  explanation,
  logLines,
  metrics,
  operationText,
  status,
  stepIndex,
})

const heightOf = (node: BinaryNode | null) => node?.height ?? 0

const cloneBinaryNode = (node: BinaryNode | null): BinaryNode | null => {
  if (node === null) {
    return null
  }

  return {
    color: node.color,
    height: node.height,
    key: node.key,
    left: cloneBinaryNode(node.left),
    right: cloneBinaryNode(node.right),
  }
}

const plainInsertBinarySearchTree = (node: BinaryNode | null, key: number): BinaryNode => {
  if (node === null) {
    return { key, left: null, right: null, height: 1 }
  }

  if (key < node.key) {
    return {
      ...node,
      height: Math.max(heightOf(node.right), heightOf(node.left)) + 1,
      left: plainInsertBinarySearchTree(node.left, key),
    }
  }

  if (key > node.key) {
    return {
      ...node,
      height: Math.max(heightOf(node.right), heightOf(node.left)) + 1,
      right: plainInsertBinarySearchTree(node.right, key),
    }
  }

  return node
}

const getSearchPath = (root: BinaryNode | null, key: number) => {
  const path: number[] = []
  let cursor = root

  while (cursor !== null) {
    path.push(cursor.key)
    if (key === cursor.key) {
      return { found: true, path }
    }
    cursor = key < cursor.key ? cursor.left : cursor.right
  }

  return { found: false, path }
}

const isRed = (node: BinaryNode | null) => node?.color === 'red'

const rotateLeft = (node: BinaryNode): BinaryNode => {
  const right = node.right
  if (right === null) {
    return node
  }

  const nextLeft: BinaryNode = {
    color: 'red',
    height: node.height,
    key: node.key,
    left: node.left,
    right: right.left,
  }

  return {
    color: node.color ?? 'black',
    height: right.height,
    key: right.key,
    left: nextLeft,
    right: right.right,
  }
}

const rotateRight = (node: BinaryNode): BinaryNode => {
  const left = node.left
  if (left === null) {
    return node
  }

  const nextRight: BinaryNode = {
    color: 'red',
    height: node.height,
    key: node.key,
    left: left.right,
    right: node.right,
  }

  return {
    color: node.color ?? 'black',
    height: left.height,
    key: left.key,
    left: left.left,
    right: nextRight,
  }
}

const withHeight = (node: BinaryNode): BinaryNode => ({
  ...node,
  height: Math.max(heightOf(node.left), heightOf(node.right)) + 1,
})

const balanceFactor = (node: BinaryNode | null) =>
  node === null ? 0 : heightOf(node.left) - heightOf(node.right)

const countNodes = (node: BinaryNode | null): number =>
  node === null ? 0 : 1 + countNodes(node.left) + countNodes(node.right)

const countRedLinks = (node: BinaryNode | null): number =>
  node === null
    ? 0
    : (node.color === 'red' ? 1 : 0) + countRedLinks(node.left) + countRedLinks(node.right)

const inorderKeys = (node: BinaryNode | null, acc: number[] = []): number[] => {
  if (node === null) {
    return acc
  }
  inorderKeys(node.left, acc)
  acc.push(node.key)
  inorderKeys(node.right, acc)
  return acc
}

const rebuildAvlFromKeys = (keys: readonly number[]): BinaryNode | null => {
  let root: BinaryNode | null = null
  keys.forEach((key) => {
    const events: string[] = []
    const inserted = avlInsert(root, key, events)
    root = inserted.node
  })
  return root
}

const rebuildLlrbFromKeys = (keys: readonly number[]): BinaryNode | null => {
  let root: BinaryNode | null = null
  keys.forEach((key) => {
    const events: string[] = []
    const inserted = llrbInsert(root, key, events)
    root = recolorRootBlack(inserted.node)
  })
  return root
}

const avlInsert = (
  node: BinaryNode | null,
  key: number,
  events: string[],
): Readonly<{ node: BinaryNode; inserted: boolean }> => {
  if (node === null) {
    return {
      inserted: true,
      node: { key, left: null, right: null, height: 1 },
    }
  }

  if (key === node.key) {
    return { inserted: false, node }
  }

  if (key < node.key) {
    const next = avlInsert(node.left, key, events)
    const updated = withHeight({ ...node, left: next.node })
    const balance = balanceFactor(updated)

    if (balance > 1 && key < (updated.left?.key ?? key)) {
      const promotedKey = updated.left?.key ?? updated.key
      events.push(
        `Left-left imbalance at ${updated.key}. Ian method chooses ${promotedKey} as the middle key and rebuilds the local subtree around it.`,
      )
      return { inserted: next.inserted, node: withHeight(rotateRight(updated)) }
    }

    if (balance > 1 && key > (updated.left?.key ?? key)) {
      const promotedKey = updated.left?.right?.key ?? updated.left?.key ?? updated.key
      events.push(
        `Left-right imbalance at ${updated.key}. Ian method first exposes the middle key ${promotedKey}, then uses it as the new local root.`,
      )
      const rotatedLeftChild =
        updated.left === null ? null : withHeight(rotateLeft(withHeight(updated.left)))
      return {
        inserted: next.inserted,
        node: withHeight(rotateRight(withHeight({ ...updated, left: rotatedLeftChild }))),
      }
    }

    return { inserted: next.inserted, node: updated }
  }

  const next = avlInsert(node.right, key, events)
  const updated = withHeight({ ...node, right: next.node })
  const balance = balanceFactor(updated)

  if (balance < -1 && key > (updated.right?.key ?? key)) {
    const promotedKey = updated.right?.key ?? updated.key
    events.push(
      `Right-right imbalance at ${updated.key}. Ian method chooses ${promotedKey} as the middle key and rebuilds the local subtree around it.`,
    )
    return { inserted: next.inserted, node: withHeight(rotateLeft(updated)) }
  }

  if (balance < -1 && key < (updated.right?.key ?? key)) {
    const promotedKey = updated.right?.left?.key ?? updated.right?.key ?? updated.key
    events.push(
      `Right-left imbalance at ${updated.key}. Ian method exposes the middle key ${promotedKey} and then rebuilds the local subtree around it.`,
    )
    const rotatedRightChild =
      updated.right === null ? null : withHeight(rotateRight(withHeight(updated.right)))
    return {
      inserted: next.inserted,
      node: withHeight(rotateLeft(withHeight({ ...updated, right: rotatedRightChild }))),
    }
  }

  return { inserted: next.inserted, node: updated }
}

const llrbInsert = (
  node: BinaryNode | null,
  key: number,
  events: string[],
): Readonly<{ node: BinaryNode; inserted: boolean }> => {
  if (node === null) {
    events.push(`Inserted ${key} as a red leaf to preserve black balance before local fix-ups.`)
    return {
      inserted: true,
      node: { color: 'red', key, left: null, right: null },
    }
  }

  if (key < node.key) {
    const next = llrbInsert(node.left, key, events)
    node = { ...node, left: next.node }
    if (isRed(node.right) && !isRed(node.left)) {
      events.push(`Right-leaning red edge at ${node.key}; rotate left so the red link leans left.`)
      node = rotateLeft(node)
    }
    if (node.left !== null && isRed(node.left) && isRed(node.left.left)) {
      events.push(`Two consecutive left reds at ${node.key}; rotate right to restore the 2-3 encoding.`)
      node = rotateRight(node)
    }
    if (isRed(node.left) && isRed(node.right)) {
      events.push(`Both children of ${node.key} are red; flip colors to model a 2-3 split and promotion.`)
      node = {
        ...node,
        color: node.color === 'red' ? 'black' : 'red',
        left: node.left === null ? null : { ...node.left, color: 'black' },
        right: node.right === null ? null : { ...node.right, color: 'black' },
      }
    }
    return { inserted: next.inserted, node }
  }

  if (key > node.key) {
    const next = llrbInsert(node.right, key, events)
    node = { ...node, right: next.node }
    if (isRed(node.right) && !isRed(node.left)) {
      events.push(`Right-leaning red edge at ${node.key}; rotate left so the red link leans left.`)
      node = rotateLeft(node)
    }
    if (node.left !== null && isRed(node.left) && isRed(node.left.left)) {
      events.push(`Two consecutive left reds at ${node.key}; rotate right to restore the 2-3 encoding.`)
      node = rotateRight(node)
    }
    if (isRed(node.left) && isRed(node.right)) {
      events.push(`Both children of ${node.key} are red; flip colors to model a 2-3 split and promotion.`)
      node = {
        ...node,
        color: node.color === 'red' ? 'black' : 'red',
        left: node.left === null ? null : { ...node.left, color: 'black' },
        right: node.right === null ? null : { ...node.right, color: 'black' },
      }
    }
    return { inserted: next.inserted, node }
  }

  return { inserted: false, node }
}

const recolorRootBlack = (root: BinaryNode | null): BinaryNode | null =>
  root === null ? null : { ...root, color: 'black' }

type TwoThreeSplitResult = Readonly<{
  promotedKey: number
  left: TwoThreeNode
  right: TwoThreeNode
}>

type TwoThreeInsertResult = Readonly<{
  node: TwoThreeNode
  inserted: boolean
  split: TwoThreeSplitResult | null
}>

const createTwoThreeLeaf = (key: number): TwoThreeNode => ({
  children: [],
  keys: [key],
})

const isLeafTwoThree = (node: TwoThreeNode) => node.children.length === 0

const insertKeySorted = (keys: readonly number[], key: number) =>
  [...keys, key].sort((left, right) => left - right)

const selectTwoThreeChildIndex = (node: TwoThreeNode, key: number) => {
  if (node.keys.length === 1) {
    return key < node.keys[0] ? 0 : 1
  }

  if (key < node.keys[0]) {
    return 0
  }

  if (key < node.keys[1]) {
    return 1
  }

  return 2
}

const splitFourNode = (
  keys: readonly number[],
  children: readonly TwoThreeNode[],
): TwoThreeSplitResult => ({
  left: {
    children: children.length === 0 ? [] : children.slice(0, 2),
    keys: [keys[0]],
  },
  promotedKey: keys[1],
  right: {
    children: children.length === 0 ? [] : children.slice(2),
    keys: [keys[2]],
  },
})

const insertIntoTwoThree = (
  node: TwoThreeNode | null,
  key: number,
  events: string[],
): TwoThreeInsertResult => {
  if (node === null) {
    return { inserted: true, node: createTwoThreeLeaf(key), split: null }
  }

  if (node.keys.includes(key)) {
    return { inserted: false, node, split: null }
  }

  if (isLeafTwoThree(node)) {
    if (node.keys.length === 1) {
      events.push(`Leaf 2-node absorbed ${key} directly and became a 3-node.`)
      return {
        inserted: true,
        node: { ...node, keys: insertKeySorted(node.keys, key) },
        split: null,
      }
    }

    const orderedKeys = insertKeySorted(node.keys, key)
    const split = splitFourNode(orderedKeys, [])
    events.push(
      `Leaf 3-node overflowed with keys ${orderedKeys.join(', ')}. Split it and promote middle key ${split.promotedKey}.`,
    )
    return {
      inserted: true,
      node,
      split,
    }
  }

  const childIndex = selectTwoThreeChildIndex(node, key)
  const nextChild = node.children[childIndex] ?? null
  const insertedChild = insertIntoTwoThree(nextChild, key, events)

  if (!insertedChild.inserted) {
    return { inserted: false, node, split: null }
  }

  if (insertedChild.split === null) {
    return {
      inserted: true,
      node: {
        ...node,
        children: node.children.map((child, index) =>
          index === childIndex ? insertedChild.node : child,
        ),
      },
      split: null,
    }
  }

  const promotedKey = insertedChild.split.promotedKey
  const mergedKeys = insertKeySorted(node.keys, promotedKey)
  const leftPortion = node.children.slice(0, childIndex)
  const rightPortion = node.children.slice(childIndex + 1)
  const mergedChildren = [
    ...leftPortion,
    insertedChild.split.left,
    insertedChild.split.right,
    ...rightPortion,
  ]

  if (node.keys.length === 1) {
    events.push(
      `Promoted ${promotedKey} into its parent 2-node, so the parent became a 3-node and the upward adjustment stops.`,
    )
    return {
      inserted: true,
      node: {
        children: mergedChildren,
        keys: mergedKeys,
      },
      split: null,
    }
  }

  const split = splitFourNode(mergedKeys, mergedChildren)
  events.push(
    `Parent also overflowed after receiving ${promotedKey}; split again and continue promoting middle key ${split.promotedKey}.`,
  )
  return {
    inserted: true,
    node,
    split,
  }
}

const insertTwoThreeRoot = (
  root: TwoThreeNode | null,
  key: number,
  events: string[],
): Readonly<{ root: TwoThreeNode; inserted: boolean }> => {
  const result = insertIntoTwoThree(root, key, events)
  if (!result.inserted) {
    return { inserted: false, root: root ?? createTwoThreeLeaf(key) }
  }

  if (result.split === null) {
    return { inserted: true, root: result.node }
  }

  events.push(`The overflow reached the root, so create a new root containing promoted key ${result.split.promotedKey}.`)
  return {
    inserted: true,
    root: {
      children: [result.split.left, result.split.right],
      keys: [result.split.promotedKey],
    },
  }
}

const countTwoThreeKeys = (node: TwoThreeNode | null): number =>
  node === null ? 0 : node.keys.length + node.children.reduce((sum, child) => sum + countTwoThreeKeys(child), 0)

const twoThreeHeight = (node: TwoThreeNode | null): number =>
  node === null ? 0 : 1 + Math.max(0, ...node.children.map((child) => twoThreeHeight(child)))

const gatherTwoThreeKeys = (node: TwoThreeNode | null, acc: number[] = []): number[] => {
  if (node === null) {
    return acc
  }

  const childCount = node.children.length
  node.keys.forEach((key, index) => {
    if (index < childCount) {
      gatherTwoThreeKeys(node.children[index], acc)
    }
    acc.push(key)
  })

  if (childCount === node.keys.length + 1 && childCount > 0) {
    gatherTwoThreeKeys(node.children[childCount - 1], acc)
  }

  return acc
}

const rebuildTwoThreeFromKeys = (keys: readonly number[]): TwoThreeNode | null => {
  let root: TwoThreeNode | null = null
  keys.forEach((key) => {
    const events: string[] = []
    const inserted = insertTwoThreeRoot(root, key, events)
    root = inserted.root
  })
  return root
}

const insertTrieWord = (root: TrieNode, word: string) => {
  const pathNodeIds = ['root']
  const pathEdgeIds: string[] = []
  let createdCount = 0

  const insertAt = (node: TrieNode, remaining: string, prefix: string): TrieNode => {
    if (remaining.length === 0) {
      return node.terminal ? node : { ...node, terminal: true }
    }

    const nextChar = remaining[0]
    const nextPrefix = `${prefix}${nextChar}`
    pathNodeIds.push(nextPrefix)
    pathEdgeIds.push(`${prefix || 'root'}->${nextPrefix}`)
    const existingChild = node.children[nextChar] ?? null
    if (existingChild === null) {
      createdCount += 1
    }

    const nextChild = insertAt(existingChild ?? initialTrieNode, remaining.slice(1), nextPrefix)
    return {
      ...node,
      children: {
        ...node.children,
        [nextChar]: nextChild,
      },
    }
  }

  return {
    createdCount,
    pathEdgeIds,
    pathNodeIds,
    root: insertAt(root, appendTerminal(word), ''),
  }
}

const lookupTrieWord = (root: TrieNode, word: string, mode: 'prefix' | 'exact'): TrieSearchResult => {
  const target = mode === 'exact' ? appendTerminal(word) : word
  const pathNodeIds = ['root']
  const pathEdgeIds: string[] = []
  let cursor: TrieNode | null = root
  let prefix = ''

  for (const character of target) {
    if (cursor === null) {
      return { matched: false, pathEdgeIds, pathNodeIds, terminalMatched: false }
    }

    const nextPrefix = `${prefix}${character}`
    pathEdgeIds.push(`${prefix || 'root'}->${nextPrefix}`)
    const nextNode: TrieNode | null = cursor.children[character] ?? null
    if (nextNode === null) {
      return { matched: false, pathEdgeIds, pathNodeIds, terminalMatched: false }
    }
    pathNodeIds.push(nextPrefix)
    prefix = nextPrefix
    cursor = nextNode
  }

  return {
    matched: mode === 'prefix' ? true : cursor?.terminal === true,
    pathEdgeIds,
    pathNodeIds,
    terminalMatched: cursor?.terminal === true,
  }
}

const countTrieWords = (root: TrieNode): number =>
  (root.terminal ? 1 : 0) +
  Object.values(root.children).reduce((sum, child) => sum + countTrieWords(child), 0)

const countTrieNodes = (root: TrieNode): number =>
  1 + Object.values(root.children).reduce((sum, child) => sum + countTrieNodes(child), 0)

const countTrieEdges = (root: TrieNode): number =>
  Object.values(root.children).length +
  Object.values(root.children).reduce((sum, child) => sum + countTrieEdges(child), 0)

const buildSuffixTrie = (text: string) => {
  const withTerminal = appendTerminal(text)
  let root = initialTrieNode
  const suffixes: string[] = []
  for (let index = 0; index < withTerminal.length; index += 1) {
    const suffix = withTerminal.slice(index)
    suffixes.push(suffix)
    root = insertTrieWord(root, suffix).root
  }
  return { root, suffixes, withTerminal }
}

type CompactTrieNode = Readonly<{
  terminal: boolean
  edges: ReadonlyArray<
    Readonly<{
      label: string
      child: CompactTrieNode
    }>
  >
}>

const compressTrieNode = (node: TrieNode): CompactTrieNode => {
  const entries = Object.entries(node.children).sort(([left], [right]) => left.localeCompare(right))
  const edges = entries.map(([label, child]) => {
    let edgeLabel = label
    let cursor = child
    while (!cursor.terminal && Object.keys(cursor.children).length === 1) {
      const [nextLabel, nextChild] = Object.entries(cursor.children)[0] ?? []
      if (nextLabel === undefined || nextChild === undefined) {
        break
      }
      edgeLabel += nextLabel
      cursor = nextChild
    }

    return {
      child: compressTrieNode(cursor),
      label: edgeLabel,
    }
  })

  return {
    edges,
    terminal: node.terminal,
  }
}

const searchCompactTrie = (root: CompactTrieNode, pattern: string) => {
  const pathNodeIds = ['root']
  const pathEdgeIds: string[] = []
  let cursor = root
  let consumed = 0
  let nodeId = 'root'

  while (consumed < pattern.length) {
    const edge = cursor.edges.find(({ label }) => pattern.slice(consumed).startsWith(label[0] ?? ''))
    if (edge === undefined) {
      return { matched: false, pathEdgeIds, pathNodeIds }
    }

    let offset = 0
    while (offset < edge.label.length && consumed < pattern.length) {
      if (edge.label[offset] !== pattern[consumed]) {
        return { matched: false, pathEdgeIds, pathNodeIds }
      }
      offset += 1
      consumed += 1
    }

    const nextNodeId = `${nodeId}/${edge.label}`
    pathEdgeIds.push(`${nodeId}->${nextNodeId}`)
    pathNodeIds.push(nextNodeId)
    nodeId = nextNodeId
    cursor = edge.child
  }

  return { matched: true, pathEdgeIds, pathNodeIds }
}

const binaryTreeCanvas = (
  root: BinaryNode | null,
  options: Readonly<{
    activeKeys?: readonly number[]
    mutedKeys?: readonly number[]
    showBalance?: boolean
    showColor?: boolean
    emptyLabel: string
  }>,
): TreeCanvas => {
  if (root === null) {
    return { edges: [], emptyLabel: options.emptyLabel, nodes: [] }
  }

  const activeSet = new Set(options.activeKeys ?? [])
  const mutedSet = new Set(options.mutedKeys ?? [])
  const nodes: TreeCanvasNode[] = []
  const edges: TreeCanvasEdge[] = []
  let cursorX = 0
  const positions = new Map<number, Readonly<{ depth: number; x: number; y: number }>>()

  const assignPositions = (node: BinaryNode | null, depth: number) => {
    if (node === null) {
      return
    }

    assignPositions(node.left, depth + 1)
    cursorX += 1
    positions.set(node.key, {
      depth,
      x: 90 + cursorX * 84,
      y: 70 + depth * 92,
    })
    assignPositions(node.right, depth + 1)
  }

  const build = (node: BinaryNode | null) => {
    if (node === null) {
      return
    }

    const position = positions.get(node.key)
    if (position === undefined) {
      return
    }

    const tone: TreeCanvasNodeTone = activeSet.has(node.key)
      ? 'accent'
      : mutedSet.has(node.key)
        ? 'muted'
        : options.showColor && node.color === 'red'
          ? 'muted'
          : 'default'

    nodes.push({
      height: 44,
      id: `node-${node.key}`,
      label: `${node.key}`,
      shape: 'circle',
      subLabel: options.showBalance ? `bf ${balanceFactor(node)}` : undefined,
      strokeStyle: options.showColor && node.color === 'red' ? 'dashed' : 'solid',
      textTone: activeSet.has(node.key) ? 'inverse' : 'primary',
      tone,
      width: 44,
      x: position.x,
      y: position.y,
    })

    ;([node.left, node.right] as const).forEach((child) => {
      if (child === null) {
        return
      }

      const childPosition = positions.get(child.key)
      if (childPosition === undefined) {
        return
      }

      edges.push({
        fromX: position.x,
        fromY: position.y + 22,
        id: `${node.key}->${child.key}`,
        strokeStyle: options.showColor && child.color === 'red' ? 'dashed' : 'solid',
        toX: childPosition.x,
        toY: childPosition.y - 22,
        tone: activeSet.has(child.key) ? 'accent' : 'default',
      })
    })

    build(node.left)
    build(node.right)
  }

  assignPositions(root, 0)
  build(root)
  return { edges, emptyLabel: options.emptyLabel, nodes }
}

const twoThreeCanvas = (
  root: TwoThreeNode | null,
  highlightedKeys: readonly number[],
  emptyLabel: string,
): TreeCanvas => {
  const horizontalUnit = 140
  const baseX = 90

  if (root === null) {
    return { edges: [], emptyLabel, nodes: [] }
  }

  const highlightSet = new Set(highlightedKeys)
  const nodes: TreeCanvasNode[] = []
  const edges: TreeCanvasEdge[] = []
  let cursorX = 0
  let nextId = 0

  const traverse = (node: TwoThreeNode, depth: number): Readonly<{ id: string; x: number; y: number }> => {
    const childAnchors = node.children.map((child) => traverse(child, depth + 1))
    if (childAnchors.length === 0) {
      cursorX += 1
    } else {
      cursorX = Math.max(
        cursorX,
        Math.round(childAnchors.reduce((sum, child) => sum + child.x, 0) / childAnchors.length / horizontalUnit),
      )
    }

    const x =
      childAnchors.length === 0
        ? baseX + cursorX * horizontalUnit
        : childAnchors.reduce((sum, child) => sum + child.x, 0) / childAnchors.length
    const y = 72 + depth * 92
    const id = `tt-${nextId}`
    nextId += 1
    nodes.push({
      height: 42,
      id,
      label: node.keys.join(' | '),
      shape: 'pill',
      textTone: node.keys.some((key) => highlightSet.has(key)) ? 'inverse' : 'primary',
      tone: node.keys.some((key) => highlightSet.has(key)) ? 'accent' : 'default',
      width: Math.max(58, 26 + node.keys.length * 34),
      x,
      y,
    })

    childAnchors.forEach((child) => {
      edges.push({
        fromX: x,
        fromY: y + 21,
        id: `${id}->${child.id}`,
        toX: child.x,
        toY: child.y - 21,
        tone: 'default',
      })
    })

    return { id, x, y }
  }

  traverse(root, 0)
  return { edges, emptyLabel, nodes }
}

const trieCanvas = (
  root: TrieNode,
  options: Readonly<{
    activeNodeIds?: readonly string[]
    activeEdgeIds?: readonly string[]
    emptyLabel: string
  }>,
): TreeCanvas => {
  const activeNodeSet = new Set(options.activeNodeIds ?? [])
  const activeEdgeSet = new Set(options.activeEdgeIds ?? [])
  const nodes: TreeCanvasNode[] = []
  const edges: TreeCanvasEdge[] = []
  let leafIndex = 0

  const layout = (node: TrieNode, nodeId: string, depth: number): Readonly<{ x: number; y: number }> => {
    const childEntries = Object.entries(node.children).sort(([left], [right]) => left.localeCompare(right))
    const y = 64 + depth * 84
    if (childEntries.length === 0) {
      leafIndex += 1
      const x = 80 + leafIndex * 78
      const nodeLabel = nodeId === '' ? 'root' : nodeId.slice(-1) || '$'
      nodes.push({
        height: 34,
        id: nodeId || 'root',
        label: nodeLabel,
        shape: 'box',
        textTone: activeNodeSet.has(nodeId || 'root') ? 'inverse' : 'primary',
        tone: activeNodeSet.has(nodeId || 'root') ? 'accent' : nodeLabel === '$' ? 'success' : 'default',
        width: 46,
        x,
        y,
      })
      return { x, y }
    }

    const childPoints = childEntries.map(([label, child]) => {
      const childId = `${nodeId}${label}`
      return { label, point: layout(child, childId, depth + 1) }
    })
    const x = childPoints.reduce((sum, child) => sum + child.point.x, 0) / childPoints.length
    const nodeLabel = nodeId === '' ? 'root' : nodeId.slice(-1) || '$'
    nodes.push({
      height: 34,
      id: nodeId || 'root',
      label: nodeLabel,
      shape: 'box',
      textTone: activeNodeSet.has(nodeId || 'root') ? 'inverse' : 'primary',
      tone: activeNodeSet.has(nodeId || 'root') ? 'accent' : nodeLabel === '$' ? 'success' : 'default',
      width: 46,
      x,
      y,
    })

    childPoints.forEach(({ label, point }) => {
      const edgeId = `${nodeId || 'root'}->${nodeId}${label}`
      edges.push({
        fromX: x,
        fromY: y + 17,
        id: edgeId,
        label,
        strokeStyle: activeEdgeSet.has(edgeId) ? 'dashed' : 'solid',
        toX: point.x,
        toY: point.y - 17,
        tone: activeEdgeSet.has(edgeId) ? 'accent' : 'default',
      })
    })

    return { x, y }
  }

  layout(root, '', 0)
  return { edges, emptyLabel: options.emptyLabel, nodes }
}

const compactTrieCanvas = (
  root: CompactTrieNode,
  options: Readonly<{
    activeNodeIds?: readonly string[]
    activeEdgeIds?: readonly string[]
    emptyLabel: string
  }>,
): TreeCanvas => {
  const activeNodeSet = new Set(options.activeNodeIds ?? [])
  const activeEdgeSet = new Set(options.activeEdgeIds ?? [])
  const nodes: TreeCanvasNode[] = []
  const edges: TreeCanvasEdge[] = []
  let leafIndex = 0

  const layout = (node: CompactTrieNode, nodeId: string, depth: number): Readonly<{ x: number; y: number }> => {
    const y = 64 + depth * 88
    if (node.edges.length === 0) {
      leafIndex += 1
      const x = 80 + leafIndex * 90
      nodes.push({
        height: 34,
        id: nodeId || 'root',
        label: nodeId === '' ? 'root' : '$',
        shape: 'box',
        textTone: activeNodeSet.has(nodeId || 'root') ? 'inverse' : 'primary',
        tone: activeNodeSet.has(nodeId || 'root') ? 'accent' : node.terminal ? 'success' : 'default',
        width: 54,
        x,
        y,
      })
      return { x, y }
    }

    const childPoints = node.edges.map((edge) => ({
      edge,
      point: layout(edge.child, `${nodeId || 'root'}/${edge.label}`, depth + 1),
    }))
    const x = childPoints.reduce((sum, child) => sum + child.point.x, 0) / childPoints.length
    nodes.push({
      height: 34,
      id: nodeId || 'root',
      label: nodeId === '' ? 'root' : '',
      shape: 'box',
      textTone: activeNodeSet.has(nodeId || 'root') ? 'inverse' : 'primary',
      tone: activeNodeSet.has(nodeId || 'root') ? 'accent' : node.terminal ? 'success' : 'default',
      width: 54,
      x,
      y,
    })

    childPoints.forEach(({ edge, point }) => {
      const edgeNodeId = `${nodeId || 'root'}/${edge.label}`
      const edgeId = `${nodeId || 'root'}->${edgeNodeId}`
      edges.push({
        fromX: x,
        fromY: y + 17,
        id: edgeId,
        label: edge.label,
        strokeStyle: activeEdgeSet.has(edgeId) ? 'dashed' : 'solid',
        toX: point.x,
        toY: point.y - 17,
        tone: activeEdgeSet.has(edgeId) ? 'accent' : 'default',
      })
    })

    return { x, y }
  }

  layout(root, '', 0)
  return { edges, emptyLabel: options.emptyLabel, nodes }
}

const buildInitialBalancedTreeFrame = (
  algorithmId: 'avl-trees' | '2-3-trees' | 'left-leaning-red-black-trees',
): TreeWorkbenchFrame =>
  createFrame(
    0,
    [1],
    'Empty structure',
    'Insert keys to build your own structure. The workbench keeps the tree valid and records each balancing step.',
    { edges: [], emptyLabel: 'Insert keys to build a structure.', nodes: [] },
    treeComplexityByAlgorithm[algorithmId],
    ['No operations yet.'],
    'Idle',
  )

const buildAvlFrames = (operations: readonly TreeWorkbenchOperation[]): readonly TreeWorkbenchFrame[] => {
  const frames: TreeWorkbenchFrame[] = [buildInitialBalancedTreeFrame('avl-trees')]
  let root: BinaryNode | null = null

  type BalancedOperation = Extract<TreeWorkbenchOperation, { kind: 'insert-key' | 'search-key' | 'delete-key' }>
  const balancedOperations = operations.filter(
    (operation): operation is BalancedOperation =>
      operation.kind === 'insert-key' ||
      operation.kind === 'search-key' ||
      operation.kind === 'delete-key',
  ) as BalancedOperation[]

  balancedOperations.forEach((operation) => {
    switch (operation.kind) {
      case 'insert-key': {
        const path = getSearchPath(root, operation.value)
        frames.push(
          createFrame(
            frames.length,
            [1, 2],
            `Trace insertion path for ${operation.value}`,
            path.path.length === 0
              ? `The tree is empty, so ${operation.value} will become the root.`
              : `Follow the ordered search path ${path.path.join(' -> ')} to locate the insertion point for ${operation.value}.`,
            binaryTreeCanvas(root, {
              activeKeys: path.path,
              emptyLabel: 'Insert keys to build a structure.',
              showBalance: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(root)}` },
              { label: 'Height', value: `${heightOf(root)}` },
              { label: 'Next key', value: `${operation.value}` },
            ],
            [`Search path: ${path.path.length === 0 ? '(empty tree)' : path.path.join(' -> ')}`],
            'Tracing',
          ),
        )

        const plainRoot = plainInsertBinarySearchTree(root, operation.value)
        const events: string[] = []
        const inserted = avlInsert(root, operation.value, events)
        root = inserted.node
        frames.push(
          createFrame(
            frames.length,
            [3],
            `Insert ${operation.value} as a BST leaf`,
            inserted.inserted
              ? `${operation.value} is first inserted exactly like a BST leaf before any balancing work happens.`
              : `${operation.value} is already present, so the ordered set does not change.`,
            binaryTreeCanvas(inserted.inserted ? plainRoot : root, {
              activeKeys: [operation.value],
              emptyLabel: 'Insert keys to build a structure.',
              showBalance: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(inserted.inserted ? plainRoot : root)}` },
              { label: 'Height', value: `${heightOf(inserted.inserted ? plainRoot : root)}` },
              { label: 'Inserted', value: inserted.inserted ? 'yes' : 'duplicate' },
            ],
            inserted.inserted
              ? [`Placed ${operation.value} as the new leaf candidate.`]
              : [`Skipped duplicate key ${operation.value}.`],
            inserted.inserted ? 'Leaf inserted' : 'Duplicate',
          ),
        )

        frames.push(
          createFrame(
            frames.length,
            inserted.inserted && events.length > 0 ? [4, 5, 6] : [4],
            `Rebalance after inserting ${operation.value}`,
            inserted.inserted
              ? events.length === 0
                ? `No node exceeded balance factor 1 in magnitude, so the tree already satisfies the AVL rule.`
                : events.join(' ')
              : `No rebalancing is needed because duplicates do not change the tree.`,
            binaryTreeCanvas(root, {
              activeKeys: [operation.value],
              emptyLabel: 'Insert keys to build a structure.',
              showBalance: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(root)}` },
              { label: 'Height', value: `${heightOf(root)}` },
              { label: 'Root', value: root?.key == null ? 'none' : `${root.key}` },
            ],
            events.length === 0 ? ['AVL invariant restored without any Ian-method rebuild.'] : events,
            'Balanced',
          ),
        )
        return
      }
      case 'delete-key': {
        const path = getSearchPath(root, operation.value)
        frames.push(
          createFrame(
            frames.length,
            [7, 8],
            `Trace deletion path for ${operation.value}`,
            path.found
              ? `Follow the search path ${path.path.join(' -> ')} to locate ${operation.value} for removal.`
              : `${operation.value} is absent; deletion stops after following ${path.path.join(' -> ')}.`,
            binaryTreeCanvas(root, {
              activeKeys: path.path,
              emptyLabel: 'Insert keys to build a structure.',
              showBalance: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(root)}` },
              { label: 'Height', value: `${heightOf(root)}` },
              { label: 'Delete', value: `${operation.value}` },
            ],
            [`Visited path: ${path.path.length === 0 ? '(empty tree)' : path.path.join(' -> ')}`],
            path.found ? 'Tracing' : 'Missing',
          ),
        )

        if (!path.found) {
          return
        }

        const keys = inorderKeys(root)
        const nextKeys = keys.filter((key) => key !== operation.value)
        root = rebuildAvlFromKeys(nextKeys)

        frames.push(
          createFrame(
            frames.length,
            [8, 9],
            `Delete ${operation.value} and rebalance`,
            `Removed ${operation.value} then rebuilt the AVL by reinserting remaining keys to restore balance.`,
            binaryTreeCanvas(root, {
              activeKeys: [],
              emptyLabel: 'Insert keys to build a structure.',
              showBalance: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(root)}` },
              { label: 'Height', value: `${heightOf(root)}` },
              { label: 'Root', value: root?.key == null ? 'none' : `${root.key}` },
            ],
            [
              `Deleted ${operation.value}.`,
              `Remaining keys (${nextKeys.length}): ${nextKeys.join(', ') || 'empty set'}.`,
            ],
            'Balanced',
          ),
        )
        return
      }
      case 'search-key': {
        const path = getSearchPath(root, operation.value)
        frames.push(
          createFrame(
            frames.length,
            [1, 2],
            `Search for ${operation.value}`,
            path.found
              ? `Search follows ${path.path.join(' -> ')} and finds ${operation.value}.`
              : `Search follows ${path.path.join(' -> ')} and stops at a null child, so ${operation.value} is absent.`,
            binaryTreeCanvas(root, {
              activeKeys: path.path,
              emptyLabel: 'Insert keys to build a structure.',
              showBalance: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(root)}` },
              { label: 'Height', value: `${heightOf(root)}` },
              { label: 'Found', value: path.found ? 'yes' : 'no' },
            ],
            [`Visited path: ${path.path.length === 0 ? '(empty tree)' : path.path.join(' -> ')}`],
            path.found ? 'Found' : 'Missing',
          ),
        )
        return
      }
    }
  })

  return frames
}

const buildLlrbFrames = (operations: readonly TreeWorkbenchOperation[]): readonly TreeWorkbenchFrame[] => {
  const frames: TreeWorkbenchFrame[] = [buildInitialBalancedTreeFrame('left-leaning-red-black-trees')]
  let root: BinaryNode | null = null

  const balancedOperations = operations.filter(
    (operation): operation is Extract<TreeWorkbenchOperation, { kind: 'insert-key' | 'search-key' | 'delete-key' }> =>
      operation.kind === 'insert-key' ||
      operation.kind === 'search-key' ||
      operation.kind === 'delete-key',
  )

  balancedOperations.forEach((operation) => {
    switch (operation.kind) {
      case 'insert-key': {
        const path = getSearchPath(root, operation.value)
        frames.push(
          createFrame(
            frames.length,
            [1, 2],
            `Trace insertion path for ${operation.value}`,
            path.path.length === 0
              ? `The tree is empty, so ${operation.value} will become the root after recoloring.`
              : `Follow the BST path ${path.path.join(' -> ')} before local red-black fix-ups begin.`,
            binaryTreeCanvas(root, {
              activeKeys: path.path,
              emptyLabel: 'Insert keys to build a structure.',
              showColor: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(root)}` },
              { label: 'Black root', value: root === null ? 'n/a' : root.color ?? 'black' },
              { label: 'Next key', value: `${operation.value}` },
            ],
            [`Search path: ${path.path.length === 0 ? '(empty tree)' : path.path.join(' -> ')}`],
            'Tracing',
          ),
        )

        const events: string[] = []
        const inserted = llrbInsert(root, operation.value, events)
        root = recolorRootBlack(inserted.node)
        frames.push(
          createFrame(
            frames.length,
            inserted.inserted ? [2, 3, 4, 5, 6] : [1],
            `Fix up after inserting ${operation.value}`,
            inserted.inserted
              ? `${events.join(' ')} The root is repainted black at the end.`
              : `${operation.value} is already present, so no new red node is inserted.`,
            binaryTreeCanvas(root, {
              activeKeys: [operation.value],
              emptyLabel: 'Insert keys to build a structure.',
              showColor: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(root)}` },
              { label: 'Root', value: root === null ? 'none' : `${root.key}` },
              { label: 'Red links', value: `${countRedLinks(root)}` },
            ],
            events.length === 0 ? [`Skipped duplicate key ${operation.value}.`] : events,
            'Balanced',
          ),
        )
        break
      }

      case 'delete-key': {
        const deleteValue = operation.value
        const path = getSearchPath(root, deleteValue)
        frames.push(
          createFrame(
            frames.length,
            [7, 8],
            `Trace deletion path for ${deleteValue}`,
            path.found
              ? `Follow the BST path ${path.path.join(' -> ')} before applying red-black fix-ups for deletion.`
              : `${deleteValue} is not present after following ${path.path.join(' -> ')}.`,
            binaryTreeCanvas(root, {
              activeKeys: path.path,
              emptyLabel: 'Insert keys to build a structure.',
              showColor: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(root)}` },
              { label: 'Root', value: root === null ? 'none' : `${root.key}` },
              { label: 'Delete', value: `${deleteValue}` },
            ],
            [`Visited path: ${path.path.length === 0 ? '(empty tree)' : path.path.join(' -> ')}`],
            path.found ? 'Tracing' : 'Missing',
          ),
        )

        if (!path.found) {
          break
        }

        const keys = inorderKeys(root)
        const nextKeys = keys.filter((key) => key !== deleteValue)
        root = rebuildLlrbFromKeys(nextKeys)

        frames.push(
          createFrame(
            frames.length,
            [8, 9],
            `Delete ${deleteValue} and restore red-black invariants`,
            `Removed ${deleteValue} and rebuilt the left-leaning red-black tree from remaining keys; root repainted black.`,
            binaryTreeCanvas(root, {
              activeKeys: [],
              emptyLabel: 'Insert keys to build a structure.',
              showColor: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(root)}` },
              { label: 'Root', value: root === null ? 'none' : `${root.key}` },
              { label: 'Red links', value: `${countRedLinks(root)}` },
            ],
            [
              `Deleted ${deleteValue}.`,
              `Remaining keys (${nextKeys.length}): ${nextKeys.join(', ') || 'empty set'}.`,
            ],
            'Balanced',
          ),
        )
        break
      }

      case 'search-key': {
        const path = getSearchPath(root, operation.value)
        frames.push(
          createFrame(
            frames.length,
            [1],
            `Search for ${operation.value}`,
            path.found
              ? `Ignore colors during search and follow ${path.path.join(' -> ')} to find ${operation.value}.`
              : `Ignore colors during search; ${operation.value} is not present after following ${path.path.join(' -> ')}.`,
            binaryTreeCanvas(root, {
              activeKeys: path.path,
              emptyLabel: 'Insert keys to build a structure.',
              showColor: true,
            }),
            [
              { label: 'Nodes', value: `${countNodes(root)}` },
              { label: 'Found', value: path.found ? 'yes' : 'no' },
              { label: 'Root', value: root === null ? 'none' : `${root.key}` },
            ],
            [`Visited path: ${path.path.length === 0 ? '(empty tree)' : path.path.join(' -> ')}`],
            path.found ? 'Found' : 'Missing',
          ),
        )
        break
      }
    }
  })

  return frames
}

const buildTwoThreeFrames = (operations: readonly TreeWorkbenchOperation[]): readonly TreeWorkbenchFrame[] => {
  const frames: TreeWorkbenchFrame[] = [buildInitialBalancedTreeFrame('2-3-trees')]
  let root: TwoThreeNode | null = null

  const balancedOperations = operations.filter(
    (operation): operation is Extract<TreeWorkbenchOperation, { kind: 'insert-key' | 'search-key' | 'delete-key' }> =>
      operation.kind === 'insert-key' ||
      operation.kind === 'search-key' ||
      operation.kind === 'delete-key',
  )

  balancedOperations.forEach((operation) => {
    if (operation.kind === 'insert-key') {
      const events: string[] = []
      const inserted = insertTwoThreeRoot(root, operation.value, events)
      root = inserted.root
      frames.push(
        createFrame(
          frames.length,
          inserted.inserted ? [1, 2, 3, 4, 5, 6] : [1],
          `Insert ${operation.value} into the 2-3 tree`,
          inserted.inserted
            ? events.join(' ')
            : `${operation.value} is already present, so the 2-3 tree remains unchanged.`,
          twoThreeCanvas(root, [operation.value], 'Insert keys to build a 2-3 tree.'),
          [
            { label: 'Keys', value: `${countTwoThreeKeys(root)}` },
            { label: 'Height', value: `${twoThreeHeight(root)}` },
            { label: 'Root node', value: root === null ? 'none' : root.keys.join(' | ') },
          ],
          events.length === 0 ? [`Skipped duplicate key ${operation.value}.`] : events,
          inserted.inserted ? 'Balanced' : 'Duplicate',
        ),
      )
      return
    }

    if (operation.kind === 'delete-key') {
      const keys = gatherTwoThreeKeys(root)
      const nextKeys = keys.filter((key) => key !== operation.value)

      frames.push(
        createFrame(
          frames.length,
          [7, 8, 9],
          `Delete ${operation.value} from the 2-3 tree`,
          nextKeys.length === keys.length
            ? `${operation.value} is not present, so the 2-3 tree stays unchanged.`
            : `Remove ${operation.value}, then rebuild by reinserting remaining keys to restore perfect balance.`,
          twoThreeCanvas(root, [operation.value], 'Insert keys to build a 2-3 tree.'),
          [
            { label: 'Keys', value: `${countTwoThreeKeys(root)}` },
            { label: 'Height', value: `${twoThreeHeight(root)}` },
            { label: 'Delete', value: `${operation.value}` },
          ],
          nextKeys.length === keys.length
            ? [`${operation.value} not found; no structural changes.`]
            : [`Deleted ${operation.value}.`, `Remaining keys (${nextKeys.length}): ${nextKeys.join(', ') || 'empty set'}.`],
          nextKeys.length === keys.length ? 'Missing' : 'Rebalancing',
        ),
      )

      if (nextKeys.length === keys.length) {
        return
      }

      root = rebuildTwoThreeFromKeys(nextKeys)

      frames.push(
        createFrame(
          frames.length,
          [7, 8, 9],
          `Balanced 2-3 tree after deleting ${operation.value}`,
          `Reinserted remaining keys to obtain a valid 2-3 tree with uniform leaf depth.`,
          twoThreeCanvas(root, [], 'Insert keys to build a 2-3 tree.'),
          [
            { label: 'Keys', value: `${countTwoThreeKeys(root)}` },
            { label: 'Height', value: `${twoThreeHeight(root)}` },
            { label: 'Root node', value: root === null ? 'none' : root.keys.join(' | ') },
          ],
          ['Tree rebuilt from remaining keys.'],
          'Balanced',
        ),
      )
      return
    }

    if (operation.kind === 'search-key') {
      frames.push(
        createFrame(
          frames.length,
          [1, 2],
          `Inspect current 2-3 tree for ${operation.value}`,
          `Search is the BST generalisation over 2-nodes and 3-nodes. Use the ordered keys inside each node to choose the correct child.`,
          twoThreeCanvas(root, [operation.value], 'Insert keys to build a 2-3 tree.'),
          [
            { label: 'Keys', value: `${countTwoThreeKeys(root)}` },
            { label: 'Height', value: `${twoThreeHeight(root)}` },
            { label: 'Query', value: `${operation.value}` },
          ],
          ['Search guidance only: exact path tracing for multiway nodes is shown through the highlighted query target.'],
          'Inspecting',
        ),
      )
    }
  })

  return frames
}

const buildPrefixTrieFrames = (operations: readonly TreeWorkbenchOperation[]): readonly TreeWorkbenchFrame[] => {
  const frames: TreeWorkbenchFrame[] = [
    createFrame(
      0,
      [1],
      'Empty trie',
      'Insert words to share prefixes automatically. Each word is stored with a terminal marker so prefixes and complete words stay distinct.',
      trieCanvas(initialTrieNode, { emptyLabel: 'Insert words to build a trie.' }),
      treeComplexityByAlgorithm['prefix-tries'],
      ['No words inserted yet.'],
      'Idle',
    ),
  ]
  let root = initialTrieNode

  operations.forEach((operation) => {
    if (operation.kind !== 'insert-word' && operation.kind !== 'lookup-word') {
      return
    }

    if (operation.kind === 'insert-word') {
      const inserted = insertTrieWord(root, operation.value)
      root = inserted.root
      frames.push(
        createFrame(
          frames.length,
          [1, 2, 3, 4, 5, 6],
          `Insert "${operation.value}"`,
          inserted.createdCount === 0
            ? `All characters in "${operation.value}" already existed, so this operation mainly confirms the terminal marker.`
            : `Traverse character by character and create ${inserted.createdCount} missing node${inserted.createdCount === 1 ? '' : 's'} while storing "${operation.value}$".`,
          trieCanvas(root, {
            activeEdgeIds: inserted.pathEdgeIds,
            activeNodeIds: inserted.pathNodeIds,
            emptyLabel: 'Insert words to build a trie.',
          }),
          [
            { label: 'Words', value: `${countTrieWords(root)}` },
            { label: 'Nodes', value: `${countTrieNodes(root)}` },
            { label: 'Edges', value: `${countTrieEdges(root)}` },
          ],
          [`Path: ${inserted.pathNodeIds.join(' -> ')}`, `Created nodes: ${inserted.createdCount}`],
          'Inserted',
        ),
      )
      return
    }

    if (operation.kind === 'lookup-word') {
      const result = lookupTrieWord(root, operation.value, operation.mode)
      frames.push(
        createFrame(
          frames.length,
          [1, 2, 3, 4, 5],
          operation.mode === 'prefix'
            ? `Prefix lookup for "${operation.value}"`
            : `Exact lookup for "${operation.value}"`,
          result.matched
            ? operation.mode === 'prefix'
              ? `"${operation.value}" matches a prefix path in the trie.`
              : `"${operation.value}" reaches a terminal marker, so the exact word exists.`
            : operation.mode === 'prefix'
              ? `"${operation.value}" falls off the trie before the whole prefix is consumed.`
              : `"${operation.value}" either falls off the trie or does not end at a terminal marker.`,
          trieCanvas(root, {
            activeEdgeIds: result.pathEdgeIds,
            activeNodeIds: result.pathNodeIds,
            emptyLabel: 'Insert words to build a trie.',
          }),
          [
            { label: 'Words', value: `${countTrieWords(root)}` },
            { label: 'Nodes', value: `${countTrieNodes(root)}` },
            { label: 'Matched', value: result.matched ? 'yes' : 'no' },
          ],
          [`Path: ${result.pathNodeIds.join(' -> ')}`],
          result.matched ? 'Matched' : 'Miss',
        ),
      )
    }
  })

  return frames
}

const buildSuffixStructureFrames = (
  algorithmId: 'suffix-tries' | 'suffix-trees',
  operations: readonly TreeWorkbenchOperation[],
): readonly TreeWorkbenchFrame[] => {
  const initialCanvas =
    algorithmId === 'suffix-tries'
      ? trieCanvas(initialTrieNode, { emptyLabel: 'Choose a base string to build its suffix structure.' })
      : compactTrieCanvas({ edges: [], terminal: false }, { emptyLabel: 'Choose a base string to build its suffix structure.' })
  const frames: TreeWorkbenchFrame[] = [
    createFrame(
      0,
      [1],
      'No base string yet',
      'Set a base string first. The workbench appends a terminal marker automatically when required.',
      initialCanvas,
      treeComplexityByAlgorithm[algorithmId],
      ['No base string configured.'],
      'Idle',
    ),
  ]

  let currentText = ''

  operations.forEach((operation) => {
    if (operation.kind !== 'set-text' && operation.kind !== 'search-pattern') {
      return
    }

    if (operation.kind === 'set-text') {
      currentText = operation.value
      const suffixTrie = buildSuffixTrie(currentText)
      if (algorithmId === 'suffix-tries') {
        frames.push(
          createFrame(
            frames.length,
            [1, 2, 3, 4],
            `Build suffix trie for "${suffixTrie.withTerminal}"`,
            `Insert every suffix of "${suffixTrie.withTerminal}" into one trie so every substring query becomes a prefix walk.`,
            trieCanvas(suffixTrie.root, {
              emptyLabel: 'Choose a base string to build its suffix structure.',
            }),
            [
              { label: 'Text', value: suffixTrie.withTerminal },
              { label: 'Suffixes', value: `${suffixTrie.suffixes.length}` },
              { label: 'Trie nodes', value: `${countTrieNodes(suffixTrie.root)}` },
            ],
            [`Suffixes: ${suffixTrie.suffixes.join(', ')}`],
            'Built',
          ),
        )
      } else {
        const compactRoot = compressTrieNode(suffixTrie.root)
        frames.push(
          createFrame(
            frames.length,
            [1, 2, 3, 4],
            `Build suffix tree for "${suffixTrie.withTerminal}"`,
            `Start from the suffix trie, then compress every non-branching path so each edge stores a shared substring.`,
            compactTrieCanvas(compactRoot, {
              emptyLabel: 'Choose a base string to build its suffix structure.',
            }),
            [
              { label: 'Text', value: suffixTrie.withTerminal },
              { label: 'Suffixes', value: `${suffixTrie.suffixes.length}` },
              { label: 'Compact edges', value: `${compactRoot.edges.length}` },
            ],
            [`Suffixes: ${suffixTrie.suffixes.join(', ')}`],
            'Built',
          ),
        )
      }
      return
    }

    if (operation.kind === 'search-pattern' && currentText.length > 0) {
      const suffixTrie = buildSuffixTrie(currentText)
      if (algorithmId === 'suffix-tries') {
        const result = lookupTrieWord(suffixTrie.root, operation.value, 'prefix')
        frames.push(
          createFrame(
            frames.length,
            [5, 6],
            `Search pattern "${operation.value}"`,
            result.matched
              ? `"${operation.value}" is a prefix of at least one suffix, so it occurs as a substring.`
              : `"${operation.value}" is not a prefix of any suffix, so it does not occur as a substring.`,
            trieCanvas(suffixTrie.root, {
              activeEdgeIds: result.pathEdgeIds,
              activeNodeIds: result.pathNodeIds,
              emptyLabel: 'Choose a base string to build its suffix structure.',
            }),
            [
              { label: 'Text', value: suffixTrie.withTerminal },
              { label: 'Pattern', value: operation.value },
              { label: 'Match', value: result.matched ? 'yes' : 'no' },
            ],
            [`Visited path: ${result.pathNodeIds.join(' -> ')}`],
            result.matched ? 'Matched' : 'Miss',
          ),
        )
      } else {
        const compactRoot = compressTrieNode(suffixTrie.root)
        const result = searchCompactTrie(compactRoot, operation.value)
        frames.push(
          createFrame(
            frames.length,
            [5, 6],
            `Search pattern "${operation.value}"`,
            result.matched
              ? `Pattern matching succeeds by consuming "${operation.value}" across compact substring edges.`
              : `Pattern matching fails before the whole query can be consumed across the compact edges.`,
            compactTrieCanvas(compactRoot, {
              activeEdgeIds: result.pathEdgeIds,
              activeNodeIds: result.pathNodeIds,
              emptyLabel: 'Choose a base string to build its suffix structure.',
            }),
            [
              { label: 'Text', value: suffixTrie.withTerminal },
              { label: 'Pattern', value: operation.value },
              { label: 'Match', value: result.matched ? 'yes' : 'no' },
            ],
            [`Visited nodes: ${result.pathNodeIds.join(' -> ')}`],
            result.matched ? 'Matched' : 'Miss',
          ),
        )
      }
    }
  })

  return frames
}

const buildTreeWorkbenchTimeline = (
  algorithmId: TreeAlgorithmId,
  operations: readonly TreeWorkbenchOperation[],
): TreeWorkbenchTimeline => {
  const frames =
    algorithmId === 'avl-trees'
      ? buildAvlFrames(operations)
      : algorithmId === '2-3-trees'
        ? buildTwoThreeFrames(operations)
        : algorithmId === 'left-leaning-red-black-trees'
          ? buildLlrbFrames(operations)
          : algorithmId === 'prefix-tries'
            ? buildPrefixTrieFrames(operations)
            : buildSuffixStructureFrames(algorithmId, operations)

  const controlKind =
    algorithmId === 'prefix-tries'
      ? 'prefix-trie'
      : algorithmId === 'suffix-tries' || algorithmId === 'suffix-trees'
        ? 'suffix-structure'
        : 'balanced-tree'

  const pseudocodeLines =
    algorithmId === 'avl-trees' ||
    algorithmId === '2-3-trees' ||
    algorithmId === 'left-leaning-red-black-trees'
      ? balancedTreePseudocodeByAlgorithm[algorithmId]
      : triePseudocodeByAlgorithm[algorithmId]

  return {
    algorithmId,
    complexityRows: treeComplexityByAlgorithm[algorithmId],
    controlKind,
    frames,
    pseudocodeLines,
    subtitle: treeSubtitleByAlgorithm[algorithmId],
    title: treeDirectoryLabelByAlgorithm[algorithmId],
  }
}

const treeSampleOperationsByAlgorithm: Record<TreeAlgorithmId, readonly TreeWorkbenchOperation[]> = {
  'avl-trees': [
    { id: 'sample-1', kind: 'insert-key', value: 11 },
    { id: 'sample-2', kind: 'insert-key', value: 7 },
    { id: 'sample-3', kind: 'insert-key', value: 25 },
    { id: 'sample-4', kind: 'insert-key', value: 4 },
    { id: 'sample-5', kind: 'insert-key', value: 9 },
    { id: 'sample-6', kind: 'insert-key', value: 14 },
    { id: 'sample-7', kind: 'insert-key', value: 31 },
    { id: 'sample-8', kind: 'insert-key', value: 2 },
  ],
  '2-3-trees': [
    { id: 'sample-1', kind: 'insert-key', value: 11 },
    { id: 'sample-2', kind: 'insert-key', value: 7 },
    { id: 'sample-3', kind: 'insert-key', value: 25 },
    { id: 'sample-4', kind: 'insert-key', value: 4 },
    { id: 'sample-5', kind: 'insert-key', value: 9 },
    { id: 'sample-6', kind: 'insert-key', value: 14 },
    { id: 'sample-7', kind: 'insert-key', value: 31 },
    { id: 'sample-8', kind: 'insert-key', value: 2 },
  ],
  'left-leaning-red-black-trees': [
    { id: 'sample-1', kind: 'insert-key', value: 11 },
    { id: 'sample-2', kind: 'insert-key', value: 7 },
    { id: 'sample-3', kind: 'insert-key', value: 25 },
    { id: 'sample-4', kind: 'insert-key', value: 4 },
    { id: 'sample-5', kind: 'insert-key', value: 9 },
    { id: 'sample-6', kind: 'insert-key', value: 14 },
    { id: 'sample-7', kind: 'insert-key', value: 31 },
    { id: 'sample-8', kind: 'insert-key', value: 27 },
  ],
  'prefix-tries': [
    { id: 'sample-1', kind: 'insert-word', value: 'ant' },
    { id: 'sample-2', kind: 'insert-word', value: 'an' },
    { id: 'sample-3', kind: 'insert-word', value: 'all' },
    { id: 'sample-4', kind: 'insert-word', value: 'alloy' },
    { id: 'sample-5', kind: 'insert-word', value: 'aloe' },
  ],
  'suffix-tries': [{ id: 'sample-1', kind: 'set-text', value: 'banana' }],
  'suffix-trees': [{ id: 'sample-1', kind: 'set-text', value: 'banana' }],
}

export {
  buildTreeWorkbenchTimeline,
  sanitizeText,
  sanitizeWord,
  treeDirectoryLabelByAlgorithm,
  treeSampleOperationsByAlgorithm,
}

export type {
  TreeCanvas,
  TreeCanvasEdge,
  TreeCanvasNode,
  TreeCanvasNodeTone,
  TreeMetric,
  TreeWorkbenchFrame,
  TreeWorkbenchOperation,
  TreeWorkbenchPseudocodeLine,
  TreeWorkbenchTimeline,
}
