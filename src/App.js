import React, { useState } from 'react';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig)

function App() {

  const [newUser, setNewUser] = useState(false)

  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email:'',
    photo: '',
    password: '',
  })

  // goggle provider

  const provider = new firebase.auth.GoogleAuthProvider();
  
  // fbprovider

  const fbProvider = new firebase.auth.FacebookAuthProvider();

  // handle sign in
  const handleSignIn = () => {

    firebase.auth().signInWithPopup( provider)
    .then(res=> {

      const {displayName, photoURL, email}= res.user;

      const signedInUser={
      isSignedIn: true,
      name: displayName, 
      email: email,
      photo: photoURL 

      } 
      setUser(signedInUser)
    })
    .catch (err=>{
      console.log(err);
      console.log(err.message);
    })

  }

  // handle sing out 
  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(res=>{
      const signedOutUser ={
        isSignedIn: false,
        newUser: false,
        name: '',
        photo: '',
        email: '',
        error: '', 
        password: '',
      }

      setUser(signedOutUser);
      
    })
    .catch(function(error) {
      
    });
    
  }
  
  // handle change event

  const handleBlur=(e)=>{
    let isFormValid = true

    if(e.target.name === 'email'){
      isFormValid =  /\S+@\S+\.\S+/.test(e.target.value);
      
    }
    if(e.target.name === 'password'){
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value)
      isFormValid = isPasswordValid && passwordHasNumber
    }
    if(isFormValid){
      // [...CaretPosition, newItem]
      const newUserInfo = {...user}
      newUserInfo[e.target.name]= e.target.value;
      setUser(newUserInfo)
    }

  }

  // handle submit

  const handleSubmit =(e) =>{
    // console.log(user.email,user.password)
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then (res=>{
        const newUserInfo = {...user}
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserName(user.name)
      })
      .catch(error =>{
        // Handle Errors here.
        const newUserInfo = {...user}
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo)
        // ...
      });

    }

    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(res=>{
        const newUserInfo = {...user}
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        console.log('sign in user info',res.user)

      })
      .catch(function(error) {
        // Handle Errors here.
        const newUserInfo = {...user}
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo)
        // ...
      });
    }
    e.preventDefault();

  }

  // update user information
  const updateUserName =(name)=>{
    const user = firebase.auth().currentUser;

      user.updateProfile({
        displayName: name,
       
      }).then(function() {
        console.log('user name updated successfully')
        // Update successful.
      }).catch(function(error) {
        // An error happened.
        console.log(error)
      });
  }

  // handle fb log in

  const handleFbLogIn = () =>{
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });

  }


  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign out</button> : <button onClick={handleSignIn}>Sign in</button>
        
      }
      <br/>
      <button onClick={handleFbLogIn}>Sign in using Facebook</button>
      {
        user.isSignedIn && 
        <div>
          <p>Welcome, {user.name}</p>
      <p>Your mail: {user.email}</p>
      <img src={user.photo} alt=""/>

        </div> 
      }

      {/* authentication */}

      <h1>Our own Authentication</h1>

       {/* sign up */}

      <input onChange={() =>setNewUser(!newUser)} name="newUser" type="checkbox"/>
        <label htmlFor="newUser">New User Sign Up</label>

       {/* form */}

      <form onSubmit={handleSubmit} action="">
       
        {newUser &&  <input onBlur={handleBlur} name="name" type="text" placeholder="Your Name"/>}
        <br/>

        <input onBlur={handleBlur} type="text" name='email' placeholder="Write your email address" required/>
        <br/>
        <input onBlur={handleBlur} type="password" name="password" placeholder='Your password' required/>
        <br/>
        <input type="submit" value={ newUser? 'Sign up' : 'Sign In'}/>

      </form>
    <p style={{color: 'red'}}>{user.error}</p>
    {user.success && <p style={{color: 'green'}}> User { newUser ? 'created' : 'Logged In'} successfully</p> }
      
    
    </div>
  );
}

export default App;
