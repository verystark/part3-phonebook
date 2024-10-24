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

app.get('/api/persons', (request, response) => {
  Phonenumber.find({}).then(person => {
    response.json(person)
  })
})

app.get('/info', (request, response) => {
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
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = request.body
  const phoneNumber = new Phonenumber({
    name: person.name,
    number: person.number,
  })
  phoneNumber.save().then(savedNumber => {
    response.json(savedNumber)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Phonenumber.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedNumber => {
      res.json(updatedNumber)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  morgan('tiny')
})