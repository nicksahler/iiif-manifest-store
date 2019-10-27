# iiif-manifest-store

**This repo has been forked by nicksahler to maintain the codebase, patch a few security vulnerabilities, and add namespacing features. Check the forked repo for the original.**

A simple Node application to store and retrieve IIIF manifests via REST API. It can be used in conjunction with the [IIIF Manifest Editor](https://github.com/bodleian/iiif-manifest-editor) to store manifests remotely. Please note that this application currently does not support authentication so anybody can POST and GET manifests to the store. Use it behind a firewall and/or for testing purposes only.


## How to set up the application ##

### Prerequisites ###

* Install npm globally: https://github.com/npm/npm
* Install nvm (Node Version Manager) globally: https://github.com/creationix/nvm

### Installation ###

* Clone this repository: `git clone git@github.com:nicksahler/iiif-manifest-store.git`
* Change into the project directory: `cd iiif-manifest-store`
* Install Node v10 with nvm: `nvm install v10.16.3`
* Install the required node modules into the project: `npm install`

## How to run the application ##

* Start the server: `npm run start`
  * The application will run on [http://localhost:3001](http://localhost:3001) by default

## API ##

| Route                             | HTTP Verb     | Description                                         |
| --------------------------------- | ------------- | --------------------------------------------------- |
| /:namespace/manifests             | GET           | Get all manifests in a given namespace              |
| /:namespace/manifests             | POST          | Create a manifest - returns manifest uri            |
| /:namespace/manifests/:manifestId | GET           | Get manifest by id                                  |
| /:namespace/manifests/:manifestId | PUT           | Update manifest with id                             |
| /:namespace/manifests/:manifestId | DELETE        | Delete manifest with id (currently not implemented) |

### Get a List of All Manifests ###

**Request:** GET /:namespace/manifests

Example URL: http://localhost:3001/:namespace/manifests

**HTTP Status Code:** 200 OK

**Response:**

```javascript
{"manifests":
  [
    {"uri":"http://localhost:3001/:namespace/manifests/6b3bf0a8-b8f6-452a-bcbf-f336ff335c93"},
    {"uri":"http://localhost:3001/:namespace/manifests/db45e27f-edbf-446b-8794-eb9070c3647e"},
    {"uri":"http://localhost:3001/:namespace/manifests/example-manifest"}
  ]
}
```

### Create a Manifest ###

**Request:** POST /api/manifests

Example URL: http://localhost:3001/api/manifests

**HTTP Status Code:** 201 Created

**Response:**

```javascript
{
    "uri": "http://localhost:3001/api/manifests/f20c81a0-be0f-4cc6-bf48-891429faad11"
}
```

### Update a Manifest ###

**Request:** PUT /api/manifests/manifestId

Example URL: http://localhost:3001/api/manifests/example-manifest

**HTTP Status Code:** 200 OK

**Response:**

```javascript
{
    "message": "Manifest successfully updated"
}
```


### Get a Single Manifest ###

**Request:** GET /api/manifests/manifestId

Example URL: http://localhost:3001/api/manifests/example-manifest

**HTTP Status Code:** 200 OK

**Response:**

```javascript
{
    {
        "@context": "http://iiif.io/api/presentation/2/context.json",
        "@id": "example-manifest",
        "@type": "sc:Manifest",
        "label": "Example Manifest",
        "metadata": [],
        "description": [
            {
                "@value": "Example Description",
                "@language": "en"
            }
        ],
        "license": "https://creativecommons.org/licenses/by/3.0/",
        "attribution": "Example Attribution",
        "sequences": [
            {
                "@id": "example-sequence",
                "@type": "sc:Sequence",
                "label": [
                    {
                        "@value": "Example Sequence Label",
                        "@language": "en"
                    }
                ],
                "canvases": []
            }
        ],
        "structures": []
    }
}
```

## Starting with PM2

To pass in lists of namespaces to the app if you're using PM2, run this:
`pm2 start server.js -- -n stage -n prod -n api`

but with whatever namespaces you intend on using.
