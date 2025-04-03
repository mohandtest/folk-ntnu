// Save checklist state to localStorage
function saveChecklistState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const state = {};
    
    checkboxes.forEach(checkbox => {
        state[checkbox.id] = checkbox.checked;
    });
    
    localStorage.setItem('fysikkChecklistState', JSON.stringify(state));
    
    // Show save confirmation
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Lagret!';
    saveBtn.disabled = true;
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }, 1500);
}

// Load checklist state from localStorage
function loadChecklistState() {
    const savedState = localStorage.getItem('fysikkChecklistState');
    
    if (savedState) {
        const state = JSON.parse(savedState);
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (state[checkbox.id] !== undefined) {
                checkbox.checked = state[checkbox.id];
            }
        });
    }
}

// Clear all checkboxes
function clearAllCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    saveChecklistState();
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save-btn');
    const clearBtn = document.getElementById('clear-btn');
    const backBtn = document.getElementById('back-btn');
    
    saveBtn.addEventListener('click', saveChecklistState);
    
    clearBtn.addEventListener('click', () => {
        if (confirm('Er du sikker på at du vil tømme alle merkede oppgaver?')) {
            clearAllCheckboxes();
        }
    });
    
    backBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    // Auto-save when checkboxes are changed
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveChecklistState);
    });
});