import { useNavigation } from "@react-navigation/core";
import React, { useState } from "react";
import { Image, Text, TextInput,TouchableOpacity } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import styled from "styled-components";
import { authService, getImageURLFromStorage, saveImageToStorage, storeService } from "../../../fBase";

const TitleInput = styled.TextInput`
    border:1px solid black;
    border-radius:10px;
    margin:10px;
`;

const ContentInputBox = styled.View`
    border:1px solid black;
    border-radius:10px;
    height:60%;
    margin:10px;
`;

const PostBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    border-radius:10px;
    background-color:beige;
    justify-content:center;
    align-items:center;
    height:10%;
    margin:10px;
`;

const BoardMade =({route:{params:{groupID}}})=>{
    const navigation = useNavigation();

    const [title,setTitle] = useState("")
    const [image,setImage] = useState("")
    const [content,setContent] = useState("")

    const onPress=async()=>{
        {image? await saveImageToStorage(image.fileName,image.Uri,"group_board"):null}
        const temp = await storeService().collection("group").doc(groupID).get();
        const tempSave = temp._data.groupBoard;
        await storeService().collection("group").doc(groupID).update({
            groupBoard:[...tempSave,{
                title,
                content,
                userName:authService().currentUser.displayName,
                userUid:authService().currentUser.uid,
                imageFileName:image? image.fileName:null,
                imageURL:image?await getImageURLFromStorage(image.fileName,"group_board"):null,
            }]});
        navigation.goBack();
    }

    const addImage = async () =>{ //휴대폰의 이미지를 useState에 저장
        await launchImageLibrary({maxWidth:400,maxHeight:400,includeBase64:true},response=>{ //핸드폰 내의 파일 접근 후 불러오기
            if(response.didCancel){ //도중에 뒤로가기를 누를 시
                console.log("user cancel")
            }else{
                setImage({fileName:response.assets[0].fileName,Uri:response.assets[0].uri})
            }
        }).then((a)=>console.log("setImage")); //.then(바로 storage저장)을 하면 setImage가 되기전에 image useState 가전달이되어서 초기에는 ""값 그후에는 그전에 올린 사진이 firestore에 올라간다.
        //결론 : useState는 즉시 업데이트 되지 않는다.(?)
    }

    return (
        <>
            <TitleInput placeholder="제목" onChangeText={setTitle} value={title}/>
            <TouchableOpacity onPress={addImage}>
                <Text>🧷</Text>
            </TouchableOpacity>
            <ContentInputBox>
                <Image source={{uri:image?image.Uri:null}} resizeMode="stretch" style={{width:"80%",height:"50%",margin:"10%",borderRadius:3}}/>
                <TextInput placeholder="내용" onChangeText={setContent} value={content} multiline/>
            </ContentInputBox>
            <PostBtnBox onPress={onPress}>
                <Text>게시</Text>
            </PostBtnBox>
        </>
    )
}

export default BoardMade;