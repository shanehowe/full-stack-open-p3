const express = require('express')
const app = express()
app.use(express.json())
const morgan = require('morgan')
require('dotenv').config()
const Person = require('./models/person')
const cors = require('cors')
app.use(cors())
app.use(express.static('build'))

morgan.token("data", (request) => {
    return request.method === "POST" ? JSON.stringify(request.body) : " ";
  })
  
app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms :data")
)

app.get('/', (request, response) => {
    response.send('Phonebook backend')
})

// get all persons
app.get('/api/persons', (request, response) => {
    
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
})

// get info for amount of persons
app.get('/info', (request, response) => {
    const amount = null

    response.send(`Phonebook has info for ${amount} people.  ${new Date()}`)
    response.end()
})

// get single person
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id

    // Mongo find by id method
    Person.findById(id)
        .then(foundPerson => {
            if (foundPerson)
            {
                response.json(foundPerson)
            } else 
            {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// delete person
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id

    Person.findByIdAndRemove(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

// add person through post requst
app.post('/api/persons', (request, response) => {
    const body = request.body

    // if name or number not given return status 400 w/ error
    if (!body.name || !body.number) 
    {
        return response.status(400).json(
            { error: "content missing" }
        )
    }

    // new person model for mongodb
    const person = new Person ({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.put("/api/persons/:id", (request, response) => {
    const id = request.params.id
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => {
            next(error)
        })
})

// move error handling to middleware
const errorHandler = (error, request, response, next) => {
    // cast error exception
    if (error.name === "CastError")
    {
        return response.status(400).send(
            { error: "malformatted id"}
        )
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Listening on ${PORT}`))