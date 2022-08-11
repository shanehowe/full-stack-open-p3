const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
app.use(express.json())
app.use(cors())

morgan.token("data", (request) => {
    return request.method === "POST" ? JSON.stringify(request.body) : " ";
  })
  
app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms :data")
)

const generateId = () => {
    const id = Math.floor(Math.random() * 10000)

    return id
}

let persons = 
[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('Phonebook backend')
})

// get all persons
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

// get info for amount of persons
app.get('/info', (request, response) => {
    const amount = persons.length

    response.send(`Phonebook has info for ${amount} people.  ${new Date()}`)
    response.end()
})

// get single person
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id == id)

    if (person) 
    {
        response.json(person)
    } else 
    {
        response.statusMessage = "No person with sepicified id has been found."
        response.status(404).end()
    }
})

// delete person
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
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

    const duplicate = persons.find(p => p.name == body.name)

    // if name already in persons return status 400 w/ error
    if (duplicate) 
    {
        return response.status(400).json(
            { error: "name be unique"}
        )
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Listening on ${PORT}`))