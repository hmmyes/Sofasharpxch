console.log("SharpXch SofaScore Extension - Started v4.2 (Simplified Settings)");

let lastProcessedUrl = '';

// Global Set to track which matches have already been processed (by player names hash)
const processedMatches = new Set();

// --- SofaScore Icon Logic ---
function injectSofaScoreIcons() {
    // Clear processed matches Set if URL changed (navigating to different page)
    const currentUrl = window.location.href;
    if (currentUrl !== lastProcessedUrl) {
        processedMatches.clear();
        lastProcessedUrl = currentUrl;
    }

    const infoIcons = document.querySelectorAll('.fa2-info-square');

    infoIcons.forEach((icon) => {
        if (icon.offsetParent === null) return;

        // Skip if this icon was already processed
        if (icon.dataset.processed === 'true') return;

        // Skip if icon already has link next to it
        const next = icon.nextElementSibling;
        if (next && next.classList.contains('sofascore-link')) {
            icon.dataset.processed = 'true';
            return;
        }

        const row = icon.closest('tr') || icon.closest('div[class*="row"]') || icon.closest('div[class*="match"]') || icon.closest('div[class*="event"]');

        if (row) {
            const playerNames = getPlayerNames(row);
            if (playerNames && playerNames.length >= 2) {
                // Create unique identifier based on player names
                const linkId = `sofa-${playerNames[0].toLowerCase().replace(/\s+/g, '-')}-${playerNames[1].toLowerCase().replace(/\s+/g, '-')}`;

                // FIRST CHECK: Has this match already been processed globally?
                if (processedMatches.has(linkId)) {
                    icon.dataset.processed = 'true';
                    return;
                }

                // SECOND CHECK: Does row already have ANY sofascore link?
                if (row.querySelector('.sofascore-link')) {
                    icon.dataset.processed = 'true';
                    processedMatches.add(linkId); // Track it globally
                    return;
                }

                // THIRD CHECK: Double-check specific ID doesn't exist
                if (row.querySelector(`[data-sofa-id="${linkId}"]`)) {
                    icon.dataset.processed = 'true';
                    processedMatches.add(linkId);
                    return;
                }

                // All checks passed - add the icon
                addIcon(icon, playerNames, linkId);
                icon.dataset.processed = 'true';
                processedMatches.add(linkId); // Track globally
            }
        } else {
            const container = icon.parentElement?.parentElement;
            if (container) {
                const playerNames = getPlayerNames(container);
                if (playerNames && playerNames.length >= 2) {
                    // Create unique identifier based on player names
                    const linkId = `sofa-${playerNames[0].toLowerCase().replace(/\s+/g, '-')}-${playerNames[1].toLowerCase().replace(/\s+/g, '-')}`;

                    // FIRST CHECK: Has this match already been processed globally?
                    if (processedMatches.has(linkId)) {
                        icon.dataset.processed = 'true';
                        return;
                    }

                    // SECOND CHECK: Does container already have ANY sofascore link?
                    if (container.querySelector('.sofascore-link')) {
                        icon.dataset.processed = 'true';
                        processedMatches.add(linkId);
                        return;
                    }

                    // THIRD CHECK: Double-check specific ID doesn't exist
                    if (container.querySelector(`[data-sofa-id="${linkId}"]`)) {
                        icon.dataset.processed = 'true';
                        processedMatches.add(linkId);
                        return;
                    }

                    // All checks passed - add the icon
                    addIcon(icon, playerNames, linkId);
                    icon.dataset.processed = 'true';
                    processedMatches.add(linkId); // Track globally
                }
            }
        }
    });

    if (window.location.href.includes('/market/') || window.location.href.includes('/customer/sport/')) {
        const marketInfoContainer = document.querySelector('div[class*="marketDetailInfo"]') || document.querySelector('.biab_market-info');

        if (marketInfoContainer) {
            const playerNames = getPlayerNamesFromTitle();

            if (playerNames && playerNames.length >= 2) {
                const linkId = `sofa-${playerNames[0].toLowerCase().replace(/\s+/g, '-')}-${playerNames[1].toLowerCase().replace(/\s+/g, '-')}`;

                // Check global Set first
                if (processedMatches.has(linkId)) {
                    return;
                }

                // Check if link with this specific ID already exists
                if (marketInfoContainer.querySelector(`[data-sofa-id="${linkId}"]`)) {
                    processedMatches.add(linkId);
                    return;
                }

                const link = document.createElement('a');
                link.href = `https://www.google.com/search?q=${encodeURIComponent(`site:sofascore.com ${playerNames[0]} ${playerNames[1]}`)}&btnI=1`;
                link.target = '_blank';
                link.className = 'sofascore-link';
                link.dataset.sofaId = linkId;
                link.title = `SofaScore: ${playerNames.join(' vs ')}`;
                link.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;text-decoration:none;margin-left:10px;vertical-align:middle;cursor:pointer;float:right;';

                const img = document.createElement('img');
                img.src = chrome.runtime.getURL('logo_final.png');
                img.style.cssText = 'width:24px;height:24px;object-fit:contain;border:none;display:block;';
                img.onerror = function () {
                    this.style.display = 'none';
                    link.textContent = 'S';
                    link.style.cssText += 'color:#fff;font-weight:bold;font-size:18px;background-color:#374df5;width:28px;height:28px;border-radius:4px;text-align:center;line-height:28px;';
                };

                link.appendChild(img);
                link.addEventListener('click', (e) => e.stopPropagation());
                marketInfoContainer.appendChild(link);
                processedMatches.add(linkId); // Track globally
            }
        }
    }
}

function getPlayerNamesFromTitle() {
    for (let h of document.querySelectorAll('h1, h2')) {
        const text = h.innerText?.trim();
        if (text && text.length > 5) {
            const result = extractNamesFromText(text);
            if (result) return result;
        }
    }
    return null;
}

function extractNamesFromText(text) {
    if (!text) return null;
    text = text.replace(/starting\s+in\s+\d+\s+(minute|minutes)/gi, '').replace(/finished/gi, '').replace(/set\s+\d+/gi, '').replace(/\d+h\d+/gi, '').trim();
    const parts = text.split(/\s+(?:vs\.?|v\.?|@|-)\s+/i);
    return parts.length >= 2 ? [parts[0].trim(), parts[1].trim()] : null;
}

function getPlayerNames(row) {
    let candidates = [];
    row.querySelectorAll('*').forEach(el => {
        if (el.offsetParent && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' && !el.classList.contains('fa2-info-square') && !el.closest('.sofascore-link') && el.children.length === 0) {
            const text = el.innerText.trim();
            if (text.length >= 3 && !/^[\d\s:.,\-%+]+$/.test(text) && !['In-Play', 'Matched', '€', 'Back', 'Lay', 'Suspended', 'Active', 'Liability', 'Cash Out'].some(k => text.includes(k)) && /[a-zA-Z]/.test(text) && !candidates.includes(text)) {
                candidates.push(text);
            }
        }
    });
    candidates.sort((a, b) => b.length - a.length);
    return candidates.slice(0, 2);
}

function addIcon(targetElement, names, linkId) {
    const link = document.createElement('a');
    link.href = `https://www.google.com/search?q=${encodeURIComponent(`site:sofascore.com ${names[0]} ${names[1]}`)}&btnI=1`;
    link.target = '_blank';
    link.className = 'sofascore-link';
    link.dataset.sofaId = linkId;
    link.title = `SofaScore: ${names.join(' vs ')}`;
    link.style.cssText = 'display:inline-flex;align-items:center;text-decoration:none;margin-left:5px;';

    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('logo_final.png');
    img.style.cssText = 'width:18px;height:18px;object-fit:contain;border:none;display:block;';
    link.appendChild(img);
    link.addEventListener('click', (e) => e.stopPropagation());

    if (targetElement.parentNode) targetElement.parentNode.insertBefore(link, targetElement.nextSibling);
}

// --- Bet Persistence Logic ---
let betPersistenceEnabled = true;

chrome.storage.sync.get(['betPersistence'], (result) => {
    betPersistenceEnabled = result.betPersistence !== undefined ? result.betPersistence : true;
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'toggleBetPersistence') {
        betPersistenceEnabled = message.enabled;
        if (!betPersistenceEnabled) {
            betInputValues.clear();
            userIsClearing.clear();
        }
    }
});

const betInputValues = new Map();
const userIsClearing = new Map();

function preserveBetInputs() {
    if (!betPersistenceEnabled) return;
    document.querySelectorAll('input[id*="SIZE"], input.biab_form-input, input[class*="biab_form-input"]').forEach((input) => {
        if (input.dataset.persistenceActive) return;
        input.dataset.persistenceActive = 'true';

        input.addEventListener('input', (e) => {
            if (e.target.value?.trim()) betInputValues.set(input, e.target.value);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' || e.key === 'Delete' || (e.ctrlKey && e.key === 'a')) {
                userIsClearing.set(input, true);
                setTimeout(() => userIsClearing.delete(input), 100);
            }
        });

        new MutationObserver((mutations) => {
            mutations.forEach((mut) => {
                if (mut.type === 'attributes' && mut.attributeName === 'value') {
                    const savedValue = betInputValues.get(input);
                    if (!input.value && savedValue && !userIsClearing.has(input)) {
                        input.value = savedValue;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            });
        }).observe(input, { attributes: true, attributeFilter: ['value'] });

        let lastValue = input.value;
        setInterval(() => {
            if (!document.contains(input)) {
                betInputValues.delete(input);
                userIsClearing.delete(input);
                return;
            }
            const currentValue = input.value;
            if (!currentValue && lastValue && !userIsClearing.has(input)) {
                const savedValue = betInputValues.get(input);
                if (savedValue) {
                    input.value = savedValue;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
            lastValue = currentValue;
        }, 100);
    });
}

// --- Confirm Checkbox Toggle Logic ---
function injectConfirmBetsToggle() {
    // Find settings container directly using class
    const settingsContainers = document.querySelectorAll('.biab_settings, div[class*="_settings_"]');

    let settingsContainer = null;

    // Check each container for ALL three texts (must have all)
    for (const container of settingsContainers) {
        const containerText = container.textContent || '';
        if (containerText.includes('Confirm bets before placement') &&
            containerText.includes('Betting Profit and Loss') &&
            containerText.includes('Inline Betting')) {
            settingsContainer = container;
            console.log("SharpXch: Found the correct settings container with all three texts");
            break;
        }
    }

    if (!settingsContainer) {
        console.log("SharpXch: Settings container not found");
        return;
    }

    // Check if we already injected the toggle
    if (settingsContainer.querySelector('.sharpxch-checkbox-toggle')) return;

    // Make sure parent can hold absolute positioned elements
    const computedStyle = window.getComputedStyle(settingsContainer);
    if (computedStyle.position === 'static') {
        settingsContainer.style.position = 'relative';
    }

    console.log("SharpXch: Found confirm bets container, injecting toggle switch");

    // Allow overflow so toggle stays visible when container collapses
    settingsContainer.style.overflow = 'visible';

    // Clear old localStorage keys (only once)
    if (!localStorage.getItem('sharpXch_cleaned')) {
        localStorage.removeItem('sharpXch_confirm_visible');
        localStorage.removeItem('sharpXch_settings_hidden');
        localStorage.setItem('sharpXch_cleaned', 'true');
    }

    // Check if user has toggled manually before
    const userToggled = localStorage.getItem('sharpXch_toggle_v2');

    // Get initial state:
    // - If user toggled before, use that
    // - Otherwise start hidden by default
    let isVisible;
    if (userToggled !== null) {
        isVisible = userToggled !== 'hidden';
    } else {
        isVisible = false; // Default: hidden
    }

    injectToggleButton(settingsContainer, isVisible);
}

function injectToggleButton(settingsContainer, isVisible) {
    // Create minimalist character button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sharpxch-checkbox-toggle';
    toggleBtn.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        z-index: 2147483647;
        background-color: ${isVisible ? '#4CAF50' : '#999'};
        border: 1px solid rgba(255,255,255,0.5);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        width: 20px;
        height: 20px;
        font-size: 12px;
        transition: all 0.2s ease;
        padding: 0;
        color: white;
        font-weight: normal;
    `;
    toggleBtn.textContent = isVisible ? '−' : '+';
    toggleBtn.title = isVisible ? 'Gizle' : 'Göster';

    // Update toggle and container visibility
    const updateToggle = () => {
        const visible = localStorage.getItem('sharpXch_toggle_v2') !== 'hidden';

        // Update button appearance - minimalist style
        toggleBtn.style.backgroundColor = visible ? '#4CAF50' : '#999';
        toggleBtn.textContent = visible ? '−' : '+';
        toggleBtn.title = visible ? 'Gizle' : 'Göster';

        if (!visible) {
            // Keep toggle in corner
            toggleBtn.style.top = '-8px';
            toggleBtn.style.right = '-8px';

            // Hide all children EXCEPT the toggle
            Array.from(settingsContainer.children).forEach(child => {
                if (child !== toggleBtn) {
                    child.style.display = 'none';
                }
            });

            // Collapse the container COMPLETELY - no frame visible
            settingsContainer.style.setProperty('height', '0', 'important');
            settingsContainer.style.setProperty('min-height', '0', 'important');
            settingsContainer.style.setProperty('padding', '0', 'important');
            settingsContainer.style.setProperty('margin', '0', 'important');
            settingsContainer.style.setProperty('border', 'none', 'important');
            settingsContainer.style.setProperty('background', 'none', 'important');
            settingsContainer.style.setProperty('overflow', 'visible', 'important');
        } else {
            // Keep toggle in corner when expanded
            toggleBtn.style.top = '-8px';
            toggleBtn.style.right = '-8px';

            // Show all children
            Array.from(settingsContainer.children).forEach(child => {
                if (child !== toggleBtn) {
                    child.style.display = '';
                }
            });

            // Restore container styles
            settingsContainer.style.removeProperty('height');
            settingsContainer.style.removeProperty('min-height');
            settingsContainer.style.removeProperty('padding');
            settingsContainer.style.removeProperty('margin');
            settingsContainer.style.removeProperty('border');
            settingsContainer.style.removeProperty('background');
            settingsContainer.style.removeProperty('overflow');
        }
    };

    // Handle toggle click
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const currentState = localStorage.getItem('sharpXch_toggle_v2') !== 'hidden';
        localStorage.setItem('sharpXch_toggle_v2', currentState ? 'hidden' : 'visible');

        updateToggle();
    });

    // Insert the toggle into the container
    settingsContainer.appendChild(toggleBtn);

    // Initialize localStorage if needed, then update
    if (!localStorage.getItem('sharpXch_toggle_v2')) {
        localStorage.setItem('sharpXch_toggle_v2', isVisible ? 'visible' : 'hidden');
    }
    updateToggle();
}

// Göz ikonu fonksiyonu silindi - sadece karakter butonu toggle kullanılıyor

// --- Initialization ---
setInterval(injectSofaScoreIcons, 1000);
setInterval(preserveBetInputs, 500);
setInterval(injectConfirmBetsToggle, 1000);
// setInterval(injectSettingsToggle, 1000); // Devre dışı - injectConfirmBetsToggle kullanılıyor
