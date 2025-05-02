const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("./s3-credentials");

const putObject = async (file, fileName) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: file,
      ContentType: "image/jpg,jpeg,png",
    };
    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);

    if (data.$metadata.httpStatusCode !== 200) {
      return;
    }
    let url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    return { url, key: params.Key };
  } catch (err) {
    console.error("Error putting object:", err);
    throw err;
  }
};

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

module.exports = { putObject, deleteObject };
