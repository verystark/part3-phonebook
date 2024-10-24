const mongoose = require('mongoose')

if (process.argv.length !== 5 && process.argv.length !== 3) {
  console.log('give valid argument')
  process.exit(1)
} else {
  const numberSchema = new mongoose.Schema({
    name: String,
    number: String,
  })
  const Phonenumber = mongoose.model('Phonenumber', numberSchema)

  if (process.argv.length === 5) {
    const person = process.argv[3]
    const number = process.argv[4]
    const newNumber = new Phonenumber({
      name: person,
      number: number,
    })
    newNumber.save().then(() => {
      console.log(`added ${person} number ${number} to phonebook`)
      mongoose.connection.close()
    })
  } else {
    Phonenumber.find({}).then(result => {
      console.log('phonebook:')
      result.forEach(name => {
        console.log(`${name.name} ${name.number}`)
        mongoose.connection.close()
      })
    })
  }
}

const password = process.argv[2]

const url =
    `mongodb+srv://tuomaspaloheimo05:${password}@phonebook.evmj6.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=phonebook`

mongoose.set('strictQuery', false)

mongoose.connect(url)