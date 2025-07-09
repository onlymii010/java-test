// script.js

const SERVER_URL = 'http://127.0.0.1:7789';

// Ein einziger Event-Listener, der den gesamten Code umschließt.
// Er wartet, bis die HTML-Seite vollständig geladen ist.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Logik für das allgemeine Seitenmenü ---
    const menuButton = document.getElementById('menu');
    const sideMenu = document.getElementById('side-menu');
    const navLinks = document.querySelectorAll('#side-menu a');
    const currentPage = window.location.pathname.split('/').pop();

    if (menuButton && sideMenu) {
        menuButton.addEventListener('click', () => {
            sideMenu.classList.toggle('is-visible');
        });

        // Aktiven Link hervorheben
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }


    // --- 2. Logik für die Login/Registrierungs-Seite (`login.html`) ---
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            const response = await fetch(`${SERVER_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            alert(result.message);
            if (response.ok) registerForm.reset();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            const response = await fetch(`${SERVER_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('token', result.token);
                window.location.href = 'usersection.html'; // Weiterleitung nach Login
            } else {
                alert(result.message);
            }
        });
    }


    // --- 3. Logik für den geschützten Benutzerbereich (`usersection.html`) ---
    const logoutButton = document.getElementById('logout-button');
    const adminPanel = document.getElementById('admin-panel');
    const token = localStorage.getItem('token');

    // Dieser Code läuft nur, wenn ein Logout-Button gefunden wird (also nur auf usersection.html)
    if (logoutButton) {
        if (!token) {
            // Wenn kein Login-Token vorhanden ist, sofort zurück zum Login
            window.location.href = 'login.html';
        } else {
            // Zeige Admin-Panel, wenn der Benutzer die Rolle "admin" hat
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role === 'admin' && adminPanel) {
                    adminPanel.style.display = 'block';
                }
            } catch (e) {
                console.error("Ungültiger Token, Weiterleitung zum Login.", e);
                window.location.href = 'login.html';
            }
        }

        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            alert('Du wurdest erfolgreich ausgeloggt.');
            window.location.href = 'login.html';
        });
    }
});