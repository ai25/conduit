export default function concat<T extends any[]>(arg1: T, ...args: T[]) {
  return arg1.concat(...args)
}
