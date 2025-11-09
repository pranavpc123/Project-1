// Authentication functionality
class Auth {
    static isLoggedIn() {
        return sessionStorage.getItem(CONFIG.STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    }

    static login(password) {
        if (password === CONFIG.ADMIN_PASSWORD) {
            sessionStorage.setItem(CONFIG.STORAGE_KEYS.IS_LOGGED_IN, 'true');
            return true;
        }
        return false;
    }

    static logout() {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.IS_LOGGED_IN);
    }

    static requireLogin(callback) {
        if (!this.isLoggedIn()) {
            // Show login modal if exists
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('show');
                return false;
            }
            return false;
        }
        if (callback) callback();
        return true;
    }
}

// Initialize login functionality on pages that need it
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');
    const logoutBtn = document.getElementById('logoutBtn');
    const editMenuBtn = document.getElementById('editMenuBtn');
    const reportsBtn = document.getElementById('reportsBtn');
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');

    // Check if user is already logged in
    if (Auth.isLoggedIn()) {
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (editMenuBtn) editMenuBtn.style.display = 'inline-block';
    }

    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = passwordInput.value;
            
            if (Auth.login(password)) {
                if (loginModal) {
                    loginModal.classList.remove('show');
                }
                if (logoutBtn) logoutBtn.style.display = 'inline-block';
                if (editMenuBtn) editMenuBtn.style.display = 'inline-block';
                if (loginError) {
                    loginError.textContent = '';
                    loginError.classList.remove('show');
                }
                passwordInput.value = '';
                
                // Reload page to show admin features
                if (window.location.pathname.includes('reports.html')) {
                    window.location.reload();
                }
            } else {
                if (loginError) {
                    loginError.textContent = 'Invalid password. Please try again.';
                    loginError.classList.add('show');
                }
            }
        });
    }

    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            Auth.logout();
            window.location.reload();
        });
    }

    // Close modal handlers
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                if (loginError) {
                    loginError.textContent = '';
                    loginError.classList.remove('show');
                }
            }
        });
    });

    // Close modal on outside click
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('show');
                if (loginError) {
                    loginError.textContent = '';
                    loginError.classList.remove('show');
                }
            }
        });
    }

    // Reports button handler
    if (reportsBtn) {
        reportsBtn.addEventListener('click', function() {
            window.location.href = 'reports.html';
        });
    }
});

