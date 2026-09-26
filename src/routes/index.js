const express = require('express');
const router = express.Router()

const Siswa = require('./siswaRoute')

router.use('/siswa', Siswa)

module.exports = router