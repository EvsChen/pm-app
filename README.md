# Project Management app

This project is designed for project management. It supports cross-plat project management with easy flow diagram creation.

### Deployment guide 
The front end and back end are designed to be separated.

#### Front end deployment 
The hosted homepage can be modified in the `homepage` field of  pm-app/package.json 
````shell
cd pm-app
npm run deploy
````

#### Back end deployment
The back end is deployed onto the AWS elastic beanstalk.
````shell
eb deploy
````