const mongoose = require('mongoose')

if (process.argv.length < 3)
{
    console.log("Please provide password as an argument: node mongo.js <password>")
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://phonebook-db:${password}@cluster0.pmkhqcf.mongodb.net/?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema(
    {
        name: String,
        number: String
    }
)

const Person = new mongoose.model("Person", personSchema)

if (process.argv.length === 5)
{
    const name = process.argv[3]
    const number = process.argv[4]

    mongoose.connect(url)
        .then(result => {

            const person = new Person({
                name: name,
                number: number
            })

            return person.save()
        })
        .then(() => {
            console.log(`Added ${name}, number: ${number} to phonebook`)

            return mongoose.connection.close()
        })
        .catch(err => console.log(err))
}

if (process.argv.length === 3) 
{
    mongoose.connect(url)
        .then(result =>{

            Person.find({}).then(persons => {
                console.log("Phonebook:")
                persons.forEach(person => console.log("  •", person.name, person.number))

                mongoose.connection.close()
            })
            })
        .catch(err => console.log(err))
}