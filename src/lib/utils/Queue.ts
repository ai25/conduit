import { batch } from 'solid-js'

export default class Queue {
  queue: (() => void)[] = []
  start = performance.now()
  add(callback: () => void) {
    if (this.queue.length === 0) {
      this.start = performance.now()
      setTimeout(() => this.execute(), 50)
    }
    this.queue.push(callback)
    // callback()
  }
  execute() {
    batch(() => this.queue.forEach((callback) => callback()))
    this.queue = []
  }
}
