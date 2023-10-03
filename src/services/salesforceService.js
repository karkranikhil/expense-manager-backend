const jsforce = require('jsforce')
const LocalStorage = require('node-localstorage').LocalStorage
const lcStorage = new LocalStorage('./info')
const {SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET, SF_CALLBACK_URL} = require('../config')
//Initialize OAuth2 Config
const oauth2 = new jsforce.OAuth2({
    loginUrl:SF_LOGIN_URL,
    clientId : SF_CLIENT_ID,
    clientSecret : SF_CLIENT_SECRET,
    redirectUri : SF_CALLBACK_URL
})

//Function to perform Salesforce login
const login = (req, res)=>{
    res.redirect(oauth2.getAuthorizationUrl({ scope : 'full' }));
}

//Callback function to get Salesforce Auth token
const callback = (req, res)=>{
    const {code} = req.query
    if(!code){
        console.log("Failed to get authorization code from server callback")
        return res.status(500).send("Failed to get authorization code from server callback")
    }
    console.log("code", code)
    const conn = new jsforce.Connection({oauth2:oauth2})
    conn.authorize(code, function(err){
        if(err){
            console.error(err);
            return res.status(500).send(err)
        }
        console.log("Access token", conn.accessToken)
        // console.log("refresh token", conn.refreshToken)
        // console.log("Instance url", conn.instanceUrl)
        lcStorage.setItem('accessToken', conn.accessToken || '')
        res.redirect("https://google.com/")
    })
}

module.exports={
    login, 
    callback
}