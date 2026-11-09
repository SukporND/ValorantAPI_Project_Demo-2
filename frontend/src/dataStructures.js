export class HashTable {
  constructor(capacity = 16) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError('HashTable capacity must be a positive integer.')
    }
    this.buckets = Array.from({ length: capacity }, () => [])
    this.size = 0
  }

  hash(key) {
    if (typeof key !== 'string') {
      throw new TypeError('HashTable keys must be strings.')
    }

    let hashValue = 0
    for (let index = 0; index < key.length; index += 1) {
      hashValue = (hashValue * 31 + key.charCodeAt(index)) % this.buckets.length
    }
    return hashValue
  }

  set(key, value) {
    const bucket = this.buckets[this.hash(key)]
    for (const entry of bucket) {
      if (entry[0] === key) {
        entry[1] = value
        return this
      }
    }

    bucket.push([key, value])
    this.size += 1
    if (this.size / this.buckets.length > 0.75) this.resize()
    return this
  }

  get(key) {
    const bucket = this.buckets[this.hash(key)]
    for (const [entryKey, value] of bucket) {
      if (entryKey === key) return value
    }
    return undefined
  }

  has(key) {
    const bucket = this.buckets[this.hash(key)]
    for (const [entryKey] of bucket) {
      if (entryKey === key) return true
    }
    return false
  }

  values() {
    const result = []
    for (const bucket of this.buckets) {
      for (const [, value] of bucket) result.push(value)
    }
    return result
  }

  resize() {
    const entries = []
    for (const bucket of this.buckets) {
      for (const entry of bucket) entries.push(entry)
    }
    this.buckets = Array.from({ length: this.buckets.length * 2 }, () => [])
    this.size = 0
    for (const [key, value] of entries) this.set(key, value)
  }
}

export function mergeSort(items, compare) {
  if (items.length < 2) return [...items]

  const middle = Math.floor(items.length / 2)
  const left = mergeSort(items.slice(0, middle), compare)
  const right = mergeSort(items.slice(middle), compare)
  const sorted = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    if (compare(left[leftIndex], right[rightIndex]) <= 0) {
      sorted.push(left[leftIndex])
      leftIndex += 1
    } else {
      sorted.push(right[rightIndex])
      rightIndex += 1
    }
  }

  return sorted.concat(left.slice(leftIndex), right.slice(rightIndex))
}
