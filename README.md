stoned-cd -- St(atic)oned(node) Continuous Deployment
=====================

The point of this project is to create a free simple way to continuously deploy
web applications on a local webserver (must run the script on the server). 

It is written in node.js and will become an npm package in the future. For now 
it is probably most suited for non-distributed static or node powered websites.

### TODO:
1. Have a standard script or config file
2. Make config file allow for selecting branches
3. Add Logging
4. Figure out how to run tests before building
5. Add a help flag

### How to use

node script.js [repo-directory] [build-cmd]
