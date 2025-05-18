
const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        const toRegisterLink = document.getElementById('to-register');
        const toLoginLink = document.getElementById('to-login');
        const loginPasswordToggle = document.getElementById('login-password-toggle');
        const forgotPassword = document.getElementById('forgot-password');
        const registerPasswordToggle = document.getElementById('register-password-toggle');
        const passwordStrength = document.getElementById('password-strength');
        const authContainer = document.querySelector('.auth-container');
        const loginError = document.getElementById('login-error');
        const registerError = document.getElementById('register-error');
        const loginPassword = document.getElementById('login-password');
        const registerPassword = document.getElementById('register-password');


// Add loaded class for animation
        window.addEventListener('load', () => {
            authContainer.classList.add('loaded');
        });

        // Toggle between login and register sections
        toRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.classList.remove('active');
            registerSection.classList.add('active');
            loginError.textContent = '';
            loginError.classList.remove('show');
            registerError.textContent = '';
            registerError.classList.remove('show');
            passwordStrength.style.display = 'block';
        });

        toLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerSection.classList.remove('active');
            loginSection.classList.add('active');
            loginError.textContent = '';
            loginError.classList.remove('show');
            registerError.textContent = '';
            registerError.classList.remove('show');
            passwordStrength.style.display = 'none';
        });

        // Password visibility toggle for login
        loginPasswordToggle.addEventListener('click', () => {
            const isPassword = loginPassword.type === 'password';
            loginPassword.type = isPassword ? 'text' : 'password';
            loginPasswordToggle.classList.toggle('fa-eye', isPassword);
            loginPasswordToggle.classList.toggle('fa-eye-slash', !isPassword);
        });

        // Password visibility toggle for register
        registerPasswordToggle.addEventListener('click', () => {
            const isPassword = registerPassword.type === 'password';
            registerPassword.type = isPassword ? 'text' : 'password';
            registerPasswordToggle.classList.toggle('fa-eye', isPassword);
            registerPasswordToggle.classList.toggle('fa-eye-slash', !isPassword);
        });

        // Password strength indicator for register
        registerPassword.addEventListener('input', () => {
            const password = registerPassword.value;
            passwordStrength.style.display = 'block';
            if (password.length < 6) {
                passwordStrength.textContent = 'Weak: At least 6 characters';
                passwordStrength.className = 'password-strength weak';
            } else if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
                passwordStrength.textContent = 'Medium: Add uppercase or numbers';
                passwordStrength.className = 'password-strength medium';
            } else {
                passwordStrength.textContent = 'Strong';
                passwordStrength.className = 'password-strength strong';
            }
        });


        
