document.addEventListener('DOMContentLoaded', function () {
    const openStatsBtn = document.getElementById('openStats');
    const backBtn = document.getElementById('backToDetails');
    const openActions = document.getElementById('openActions');
    const userName = document.getElementById('userName');
    const userCPF = document.getElementById('userCPF');
    const userEmail = document.getElementById('userEmail');
    const userTelephone = document.getElementById('userTelephone');
    const btnEditProfile = document.getElementById('btnEditProfile');
    const statsPanel = document.querySelector('.stats-panel');
    const actionsPanel = document.querySelector('.actions-panel');
    const profilePhoto = document.querySelector('.profile-photo');

    function showStats() {
        if (userName) userName.style.display = 'none';
        if (userCPF) userCPF.style.display = 'none';
        if (userEmail) userEmail.style.display = 'none';
        if (userTelephone) userTelephone.style.display = 'none';
        if (profilePhoto) profilePhoto.style.display = 'none';
        if (btnEditProfile) btnEditProfile.style.display = 'none';
        if (actionsPanel) actionsPanel.style.display = 'none';
        if (statsPanel) statsPanel.style.display = 'flex';
    }

    function showDetails() {
        if (userName) userName.style.display = '';
        if (userCPF) userCPF.style.display = '';
        if (userEmail) userEmail.style.display = '';
        if (userTelephone) userTelephone.style.display = '';
        if (profilePhoto) profilePhoto.style.display = '';
        if (btnEditProfile) btnEditProfile.style.display = '';
        if (statsPanel) statsPanel.style.display = '';
        if (actionsPanel) actionsPanel.style.display = 'none';
    }

    function showActions() {
        if (userName) userName.style.display = 'none';
        if (userCPF) userCPF.style.display = 'none';
        if (userEmail) userEmail.style.display = 'none';
        if (userTelephone) userTelephone.style.display = 'none';
        if (profilePhoto) profilePhoto.style.display = 'none';
        if (btnEditProfile) btnEditProfile.style.display = 'none';
        if (statsPanel) statsPanel.style.display = 'none';
        if (actionsPanel) actionsPanel.style.display = 'flex';
    }

    if (openStatsBtn) openStatsBtn.addEventListener('click', showStats);
    if (backBtn) backBtn.addEventListener('click', showDetails);
    if (openActions) openActions.addEventListener('click', showActions);
});
