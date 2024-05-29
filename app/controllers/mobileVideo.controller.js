const { vodHelper } = require("../helpers/alibaba-vod");

exports.getUrl = async (req, res) => {
    vodHelper.getURLNoExp(req.query.videoId).then(data =>  {
        res.status(200).send({
            message: "Success",
            data: {
                VideoMeta: data.VideoMeta,
                VideoUrl: data.VideoUrl
            }
        })
    }).catch(err => {
        res.status(200).send({
            message: "Fail",
            error: err
        })
    })
}