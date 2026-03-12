// Central limits for Topic 02 sorting workbenches.
// These caps keep timeline/frame generation responsive and prevent huge bucket arrays.

export const MAX_TOPIC02_SORT_DATASET_LENGTH = 12 as const

// Counting sort creates arrays of length (maxValue + 1) and iterates 0..maxValue.
export const MAX_COUNTING_SORT_VALUE = 25 as const

// Radix sort in Topic 02 is presented as a 3-digit (LSD) example.
export const MAX_RADIX_SORT_VALUE = 999 as const

