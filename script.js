const playerNameContainerClasses = ['player-list__player-name', 'player-list__guess-name', 'user-grid__user-name'];

/**
 * Cette observer va juste empêcher le site de remettre
 */
const dynamicUpdateBlockerCallback = function(mutationsList, observer) {
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            if (mutation.previousSibling?.data) {
                mutation.target.innerHTML = mutation.previousSibling.data;
            }
        }
    }
};
const nameContainerObserver = new MutationObserver(dynamicUpdateBlockerCallback);

const globalObserver = new MutationObserver((mutations) => {
    const newlyAddedPlayerWrappers = [];

    mutations.forEach((mutation) => {
        if (!mutation.addedNodes)
            return;

        for (const node of mutation.addedNodes) {
            if (!node.tagName) continue;
            if (playerNameContainerClasses.some(playerNameContainerClass => node.classList.contains(playerNameContainerClass))) {
                newlyAddedPlayerWrappers.push(node);
            } else if (node.firstElementChild) {
                playerNameContainerClasses.forEach(playerNameContainerClass => newlyAddedPlayerWrappers.push(...node.getElementsByClassName(playerNameContainerClass)));
            }
        }
    });
    for (const playerNameWrapper of newlyAddedPlayerWrappers) {
        let nameContainer = playerNameWrapper.getElementsByTagName('a').item(0);
        if (nameContainer) {
            censorWatchContent(nameContainer);
        } else {
            censorWatchContent(playerNameWrapper);
        }
    }  
});

globalObserver.observe(document.body, {
    childList: true,
    subtree: true
});

/**
 * Utils
 */

function censorWatchContent(container) {
    const sanitizedPlayerName = censorName(container.innerHTML);
    container.innerHTML = sanitizedPlayerName;
    // We need this observer because Geoguessr tries to concat it again after we update it
    nameContainerObserver.observe(container, { childList: true });
}

/**
 * Possible de mettre des pseudo entier en whitelist
 * Ou bien de définir des préfixes de pseudo, 'JA' par exemple...
 */
function censorName(playername) {
    const nameWhitelist = [''];
    const prefixWhitelist = ['JA'];

    if (nameWhitelist.indexOf(playername) !== -1
        || prefixWhitelist.some(prefix => playername.startsWith(prefix))) {
        return playername;
    }
    return playername.substring(0, 2) + '*****';
}