import React from "react";
import Tabs from "./Tabs";
import Stacks from "./Stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Nav = createNativeStackNavigator();

//<>{}</>이런식으로 쓰면 navigate를 통해 params를 보낼때 경로를 다써줘야 한다.( </>이런 식은 저절로 넘어감. )
const Root=({user})=>(
    <Nav.Navigator screenOptions={{headerShown:false}}>
        <Nav.Screen name="Tabs">{()=><Tabs user={user}/>}</Nav.Screen>
        <Nav.Screen name="Stacks">{()=><Stacks user={user}/>}</Nav.Screen>
    </Nav.Navigator>
)

export default Root;