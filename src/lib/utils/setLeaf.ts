import { createStore } from 'solid-js/store'

export default <T extends object>(leaf: T) => createStore(leaf)[1]
