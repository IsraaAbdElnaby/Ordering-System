const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

var { ObjectID } = require('mongodb');
var { mongoose } = require('./db/mongoose');
var { User } = require('./models/user');
var { Gift } = require('./models/gift');
var { Order } = require('./models/order');
var { authenticate } = require('./middleware/authenticate');

var app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

/**
 * ADD Gift
 */
app.post('/gifts', (req, res) => {
    //ADMIN ONLY CAN ADD NEW GIFT
    if (req.user.role !== "Admin") {
        return res.status(401).send('Unauthorized Request!');
    }
    var gift = new Gift({
        'image': req.body.image,
        'description': req.body.description,
    });

    gift.save().then((doc) => {
        res.send(doc);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

/**
 * GET ALL GIFTS
 */
app.get('/gifts', (req, res) => {
    Gift.find().then((gifts) => {
        res.send({ gifts });
    }).catch((e) => {
        res.status(400).send(e);
    })
})

/**
 * UPDATE GIFT
 */
app.put('/gifts/:id', authenticate, (req, res) => {
    //ADMIN ONLY CAN UPDATE GIFT
    if (req.user.role !== "Admin") {
        return res.status(401).send('Unauthorized Request!');
    }
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Gift.findByIdAndUpdate(id, { $set: req.body }, { new: true }).then(() => {
        Gift.findOne({ _id: id }).then((gift) => {
            if (!gift) {
                return res.status(404).send();
            }
            res.send(gift);
        }).catch((e) => {
            res.status(400).send(e);
        });

    }).catch((e) => {
        res.status(400).send(e);
    })
});

/**
 * DELETE GIFT
 */
app.delete('/gifts/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Gift.findByIdAndRemove(id).then((gift) => {
        if (!gift) {
            return res.status(404).send();
        }
        res.send(gift);
    }).catch((e) => {
        res.status(400).send();
    });
});

/**
 * MAKE ORDER
 */
app.post('/orders', authenticate, (req, res) => {

    var driver_id = req.body.driver;
    var gift_id = req.body.gift;

    var order = new Order({
        'date': req.body.date,
        'driver': driver_id,
        'gift': gift_id,
        'client': req.user._id,
        'location': req.body.location
    });



    //CHECKING IDS ARE VALID
    if (!ObjectID.isValid(driver_id) || !ObjectID.isValid(gift_id)) {
        return res.status(404).send();
    }

    //CHEKING DRIVER ID EXISTS
    User.findById(driver_id).then((driver) => {
        if (!driver) {
            return res.status(404).send('Driver doesn\'t exist!');
        }
    }).catch((e) => {
        res.status(400).send();
    })

    //CHEKING GIFT ID EXISTS
    Gift.findById(gift_id).then((gift) => {
        if (!gift) {
            return res.status(404).send('Gift doesn\'t exist!');
        }
    }).catch((e) => {
        res.status(400).send();
    })

    order.save().then((doc) => {
        res.send(doc);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

/**
 * GET ALL ORDERS THE USER MADE
 */
app.get('/orders', authenticate, (req, res) => {
    Order.find({
        client: req.user._id
    }).then((orders) => {
        res.send({ orders });
    }).catch((e) => {
        res.status(400).send(e);
    })
})

/**
 * DELETE ORDER
 */
app.delete('/orders/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Order.findByIdAndRemove(id).then((order) => {
        if (!order) {
            return res.status(404).send();
        }
        res.send(order);
    }).catch((e) => {
        res.status(400).send();
    });
});

/**
 * UPDATE ORDER
 */
app.put('/orders/:id', authenticate, (req, res) => {

    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Order.findByIdAndUpdate(id, { $set: req.body }, { new: true }).then(() => {
        Order.findOne({ _id: id }).then((order) => {
            if (!order) {
                return res.status(404).send();
            }

            //USER ONLY CAN UPDATE HIS ORDERS
            if (!req.user._id.equals(order.client)) {
                return res.status(401).send('Unauthorized Request!');
            }

            res.send(order);
        }).catch((e) => {
            res.status(400).send(e);
        });

    }).catch((e) => {
        res.status(400).send(e);
    })
});

/**
 * SIGNUP
 */
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password', 'role']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
});

//USER PROFILE
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

/**
 *LOGIN
 */
app.post('/users/login', (req, res) => {
    //PICK ONLY EMAIL & PASSWORD FROM THE REQUEST
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        })
    }).catch((e) => {
        res.status(400).send();
    });
});

/**
 * UPDATE USER
 */
app.put('/users/:id', authenticate, (req, res) => {

    var id = req.params.id;
    var body = _.pick(req.body, ['email', 'password']); //update only email & password

    //USER ONLY CAN UPDATE HIS ACCOUNT OR THE ADMIN
    if (!req.user._id.equals(id) && req.user.role !== "Admin") {
        return res.status(401).send('Unauthorized Request!');
    }

    //CHECK ID IS VALID
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    User.findByIdAndUpdate(id, { $set: body }, { new: true }).then(() => {
        User.findOne({ _id: id }).then((user) => {
            if (!user) {
                return res.status(404).send();
            }
            res.send(user);
        }).catch((e) => {
            res.status(400).send(e);
        });

    }).catch((e) => {
        res.status(400).send(e);
    })
});


/**
 * DELETE USER
 */
app.delete('/users/:id', authenticate, (req, res) => {
    var id = req.params.id;

    //USER ONLY CAN DELETE HIS ACCOUNT OR THE ADMIN
    if (!req.user._id.equals(id) && req.user.role !== "Admin") {
        return res.status(401).send('Unauthorized Request!');
    }

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    User.findByIdAndRemove(id).then((user) => {
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    }).catch((e) => {
        res.status(400).send();
    });
});


app.listen(port, () => {
    console.log(`Started at port ${port}`);
});