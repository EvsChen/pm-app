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

#### Tips on the elastic beanstalk cli
Sometimes the cli will report error `command not found: eb`

The position of the eb cli can be seen by `pip show awsebcli`

Normally the path is `~/.local/bin`

Just add the path to `~/.zshrc` or `~/.bashrc` by
````shell
export PATH=$HOME/.local/bin:$PATH
````

### HTTPS settings for the elastic beanstalk env
By default the eb env is hosted without https certificate. To enable this, see [configuring-https-elb](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/configuring-https-elb.html) for detailed examples.

Without a custom domain name (not ending in "elasticbeanstalk.com"), it seems that we cannot use AWS Certificate Manager (ACM) to provide a valid ssl certificate for the website. Though it seems very strange, the reason is that you're not the owner of the domain. But it self didn't support https though. 

A possible workaround is to sign a certificate using [OpenSSL](https://www.openssl.org/source/) on the local machine. And then upload the certificate onto AWS IAM, which is also described in the doc above.

### Deployment with Zeit
There seems to be some problem with AWS. Today I can't connect to the api server anymore. The problem is again with the certificate. So I change to a lighter deployment with zeit. 

The deployment itself is very simple. Simply install the cli tool and run command. There seems to be some problem with my local connection to the mongodb cloud server. But the problems solves after deploying on the cloud. 

Also, unlike traditional deployment, there is no such thing as `process.env.PORT`, which usually serves as a default port selection. So it cannot be used to determine the env by this.

By default you can't read or write file on the zeit server. So I need to find out a better way to save logs.