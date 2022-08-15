const express = require("express")
const app = express()
const morgan = require("morgan")
require("dotenv").config()
const cors = require("cors")
const Person = require("./models/person")

app.use(express.json())
app.use(cors())
app.use(express.static("build"))

morgan.token("data", (request) => {
    return request.method === "POST" || request.method === "PUT" ? JSON.stringify(request.body) : " "
})

//   middle ware to log information to the console
app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms :data")
)

app.get("/", (request, response) => {
    response.send("Phonebook backend")
})

// get all persons
app.get("/api/persons", (request, response) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
})

// get info for amount of persons
app.get("/info", (request, response) => {
    const amount = null

    response.send(`Phonebook has info for ${amount} people.  ${new Date()}`)
    response.end()
})

// get single person
app.get("/api/persons/:id", (request, response, next) => {
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
app.delete("/api/persons/:id", (request, response, next) => {
    const id = request.params.id

    Person.findByIdAndRemove(id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

// add person through post requst
app.post("/api/persons", (request, response, next) => {
    const body = request.body

    // new person model for mongodb
    const person = new Person ({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(request.params.id,
        { name, number },
        { new: true, runValidators: true, context: "query" })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send(
        { error: "unknown endpoint" }
    )
}

app.use(unknownEndpoint)

// move error handling to middleware
const errorHandler = (error, request, response, next) => {

    if (error.name === "CastError")
    {
        return response.status(400).send(
            { error: "malformatted id" }
        )
    } else if (error.name === "ValidationError")
    {
        return response.status(400).send(
            { error: error.message }
        )
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Listening on ${PORT}`))