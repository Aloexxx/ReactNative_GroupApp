import React from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Main from "../screens/Tabs/Main";
import MyGroup from "../screens/Tabs/MyGroup";
import Ionicons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

const Tabs = ({user}) =>{
    return(
        <Tab.Navigator initialRouteName="main" screenOptions={{headerStyle:{backgroundColor:"white",elevation:0},tabBarStyle:{backgroundColor:"#fcfcf3"},tabBarShowLabel:false}}>
            <Tab.Screen name="main" options={{tabBarIcon:({focused,color,size})=>{
                return focused?<Ionicons name="home" color={"black"} size={30} />:<Ionicons name="home" color={color} size={size} />
            },headerTitleAlign:"center"}}>
                {()=><Main user={user}/>}
            </Tab.Screen>

            <Tab.Screen name="myGroup" options={{tabBarIcon:({focused,color,size})=>{ 
                return focused?<Ionicons name="account-group" color={"black"} size={30} />:<Ionicons name="account-group" color={color} size={size} />
            },headerTitleAlign:"center"}}>
                {()=><MyGroup user={user}/>}
            </Tab.Screen>
        </Tab.Navigator>
    )
}

export default Tabs;