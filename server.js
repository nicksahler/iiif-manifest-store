const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid')

// Create app
const app = express()

/*
Route                         HTTP Verb Description
-------------------------------------------------------------------------------------------
/api/manifests                GET       Get all manifests
/api/manifests                POST      Create a manifest - returns manifest uri
/api/manifests/:manifestId    GET       Get manifest by id
/api/manifests/:manifestId    PUT       Update manifest with id
/api/manifests/:manifestId    DELETE    Delete manifest with id (currently not implemented)
-------------------------------------------------------------------------------------------
*/

// ## CORS middleware
//
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
// app.use(express.methodOverride());

function cleanPath(filePath) {
  return path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '')
}

function formatPath(filePath) {
  return `data/manifests/${cleanPath(filePath)}`
}

app.use(cors())
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

app
  .route('/api/manifests')
  // list all manifets
  .get(function(req, res) {
    const files = fs.readdirSync('data/manifests')

    const manifests = files.map(filename => ({
      uri: `https://${req.headers.host}/m/api/manifests/${filename}`,
    }))

    res.json({ manifests })
  })

  // create a manifest
  .post(function(req, res) {
    const id = uuid()
    fs.writeFileSync(formatPath(id), JSON.stringify(req.body))
    res.status(201)

    const uri = `https://${req.headers.host}/m/api/manifests/${id}`
    res.json({ uri })
  })

app
  .route('/api/manifests/:manifestId')
  // get manifest with id
  .get(function(req, res) {
    const data = fs.readFileSync(formatPath(req.params.manifestId), 'utf8')
    res.json(JSON.parse(data))
  })

  // update an existing manifest with id
  .put(function(req, res) {
    const path = formatPath(req.params.manifestId)
    var statusCode = 200

    // check the file system to determine whether the resource exists
    if (fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify(req.body))
    } else {
      statusCode = 404
    }

    res.status(statusCode)
    res.json({ message: 'Manifest successfully updated' })
  })

  // delete an existing manifest with id
  .delete(function(req, res) {
    // TODO: Rudimentary authentication
    res.json({ errorMessage: 'Deleting manifests is currently not supported' })
  })

// set port
const PORT = process.env.PORT || 3001

// listen on port
app.listen(PORT, function() {
  console.log('IIIF manifest store server is up on port ' + PORT)
})
