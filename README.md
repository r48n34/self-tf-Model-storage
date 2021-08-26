# tfjs-Model
Trained model for tfjs  

```javascript
let myModel = await tf.loadLayersModel('https://cdn.jsdelivr.net/gh/r48n34/tfjs-Model/<file-name>/model.json')
```

1. catdog:  
Best: loss: 0.3205 - accuracy: 0.9937 - val_loss: 0.3177 - val_accuracy: 1.0000  
Model: MobileNetV2 + GlobalAveragePooling2D(),Dropout(0.1),Dense(2)  
Training Size: 300 x 3 round augmentation each class
```javascript
size = [1,224,224,3]
label = ["cat", "dog"]
```
   
