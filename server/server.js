const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser'); 

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {gift} = require('./models/gift');
var {authenticate} = require('./middleware/authenticate');

var app = express();
app.use(bodyParser.json());

const port = process.env.PORT||3000; 

//SIGNUP
app.post('/users', (req,res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
       return user.generateAuthToken();
    }).then((token)=>{
        res.header('x-auth', token).send(user);
    }).catch((e)=>{
        res.status(400).send(e);
    })
});


app.get('/users/me', authenticate, (req, res)=>{
    res.send(req.user);
});

//LOGIN
app.post('/users/login',(req, res)=>{
    var body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user)=>{
        return user.generateAuthToken().then((token)=>{
            res.header('x-auth', token).send(user);
        })
    }).catch((e)=>{
        res.status(400).send();
    });
});

app.listen(port, ()=>{
    console.log(`Started at port ${port}`);
});