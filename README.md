# Neck

https://docs.google.com/document/d/10xbxSpkuiu1pWJQU5kFDY9wReVXqxS0I0FGneGDCfTo/edit#

# How to get this running (on Mac):

* Make sure that you have the latest versions of node and npm.
** `node -v` should give `v8.2.1`
** `npm -v` should give `5.3.0`
** If these aren't correct, reinstall node.
* Install npm packages from the server directory --> `cd server && npm install`
* Install and configure redis --> `brew install redis`
* Install and start mysql with no root password
* Launch the application from scratch --> `server/bin/start-from-scratch.sh`
* Access the app at localhost:5000
