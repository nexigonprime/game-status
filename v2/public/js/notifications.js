function showNotification(message, type, gameType = 'default') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    
    const icon = document.createElement('div');
    icon.className = 'notification-icon';
    icon.textContent = getGameIcons(gameType, type === 'success');
    
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    };
    
    notification.appendChild(icon);
    notification.appendChild(content);
    notification.appendChild(closeButton);
    
    document.querySelector('.notification-container').appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

const gameIcons = {
    minecraft: ['⛏️', '💔'],
    csgo: ['🎯', '💣'],
    valorant: ['🎮', '☠️'],
    lol: ['⚔️', '😢'],
    default: ['🎮', '😢']
};

function getGameIcons(gameType, isSuccess) {
    const icons = gameIcons[gameType.toLowerCase()] || gameIcons.default;
    return icons[isSuccess ? 0 : 1];
}

window.showNotification = showNotification;
window.getGameIcons = getGameIcons; 