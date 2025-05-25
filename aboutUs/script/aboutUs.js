import { auth } from "../../firebase.js"; // import shared auth instance
import { loadNavbar } from "../../navBar/script/navBar.js";

loadNavbar(auth);
