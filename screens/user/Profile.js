import { useNavigation } from "@react-navigation/core";
import React from "react";
import { authService } from "../../fBase";
import styled from "styled-components";

const Container = styled.View`
    justify-content:center;
    align-items:center;
    width:100%;
    height:100%;
`;

const UserProfileBox = styled.View`
    justify-content:center;
    align-items:center;
    width:100%;
    height:80%;
`;

const ImageBox = styled.Image`
    height:150px;
    width:150px;
    border-radius:75px;
    margin:20px;
`;

const DisplayNameText = styled.Text``;

const EmailText = styled.Text``;

const BtnBox = styled.TouchableOpacity`
    background-color:#fcfcf3;
    justify-content:center;
    align-items:center;
    border-radius:10px;
    padding:10px;
    margin:5px;
    margin-top:8px;
    width:80%;
    elevation:2;
`;

const LogoutBtn = styled.Text`
    font-size:15px;
    font-weight:700;
    color:purple;
`;

const LoginBtnBox = styled.TouchableOpacity`
    justify-content:center;
    align-items:center;
    border:1px solid black;
    border-radius:30px;
    width:80%;
    height:10%;
`;

const LoginBtn =styled.Text`
    font-size:15px;
    font-weight:700;
    color:purple;
`;

const profile = ({route:{params:{user}}}) =>{
    const navigation = useNavigation();

    const logout=async ()=>{
        await authService().signOut().then(()=>console.log("User signed out!"))
        navigation.goBack();
    }

    return(
        <>
            {
                user?
                    <UserProfileBox>
                        <ImageBox source={{uri:authService().currentUser.photoURL}}/>
                        <DisplayNameText>{authService().currentUser.displayName}</DisplayNameText>
                        <EmailText>{authService().currentUser.email}</EmailText>
                        <BtnBox onPress={()=>navigation.navigate("editProfile",{user})}>
                            <LogoutBtn>Edit profile</LogoutBtn>
                        </BtnBox>
                        <BtnBox onPress={()=>logout()}>
                            <LogoutBtn>log out</LogoutBtn>
                        </BtnBox>
                    </UserProfileBox>
                :
                <Container>
                    <LoginBtnBox onPress={()=>navigation.navigate("Stacks",{
                        screen:"login"
                    })}>
                        <LoginBtn>login</LoginBtn>
                    </LoginBtnBox>
                </Container>
            }
        </>
    )
}

export default profile;