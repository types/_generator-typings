import { createStore, combineReducers, ReducersMapObject, Reducer, Store as ReduxStore, Unsubscribe } from 'redux'

export class Store {
  reducersMap: ReducersMapObject = {}
  listeners: Array<() => any> = []
  unsubscribes: Unsubscribe[] = []
  store: ReduxStore<any>
  addReducer(section: string, reducer: Reducer<any>) {
    this.reducersMap[section] = reducer
  }
  create(): ReduxStore<any> {
    this.store = createStore(combineReducers(this.reducersMap))
    this.listeners.forEach(listener => {
      this.unsubscribes.push(this.store.subscribe(listener))
    })
    return this.store
  }
  dispatch(action: any) {
    if (!this.store) {
      throw new Error('You need to call `create()` before calling `dispatch()`')
    }
    this.store.dispatch(action)
  }

  subscribe(listener: () => void): Unsubscribe {
    if (this.store) {
      return this.store.subscribe(listener)
    }
    else {
      let isSubscribed = true
      this.listeners.push(listener)
      return function unsubscribe() {
        if (!isSubscribed) {
          return
        }

        isSubscribed = false

        // ensureCanMutateNextListeners()
        const index = this.listeners.indexOf(listener)
        this.listeners.splice(index, 1)
        if (this.unsubscribes.length > index) {
          this.unsubscribes.splice(index, 1)
        }
      }
    }
  }
  getState<S>() {
    return this.store.getState() as S
  }
}
