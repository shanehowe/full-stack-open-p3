const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log("Connecting to ", url)

mongoose
    .connect(url)
    .then(result => console.log("Connected to MongoDB"))
    .catch(error => console.log("Error connecting: ", error.message))

const validateNumber = (number) => {
    if ((number[2] === "-" || number[3] === "-") && number.length < 9)
    {
        return false
    }
    return true
}

const PersonSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minLength: 3,
            required: true
        },
        number: {
            type: String,
            validate: [
                {
                    validator: validateNumber,
                    message: "Minimum number length must be greater than or equal to 9",
                },
                {
                    validator: (number) => /\d{2,3}-\d{6}/.test(number),
                    message: "Invalid phone number"
                }
            ],
            required: true
        }
    }
)

PersonSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model("Person", PersonSchema)