const express = require('express')
const app = express()
const PORT = 3002
const SERVER_URL = 'http://localhost:3002'

//create a test api to check if server is running
app.get('/test', (req, res)=>{
    res.json({"success":true, "message": "server is running"})
})
app.listen(PORT,()=>{
    console.log(`server is running on: ${SERVER_URL}`)
})