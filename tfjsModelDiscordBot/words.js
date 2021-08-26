import fs from 'fs';
import {Semaphore} from 'async-mutex';

const filePath = 'textP.txt';
const semaphore = new Semaphore(1);

class Pair{

    constructor(key, value){
        this.key = key;
        this.value = value;
    }

}

function initArray(){
    let wordPairArr = [];

    try{
        const data = fs.readFileSync(filePath, 'UTF-8');
        wordPairArr = JSON.parse(data);
        return wordPairArr;
    }
    catch(err){
        console.log(err);
    }
}

async function jsonWriteFile(arr){
    const [value, release] = await semaphore.acquire();

    try {
        fs.writeFile(filePath, JSON.stringify(arr) , 'UTF-8', function (err) {
            err ? console.log(err) : console.log('Append operation complete.');         
        }); 
    }
    finally {
        release();
    } 

}

export {jsonWriteFile, initArray, Pair};