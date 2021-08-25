import os
import cv2
from PIL import Image
from keras.backend import name_scope
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import shutil

from keras.preprocessing.image import ImageDataGenerator, array_to_img, img_to_array, load_img

# resize all img under single dir
def reSizeFunc(path, target):
    files = os.listdir(path)
    
    for index, file in enumerate(files):
        try:
            name = os.path.join(path, file)
            print(name)

            #read and resize
            img = cv2.imread(name)
            resized_image = cv2.resize(img, (256, 256), interpolation=cv2.INTER_AREA)

            # change dir to target dir and save img
            os.chdir(target)
            filename = str(index) + "hi" + ".jpg"
            cv2.imwrite(filename, resized_image)       
        except:
            print(file, "resize error.")

# rename all img under single dir
def reNameFunc(path, target):
    files = os.listdir(path)

    for index, file in enumerate(files):
        try:
            os.rename(os.path.join(path, file), os.path.join(target, ''.join([str(index), '.jpg'])))
        except:
            print("remane error")

# dataArg all img under single dir
def daataArgs(path, target, num):
    files = os.listdir(path)

    datagen = ImageDataGenerator(
        rotation_range=40,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    for index, file in enumerate(files):

        name = os.path.join(path, file)
        print(name)

        img = load_img(name)  
        x = img_to_array(img) 
        x = x.reshape((1,) + x.shape)

        i = 0
        for batch in datagen.flow(x, batch_size=1,
                save_to_dir=target, save_prefix=str(index) + 'name', save_format='jpeg'):
            i += 1
            if i > num:
                break  # otherwise the generator would loop indefinitely

# dataArg all img under single dir
def genDataArg2(path, target, round):

    files = os.listdir(path)
    datagen = ImageDataGenerator(rotation_range=40,horizontal_flip=True,fill_mode='nearest')

    for index, file in enumerate(files):

        names = os.path.join(path, file)

        img = load_img(names)  
        x = img_to_array(img) 
        x = x.reshape((1,) + x.shape)

        it = datagen.flow(x, batch_size=1,
                save_to_dir=target, save_prefix=str(index) + 'name', save_format='jpeg')

        for kk in range(round):
            batch = it.next()
    
    print("Done")

# dataArg all img under root dir
def fitDataDir(location, round):
  for index, pol in enumerate( os.listdir(location) ):
    genDataArg2(location + pol, location + pol, round)

# add types for all img under root dir
def addTypesAtRoot(location):
    for index, pol in enumerate( os.listdir(location) ):
        reNameFunc(location + pol, location + pol)

# sep single class data under current dir
# types = "train" / "valid"
def sepTrainValid(currentLocation, targetLocation, validNum , classes):

    def nameingFunc(n):
        name = n if '.jpg' in n else (n + str('.jpg'))
        return name

    trainDir = targetLocation + "train\\" + classes
    validDir = targetLocation + "valid\\" + classes

    os.mkdir(trainDir)
    os.mkdir(validDir)

    direc = os.listdir(currentLocation)
    cutPt = int( len(direc)  * (1 - validNum) )

    trainArr = [img for img in direc[:cutPt] if img.find('images') >= 0 ]
    validArr = [img for img in direc[cutPt:] if img.find('images') >= 0 ]

    for i in trainArr:
        shutil.copy2( os.path.join(currentLocation, i) , os.path.join(trainDir, nameingFunc(i)))

    for i in validArr:
        shutil.copy2( os.path.join(currentLocation, i) , os.path.join(validDir, nameingFunc(i)))


# validNum = 0 to 1, best ~0.3
def sepData(currentLocation, targetLocation, validNum):

    os.mkdir(targetLocation + "train")
    os.mkdir(targetLocation + "valid")

    for index, pol in enumerate( os.listdir(currentLocation) ):
        sepTrainValid(currentLocation + pol, targetLocation, validNum, pol)

def sepTrainValidCheck(currentLocation, targetLocation, validNum, checkNum, classes):

    def nameingFunc(n):
        name = n if '.jpg' in n else (n + str('.jpg'))
        return name

    trainDir = targetLocation + "train\\" + classes
    validDir = targetLocation + "valid\\" + classes
    checkDir = targetLocation + "valid\\" + classes

    os.mkdir(trainDir)
    os.mkdir(validDir)
    os.mkdir(checkDir)

    direc = os.listdir(currentLocation)
    cutPtTrain = int( len(direc)  * (1 - validNum) )
    cutPtCheck = int( len(direc)  * (1 - checkNum) )

    trainArr = [img for img in direc[:cutPtTrain] if img.find('images') >= 0 ]
    validArr = [img for img in direc[cutPtTrain:cutPtCheck] if img.find('images') >= 0 ]
    checkArr = [img for img in direc[cutPtCheck:] if img.find('images') >= 0 ]

    for i in trainArr:
        shutil.copy2( os.path.join(currentLocation, i) , os.path.join(trainDir, nameingFunc(i)))

    for i in validArr:
        shutil.copy2( os.path.join(currentLocation, i) , os.path.join(validDir, nameingFunc(i)))
    
    for i in checkArr:
        shutil.copy2( os.path.join(currentLocation, i) , os.path.join(checkDir, nameingFunc(i)))

def sepDataValidations(currentLocation, targetLocation, validNum, checkNum):

    os.mkdir(targetLocation + "train")
    os.mkdir(targetLocation + "valid")
    os.mkdir(targetLocation + "check")

    for index, pol in enumerate( os.listdir(currentLocation) ):
        sepTrainValidCheck(currentLocation + pol, targetLocation, validNum, checkNum, pol)

def expendData (currentLocation, count):
    for index, pol in enumerate(os.listdir(currentLocation)):
        for c in range(count):
            shutil.copy2( os.path.join(currentLocation, pol) , os.path.join(currentLocation, str(c) + "_" + pol  ))

def expendDataAllRoot(currentLocation, count):
    for index, pol in enumerate( os.listdir(currentLocation) ):
        expendData(os.path.join(currentLocation, pol), count)


print("Done")