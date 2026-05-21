/**
 * ArenaPi Leaderboard Page Script - Upgraded
 */

document.addEventListener('DOMContentLoaded', async () => {
    const stateManager = window.ArenaPiState;
    let fullLeaderboard = [];

    // 1. Initialize State
    if (stateManager) {
        await stateManager.init();
    } else {
        console.error('State Manager not found!');
        return;
    }

    // 2. DOM Elements Bindings
    const navAvatar = document.getElementById('nav-avatar');
    const navUsername = document.getElementById('nav-username');
    const streakCount = document.getElementById('streak-count');
    
    const podiumContainer = document.getElementById('podium-container');
    const tableBody = document.getElementById('leaderboard-tbody');
    const searchInput = document.getElementById('leaderboard-search');

    /**
     * Binds user stats to navbar
     */
    const bindNavProfile = () => {
        navAvatar.src = stateManager.state.user.avatar;
        navUsername.textContent = stateManager.state.user.username;
        streakCount.textContent = stateManager.state.user.streak;

        if (stateManager.state.user.goldenGlowActive) {
            navAvatar.classList.add('golden-aura');
            navUsername.classList.add('golden-text');
        } else {
            navAvatar.classList.remove('golden-aura');
            navUsername.classList.remove('golden-text');
        }
    };

    /**
     * Fetch, sort, and render leaderboard lists
     */
    const loadLeaderboardData = async () => {
        fullLeaderboard = await stateManager.getLeaderboard();
        renderLeaderboard(fullLeaderboard);
    };

    /**
     * Render the podium cards and the remaining tables
     */
    const renderLeaderboard = (data) => {
        tableBody.innerHTML = '';

        if (data.length === 0) {
            podiumContainer.style.display = 'none';
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-text-muted);">
                        <i class="fa-solid fa-user-slash" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.3;"></i>
                        <p>No competitors found matching your search.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const isSearching = searchInput.value.trim().length > 0;
        if (!isSearching && data.length >= 3) {
            podiumContainer.style.display = 'grid';
            renderPodium(data.slice(0, 3));
            renderTable(data.slice(3));
        } else {
            podiumContainer.style.display = 'none';
            renderTable(data);
        }
    };

    /**
     * Fills the 3D podium with 1st, 2nd, and 3rd rank details
     */
    const renderPodium = (topThree) => {
        const ranks = ['second', 'first', 'third'];
        
        ranks.forEach((rankClass, index) => {
            const el = podiumContainer.querySelector(`.podium-card.${rankClass}`);
            if (!el) return;

            let user = null;
            if (rankClass === 'first') user = topThree[0];
            if (rankClass === 'second') user = topThree[1];
            if (rankClass === 'third') user = topThree[2];

            if (user) {
                el.style.visibility = 'visible';
                
                const isSelf = user.username === stateManager.state.user.username;
                const avatarEl = el.querySelector('.podium-avatar');
                const usernameEl = el.querySelector('.podium-username');

                if (isSelf) {
                    el.style.borderColor = 'var(--color-primary)';
                } else {
                    if (rankClass === 'first') el.style.borderColor = '#ffd700';
                    if (rankClass === 'second') el.style.borderColor = '#c0c0c0';
                    if (rankClass === 'third') el.style.borderColor = '#cd7f32';
                }

                // Apply Golden Glow from Shop
                if (user.goldenGlowActive) {
                    avatarEl.classList.add('golden-aura');
                    usernameEl.classList.add('golden-text');
                } else {
                    avatarEl.classList.remove('golden-aura');
                    usernameEl.classList.remove('golden-text');
                }

                avatarEl.src = user.avatar;
                usernameEl.innerHTML = `${user.username} ${isSelf ? '<span style="font-size:0.75rem; color:var(--color-primary);">(You)</span>' : ''}`;
                el.querySelector('.podium-xp').textContent = `${user.xp.toLocaleString()} XP`;
                el.querySelector('.podium-level').textContent = `Level ${user.level} | ${user.favoriteTeam}`;
            } else {
                el.style.visibility = 'hidden';
            }
        });
    };

    /**
     * Fills the leaderboard table with user lists
     */
    const renderTable = (tableData) => {
        tableData.forEach((user, idx) => {
            const isSearching = searchInput.value.trim().length > 0;
            const rank = isSearching ? fullLeaderboard.findIndex(u => u.username === user.username) + 1 : idx + 4;
            const isSelf = user.username === stateManager.state.user.username;

            const tr = document.createElement('tr');
            if (isSelf) {
                tr.style.background = 'rgba(0, 242, 254, 0.04)';
                tr.style.borderLeft = '3px solid var(--color-primary)';
            }

            // Apply Golden Glow parameters
            const glowClass = user.goldenGlowActive ? 'golden-aura' : '';
            const textGlowClass = user.goldenGlowActive ? 'golden-text' : '';

            tr.innerHTML = `
                <td class="table-rank text-gradient-primary">${rank}</td>
                <td>
                    <div class="table-user-cell">
                        <img src="${user.avatar}" alt="${user.username}" class="table-user-avatar ${glowClass}">
                        <div>
                            <span class="table-username ${textGlowClass}">${user.username}</span>
                            ${isSelf ? '<span style="font-size:0.7rem; color:var(--color-primary); margin-left:5px;">(You)</span>' : ''}
                        </div>
                    </div>
                </td>
                <td class="table-user-team">${user.favoriteTeam}</td>
                <td>
                    <span class="table-streak">
                        <i class="fa-solid fa-fire"></i> ${user.streak}d
                    </span>
                </td>
                <td class="table-level">Lvl ${user.level}</td>
                <td class="table-xp">${user.xp.toLocaleString()} XP</td>
            `;

            tableBody.appendChild(tr);
        });
    };

    // 3. Search Filter Event
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            renderLeaderboard(fullLeaderboard);
            return;
        }

        const filtered = fullLeaderboard.filter(user => {
            return user.username.toLowerCase().includes(query) || 
                   user.favoriteTeam.toLowerCase().includes(query);
        });

        renderLeaderboard(filtered);
    });

    // Boot UI
    bindNavProfile();
    await loadLeaderboardData();
});
