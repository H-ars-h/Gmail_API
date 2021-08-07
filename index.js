
const {Base64} = require('js-base64');    //required for encoding purpore 
const fs = require('fs');                 //required for reading & writing token file
const {google} = require('googleapis');   //google api which is important in this program
const express = require('express');       //this is used to host our application
const { gmail } = require('googleapis/build/src/apis/gmail');
const app = express();

// we are using scope here
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
'https://www.googleapis.com/auth/gmail.send'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization completes for the first time.
const TOKEN_PATH = 'token.json';    //set path of token to store
let oAuth2Client = null;            //to access in get method at 'sendmail' path this is required
let info = {                        
  to: null,
  subject: null,
  message: null,
};

//this is path to send mail
app.get('/:to/:subject/:message',(req,res)=>{
  if(req.params.to==="null" || req.params.subject==="null" || req.params.message==="null"){ //checking that fields are not null
    console.log("information are null");
    res.send("All /to/subject/message are compulsory..!");
    return    
  }
  else{                 //else set the mail information into info object to send it next
    info = {
      to: req.params.to,
      subject: req.params.subject,
      message: req.params.message,
    }
  }
 
  //It will check credentials.json file else you need to download it.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    
    authorize(JSON.parse(content), res,);
  });
});


// OAuth2 client with the given credentials
 
function authorize(credentials, res) {
  const {client_secret, client_id, redirect_uris} = credentials.web;  
  oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, async (err, token) => {
    if (err) return getNewToken(oAuth2Client, res); //if not then get new tocken
    oAuth2Client.setCredentials(JSON.parse(token));
    const message = await sendmessage(oAuth2Client)
      console.log(message);
            res.send(message);  
  });
}

// Get new token.
//The OAuth2 client to get token.

function getNewToken(oAuth2Client, res) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',   //used to get both access and refresh token
    scope: SCOPES,            //set the scope
  });
  
  console.log("Authorizing user........................");
  res.redirect(authUrl);      //move to login page of google to get token.
}

// When user will sign in by google it will rediect to here for storing token sended by google
app.get('/sendmail',(req,res)=>{
  if(oAuth2Client!=null){         //check user is sign-in
    if(req.query.code){           
      oAuth2Client.getToken(req.query.code, (err, token) => {
        if (err){                 
          console.error('Error retrieving access token', err);
          return res.send("Error: please retry");
        }
        oAuth2Client.setCredentials(token);     //set token to oAuth2Client to proceed next
        
        // Store the token to disk for next program executions
        
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        res.redirect(`http://localhost:3000/${info.to}/${info.subject}/${info.message}`);//move for sending mail
      });
    }
    else{
          console.log("token not found");
          res.redirect(`http://localhost:3000/${info.to}/${info.subject}/${info.message}`);//move to get token
    }
  }
  else{
    console.log("client not verified");
    res.redirect(`http://localhost:3000/${info.to}/${info.subject}/${info.message}`);//move to sign in
  }
});


async function sendmessage(oAuth2Client) {
  let msg = null;
  if(oAuth2Client){
    let gmail = await google.gmail({version: 'v1', oAuth2Client});  //get gmail using verified oAuth2Client

    //check that correct paramers are passed with link
    if(info.to==="null" || info.subject==="null" || info.message==="null"){
      console.log("null_entrys");
      res.send("All /to/subject/message are compulsory..!");
      return
    }
    else{  
      //if paramers are correct then encode with base64
      msg = makeRaw(info.to,info.subject,info.message);

    }

    let message = null;
 //A null message to show next a proper message to user
    await gmail.users.messages.send({
      auth: oAuth2Client,               //set verified user's credentials
      userId:'me',                      //set he's user-ID
      'resource': {
        'raw': msg                      //set encoded message
      }
    },(err,res)=>{
      if(err){
        message = err.message;
        console.log("1",message);
        
        //if error in sending message then know to user
      }else{
        message = "Successfully sended";      //send success message
        console.log("2",res);
        info = {                        
          to: null,
          subject: null,
          message: null,
        };

      }
    });
    return message;
  }
  else{
    'client not authenticated..!';
  }
    
}

//this function will encode the 'info' object into base64 string which will acceptable by gmail server
function makeRaw(to,subject,message){
 
   let str = ["Content-Type: text/plain; charset=\"UTF-8\"\r\n",  
      "MIME-Version: 1.0\r\n",                                    
      "Content-Transfer-Encode:7bit\r\n",                         

      "To: ",to,"\n",             //receiver address
      "Subject: ",subject,"\n\n",   //subject of mail
      message,        //user's message
  ].join('');
encodeMsg = Base64.encodeURI(str);   
return encodeMsg                      
  
}

//this is express listen method where our apllication is running.
app.listen(3000,()=>console.log('App is running at localhost:3000'));
