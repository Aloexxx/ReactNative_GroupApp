import React, { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity } from "react-native";
import { authService, deleteImageFromStorage, getImageURLFromStorage, saveImageToStorage, storeService } from "../../fBase";
import styled from "styled-components";
import { launchImageLibrary } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/core";

const Container = styled.View`
    align-items:center;
    justify-content:center;
    padding-bottom:20%;
    height:100%;
    background-color:white;
`;

const ProfileImage = styled.Image`
    width:100px;
    height:100px;
    border-radius:50px;
`;

const ImageBtnBox = styled.TouchableOpacity`
    margin:10px;
    padding:15px;
    border:1px solid black;
    border-radius:10px;
    justify-content:center;
    align-items:center;
    width:80%;
`;
const BasicImageBtnBox = styled.TouchableOpacity`
    margin:10px;
    padding:15px;
    border:1px solid black;
    border-radius:10px;
    justify-content:center;
    align-items:center;
    width:80%;
    background-color:${(props)=>props.selected?"#e0e0e0":"white"};
`;

const NameInput = styled.TextInput`
    padding:12px;
    border:1px solid black;
    border-radius:10px;
    width:80%;
`;

const SubmitBtnBox = styled.TouchableOpacity`
    background-color:beige;
    margin:10px;
    padding:15px;
    border:1px solid black;
    border-radius:10px;
    justify-content:center;
    align-items:center;
    width:80%;
`;

const EditProfile = ({route:{params:{user}}})=>{
    const navigation = useNavigation();
    
    const [userInfo,setUserInfo] = useState(null);
    const [name,setName] = useState(authService().currentUser.displayName);
    const [image,setImage] = useState(null);
    const [basicImage,setBasicImage] = useState(false)

    const getUser=async()=>{
        const save = await storeService().collection("users").doc(authService().currentUser.uid).get();
        setUserInfo(save._data);
    }

    useEffect(()=>{
        getUser();
    },[])

    const addImage = async () =>{ //휴대폰의 이미지를 useState에 저장
        await launchImageLibrary({maxWidth:400,maxHeight:400,includeBase64:true},response=>{ //핸드폰 내의 파일 접근 후 불러오기
            if(response.didCancel){ //도중에 뒤로가기를 누를 시
                console.log("user cancel")
            }else{
                setImage({fileName:response.assets[0].fileName,Uri:response.assets[0].uri})
                setBasicImage(false)
            }
        }).then((a)=>console.log("setImage")); //.then(바로 storage저장)을 하면 setImage가 되기전에 image useState 가전달이되어서 초기에는 ""값 그후에는 그전에 올린 사진이 firestore에 올라간다.
        //결론 : useState는 즉시 업데이트 되지 않는다.(?)
    }

    const submitEdit = async ()=>{
        {image ? await saveImageToStorage(image.fileName,image.Uri,"image_profile"): null}
        //"기본 사람 이미지"는 공동으로 사용하는 것이므로 지우면 안된다.
        {(image||basicImage) && userInfo.user_profileFileName!=="기본 사람 이미지.jfif"? await deleteImageFromStorage(userInfo.user_profileFileName,"image_profile"):null}
        await authService().currentUser.
            updateProfile({
                displayName:name,
                photoURL:basicImage?
                    await getImageURLFromStorage("기본 사람 이미지.jfif","image_profile")
                :
                    image?
                        await getImageURLFromStorage(image.fileName,"image_profile")
                    :
                        authService().currentUser.photoURL
            })
        {!basicImage?
            //image를 선택했을때 or 아무것도 선택하지 않았을 때
            await storeService().collection("users").doc(authService().currentUser.uid)
                .update({
                    user_displayName:name,
                    user_profileFileName:image?image.fileName:userInfo.user_profileFileName,
                    user_profileURL: image?await getImageURLFromStorage(image.fileName,"image_profile"):userInfo.user_profileURL, //image도 고르지 않고 basicImage도 선택을 안했을 시(기존 사진 유지)
                }).then(()=>navigation.reset({routes:[{name:"profile"}]}))
        :
            //기본 프로필을 선택했을 때
            await storeService().collection("users").doc(authService().currentUser.uid)
            .update({
                user_displayName:name,
                user_profileFileName:"기본 사람 이미지.jfif",
                user_profileURL: await getImageURLFromStorage("기본 사람 이미지.jfif","image_profile")
            }).then(()=>navigation.reset({routes:[{name:"profile"}]}))
        }
    }

    const addBasic=()=>{
        setBasicImage((prev)=>!prev)
        basicImage?setImage(null):null
    }

    return(
        <Container>
            {userInfo?
                !basicImage?
                    <ProfileImage source={{uri:image?image.Uri:authService().currentUser.photoURL}}/>
                :
                    <ProfileImage source={require(`../../images/기본사람이미지.jpg`)}/>
            :
                null}
            <BasicImageBtnBox onPress={addBasic} selected={basicImage}>
                <Text>기본 프로필로 지정</Text>
            </BasicImageBtnBox>
            <ImageBtnBox onPress={addImage}>
                <Text>Edit Image</Text>
            </ImageBtnBox>
            <NameInput placeholder="변경할 이름" value={name} onChangeText={setName}/>
            <SubmitBtnBox onPress={submitEdit}>
                <Text>확인</Text>
            </SubmitBtnBox>
        </Container>
    )
}

export default EditProfile;