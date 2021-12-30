import React, { useEffect, useState } from "react";
import { Image, Text, View, RefreshControl } from "react-native";
import {authService,storeService} from "../../fBase";
import styled from "styled-components";
import { useNavigation } from "@react-navigation/core";
import { ScrollView } from "react-native-gesture-handler";
import TouchToGroupDetail from "../../components/TouchToGroupDetail";

const Container = styled.View`
    flex:1;
    justify-content:center;
    align-items:center;
`;

const LoginPageBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    border-radius:20px;
    align-items:center;
    padding:10px;
    width:80%;
`;

const group = ({user}) =>{
    const navigation=useNavigation();

    //useState를 사용하면 useEffect를 두번 불러와야 들어간 값이 반영된다.(그냥 변수를 사용하는게 더 좋을 때 가 있음.)
    //** useState는 string,boolean,number 같은 원시타입은 즉각반응 하지만 object,특히"array" 와같은 참조 타입은 사용이 까다롭다.
    //바로 바뀔때가 있고 안바뀔때가 있다.(랜덤)
    // setUseState((prev)=>[...prev,new]) 와같이 함수형으로 써야 바로 초기화 가된다.
    //setUseState() 처럼하면 두번 랜더링 해줘야 하는 현상 발생
    const [groupLoading,setGroupLoading] = useState(false);
    const [joinGroupSave,setJoinGroupSave] = useState([]);
    const [makeGroupSave,setMakeGroupSave] = useState([]);
    const [refreshing,setRefreshing] = useState(false);

    useEffect(()=>{
        user?
            getGroup()
        :setGroupLoading(false)
    },[user]) //false true 두번 로딩 (setGroupJoin 이 끝나기 전에 groupJoin과 setGroupLoading이 먼저 실행되는 현상 발생)

    const getGroup = async()=>{
        setMakeGroupSave(()=>[]); // 초기화 하지 않으면 새로고침마다 같은 그룹을 재 랜더링 한다. (setSave([])는 초기화가 되지 않음.)
        setJoinGroupSave(()=>[]); 
        const makeAndJoinGroup = await storeService().collection("users").doc(authService().currentUser.uid).get();
        const joinGroup = makeAndJoinGroup._data.join_groupID
        const makeGroup = makeAndJoinGroup._data.make_groupID
        joinGroup.map(a=>saveJoin(a)); //groupJoin을 useState로 만들어 불러오면 setGroupJoin 이 되기전에 가장 먼저 실행돼 null 이나타난다.(.then함수도 먹히지 않음.)
        makeGroup.map(a=>saveMake(a));

        setGroupLoading(true);
    }

    const saveMake=async(a)=>{
        const i = await storeService().collection("group").doc(a).get();
        return(
            setMakeGroupSave(save=>[...save,i])
        )
    }

    const saveJoin=async(a)=>{
        const i = await storeService().collection("group").doc(a).get();
        return(
            setJoinGroupSave(save=>[...save,i]) //setSave([...save,i])를 하게되면 i만 저장 하게되어서 결국 하나만 남는다.
        )
    }

    const onRefresh = async() =>{
        setRefreshing(true);
        getGroup();
        setRefreshing(false);
    }

    //return문 안에서는 async를 이용해서 컴포넌트 불러오기 불가.(return문 안에서 불러온 함수도 마찬가지)
    return(
            groupLoading?
                <ScrollView style={{backgroundColor:"white"}} refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }>
                    <Text style={{fontSize:16,padding:10,color:"black"}}>내가만든 그룹</Text>
                    {makeGroupSave[0]?
                        makeGroupSave.map((item,index)=>
                            <View key={`${index}`}>
                                <TouchToGroupDetail user={user} item={item}/>
                            </View>
                        )
                    :
                        <Text>no group</Text>}
                    <Text style={{fontSize:16,padding:10,color:"black"}}>내가참여한 그룹</Text>
                    {joinGroupSave[0]?
                        joinGroupSave.map((item,index)=>
                            <View key={`${index}`}>
                                <TouchToGroupDetail user={user} item={item}/>
                            </View>
                        )
                    :
                        <Text>no group</Text>}
                </ScrollView>
            : user?
            <Text>Loading...</Text>
            : 
            <Container> 
                <LoginPageBtnBox onPress={()=>navigation.navigate("Stacks",{
                    screen:"login"
                })}>
                    <Text>Go To Login</Text>
                </LoginPageBtnBox>
            </Container>
                )
            }
            
            export default group;