
/**
 * Professional Authentication Logic
 */

(function () {
    if (window.AuthExperience) return;

    window.AuthExperience = {
        async init() {
            console.log("🏙️ Synching Authentication Protocol...");

            // Wait for Engine
            let tries = 0;
            while (!window.API?.tenant && tries < 40) {
                await new Promise(r => setTimeout(r, 100));
                tries++;
            }

            if (!window.API?.tenant) return;

            const user = await window.API.getUser();
            if (user) {
                location.href = 'profile.html';
                return;
            }

            this.bindEvents();
        },

        bindEvents() {
            const form = document.getElementById('login-form');
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();

                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    const btn = form.querySelector('button[type="submit"]');

                    btn.innerText = "Transmitting Credentials...";
                    btn.disabled = true;

                    const { data, error } = await window.API.signIn(email, password);

                    if (error) {
                        alert("Authentication Denied: " + error);
                        btn.innerText = "Authenticate Session";
                        btn.disabled = false;
                    } else {
                        window.StorefrontInstance.pushNotification("Authentication Successful.");
                        location.href = 'profile.html';
                    }
                };
            }
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.AuthExperience.init());
    else window.AuthExperience.init();
})();
