const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/nodeauth',{
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() =>{
  console.log('connected to database');
}).catch(() =>{
  console.log('failed connected to database');
});