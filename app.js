//Linking the backend with Firebase. We'll use Firestone database and authentication service from FireBade

//Firebase confi
const firebaseConfig = {
    apiKey: "AIzaSyAOfQSE2aEqPAx5hTgOhJMTCDZEsc3gPK4",
    authDomain: "taskslate-82955.firebaseapp.com",
    projectId: "taskslate-82955",
    storageBucket: "taskslate-82955.appspot.com",
    messagingSenderId: "798578522594",
    appId: "1:798578522594:web:335b09cc037b62f7d2e1bb",
    measurementId: "G-EN5LHF07W8"
  };

//Initialzing Firebase
firebaseConfig.initializeApp(firebaseConfig);

//Initializing Firestone Database and User Authencitication
const db=firebase.firestone; //Databsee
const auth=firebase.auth; //User ki pehchan baazi

//Receiving authentication data from frontend to do "Jaach Padtal" and make sure "user alsi ha"
const agendaInput = document.getElementById('agendaItem'); 
const addItemButton = document.getElementById('addItem');  
const agendaList = document.getElementById('agendaList');  
const emailInput = document.getElementById('email');       
const passwordInput = document.getElementById('password'); 
const loginButton = document.getElementById('login');      
const signupButton = document.getElementById('signup');    
const logoutButton = document.getElementById('logout');    


//Sign Up function
signupButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password=passwordInput.value;
    auth.createUserWithEmailAndPassword(email,password)
        .then((userCredential)=> {
            console.log('User Signed Up', userCredential.user)
        })
        .catch(error => {
            console.log('Sign Up Error!', error.message)
        }); 
});

//Login Function
loginButton.addEventListener('click', ()=> {
    const email = emailInput.value;
    const password=passwordInput.value;
    auth.SignInWithEmailAndPassword(email,password)
        .then((userCredential)=> {
            console.log('User logged in', userCredential.user)
        })
        .catch(error => {
            console.log('Error logging in', error.message)
        });
});

//Real TIme authentication
auth.onAuthStateChanged(user => {
    if(user) {
        console.log('User logged in: ', user.email);
        logoutButton.style.display='block'; //Showing logout button
    }
    else
    {
        console.log('User logged out');
        logoutButton.style.display='none'; //Hiding logout button
    }
});

//Adding new items to firestone
addItemButton.addEventListener('click', () =>{
    const agendaText = agendaInput.value.trim(); //Getting the input and removing any extra spaces at both ends
    if(agendaText)
    {
        db.collection('agendaItems').add({
            text:  agendaText,
            timestamp: firebase.firestone.FieldValue.serverTimestamp()//Add a time stamp to the document 
        });
        agendaInput.value='';//Clearing the input field 
    }
});

// Real-time Listener for Agenda Items
// This listener updates the UI with the latest agenda items from Firestore
db.collection('agendaItems').orderBy('timestamp').onSnapshot(snapshot => {
    agendaList.innerHTML = ''; // Clear the current list
    snapshot.forEach(doc => {
        const agendaItem = document.createElement('li'); // Create a new list item
        agendaItem.textContent = doc.data().text; // Set the text of the list item
        agendaList.appendChild(agendaItem); // Add the list item to the unordered list
    });
});