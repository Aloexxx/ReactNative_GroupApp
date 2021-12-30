import React, { useRef, useState } from "react";
import { Button, Image, Text, TextInput, TouchableOpacity, View,ActivityIndicator } from "react-native";
import { authService, getImageURLFromStorage, saveImageToStorage, storeService } from "../../fBase";
import styled from "styled-components";
import { useNavigation } from "@react-navigation/core";
import { launchImageLibrary } from "react-native-image-picker";

const Container = styled.View`
    flex:1;
    align-items:center;
    justify-content:center;
`;

const ImageBox = styled.Image`
    width:100px;
    height:100px;
    border-radius:50px;
    margin-bottom:5px;
`;

const AddProfileBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    width:50%;
    padding:10px;
    margin:5px;
    justify-content:center;
    align-items:center;
    border-radius:30px;
`;

const InputBox = styled.TextInput`
    border:1px solid black;
    width:80%;
    border-radius:20px;
    margin:5px;
`;

const CreateBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    width:80%;
    padding:10px;
    margin:5px;
    justify-content:center;
    align-items:center;
    border-radius:30px;
`;

const CreateBtn = styled.Text`
    font-size:15px;
    font-weight:600;
    color:purple;
`;
const LoadingBox = styled.View`
    flex:1;
    align-items:center;
    justify-content:center;
    opacity:0.3;
`;

const join =()=>{
    const navigation = useNavigation();

    const nextInputPassword = useRef();
    const nextInputName = useRef();

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [name,setName] = useState("");
    const [image,setImage] = useState(null);
    const [loading,setLoading] = useState(false);

    const onSubmitToNext = {
        onSubmitToPassword:()=>nextInputPassword.current.focus(),
        onSubmitToName:()=>nextInputName.current.focus(),
    }
    
    const onPress = () =>{
        setLoading(true);
        if(email!==""&&password!==""){
            authService().createUserWithEmailAndPassword(email,password)
            .then(()=>updateNameAndFirestore())
            .then(()=>setLoading(false))
            .then(()=>navigation.reset({routes:[{name:"main"}]}))//main새로고침
            .then(()=>navigation.navigate("Tabs",{
                screen:"main"
            }))
            .catch(error=>{
                if (error.code === 'auth/email-already-in-use') {
                    console.log('That email address is already in use!');
                }
                if (error.code === 'auth/invalid-email') {
                    console.log('That email address is invalid!');
                }
                console.error(error);
            })
        }else{
            return console.log("Fill email and password")
        }
    }

    const updateNameAndFirestore = async () => {
        
        {image ? await saveImageToStorage(image.fileName,image.Uri,"image_profile"): null}
        await authService().currentUser.updateProfile({
            displayName:name,
            photoURL:image?
                await getImageURLFromStorage(image.fileName,"image_profile")
            :
                await getImageURLFromStorage("기본 사람 이미지.jfif","image_profile")
        })
        await storeService().collection("users").doc(authService().currentUser.uid).set({
            user_displayName: authService().currentUser.displayName,
            user_uid:authService().currentUser.uid,
            user_profileFileName:image?image.fileName:"기본 사람 이미지.jfif",
            user_profileURL:image? await getImageURLFromStorage(image.fileName,"image_profile"): await getImageURLFromStorage("기본 사람 이미지.jfif","image_profile"),
            count_join_group:0,
            join_groupID:[],
            count_make_group:0,
            make_groupID:[]
        })
    }

    const addImage = async() =>{
        await launchImageLibrary({maxWidth:200,maxHeight:200,includeBase64:true},response=>{
            if(response.didCancel){ //도중에 뒤로가기를 누를 시
                console.log("user cancel")
            }else{
                setImage({fileName:response.assets[0].fileName,Uri:response.assets[0].uri})
            }
        }).then(()=>console.log("setImage"))
    }

    return(
            <Container>
                {image ? <ImageBox source={{uri:image.Uri}}/> : <ImageBox source={require(`../../images/기본사람이미지.jpg`)}/>}
                <AddProfileBtnBox onPress={addImage}>
                    <Text>Add an Profile</Text>
                </AddProfileBtnBox>
                <InputBox placeholder="Email" value={email} autoCapitalize={"none"} keyboardType={"email-address"} onChangeText={(text)=>setEmail(text)} onSubmitEditing={()=>onSubmitToNext.onSubmitToPassword()}/>
                <InputBox placeholder="Password" value={password} autoCapitalize={"none"} secureTextEntry={true} onChangeText={(text)=>setPassword(text)} ref={nextInputPassword} onSubmitEditing={()=>onSubmitToNext.onSubmitToName()}/>
                <InputBox placeholder="name" value={name} onChangeText={(text)=>setName(text)} ref={nextInputName}/>
                <CreateBtnBox onPress={()=>onPress()}>
                {loading?<ActivityIndicator size="small" color="balck"/> :<CreateBtn>create</CreateBtn>}
                </CreateBtnBox>
            </Container>
    )
}

export default join;