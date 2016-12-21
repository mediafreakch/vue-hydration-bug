import Vue from 'vue'
import App from './App.vue'

const app = new Vue(Vue.util.extend({}, App))

// expose the app
// note we are not mounting the app here, since bootstrapping will be
// different depending on whether we are in a browser or on the server.
export { app }
