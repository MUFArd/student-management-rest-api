const express = require('express')
const cors = require('cors')
const router = require('./src/routes')
const PORT = process.env.PORT || 3000

const app = express()

app.use(express.static('page'))

app.use(cors())
app.use(express.json({limit:'10mb'}))

app.use('/', router)

app.listen(PORT, () => console.log("terhubung"))