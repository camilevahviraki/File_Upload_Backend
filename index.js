const express = require('express')
const app = express()
const multer  = require('multer')
const cors = require('cors');
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const fs = require("fs");

if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

cloudinary.config({ 
    cloud_name: 'dii6zzyqu', 
    api_key: '779862917371887', 
    api_secret: '1hj5UfGafzcUCvb3RR76hKgyG2k' 
  });

  async function uploadToCloudinary(locaFilePath) {
  
    var mainFolderName = "hooly-app";

    var filePathOnCloudinary = 
        mainFolderName + "/" + locaFilePath;

    return cloudinary.uploader
        .upload(locaFilePath, { public_id: filePathOnCloudinary, resource_type: 'auto' })
        .then((result) => {

            fs.unlinkSync(locaFilePath);
  
            return {
                message: "Success",
                url: result.url,
            };
        })
        .catch((error) => {
            // Remove file from local uploads folder
            fs.unlinkSync(locaFilePath);
            return {error};
        });
}
  
const port = 3001

app.use(cors());
app.use(bodyParser.json());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
  
        cb(null,  file.originalname );
  
    }
  });

const upload = multer({ storage: storage });
app.post('/upload-images', upload.any('files'), async (req, res) => {
  
   let multiplePicturePromise = req.files.map((picture) =>
      uploadToCloudinary(picture.path)
    );

    let imageResponses = await Promise.all(multiplePicturePromise);
    res.status(200).json({ images: imageResponses });
   console.log(req.files, req.body)
});

app.get('/', (req, res) => {
  res.send('Camilux with Da Hood!')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
