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

3. food101Eff:  
Best: val_accuracy: 0.8472  
Model: EfficientNetV1B0 noisy_student  
Training Size: Original food101 dataset (training: 75,750 + valid:25,250)  no data args
```javascript
size = [1,224,224,3]
label = [
'Apple pie','Baby back ribs','Baklava','Beef carpaccio','Beef tartare','Beet salad',
'Beignets','Bibimbap','Bread pudding','Breakfast burrito','Bruschetta','Caesar salad',
'Cannoli','Caprese salad','Carrot cake','Ceviche','Cheesecake','Cheese plate',
'Chicken curry','Chicken quesadilla','Chicken wings','Chocolate cake','Chocolate mousse','Churros',
'Clam chowder','Club sandwich','Crab cakes','Creme brulee','Croque madame',
'Cup cakes','Deviled eggs','Donuts','Dumplings','Edamame','Eggs benedict',
'Escargots','Falafel','Filet mignon','Fish and chips','Foie gras','French fries',
'French onion soup','French toast','Fried calamari','Fried rice','Frozen yogurt',
'Garlic bread','Gnocchi','Greek salad','Grilled cheese sandwich','Grilled salmon',
'Guacamole','Gyoza','Hamburger','Hot and sour soup','Hot dog','Huevos rancheros','Hummus',
'Ice cream','Lasagna','Lobster bisque','Lobster roll sandwich','Macaroni and cheese','Macarons',
'Miso soup','Mussels','Nachos','Omelette','Onion rings','Oysters','Pad thai','Paella','Pancakes','Panna cotta',
'Peking duck','Pho','Pizza','Pork chop','Poutine','Prime rib','Pulled pork sandwich','Ramen','Ravioli','Red velvet cake',
'Risotto','Samosa','Sashimi','Scallops','Seaweed salad','Shrimp and grits','Spaghetti bolognese','Spaghetti carbonara',
'Spring rolls','Steak','Strawberry shortcake','Sushi','Tacos','Takoyaki','Tiramisu','Tuna tartare','Waffles'
]
```


   
