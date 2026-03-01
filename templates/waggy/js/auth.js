/**
 * Customer Authentication Logic
 */

(function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleBtn = document.getElementById('toggle-auth');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');

    let isLogin = true;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isLogin = !isLogin;
            if (isLogin) {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
                title.innerText = 'Welcome Back';
                subtitle.innerText = 'Login to track your orders and manage your profile.';
                toggleBtn.innerText = "Don't have an account? Sign Up";
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
                title.innerText = 'Join Us';
                subtitle.innerText = 'Create an account to start shopping and save addresses.';
                toggleBtn.innerText = "Already have an account? Sign In";
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const btn = e.target.querySelector('button');
            btn.innerText = 'Signing in...';
            btn.disabled = true;

            const { data, error } = await window.API.login(email, password);

            if (error) {
                alert("Login Error: " + error.message);
                btn.innerText = 'Sign In';
                btn.disabled = false;
            } else {
                window.location.href = 'profile.html';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('full_name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            const btn = e.target.querySelector('button');
            btn.innerText = 'Creating account...';
            btn.disabled = true;

            const { data, error } = await window.API.signup(email, password, { full_name: name });

            if (error) {
                alert("Signup Error: " + error.message);
                btn.innerText = 'Create Account';
                btn.disabled = false;
            } else {
                alert("Success! Check your email for verification if required, or sign in now.");
                location.reload(); // Switch back to login
            }
        });
    }
})();
