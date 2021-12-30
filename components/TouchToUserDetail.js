import React from "react";
import styled from "styled-components";
import  Icon  from "react-native-vector-icons/MaterialCommunityIcons";
import { Image, View } from "react-native";

const UserList = styled.View`
    flex-direction:row;
    margin: 10px 0px;
`;

const UserName = styled.Text`
    padding:10px;
    margin:5px;
    text-align:center;
`;

const TouchToUserDetail = ({item,index,createdByUid})=>{
    return (
        <View>
            <UserList>
                <Image source={{uri:item.user_profileURL}} style={{width:50,height:50,borderRadius:25}}/>
                <UserName>{item.user_displayName}</UserName>
            </UserList>
            {item.user_uid===createdByUid?<Icon name="chess-queen" size={20} color={"black"} style={{position:"absolute",top:8}}/>:null}
        </View>
    )
}

export default TouchToUserDetail;