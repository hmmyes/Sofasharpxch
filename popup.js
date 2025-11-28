document.addEventListener('DOMContentLoaded', () => {
    const betPersistenceToggle = document.getElementById('betPersistence');
    const statusDiv = document.getElementById('status');

    chrome.storage.sync.get(['betPersistence'], (result) => {
        betPersistenceToggle.checked = result.betPersistence !== undefined ? result.betPersistence : true;
    });

    betPersistenceToggle.addEventListener('change', () => {
        const isEnabled = betPersistenceToggle.checked;

        chrome.storage.sync.set({ betPersistence: isEnabled }, () => {
            statusDiv.textContent = 'Ayarlar kaydedildi';
            statusDiv.className = 'status saved';

            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = 'status';
            }, 2000);
        });

        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'toggleBetPersistence',
                    enabled: isEnabled
                }).catch(() => { });
            });
        });
    });
});
