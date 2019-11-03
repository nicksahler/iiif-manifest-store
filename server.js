const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid')

const argv = require('yargs')
  .alias('p', 'path')
  .describe('p', 'path where data will be stored')
  .default('p', './data')
  .alias('n', 'namespaces')
  .describe(
    'n',
    'Optional namespaces to separate up data. Use as a list ( -n a -n b )'
  )
  .default('n', ['stage', 'prod'])
  .help('help').argv

for (let p of argv.namespaces) {
  const dir = path.resolve(argv.path, p)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Creating data directory '${dir}'`)
  }
}

const app = express()

/*
Route                         HTTP Verb Description
-------------------------------------------------------------------------------------------
/:namespace/manifests         GET       Get all manifests
/:namespace/manifests         POST      Create a manifest - return manifest uri
/:namespace/manifests/:mid    GET       Get manifest by id
/:namespace/manifests/:mid    PUT       Update manifest with id
/:namespace/manifests/:mid    DELETE    Delete manifest with id (currently not implemented)
-------------------------------------------------------------------------------------------
*/
const cleanPath = filePath => {
  return path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '')
}

const formatPath = (namespace, id = '') => {
  return path.resolve(argv.path, namespace, id)
}

const verifyNamespaceMiddleware = (req, res, next) => {
  if (!argv.namespaces.includes(req.params.namespace))
    return res
      .status(403)
      .json({ message: `Invalid namespace '${req.params.namespace}'` })

  next()
}

const cleanManifestIdMiddleware = (req, res, next) => {
  req.params.mid = cleanPath(req.params.mid)
  next()
}

const getFullPathMiddleware = (req, res, next) => {
  req.fullManifestPath = formatPath(req.params.namespace, req.params.mid)

  if (!fs.existsSync(req.fullManifestPath))
    return res
      .status(404)
      .json({
        message: `Manifest '${req.params.mid}' does not exist in namespace '${req.params.namespace}'`,
      })

  next()
}

const formatManifestURI = (host, namespace, id) => {
  return `https://${host}/m/${namespace}/manifests/${id}`
}

app.use(cors())
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

app
  .route('/:namespace/manifests')
  // list all manifets
  .all(verifyNamespaceMiddleware)
  .get((req, res) => {
    const filePath = formatPath(req.params.namespace)
    const files = fs.readdirSync(filePath)

    const manifests = files.map(filename => ({
      uri: formatManifestURI(req.headers.host, req.params.namespace, filename),
    }))

    res.json({ manifests })
  })
  // create a manifest
  .post((req, res) => {
    const id = uuid()
    const uri = formatManifestURI(req.headers.host, req.params.namespace)

    fs.writeFileSync(
      formatPath(req.params.namespace, id),
      JSON.stringify(req.body)
    )
    res.status(201).json({ uri })
  })

app
  .route('/:namespace/manifests/:mid')
  .all(verifyNamespaceMiddleware)
  .all(cleanManifestIdMiddleware)
  .all(getFullPathMiddleware)
  // get manifest with id
  .get((req, res) => {
    const data = fs.readFileSync(req.fullManifestPath, 'utf8')
    res.json(JSON.parse(data))
  })
  // update an existing manifest with id
  .put((req, res) => {
    fs.writeFileSync(req.fullManifestPath, JSON.stringify(req.body))
    res.status(status).json({ message: 'Manifest successfully updated' })
  })
  // delete an existing manifest with id
  .delete((req, res) => {
    // TODO: Rudimentary authentication
    res
      .status(404)
      .json({ message: 'Deleting manifests is currently not supported' })
  })

// set port
const PORT = process.env.PORT || 3001

// listen on port
app.listen(PORT, () => console.log(`IIIF manifest store server | port ${PORT}`))
