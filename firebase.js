import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  setDoc,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  query, where
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
  getStorage,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxY-KJ8H1m-9DO2_fs5qLo9MEwb7PiHVY",
  authDomain: "book-me-a6d98.firebaseapp.com",
  projectId: "book-me-a6d98",
  storageBucket: "book-me-a6d98.appspot.com",
  messagingSenderId: "162115788301",
  appId: "1:162115788301:web:fe46d6ed06f95fc2f87f44",
  measurementId: "G-DEXMQ2FKFM",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
export { db, auth, storage };

// with email and password
export async function signUp(email, password, name ) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // await addDoc(collection(db, "users"), {
    //   uid: user.uid,
    //   name: name,
    //   email: email,
    //   admin: email=="rha772207@gmail.com"?true:false,
    //   createdAt: new Date(),
    // });

    await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: name,
    email: email,
    admin: false,
    createdAt: new Date(),
});
    alert(`User signed up: ${user.email}`);
    window.location.href = "index.html";
  } catch (error) {
    alert("Sign up error: " + error.message);
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    //get the user data
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      alert("User record not found in database.");
      await signOut(auth);
      return;
    }

    const userData = userSnap.data();
    alert("User logged in: " + user.email);

    if (userData.admin === true) {
      window.location.href = "./adminPanel/dashboard.html";
    } else {
      window.location.href = "./Home/home.html";
    }
  } catch (error) {
    alert("Login failed: " + error.code + " " + error.message);
  }
}

//=========================================================================================

//with google
const provider = new GoogleAuthProvider();
//signup
export async function signUpWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        admin: false,
        createdAt: new Date(),
      });
      alert(`Welcome new user: ${user.displayName}`);
      window.location.href = "index.html";
    } else {
      alert(`this email already exists}`);
      window.location.href = "index.html";
    }
  } catch (error) {
    alert("Google Sign-In error: " + error.message);
  }
}
//signin
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const userData = userSnap.data();


    if (!userSnap.exists()) {
      alert("Please sign up before signing in with this email.");

      await signOut(auth);
      return;
    } else {
      alert(`Welcome back: ${user.displayName}`);
      if (user.admin == true) {
        window.location.href = "./adminPanel/dashboard.html";
      } else window.location.href = `./Home/home.html`;
    }
  } catch (error) {
    alert("Google Sign-In error: " + error.message);
  }
}

//===========================================================================
//insert books

export async function addBook(bookData) {
  try {
    const docRef = await addDoc(collection(db, "books"), bookData);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error };
  }
}

//==================================================================================
//get books
export async function getBooks() {
  try {
    const booksSnapshot = await getDocs(collection(db, "books"));
    const books = [];
    booksSnapshot.forEach((doc) => {
      books.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, books };
  } catch (error) {
    return { success: false, error };
  }
}

//========================================================================================
//delete book
export async function deleteBook(bookId) {
  const docRef = doc(db, "books", bookId);
  await deleteDoc(docRef);
}

//=========================================================================================
//update book
export async function updateBook(bookId, updatedData) {
  try {
    const bookRef = doc(db, "books", bookId);
    await updateDoc(bookRef, updatedData);
    return { success: true };
  } catch (error) {
    console.error("Error updating book:", error);
    return { success: false, error };
  }
}

//==========================================================================================
//sign out

export async function signOutUser() {
  try {
    await signOut(auth);
    console.log("User signed out successfully.");
  } catch (error) {
    console.error("Sign-out error:", error);
    throw error;
  }
}

//==========================================================================================
//get book
export async function getAllBooks() {
  const usersCollection = collection(db, "books");
  const snapshot = await getDocs(usersCollection);
  const books = snapshot.docs.map((doc) => ({ desc: doc.desc, ...doc.data() }));
  return books;
}

//==========================================================================================
//find book
export async function findBookByBookId(bookIdToFind) {
  const booksCollection = collection(db, "books");
  const snapshot = await getDocs(booksCollection);

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.bookId === bookIdToFind) {
      return { id: docSnap.id, ...data };
    }
  }
  return null;
}
//==========================================================================================
//get user
export async function getAllUsers() {
  const usersCollection = collection(db, "users");
  const snapshot = await getDocs(usersCollection);
  const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return users;
}
//==========================================================================================
//get user by id
export async function updateUser(userId, updatedData) {
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, updatedData);
    console.log("User updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
  }
}

//===========================================================================================
// get orders
export async function getAllOrders() {
  try {
    const snapshot = await getDocs(collection(db, "orders"));
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, orders };
  } catch (error) {
    return { success: false, error };
  }
}