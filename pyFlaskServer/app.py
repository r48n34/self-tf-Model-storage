from keras.models import load_model
from PIL import Image, ImageOps
import numpy as np
import os
from flask import Flask, flash, request, redirect, url_for ,render_template
from werkzeug.utils import secure_filename
import asyncio
from flask_cors import CORS
import tensorflow as tf

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

app = Flask(__name__)
app.secret_key = "yooooooooooooo this is a keyyyyy"
app.config['UPLOAD_FOLDER'] = './uploads'
cors = CORS(app, resources={r"/*": {"origins": "*"}}) # Only on testing

model = load_model("D:\\gh code\\catdogpy") # Model location

imgSize = 224 # img size
label = ["cat", "dog"] # model label
path = "uploads" # picture location


@app.route('/', methods=['GET'])
def hello():
    return render_template('upload.html')

def getresult(imgName):
    imgPath = os.path.join(path, imgName)

    image = Image.open(imgPath)
    image = ImageOps.fit(image, (imgSize, imgSize) , Image.ANTIALIAS)

    data = np.ndarray(shape=(1, imgSize, imgSize, 3), dtype=np.float32)
    data[0] = (np.asarray(image).astype(np.float32) / 127.0) - 1

    prediction = model.predict(data)
    print(label[np.argmax(prediction)])
    return prediction

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/pred', methods=['POST'])
def upload_file():
    if request.method == 'POST':

        print(request.files)

        if 'file' not in request.files:
            print(1)
            flash('No file part')
            return redirect(request.url)

        file = request.files['file']

        if file.filename == '':
            print(2)
            flash('No selected file')
            return redirect(request.url)

        if file and allowed_file(file.filename):
            try:
                print(3)
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

                pred = getresult(filename)
                return f"Result: {label[np.argmax(pred)]} with {pred} ."
            except:
                return 'Sorry, server error.'

def warmup():
    getresult('0_0hi.jpg')

warmup()