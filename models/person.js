require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB database')
  })
  .catch(error => {
    console.log('error connecting to MongoDB database', error.message)
  })

const numberSchema = new mongoose.Schema({
  name: {
    minLength: 3,
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{2,3}-\d+$/.test(v) && v.length >= 8
      },
      message: props => `${props.value} is not a valid phonenumber`
    }
  },
})

numberSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Phonenumber', numberSchema)