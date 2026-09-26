const db = require('../../config/database')

class siswaController {
    static async GetSiswaAll(req, res, next) {
        try {
            const sql = 'SELECT * FROM siswa'
            const [result] = await db.promise().query(sql)

            res.status(200).json({
                status: 200,
                message: "Berhasil mengambil seluruh data siswa",
                data: result
            })
        } catch (error) {
            console.log(error)

            res.status(500).json({
                status: 500,
                message: "Gagal mengambil data siswa"
            })
        }
    }

    static async GetSiswaById(req, res) {

        try {

            const id = req.params.id

            const sql = 'SELECT * FROM siswa WHERE id = ?'

            const [result] = await db.promise().query(sql, [id])

            if (result.length === 0) {

                return res.status(404).json({
                    status: 404,
                    message: "Siswa tidak ditemukan"
                })

            }

            res.status(200).json({
                status: 200,
                message: "Berhasil mengambil data siswa",
                data: result[0]
            })

        } catch (error) {

            console.log(error)

            res.status(500).json({
                status: 500,
                message: "Gagal mengambil data siswa"
            })

        }

    }

    static async CreateSiswa(req, res) {

        try {

            const data = req.body

            // Validasi
            if (!data.nis || !data.nama || !data.kelas || !data.jurusan || !data.alamat) {

                return res.status(400).json({
                    status: 400,
                    message: "Nis, nama, kelas, jurusan, dan alamat wajib diisi"
                })

            }

            if (!Number.isFinite(Number(data.nis))) {

                return res.status(400).json({
                    status: 400,
                    message: "Nis harus berupa angka"
                })

            }

            const sql = 'INSERT INTO siswa (nis, nama, kelas, jurusan, alamat, foto) VALUES (?, ?, ?, ?, ?, ?)'

            const [result] = await db.promise().query(sql, [
                data.nis, data.nama, data.kelas, data.jurusan, data.alamat, data.foto || null
            ])

            res.status(201).json({
                status: 201,
                message: "Data siswa berhasil ditambahkan",
                data: {
                    id: result.insertId,
                    ...data
                }
            })

        } catch (error) {

            console.log(error)

            res.status(500).json({
                status: 500,
                message: "Gagal menambahkan data siswa"
            })

        }

    }


    static async UpdateSiswa(req, res) {

        try {

            const id = req.params.id

            const data = req.body

            // Validasi
            if (!data.nis || !data.nama || !data.kelas || !data.jurusan || !data.alamat) {

                return res.status(400).json({
                    status: 400,
                    message: "Nis, nama, kelas, jurusan, dan alamat wajib diisi"
                })

            }

            if (!Number.isFinite(Number(data.nis))) {

                return res.status(400).json({
                    status: 400,
                    message: "Nis harus berupa angka"
                })

            }

            const sql = 'UPDATE siswa SET nis = ?, nama = ?, kelas = ?, jurusan = ?, alamat = ?, foto = ? WHERE id = ?'

            const [result] = await db.promise().query(sql, [
                data.nis, data.nama, data.kelas, data.jurusan, data.alamat, data.foto || null,
                id
            ])

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    status: 404,
                    message: "Siswa tidak ditemukan"
                })

            }

            res.status(200).json({
                status: 200,
                message: "Data siswa berhasil diubah",
                data: {
                    id: id,
                    ...data
                }
            })

        } catch (error) {

            console.log(error)

            res.status(500).json({
                status: 500,
                message: "Gagal mengupdate data siswa"
            })

        }

    }


    static async DeleteSiswa(req, res) {

        try {

            const id = req.params.id

            const sql = 'DELETE FROM siswa WHERE id = ?'

            const [result] = await db.promise().query(sql, [id])

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    status: 404,
                    message: "Siswa tidak ditemukan"
                })

            }

            res.status(200).json({
                status: 200,
                message: "Data siswa berhasil dihapus"
            })

        } catch (error) {

            console.log(error)

            res.status(500).json({
                status: 500,
                message: "Gagal menghapus data siswa"
            })

        }

    }
}

module.exports = siswaController