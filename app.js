// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
  });
}

let vaultData = JSON.parse(localStorage.getItem('vaultData')) || [];
let currentFilter = 'all';
let deferredPrompt;

const vaultList = document.getElementById('vault-list');
const entryModal = document.getElementById('entry-modal');
const vaultForm = document.getElementById('vault-form');
const modalTitle = document.getElementById('modal-title');
const installBanner = document.getElementById('install-banner');

document.addEventListener('DOMContentLoaded', () => {
    renderVault();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-tab');
            renderVault();
        });
    });

    document.getElementById('btn-add-modal').addEventListener('click', () => openModal());
    document.getElementById('btn-modal-close').addEventListener('click', closeModal);
    vaultForm.addEventListener('submit', handleFormSubmit);
    document.getElementById('btn-export-zip').addEventListener('click', exportVaultAsZip);

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBanner.classList.remove('hidden');
    });

    document.getElementById('btn-install').addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') installBanner.classList.add('hidden');
        deferredPrompt = null;
    });
}

function renderVault() {
    vaultList.innerHTML = '';
    const filtered = vaultData.filter(item => currentFilter === 'all' || item.category === currentFilter);

    if (filtered.length === 0) {
        vaultList.innerHTML = `<div class="empty-state" style="text-align:center; padding: 40px; color: var(--text-muted);">No entries saved under this section yet.</div>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = `vault-card item-${item.category}`;
        const backupCodesHTML = item.backups.length ? 
            `<div class="backup-section">
                <strong>Backup Codes (${item.backups.length}):</strong>
                <ul>${item.backups.map(code => `<li><code>${code}</code></li>`).join('')}</ul>
             </div>` : '';

        card.innerHTML = `
            <div class="card-meta">
                <span class="badge badge-${item.category}">${item.category.toUpperCase()}</span>
                <div class="card-actions">
                    <button onclick="editEntry('${item.id}')" class="btn-sm btn-edit">Edit</button>
                    <button onclick="deleteEntry('${item.id}')" class="btn-sm btn-delete">Delete</button>
                </div>
            </div>
            <h2>${escapeHtml(item.title)}</h2>
            <p><strong>ID/User:</strong> ${escapeHtml(item.identity || 'N/A')}</p>
            <p><strong>Key/Pass:</strong> <span class="masked-text" onclick="this.classList.toggle('unmasked')">${escapeHtml(item.secret || 'None')}</span></p>
            ${backupCodesHTML}
        `;
        vaultList.appendChild(card);
    });
}

function openModal(editId = null) {
    vaultForm.reset();
    document.getElementById('entry-id').value = '';
    modalTitle.innerText = "New Entry";

    if (editId) {
        const item = vaultData.find(v => v.id === editId);
        if (item) {
            modalTitle.innerText = "Edit Entry";
            document.getElementById('entry-id').value = item.id;
            document.getElementById('entry-category').value = item.category;
            document.getElementById('entry-title').value = item.title;
            document.getElementById('entry-identity').value = item.identity;
            document.getElementById('entry-secret').value = item.secret;
            document.getElementById('entry-backup').value = item.backups.join('\n');
        }
    }
    entryModal.classList.remove('hidden');
}

function closeModal() {
    entryModal.classList.add('hidden');
}

function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('entry-id').value || 'id_' + Date.now();
    const category = document.getElementById('entry-category').value;
    const title = document.getElementById('entry-title').value;
    const identity = document.getElementById('entry-identity').value;
    const secret = document.getElementById('entry-secret').value;
    const backupText = document.getElementById('entry-backup').value;

    const backups = backupText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const targetIndex = vaultData.findIndex(v => v.id === id);
    const entryPayload = { id, category, title, identity, secret, backups };

    if (targetIndex > -1) {
        vaultData[targetIndex] = entryPayload;
    } else {
        vaultData.push(entryPayload);
    }

    saveAndRefresh();
    closeModal();
}

function deleteEntry(id) {
    if(confirm("Are you sure you want to delete this secret entry?")) {
        vaultData = vaultData.filter(v => v.id !== id);
        saveAndRefresh();
    }
}

function editEntry(id) { openModal(id); }
function saveAndRefresh() {
    localStorage.setItem('vaultData', JSON.stringify(vaultData));
    renderVault();
}

function exportVaultAsZip() {
    if(vaultData.length === 0) {
        alert("Your vault is empty! Add data before exporting.");
        return;
    }
    const zip = new JSZip();
    const rawJson = JSON.stringify(vaultData, null, 2);
    zip.file("pass-vault-backup.json", rawJson);

    let humanReadableText = "=== PASS-VAULT SECURITY ARCHIVE ===\n\n";
    vaultData.forEach((item, index) => {
        humanReadableText += `${index + 1}. [${item.category.toUpperCase()}] ${item.title}\n`;
        humanReadableText += `   Identity/User : ${item.identity || 'N/A'}\n`;
        humanReadableText += `   Key/Password  : ${item.secret || 'N/A'}\n`;
        if(item.backups.length) {
            humanReadableText += `   2FA Multi-Codes:\n` + item.backups.map(c => `     - ${c}`).join('\n') + '\n';
        }
        humanReadableText += `------------------------------------------------------\n\n`;
    });
    zip.file("readable-passwords-manifest.txt", humanReadableText);

    zip.generateAsync({type:"blob"}).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `PassVault_Backup_${new Date().toISOString().slice(0,10)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
