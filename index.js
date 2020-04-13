"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import node modules and interfaces.
var express_1 = __importDefault(require("express"));
var mongodb_1 = require("mongodb");
// Create express application.
var app = express_1.default();
app.use(express_1.default.json());
// Establish a MongoDB Connection.
var client = new mongodb_1.MongoClient('mongodb://localhost:27017/', { useUnifiedTopology: true });
client.connect(function (err) { return console.log(err ? err.message : 'Connected to local database.'); });
// Create database and collection references.
var db = client.db('knoxAlbums');
var albums = db.collection('albums', function (err, collection) {
    console.log(err ? err.message : 'Collection retrieved from database.');
    return collection;
});
// Type Checking Function
function isAlbum(obj) {
    var album = obj;
    if (album.artist === undefined) {
        return false;
    }
    else if (album.date === undefined) {
        return false;
    }
    else if (album.imageUrl === undefined) {
        return false;
    }
    else if (album.songs === undefined) {
        return false;
    }
    else if (album.title === undefined) {
        return false;
    }
    else
        return true;
}
// Create express routes/endpoints.
// Album retrieval route.
app.get('/getAllAlbums', function (req, res) {
    albums.find().toArray(function (err, result) {
        if (err) {
            var response = {
                message: "Unable to retrieve albums.",
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
            var response = {
                message: "Successfully retrieved albums.",
                body: { result: result },
                code: 200
            };
            res.status(response.code);
            res.send(response);
            return;
        }
    });
});
// Album addition route.
app.post('/addAlbum', function (req, res) {
    var album = req.body;
    if (!isAlbum(album)) {
        var response = {
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
    albums.insertOne(album, function (err, result) {
        if (err) {
            var response = {
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
            var response = {
                message: "Successfully added album.",
                body: { added: result.ops },
                code: 201
            };
            res.status(response.code);
            res.send(response);
            return;
        }
    });
});
// Album deletion route.
app.post('/deleteAlbum', function (req, res) {
    var albumId = req.body._id || "000";
    if (!mongodb_1.ObjectId.isValid(albumId)) {
        var response = {
            message: "Album deletion was not successful.",
            body: {
                errorMessage: "Album ID " + albumId + " is not valid."
            },
            code: 400
        };
        res.status(response.code);
        res.send(response);
        return;
    }
    albums.deleteOne({ "_id": new mongodb_1.ObjectId(albumId) }, function (err, result) {
        if (err || result.deletedCount == 0) {
            var response_1 = {
                message: "Album deletion was not successful.",
                body: {
                    errorMessage: err ? err.message : "ID not found."
                },
                code: err ? 500 : 400
            };
            res.status(response_1.code);
            res.send(response_1);
            return;
        }
        var response = {
            message: "Album deletion was successful.",
            body: { numberDeleted: result.deletedCount },
            code: 200
        };
        res.status(response.code);
        res.send(response);
        return;
    });
});
// Album update route.
app.post('/updateAlbum', function (req, res) {
    var album = req.body;
    if (!isAlbum(album) || album._id === undefined) {
        var response = {
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
    if (!mongodb_1.ObjectId.isValid(album._id)) {
        var response = {
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
    album._id = new mongodb_1.ObjectId(album._id);
    albums.replaceOne({ "_id": album._id }, album, function (err, result) {
        if (err) {
            var response = {
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
            var response = {
                message: "Successfully modified album.",
                body: { modified: result.modifiedCount },
                code: 200
            };
            res.status(response.code);
            res.send(response);
            return;
        }
    });
});
// Start the application.
app.listen(8080);
