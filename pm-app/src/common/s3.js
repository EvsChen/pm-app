import AWS from 'aws-sdk';

const albumBucketName = 'elasticbeanstalk-us-east-1-905484802142';
const bucketRegion = 'us-east-1';
const IdentityPoolId = 'us-east-1:b2f6d822-3085-4c2c-ba85-a9fb84b32966';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});

export const getUserFileKey = id => encodeURIComponent(id) + '/';

// TODO: save file list to backend to increase speed
export const loadFileList = userId => {
  const userFileKey = getUserFileKey(userId);
  return new Promise((resolve, reject) => {
    s3.listObjects({Prefix: userFileKey}, function(err, data) {
      const href = this.request.httpRequest.endpoint.href;
      const bucketUrl = href + albumBucketName + '/';
      data.Contents.forEach(file => {
        file.url = bucketUrl + encodeURIComponent(file.Key)
        file.title = file.Key.split('//')[1];
      });
      if (err) {
        reject(err);
      }
      resolve(data.Contents);
    });
  });
}

/**
 * @param {String} userId 
 * @param {File} file 
 */
export const uploadFile = (userId, file) => {
  const userFileKey = getUserFileKey(userId);
  const Key = `${userFileKey}/${file.name}`;
  return new Promise((resolve, reject) => {
    s3.upload({
      Key,
      Body: file,
      ACL: 'public-read'
    }, (err,data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

export const createFileObject = userId => {
    userId = userId.trim();
    return new Promise((resolve, reject) => {
      if (!userId) {
        reject('Album names must contain at least one non-space character.');
      }
      if (userId.indexOf('/') !== -1) {
        reject('Album names cannot contain slashes.');
      }
      const userFileKey = getUserFileKey(userId);
      s3.headObject({Key: userFileKey}, function(err, data) {
        if (!err) {
          reject('Album already exists.');
        }
        if (err.code !== 'NotFound') {
          reject('There was an error creating your album: ' + err.message);
        }
        s3.putObject({Key: userFileKey}, function(err, data) {
          if (err) {
            reject('There was an error creating your album: ' + err.message);
          }
          resolve(data);
        });
      });
    });
  }

s3.$createFileObject = createFileObject;
s3.$uploadFile = uploadFile;
s3.$loadFileList = loadFileList;
s3.$getUserFileKey = getUserFileKey;

export default s3;

