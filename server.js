/* eslint-disable no-undef */
const https = require('https')
const fs = require('fs')

var express = require("express")
var path = require("path")
var app = express()
var compression = require("compression")
var cors = require("cors")
var db = require("quick.db")
var bodyParser = require("body-parser")
var _ = require("lodash")
const jsonfile = require("jsonfile")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: "40MB" }))
app.use(cors())
app.use(compression())

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "/build")))

var listener = app.listen(7060, function () {
  console.log("Your app is listening on port " + listener.address().port)
})

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(7080, () => {
  console.log('Listening...')
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"))
})

app.get("/getall", async function (req, res) {
  let vals = await db.fetch("allRequests")
  if (!_.isEmpty(vals)) {
    vals = [].concat(vals).reverse()
  }
  res.send(vals)
})

function isString(value) {
  return typeof value === "string" || value instanceof String
}

function isObject(value) {
  try {
    JSON.parse(value)
    return true
  } catch (error) {
    return true
  }
}

function patternCheck(mock) {
  const getTemplate = {
    endpoint: "",
    response: {},
    method: "get",
    key: "get",
  }

  let toBereturnedObj = {}

  const postTemplate = {
    endpoint: "test",
    request: {},
    response: {},
    method: "get",
    key: "gettest",
  }
  const getTemplateKeys = Object.keys(getTemplate)
  const postTemplateKeys = Object.keys(postTemplate)
  const incomingMockKeys = Object.keys(mock)

  if (mock.method === "get") {
    toBereturnedObj = getTemplate
    if (incomingMockKeys.length < 4) {
      return false
    }
    for (let index = 0; index < getTemplateKeys.length; index++) {
      toBereturnedObj[getTemplateKeys[index]] = mock[getTemplateKeys[index]]
      if (index === 1) {
        if (!isObject(toBereturnedObj[getTemplateKeys[index]])) {
          return false
        }
      } else {
        if (
          _.isEmpty(toBereturnedObj[getTemplateKeys[index]]) ||
          !isString(toBereturnedObj[getTemplateKeys[index]])
        ) {
          return false
        }
      }
    }
    // keys are very important. Must be validated carefully
    toBereturnedObj.endpoint = toBereturnedObj.endpoint.replace(/\s/g, "")
    toBereturnedObj.key = toBereturnedObj.method + toBereturnedObj.endpoint

    return toBereturnedObj
  } else {
    toBereturnedObj = postTemplate
    if (incomingMockKeys.length < 5) {
      return false
    }
    for (let index = 0; index < postTemplateKeys.length; index++) {
      toBereturnedObj[postTemplateKeys[index]] = mock[postTemplateKeys[index]]

      if (index === 1 || index === 2) {
        if (!isObject(toBereturnedObj[postTemplateKeys[index]])) {
          return false
        }
      } else {
        if (!isString(toBereturnedObj[postTemplateKeys[index]])) {
          return false
        }
      }
    }
    // keys are very important. Must be validated carefully
    toBereturnedObj.endpoint = toBereturnedObj.endpoint.replace(/\s/g, "")
    toBereturnedObj.key = toBereturnedObj.method + toBereturnedObj.endpoint
    return toBereturnedObj
  }
}

app.post("/upload", async function (req, res) {
  // console.log(requestsWeOwn);
  let responseMessage = "Json File is not valid."
  let requestsWeOwn = await db.get("allRequests")

  const apis = req.body.body.apis
  if (apis.length < 1) {
    responseMessage = "false"
    res.send(responseMessage)
  }

  if (requestsWeOwn !== null) {
    for (let i = 0; i < apis.length; i++) {
      let element = patternCheck(apis[i])
      if (!element) {
        continue
      }
      // array increases every time but it prevents saving same request template multiple times
      let updateflag = false
      for (let index = 0; index < requestsWeOwn.length; index++) {
        if (requestsWeOwn[index].key === element.key) {
          updateflag = true
          requestsWeOwn[index] = element
        }
      }
      if (!updateflag) {
        requestsWeOwn.push(element)
      }
    }
  } else {
    requestsWeOwn = []
    for (let j = 0; j < apis.length; j++) {
      let element = patternCheck(apis[j])
      if (!element) {
        continue
      }
      requestsWeOwn.push(element)
    }
  }
  await db.delete("recover")
  await db.set("allRequests", requestsWeOwn)

  res.send(true)
})

app.get("/exportall", async function (req, res) {
  const vals = await db.fetch("allRequests")
  var file = path.join(__dirname, "/public/mocktail.json")
  const obj = { apis: vals }
  const writoToJsonSuccessBoolean = await jsonfile.writeFile(
    file,
    obj,
    { spaces: 2 },
    function (err) {
      if (err) {
        console.error(err)
      }
    }
  )
  console.log(writoToJsonSuccessBoolean)

  res.sendFile(file)
})

app.post("/savetemplate", async function (req, res) {
  // validasyon yazılacak
  let requestsWeOwn = await db.get("allRequests")
  // console.log(requestsWeOwn);
  let updateFlag = false
  if (requestsWeOwn !== null) {
    for (let index = 0; index < requestsWeOwn.length; index++) {
      if (requestsWeOwn[index].key === req.body.body.key) {
        requestsWeOwn[index] = req.body.body
        updateFlag = true
      }
    }
  } else {
    requestsWeOwn = []
  }
  if (!updateFlag) {
    requestsWeOwn.push(req.body.body)
  }
  try {
    await db.delete("recover")
    await db.set("allRequests", requestsWeOwn)
  } catch (err) {
    console.log(err)
    //TODO: Handle
  }

  res.send(requestsWeOwn)
})


app.get("/client.ipa", async function (req, res) {
  var file = path.join(__dirname, "/cli/Client.ipa")

  res.set('Content-Type', 'application/octet-stream');
  res.download(file);
})

app.get('/manifest.plist', function (req, res) {
  res.setHeader('content-type', 'text/xml');
  var file = path.join(__dirname, "/cli/manifest.plist")
  res.download(file);
});