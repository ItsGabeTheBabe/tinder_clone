const PORT = 8000

const express = require('express')
const { MongoClient } = require('mongodb')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bcrypt = require('bcrypt')
const uri = 'mongodb+srv://sickundies:beastyboy115@cluster0.oa6ehuu.mongodb.net/?retryWrites=true&w=majority'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json("Hello World")
})

app.post('/signup', async (req, res) => {
    const { email, password } = req.body
    const client = new MongoClient(uri)
    const generatedId = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 10)

    try {

        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')
        const userExists = await users.findOne({ email })
        if (userExists) {
            return res.status(409).send('User already exist. Please login')
        }
        const sanitizedEmail = email.toLowerCase()
        const data = {
            user_id: generatedId,
            email: sanitizedEmail,
            password: hashedPassword,
        }
        const newUser = await users.insertOne(data)
        const token = jwt.sign(newUser, sanitizedEmail, {
            expiresIn: 60 * 2
        })

        res.status(201).json({ token, user_id: generatedId, email: sanitizedEmail })

    } catch (error) {
        console.log(error)
    }
})

app.get('/users', async (req, res) => {
    const client = new MongoClient(uri)

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')
        const returedUsers = await users.find().toArray()
        res.send(returedUsers)
    } catch (error) {
        console.log(error)
    }
})

app.listen(PORT, () => console.log(`server running on port:${PORT}`))