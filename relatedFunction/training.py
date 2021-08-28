import tensorflow as tf
from tensorflow.keras import layers
import matplotlib.pyplot as plt
import tensorflowjs as tfjs
from tensorflow import keras
from tensorflow.keras.models import Sequential

train_data_dir = 'F:\\ml\\animals\\train'
valid_data_dir = 'F:\\ml\\animals\\valid'

batch_size = 32
imgSize = 224

# Import training set
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
  train_data_dir, seed=689,
  image_size=(imgSize, imgSize), batch_size=batch_size
)

# Import valid set
valid_ds = tf.keras.preprocessing.image_dataset_from_directory(
  valid_data_dir, seed=689,
  image_size=(imgSize, imgSize), batch_size=batch_size
)

# For dense num
classNum = len(train_ds.class_names)
print(train_ds.class_names)

# PLT
plt.figure(figsize=(10, 10))
for images, labels in train_ds.take(1):
  for i in range(9):
    ax = plt.subplot(3, 3, i + 1)
    plt.imshow(images[i].numpy().astype("uint8"))
    plt.title(train_ds.class_names[labels[i]])
    plt.axis("off")

plt.show()

resize_and_rescale = tf.keras.Sequential([
  layers.experimental.preprocessing.Resizing(imgSize, imgSize),
  layers.experimental.preprocessing.Rescaling(1./imgSize)
])

data_augmentation = keras.Sequential(
  [
    layers.experimental.preprocessing.RandomFlip("horizontal_and_vertical"),
    layers.experimental.preprocessing.RandomRotation(0.1),
    layers.experimental.preprocessing.RandomZoom(0.1),
  ]
)

# Data expend for image augmentation
expendRound = 2
for i in range(expendRound):
    train_ds = train_ds.concatenate(train_ds)

# Apply to regarding data set
valid_ds = valid_ds.map(lambda image,label:(resize_and_rescale(image),label))
valid_ds = valid_ds.map(lambda image,label:(data_augmentation(image),label))

train_ds = train_ds.map(lambda image,label:(resize_and_rescale(image),label))

baseModel = tf.keras.applications.MobileNetV2(input_shape=(imgSize,imgSize,3), include_top=False, weights='imagenet')

# Set up model
model = Sequential([
  baseModel,
  tf.keras.layers.GlobalAveragePooling2D(),
  tf.keras.layers.Dropout(0.1),
  tf.keras.layers.Dense(classNum, activation=tf.nn.softmax)
])

# Fine tune, lock first 100 layer
baseModel.trainable = True
fine_tune_at = 100
for layer in baseModel.layers[:fine_tune_at]:
  layer.trainable = False

# comppile and fit model
epochsRound = 12
base_learning_rate = 0.0001
model.compile(optimizer=tf.keras.optimizers.Adam(lr=base_learning_rate),
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])

history = model.fit(train_ds, epochs=epochsRound,validation_data=valid_ds)

# Evaluate
test_loss, test_acc = model.evaluate(valid_ds, verbose=2)
print(test_acc)


# Plot history
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

# Save model
#model.save('animals2')
#tfjs.converters.save_keras_model(model, "./fileHa")