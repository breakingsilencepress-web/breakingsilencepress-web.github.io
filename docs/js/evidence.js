const searchBar = document.getElementById('searchBarInput');
const searchIcon = document.getElementById('searchIcon');
const noDocument = document.querySelector('.no-document');
const evidenceCards = document.querySelector('.evidence-cards');
const readMorePopup = document.querySelector('.readmore-popup');
let documentNames = [];
let documentsVisible = [];
const API_URL = "https://breakingsilencepress-webgithubio-production.up.railway.app";
evidenceCardData = [];

getEvidences();

async function downloadFile(url, filename) {
    window.location.href = `${API_URL}/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename || url.split('/').pop())}`;
}

function performSearch() {
    documentsVisible = [];
    documentNames.forEach(doc => {
        if(!doc.textContent.toLowerCase().startsWith(searchBar.value.toLowerCase())){
            doc.closest('.card').classList.add('hide');
        } else {
            doc.closest('.card').classList.remove('hide');
        }
        if(!doc.closest('.card').classList.contains('hide')){
            documentsVisible.push(doc);
        }
    });
    if(documentsVisible.length == 0){
        noDocument.style.display = "flex";
    } else {
        noDocument.style.display = "none";
    }
}

if(searchIcon){
    searchIcon.addEventListener('click', performSearch);
}

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q');
    if (searchTerm) {
        searchBar.value = searchTerm;
        performSearch();
    }
});

async function getEvidences(){
    evidenceCardData.splice(0, evidenceCardData.length);
    try {
        const response = await fetch(`${API_URL}/evidences-public`);
        const data = await response.json();
        if (response.ok){
            data.evidences.forEach(evidence => evidenceCardData.push(evidence));
            renderEvidences();
        }
    } catch (err) {
        // silent fail
    }
}

function renderEvidences(){
    evidenceCards.innerHTML = "";
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
        <h3 class="evidence-cards-heading">${evidence.heading}</h3>
        <p class="date"><i class="fa-solid fa-calendar"></i>${date}</p>
        <p class="card-info">${evidence.description}</p>
        <div class="card-cta">
            <a href="evidence/hornback-case.html" class="btn-ev-readmore">Read More →</a>
            <button class="read"><i class="fa-brands fa-readme"></i> Read Online</button>
            <button class="download btn-ev-download">Download</button>
        </div>
        <button class="read-more readMoreBtn">Read More</button>`;
        evidenceCards.appendChild(card);

        const downloadBtn = card.querySelector('.download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                downloadFile(evidence.downloadUrl, evidence.heading);
            });
        }

        card.querySelector('.read').addEventListener('click', () => window.open(evidence.readUrl, '_blank'));

        const readMoreBtn = card.querySelector('.readMoreBtn');
        readMoreBtn.addEventListener('click', () => {
            readMorePopup.classList.add('show');
            const readmoreWrapper = document.createElement('div');
            readmoreWrapper.className = "readmore-wrapper";
            readmoreWrapper.innerHTML = `<div class="header">
                <div class="header-start">
                    <p class="qr-code">${evidence.qrCode}</p>
                    <h3 class="heading">${evidence.heading}</h3>
                </div>
                <button class="close-btn" id="closeReadMorePopup">X</button>
            </div>
            <div class="content">
                <div class="source-box readmore-box">
                    <p class="heading">SOURCE</p>
                    <p class="info">${evidence.source}</p>
                </div>
                <div class="filetype-box readmore-box">
                    <p class="heading">FILE TYPE</p>
                    <p class="info">${evidence.fileType}</p>
                </div>
                <div class="download-date-box readmore-box">
                    <p class="heading">DOWNLOAD DATE</p>
                    <p class="info">${evidence.downloadDate}</p>
                </div>
                <div class="download-date-box readmore-box">
                    <p class="heading">COPYRIGHT</p>
                    <p class="info">${evidence.copyRightStatus}</p>
                </div>
                <div class="orignal-url-box readmore-box">
                    <p class="heading">ORIGINAL URL</p>
                    <p class="info url">${evidence.originalUrl}</p>
                </div>
                <div class="description-box readmore-box">
                    <p class="heading">DESCRIPTION</p>
                    <p class="info url">${evidence.moreDescription}</p>
                </div>
                <div class="relevance-box readmore-box">
                    <p class="heading">RELEVANCE</p>
                    <p class="info">${evidence.relevance}</p>
                </div>
            </div>
            <div class="readmore-cta">
                <button class="readmore-close">Close</button>
                <button class="readmore-download">Download</button>
            </div>`

            const closeReadMorePopup = readmoreWrapper.querySelector('.close-btn');
            const closeReadMorePopupButton = readmoreWrapper.querySelector('.readmore-close');

            if(closeReadMorePopupButton){
                closeReadMorePopupButton.addEventListener('click', () => {
                    readMorePopup.classList.remove("show")
                });
            }

            if(closeReadMorePopup){
                closeReadMorePopup.addEventListener('click', () => {
                    readMorePopup.classList.remove("show")
                });
            }

            readMorePopup.innerHTML = "";
            readMorePopup.appendChild(readmoreWrapper);

            const readMoreDownloadBtn = readmoreWrapper.querySelector('.readmore-download');
            if (readMoreDownloadBtn) {
                readMoreDownloadBtn.addEventListener('click', () => {
                    downloadFile(evidence.downloadUrl, evidence.heading);
                });
            }
        });
    });
    documentNames = document.querySelectorAll('.evidence-cards-heading');
};
