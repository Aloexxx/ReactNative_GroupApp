import {initializeApp} from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export const authService = ()=>auth();
export const storeService = () =>firestore();
export const storageService = () =>storage();

export const saveImageToStorage = async(name,uri,kind) => await storageService() 
        .ref(`${kind}/${name}`)
        .putFile(`${uri}`)
        .then(()=>console.log("done!!"))
        .catch(()=>console.log("fail!!"));

export const getImageURLFromStorage = async(name,kind)=> await storageService() //profile_imageUir에 storage이미지 파일 위치 저장
        .ref(`${kind}/${name}`)
        .getDownloadURL() //return값이 변수 안에 들어갈 때는 then,catch 함수를 쓰면 안된다.

export const deleteImageFromStorage = async(name,kind) => await storageService()
        .ref(`${kind}/${name}`)
        .delete()