// Custom UI Dialogs Logic
const dialogModal = document.getElementById('customDialog');
const dialogTitle = document.getElementById('dialogTitle');
const dialogMessage = document.getElementById('dialogMessage');
const dialogButtons = document.getElementById('dialogButtons');

export const closeCustomDialog = () => dialogModal.classList.add('hidden');

export const showCustomAlert = (title, message) => {
    dialogTitle.innerText = title; 
    dialogMessage.innerText = message;
    dialogButtons.innerHTML = `<button class="btn-gold" id="confirmAlert">OK</button>`;
    document.getElementById('confirmAlert').addEventListener('click', closeCustomDialog);
    dialogModal.classList.remove('hidden');
};

export const showCustomConfirm = (title, message, onConfirmCallback) => {
    dialogTitle.innerText = title; 
    dialogMessage.innerText = message;
    dialogButtons.innerHTML = `
        <button class="btn-cancel" id="cancelConfirm">Cancel</button>
        <button class="btn-gold" id="okConfirm">Confirm</button>
    `;
    
    document.getElementById('cancelConfirm').addEventListener('click', closeCustomDialog);
    document.getElementById('okConfirm').addEventListener('click', () => {
        closeCustomDialog();
        if (onConfirmCallback) onConfirmCallback();
    });
    dialogModal.classList.remove('hidden');
};
