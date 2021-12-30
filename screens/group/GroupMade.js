import { useNavigation } from "@react-navigation/core";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, TextInput, TouchableOpacity } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import uuid from "react-native-uuid";
import styled from "styled-components";
import { authService, storeService,storageService, saveImageToStorage, getImageURLFromStorage } from "../../fBase";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Container = styled.View`
    justify-content:center;
    align-items:center;
    flex:1;
`;

const TagContainer = styled.View`
    justify-content:center;
    align-items:center;
    
`;

const TagBox = styled.View`
    flex-direction:row;
    justify-content:center;
    align-items:center;
`;

const TagBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    border-radius:5px;
    margin:5px;
    padding:3px;
    background-color:${(props)=>props.selected?"black":"white"};
`;

const TagBtn = styled.Text`
    font-size:15px;
    font-weight:300;
    color:#ff8000;

`;

const AddImageBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    width:80%;
    padding:10px;
    margin:5px;
    justify-content:center;
    align-items:center;
    border-radius:30px;
`;

const AddImageBtn = styled.Text`
    font-size:15px;
    font-weight:600;
    color:purple;
`;



const NextPageBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    width:80%;
    padding:10px;
    margin:5px;
    justify-content:center;
    align-items:center;
    border-radius:30px;
    `;

const NextPageBtn = styled.Text`
    font-size:15px;
    font-weight:600;
    color:blue;
    `;

const SubmitBtnBox = styled.TouchableOpacity`
    border:1px solid black;
    width:80%;
    padding:10px;
    margin:5px;
    justify-content:center;
    align-items:center;
    border-radius:30px;
`;

const SubmitBtn = styled.Text`
    font-size:15px;
    font-weight:600;
    color:purple;
`;
const TagPage = ({route:{params:{currentUser}}}) =>{

    const navigation = useNavigation();
    
    const [page,setPage] = useState("namePage");
    const [groupName,setGroupName] = useState("");
    const [groupIntro,setGroupIntro] = useState("");
    const [groupTag,setGroupTag] = useState([]);
    const [image,setImage] = useState("");
    const [loading,setLoading] = useState(false);

    const onSubmit = async() =>{
        setLoading(true);
        const groupID = uuid.v4();
        //groupName 확인
        if(groupName==="") return Alert.alert("Please complete form.");
        //image 파일 storage에 저장
        image? await saveImageToStorage(image.fileName,image.Uri,"group_profile"):console.log("image null")
        //firestore에 그룹 생성
        await storeService().collection("group").doc(`${groupID}`).set({
            groupName,
            groupIntro,
            groupID,
            groupTags:groupTag,
            groupChat:[],
            groupChatCheck:[],
            groupBoard:[],
            count_users:1,
            createdAt:Date.now(),
            createdBy_displayName:authService().currentUser.displayName,
            createdBy_uid:authService().currentUser.uid,
            usersID_inGroup:[{uid:authService().currentUser.uid,}],
            profileImage_fileName:image ? image.fileName:"",
            profileImage_URL:image ? await getImageURLFromStorage(image.fileName,"group_profile"):""
        })
        //유저 정보에 그룹을 만든사실 저장
        await storeService().collection("users").doc(currentUser.user_uid)
            .update({
                make_groupID : [...currentUser.make_groupID,groupID],
                count_make_group : currentUser.count_make_group+1
            });
        navigation.reset({routes:[{name:"main"}]}); //main새로고침
        setLoading(false);
        navigation.navigate("Tabs",{
            screen:"main"
        }); //뒤로이동
    };
    
    const addImage = async () =>{ //휴대폰의 이미지를 useState에 저장
        await launchImageLibrary({maxWidth:400,maxHeight:400,includeBase64:true},response=>{ //핸드폰 내의 파일 접근 후 불러오기
            if(response.didCancel){ //도중에 뒤로가기를 누를 시
                console.log("user cancel")
            }else{
                setImage({fileName:response.assets[0].fileName,Uri:response.assets[0].uri})
            }
        }).then((a)=>console.log("setImage")); //.then(바로 storage저장)을 하면 setImage가 되기전에 image useState 가전달이되어서 초기에는 ""값 그후에는 그전에 올린 사진이 firestore에 올라간다.
        //결론 : useState는 즉시 업데이트 되지 않는다.(?)
    }

    const pressBackBtn = () =>{
        switch(page){
            case "namePage":
                return navigation.goBack();
            case "introPage":
                return setPage("namePage");
            case "tagPage":
                return setPage("introPage");
            case "imagePage":
                return setPage("tagPage");
            case "submitPage":
                return setPage("imagePage");
            default:
                return null;
        }
    }

    useEffect(()=>{
        navigation.setOptions({
            headerLeft:()=>
            <TouchableOpacity onPress={pressBackBtn}>
                <Icon name="arrow-left" size={25} color="black"/>
            </TouchableOpacity>
        })
    },[page]) //[]로하면 page의 값이 "namepage"로 고정이 되어버린다.(처음 한번만 실행되기 때문에)

    const pressTag = (tagKind)=>{
        const save = groupTag.includes(tagKind);
        return (save?
        setGroupTag(groupTag.filter(a=>a!==tagKind))
        :
        setGroupTag([...groupTag,tagKind]))
    }
    const tagList = ["streat","casual","workware","minimal","dandy","classic","amecazy"]

    return(
        <>
            {page==="namePage"?
                <Container>
                    <TextInput value={groupName} type="text" placeholder="groupTitle" onChangeText={setGroupName} autoCapitalize={"none"}/>
                    <NextPageBtnBox onPress={()=>setPage("introPage")}>
                            <NextPageBtn>Next</NextPageBtn>
                    </NextPageBtnBox>
                </Container> 
            :null}
            {page==="introPage"?
                <Container>
                    <TextInput value={groupIntro} type="text" placeholder="Write group introduction" onChangeText={setGroupIntro} autoCapitalize={"none"}/>
                    <NextPageBtnBox onPress={()=>setPage("tagPage")}>
                            <NextPageBtn>Next</NextPageBtn>
                    </NextPageBtnBox>
                </Container> 
            :null}
            {page==="tagPage"?
                <Container>
                <TagContainer>
                    {tagList.map((item,index)=>
                        <TagBtnBox key={index} onPress={()=>pressTag(item)} selected={groupTag.includes(item)}>
                            <TagBtn>{item}</TagBtn>
                        </TagBtnBox>
                    )}
                </TagContainer>
                <NextPageBtnBox onPress={()=>setPage("imagePage")}>
                        <NextPageBtn>Next</NextPageBtn>
                </NextPageBtnBox>
                </Container>
            :null}
            {page==="imagePage"? 
                <Container>
                    <AddImageBtnBox onPress={addImage}>
                        <AddImageBtn>Add Image</AddImageBtn>
                    </AddImageBtnBox>
                    {image?(<Image source={{uri:image.Uri}} style={{width:100,height:100}}/>):null}
                    <NextPageBtnBox onPress={()=>setPage("submitPage")}>
                        <NextPageBtn>Next</NextPageBtn>
                    </NextPageBtnBox>
                </Container> 
            :null}
            {page==="submitPage"? 
                <Container>
                    <SubmitBtnBox onPress={onSubmit}>
                        {loading?<ActivityIndicator size="small" color="balck"/>:<SubmitBtn>Submit</SubmitBtn>}
                    </SubmitBtnBox>
                </Container>
            :null}
        </>
    )
}

export default TagPage;