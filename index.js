const express = require('express')
const jsforce = require('jsforce');
const cors = require('cors')
const app = express()
const {PORT, SERVER_URL} = require('./src/config')
const authController = require('./src/controllers/authController')
const expenseController = require('./src/controllers/expenseController')
const allowedOrigins = ['http://localhost:3000']
app.use(cors({
    origin:allowedOrigins
}))
//create a test api to check if server is running
app.get('/test', (req, res)=>{
    res.json({"success":true, "message": "server is running"})
})
app.use('/oauth2', authController)
app.use('/expenses', expenseController)
app.listen(PORT,()=>{
    console.log(`server is running on: ${SERVER_URL}`)
})