//Linking the backend with Firebase.

//Firebase confi
const firebaseConfig = {
    apiKey: "*",
    authDomain: "*",
    projectId: "*",
    storageBucket: "*,
    messagingSenderId: "*",
    appId: "*",
    measurementId: "*"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const agendaInput = document.getElementById('agendaItem');
const addItemButton = document.getElementById('addItem');
const agendaList = document.getElementById('agendaList');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login');
const signupButton = document.getElementById('signup');
const logoutButton = document.getElementById('logout');
const listNameInput = document.getElementById('listName');
const createListButton = document.getElementById('createList');
const sharedListSelect = document.getElementById('sharedListSelect');
const collaboratorEmailInput = document.getElementById('collaboratorEmail');
const collaboratorPermissionSelect = document.getElementById('collaboratorPermission');
const inviteCollaboratorButton = document.getElementById('inviteCollaborator');
const errorMessage = document.getElementById('errorMessage');

let currentListId = ''; // Track the selected list

// Function to display error messages
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block'; // Show the error message
    setTimeout(() => {
        errorMessage.style.display = 'none'; // Hide after 3 seconds
    }, 3000);
}

// Authentication Functions
signupButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User signed up:', userCredential.user);
            errorMessage.style.display = 'none'; // Hide error message on success
        })
        .catch(error => {
            console.error('Sign Up Error:', error.message);
            showError(error.message); // Display the error message
        });
});

loginButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User logged in:', userCredential.user);
            errorMessage.style.display = 'none'; // Hide error message on success
            loadSharedLists(); // Load the user's shared lists upon login
        })
        .catch(error => {
            console.error('Login Error:', error.message);
            showError(error.message); // Display the error message
        });
});

logoutButton.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            console.log('User logged out');
            agendaList.innerHTML = ''; // Clear the agenda list on logout
            sharedListSelect.innerHTML = '<option value="" disabled selected>Select a list</option>';
        })
        .catch(error => {
            console.error('Logout Error:', error.message);
            showError(error.message); // Display the error message
        });
});

// Real-time Authentication Listener
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('User logged in:', user.email);
        logoutButton.style.display = 'block';
        loginButton.style.display = 'none';
        signupButton.style.display = 'none';
        emailInput.style.display = 'none';
        passwordInput.style.display = 'none';
        document.querySelector('.shared-list-creation').style.display = 'block';
        document.querySelector('.shared-list-selection').style.display = 'block';
        document.querySelector('.agenda-input').style.display = 'block';
        document.querySelector('.invite-collaborators').style.display = 'block';
        loadSharedLists();
    } else {
        console.log('User logged out');
        logoutButton.style.display = 'none';
        loginButton.style.display = 'block';
        signupButton.style.display = 'block';
        emailInput.style.display = 'block';
        passwordInput.style.display = 'block';
        document.querySelector('.shared-list-creation').style.display = 'none';
        document.querySelector('.shared-list-selection').style.display = 'none';
        document.querySelector('.agenda-input').style.display = 'none';
        document.querySelector('.invite-collaborators').style.display = 'none';
    }
});

// Create a new shared list
createListButton.addEventListener('click', () => {
    const listName = listNameInput.value.trim();
    const ownerEmail = auth.currentUser.email;

    if (auth.currentUser && listName) {
        db.collection('sharedLists').add({
            name: listName,
            owner: auth.currentUser.uid,
            collaborators: [{ email: ownerEmail, permission: 'edit' }], // Owner has edit permission
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then((docRef) => {
            console.log('Shared list created with ID:', docRef.id);
            loadSharedLists();
        })
        .catch(error => {
            console.error('Error creating shared list:', error.message);
            showError(error.message); 
        });
    } else {
        showError('Invalid list name or user not authenticated');
    }
});

// Load shared lists for the current user
function loadSharedLists() {
    if (!auth.currentUser) return;

    db.collection('sharedLists')
    .where('collaborators', 'array-contains', { email: auth.currentUser.email, permission: 'view' })
    .onSnapshot(snapshot => {
        sharedListSelect.innerHTML = '<option value="" disabled selected>Select a list</option>';
        snapshot.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.data().name;
            sharedListSelect.appendChild(option);
        });
    });
}

// Select a shared list
sharedListSelect.addEventListener('change', () => {
    currentListId = sharedListSelect.value;
    loadSharedListItems(currentListId);
    document.querySelector('.invite-collaborators').style.display = 'block'; 
});

// Load items from a specific shared list
function loadSharedListItems(listId) {
    if (!auth.currentUser) return;

    db.collection('sharedLists').doc(listId).collection('items').orderBy('timestamp')
    .onSnapshot(snapshot => {
        agendaList.innerHTML = ''; // Clear the current list
        snapshot.forEach(doc => {
            const agendaItem = document.createElement('li');
            agendaItem.textContent = doc.data().text;
            agendaList.appendChild(agendaItem);
        });
    });
}

// Add a new item to the selected shared list
addItemButton.addEventListener('click', () => {
    const agendaText = agendaInput.value.trim();

    if (auth.currentUser && currentListId) {
        checkPermissions(currentListId, auth.currentUser.email)
            .then(permission => {
                if (permission === 'edit') {
                    db.collection('sharedLists').doc(currentListId).collection('items').add({
                        text: agendaText,
                        userId: auth.currentUser.uid,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(() => {
                        console.log('Item added to shared list');
                        agendaInput.value = ''; // Clear the input field
                    })
                    .catch(error => {
                        console.error('Error adding item:', error.message);
                        showError(error.message); // Display error if adding item fails
                    });
                } else {
                    showError('You do not have permission to edit this list');
                }
            });
    } else {
        showError('Invalid input, user not authenticated, or no list selected');
    }
});

// Invite a collaborator
inviteCollaboratorButton.addEventListener('click', () => {
    const collaboratorEmail = collaboratorEmailInput.value.trim();
    const permission = collaboratorPermissionSelect.value; // 'view' or 'edit'

    if (auth.currentUser && currentListId && collaboratorEmail) {
        db.collection('sharedLists').doc(currentListId).update({
            collaborators: firebase.firestore.FieldValue.arrayUnion({ email: collaboratorEmail, permission: permission })
        })
        .then(() => {
            console.log('Collaborator invited successfully');
            collaboratorEmailInput.value = ''; // Clear the input field
        })
        .catch(error => {
            console.error('Error inviting collaborator:', error.message);
            showError(error.message); // Display error if inviting fails
        });
    } else {
        showError('Invalid input, user not authenticated, or no list selected');
    }
});

// Check permissions for the current user
function checkPermissions(listId, userEmail) {
    return db.collection('sharedLists').doc(listId).get()
        .then(doc => {
            if (doc.exists) {
                const collaborators = doc.data().collaborators || [];
                const collaborator = collaborators.find(c => c.email === userEmail);
                if (collaborator) {
                    return collaborator.permission; // Return 'view' or 'edit'
                }
            }
            return null; // Not a collaborator
        });
}



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
