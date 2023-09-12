//  interpolated from solidjs' mapArray
//  https://github.com/solidjs/solid/blob/main/packages/solid/src/reactive/array.ts

export default function minimumMutationOperations<T>(
  oldArray: T[],
  newArray: T[],
  dirty?: Set<number | string>
) {
  const result: {
    added: { index: number; value: T }[]
    moved: { oldIndex: number; newIndex: number; value: T }[]
    deleted: number[]
    dirty: number[]
  } = {
    added: [],
    moved: [],
    deleted: [],
    dirty: [],
  }

  // fast path for empty arrays
  if (oldArray.length === 0) {
    result.added = newArray.map((value, index) => ({ index, value }))
  }
  // fast path for new create
  else if (newArray.length === 0) {
    result.deleted = oldArray.map((v, i) => i)
  } else {
    let start, end, newEnd
    let item

    let i, j
    let oldLength = oldArray.length
    let newLength = newArray.length

    // skip common prefix
    for (
      start = 0, end = Math.min(oldLength, newLength);
      start < end && oldArray[start] === newArray[start];
      start++
    );

    // common suffix
    for (
      end = oldLength - 1, newEnd = newLength - 1;
      end >= start && newEnd >= start && oldArray[end] === newArray[newEnd];
      end--, newEnd--
    );

    // 0) prepare a map of all indices in newArray, scanning backwards so we encounter them in natural order
    let newIndices = new Map<T, number>()
    let newIndicesNext = new Array(newEnd + 1)
    for (j = newEnd; j >= start; j--) {
      item = newArray[j]
      i = newIndices.get(item)!
      newIndicesNext[j] = i === undefined ? -1 : i
      newIndices.set(item, j)
    }
    // 1) step through all old items and see if they can be found in the new set; if so, save them in a temp array and mark them moved; if not, exit them
    for (i = start; i <= end; i++) {
      item = oldArray[i]
      j = newIndices.get(item)!

      if (j !== undefined && j !== -1) {
        result.moved[j] = { oldIndex: i, newIndex: j, value: item }
        j = newIndicesNext[j]
        newIndices.set(item, j)
      } else {
        if (!dirty?.has(i)) result.deleted.push(i)
      }
    }

    // 2) set all the new values, pulling from the temp array if copied, otherwise entering the new value
    for (j = start; j <= newEnd; j++) {
      if (!(j in result.moved)) {
        if (!dirty?.has(j)) {
          result.added.push({ index: j, value: newArray[j] })
        }
      }
    }
  }

  return {
    ...result,
    moved: result.moved.filter(
      ({ oldIndex, newIndex }) => oldIndex !== newIndex
    ),
  }
}
