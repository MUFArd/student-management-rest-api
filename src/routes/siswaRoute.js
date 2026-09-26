const express = require('express')

const router = express.Router()
const {
    GetSiswaAll,
    GetSiswaById,
    CreateSiswa,
    UpdateSiswa,
    DeleteSiswa
} = require('../controllers/siswaController')

router.get('/', GetSiswaAll)
router.get('/:id', GetSiswaById)
router.post('/', CreateSiswa)
router.put('/:id', UpdateSiswa)
router.delete('/:id', DeleteSiswa)

module.exports = router