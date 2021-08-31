# tfjs-Model
Trained model for tfjs  

```javascript
let myModel = await tf.loadLayersModel('https://cdn.jsdelivr.net/gh/r48n34/tfjs-Model/<file-name>/model.json')
```

1. catdogv3:  
Best: loss: 0.3205 - accuracy: 0.9937 - val_loss: 0.3177 - val_accuracy: 1.0000  
Model: MobileNetV2 + GlobalAveragePooling2D(),Dropout(0.1),Dense(2)  
Training Size: 300 x 3 round augmentation each class
```javascript
size = [1,224,224,3]
label = ["cat", "dog"]
```

2. 5Classv3Graph:  
Best: loss: 0.9114 - accuracy: 0.9945 - val_loss: 0.9521 - val_accuracy: 0.9533 loss: 0.9521 - accuracy: 0.9533   
Model: MobileNetV3Large + GlobalAveragePooling2D(),Dropout(0.1),Dense(5)  
Training Size: 6000 pics total with data args
```javascript
size = [1,224,224,3]
label = ['bird', 'cat', 'dog', 'fish', 'lion']
```
   
