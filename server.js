/* eslint-disable no-undef */
const https = require('https')
const fs = require('fs')

var express = require("express")
var path = require("path")
var app = express()
var compression = require("compression")
var cors = require("cors")
var db = require("quick.db")
var multer = require('multer')
var bodyParser = require("body-parser")
var _ = require("lodash")
const crypto = require("crypto")

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

var upload = multer({ storage: storage })
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
  let vals = await db.fetch("allApps")
  if (!_.isEmpty(vals)) {
    vals = [].concat(vals).reverse()
  }
  res.send(vals)
})

app.get("/cascade", async function (req, res) {
  try {
    await db.delete("allApps")
    await db.delete("secret")
    res.send(true);
  } catch (error) {
    res.send(false);
  }
})


app.get("/delete/:appid", async function (req, res) {
  let potentialResponse = { status: "Could not delete." }
  let apps = await db.fetch("allApps")

  for (let index = 0; index < apps.length; index++) {
    if (apps[index].filename === req.params.appid) {
      console.log(apps)
      apps.splice(index, 1)
      console.log(apps)
      await db.set("allApps", apps)
      potentialResponse = { status: "success" }
    }
  }
  res.send(potentialResponse)
})


app.get("/client", async function (req, res) {
  // key konttrolu burada yapılacak
  var file = path.join(__dirname, "/uploads/1590611656282-AlbarakaApp.ipa")

  res.set('Content-Type', 'application/octet-stream');
  res.download(file);
})

app.get('/manifest.plist', function (req, res) {
  res.setHeader('content-type', 'text/xml');
  var file = path.join(__dirname, "/manifest.plist")
  res.download(file);
});

app.post('/upload', upload.single('app'), async function(req, res) {
  let apps = await db.fetch("allApps")
  if (_.isEmpty(apps)) {

    var token = crypto.randomBytes(64).toString('hex');

    token.toString();
    await db.set("secret", token)
    apps = []
  }
  let newApp = {}

  try {
    if(req.file) {
      newApp = req.file;
      newApp.downloaded = 0;
      newApp.createDate = req.file.filename.substr(0, req.file.filename.indexOf('-')); 
      newApp.tags = [];
      apps.push(newApp);
      await db.set("allApps", apps)
      console.log(newApp);
    }
    
    res.send(req.body);
  } catch (err) {
    res.send(400);
  }
});


app.get('/lista', async function (req, res) {
  //reading directory in synchronous way
  // let key = await db.fetch("secret")
  // var files = fs.readdirSync('./uploads');
  // res.json(key);
  let key = await db.fetch("allApps")
  res.send(key.length.toString());
});







// app.post("/upload", async function (req, res) {
//   // console.log(requestsWeOwn);
//   let responseMessage = "Json File is not valid."
//   let requestsWeOwn = await db.get("allRequests")

//   const apis = req.body.body.apis
//   if (apis.length < 1) {
//     responseMessage = "false"
//     res.send(responseMessage)
//   }

//   if (requestsWeOwn !== null) {
//     for (let i = 0; i < apis.length; i++) {
//       let element = patternCheck(apis[i])
//       if (!element) {
//         continue
//       }
//       // array increases every time but it prevents saving same request template multiple times
//       let updateflag = false
//       for (let index = 0; index < requestsWeOwn.length; index++) {
//         if (requestsWeOwn[index].key === element.key) {
//           updateflag = true
//           requestsWeOwn[index] = element
//         }
//       }
//       if (!updateflag) {
//         requestsWeOwn.push(element)
//       }
//     }
//   } else {
//     requestsWeOwn = []
//     for (let j = 0; j < apis.length; j++) {
//       let element = patternCheck(apis[j])
//       if (!element) {
//         continue
//       }
//       requestsWeOwn.push(element)
//     }
//   }
//   await db.delete("recover")
//   await db.set("allRequests", requestsWeOwn)

//   res.send(true)
// })

// app.post("/savetemplate", async function (req, res) {
//   // validasyon yazılacak
//   let requestsWeOwn = await db.get("allRequests")
//   // console.log(requestsWeOwn);
//   let updateFlag = false
//   if (requestsWeOwn !== null) {
//     for (let index = 0; index < requestsWeOwn.length; index++) {
//       if (requestsWeOwn[index].key === req.body.body.key) {
//         requestsWeOwn[index] = req.body.body
//         updateFlag = true
//       }
//     }
//   } else {
//     requestsWeOwn = []
//   }
//   if (!updateFlag) {
//     requestsWeOwn.push(req.body.body)
//   }
//   try {
//     await db.delete("recover")
//     await db.set("allRequests", requestsWeOwn)
//   } catch (err) {
//     console.log(err)
//     //TODO: Handle
//   }

//   res.send(requestsWeOwn)
// })
