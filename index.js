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

app.get('/info', (request, response, next) => {
  Phonenumber.countDocuments({})
    .then(people => {
      response.send(`
        Phonebook has info for ${people} people <br/>
        ${Date()}
      `)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Phonenumber.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Phonenumber.findByIdAndDelete(request.params.id)
    .then(result => { 
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {  
  const person = request.body

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

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  phoneNumber = {
    name: body.name,
    number: body.number,
  }

  Phonenumber.findByIdAndUpdate(req.params.id, phoneNumber, { new: true })
    .then(updatedNumber => {
      res.json(updatedNumber)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  morgan('tiny')
})