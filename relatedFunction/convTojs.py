from keras.models import load_model
import tensorflowjs as tfjs

model = load_model('animals2')
tfjs.converters.save_keras_model(model, 'F:/tf')