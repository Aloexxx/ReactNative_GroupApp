import { useNavigation } from "@react-navigation/core";
import React, { useEffect, useState } from "react";
import {Image, RefreshControl, Text,TouchableOpacity, View} from "react-native";
import styled from "styled-components";
import { authService, storeService } from "../../../fBase";

const MadeBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    border-radius:10px;
    padding:15px;
    justify-content:center;
    align-items:center;
    margin:5px;
`;

const BoardScroll = styled.ScrollView``;

const BoardBox = styled.View`
    flex-direction:row;
    justify-content:space-between;
    border:1px solid black;
    border-radius:10px;
    padding:10px;
    margin:5px;
`;

const Board =({groupID,groupName,user}) =>{
    const navigation= useNavigation();
    const [group,setGroup] = useState([]);
    const [refreshing,setRefreshing] = useState(false);

    const onRefresh = async() =>{
        setRefreshing(true)
        getGroup()
        setRefreshing(false)
    }

    const getGroup =async ()=>{
        const save = await storeService().collection("group").doc(groupID).get();
        setGroup(save._data)
    }
    
    useEffect(()=>{
        getGroup();
    },[])

    return(
        <>
            {user?
                <>
                    {group.usersID_inGroup? //그냥 group?으로 하게되면 무조건 true가된다.(group안에는 다른 객체도 존재)
                        <>
                            {group.usersID_inGroup.some((a)=>a.uid===authService().currentUser.uid)?
                                <MadeBtnBox onPress={()=>navigation.navigate("BoardMade",{groupID:groupID})}>
                                    <Text>게시물 작성</Text>
                                </MadeBtnBox>
                            :
                            null}
                        </>
                    :
                    null}
                </>
                :
            null}
            <BoardScroll refreshControl={
                <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                />
            }>
                {group.groupBoard? //group.groupBoard 라고만 하게되면 [] 값으로 존재함.
                    group.groupBoard.reverse().map((a,index)=>
                    <BoardBox key={index}>
                        <View>
                        <Text>{a.title}</Text>
                        <Text>{a.content}</Text>
                        <Text>{a.userName}</Text>
                        </View>
                        <Image source={{uri:a.imageURL}} style={{width:60,height:60}}/>
                    </BoardBox>)
                :
                    <Text>not Post</Text> 
                }
            </BoardScroll>
        </>
    );
}

export default Board;