// Function to handle user registration [cite: 4-5]
async function handleRegister(username, password) {
    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            alert("Registration successful! Redirecting to login...");
            window.location.href = '/login';
        } else {
            const errorData = await response.json();
            alert("Registration failed: " + (errorData.msg || "Unknown error"));
        }
    } catch (error) {
        console.error("Error during registration:", error);
    }
}

// Function to handle user login [cite: 6, 76]
async function handleLogin(username, password) {
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the JWT in localStorage for subsequent requests [cite: 18]
            localStorage.setItem('access_token', data.access_token);
            window.location.href = '/';
        } else {
            alert("Login failed: " + (data.msg || "Invalid credentials"));
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}

// Helper to get the token for API headers
function getAuthHeader() {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}