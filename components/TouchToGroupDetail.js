import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Image } from "react-native";
import  Icon  from "react-native-vector-icons/MaterialCommunityIcons";
import styled from "styled-components";
import { authService } from "../fBase";

const GroupTouch = styled.TouchableOpacity`
    background-color:#fcfcf3;
    border-radius:3px;
    margin:8px;
    flex-direction:row;
    elevation:2;
`;
const GroupName = styled.Text`
    color:black;
    font-size:17px;
    margin:10px;
`;

const TouchToGroupDetail = ({user,item})=>{
    const navigation = useNavigation();
    return (
        <GroupTouch onPress={()=>navigation.navigate("Stacks",{
            screen:"GroupDetail",
            params:{
                user,
                groupID:item._data.groupID,
                groupName:item._data.groupName,
                groupProfile:item._data.profileImage_URL
            }
        })}>
            {item._data.profileImage_URL?
                <Image source={{uri:item._data.profileImage_URL}} style={{width:80,height:80,borderRadius:3}}/>
            :null}
            <GroupName>{item._data.groupName}</GroupName>
            {user?
            <>
                {authService().currentUser.uid === item._data.createdBy_uid? 
                <Icon name="chess-queen" size={20} color={"black"} style={{marginTop:10}}/>
                :null}
            </>
            :null}
        </GroupTouch>
    )
}

export default TouchToGroupDetail;