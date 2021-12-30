import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import login from "../screens/user/Login";
import join from "../screens/user/Join";
import profile from "../screens/user/Profile";
import EditProfile from "../screens/user/EditProfile";
import GroupDetail from "../screens/group/GroupDetail/GroupDetail";
import GroupChat from "../screens/group/GroupChat";
import GroupJoin from "../screens/group/GroupJoin";
import GroupRevise from "../screens/group/GroupRevise";
import GroupMade from "../screens/group/GroupMade";
import GroupDelete from "../screens/group/GroupDelete";
import BoardMade from "../screens/group/GroupDetail/BoardMade";

const NativeStack = createNativeStackNavigator();

const Stack = ({user,route}) =>{
    return(
        <NativeStack.Navigator>
            <NativeStack.Screen name="login" component={login}/>
            <NativeStack.Screen name="join" component={join}/>
            <NativeStack.Screen name="profile" component={profile}/>
            <NativeStack.Screen name="editProfile" component={EditProfile}/>
            <NativeStack.Screen name="GroupMade" component={GroupMade} options={{headerBackVisible:false,headerTitleAlign:"center"}}/>
            <NativeStack.Screen name="GroupDetail" component={GroupDetail}/>
            <NativeStack.Screen name="GroupChat" component={GroupChat} options={{headerTitle:"채팅"}}/>
            <NativeStack.Screen name="GroupJoin" component={GroupJoin}/>
            <NativeStack.Screen name="GroupRevise" component={GroupRevise}/>
            <NativeStack.Screen name="GroupDelete" component={GroupDelete}/>
            <NativeStack.Screen name="BoardMade" component={BoardMade}/>
        </NativeStack.Navigator>
    )
}

export default Stack;