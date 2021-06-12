const express = require('express');
const bodyParser = require('body-parser');
const graphQLHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json()); 

app.use('/graphql', graphQLHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!            
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!     
        }

        type RootMutation {
            createEvent(eventInput: EventInput) : Event
            createUser(userInput: UserInput) : User
        }
    
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: async () => {
            try {
                const events = await Event.find();
                return events.map(event => {
                    return { ...event._doc };
                });
            }
            catch (err) {
                throw err;
            }
        },  
        createEvent: async args => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
            try {
                const result = await event.save();
                console.log(result);
                //using spread operator to operate with JSobject
                return { ...result._doc };
            } 
            catch (err) {
                console.log(err);
                throw err;
            }
        },
        createUser: async args => {
            try {
                const hashedPassword = await bcrypt
                    .hash(args.userInput.password, 12);
                const User = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                const result = await user.save();
                return { ...result._doc };
            }
            catch (err) {
                throw err;
            }

        }
    },
    graphiql: true
}));


mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD}@cluster0-ooqwy.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
).then(() => {
    app.listen(3000);
    console.log("server is connected!");
}).catch(err => {
    console.log(err); 
});