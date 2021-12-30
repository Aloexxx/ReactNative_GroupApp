import { useNavigation } from "@react-navigation/core";
import React, { useEffect, useRef, useState } from "react";
import { TextInput, View, TouchableOpacity, Text,ScrollView, Image} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import styled from "styled-components";
import { authService, getImageURLFromStorage, saveImageToStorage, storeService } from "../../fBase";

const Container = styled.View`
    width:100%;
    height:100%;
    background-color:#fffff4;
`;

const ChattingBox = styled.ScrollView`
`;

const Chatting = styled.View`
    align-items:${(props)=>props.myChat?"flex-end":"flex-start"};
    width:100%;
    padding:5px;
`;

const ChattingImage = styled.Image`
    width:170px;
    height:170px;
    border-radius:5px;
    margin-top:5px;
`;

const ChattingText = styled.Text`
    font-size:20px;
    font-weight:500;
    border:0.15px solid black;
    border-radius:5px;
    padding:5px;
    margin-top:5px;
`;

const UserImage = styled.Image`
    width:30px;
    height:30px;
    border-radius:15px;
    margin-left:${(props)=>props.myChat?"5px":"0px"};
    margin-right:${(props)=>props.myChat?"0px":"5px"};
`;

const ChatBox = styled.View`
    flex-direction:row;
    justify-content:space-between;
    width:100%;
`;

const ImageBtnBox = styled.TouchableOpacity`

    justify-content:center;
    align-items:center;
    width:10%;
`;

const ChatInput = styled.TextInput`

    width:80%;
`;

const ChatBtnBox = styled.TouchableOpacity`

    justify-content:center;
    align-items:center;
    width:10%;
`;

const Chat = ({route:{params:{groupID,groupName,user}}}) =>{
    const navigation=useNavigation();
    const scrollRef = useRef();

    const [text,setText] = useState("");
    const [group,setGroup] = useState("");
    const [userInfo,setUserInfo] = useState("");
    const [image,setImage] = useState("");



    const onPress = async ()=>{
        if(!group._data.usersID_inGroup.some((a)=>a.uid===authService().currentUser.uid)){ //백엔드에서 한번 더 점검
            return;
        }
        image? await saveImageToStorage(image.fileName,image.Uri,"group_chat"):console.log("image null")
        let temp = await storeService().collection("group").doc(groupID).get()
        const tempSave = temp._data; //전송버튼 누르기전의 채팅 내역 저장
        
        await storeService().collection("group").doc(groupID).update({
            groupChatCheck:[...tempSave.usersID_inGroup.map(a=>a.uid)],
            groupChat:[...tempSave.groupChat,{
                text,
                userUID:authService().currentUser.uid,
                userName:authService().currentUser.displayName,
                chatImageFileName:image ? image.fileName:"",
                chatImageURL: image ? await getImageURLFromStorage(image.fileName,"group_chat"):"",
                chatUserImageURL: userInfo? userInfo._data.user_profileURL:null //chatting을 쓴 주인의 프로필 사진 저장
            }]
        })//채팅 서버에 업데이트

        temp = await storeService().collection("group").doc(groupID).get()
        setGroup(()=>temp);
        scrollToBottom();
        setText("");
    }
    const addImage = async () =>{ //휴대폰의 이미지를 useState에 저장
        await launchImageLibrary({maxWidth:400,maxHeight:400,includeBase64:true},response=>{ //핸드폰 내의 파일 접근 후 불러오기
            if(response.didCancel){ //도중에 뒤로가기를 누를 시
                console.log("user cancel")
            }else{
                setImage({fileName:response.assets[0].fileName,Uri:response.assets[0].uri})
            }
        }).then(()=>console.log("setImage")); //.then(바로 storage저장)을 하면 setImage가 되기전에 image useState 가전달이되어서 초기에는 ""값 그후에는 그전에 올린 사진이 firestore에 올라간다.
        //결론 : useState는 즉시 업데이트 되지 않는다.(?)
    }

    const getGroup = async()=>{
        const temp = await storeService().collection("group").doc(groupID).get();
        await storeService().collection("group").doc(groupID).update({
            groupChatCheck:[...temp._data.groupChatCheck.filter(a=>a!==authService().currentUser.uid)]
        }) 
        // storeService().collection("group").doc(groupID).onSnapshot((a)=>setGroup(()=>a))
        setGroup(()=>temp);
    }
    const getUser = async()=>{
        const temp = await storeService().collection("users").doc(authService().currentUser.uid).get();
        setUserInfo(()=>temp);
    }
    
    useEffect(()=>{ 
        user?getGroup():null;
        user?getUser():null;
        navigation.setOptions({
            headerStyle:{
                backgroundColor:"#fffff4",
                elevation:0,
            }
        })
    },[])

    
    const scrollToBottom = async()=>( //스크롤의 맨아래로 이동
        await scrollRef.current.scrollToEnd()
    )

    return(
        <>
            {user?
                <>
                    {group?
                        <>
                            {group._data.usersID_inGroup.some((a)=>a.uid===authService().currentUser.uid)?
                                <Container>
                                    <ChattingBox ref={scrollRef}>
                                        {group?group._data.groupChat.map((prev,index)=>
                                            <Chatting key={index} myChat={prev.userUID === authService().currentUser.uid}>
                                                <View style={{flexDirection:prev.userUID === authService().currentUser.uid?"row":"row-reverse"}}>
                                                    <View style={{alignItems:prev.userUID === authService().currentUser.uid?"flex-end":"flex-start"}}>
                                                        <Text style={{}}>{prev.userName}</Text>
                                                        {prev.chatImageURL?<ChattingImage source={{uri:prev.chatImageURL}}/>:null}
                                                        {prev.text?<ChattingText>{prev.text}</ChattingText>:null}
                                                    </View>
                                                    <UserImage source={{uri:prev.chatUserImageURL}} myChat={prev.userUID === authService().currentUser.uid}/>
                                                </View>
                                            </Chatting>
                                        ):console.log("none1")}
                                    </ChattingBox>
                                    <ChatBox>
                                        <ImageBtnBox onPress={addImage}>
                                            <Text>사진</Text>
                                        </ImageBtnBox>
                                        <ChatInput placeholder="채팅 입력" onChangeText={setText} value={text} onPressIn={()=>scrollToBottom()} multiline/>
                                        <ChatBtnBox onPress={onPress}>
                                            <Text>전송</Text>
                                        </ChatBtnBox>
                                    </ChatBox>
                                </Container>
                            :<Text>please Join</Text>}
                        </>
                    :<Text>Loading...</Text>}
                </>
            :<Text>please Login</Text>}
        </>
    )
}
export default Chat;