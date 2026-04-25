const subscribers = document.querySelector('.subscribers-section .subscribers');
const logoutButton = document.querySelector('.logout-btn');
const totalSubs = document.getElementById('totalSubs');
const newSubsToday = document.getElementById('newSubsToday');
const emailSearchInput = document.getElementById('emailSearchInput');
const evidenceSearchInput = document.getElementById('evidenceSearchInput');
const chapterSelect = document.querySelector('.chapter-select');
const cardsChapter = document.querySelectorAll('.admin-evidence-cards .card .chapter');
const addEvidenceBtn = document.querySelector('.add-evidence-button');
const mainContentLibrary = document.querySelector('.main-content-library');
const addEvidencePopup = document.querySelector('.add-evidence-popup');
const adminPopupInputs = document.querySelectorAll('.add-evidence-popup-input input, .add-evidence-popup-input textarea, .document-details-popup-input input, .document-details-popup-input textarea');
const submitPopupBtn = document.querySelector('.submit-popup-button');
const nextPopupBtn = document.querySelector('.next-popup-button');
const backPopupBtn = document.querySelector('.back-popup-button');
const adminEvidenceCards = document.querySelector('.admin-evidence-cards');
const totalDocuments = document.getElementById('totalDocuments');
const showingDocuments = document.getElementById('showingDocuments');
const evidenceLibraryBtn = document.getElementById('evidenceLibraryBtn');
const dashBoardBtn = document.getElementById('dashBoardBtn');
const sendEmailBtn = document.getElementById('sendEmailBtn');
const dashBoardWrapper = document.querySelector('.main-content-dashboard');
const evidenceLibraryWrapper = document.querySelector('.main-content-library');
const sendEmaiWrapper = document.querySelector('.main-content-send-email')
const documentDetailWrapper = document.querySelector('.document-details-popup-wrapper');
const addEvidenceWrapper = document.querySelector('.add-evidence-popup-wrapper');
const isAdmin = localStorage.getItem('adminToken');
const sendMail = document.getElementById('sendMail');
const emailSubject = document.getElementById('subjectInput');
const emailMessage = document.getElementById('msgInput');
const evidenceCardData = [];
const API_URL = "https://breakingsilencepress-webgithubio-production.up.railway.app";
let isEditing = false;
let editingId = null;
let editingEvidence = null;

dashBoardWrapper.style.display = "flex";

let newSubs = 0;
const allSubscribers = [];

getEvidences();
let currentList = allSubscribers;
if(!isAdmin){
    window.location.href = "admin-login.html";
}

getEmailLogs();

sendMail.addEventListener('click', async () => {
    const subject = emailSubject.value.trim();
    const message = emailMessage.value.trim();
    
    if(!subject || !message) return;
    
    sendMail.disabled = true;
    sendMail.textContent = "Sending...";
    
    const response = await fetch(`${API_URL}/send-email`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}` 
        },
        body: JSON.stringify({ subject, message })
    });
    
    if(response.ok){
        sendMail.textContent = "Sent!";
        await getEmailLogs();
        setTimeout(() => {
            sendMail.disabled = false;
            sendMail.textContent = "Send";
        }, 2000);
    } else {
        const data = await response.json();
        alert(data.error);
        sendMail.disabled = false;
        sendMail.textContent = "Send";
    }
});

sendEmailBtn.addEventListener('click', () => {
    evidenceLibraryWrapper.style.display = "none";
    dashBoardWrapper.style.display = "none";
    sendEmaiWrapper.style.display = "flex";
});

evidenceLibraryBtn.addEventListener('click', () => {
    sendEmaiWrapper.style.display = "none";
    dashBoardWrapper.style.display = "none";
    evidenceLibraryWrapper.style.display = "flex";
});

dashBoardBtn.addEventListener('click', () => {
    evidenceLibraryWrapper.style.display = "none";
    sendEmaiWrapper.style.display = "none";
    dashBoardWrapper.style.display = "flex";
});

nextPopupBtn.addEventListener('click', () => {
    addEvidenceWrapper.classList.add('hide');
    documentDetailWrapper.classList.add('show');
});

backPopupBtn.addEventListener('click', () => {
    documentDetailWrapper.classList.remove('show');
    addEvidenceWrapper.classList.remove('hide');
});

async function getSubscribers() {
    try {
        allSubscribers.splice(0, allSubscribers.length);
        newSubs = 0; // reset here, not in renderSubscribers
        const response = await fetch(`${API_URL}/subscribers`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch subscribers");
        const data = await response.json();

        const now = new Date();
        const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // 7 days ago
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);

        let todayCount = 0;
        let yesterdayCount = 0;
        let weekCount = 0;

        data.subscribers.forEach(subscriber => {
            const subDate = new Date(subscriber.subscribedAt);
            const subDateStr = subDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            if (subDateStr === todayStr) todayCount++;
            if (subDateStr === yesterdayStr) yesterdayCount++;
            if (subDate >= weekAgo) weekCount++;

            allSubscribers.push(subscriber);
        });

        newSubsToday.textContent = todayCount;
        totalSubs.textContent = allSubscribers.length;

        // update the stat subtext spans
        document.querySelector('.stats-overview .card:nth-child(1) .stat-subtext').innerHTML =
            `<i class="fas fa-arrow-up"></i> ${weekCount} this week`;
        document.querySelector('.stats-overview .card:nth-child(3) .stat-subtext').innerHTML =
            `<i class="fas fa-arrow-up"></i> ${yesterdayCount} from yesterday`;

        renderSubscribers();
    } catch (err) {
        alert("Error loading subscribers: " + err.message);
    }
}

function renderSubscribers(list = allSubscribers){
    subscribers.innerHTML = "";
    newSubs = 0;
    list.forEach(subscriber => {
        const email = subscriber.email;
        const date = new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const id = subscriber._id;
        const subscriberDiv = document.createElement('div');
        subscriberDiv.className = "subscriber";
        subscriberDiv.innerHTML = `    
        <p class="email">${email}</p>
        <p class="date">${date}</p>
        <p class="status"><i class="fas fa-circle"></i>Active</p>
        <div class="actions">
            <button class="delete">Delete</button>
            <button class="copy"><i class="fa-regular fa-copy"></i></button>
        </div>`;

        const copyBtn = subscriberDiv.querySelector('.copy');
        const deleteBtn = subscriberDiv.querySelector('.delete');

        copyBtn.addEventListener('click', () => {
            copyBtn.disabled = true;
            navigator.clipboard.writeText(email).catch(() => {
                alert("Failed to copy");
            });
            copyBtn.innerHTML = `<i class="fa-solid fa-check" style="color: #03b803;"></i>`;

            setTimeout(() => {
                copyBtn.disabled = false;
                copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i>`;
            }, 1000);
        });

        deleteBtn.addEventListener('click', async () => {
            deleteBtn.disabled = true;
            const response = await fetch(`${API_URL}/subscriber/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },
            });
            if (response.ok) {
                const index = allSubscribers.findIndex(s => s._id === id);
                if (index !== -1) allSubscribers.splice(index, 1);
                currentList = currentList.filter(s => s._id !== id);
                renderSubscribers(currentList);
            } else {
                deleteBtn.disabled = false;
                alert("Failed to delete");
            }
        });
        subscribers.appendChild(subscriberDiv);
    })
}

function searchEmail() {
    const query = emailSearchInput.value.toLowerCase();
    currentList = allSubscribers.filter(subscriber =>
        subscriber.email.toLowerCase().startsWith(query)
    );
    renderSubscribers(currentList);
}

async function getEmailLogs() {
    try {
        const response = await fetch(`${API_URL}/email-logs`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` }
        });
        const data = await response.json();
        if(response.ok){
            const logs = data.logs;
            // update stat card
            document.querySelector('.stats-overview .card:nth-child(2) .stats-content').textContent = logs.length;
            if(logs.length > 0){
                const lastDate = new Date(logs[0].sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                document.querySelector('.stats-overview .card:nth-child(2) .stat-date').textContent = `Last: ${lastDate}`;
            }
            // render sent emails list
            const list = document.getElementById('sentEmailsList');
            list.innerHTML = "";
            logs.forEach(log => {
                const date = new Date(log.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const item = document.createElement('div');
                item.className = "email";
                item.innerHTML = `
                    <div class="email-data">
                        <p class="heading">${log.subject}</p>
                        <p class="date">${date}</p>
                    </div>
                    <p class="recipients">${log.recipients} recipients</p>
                `;
                list.appendChild(item);
            });
        }
    } catch(err) {
        // silent fail
    }
}

function renderEvidences(){
    adminEvidenceCards.innerHTML = "";
    evidenceCardData.forEach(evidence => {
        const date = new Date(evidence.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `
        <div class="tags">
            <p class="qr-code">${evidence.qrCode}</p>
            <p class="chapter">${evidence.chapter}</p>
        </div>
        <span class="separator"></span>
        <h3 class="card-heading">${evidence.heading}</h3>
        <p class="date"><i class="fa-solid fa-calendar"></i>${date}</p>
        <p class="card-des">${evidence.description}</p>
        <div class="cta">
            <button class="download"><i class="fa-solid fa-download"></i>Download</button>
            <button class="read"><i class="fa-brands fa-readme"></i>Read</button>
        </div>
        <span class="separator"></span>
        <div class="card-actions">
            <button class="edit"><i class="fa-regular fa-pen-to-square"></i>Edit</button>
            <button class="remove"><i class="fa-solid fa-trash"></i>Remove</button>
        </div>`;
        adminEvidenceCards.appendChild(card);

        const editBtn = card.querySelector('.edit')
        const removeBtn = card.querySelector('.remove')

        removeBtn.addEventListener('click', async () => {
            removeBtn.disabled = true;
            const id = evidence._id;
            const response = await fetch(`${API_URL}/evidence/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },
            });
            if (response.ok) {
                const index = evidenceCardData.findIndex(s => s._id === id);
                evidenceCardData.splice(index, 1);
                renderEvidences();
            } else {
                removeBtn.disabled = false;
                alert("Failed to delete");
            }
        });
        editBtn.addEventListener('click', () => {    
            submitPopupBtn.textContent = "Edit";
            isEditing = true;
            editingId = evidence._id;
            editingEvidence = evidence;
            addEvidencePopup.classList.add("show");
            mainContentLibrary.style.overflowY = "hidden";
            adminPopupInputs.forEach(input => {
                if(input.dataset.field === 'date'){
                    input.value = evidence.date.slice(0, 10);
                } else {
                    input.value = evidence[input.dataset.field];
                }
            });
        });
    });
}

async function getEvidences(){
    evidenceCardData.splice(0, evidenceCardData.length);
    try {
        const response = await fetch(`${API_URL}/evidences`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },
        });
        const data = await response.json();
        if (response.ok){
            data.evidences.forEach(evidence => evidenceCardData.push(evidence));
            renderEvidences();
            showingDocuments.textContent = evidenceCardData.length;
            totalDocuments.textContent = evidenceCardData.length;
        } else {
            // silent fail
        }
    } catch (err) {
        // silent fail
    }
}

async function sendEvidenceData(evidence){
    const response = await fetch(`${API_URL}/evidence`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}` 
        },
        body: JSON.stringify(evidence)
    });
    if(response.status === 409){
        alert("Card Already exists");
        return false;
    } else if(response.ok){
        return true;
    } else {
        const data = await response.json();
        alert(data.error);
        return false;
    }
}

function closeAdminPopup(){
    addEvidencePopup.classList.remove("show");
    mainContentLibrary.style.overflowY = "auto";
    isEditing = false;
    editingId = null;
    submitPopupBtn.innerHTML = `<i class="fa-solid fa-plus"></i>Add Evidence`;
    addEvidenceWrapper.classList.remove('hide');
    documentDetailWrapper.classList.remove('show');
}

submitPopupBtn.addEventListener('click', async () => {
    let allValid = 0;
    if(isEditing){
        const updatedEvidence = {};
        adminPopupInputs.forEach(input => {
            updatedEvidence[input.dataset.field] = input.value.trim();
        });
        const response = await fetch(`${API_URL}/evidence/${editingId}`, {
            method: "PUT",
            headers: { 
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(updatedEvidence)
        });
        if(response.ok){
            isEditing = false;
            editingId = null;
            await getEvidences();
            submitPopupBtn.textContent = "Saved!";
            await new Promise(resolve => setTimeout(resolve, 800));
            closeAdminPopup();
        } else {
            alert("Failed to edit");
        }
    } else {
       adminPopupInputs.forEach(input => {
            const parent = input.closest('.add-evidence-popup-input') || input.closest('.document-details-popup-input');
            if(input.value.trim() === ""){
                parent.querySelector('.error').style.display = "flex";
                return;
            } else {
                parent.querySelector('.error').style.display = "none";
                allValid++;
            }
        });
        if(allValid === 14){
            const evidence = {};
            adminPopupInputs.forEach(input => {
                evidence[input.dataset.field] = input.value.trim();
            })
            evidenceCardData.push(evidence);
            submitPopupBtn.disabled = true;
            submitPopupBtn.textContent = "Saving...";
            const saved = await sendEvidenceData(evidence);
            submitPopupBtn.disabled = false;
            if(saved){
                await getEvidences();
                submitPopupBtn.textContent = "Saved!";
                await new Promise(resolve => setTimeout(resolve, 800));
                closeAdminPopup();
            } else {
                submitPopupBtn.innerHTML = `<i class="fa-solid fa-plus"></i>Add Evidence`;
            }
        }
    }
});

addEvidenceBtn.addEventListener('click', () => {
    addEvidencePopup.classList.add("show");
    mainContentLibrary.style.overflowY = "hidden";
    if(isEditing){
        submitPopupBtn.textContent = "Edit";
    } else {
        submitPopupBtn.innerHTML = `<i class="fa-solid fa-plus"></i>Add Evidence`;
    }
});

evidenceSearchInput.addEventListener('input', () => {
    const cardsHeading = document.querySelectorAll('.admin-evidence-cards .card .card-heading');
    let showing = 0;
    cardsHeading.forEach(cardHeading => {
        if(!cardHeading.textContent.toLowerCase().startsWith(evidenceSearchInput.value.toLowerCase())){
            cardHeading.closest(".card").style.display = "none";
        } else {
            cardHeading.closest(".card").style.display = "flex";
            showing++;
        }
    });
    showingDocuments.textContent = showing;
});

chapterSelect.addEventListener('change', () => {
    cardsChapter.forEach(cardChapter => {
        if(chapterSelect.value.toLowerCase() === "all chapters"){
            cardChapter.closest(".card").style.display = "flex";
        } else if(!(cardChapter.textContent.toLowerCase() === chapterSelect.value.toLowerCase())){
            cardChapter.closest(".card").style.display = "none";
        } else {
            cardChapter.closest(".card").style.display = "flex";
        }
    });
});

emailSearchInput.addEventListener('input', searchEmail);

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
});

getSubscribers();
