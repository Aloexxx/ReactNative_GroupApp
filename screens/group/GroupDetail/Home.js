import { useNavigation } from "@react-navigation/core";
import React, { useEffect, useState } from "react";
import { Text, View ,TouchableOpacity, Image, ScrollView,Dimensions, Alert} from "react-native";
import styled from "styled-components";
import { authService, storeService } from "../../../fBase";
import TouchToUserDetail from "../../../components/TouchToUserDetail";
import Icon from "react-native-vector-icons/Ionicons";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Container = styled.View`
    flex:1;
    border-radius:15px;
    align-items:center;
    justify-content:center;
    margin-top:60%;
    background-color:white;
`;

const ImageBox = styled.Image`
    position:absolute;
    top:0;
`;

const TextBox = styled.Text`
    padding:10px;
    margin:5px;
    width:80%;
    font-size:15px;
    color:#8c8c8c;
    text-align:center;
`;

const GroupJoinBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    border-radius:10px;
    padding:10px;
    margin:5px;
    width:80%;
    align-items:center;
`;

const GroupJoinBtn = styled.Text`
    font-size:12px;
    font-weight:700;
    color:purple;
`;
const GroupReviseBtnBox = styled.TouchableOpacity`
    border-radius:10px;
    padding:10px;
    margin:5px;
    width:80%;
    align-items:center;
    background-color:beige;
    elevation:2;
`;

const GroupReviseBtn = styled.Text`
    font-size:10px;
    font-weight:700;
    color:blue;
`;

const ChatBtnBox = styled.TouchableOpacity`
    background-color:beige;
    elevation:2;
    position:absolute;
    border-radius:25px;
    height:50px;
    width:50px;
    right:15px;
    bottom:15px;
    justify-content:center;
    align-items:center;
`;

const Home = ({groupID,groupName,user}) =>{
    const navigation = useNavigation();

    const [group,setGroup] = useState("");
    const [saveUser,setSaveUser] = useState([])
    const [loading,setLoading] = useState(false);

    const getGroup=async()=>{
        setLoading(false);

        setSaveUser(()=>[])
        const tempSave = await storeService().collection("group").doc(`${groupID}`).get()
        setGroup(tempSave._data);
        tempSave._data.usersID_inGroup.map((userId)=>getUser(userId.uid))

        setLoading(true);
    }

    const getUser = async(userId) =>{
        const tempSave = await storeService().collection("users").doc(userId).get();
        setSaveUser((prev)=>[...prev,tempSave._data])
    }

    useEffect(()=>{
        getGroup()
    },[])
    //scrollView는 투명색 박스 이다. 그안에 container를 주고 container의 top을 image 길이만큼 띄우면 position이 absolute인 image 가보인다.
    //ImageBox위에 View를 준이유는 backgroundColor를 주기위해서이다.(absolute를 안주면 그만큼 scrollView가 아래로 밀린다.)
    return(
        loading?
        <>
            <View style={{position:"absolute",width:"100%",height:"100%",backgroundColor:"white"}}> 
                <ImageBox source={{uri:group.profileImage_URL}} style={{width:windowWidth,height:windowHeight/3}} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Container>
                    <TextBox>{group.groupName}</TextBox>
                    <TextBox>{group.groupIntro}</TextBox>
                    <View style={{width:"80%"}}>
                        <Text>유저({group.count_users})</Text>
                        {saveUser.map((item,index)=>(
                            <TouchToUserDetail key={`${index}${Date.now()}`} item={item} index={index} createdByUid={group.createdBy_uid}/>
                        ))}
                    </View>
                    {//some은 배열에 특정 값이 있는지 없는지 boolean반환. 객체를 찾을 때 유용하다.
                     //includes는 객체를 찾지 못함.
                    !user||!group.usersID_inGroup.some((a)=>a.uid===authService().currentUser.uid)?  
                        <GroupJoinBtnBox onPress={
                            user?
                            ()=>navigation.navigate("GroupJoin",{
                                groupID:group.groupID
                            })
                        :
                            ()=>Alert.alert("로그인을 해주세요")
                        }>
                            <GroupJoinBtn>그룹가입</GroupJoinBtn>
                        </GroupJoinBtnBox>
                        :
                        null
                    }
                    {user? authService().currentUser.uid === group.createdBy_uid ? 
                        <>
                            <GroupReviseBtnBox onPress={()=>navigation.navigate("GroupRevise",{
                                groupID:group.groupID,
                                groupName:group.groupName,
                                groupProfile:group.profileImage_URL,
                                groupProfile_fileName:group.profileImage_fileName
                            })}>
                                <GroupReviseBtn>그룹 수정</GroupReviseBtn>
                            </GroupReviseBtnBox>
                            <GroupReviseBtnBox onPress={()=>navigation.navigate("GroupDelete",{
                                groupID,
                                groupName:group.groupName,
                                groupProfileName:group.profileImage_fileName
                            })}>
                                <Text style={{color:"red",fontSize:10}}>그룹 삭제</Text>
                            </GroupReviseBtnBox>
                        </>
                        :null
                    :null}
                </Container>
            </ScrollView>
            <ChatBtnBox onPress={()=>navigation.navigate("GroupChat",{
                group,
                groupID,
                groupName,
                user
            })}>
                {group.groupChatCheck.includes(authService().currentUser.uid)?
                    <Text>🧡</Text>
                :
                    null
                }
                <Icon name="chatbubble-ellipses-outline" size={25}/>
            </ChatBtnBox>
        </>
        :
        <Text>Loading...</Text>
    )
};

export default Home;