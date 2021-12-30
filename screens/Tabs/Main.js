import React, { useEffect, useState } from "react";
import { Text,View,TouchableOpacity, Image, ScrollView, RefreshControl } from "react-native";
import styled from "styled-components";
import { useNavigation } from "@react-navigation/core";
import { authService, storeService } from "../../fBase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TouchToGroupDetail from "../../components/TouchToGroupDetail";

const Search = styled.TextInput`
    background-color:#fcfcf3;
    border-radius:12px;
    margin:8px;
    padding:7px;
    elevation:2;
`;

const MakeGroupBtnBox = styled.TouchableOpacity`
    position:absolute;
    width:50px;
    height:50px;
    border-radius:25px;
    justify-content:center;
    align-items:center;
    bottom:15px;
    right:15px;
    background-color:#fcfcf3;
    elevation:3;
`;

const main = ({user}) => { //user는 로그인 로그아웃 여부만 체크해준다.
    const navigation = useNavigation();
    const [group,setGroup] = useState();
    const [refreshing,setRefreshing] = useState(false);
    const [currentUser,setCurrentUser] = useState(null);
    const [searchText,setSearchText] = useState("");

    const dataRead = async() =>{ //firestore에서 데이터 가져오기
        const groups = await storeService().collection("group").orderBy("createdAt","desc").get();
        setGroup(groups._docs)
    }

    const userRead = async ()=>{
        const tempSave = authService().currentUser.uid
        const saveUser = await storeService().collection("users").doc(tempSave).get()
        setCurrentUser(()=>saveUser._data);
    }

    useEffect(()=>{
        console.log(authService().currentUser)
        dataRead()
    },[])
    //useEffect는 []안의 조건이 변경될때 에만 실행되기 때문에 실시간으로 바뀌지 않을 수 가 있다.
    //ex)유저의 사진이 로딩이 끝났는데 useEffect는 더이상 실행되지 않아 사진이 계속 안올라가지는 현상.
    useEffect(()=>{
        //유저가 로그인 된 경우에만
        {user?userRead():setCurrentUser(null)}
        {user? 
            navigation.setOptions({
                headerRight:()=>(
                    <TouchableOpacity style={{marginRight:10}} 
                    hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}  //터치 영역 확장
                    onPress={()=>navigation.navigate("Stacks",{
                        screen:"profile",
                        params:{user}
                    })}>
                        <Icon name="account" size={21} color="black"/>
                    </TouchableOpacity>),
                // headerLeft:()=><Text style={{paddingLeft:10}}>{authService().currentUser.displayName}</Text> //로그아웃을 해도 authService()가 자동실행 오류발생
                //추측: header부분은 return안에있는 JSX와 달리 다른 Tab에 있어도 계속 렌더링 돼있는 상태이다.->logout을 해도 authService()가 실행이되어서 오류발생
                //main을 재시작하면 다시재 렌더링되어서 user=true부분을 건드리지 않아서 정상 실행.
            })
        :   navigation.setOptions({
            headerRight:()=>(<TouchableOpacity style={{marginRight:10}} onPress={()=>navigation.navigate("Stacks",{screen:"login"})}><Text>Login</Text></TouchableOpacity>)
            })
        }
    },[user])

    const onRefresh = async() =>{
        setRefreshing(true);
        dataRead();
        setRefreshing(false);
    }

    const onSearch = async(text)=>{
        if(text===""){
            dataRead();
        }
        setSearchText(text)

        const searchGroups = await storeService().collection("group").where("groupName","==",text).get()

        if(searchGroups._docs[0]){
            setGroup(()=>searchGroups._docs)
        }
    }
    return(
        <>
            <ScrollView 
            refreshControl={
                <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}/>} 
            style={{backgroundColor:"white"}}>
                    <View>
                        <Search autoCapitalize={"none"} value={searchText} placeholder="검색" onChangeText={(a)=>onSearch(a)}/>
                        {group?group.map((item,index)=><TouchToGroupDetail key={index} user={user} item={item}/>):null}
                    </View>
            </ScrollView>
            {user?
                <MakeGroupBtnBox onPress={()=>navigation.navigate("Stacks",{
                    screen:"GroupMade",
                    params:{
                        currentUser
                    }
                })}>
                        <Icon name="account-group" size={30} color="black"/>
                </MakeGroupBtnBox>
            :
                null
            }
        </>
    )
}

export default main;