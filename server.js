/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'})
    }
});

router.post('/signin', (req, res) => {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

router.route('/movies')
    //delete = complete
    .delete(authController.isAuthenticated, (req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        var user = db.findOne(req.body.username);
        movieID=(req.body);
        if (!user) {
            res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});}
        else {
            if (req.body.password == user.password) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                db.remove.movieID;
                res.json({'status': 200, msg: "movie deleted", headers: o.headers, query: o.query, env: process.env.UNIQUE_KEY});
                }
            else{
                res.status(401).send({success: false, msg: 'Authentication failed.'});
                }}
        res.json(o);
    }
    )
    .put(authJwtController.isAuthenticated, (req, res) => {
        console.log(req.body);
        var o = getJSONObjectForMovieRequirement(req);
        var user = db.findOne(req.body.username);
        if (!user) {
            res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});}
            else {
                if (req.body.password == user.password) {
                    var userToken = { id: user.id, username: user.username };
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json({'status': 200, msg: "movie updated", o});
                }
                else{
                    res.status(401).send({success: false, msg: 'Authentication failed.'});
                }}
        
        res.json(o);
    })

    .get((req, res) => {
        console.log(req.body);
        var o=getJSONObjectForMovieRequirement(req);
        res.json({'status': 200, msg: "movie updated", o});
    })
    .post((req,res)=>{
        console.log(req.body);
        var o=getJSONObjectForMovieRequirement(req);
        res.json({'status': 200, msg: "movie saved", o});
    })

    .all((req, res)=>{
        // Any other HTTP Method
        // Returns a message stating that the HTTP method is unsupported.
        res.status(405).send({ message: 'HTTP method not supported.' });
    })
;


    

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


