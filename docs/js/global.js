const emailButton = document.querySelector('.subscribe-form .btn-primary');
const emailInput = document.querySelector('.subscribe-input');
const popUpWrapper = document.querySelector('.popup-wrapper');
const popUpButton = document.querySelector('.popup-button');
const popupIcon = document.getElementById('popupIcon');
const popupHeading = document.querySelector('.popup-heading');
const popupContent = document.querySelector('.popup-content');
const loginPasswordInput = document.getElementById('loginPasswordInput');
const loginTokenInput = document.getElementById('loginTokenInput');
const loginButton = document.querySelector('.login-button');
const hamburger = document.getElementById('hamburger');
const closeHamburger = document.getElementById('closeHamburger');
const hamburgerContent = document.querySelector('.hamburger-content');
const API_URL = "https://breakingsilencepress-webgithubio-production.up.railway.app";

if(hamburger){
    hamburger.addEventListener('click', () => {
        hamburger.style.display = "none";
        closeHamburger.style.display = "flex";
        hamburgerContent.style.transform = "translateX(0%)";
    });
}

if(closeHamburger){
    closeHamburger.addEventListener('click', () => {
        hamburger.style.display = "flex";
        closeHamburger.style.display = "none";
        hamburgerContent.style.transform = "translateX(100%)";
    });
}

const messages = [
    { heading: "Subscribed successfully!", content: "Thank you! You've been added to our mailing list and will receive updates about the book release, exclusive content, and more.",
      buttonText: "Got it", icon: "fa-solid fa-check"},
    { heading: "Email already exists!", content: "It looks like this email is already subscribed to our list. If you need to manage your preferences or have any questions, feel free to contact us.",
      buttonText: "Got it", icon: "fa-solid fa-exclamation"},
    { heading: "Something went wrong", content: "We encountered an issue while processing your request. Please try again in a moment. If the problem persists, feel free to contact us.",
      buttonText: "Try Again", icon: "fa-solid fa-triangle-exclamation"},
];

if(emailButton){
    emailButton.addEventListener('click', async () => {
        if(!emailInput.value) return;
        emailButton.disabled = true;
        const response = await fetch(`${API_URL}/subscribe`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailInput.value
            })
        });

        const data = await response.json();
        if(response.ok){
            popupIcon.className = messages[0].icon;
            popupIcon.style.color = "#17be17";
            popupIcon.style.textShadow = "0 0 15px #17be17";
            popupHeading.textContent = messages[0].heading;
            popupContent.textContent = messages[0].content;
            popUpButton.textContent = messages[0].buttonText;
        } else if(response.status === 409){
            popupIcon.className = messages[1].icon;
            popupIcon.style.color = "var(--amber)";
            popupIcon.style.textShadow = "0 0 15px var(--amber)";
            popupHeading.textContent = messages[1].heading;
            popupContent.textContent = messages[1].content;
            popUpButton.textContent = messages[1].buttonText;
        } else {
            popupIcon.className = messages[2].icon;
            popupIcon.style.color = "var(--amber)";
            popupIcon.style.textShadow = "0 0 15px var(--amber)";
            popupHeading.textContent = messages[2].heading;
            popupContent.textContent = messages[2].content;
            popUpButton.textContent = messages[2].buttonText;
        }
        popUpWrapper.classList.add('show');
        emailButton.disabled = false;
    });
}

if(popUpButton){
    popUpButton.addEventListener("click", () => {
        popUpWrapper.classList.remove('show');
    });
}

if(loginButton){
    loginButton.addEventListener('click', async () => {
        const response = await fetch(`${API_URL}/adminlogin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: loginTokenInput.value,
                password: loginPasswordInput.value
            })
        });
        const data = await response.json();
        if(response.ok){
            localStorage.setItem("adminToken", loginTokenInput.value);
            window.location.href = "admin.html";
        } else {
            alert("Invalid credentials. Please try again.");
        }
    });
}
