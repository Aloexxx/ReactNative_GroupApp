import React, { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { storeService } from "../../../fBase";

const Photo = ({groupID, groupName, user}) =>{
    const [group,setGroup] = useState();

    const getGroup = async()=>{
        const save = await storeService().collection("group").doc(groupID).get();
        setGroup(save._data);
    }

    useEffect(()=>{
        getGroup();
    },[])

    return(
       <View>
           {group?group.groupBoard.map((a,index)=><Image key={index} source={{uri:a.imageURL}} style={{width:100,height:100}}/>):null}
       </View>
    )
}
export default Photo;