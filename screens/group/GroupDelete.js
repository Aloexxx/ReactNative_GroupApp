import { getFocusedRouteNameFromRoute, useNavigation } from "@react-navigation/core";
import React, { useEffect, useState } from "react";
import { Text,TextInput,TouchableOpacity, View } from "react-native";
import styled from "styled-components";
import { authService, deleteImageFromStorage, storeService } from "../../fBase";

const InfoBox = styled.View`
    flex-direction:row;
`;

const DeleteBtnBox = styled.TouchableOpacity`
    align-items:center;
    border:1px solid black;
    border-radius:11px;
    padding:10px;
    margin:10px;
`;
const GroupDelete = ({route:{params:{groupID,groupName,groupProfileName}}})=>{
    const navigation = useNavigation();
    const [password,setPassword] = useState("");
    const [users,setUsers] = useState([]);

    const getUser= async()=>{
        const tempSave = await storeService().collection("group").doc(groupID).get();
        setUsers(()=>tempSave._data.usersID_inGroup) //group에 저장되어있는 유저 정보들을 배열에담고
    }
    
    useEffect(()=>{
        getUser();
    },[])
    
    const userInfoDelete=async(uid)=>{

        const tempSave = await storeService().collection("users").doc(uid).get();
        {uid!==authService().currentUser.uid? //방장이 아닌 유저만 수정
            await storeService().collection("users").doc(uid).update({
                count_join_group:tempSave._data.count_join_group-1,
                join_group:tempSave._data.join_group.filter((a)=>a!==groupID)
            })
        :
            null
        }

    }

    const deleteGroup = async() =>{
        users.map((a)=>userInfoDelete(a.uid)) //하나하나꺼내어 유저 안에 담긴 이 그룹 정보 삭제

        await deleteImageFromStorage(groupProfileName,"group_profile")
        await storeService().collection("group").doc(groupID).delete();
        const tempSave = await storeService().collection("users").doc(authService().currentUser.uid).get();
        await storeService().collection("users").doc(authService().currentUser.uid)
            .update({
                count_make_group : tempSave._data.count_make_group-1,
                make_groupID : tempSave._data.make_groupID.filter((a)=>a!==groupID)
            })
        console.log("삭제 완료")
        navigation.reset({routes:[{name:"main"}]}); //main페이지 새로고침 + 같은 stack이 아니면 이동 불가
        navigation.navigate("Tabs",{
            screen:"main"
        })
    }

    return(
        <>
            <InfoBox>
                <Text>비밀번호 입력:</Text>
                <TextInput type="text" value={password} placeholder="비밀번호" onChangeText={setPassword}/>
            </InfoBox>
            <DeleteBtnBox onPress={deleteGroup}>
                <Text>그룹 삭제</Text>
            </DeleteBtnBox>
        </>
    )
}

export default GroupDelete;