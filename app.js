// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Configuration ---
    // IMPORTANT: Replace with your actual Firebase project configuration
    const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // --- Quill Editor Initialization ---
    const toolbarOptions = [
  [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }, { 'align': [] }],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video'],
  ['clean']
];


    const quill = new Quill('#editor-container', {
  modules: { 
    toolbar: toolbarOptions,
    clipboard: {
      matchVisual: false
    }
  },
  placeholder: 'Compose your content...',
  theme: 'snow'
});

// Add image handler
quill.getModule('toolbar').addHandler('image', () => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();
  
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    
    try {
      // In a real app, you would upload to Firebase Storage
      // For demo, we'll just use a placeholder
      const range = quill.getSelection();
      quill.insertEmbed(range.index, 'image', 'https://via.placeholder.com/400x300');
    } catch (error) {
      showError('Failed to insert image');
    }
  };
});

// Add theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update icon
  const icon = themeToggle.querySelector('i');
  icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
document.documentElement.setAttribute('data-theme', savedTheme);

// Update icon based on initial theme
const icon = themeToggle.querySelector('i');
icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

// FAB for new workspace
const newWorkspaceFab = document.getElementById('newWorkspaceFab');
newWorkspaceFab.addEventListener('click', () => {
  listNameInput.focus();
  document.querySelector('.list-creation').scrollIntoView({ behavior: 'smooth' });
});

// Update workspace creation to use cards
function updateWorkspaceList(lists) {
  const sortedLists = Object.values(lists).sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return b.timestamp.toDate() - a.timestamp.toDate();
    }
    return a.name.localeCompare(b.name);
  });
  
  sharedListSelect.innerHTML = '';
  
  if (sortedLists.length === 0) {
    sharedListSelect.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>No workspaces yet</p>
      </div>
    `;
  } else {
    sortedLists.forEach(list => {
      const card = document.createElement('div');
      card.className = 'workspace-card';
      card.dataset.id = list.id;
      card.innerHTML = `
        <h3>${list.name}</h3>
        <p>Created by ${list.ownerEmail}</p>
        <div class="meta">
          <span>${list.collaborators?.length || 0} collaborators</span>
          <span>${list.timestamp?.toDate().toLocaleDateString() || ''}</span>
        </div>
      `;
      
      card.addEventListener('click', () => {
        currentListId = list.id;
        sharedListSelect.value = list.id;
        loadWorkspace(list.id);
      });
      
      sharedListSelect.appendChild(card);
    });
  }
}

// Update the loadSharedLists function to use updateWorkspaceList
function loadSharedLists(userEmail) {
  const lists = {};
  
  const createListener = (permission) => db.collection('sharedLists')
    .where('collaborators', 'array-contains', { email: userEmail, permission })
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "removed") {
          delete lists[change.doc.id];
        } else {
          lists[change.doc.id] = { 
            id: change.doc.id, 
            ...change.doc.data(),
            timestamp: change.doc.data().timestamp || null
          };
        }
      });
      updateWorkspaceList(lists);
    }, error => {
      console.error("Error loading workspaces:", error);
      showError("Failed to load workspaces. Please refresh the page.");
    });
  
  sharedListsUnsubscribers = [
    createListener('view'),
    createListener('edit')
  ];
}

    // --- DOM Elements ---
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const agendaList = document.getElementById('agendaList');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login');
    const signupButton = document.getElementById('signup');
    const logoutButton = document.getElementById('logout');
    const listNameInput = document.getElementById('listName');
    const createListButton = document.getElementById('createList');
    const sharedListSelect = document.getElementById('sharedListSelect');
    const listSearchInput = document.getElementById('listSearch');
    const collaboratorEmailInput = document.getElementById('collaboratorEmail');
    const collaboratorPermissionSelect = document.getElementById('collaboratorPermission');
    const inviteCollaboratorButton = document.getElementById('inviteCollaborator');
    const errorMessage = document.getElementById('errorMessage');
    const authBox = document.getElementById('auth-box');
    const mainContent = document.getElementById('main-content');
    const activeListArea = document.getElementById('active-list-area');
    const addItemButton = document.getElementById('addItem');
    const currentWorkspaceName = document.getElementById('currentWorkspaceName');
    const workspaceStatus = document.getElementById('workspaceStatus');
    const collaboratorsList = document.getElementById('collaboratorsList');
    const refreshContentButton = document.getElementById('refreshContent');
    const contentSearchInput = document.getElementById('contentSearch');

    let currentListId = '';
    let currentListData = null;
    let listUnsubscribe = null;
    let sharedListsUnsubscribers = [];
    let itemsUnsubscribe = null;
    let collaboratorsUnsubscribe = null;
    
    // Show splash screen for minimum 1.5 seconds
    const minimumSplashTime = 1500;
    const splashStartTime = Date.now();
    
    // --- Utility Functions ---
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('visible');
        setTimeout(() => { 
            errorMessage.classList.remove('visible'); 
        }, 5000);
    }
    
    function showSuccess(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'error-message visible';
        successMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        successMessage.style.borderColor = 'var(--success-color)';
        successMessage.style.color = 'var(--success-color)';
        successMessage.textContent = message;
        
        errorMessage.parentNode.insertBefore(successMessage, errorMessage.nextSibling);
        
        setTimeout(() => {
            successMessage.classList.remove('visible');
            setTimeout(() => successMessage.remove(), 300);
        }, 3000);
    }
    
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // --- Authentication ---
    async function handleAuthAction(action) {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            return showError('Please enter both email and password.');
        }
        
        try {
            if (action === 'login') {
                await auth.signInWithEmailAndPassword(email, password);
            } else {
                await auth.createUserWithEmailAndPassword(email, password);
                showSuccess('Account created successfully!');
            }
        } catch (error) {
            let errorMessage = 'An error occurred. Please try again.';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already in use.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters.';
                    break;
            }
            
            showError(errorMessage);
        }
    }
    
    signupButton.addEventListener('click', () => handleAuthAction('signup'));
    loginButton.addEventListener('click', () => handleAuthAction('login'));
    
    logoutButton.addEventListener('click', () => {
        auth.signOut().catch(error => {
            showError('Logout failed: ' + error.message);
        });
    });
    
    // Handle Enter key in auth forms
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAuthAction('login');
            }
        });
    });
    
    // --- Auth State Changes ---
    auth.onAuthStateChanged(async user => {
        // Clean up previous listeners
        if (listUnsubscribe) listUnsubscribe();
        if (itemsUnsubscribe) itemsUnsubscribe();
        if (collaboratorsUnsubscribe) collaboratorsUnsubscribe();
        sharedListsUnsubscribers.forEach(unsub => unsub());
        sharedListsUnsubscribers = [];
        
        if (user) {
            // User is signed in
            authBox.classList.remove('visible');
            logoutButton.classList.add('visible');
            mainContent.classList.add('visible');
            welcomeMessage.textContent = `Welcome, ${user.email}`;
            welcomeMessage.classList.add('visible');
            
            // Load user's shared lists
            loadSharedLists(user.email);
            
            // Set current workspace to empty state
            currentListId = '';
            currentWorkspaceName.textContent = 'Select a workspace';
            workspaceStatus.textContent = '';
            agendaList.innerHTML = '<li class="empty">Select a workspace to view content</li>';
            collaboratorsList.innerHTML = '';
        } else {
            // User is signed out
            authBox.classList.add('visible');
            logoutButton.classList.remove('visible');
            mainContent.classList.remove('visible');
            welcomeMessage.classList.remove('visible');
            
            // Reset UI
            agendaList.innerHTML = '';
            sharedListSelect.innerHTML = '<option value="" disabled>Login to see your workspaces</option>';
            currentListId = '';
            currentWorkspaceName.textContent = 'Select a workspace';
            workspaceStatus.textContent = '';
            collaboratorsList.innerHTML = '';
        }
        
        // Hide splash screen after minimum time has elapsed
        const elapsed = Date.now() - splashStartTime;
        if (elapsed < minimumSplashTime) {
            setTimeout(() => {
                splashScreen.classList.add('hidden');
                appContainer.classList.add('visible');
            }, minimumSplashTime - elapsed);
        } else {
            splashScreen.classList.add('hidden');
            appContainer.classList.add('visible');
        }
    });
    
    // --- Workspace Management ---
    createListButton.addEventListener('click', async () => {
        const listName = listNameInput.value.trim();
        const user = auth.currentUser;
        
        if (!user) {
            return showError('Please sign in to create a workspace.');
        }
        
        if (!listName) {
            return showError('Please enter a workspace name.');
        }
        
        try {
            // Create the new workspace
            const docRef = await db.collection('sharedLists').add({
                name: listName,
                owner: user.uid,
                ownerEmail: user.email,
                collaborators: [{ email: user.email, permission: 'edit' }],
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Clear the input
            listNameInput.value = '';
            
            // Show success message
            showSuccess(`Workspace "${listName}" created successfully!`);
            
            // The list will automatically appear in the dropdown via the real-time listener
            // Select the new workspace
            sharedListSelect.value = docRef.id;
            sharedListSelect.dispatchEvent(new Event('change'));
            
        } catch (error) {
            showError('Failed to create workspace: ' + error.message);
        }
    });
    
    function loadSharedLists(userEmail) {
        const lists = {};
        
        // Update the dropdown with current lists
        const updateDropdown = () => {
            const sortedLists = Object.values(lists).sort((a, b) => {
                // Sort by timestamp (newest first) if available, otherwise by name
                if (a.timestamp && b.timestamp) {
                    return b.timestamp.toDate() - a.timestamp.toDate();
                }
                return a.name.localeCompare(b.name);
            });
            
            const currentlySelected = sharedListSelect.value;
            
            sharedListSelect.innerHTML = ''; // Clear previous options
            
            if (sortedLists.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.disabled = true;
                option.selected = true;
                option.textContent = 'No workspaces found';
                sharedListSelect.appendChild(option);
            } else {
                sortedLists.forEach(list => {
                    const option = document.createElement('option');
                    option.value = list.id;
                    option.textContent = list.name;
                    option.title = `Owner: ${list.ownerEmail}`;
                    sharedListSelect.appendChild(option);
                });
            }
            
            // Restore selection if possible
            if (currentlySelected && lists[currentlySelected]) {
                sharedListSelect.value = currentlySelected;
            }
            
            // Auto-select the first workspace if none is selected
            if (sortedLists.length > 0 && !sharedListSelect.value) {
                sharedListSelect.value = sortedLists[0].id;
                sharedListSelect.dispatchEvent(new Event('change'));
            }
        };
        
        // Create listeners for workspaces where user has view or edit permission
        const createListener = (permission) => db.collection('sharedLists')
            .where('collaborators', 'array-contains', { email: userEmail, permission })
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === "removed") {
                        delete lists[change.doc.id];
                        
                        // If the deleted list was the current one, clear the view
                        if (currentListId === change.doc.id) {
                            currentListId = '';
                            currentWorkspaceName.textContent = 'Select a workspace';
                            workspaceStatus.textContent = '';
                            agendaList.innerHTML = '<li class="empty">Select a workspace to view content</li>';
                            collaboratorsList.innerHTML = '';
                        }
                    } else {
                        lists[change.doc.id] = { 
                            id: change.doc.id, 
                            ...change.doc.data(),
                            timestamp: change.doc.data().timestamp || null
                        };
                    }
                });
                updateDropdown();
            }, error => {
                console.error("Error loading workspaces:", error);
                showError("Failed to load workspaces. Please refresh the page.");
            });
        
        // Set up listeners for both view and edit permissions
        sharedListsUnsubscribers = [
            createListener('view'),
            createListener('edit')
        ];
        
        // Set up search functionality
        listSearchInput.addEventListener('input', debounce(() => {
            const searchTerm = listSearchInput.value.toLowerCase();
            const options = sharedListSelect.options;
            
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                const text = option.textContent.toLowerCase();
                option.style.display = text.includes(searchTerm) ? '' : 'none';
            }
        }, 300));
    }
    
    // Handle workspace selection change
    sharedListSelect.addEventListener('change', () => {
        currentListId = sharedListSelect.value;
        
        if (currentListId) {
            // Load the selected workspace
            loadWorkspace(currentListId);
            activeListArea.classList.add('visible');
        } else {
            activeListArea.classList.remove('visible');
        }
    });
    
    async function loadWorkspace(listId) {
        // Clean up previous listeners
        if (itemsUnsubscribe) itemsUnsubscribe();
        if (collaboratorsUnsubscribe) collaboratorsUnsubscribe();
        
        try {
            // Get workspace data
            const doc = await db.collection('sharedLists').doc(listId).get();
            if (!doc.exists) {
                throw new Error("Workspace not found");
            }
            
            currentListData = { id: doc.id, ...doc.data() };
            
            // Update UI with workspace info
            currentWorkspaceName.textContent = currentListData.name;
            workspaceStatus.textContent = `Owned by ${currentListData.ownerEmail}`;
            
            // Load workspace items
            loadWorkspaceItems(listId);
            
            // Load collaborators
            loadCollaborators(listId);
            
        } catch (error) {
            console.error("Error loading workspace:", error);
            showError("Failed to load workspace. Please try again.");
        }
    }
    
    function loadWorkspaceItems(listId) {
        // Clear previous items
        agendaList.innerHTML = '<li class="empty">Loading content...</li>';
        
        // Set up real-time listener for items
        itemsUnsubscribe = db.collection('sharedLists').doc(listId)
            .collection('items')
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    agendaList.innerHTML = '<li class="empty">No content in this workspace yet</li>';
                    return;
                }
                
                agendaList.innerHTML = '';
                
                snapshot.forEach(doc => {
                    const item = doc.data();
                    const li = document.createElement('li');
                    li.dataset.id = doc.id;
                    
                    const itemContent = document.createElement('div');
                    itemContent.className = 'item-content ql-editor';
                    itemContent.innerHTML = item.text;
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.title = 'Delete this item';
                    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                    deleteBtn.onclick = () => deleteWorkspaceItem(doc.id);
                    
                    li.appendChild(itemContent);
                    li.appendChild(deleteBtn);
                    agendaList.appendChild(li);
                });
            }, error => {
                console.error("Error loading workspace items:", error);
                agendaList.innerHTML = '<li class="empty">Failed to load content</li>';
            });
        
        // Set up search functionality
        contentSearchInput.addEventListener('input', debounce(() => {
            const searchTerm = contentSearchInput.value.toLowerCase();
            const items = agendaList.querySelectorAll('li');
            
            items.forEach(item => {
                if (item.classList.contains('empty')) return;
                
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }, 300));
    }
    
    function loadCollaborators(listId) {
        collaboratorsList.innerHTML = '<li>Loading collaborators...</li>';
        
        // Set up real-time listener for collaborators
        collaboratorsUnsubscribe = db.collection('sharedLists').doc(listId)
            .onSnapshot(doc => {
                if (!doc.exists) return;
                
                const data = doc.data();
                const collaborators = data.collaborators || [];
                
                if (collaborators.length === 0) {
                    collaboratorsList.innerHTML = '<li>No collaborators yet</li>';
                    return;
                }
                
                // Sort collaborators with owner first, then by permission, then by email
                collaborators.sort((a, b) => {
                    if (a.email === data.ownerEmail) return -1;
                    if (b.email === data.ownerEmail) return 1;
                    if (a.permission !== b.permission) {
                        return a.permission === 'edit' ? -1 : 1;
                    }
                    return a.email.localeCompare(b.email);
                });
                
                collaboratorsList.innerHTML = '';
                
                collaborators.forEach(collab => {
                    const li = document.createElement('li');
                    
                    const emailSpan = document.createElement('span');
                    emailSpan.className = 'collaborator-email';
                    emailSpan.textContent = collab.email;
                    if (collab.email === data.ownerEmail) {
                        emailSpan.textContent += ' (owner)';
                    }
                    
                    const permissionSpan = document.createElement('span');
                    permissionSpan.className = 'collaborator-permission';
                    permissionSpan.textContent = collab.permission;
                    
                    li.appendChild(emailSpan);
                    li.appendChild(permissionSpan);
                    collaboratorsList.appendChild(li);
                });
            }, error => {
                console.error("Error loading collaborators:", error);
                collaboratorsList.innerHTML = '<li>Failed to load collaborators</li>';
            });
    }
    
    // --- Workspace Item Management ---
    addItemButton.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            return showError('Please sign in to add content.');
        }
        
        if (!currentListId) {
            return showError('Please select a workspace first.');
        }
        
        const content = quill.root.innerHTML;
        if (quill.getLength() <= 1) {
            return showError('Please enter some content.');
        }
        
        try {
            // Check permissions
            const permission = await checkPermissions(currentListId, user.email);
            if (permission !== 'edit') {
                throw new Error('You do not have permission to add content to this workspace.');
            }
            
            // Add the item
            await db.collection('sharedLists').doc(currentListId).collection('items').add({
                text: content,
                userId: user.uid,
                userEmail: user.email,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Clear the editor
            quill.setText('');
            
        } catch (error) {
            showError(error.message);
        }
    });
    
    async function deleteWorkspaceItem(itemId) {
        const user = auth.currentUser;
        if (!user) {
            return showError('Please sign in to delete content.');
        }
        
        if (!currentListId) {
            return showError('No workspace selected.');
        }
        
        try {
            // Check permissions
            const permission = await checkPermissions(currentListId, user.email);
            if (permission !== 'edit') {
                throw new Error('You do not have permission to delete content from this workspace.');
            }
            
            // Delete the item
            await db.collection('sharedLists').doc(currentListId).collection('items').doc(itemId).delete();
            
        } catch (error) {
            showError(error.message);
        }
    }
    
    // --- Collaboration Management ---
    inviteCollaboratorButton.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            return showError('Please sign in to invite collaborators.');
        }
        
        if (!currentListId) {
            return showError('Please select a workspace first.');
        }
        
        const collaboratorEmail = collaboratorEmailInput.value.trim().toLowerCase();
        if (!collaboratorEmail) {
            return showError('Please enter a collaborator email.');
        }
        
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collaboratorEmail)) {
            return showError('Please enter a valid email address.');
        }
        
        // Don't allow inviting yourself
        if (collaboratorEmail === user.email.toLowerCase()) {
            return showError('You cannot invite yourself.');
        }
        
        const permission = collaboratorPermissionSelect.value;
        
        try {
            // Check if current user has permission to invite
            const currentPermission = await checkPermissions(currentListId, user.email);
            if (currentPermission !== 'edit' && user.uid !== currentListData.owner) {
                throw new Error('Only workspace editors can invite collaborators.');
            }
            
            // Use a transaction to ensure atomic updates
            await db.runTransaction(async transaction => {
                const listRef = db.collection('sharedLists').doc(currentListId);
                const listDoc = await transaction.get(listRef);
                
                if (!listDoc.exists) {
                    throw new Error('Workspace not found.');
                }
                
                const currentCollaborators = listDoc.data().collaborators || [];
                
                // Check if collaborator already exists
                const existingIndex = currentCollaborators.findIndex(c => c.email === collaboratorEmail);
                
                if (existingIndex >= 0) {
                    // Update existing permission
                    currentCollaborators[existingIndex].permission = permission;
                } else {
                    // Add new collaborator
                    currentCollaborators.push({ email: collaboratorEmail, permission });
                }
                
                // Update the document
                transaction.update(listRef, { collaborators: currentCollaborators });
            });
            
            // Clear the input
            collaboratorEmailInput.value = '';
            
            // Show success message
            showSuccess(`Invitation sent to ${collaboratorEmail}`);
            
        } catch (error) {
            showError('Failed to invite collaborator: ' + error.message);
        }
    });
    
    // --- Permission Checking ---
    async function checkPermissions(listId, userEmail) {
        try {
            const doc = await db.collection('sharedLists').doc(listId).get();
            if (!doc.exists) return null;
            
            const data = doc.data();
            
            // Owner has full permissions
            if (data.ownerEmail === userEmail) {
                return 'edit';
            }
            
            // Check collaborators
            const collaborator = data.collaborators.find(c => c.email === userEmail);
            return collaborator ? collaborator.permission : null;
            
        } catch (error) {
            console.error("Error checking permissions:", error);
            return null;
        }
    }
    
    // --- Refresh Content Button ---
    refreshContentButton.addEventListener('click', () => {
        if (currentListId) {
            loadWorkspaceItems(currentListId);
            showSuccess('Content refreshed');
        }
    });
    
    // --- Initialize UI Based on Auth State ---
    authBox.classList.add('visible');
});
