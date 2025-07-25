const exp = require('express')
const app = exp();
require('dotenv').config()
const path = require('path');
const cors = require('cors');

// Use frontend URL from environment variable for CORS
const allowedOrigin = process.env.FRONTEND_URL || '*';
const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
// Explicitly handle preflight requests
app.options('*', cors(corsOptions));

//import mongo client in server.js
const mongoClient = require('mongodb').MongoClient
//connect to mongo server
mongoClient.connect(process.env.DB_URL)
.then(client=>{
    //get database object
    const blogdb = client.db('blogdb')
    //get collection object
    const usercollection = blogdb.collection('usercollection')
    const articlescollection = blogdb.collection('articlescollection')
    const authorscollection = blogdb.collection('authorscollection')

    //to set collection object to app
    app.set('usercollection', usercollection)
    app.set('articlescollection', articlescollection)
    app.set('authorscollection', authorscollection)
    
    console.log('DB connection success')

    //to parse the body of req
    app.use(exp.json())

    //import API router
    const userApp = require('./APIs/user-api')
    const adminApp = require('./APIs/admin-api')
    const authorApp = require('./APIs/author-api')

    // if path starts with user-api, send response to userapp
    app.use('/user-api',userApp)
    // if path starts with admin-api, send response to adminapp
    app.use('/admin-api',adminApp)
    // if path starts with author-api, send response to authorapp
    app.use('/author-api',authorApp)

    //express error handler
    app.use((err,req,res,next)=>{
        res.send({message:"error",payload: err.message})
    })

    app.get('/', (req, res) => {
        res.send({activeStatus: "Server is running"});
    });

    const port = process.env.PORT || 5000
    app.listen(port, ()=>console.log(`server running at port ${port} successfully!`))
})
.catch(err=>{
    console.log('DB connection error:', err)
})