# TaskSlate - Collaborative Workspace ✨📝

**TaskSlate** is a Notion-inspired collaborative workspace that combines rich text editing with real-time collaboration features. Built with Firebase for seamless synchronization across devices, it offers a beautiful, intuitive interface for team productivity.

---

## 🔥 Features

- 🌐 **Real-time Collaboration** – Multiple users can edit workspaces simultaneously  
- ✍️ **Rich Text Editor** – Powered by Quill.js with tables, code blocks, and more  
- 🔐 **Secure Authentication** – Firebase Auth with email/password login  
- 🔄 **Live Updates** – Firestore backend ensures instant changes everywhere  
- 👥 **Granular Permissions** – Control view/edit access per collaborator  
- 🎨 **Theme System** – Light/dark mode with system preference detection  
- 📱 **Responsive Design** – Works flawlessly on desktop and mobile  

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript  
- **UI Framework**: Custom CSS with Glassmorphism effects  
- **Rich Text Editor**: Quill.js  
- **Backend**: Firebase (Auth, Firestore)  
- **Deployment**: Firebase Hosting / Netlify / Vercel  

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/idevanshrai/taskslate.git
cd taskslate
```

### 2. Set Up Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Email/Password authentication
3. Set up Firestore with these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sharedLists/{listId} {
      allow read, write: if request.auth != null && 
        (resource.data.owner == request.auth.uid || 
         resource.data.collaborators.hasAny([request.auth.token.email]));
      
      match /items/{itemId} {
        allow read: if request.auth != null && 
          (resource.data.userId == request.auth.uid || 
           get(/databases/$(database)/documents/sharedLists/$(listId)).data.collaborators.hasAny([request.auth.token.email]));
          
        allow write: if request.auth != null && 
          (resource.data.userId == request.auth.uid || 
           get(/databases/$(database)/documents/sharedLists/$(listId)).data.collaborators.hasAny([request.auth.token.email, 'edit']));
      }
    }
  }
}
```

### 3. Configure Your App

Replace the Firebase config in `app.js` with your project's details:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Deploy (Optional)

For Firebase Hosting:
```bash
firebase init hosting
firebase deploy
```

---

## 🖥️ Project Structure

```
taskslate/
│
├── index.html            # Main application HTML
├── style.css             # All styles with modern UI effects
├── app.js                # Core application logic
│
├── assets/               # (Optional) For images/icons
│   └── logo.svg          # Application logo
│
└── README.md             # This file
```

---

## ✨ UI Highlights

- **Glassmorphism Design**: Sleek frosted glass panels with backdrop filters  
- **Starfield Background**: Animated cosmic background for visual appeal  
- **Floating Action Buttons**: Quick access to common actions  
- **Smooth Animations**: CSS transitions for all interactions  
- **Workspace Cards**: Visual representation of collaborative spaces  

---

## 🧠 Rich Text Editor Capabilities

| Feature          | Supported               |
|------------------|-------------------------|
| Text Formatting  | Bold, Italic, Underline |
| Headers          | H1-H3                   |
| Lists            | Ordered, Bulleted       |
| Code Blocks      | Syntax Highlighting     |
| Tables           | Full support            |
| Images           | Upload/Embed            |
| Alignment        | Left/Center/Right       |
| Colors           | Text & Background       |

---

## 📌 Use Cases

- Team documentation and knowledge bases  
- Collaborative project planning  
- Shared task management  
- Personal organization system  
- Educational group workspaces  

---

## 🗺️ Roadmap

- [ ] **Real-time Cursors**: See collaborators' positions in documents  
- [ ] **Comments & Mentions**: Tag team members in discussions  
- [ ] **Version History**: Track changes over time  
- [ ] **Mobile App**: Dedicated iOS/Android applications  
- [ ] **Templates**: Quick-start workspace templates  

---

## 🙌 Acknowledgments

- Built with [Firebase](https://firebase.google.com)  
- Inspired by [Notion](https://notion.so)  
- UI powered by [Quill.js](https://quilljs.com)  

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
