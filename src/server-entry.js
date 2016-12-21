import { app } from './app'

// This exported function will be called by `bundleRenderer`.
export default context => {
  return Promise.resolve(app)
}
