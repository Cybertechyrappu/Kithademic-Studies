// Custom UI Dialogs Logic
const dialogModal = document.getElementById('customDialog');
const dialogTitle = document.getElementById('dialogTitle');
const dialogMessage = document.getElementById('dialogMessage');
const dialogButtons = document.getElementById('dialogButtons');

/**
 * Closes the custom dialog modal
 */
export const closeCustomDialog = () => dialogModal.classList.add('hidden');

/**
 * Shows a custom alert dialog with OK button
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message content
 */
export const showCustomAlert = (title, message) => {
    dialogTitle.innerText = title;
    dialogMessage.innerText = message;
    dialogButtons.innerHTML = `<button class="btn-gold" id="confirmAlert">OK</button>`;
    // Use onclick property to prevent memory leaks from multiple event listeners
    document.getElementById('confirmAlert').onclick = closeCustomDialog;
    dialogModal.classList.remove('hidden');
};

/**
 * Shows a custom confirm dialog with Cancel and Confirm buttons
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message content
 * @param {Function} onConfirmCallback - Callback function executed on confirmation
 */
export const showCustomConfirm = (title, message, onConfirmCallback) => {
    dialogTitle.innerText = title;
    dialogMessage.innerText = message;
    dialogButtons.innerHTML = `
        <button class="btn-cancel" id="cancelConfirm">Cancel</button>
        <button class="btn-gold" id="okConfirm">Confirm</button>
    `;

    // Use onclick property to prevent memory leaks from multiple event listeners
    document.getElementById('cancelConfirm').onclick = closeCustomDialog;
    document.getElementById('okConfirm').onclick = () => {
        closeCustomDialog();
        if (onConfirmCallback) onConfirmCallback();
    };
    dialogModal.classList.remove('hidden');
};
