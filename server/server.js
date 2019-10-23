const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser'); 

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Gift} = require('./models/gift');
var {Order} = require('./models/order');
var {authenticate} = require('./middleware/authenticate');

var app = express();
app.use(bodyParser.json());

const port = process.env.PORT||3000; 

/**
 * ADD Gift
 */
app.post('/gifts', (req,res)=>{
    var gift = new Gift({
        'image': req.body.image,
        'description': req.body.description,
    });

    gift.save().then((doc)=>{
        res.send(doc);
    }).catch((e)=>{
        res.status(400).send(e);
    })
})

/**
 * GET ALL GIFTS
 */
app.get('/gifts', (req,res)=>{
    Gift.find().then((gifts)=>{
        res.send(gifts);
    }).catch((e)=>{
        res.status(400).send(e);
    })
})

/**
 * MAKE ORDER
 */
app.post('/orders', authenticate, (req,res)=>{
    var order = new Order({
        'date': req.body.date,
        'driver': req.body.driver,
        'gift': req.body.gift,
        'client': req.user._id,
        'location': req.body.location
    });

    order.save().then((doc)=>{
        res.send(doc);
    }).catch((e)=>{
        res.status(400).send(e);
    })
})

/**
 * SIGNUP
 */
app.post('/users', (req,res) => {
    var body = _.pick(req.body, ['email', 'password', 'role']);
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

/**
 *LOGIN
 */
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