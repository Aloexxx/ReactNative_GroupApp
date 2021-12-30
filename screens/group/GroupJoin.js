import React, { useRef, useState } from "react";
import { Text, TextInput,TouchableOpacity, View } from "react-native";
import { authService, storeService } from "../../fBase";
import styled from "styled-components";
import { useNavigation } from "@react-navigation/core";

const Container = styled.View`
    flex:1;
    align-items:center;
    justify-content:center;
`;

const InputBox = styled.TextInput`
    border:1px solid black;
    border-radius:10px;
    margin:5px;
    padding:10px;
    width:80%;
`;

const CheckSexBox = styled.View`
    flex-direction:row;
    justify-content:space-between;
    margin:5px;
    width:80%;
`;

const CheckSex = styled.TouchableOpacity`
    border:1px solid black;
    border-radius:10px;
    width:50%;
    justify-content:center;
    align-items:center;
    padding:11px;
    background-color:${(props)=>props.selected?"grey":"white"};
`;


const SubmitBtnBox = styled.TouchableOpacity`
    align-items:center;
    border:1px solid black;
    border-radius:10px;
    margin:5px;
    padding:10px;
    width:80%;
`;

const SubmitBtn = styled.Text`
    font-size:14px;
    font-weight:700;
    color:purple;
`;

const GroupJoin = ({route:{params:{groupID}}}) =>{
    const navigation = useNavigation();

    const nextInputAge = useRef();
    const nextInputNickName = useRef();
    const nextInputEmail = useRef();

    const [name,setName] = useState("");
    const [age,setAge] = useState("");
    const [sexual,setSexual] = useState("");
    const [email,setEmail] = useState("");

    const onSubmitToNext = {
        onSubmitToAge:()=>nextInputAge.current.focus(),
        onSubmitToNickName:()=>nextInputNickName.current.focus(),
        onSubmitTo:()=>nextInputEmail.current.focus()
    }
    
    const saveUserInfoToGroup = async() => {
        const con = await storeService().collection("group").doc(`${groupID}`).get();

        const saveUsersID = con._data.usersID_inGroup;
        const saveCountUsers = con._data.count_users;

        await storeService().collection("group").doc(`${groupID}`).update({
            usersID_inGroup:[
                ...saveUsersID,
                {uid:authService().currentUser.uid,
                 name:name,
                 age:age,
                 sexual:sexual,
                 email:email
                }
            ],
            count_users:saveCountUsers+1})
        saveGroupInfoToUser();
        navigation.reset({routes:[{name:"GroupDetail"}]}); //GroupDetail새로고침 후에 이동(같은 navigation만 이동기능 작동)
    }
    
    const saveGroupInfoToUser = async() =>{
        const save = await storeService().collection("users").doc(authService().currentUser.uid).get();  //현재 로그인된 유저의 firestore 정보

        const saveCountJoinGroup = save._data.count_join_group; //가입그룹 수
        const saveJoinGroup = save._data.join_groupID;  //가입그룹id

        await storeService().collection("users").doc(authService().currentUser.uid).update({count_join_group:saveCountJoinGroup+1,join_groupID:[...saveJoinGroup,groupID]}); //user에 그룹정보 저장
        console.log("saveGroupInfoToUser!!");
    }

    return(
        <Container>
            <InputBox type="text" placeholder="이름" onChangeText={setName} value={name} onSubmitEditing={()=>onSubmitToNext.onSubmitToAge()}/>
            <InputBox type="text" placeholder="나이" onChangeText={setAge} value={age} keyboardType={"number-pad"} ref={nextInputAge} onSubmitEditing={()=>onSubmitToNext.onSubmitToNickName()}/>
            <CheckSexBox>
                <CheckSex onPress={()=>setSexual("남자")} selected={sexual==="남자"}>
                    <Text>남</Text>
                </CheckSex>
                <CheckSex onPress={()=>setSexual("여자")} selected={sexual==="여자"}>
                    <Text>여</Text>
                </CheckSex>
            </CheckSexBox>
            <InputBox type="text" placeholder="이메일"onChangeText={setEmail} value={email} keyboardType={"email-address"} autoCapitalize={"none"} ref={nextInputEmail}/>
            <SubmitBtnBox onPress={()=>saveUserInfoToGroup()}>
                <SubmitBtn>submit</SubmitBtn>
            </SubmitBtnBox>
        </Container>



    )
}

export default GroupJoin;
