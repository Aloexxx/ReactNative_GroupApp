import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import Root from "./navigators/Root"
import { DBContext } from "./context";
import { authService } from "./fBase";


function App(){
  const [initializing,setInitializing] = useState(false);
  const [user,setUser] = useState(null);

  const onAuthStateChanged=(userObj)=>{ //유저의 로그인 로그아웃 여부는 authService().currentUser로는 실시간 반영이 되지 않는다.(지금 이 함수를 써야한다.)
    if(userObj){
      setUser(userObj)
    }else{
      setUser(null);
    }
    setInitializing(true);
  }

  useEffect(()=>{
    authService().onAuthStateChanged(onAuthStateChanged)
  },[])

  return(
    initializing?
    (
      <NavigationContainer>
        <Root user={Boolean(user)}/>
      </NavigationContainer>
      )
    :
    (<Text>Login...</Text>)
  )
}

export default App;
