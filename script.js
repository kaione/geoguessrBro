chrome.storage.sync.get('settings', function(storedData) {
    const settings = loadSettings(storedData)

    /**
     * Cette observer va juste empêcher le site de remettre le pseudo non-censuré
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
        let newlyAddedPlayerWrappers = [];
        let newlyAddedPlayerAvatars = [];

        mutations.forEach((mutation) => {
            if (!mutation.addedNodes)
                return;

            for (const node of mutation.addedNodes) {
                if (!node.tagName) continue;
                if (node.firstElementChild) {
                    newlyAddedPlayerWrappers = searchForNewPlayerNames(node);
                    newlyAddedPlayerAvatars = searchForNewPlayerAvatars(node);
                }
            }
        });
        if (settings.censorNames) {
            newlyAddedPlayerWrappers.forEach(playerNameWrapper => censorWatchContent(playerNameWrapper));
        }
        if (settings.blurAvatars) {
            newlyAddedPlayerAvatars.forEach(newlyAddedPlayerAvatar => newlyAddedPlayerAvatar.classList.add('blurred'));
        }
    });

    globalObserver.observe(document.body, {
        childList: true,
        subtree: true
    });   

    /**
     * Utils
     */

     function loadSettings(data) {
        let settings = {
            blurAvatars: false,
            censorNames: false
        };
        if (data.settings?.enabledFeatures?.length > 0) {
            settings = {
                blurAvatars: data.settings.enabledFeatures.indexOf('blur-profil-pic') !== -1,
                censorNames: data.settings.enabledFeatures.indexOf('censor-name') !== -1
            };
        }

        return settings;
     }

     function searchForNewPlayerNames(node) {
        const playerNameContainerClasses = [
            '.player-list__player-name .user-nick',
            '.player-list__guess-name .user-nick',
            '.user-grid__user-name .user-nick'
        ];
        const newlyAddedPlayerWrappers = [];
        playerNameContainerClasses.forEach(playerNameContainerClass => newlyAddedPlayerWrappers.push(...node.querySelectorAll(playerNameContainerClass)));
        return newlyAddedPlayerWrappers;
    }

     function searchForNewPlayerAvatars(node) {
        const playerAvatarContainerClasses = [
            '.player-list__player-avatar .circle__content',
            '.player-list__guess-avatar .circle__content',
            '.user-grid__circle .circle__content'
        ];
        const newlyAddedPlayerAvatars = [];
        playerAvatarContainerClasses.forEach(playerAvatarContainerClass => newlyAddedPlayerAvatars.push(...node.querySelectorAll(playerAvatarContainerClass)));
        return newlyAddedPlayerAvatars;
    }

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
        const prefixWhitelist = ['JA '];
    
        if (nameWhitelist.indexOf(playername) !== -1
            || prefixWhitelist.some(prefix => playername.startsWith(prefix))) {
            return playername;
        }
        return playername.substring(0, 2) + '*****';
    } 
});