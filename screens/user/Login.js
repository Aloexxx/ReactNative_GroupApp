import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import styled from "styled-components";
import { useNavigation } from "@react-navigation/core";
import { authService, getImageURLFromStorage, storeService } from "../../fBase";
import Icon from "react-native-vector-icons/Ionicons";

import { GoogleSignin } from "@react-native-google-signin/google-signin"
import auth from "@react-native-firebase/auth";

const Container = styled.View`
    flex:1;
    align-items:center;
    justify-content:center;
`;

const InputBox = styled.TextInput`
     border:1px solid black;
    width:80%;
    border-radius:20px;
    margin:5px;
`;

const LoginBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    width:80%;
    padding:10px;
    margin:5px;
    justify-content:center;
    align-items:center;
    border-radius:30px;
`;

const LoginBtn = styled.Text`
    font-size:15px;
    font-weight:600;
    color:blue;
`;

const JoinBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    width:80%;
    padding:10px;
    margin:5px;
    justify-content:center;
    align-items:center;
    border-radius:30px;
`;

const JoinBtn = styled.Text`
    font-size:15px;
    font-weight:600;
    color:purple;
`;


const login =()=>{
    const navigation = useNavigation();

    const nextInputPassword = useRef();

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [blankError,setBlankError] = useState(false);
    const [error,setError] = useState(null);
    const [loading,setLoading] = useState(false);

    const onSubmitToNext = {
        onSubmitToPassword:()=>nextInputPassword.current.focus(),
    }

    const onPress = () =>{
        setLoading(true);
        if(email!==""&&password!==""){
            setBlankError(false);

            return authService().signInWithEmailAndPassword(email,password)
            .then(()=>setLoading(false))
            .then(()=>navigation.navigate("Tabs",{
                screen:"main"
            }))
            .catch(a=>{
                console.log(a)
                setLoading(false)
                setError(a)
            })
        }else{
            setLoading(false);
            setBlankError(true);
            setError(null)
        }
    }

    useEffect(()=>{
        GoogleSignin.configure({
            webClientId:"1009643737439-jlc2vmn80jc2i2ktbjj6ulbkqnu36nll.apps.googleusercontent.com"
        });
    },[]);

    const onSocialClick=async()=>{ //google login 버튼 클릭 시
        setLoading(true);
        const {idToken} = await GoogleSignin.signIn();
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        await authService().signInWithCredential(googleCredential);

        const save = await storeService().collection("socialToken").doc("Tokens").get();
        if(!save._data.tokens.includes(idToken)){ //처음 한번 로그인 시에만 생성(회원가입 절차)
            await storeService().collection("users").doc(`${authService().currentUser.uid}`).set({
                user_displayName: authService().currentUser.displayName,
                user_uid:authService().currentUser.uid,
                user_profileFileName:"기본 사람 이미지.jfif", //google연동은 firestorage에 사진저장을 하지 않음. 프로필 수정 시 firesotre 기존 사진 삭제 과정을 피하기 위해 fileName을 이와같이 지정.
                user_profileURL:authService().currentUser.photoURL,
                count_join_group:0,
                join_groupID:[],
                count_make_group:0,
                make_groupID:[]
            })
            .then(async()=>await storeService().collection("socialToken").doc("Tokens").update({tokens:[...save._data.tokens,idToken]}))
            .then(()=>setLoading(false))
            .then(()=>navigation.navigate("Tabs",{
                screen:"main"
            }));
        }else{
            console.log("idToken exist")
            setLoading(false)
            navigation.navigate("Tabs",{
                screen:"main"
            })
        }
    }

    return(
        <Container> 
            <InputBox placeholder="Email" value={email} autoCapitalize={"none"} keyboardType={"email-address"} onChangeText={(text)=>setEmail(text)} onSubmitEditing={()=>onSubmitToNext.onSubmitToPassword()}/>
            <InputBox placeholder="Password" value={password} autoCapitalize={"none"} secureTextEntry={true} onChangeText={(text)=>setPassword(text)} ref={nextInputPassword}/>
            {blankError?<Text style={{color:"red"}}>Fill in the black</Text>:null}
            {error?<Text style={{color:"red"}}>The email address is badly formatted.</Text>:null}
            <LoginBtnBox onPress={onPress}>
                {loading? <ActivityIndicator size="small" color="black"/>  :<LoginBtn>login</LoginBtn>}
            </LoginBtnBox>
            <LoginBtnBox onPress={onSocialClick}>
                {loading? <ActivityIndicator size="small" color="black"/>  : <LoginBtn><Icon name="logo-google" color="black" size={17}/></LoginBtn>}
            </LoginBtnBox>
            <JoinBtnBox onPress={()=>navigation.navigate("join")}>
                <JoinBtn>Join</JoinBtn>
            </JoinBtnBox>
        </Container>
    )
}

export default login;