chrome.storage.sync.get('settings', function(storedData) {
    const checkboxes = document.querySelectorAll("input[type=checkbox]");
    if (storedData.settings?.enabledFeatures?.length > 0) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = storedData.settings.enabledFeatures.indexOf(checkbox.value) !== -1;
        });
    }

    let settings = storedData.settings || { enabledFeatures: []};
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            settings.enabledFeatures = Array.from(checkboxes)
                                .filter(i => i.checked)
                                .map(i => i.value);
            chrome.storage.sync.set({ 'settings': settings });
        });
    });
});