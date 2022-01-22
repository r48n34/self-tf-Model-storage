from sanic import Sanic
from sanic.response import json, text
from sanic import response
import os
import aiofiles

from keras.models import load_model
from PIL import Image, ImageOps
import numpy as np
import os
import tensorflow as tf

app = Sanic("App_Name")
app.config["upload"] = 'D:\\gh code\\codeNotes\\mlorDl\\sanicWebServices\\uploads' # your uploaded photo folder

model = load_model("D:\\gh code\\catdogpy") # Model path

imgSize = 224 # original model input images size
label = ["cat", "dog"] # original model label

# create folder if not exist
if not os.path.exists(app.config["upload"]):
    os.makedirs(app.config["upload"])

@app.get("/")
async def test(request):
    return json({"hello": "world"})

def getresult(imgName):
    imgPath = os.path.join(app.config["upload"], imgName)

    image = Image.open(imgPath)
    image = ImageOps.fit(image, (imgSize, imgSize) , Image.ANTIALIAS)

    data = np.ndarray(shape=(1, imgSize, imgSize, 3), dtype=np.float32)
    data[0] = (np.asarray(image).astype(np.float32) / 127.0) - 1 # Mobienetv2 rescale needs to be / 127.0 and -1 => outcome should be between [-1 to 1]
    #data[0] = np.asarray(image).astype(np.float32)  # Model no need to be rescale => outcome should be between [0 to 255]

    prediction = model.predict(data)
    print(label[np.argmax(prediction)])
    return prediction

@app.route("/upload", methods=['POST'])
async def getFiles(request):
    fileName = request.files["file"][0].name

    async with aiofiles.open(app.config["upload"] + "/" + fileName, 'wb' ) as f:
        await f.write(request.files["file"][0].body)
    f.close()

    prediction = getresult(fileName)
    return text(label[np.argmax(prediction)])

def warmup():
    getresult('0_8hi - 複製.jpg')


if __name__ == "__main__":
    warmup()
    app.run(host="0.0.0.0", port=8000)

