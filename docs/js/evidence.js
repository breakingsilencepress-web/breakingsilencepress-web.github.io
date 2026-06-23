// Evidence Library — Static JSON version
// Backend removed. Data now served from evidence.json on GitHub Pages.
// All PDFs hosted on Internet Archive.

let documentNames = [];
let documentsVisible = [];
let evidenceCardData = [];

const searchBar = document.getElementById('searchBarInput');
const searchIcon = document.getElementById('searchIcon');
const noDocument = document.querySelector('.no-document');
const evidenceCards = document.querySelector('.evidence-cards');
const readMorePopup = document.querySelector('.readmore-popup');

getEvidences();

async function getEvidences() {
    evidenceCardData.splice(0, evidenceCardData.length);
    try {
        const response = await fetch('./evidence.json');
        const evidences = await response.json();
        if (evidences && evidences.length) {
            evidences.forEach(evidence => evidenceCardData.push(evidence));
            renderEvidences();
        }
    } catch (err) {
        console.log('Evidence load error: ' + err.message);
    }
}

function downloadFile(downloadUrl, filename) {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank';
    a.download = filename || downloadUrl.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function performSearch() {
    documentsVisible = [];
    documentNames.forEach(doc => {
        if (!doc.textContent.toLowerCase().startsWith(searchBar.value.toLowerCase())) {
            doc.closest('.card').classList.add('hide');
        } else {
            doc.closest('.card').classList.remove('hide');
        }
        if (!doc.closest('.card').classList.contains('hide')) {
            documentsVisible.push(doc);
        }
    });
    if (noDocument) {
        noDocument.style.display = documentsVisible.length === 0 ? 'flex' : 'none';
    }
}

if (searchIcon) {
    searchIcon.addEventListener('click', performSearch);
}

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q');
    if (searchTerm && searchBar) {
        searchBar.value = searchTerm;
        performSearch();
    }
});

function renderEvidences() {
    if (!evidenceCards) return;
    evidenceCards.innerHTML = '';
    evidenceCardData.forEach(evidence => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
        <div class="tags">
            <p class="qr-code">${evidence.id || ''}</p>
            <p class="chapter">${evidence.chapter || ''}</p>
        </div>
        <h3 class="evidence-cards-heading">${evidence.title || ''}</h3>
        <p class="date">${evidence.date || ''}</p>
        <p class="card-info">${evidence.description || ''}</p>
        <div class="card-cta">
            <button class="read">↗ Read Online</button>
            <button class="download btn-ev-download">↓ Download</button>
        </div>
        <button class="read-more readMoreBtn">Read More</button>`;
        evidenceCards.appendChild(card);

        const downloadBtn = card.querySelector('.download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                downloadFile(evidence.downloadUrl, evidence.title);
            });
        }

        const readBtn = card.querySelector('.read');
        if (readBtn) {
            readBtn.addEventListener('click', () => window.open(evidence.originalUrl, '_blank'));
        }

        const readMoreBtn = card.querySelector('.readMoreBtn');
        if (readMoreBtn) {
            readMoreBtn.addEventListener('click', () => {
                if (!readMorePopup) return;
                readMorePopup.classList.add('show');
                const readmoreWrapper = document.createElement('div');
                readmoreWrapper.className = 'readmore-wrapper';
                readmoreWrapper.innerHTML = `
                <div class="header">
                    <div class="header-start">
                        <p class="qr-code">${evidence.id || ''}</p>
                        <h3 class="heading">${evidence.title || ''}</h3>
                    </div>
                    <button class="close-btn" id="closeReadMorePopup">✕</button>
                </div>
                <div class="content">
                    <div class="source-box readmore-box">
                        <p class="heading">SOURCE</p>
                        <p class="info">${evidence.source || '—'}</p>
                    </div>
                    <div class="filetype-box readmore-box">
                        <p class="heading">FILE TYPE</p>
                        <p class="info">PDF</p>
                    </div>
                    <div class="download-date-box readmore-box">
                        <p class="heading">DATE</p>
                        <p class="info">${evidence.date || '—'}</p>
                    </div>
                    <div class="download-date-box readmore-box">
                        <p class="heading">COPYRIGHT</p>
                        <p class="info">${evidence.copyright || '—'}</p>
                    </div>
                    <div class="orignal-url-box readmore-box">
                        <p class="heading">ORIGINAL URL</p>
                        <p class="info url">${evidence.originalUrl || '—'}</p>
                    </div>
                    <div class="description-box readmore-box">
                        <p class="heading">DESCRIPTION</p>
                        <p class="info">${evidence.description || '—'}</p>
                    </div>
                    <div class="relevance-box readmore-box">
                        <p class="heading">RELEVANCE</p>
                        <p class="info">${evidence.relevance || '—'}</p>
                    </div>
                </div>
                <div class="readmore-cta">
                    <button class="readmore-close">Close</button>
                    <button class="readmore-download">↓ Download</button>
                </div>`;

                const closeBtn = readmoreWrapper.querySelector('.close-btn');
                const closeBtn2 = readmoreWrapper.querySelector('.readmore-close');
                const dlBtn = readmoreWrapper.querySelector('.readmore-download');

                if (closeBtn) closeBtn.addEventListener('click', () => readMorePopup.classList.remove('show'));
                if (closeBtn2) closeBtn2.addEventListener('click', () => readMorePopup.classList.remove('show'));
                if (dlBtn) dlBtn.addEventListener('click', () => downloadFile(evidence.downloadUrl, evidence.title));

                readMorePopup.innerHTML = '';
                readMorePopup.appendChild(readmoreWrapper);
            });
        }
    });
    documentNames = document.querySelectorAll('.evidence-cards-heading');
}
