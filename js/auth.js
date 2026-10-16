function getUsers() {
    return JSON.parse(localStorage.getItem("campusBitesUsers") || "[]");
}

function saveUsers(users) {
    localStorage.setItem("campusBitesUsers", JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("campusBitesUser") || "null");
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem("campusBitesUser", JSON.stringify(user));
    } else {
        localStorage.removeItem("campusBitesUser");
    }
}

function signUp(name, email, password) {
    const users = getUsers();

    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
        return { success: false, error: "An account with this email already exists." };
    }

    const newUser = {
        id: "user_" + Date.now(),
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toLocaleString()
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    return { success: true, user: newUser };
}

function signIn(email, password) {
    const users = getUsers();

    const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
        return { success: false, error: "Invalid email or password." };
    }

    setCurrentUser(user);
    return { success: true, user: user };
}

function signOut() {
    setCurrentUser(null);
    window.location.href = "auth.html";
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "auth.html";
        return null;
    }
    return user;
}

function updateAuthUI() {
    const user = getCurrentUser();

    document.querySelectorAll(".auth-menu").forEach(menu => {
        if (user) {
            menu.innerHTML = `
                <div class="user-info">
                    <span class="user-avatar">👤</span>
                    <span class="user-name">${user.name}</span>
                </div>
                <button class="signout-btn" onclick="signOut()">Sign Out</button>
            `;
        } else {
            menu.innerHTML = `
                <a href="auth.html" class="btn btn-primary small-button">Sign In</a>
            `;
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    updateAuthUI();

    const tabs = document.querySelectorAll(".auth-tab");
    const signinForm = document.getElementById("signin-form");
    const signupForm = document.getElementById("signup-form");

    tabs.forEach(tab => {
        tab.addEventListener("click", function() {
            tabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            const target = this.dataset.tab;
            if (target === "signin") {
                signinForm.classList.remove("hidden");
                signupForm.classList.add("hidden");
            } else {
                signinForm.classList.add("hidden");
                signupForm.classList.remove("hidden");
            }
        });
    });

    if (signinForm) {
        signinForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const email = document.getElementById("signin-email").value.trim();
            const password = document.getElementById("signin-password").value;
            const errorEl = document.getElementById("signin-error");

            const result = signIn(email, password);

            if (result.success) {
                window.location.href = "index.html";
            } else {
                errorEl.textContent = result.error;
                errorEl.classList.remove("hidden");
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const name = document.getElementById("signup-name").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const password = document.getElementById("signup-password").value;
            const confirm = document.getElementById("signup-confirm").value;
            const errorEl = document.getElementById("signup-error");

            if (password !== confirm) {
                errorEl.textContent = "Passwords do not match.";
                errorEl.classList.remove("hidden");
                return;
            }

            if (password.length < 6) {
                errorEl.textContent = "Password must be at least 6 characters.";
                errorEl.classList.remove("hidden");
                return;
            }

            const result = signUp(name, email, password);

            if (result.success) {
                window.location.href = "index.html";
            } else {
                errorEl.textContent = result.error;
                errorEl.classList.remove("hidden");
            }
        });
    }
});
