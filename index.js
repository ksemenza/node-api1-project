// implement your API here
const express = require('express');
const shortid = require("shortid")
const db = require('./data/db.js');
const server = express();
let users =[]

server.use(express.json());

server.get('/', (req, res) => {
    res.send('Welcome to Hobbiton');
});

/* 
When the client makes a GET request to /api/users:

    If there's an error in retrieving the users from the database:
        respond with HTTP status code 500.
        return the following JSON object: { errorMessage: "The users information could not be retrieved." }.

*/
server.get('/api/users', (req, res) => {
    console.log('Requesting users');
    db.find()
        .then(users => {
            //console.log(users);
            res.status(200).json(users);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: "The users' information could not be retrieved." });
        });
})

/* 
When the client makes a GET request to /api/users/:id:

    If the user with the specified id is not found:
        respond with HTTP status code 404 (Not Found).
        return the following JSON object: { message: "The user with the specified ID does not exist." }.

    If there's an error in retrieving the user from the database:
        respond with HTTP status code 500.
        return the following JSON object: { errorMessage: "The user information could not be retrieved." }.

*/
server.get('/api/users/:id', (req, res) => {
    const id = req.params.id;
    console.log(`Getting user with id ${id}`);
    db.findById(id)
        .then(user => {
            console.log(user);
            if (!user) {
                res.status(500).json({ message: "The user with the specified ID does not exist." });
            }
            res.status(200).json(user);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: "The user information could not be retrieved." });
        });
});



/* 
When the client makes a POST request to /api/users:

    If the request body is missing the name or bio property:
        respond with HTTP status code 400 (Bad Request).
        return the following JSON response: { errorMessage: "Please provide name and bio for the user." }.

    If the information about the user is valid:
        save the new user the the database.
        respond with HTTP status code 201 (Created).
        return the newly created user document.

    If there's an error while saving the user:
        respond with HTTP status code 500 (Server Error).
        return the following JSON object: { errorMessage: "There was an error while saving the user to the database" }.

*/

server.post('/api/users', (req, res) => {
    const newUser = req.body;
    if (!newUser.name || !newUser.bio) {
        res.status(400).json({ errorMessage: "Please provide name and bio for the user." });
    } else {
        db.insert(newUser)
            .then(idObject => {
                console.log(idObject);
                db.findById(idObject.id)
                    .then(user => {
                        console.log(user);
                        const userInfo = req.body;
                        userInfo.id = shortid.generate()
                       
                        users.push(userInfo)
                        res.status(201).json(userInfo);
                    })    
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ errorMessage: "The new user information could not be retrieved." });
                    });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ errorMessage: "There was an error while saving the user to the database" });
            });
    }
});

/* 
When the client makes a PUT request to /api/users/:id:

    If the user with the specified id is not found:
        respond with HTTP status code 404 (Not Found).
        return the following JSON object: { message: "The user with the specified ID does not exist." }.

    If the request body is missing the name or bio property:
        respond with HTTP status code 400 (Bad Request).
        return the following JSON response: { errorMessage: "Please provide name and bio for the user." }.

    If there's an error when updating the user:
        respond with HTTP status code 500.
        return the following JSON object: { errorMessage: "The user information could not be modified." }.

    If the user is found and the new information is valid:
        update the user document in the database using the new information sent in the request body.
        respond with HTTP status code 200 (OK).
        return the newly updated user document.
*/
server.put('/api/users/:id', (req, res) => {
    const id = req.params.id;
    if (!req.body.name || !req.body.bio) {
        res.status(400).json({ errorMessage: "Please provide name and bio for the user." });
    } else {
        db.find(id)
            .then(user => {
                db.update(id, req.body)
                    .then(num => {
                        if (num === 1) {
                            db.findById(id)
                                .then(user => {
                                    console.log(user);
                                    res.status(200).json(user);
                                })
                                .catch(err => {
                                console.log(err);
                                res.status(500).json({ errorMessage: "The user information could not be retrieved." }); 
                                });
                        } else {
                            res.status(500).json({ errorMessage: "The user information could not be modified." });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ errorMessage: "The user information could not be modified." })
                    })
                    
            })
            .catch(err => {
                console.log(err);
                res.status(404).json({ message: "The user with the specified ID does not exist." });
            });
    }
});

/*
When the client makes a DELETE request to /api/users/:id:

    If the user with the specified id is not found:
        respond with HTTP status code 404 (Not Found).
        return the following JSON object: { message: "The user with the specified ID does not exist." }.

    If there's an error in removing the user from the database:
        respond with HTTP status code 500.
        return the following JSON object: { errorMessage: "The user could not be removed" }.

*/

server.delete('/api/users/:id', (req, res) => {
    const id = req.params.id;
    db.findById(id)
        .then(user => {
            if (user) {
                db.remove(id)
                    .then(num => {
                        if (num === 1) {
                            res.status(200).json({"numberOfUsersDeleted": num});
                        } else {
                            res.status(500).json({ errorMessage: "The user could not be removed" });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ errorMessage: "The user could not be removed" });
                    });
            } else {
                res.status(404).json({ message: "The user with the specified ID does not exist." });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({ message: "The user with the specified ID does not exist." });
        });
});





const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`API up and running on port ${port}`));
