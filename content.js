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
            break;
        }
    }

    if (!settingsContainer) {
        return;
    }

    // Check if we already injected the toggle
    if (settingsContainer.querySelector('.sharpxch-checkbox-toggle')) return;

    // Make sure parent can hold absolute positioned elements
    const computedStyle = window.getComputedStyle(settingsContainer);
    if (computedStyle.position === 'static') {
        settingsContainer.style.position = 'relative';
    }

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
        right: -6px;
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
            toggleBtn.style.right = '-6px';

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
            settingsContainer.style.setProperty('margin', '0 0 25px 0', 'important'); // Add bottom margin for spacing
            settingsContainer.style.setProperty('border', 'none', 'important');
            settingsContainer.style.setProperty('background', 'none', 'important');
            settingsContainer.style.setProperty('overflow', 'visible', 'important');
        } else {
            // Keep toggle in corner when expanded
            toggleBtn.style.top = '-8px';
            toggleBtn.style.right = '-6px';

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

// --- Popular Links Toggle Logic ---
function injectPopularLinksToggle() {
    // Find Popular Links container - need to find the parent that contains BOTH title AND list
    let popularLinksContainer = null;

    // Strategy 1: Find by title and go up to find container with the list
    const titleElements = document.querySelectorAll('.biab_popular-links-section-title, div[class*="popularLinks"], div[class*="popular-links"]');

    for (const title of titleElements) {
        const titleText = title.textContent || '';
        if (titleText.toLowerCase().includes('popular links') || titleText.toLowerCase().includes('popular')) {
            // Go up the DOM tree to find a container that also has the list
            let parent = title.parentElement;
            let attempts = 0;
            while (parent && attempts < 5) {
                // Check if this parent contains the sports list
                const hasList = parent.querySelector('ul.biab_prioritized-sports-list, ul[class*="sports-list"]');
                if (hasList) {
                    popularLinksContainer = parent;
                    break;
                }
                parent = parent.parentElement;
                attempts++;
            }
            if (popularLinksContainer) break;
        }
    }

    // Strategy 2: If not found, find the list and go up to find container with title
    if (!popularLinksContainer) {
        const listContainers = document.querySelectorAll('ul.biab_prioritized-sports-list, ul[class*="sports-list"]');
        for (const list of listContainers) {
            let parent = list.parentElement;
            let attempts = 0;
            while (parent && attempts < 5) {
                const parentText = parent.textContent || '';
                if (parentText.toLowerCase().includes('popular links') || parentText.toLowerCase().includes('popular')) {
                    popularLinksContainer = parent;
                    break;
                }
                parent = parent.parentElement;
                attempts++;
            }
            if (popularLinksContainer) break;
        }
    }

    if (!popularLinksContainer) {
        return;
    }

    // Check if we already injected the toggle
    if (popularLinksContainer.querySelector('.sharpxch-popularlinks-toggle')) return;

    // Make sure parent can hold absolute positioned elements
    const computedStyle = window.getComputedStyle(popularLinksContainer);
    if (computedStyle.position === 'static') {
        popularLinksContainer.style.position = 'relative';
    }

    // Allow overflow so toggle stays visible when container collapses
    popularLinksContainer.style.overflow = 'visible';

    // Get initial state from localStorage (default: visible)
    const userToggled = localStorage.getItem('sharpXch_popularLinks_v2');
    let isVisible;
    if (userToggled !== null) {
        isVisible = userToggled !== 'hidden';
    } else {
        isVisible = true; // Default: visible
    }

    injectPopularLinksToggleButton(popularLinksContainer, isVisible);
}

function injectPopularLinksToggleButton(popularLinksContainer, isVisible) {
    // Create minimalist character button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sharpxch-popularlinks-toggle';
    toggleBtn.style.cssText = `
        position: absolute;
        top: -8px;
        right: 4px;
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
        const visible = localStorage.getItem('sharpXch_popularLinks_v2') !== 'hidden';

        // Update button appearance
        toggleBtn.style.backgroundColor = visible ? '#4CAF50' : '#999';
        toggleBtn.textContent = visible ? '−' : '+';
        toggleBtn.title = visible ? 'Gizle' : 'Göster';

        if (!visible) {
            // Keep toggle in corner
            toggleBtn.style.top = '-8px';
            toggleBtn.style.right = '4px';

            // Hide all children EXCEPT the toggle
            Array.from(popularLinksContainer.children).forEach(child => {
                if (child !== toggleBtn) {
                    child.style.display = 'none';
                }
            });

            // Collapse the container COMPLETELY
            popularLinksContainer.style.setProperty('height', '0', 'important');
            popularLinksContainer.style.setProperty('min-height', '0', 'important');
            popularLinksContainer.style.setProperty('padding', '0', 'important');
            popularLinksContainer.style.setProperty('margin', '0 0 25px 0', 'important'); // Add bottom margin for spacing
            popularLinksContainer.style.setProperty('border', 'none', 'important');
            popularLinksContainer.style.setProperty('background', 'none', 'important');
            popularLinksContainer.style.setProperty('overflow', 'visible', 'important');
        } else {
            // Keep toggle in corner when expanded
            toggleBtn.style.top = '-8px';
            toggleBtn.style.right = '4px';

            // Show all children
            Array.from(popularLinksContainer.children).forEach(child => {
                if (child !== toggleBtn) {
                    child.style.display = '';
                }
            });

            // Restore container styles
            popularLinksContainer.style.removeProperty('height');
            popularLinksContainer.style.removeProperty('min-height');
            popularLinksContainer.style.removeProperty('padding');
            popularLinksContainer.style.removeProperty('margin');
            popularLinksContainer.style.removeProperty('border');
            popularLinksContainer.style.removeProperty('background');
            popularLinksContainer.style.removeProperty('overflow');
        }
    };

    // Handle toggle click
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const currentState = localStorage.getItem('sharpXch_popularLinks_v2') !== 'hidden';
        localStorage.setItem('sharpXch_popularLinks_v2', currentState ? 'hidden' : 'visible');

        updateToggle();
    });

    // Insert the toggle into the container
    popularLinksContainer.appendChild(toggleBtn);

    // Initialize localStorage if needed, then update
    if (!localStorage.getItem('sharpXch_popularLinks_v2')) {
        localStorage.setItem('sharpXch_popularLinks_v2', isVisible ? 'visible' : 'hidden');
    }
    updateToggle();
}

// --- Confirm Bets Before Placement Toggle Logic ---
function injectConfirmBeforePlacementToggle() {
    // Find the "Confirm bets before placement / removal" container
    let confirmContainer = null;

    // Look for ALL divs with biab_settings or _settings class
    const allSettingsDivs = document.querySelectorAll('div[class*="biab_settings"], div[class*="_settings"]');

    for (const div of allSettingsDivs) {
        const divText = div.textContent?.toLowerCase() || '';

        // Check if it contains the confirm text
        if (divText.includes('confirm bets before placement')) {
            // Make sure it's NOT the large settings panel
            // (the large panel has "Betting Profit" and "Inline Betting")
            if (!divText.includes('betting profit') && !divText.includes('inline betting')) {
                // Also check it's not too large (the small div should be under 150 characters)
                if (divText.length < 150) {
                    confirmContainer = div;
                    break;
                }
            }
        }
    }

    if (!confirmContainer) {
        return;
    }

    // Check if we already injected the toggle
    if (confirmContainer.querySelector('.sharpxch-confirmplacement-toggle')) return;

    // Make sure parent can hold absolute positioned elements
    const computedStyle = window.getComputedStyle(confirmContainer);
    if (computedStyle.position === 'static') {
        confirmContainer.style.position = 'relative';
    }

    // Allow overflow so toggle stays visible when container collapses
    confirmContainer.style.overflow = 'visible';

    // Get initial state from localStorage (default: visible)
    const userToggled = localStorage.getItem('sharpXch_confirmPlacement_v2');
    let isVisible;
    if (userToggled !== null) {
        isVisible = userToggled !== 'hidden';
    } else {
        isVisible = true; // Default: visible
    }

    injectConfirmBeforePlacementToggleButton(confirmContainer, isVisible);
}

function injectConfirmBeforePlacementToggleButton(confirmContainer, isVisible) {
    // Create minimalist character button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sharpxch-confirmplacement-toggle';
    toggleBtn.style.cssText = `
        position: absolute;
        top: -8px;
        right: 1px;
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
        const visible = localStorage.getItem('sharpXch_confirmPlacement_v2') !== 'hidden';

        // Update button appearance
        toggleBtn.style.backgroundColor = visible ? '#4CAF50' : '#999';
        toggleBtn.textContent = visible ? '−' : '+';
        toggleBtn.title = visible ? 'Gizle' : 'Göster';

        if (!visible) {
            // Keep toggle in corner
            toggleBtn.style.top = '-8px';
            toggleBtn.style.right = '1px';

            // Hide all children EXCEPT the toggle
            Array.from(confirmContainer.children).forEach(child => {
                if (child !== toggleBtn) {
                    child.style.display = 'none';
                }
            });

            // Collapse the container COMPLETELY
            confirmContainer.style.setProperty('height', '0', 'important');
            confirmContainer.style.setProperty('min-height', '0', 'important');
            confirmContainer.style.setProperty('padding', '0', 'important');
            confirmContainer.style.setProperty('margin', '0 0 25px 0', 'important'); // Add bottom margin for spacing
            confirmContainer.style.setProperty('border', 'none', 'important');
            confirmContainer.style.setProperty('background', 'none', 'important');
            confirmContainer.style.setProperty('overflow', 'visible', 'important');
        } else {
            // Keep toggle in corner when expanded
            toggleBtn.style.top = '-8px';
            toggleBtn.style.right = '1px';

            // Show all children
            Array.from(confirmContainer.children).forEach(child => {
                if (child !== toggleBtn) {
                    child.style.display = '';
                }
            });

            // Restore container styles
            confirmContainer.style.removeProperty('height');
            confirmContainer.style.removeProperty('min-height');
            confirmContainer.style.removeProperty('padding');
            confirmContainer.style.removeProperty('margin');
            confirmContainer.style.removeProperty('border');
            confirmContainer.style.removeProperty('background');
            confirmContainer.style.removeProperty('overflow');
        }
    };

    // Handle toggle click
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const currentState = localStorage.getItem('sharpXch_confirmPlacement_v2') !== 'hidden';
        localStorage.setItem('sharpXch_confirmPlacement_v2', currentState ? 'hidden' : 'visible');

        updateToggle();
    });

    // Insert the toggle into the container
    confirmContainer.appendChild(toggleBtn);

    // Initialize localStorage if needed, then update
    if (!localStorage.getItem('sharpXch_confirmPlacement_v2')) {
        localStorage.setItem('sharpXch_confirmPlacement_v2', isVisible ? 'visible' : 'hidden');
    }
    updateToggle();
}

// Göz ikonu fonksiyonu silindi - sadece karakter butonu toggle kullanılıyor

// --- Disable Clickable Label Text for Confirm Checkbox ---
function disableConfirmLabelClick() {
    // Find all labels that contain "Confirm bets before placement"
    const labels = document.querySelectorAll('label[class*="checkbox"]');

    for (const label of labels) {
        const labelText = label.textContent?.trim().toLowerCase() || '';

        // Check if this is the confirm bets label
        if (labelText.includes('confirm bets before placement')) {
            // Check if we already processed this label
            if (label.hasAttribute('data-sharpxch-processed')) continue;

            // Find the checkbox elements
            const checkboxVisual = label.querySelector('span[role="checkbox"]');
            const checkboxInput = label.querySelector('input[type="checkbox"]');

            // Add click event listener to intercept clicks
            label.addEventListener('click', (e) => {
                // Check if the click was directly on the checkbox elements
                const clickedOnCheckbox =
                    e.target === checkboxVisual ||
                    e.target === checkboxInput ||
                    (checkboxVisual && checkboxVisual.contains(e.target)) ||
                    (checkboxInput && checkboxInput.contains(e.target));

                // If NOT clicked on checkbox, prevent the toggle
                if (!clickedOnCheckbox) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true); // Use capture phase

            // Make text non-selectable
            label.style.userSelect = 'none';

            // Make checkbox look clickable
            if (checkboxVisual) {
                checkboxVisual.style.cursor = 'pointer';
            }
            if (checkboxInput) {
                checkboxInput.style.cursor = 'pointer';
            }

            // Mark as processed
            label.setAttribute('data-sharpxch-processed', 'true');
        }
    }
}

// --- Cancel Bet Keyboard Shortcut ---
function setupCancelBetShortcut() {
    document.addEventListener('keydown', (e) => {
        // Check if 'x' key is pressed (ignore if user is typing in an input field)
        if (e.key.toLowerCase() === 'x' &&
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {

            // Find the Cancel Bet button
            // Look for button with text "Cancel Bet" or class containing "cancelBet"
            const cancelButtons = Array.from(document.querySelectorAll('a, button'));
            const cancelBetButton = cancelButtons.find(btn => {
                const text = btn.textContent?.trim().toLowerCase() || '';
                const className = btn.className?.toLowerCase() || '';
                return text === 'cancel bet' ||
                       text.includes('cancel bet') ||
                       className.includes('cancelbet') ||
                       className.includes('cancel-bet') ||
                       btn.classList.contains('biab_secondary-btn');
            });

            if (cancelBetButton) {
                console.log('SharpXch: Clicking Cancel Bet button via X shortcut');
                cancelBetButton.click();
                e.preventDefault();
                e.stopPropagation();
            }
        }
    });
}

// --- Initialization ---
setupCancelBetShortcut();
setInterval(injectSofaScoreIcons, 1000);
setInterval(preserveBetInputs, 500);
setInterval(injectConfirmBetsToggle, 1000);
setInterval(injectPopularLinksToggle, 1000);
setInterval(injectConfirmBeforePlacementToggle, 1000);
setInterval(disableConfirmLabelClick, 1000);
