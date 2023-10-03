const express = require('express')
const jsforce = require('jsforce');
const app = express()
const {PORT, SERVER_URL} = require('./src/config')
const authController = require('./src/controllers/authController')
//create a test api to check if server is running
app.get('/test', (req, res)=>{
    res.json({"success":true, "message": "server is running"})
})
app.use('/oauth2', authController)
app.listen(PORT,()=>{
    console.log(`server is running on: ${SERVER_URL}`)
})