require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Phonenumber = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('text', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return ''
  }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :text'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
  Phonenumber.find({}).then(person => {
    response.json(person)
  })
})

app.get('/info', (request, response) => {
  response.send(`
    Phonebook has info for ${persons.length} people <br/>
    ${Date()}
    `)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(name => name.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const id = Math.floor(Math.random() * 1000)
  return String(id)
}

app.post('/api/persons', (request, response) => {  
  const person = request.body
  person.id = generateId()

  if (!person.name || !person.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  } else {
    if (persons.find(name => name.name === person.name)) {
      return response.status(409).json({
        error: 'name must be unique'
      })
    } else {
        const phoneNumber = new Phonenumber({
          name: person.name,
          number: person.number,
        })
        phoneNumber.save().then(savedNumber => {
          response.json(savedNumber)
        })
    }
  }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  morgan('tiny')
})