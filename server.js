// constants
const resolve = file => path.resolve(__dirname, file)

// external dependencies
const fs = require('fs')
const path = require('path')
const express = require('express')
const LRU = require('lru-cache')
const pug = require('pug')

// instances
const app = express()

let renderer = createRenderer(fs.readFileSync(resolve('./dist/server.js'), 'utf-8'))
let indexHTML = parseIndex(pug.renderFile(resolve('./src/layout.pug')))

function createRenderer (bundle) {
  // https://github.com/vuejs/vue/blob/next/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return require('vue-server-renderer').createBundleRenderer(bundle, {
    cache: LRU(1000)
  })
}

function parseIndex (template) {
  const contentMarker = '<!--__CONTENT__-->'
  const i = template.indexOf(contentMarker)
  return {
    head: template.slice(0, i),
    tail: template.slice(i + contentMarker.length)
  }
}

const serve = (path, cache) => express.static(resolve(path))

app.use('/dist', serve('./dist'))

app.get('*', (req, res) => {
  if (!renderer) {
    return res.end('waiting for compilation... refresh in a moment.')
  }

  res.setHeader("Content-Type", "text/html");
  const renderStream = renderer.renderToStream()

  renderStream.once('data', () => {
    res.write(indexHTML.head)
  })

  renderStream.on('data', chunk => {
    res.write(chunk)
  })

  renderStream.on('end', () => {
    res.end(indexHTML.tail)
  })

  renderStream.on('error', err => {
    if (err && err.code === '404') {
      res.status(404).end('404 | Page Not Found')
      return
    }
    // Render Error Page or Redirect
    res.status(500).end('Internal Error 500')
    console.log(err)
  })
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})
