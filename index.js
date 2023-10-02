const express = require('express')
const jsforce = require('jsforce');
const app = express()
const {PORT, SERVER_URL, SF_LOGIN_URL, SF_PASSWORD, SF_USERNAME} = require('./src/config')

//create a test api to check if server is running
app.get('/test', (req, res)=>{
    res.json({"success":true, "message": "server is running"})
})
app.get('/connection', (req, res)=>{
    const conn = new jsforce.Connection({
        loginUrl : SF_LOGIN_URL
      });
      const username = SF_USERNAME
      const password = SF_PASSWORD //password+securitytoken
      conn.login(username, password, function(err, userInfo) {
        if (err) { return console.error(err); }
        // Now you can get the access token and instance URL information.
        // Save them to establish connection next time.
        console.log(conn.accessToken);
        console.log(conn.instanceUrl);
        // logged in user property
        console.log("User ID: " + userInfo.id);
        console.log("Org ID: " + userInfo.organizationId);
        // ...
      });
      
})
app.listen(PORT,()=>{
    console.log(`server is running on: ${SERVER_URL}`)
})