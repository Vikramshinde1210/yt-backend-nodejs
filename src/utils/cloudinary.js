import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs' // file system handling
          
cloudinary.config({ 
  cloud_name: 'dafcp52od', 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // console.log(response)
        fs.unlinkSync(localFilePath) // remove file from local machine as it got uploaded on cloudinary successfully
        // file has been uploaded on successfully
        console.log("File is uploaded on cloudinary", response.url)
        return response
    } catch (error) {
        console.log(error)
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

const deleteFromCloudinary = async(fileURL, typeOfFile) => {
    try {
        if(!fileURL) return null;

        // extract public id from image url
        // "http://res.cloudinary.com/dafcp52od/image/upload/v1715401400/zfg4hdlx5uiagvxgtfqf.png"  -- zfg4hdlx5uiagvxgtfqf
        const publicId = fileURL.split("/").pop().split(".")[0]

        const reponse = await cloudinary.uploader.destroy(
            publicId,
            {resource_type: typeOfFile}
        )

        // console.log("response:", reponse)
        return reponse;
    } catch (error) {
        console.log(error)
        return null
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}
