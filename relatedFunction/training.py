from numpy.core.numeric import False_
import tensorflow as tf
from tensorflow.keras import datasets, layers, models
import matplotlib.pyplot as plt
#import numpy as np
#import os
import datetime

#import tensorflowjs as tfjs

from tensorflow import keras
from tensorflow.keras.models import Sequential

data_dir = "D:\\gh code\\codeNotes\\university\\webScraper\\food"

batch_size = 64
imgSize = 224

train_ds = tf.keras.preprocessing.image_dataset_from_directory(
  data_dir, seed=123, subset="training", validation_split=0.2,
  image_size=(imgSize, imgSize), batch_size=batch_size
)

valid_ds = tf.keras.preprocessing.image_dataset_from_directory(
  data_dir, seed=123, subset="validation", validation_split=0.2,
  image_size=(imgSize, imgSize), batch_size=batch_size
)

classNum = len(train_ds.class_names)
print(train_ds.class_names)

plt.figure(figsize=(10, 10))
for images, labels in train_ds.take(1):
  for i in range(9):
    ax = plt.subplot(3, 3, i + 1)
    plt.imshow(images[i].numpy().astype("uint8"))
    plt.title(train_ds.class_names[labels[i]])
    plt.axis("off")

plt.show()

data_augmentation = keras.Sequential(
  [
    layers.experimental.preprocessing.RandomFlip("horizontal_and_vertical"),
    layers.experimental.preprocessing.RandomRotation(0.1),
    layers.experimental.preprocessing.RandomZoom(0.1),
    layers.experimental.preprocessing.RandomContrast(0.1),
  ]
)

# Data expend for image augmentation
expendRound = 4
temp_ds = train_ds
for i in range(expendRound):
    train_ds = train_ds.concatenate(temp_ds)

train_ds = train_ds.map(lambda image,label:(data_augmentation(image),label))

baseModel = tf.keras.applications.MobileNetV3Large(input_shape=(imgSize,imgSize,3),
                                               include_top=False,
                                               weights='imagenet')

baseModel.trainable = True
print("Layers count", len(baseModel.layers))

fine_tune_at = int( len(baseModel.layers) * 0.6)
for layer in baseModel.layers[:fine_tune_at]:
  layer.trainable = False

model = Sequential([
  baseModel,
  tf.keras.layers.GlobalAveragePooling2D(),
  tf.keras.layers.Dropout(0.4),
  tf.keras.layers.Dense(classNum, activation=tf.nn.softmax)
])

epochsRound = 8

base_learning_rate = 0.0001
model.compile(optimizer=tf.keras.optimizers.Adam(lr=base_learning_rate),
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])

log_dir = "logs/fit/" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=1)
# tensorboard --logdir logs/fit

history = model.fit(train_ds, 
                    epochs=epochsRound,
                    validation_data=valid_ds,
                    callbacks=[tensorboard_callback]
)

test_loss, test_acc = model.evaluate(valid_ds, verbose=2)
print(test_acc)

acc = history.history['accuracy']
val_acc = history.history['val_accuracy']
loss = history.history['loss']
val_loss = history.history['val_loss']

epochs_range = range(epochsRound)

plt.figure(figsize=(8, 8))
plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Training Accuracy')
plt.plot(epochs_range, val_acc, label='Validation Accuracy')
plt.legend(loc='lower right')
plt.title('Training and Validation Accuracy')

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Training Loss')
plt.plot(epochs_range, val_loss, label='Validation Loss')
plt.legend(loc='upper right')
plt.title('Training and Validation Loss')
plt.show()

#y_pred = model.predict_classes(test_images)
#con_mat = tf.math.confusion_matrix(labels=y_true, predictions=y_pred).numpy()

#model.save('catdogpyvMobie3.h5')
#tfjs.converters.save_keras_model(model, "./fileHa4")
