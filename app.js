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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore and Authentication
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const agendaInput = document.getElementById('agendaItem'); // Input field for adding a new agenda item
const addItemButton = document.getElementById('addItem');  // Button to add a new item to the list
const agendaList = document.getElementById('agendaList');  // Unordered list to display agenda items
const emailInput = document.getElementById('email');       // Input field for the user's email
const passwordInput = document.getElementById('password'); // Input field for the user's password
const loginButton = document.getElementById('login');      // Button for logging in the user
const signupButton = document.getElementById('signup');    // Button for signing up a new user
const logoutButton = document.getElementById('logout');    // Button for logging out the user

// Authentication Functions

// Sign up a new user using email and password
signupButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User signed up:', userCredential.user);
        })
        .catch(error => {
            console.error('Sign Up Error:', error.message);
        });
});

// Log in an existing user using email and password
loginButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User logged in:', userCredential.user);
            loadUserItems(); // Load the user's items when logged in
        })
        .catch(error => {
            console.error('Login Error:', error.message);
        });
});

// Log out the current user
logoutButton.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            console.log('User logged out');
            agendaList.innerHTML = ''; // Clear the agenda list on logout
        })
        .catch(error => {
            console.error('Logout Error:', error.message);
        });
});

// Real-time Authentication Listener
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('User logged in:', user.email);
        logoutButton.style.display = 'block'; // Show the logout button
        loadUserItems(); // Load the items for the authenticated user
    } else {
        console.log('User logged out');
        logoutButton.style.display = 'none'; // Hide the logout button
    }
});

// Add a new agenda item to Firestore
addItemButton.addEventListener('click', () => {
    const agendaText = agendaInput.value.trim();
    
    // Log to ensure the function is being called
    console.log('Add item button clicked, agendaText:', agendaText);

    if (agendaText && auth.currentUser) {
        db.collection('agendaItems').add({
            text: agendaText,
            userId: auth.currentUser.uid, // Store the user's UID in the document
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log('Agenda item added successfully');
            agendaInput.value = ''; // Clear the input field
        })
        .catch(error => {
            console.error('Error adding item:', error.message);
        });
    } else {
        if (!agendaText) {
            console.error('Agenda input is empty');
        }
        if (!auth.currentUser) {
            console.error('User is not authenticated');
        }
    }
});

// Load items belonging to the currently logged-in user
function loadUserItems() {
    if (!auth.currentUser) return;

    // Get all agenda items, regardless of the user
    db.collection('agendaItems').orderBy('timestamp')
    .onSnapshot(snapshot => {
        agendaList.innerHTML = ''; // Clear the current list
        snapshot.forEach(doc => {
            const agendaItem = document.createElement('li');
            agendaItem.textContent = doc.data().text;
            agendaList.appendChild(agendaItem);
        });
    });
}


//Hiding and Showing up of the buttons
auth.onAuthStateChanged(user => {
    if(user)
    {
        console.log('User logged in: ',user.email);
        logoutButton.style.display='block';
        loginButton.style.display='none';
        signupButton.style.display='none';
        emailInput.style.display='none';
        passwordInput.style.display='none';
        loadUserItems();
    }
    else
    {
        console.log('User logged out');
        logoutButton.style.display='none';
        loginButton.style.display='block';
        signupButton.style.display='block';
        emailInput.style.display='block';
        passwordInput.style.display='block';
        agendaList,innerHTML='';
    }
});













/* Testing Firestore write
db.collection('testCollection').add({   
    testField: 'testValue'
})
.then(() => {
    console.log('Test document added successfully');
})
.catch((error) => {
    console.error('Error adding test document:', error.message);
});
*/ 