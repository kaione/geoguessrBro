chrome.storage.sync.get('enabledSettings', function(storedData) {
    const checkboxes = document.querySelectorAll("input[type=checkbox]");
    if (storedData.enabledSettings?.length > 0) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = storedData.enabledSettings.indexOf(checkbox.value) !== -1;
        });
    }

    let enabledSettings = storedData.enabledSettings || [];
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            enabledSettings = Array.from(checkboxes)
                                .filter(i => i.checked)
                                .map(i => i.value);
            chrome.storage.sync.set({ 'enabledSettings': enabledSettings });
        });
    });
});