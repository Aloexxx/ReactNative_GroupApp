import React, { useEffect, useState } from "react";
import { Text, TextInput, View,TouchableOpacity, Image } from "react-native";
import { deleteImageFromStorage, getImageURLFromStorage, saveImageToStorage, storeService } from "../../fBase";
import styled from "styled-components";
import { useNavigation } from "@react-navigation/core";
import { launchImageLibrary } from "react-native-image-picker";

const Container = styled.View`
    justify-content:center;
    align-items:center;
    flex:1;
`;

const NameInput = styled.TextInput`
    border:1px solid black;
    border-radius:10px;
    padding:15px;
    width:60%;
`;
const AddImageBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    width:80%;
    padding:10px;
    margin:5px;
    justify-content:center;
    align-items:center;
    border-radius:30px;
`;

const AddImageBtn = styled.Text`
    font-size:15px;
    font-weight:600;
    color:purple;
`;



const GroupRevise=({route:{params:{groupID,groupName,groupProfile,groupProfile_fileName}}})=>{
    const navigation = useNavigation();
    const [name,setName] = useState(groupName);
    const [image,setImage] = useState("");

    const onPress = async() =>{
        image? await deleteImageFromStorage(groupProfile_fileName,"group_profile") :null //기존이미지 삭제
        image? await saveImageToStorage(image.fileName,image.Uri,"group_profile"):console.log("image null") //새로운 이미지 저장(storage)
        
        await storeService().collection("group").doc(`${groupID}`).update({
            groupName:name,
            profileImage_URL:image?await getImageURLFromStorage(image.fileName,"group_profile"):groupProfile 
        })

        navigation.reset({routes:[{name:"GroupDetail"}]}); //groupdetail페이지 새로고침 +뒤로가기
    }

    const addImage = async () =>{ //휴대폰의 이미지를 useState에 저장
        await launchImageLibrary({maxWidth:200,maxHeight:200,includeBase64:true},response=>{ //핸드폰 내의 파일 접근 후 불러오기
            if(response.didCancel){ //도중에 뒤로가기를 누를 시
                console.log("user cancel")
            }else{
                setImage({fileName:response.assets[0].fileName,Uri:response.assets[0].uri})
            }
        }).then((a)=>console.log("setImage")); //.then(바로 storage저장)을 하면 setImage가 되기전에 image useState 가전달이되어서 초기에는 ""값 그후에는 그전에 올린 사진이 firestore에 올라간다.
        //결론 : useState는 즉시 업데이트 되지 않는다.(?)
    }
    
    return(
        <Container>
            <Text>그룹명:</Text>
            <NameInput type="text" value={name} onChangeText={setName} placeholder="그룹 명 작성"/>

            <AddImageBtnBox onPress={addImage}>
                <AddImageBtn>Add Image</AddImageBtn>
            </AddImageBtnBox>
            {image?(<Image source={{uri:image.Uri}} style={{width:100,height:100}}/>):null}

            <TouchableOpacity onPress={onPress}>
                <Text>수정</Text>
            </TouchableOpacity>
        </Container>
    )
}

export default GroupRevise;