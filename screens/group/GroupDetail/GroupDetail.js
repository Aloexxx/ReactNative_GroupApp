import React, { useEffect } from "react";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Home from './Home';
import Photo from "./Photo";
import Board from "./Board";
import { useNavigation } from "@react-navigation/core";


const Tab = createMaterialTopTabNavigator();

const GroupDetail=({route:{params:{groupID,groupName,user}}})=> {
  const navigation = useNavigation();

  useEffect(()=>{
    navigation.setOptions({
      headerTitle:groupName
    })
  },[])

  return (
    <Tab.Navigator screenOptions={{tabBarPressColor:"blue"}}>
      <Tab.Screen name="home">{()=><Home groupID={groupID} groupName={groupName} user={user}/>}</Tab.Screen>
      <Tab.Screen name="photo">{()=><Photo groupID={groupID} groupName={groupName} user={user}/>}</Tab.Screen>
      <Tab.Screen name="board">{()=><Board groupID={groupID} groupName={groupName} user={user}/>}</Tab.Screen>
    </Tab.Navigator>
  );
}

export default GroupDetail;