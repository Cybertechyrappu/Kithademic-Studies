// Custom UI Dialogs Logic
const dialogModal = document.getElementById('customDialog');
const dialogTitle = document.getElementById('dialogTitle');
const dialogMessage = document.getElementById('dialogMessage');
const dialogButtons = document.getElementById('dialogButtons');

function openDialog() {
    if (!dialogModal) return;
    dialogModal.classList.remove('hidden', 'modal-exit');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => dialogModal.classList.add('modal-visible'));
    });
}

/**
 * Closes the custom dialog modal with animation
 */
export const closeCustomDialog = () => {
    if (!dialogModal) return;
    dialogModal.classList.remove('modal-visible');
    dialogModal.classList.add('modal-exit');
    setTimeout(() => {
        dialogModal.classList.add('hidden');
        dialogModal.classList.remove('modal-exit');
    }, 280);
};

/**
 * Shows a custom alert dialog with OK button
 */
export const showCustomAlert = (title, message) => {
    dialogTitle.innerText = title;
    dialogMessage.innerText = message;
    dialogButtons.innerHTML = `<button class="btn-gold" id="confirmAlert">OK</button>`;
    document.getElementById('confirmAlert').onclick = closeCustomDialog;
    openDialog();
};

/**
 * Shows a custom confirm dialog with Cancel and Confirm buttons
 */
export const showCustomConfirm = (title, message, onConfirmCallback) => {
    dialogTitle.innerText = title;
    dialogMessage.innerText = message;
    dialogButtons.innerHTML = `
        <button class="btn-cancel" id="cancelConfirm">Cancel</button>
        <button class="btn-gold" id="okConfirm">Confirm</button>
    `;
    document.getElementById('cancelConfirm').onclick = closeCustomDialog;
    document.getElementById('okConfirm').onclick = () => {
        closeCustomDialog();
        if (onConfirmCallback) onConfirmCallback();
    };
    openDialog();
};
