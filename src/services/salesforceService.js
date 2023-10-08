const jsforce = require('jsforce')
const LocalStorage = require('node-localstorage').LocalStorage
const lcStorage = new LocalStorage('./info')
const {SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET, SF_CALLBACK_URL, APP_URL} = require('../config')
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
        lcStorage.setItem('instanceUrl', conn.instanceUrl || '')
        res.redirect(APP_URL)
    })
}

//Function to get logged-in user details
const whoAmI =(req, res)=>{
    let instanceUrl = lcStorage.getItem('instanceUrl')
    let accessToken = lcStorage.getItem('accessToken')
    if(!accessToken){
        return res.status(200).send({})
    }
    const conn = new jsforce.Connection({
        accessToken,
        instanceUrl
    })
    conn.identity((error,data)=>{
        if(error){
            //do error handling
            handleSalesforceError(error, res)
            return
        }
        res.json(data)
    })
}

//Function to perform Salesforce logout and clear localstorage
const logout = (req, res)=>{
    lcStorage.clear()
    res.redirect(`${APP_URL}/login`)
}

//Function to get Expenses from Salesforce
const getExpenses = (req, res)=>{
    let instanceUrl = lcStorage.getItem('instanceUrl')
    let accessToken = lcStorage.getItem('accessToken')
    if(!accessToken){
        return res.status(200).send({})
    }
    const conn = new jsforce.Connection({
        accessToken,
        instanceUrl
    })
    //perform a query to fetch expenses from salesforce
    conn.query("SELECT Id, Amount__c,Category__c, Date__c, Name, Expense_Name__c, Notes__c FROM Expense__c ORDER BY Date__c DESC ", function(error, result){
        if(error){
            handleSalesforceError(error, res)
            return
        }
        console.log("result", result)
        res.json(result)
    })
}

//Function to create an Expense record inSalesforce
const createExpense = (req, res)=>{
    let instanceUrl = lcStorage.getItem('instanceUrl')
    let accessToken = lcStorage.getItem('accessToken')
    if(!accessToken){
        return res.status(200).send({})
    }
    const conn = new jsforce.Connection({
        accessToken,
        instanceUrl
    })
    const {Expense_Name__c, Amount__c, Date__c,Category__c, Notes__c } = req.body
    //perform a query to fetch expenses from salesforce
    conn.sobject("Expense__c").create({Expense_Name__c, Amount__c, Date__c,Category__c, Notes__c }, function(error, result){
        if(error){
            handleSalesforceError(error, res)
            return
        }
        console.log("result", result)
        res.json(result)
    })
}


//Function to update an Expense record in Salesforce
const updateExpense = (req, res)=>{
    let instanceUrl = lcStorage.getItem('instanceUrl')
    let accessToken = lcStorage.getItem('accessToken')
    if(!accessToken){
        return res.status(200).send({})
    }
    const conn = new jsforce.Connection({
        accessToken,
        instanceUrl
    })
    const {id} = req.params
    const {Expense_Name__c, Amount__c, Date__c,Category__c, Notes__c } = req.body
    //perform a query to fetch expenses from salesforce
    conn.sobject("Expense__c").update({Id:id, Expense_Name__c, Amount__c, Date__c,Category__c, Notes__c }, function(error, result){
        if(error){
            handleSalesforceError(error, res)
            return
        }
        console.log("result", result)
        res.json(result)
    })
}


//Centralized error handler function

const handleSalesforceError = (error, res)=>{
    console.log("error statusCode", JSON.stringify(error))
    if(error.errorCode === 'INVALID_SESSION_ID'){
        lcStorage.clear()
        res.status(200).send({})
    } else{
        console.error("Error", error)
        res.status(500).send(error)
    }
}

module.exports={
    login, 
    callback,
    whoAmI,
    logout,
    getExpenses,
    createExpense,
    updateExpense
}