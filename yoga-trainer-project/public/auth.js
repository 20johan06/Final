// auth.js - Handles client-side logic for login and registration forms

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check if we are on the register page
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // You can add a check for the custom message box if needed, but the simple div is more direct.
});

/**
 * Handles the login form submission.
 * @param {Event} event - The form submission event.
 */
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // The message div is inside the login.html form
    const messageDiv = document.getElementById('message');

    // Simple validation
    if (!username || !password) {
        messageDiv.textContent = 'Please enter both username and password.';
        messageDiv.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'green';
            // Store the user ID from the successful login response
            localStorage.setItem('userId', result.userId);
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '/schedule_data';
            }, 1000);
        } else {
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error during login:', error);
        messageDiv.textContent = 'An unexpected error occurred. Please try again later.';
        messageDiv.style.color = 'red';
    }
}

/**
 * Handles the registration form submission.
 * @param {Event} event - The form submission event.
 */
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // The message div is inside the register.html body
    const messageDiv = document.getElementById('message');

    // Simple validation
    if (!username || !password) {
        messageDiv.textContent = 'Please enter both username and password.';
        messageDiv.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'green';
            // Store the user ID from the successful registration response
            localStorage.setItem('userId', result.userId);
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '/schedule_data';
            }, 1000);
        } else {
            messageDiv.textContent = result.message; // e.g., "Username already exists"
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error during registration:', error);
        messageDiv.textContent = 'An unexpected error occurred. Please try again later.';
        messageDiv.style.color = 'red';
    }
}