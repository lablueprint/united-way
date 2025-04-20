const { DeleteObjectCommand } = require("@aws-sdk/client-s3")
const { s3Client } = require('./s3-credentials')

const deleteObject = async(key) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        }
        const command = new DeleteObjectCommand(params);
        const data = await s3Client.send(command);
        if(data.$metadata.httpStatusCode !== 204){
            return {status:400,data};
        }

    }catch(err) {
        console.error('Error deleting object:', err);
        return {status:500,data:err};
    }
}

module.exports = { deleteObject };