import full from './img/full.jpg';

const listImage = {
    full,
};

function getImageDeep(name){
    return listImage[name];
}

export default getImageDeep;