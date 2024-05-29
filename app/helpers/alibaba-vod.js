const oss_access_key_id = process.env.ALIBABA_OSS_ACCESS_KEY_ID;
const oss_access_key_secret = process.env.ALIBABA_OSS_ACCESS_KEY_SECRET;

var RPCClient = require('@alicloud/pop-core').RPCClient;
const oss = require('ali-oss');
const fs = require("fs")

const accessKeyId = process.env.ALIBABA_OSS_ACCESS_KEY_ID;
const accessKeySecret = process.env.ALIBABA_OSS_ACCESS_KEY_SECRET;
const bucketName = process.env.ALIBABA_OSS_BUCKET_NAME;
const region = 'oss-ap-southeast-1';

var regionId = 'ap-southeast-1' //'cn-shanghai';   // The region where you want to call ApsaraVideo VOD operations.
var client = new RPCClient({
    accessKeyId: oss_access_key_id,
    accessKeySecret: oss_access_key_secret,
    endpoint: 'http://vod.' + regionId + '.aliyuncs.com',//vod.ap-southeast-1.aliyuncs.com
    apiVersion: '2017-03-21'
});

const vodHelper = {
    upload: async (file_path, title = "test title") => {
        return new Promise((resolve, reject) => {
            try {
                client.request("CreateUploadVideo", {
                    Title: title,
                    FileName: file_path
                }, {}).then(async function (response) {
                    console.log('VideoId = ' + response.VideoId);

                    let uploadAddress = JSON.parse(Buffer.from((response.UploadAddress), 'base64').toString('utf8'))
                    let uploadAuth = JSON.parse(Buffer.from(response.UploadAuth, 'base64').toString('utf8'))

                    var ossClient = new oss({
                        accessKeyId: uploadAuth['AccessKeyId'],
                        accessKeySecret: uploadAuth['AccessKeySecret'],
                        endpoint: uploadAddress['Endpoint'],
                        stsToken: uploadAuth['SecurityToken'],
                        bucket: uploadAddress['Bucket']
                    });
                    console.log("start upload ......")

                    async function asyncProgress(p, cpt, res) {
                        console.log(p * 100 + "% Completed");
                    }

                    const options = {
                        progress: asyncProgress,
                        parallel: 4,
                        partSize: 1024 * 1024, // Set the part size.
                        timeout: 300000, // 5 MIN, Set the timeout period.
                    };

                    ossClient.multipartUpload(uploadAddress['FileName'], file_path, options).then(result => {
                        // console.log("file upload result =====>>>>", result)
                        resolve({
                            videoId: response.VideoId
                        })
                        fs.unlinkSync(file_path)
                    })

                }).catch(function (response) {
                    console.log('ErrorCode = ' + response.data.Code);
                    console.log('ErrorMessage = ' + response.data.Message);
                    console.log('RequestId = ' + response.data.RequestId);
                    reject("error")
                });

            } catch (err) {
                console.log("err => ", err)
                reject("error")
            }
        })

    },

    getURL: (videoId) => {
        return new Promise((resolve, reject) => {
            client.request("GetPlayInfo", {
                VideoId: videoId,
                AuthInfoTimeout: 3000
            }, {}).then(function (response) {

                resolve({ ...response})
            })
            .catch(function (response) {
                console.log("errorr -------", JSON.stringify(response))
                // console.log('ErrorCode = ' + response.data.Code);
                // console.log('ErrorMessage = ' + response.data.Message);
                // console.log('RequestId = ' + response.data.RequestId);
                // reject(response)
            });
        })
    },

    getURLNoExp: async (videoId) => {
        try {
            const response = await client.request("GetPlayInfo", {
                VideoId: videoId,
                AuthInfoTimeout: 3000
            }, {});
    
            const urlStr = response.PlayInfoList.PlayInfo[0].PlayURL;
            const urlObj = new URL(urlStr);
    
            // Remove unnecessary query parameters
            urlObj.searchParams.delete('Expires');
            urlObj.searchParams.delete('OSSAccessKeyId');
            urlObj.searchParams.delete('Signature');
            urlObj.searchParams.delete('security-token');
    
            const updatedURL = urlObj.toString();
    
            // Remove 'http://teatalk-social-demo.oss-ap-southeast-1.aliyuncs.com' from the beginning
            const parts = updatedURL.split('/');
            const cutURL = parts.slice(3).join('/');
    
            const urlClient = new oss({
                accessKeyId,
                accessKeySecret,
                bucket: bucketName,
                region
            });
    
            const expiresInSeconds = 24 * 60 * 60; // 24 hours
            const signedURL = await urlClient.signatureUrl(cutURL, { expires: expiresInSeconds });
    
            const data = {
                VideoMeta: response.VideoBase,
                VideoUrl: signedURL
            };
    
            return { ...data };
        } catch (error) {
            console.log("Error:", error);
            throw error; // Reject the promise with the error
        }
    },
    

    getPlayAuth: (videoId) => {
        return new Promise((resolve, reject) => {
            client.request("GetVideoPlayAuth", {
                VideoId: videoId,
                AuthInfoTimeout: 3000
            }, {}).then(function (response) {
                // play auth
                // console.log('PlayAuth = ' + JSON.stringify(response));

                // base metadata
                if (response.VideoMeta) {
                    console.log('VideoMeta.Title = ' + response.VideoMeta.Title);
                }
                resolve(response)
                // console.log('RequestId = ' + response.RequestId);
            }).catch(function (response) {
                console.log('ErrorCode = ' + response.data.Code);
                console.log('ErrorMessage = ' + response.data.Message);
                console.log('RequestId = ' + response.data.RequestId);
                reject(response)
            });
        })

    },
    
    refreshUpload: () => {
        client.request("RefreshUploadVideo", {
            VideoId: '55aa0c40a5d871edbfc67035d0b20102'
        }, {}).then(function (response) {
            console.log("refresh upload")
            console.log('UploadAddress = ' + response.UploadAddress);
            console.log('UploadAuth = ' + response.UploadAuth);
            console.log('RequestId = ' + response.RequestId);
        }).catch(function (response) {
            console.log('ErrorCode = ' + response.data.Code);
            console.log('ErrorMessage = ' + response.data.Message);
            console.log('RequestId = ' + response.data.RequestId);
        });
    }
}

module.exports = {
    vodHelper
}

