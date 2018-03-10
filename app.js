const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const async = require('async');
const request = require('request');
const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const app = express();

// Middleware 
app.engine('.hbs', expressHbs({defaultLayout : 'layout',extname:'.hbs'}));
app.set('view engine','hbs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('dev'));


//connect mongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/YourApp');
const nameSchema = new mongoose.Schema({
    email_address : String
})
const User = mongoose.model("User", nameSchema);

// Route
app.route('/')
    .get((req,res,next)=>{
        res.render('main/home');
    })
    .post((req,res,next)=>{
        request ({
            url: 'https://us12.api.mailchimp.com/3.0/lists/List ID/members',
            method :'POST',
            headers :{
                'Authorization': 'randomUser Your API Key',
                'Content-type' : 'application/json'
            },
            json : {
                'email_address' : req.body.email,
                'status' : 'subscribed'
            }
        },(err,response,body)=> {
            const myData = new User({
                email_address: req.body.email
            });
            myData.save()
                .then(item => {
                    res.redirect('/');
                })
                .catch(err => {
                    res.status(400).send("unable to save to database");
            });
        })
    })


// Run server
app.listen(port,(err)=>{
    if (err) {
        throw err;
    }else{
        console.log(`Server is up on ${port}`);
    }
});