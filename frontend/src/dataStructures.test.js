import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { HashTable, mergeSort } from './dataStructures.js'

describe('HashTable', () => {
  it('stores, updates, and retrieves values through collisions and resizing', () => {
    const table = new HashTable(2)
    for (let index = 0; index < 30; index += 1) {
      table.set(`item-${index}`, index)
    }

    table.set('item-4', 'updated')
    assert.equal(table.size, 30)
    assert.equal(table.get('item-4'), 'updated')
    assert.equal(table.get('item-29'), 29)
    assert.equal(table.has('missing'), false)
  })

  it('requires string keys', () => {
    assert.throws(() => new HashTable().set(1, 'value'), TypeError)
  })
})

describe('mergeSort', () => {
  it('sorts without mutating its input and preserves equal-item order', () => {
    const items = [
      { name: 'Bravo', id: 1 },
      { name: 'Alpha', id: 2 },
      { name: 'Alpha', id: 3 },
    ]

    const sorted = mergeSort(items, (first, second) => first.name.localeCompare(second.name))

    assert.deepEqual(sorted.map((item) => item.id), [2, 3, 1])
    assert.deepEqual(items.map((item) => item.id), [1, 2, 3])
  })
})
