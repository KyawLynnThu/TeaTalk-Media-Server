
const { vodHelper } = require("../helpers/alibaba-vod");

exports.upload = async (req, res) => {
    console.log("file", req.file)
    if (req.file) {
        let folder_path = req.file.path.replace(/\\/g, "/");
        console.log("file _path ", req.file.name)

        vodHelper.upload(folder_path, req.body.title).then(data => {
            // console.log("success", data)

            // setTimeout(() => {
            //     vodHelper.getPlayAuth(data.videoId).then(vdoInfo => {
            //         res.status(200).send({
            //             message: "Success",
            //             data: vdoInfo
            //         });
            //     })
            // }, 5000); 
            res.status(200).send({
                message: "Success",
                data: data
            });           
            
        }).catch(err => {
            console.log("fail", err)
            res.status(422).send({
                message: "Fail",
                error: err
            })
        })
    }
    
}

exports.load = async (req, res) => {
    console.log(req.query.videoId)
    vodHelper.getPlayAuth(req.query.videoId).then(data => {
        res.status(200).send({
            message: "Success",
            data: data
        })
    }).catch(err => {
        res.status(200).send({
            message: "Fail",
            error: err
        })
    })
    
}

exports.loadUrl = async (req, res) => {
    vodHelper.getURL(req.query.videoId).then(data =>  {
        res.status(200).send({
            message: "Success",
            data: {
                VideoMeta: data.VideoBase,
                VideoUrl: data.PlayInfoList.PlayInfo[0].PlayURL
            }
        })
    }).catch(err => {
        res.status(200).send({
            message: "Fail",
            error: err
        })
    })
}