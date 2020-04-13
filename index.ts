// Import node modules and interfaces.
import express from 'express';
import { MongoClient, Collection, MongoError, ObjectId } from 'mongodb';
import { IAlbum, IResponse } from './interface.library';

// Create express application.
const app = express();
app.use(express.json());

// Establish a MongoDB Connection.
const client: MongoClient = new MongoClient('mongodb://localhost:27017/', {useUnifiedTopology: true});
client.connect((err: MongoError) => console.log(err ? err.message : 'Connected to local database.'));

// Create database and collection references.
const db = client.db('knoxAlbums')
const albums: Collection = db.collection('albums', (err: MongoError, collection: Collection) => {
    console.log(err ? err.message : 'Collection retrieved from database.');
    return collection;
});

// Type Checking Function
function isAlbum(obj: Object): obj is IAlbum {
    let album = obj as IAlbum;
    if (album.artist === undefined){
        return false;
    } else if (album.date === undefined) {
        return false;
    } else if (album.imageUrl === undefined) {
        return false;
    } else if (album.songs === undefined) {
        return false;
    } else if (album.title === undefined) {
        return false;
    } else return true;
}

// Create express routes/endpoints.

// Album retrieval route.
app.get('/getAllAlbums', (req, res) => {
    albums.find().toArray((err, result) => {
        if (err) {
            let response: IResponse = {
                message: "Unable to retrieve albums.",
                body: {
                    errorMessage: err.message
                },
                code: 500
            }
            res.status(response.code);
            res.send(response);
            return;
        }
        else {
            let response: IResponse = {
                message: "Successfully retrieved albums.",
                body: {result},
                code: 200
            };
            res.status(response.code);
            res.send(response);
            return;
        }
    })
});

// Album addition route.
app.post('/addAlbum', (req, res) => {
    let album: IAlbum = req.body as IAlbum;
    if (!isAlbum(album)) {
        let response: IResponse = {
            message: "Album submission was not successful.",
            body: {
                errorMessage: "Album must contain all required attributes."
            },
            code: 400
        };
        res.status(response.code);
        res.send(response);
        return;
    }
    albums.insertOne(album, (err, result) => {
        if (err) {
            let response: IResponse = {
                message: "Album submission was not successful.",
                body: {
                    errorMessage: err.message
                },
                code: 500
            };
            res.status(response.code);
            res.send(response);
            return;
        }
        else {
            let response: IResponse = {
                message: "Successfully added album.",
                body: {added: result.ops},
                code: 201
            }
            res.status(response.code);
            res.send(response);
            return;
        }
    })
});

// Album deletion route.
app.post('/deleteAlbum', (req, res) => {
    let albumId = req.body._id || "000";
    if (!ObjectId.isValid(albumId)) {
        let response: IResponse = {
            message: "Album deletion was not successful.",
            body: {
                errorMessage: `Album ID ${albumId} is not valid.`
            },
            code: 400
        };
        res.status(response.code);
        res.send(response);
        return;
    }
    albums.deleteOne({"_id": new ObjectId(albumId)}, (err, result) => {
        if (err || result.deletedCount == 0) {
            let response: IResponse = {
                message: "Album deletion was not successful.",
                body: {
                    errorMessage: err ? err.message : "ID not found."
                },
                code: err ? 500 : 400
            };
            res.status(response.code);
            res.send(response);
            return;
        }
        let response: IResponse = {
            message: "Album deletion was successful.",
            body: {numberDeleted: result.deletedCount},
            code: 200
        };
        res.status(response.code);
        res.send(response);
        return;

    })
});

// Album update route.
app.post('/updateAlbum', (req, res) => {
    let album: IAlbum = req.body as IAlbum;
    if (!isAlbum(album) || album._id === undefined) {
        let response: IResponse = {
            message: "Album submission was not successful.",
            body: {
                errorMessage: "Album must contain all required attributes."
            },
            code: 400
        };
        res.status(response.code);
        res.send(response);
        return;
    }
    if (!ObjectId.isValid(album._id)) {
        let response: IResponse = {
            message: "Album submission was not successful.",
            body: {
                errorMessage: "Album ID is not valid."
            },
            code: 400
        };
        res.status(response.code);
        res.send(response);
        return;

    }
    album._id = new ObjectId(album._id);
    albums.replaceOne({"_id": album._id}, album, (err, result) => {
        if (err) {
            let response: IResponse = {
                message: "Album submission was not successful.",
                body: {
                    errorMessage: err.message
                },
                code: 500
            };
            res.status(response.code);
            res.send(response);
            return;
        }
        else {
            let response: IResponse = {
                message: "Successfully modified album.",
                body: {modified: result.modifiedCount},
                code: 200
            }
            res.status(response.code);
            res.send(response);
            return;
        }
    })
});

// Start the application.
app.listen(8080);