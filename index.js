require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.postData(req,res)
    ].join(' ')
}))
morgan.token('postData', function (req, res) { if(JSON.stringify(req.body) !== '{}') {
    return JSON.stringify(req.body)
    }
 })

let persons = [
    {
      "id": 1,
      "name": "Arto Hellas",
      "number": "040-123456",
    },
    {
      "id": 2,
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": 3,
      "name": "Dan Abramov",
      "number": "12-43-234345",
    },
    {
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
    }
  ]

app.get('/info', (req, res) => {
  res.send(`phonebook has info for ${persons.length} people<br></br>
  ${new Date()}`)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

// const generateId = () => {
//     return Math.round(Math.random() * 100000000)
//   }
  
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }
  const namesInDB = persons.map(person => person.name)

  if (namesInDB.filter(person => person === body.name).length > 0) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})