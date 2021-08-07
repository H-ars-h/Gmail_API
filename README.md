# Gmail_API

-------------------------------------
-------------------------------------
Step to run it

1.First go to : https://console.developers.google.com/apis then create new project add api then give name and continue steps

2.After creating project go to credential tab create new creadentials select scopes as give redirect uri as 'http://localhost:3000/sendmail' this will help user to dont log-in next time submit creadential download credentials.json file which will shown by google to you after submiting the credential.

3.Now go to terminal and create folder for project and move into it now run following commands

----------------------
npm init
----------------------

----------------------
npm install express
----------------------

4.Copy index.js file from my repository into your folder and copy that credentials.json file into your folder and run final command on terminal

-----------------
  node .
-----------------

5.Now go to the localhost:3000/{email_receiver}/{subject_of_email}/{message}

Now check your mail box.

Thanks for Reading...
