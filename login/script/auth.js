import { signUp } from "../../firebase.js";

import { loginUser } from "../../firebase.js";

import { signInWithGoogle } from "../../firebase.js";

        
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginEmail = document.getElementById('login-email');
        const loginPassword = document.getElementById('login-password');
        const loginError = document.getElementById('login-error');
        const firstName = document.getElementById('first-name');
        const lastName = document.getElementById('last-name');
        const registerEmail = document.getElementById('register-email');
        const registerPassword = document.getElementById('register-password');
        const registerError = document.getElementById('register-error');

        

        // Login form 
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginEmail.value;
            const password = loginPassword.value;
            loginError.textContent = '';
            loginError.classList.remove('show');

            //  validation
            if (!email || !/\S+@\S+\.\S+/.test(email)) {
                loginError.textContent = 'Please enter a valid email address.';
                loginError.classList.add('show');
                return;
            }
            if (!password || password.length < 6) {
                loginError.textContent = 'Password must be at least 6 characters long.';
                loginError.classList.add('show');
                return;
            }

        loginUser(email,password);
        });

        // Register form 
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const firstNameVal = firstName.value;
            const lastNameVal = lastName.value;
            const email = registerEmail.value;
            const password = registerPassword.value;
            const name = `${firstNameVal} ${lastNameVal}`;
            registerError.textContent = '';
            registerError.classList.remove('show');

            //  validation
            if (!firstNameVal || firstNameVal.length < 2) {
                registerError.textContent = 'First name must be at least 2 characters long.';
                registerError.classList.add('show');
                return;
            }
            if (!lastNameVal || lastNameVal.length < 2) {
                registerError.textContent = 'Last name must be at least 2 characters long.';
                registerError.classList.add('show');
                return;
            }
            if (!email || !/\S+@\S+\.\S+/.test(email)) {
                registerError.textContent = 'Please enter a valid email address.';
                registerError.classList.add('show');
                return;
            }
            if (!password || password.length < 6) {
                registerError.textContent = 'Password must be at least 6 characters long.';
                registerError.classList.add('show');
                return;
            }
            if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
                registerError.textContent = 'Password must include an uppercase letter and a number.';
                registerError.classList.add('show');
                return;
            }

        signUp(email, password, name); 
});

//=========================================================================================================

    const googleSignInBtn = document.getElementById('google-signin-btn');
    const googleSignUpBtn = document.getElementById('google-signup-btn');

if (googleSignInBtn) googleSignInBtn.addEventListener('click', signInWithGoogle);
if (googleSignUpBtn) googleSignUpBtn.addEventListener('click', signInWithGoogle);