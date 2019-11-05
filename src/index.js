const express = require('express');
require('../db/mongoose');
const userRoutes = require('../router/user');
const PostRoutes = require('../router/post');

const app   = express();
const port  =  process.env.PORT || 3005;

app.use(express.json());

app.use(userRoutes);
app.use(PostRoutes);

app.use(function(err, req, res, next){
    res.status(err.statusCode || 500).send({error: err.message || 'Internal Server Error'});
});



app.listen(port,() =>{
    console.log('server is up on ' + port);
});
