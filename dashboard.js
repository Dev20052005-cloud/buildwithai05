/**
 * ArenaPi Dashboard Script - Upgraded with Real-time & Shop
 */

document.addEventListener('DOMContentLoaded', async () => {
    let stateManager = window.ArenaPiState;
    let currentTab = 'live'; // 'live', 'upcoming', 'settled'

    // 1. Initialize State Manager
    if (stateManager) {
        await stateManager.init();
    } else {
        console.error('State Manager not found!');
        return;
    }

    // Canvas Confetti variables
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let confettiActive = false;
    let particles = [];
    
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 2. DOM Elements Bindings
    const navAvatar = document.getElementById('nav-avatar');
    const navUsername = document.getElementById('nav-username');
    const streakCount = document.getElementById('streak-count');
    const userPointsVal = document.getElementById('user-points-val');
    
    const xpLevelText = document.getElementById('xp-level-text');
    const xpCircleFill = document.getElementById('xp-circle-fill');
    const xpPercentageNumber = document.getElementById('xp-percentage-number');
    const xpCurrent = document.getElementById('xp-current');
    const xpMax = document.getElementById('xp-max');

    // Booster indicators
    const shieldBadge = document.getElementById('shield-badge-indicator');
    const doubleXpBadge = document.getElementById('doublexp-badge-indicator');
    const doubleXpCountVal = document.getElementById('doublexp-count-val');
    
    const matchesContainer = document.getElementById('matches-container');
    const chatBox = document.getElementById('live-chat-box');
    const missionsContainer = document.getElementById('missions-container');
    const shopContainer = document.getElementById('shop-container');
    const badgesContainer = document.getElementById('badges-container');
    
    const levelUpToast = document.getElementById('level-up-toast');
    const toastLevelVal = document.getElementById('toast-level-val');

    // Tab buttons
    const tabLive = document.getElementById('tab-live');
    const tabUpcoming = document.getElementById('tab-upcoming');
    const tabSettled = document.getElementById('tab-settled');

    // Staking cache map to remember user-typed stake values per match
    const localStakeInputs = {}; 

    // Live chat commentary templates
    const chatCommentary = {
        'Sentinels': [
            "OMGGGG TenZ is clicking heads!",
            "Sentinels round win let's gooo!",
            "What a dynamic site entry!",
            "Sentinels is looking unstoppable right now.",
            "Fnatic is throwing hard wtf",
            "SEN CITY STAND UP!"
        ],
        'Fnatic': [
            "Derke is insane!",
            "Fnatic pulling it back!",
            "Beautiful thrifty round by Fnatic!",
            "Fnatic on top! What a retake!",
            "Sentinels got outplayed there.",
            "FNATIC WIN!"
        ],
        'Team India': [
            "6 RUNS! Absolute class!",
            "Aman is screaming! Bleed Blue!",
            "What a beautiful drive to the boundary!",
            "India is crushing the scoreboard!",
            "This run rate is crazy!",
            "Unbelievable shot! India on fire!"
        ],
        'Team Pakistan': [
            "Babar Azam masterclass!",
            "Pakistan fighting back!",
            "What a wicket!",
            "Pakistan crowd is going wild!",
            "Beautiful bowling line and length!",
            "Game on! Pakistan coming through!"
        ]
    };

    const genericChatMessages = [
        "This tournament is crazy!",
        "Staked 40 points on this, don't let me down!",
        "Wait, the live odds are shifting, time to hedge?",
        "Oracle badge is mine this week!",
        "Are you watching this live stream? The draft was insane.",
        "Missions are awarding double XP, let's claim them!",
        "Who else is running the Golden profile aura? Looks clean."
    ];

    // Initialize with a few chat messages
    const initChatFeed = () => {
        chatBox.innerHTML = '';
        const users = ['ProGamer99', 'SentinelsFan', 'EsportsGuru', 'AlphaPreds', 'ShadowStrike'];
        const teams = ['Sentinels', 'Team India', 'Team USA', 'Fnatic', 'T1'];

        for (let i = 0; i < 6; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomTeam = teams[Math.floor(Math.random() * teams.length)];
            const message = genericChatMessages[Math.floor(Math.random() * genericChatMessages.length)];
            
            appendChatMessage(randomUser, randomTeam, message);
        }
    };

    const appendChatMessage = (username, favoriteTeam, text) => {
        const msg = document.createElement('div');
        msg.className = 'chat-message';
        
        let teamClass = 'usa';
        if (favoriteTeam.includes('India')) teamClass = 'india';
        if (favoriteTeam.includes('Sentinels')) teamClass = 'sentinels';

        msg.innerHTML = `
            <div class="chat-meta">
                <span class="chat-user">${username}</span>
                <span class="chat-team-badge ${teamClass}">${favoriteTeam}</span>
            </div>
            <span class="chat-msg-text">${text}</span>
        `;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    // ==========================================================================
    // UI BINDING & RENDERING ENGINE
    // ==========================================================================

    const renderUI = async () => {
        // User Profile
        navAvatar.src = stateManager.state.user.avatar;
        navUsername.textContent = stateManager.state.user.username;
        streakCount.textContent = stateManager.state.user.streak;
        userPointsVal.textContent = stateManager.state.user.piPoints;

        // Golden Profile aura upgrade
        if (stateManager.state.user.goldenGlowActive) {
            navAvatar.classList.add('golden-aura');
            navUsername.classList.add('golden-text');
        } else {
            navAvatar.classList.remove('golden-aura');
            navUsername.classList.remove('golden-text');
        }

        // Booster items badges display
        if (stateManager.state.user.streakShieldActive) {
            shieldBadge.style.display = 'inline-flex';
        } else {
            shieldBadge.style.display = 'none';
        }

        if (stateManager.state.user.doubleXpCount > 0) {
            doubleXpBadge.style.display = 'inline-flex';
            doubleXpCountVal.textContent = stateManager.state.user.doubleXpCount;
        } else {
            doubleXpBadge.style.display = 'none';
        }

        // XP Radial calculation
        const lvl = stateManager.state.user.level;
        const xp = stateManager.state.user.xp;
        const max = stateManager.state.user.nextLevelXp;
        const pct = Math.min(Math.round((xp / max) * 100), 100);

        xpLevelText.textContent = lvl;
        xpCurrent.textContent = xp;
        xpMax.textContent = max;
        xpPercentageNumber.textContent = pct;

        const circ = 213.6;
        const offset = circ - (pct / 100) * circ;
        xpCircleFill.style.strokeDashoffset = offset;

        // Render main sections
        await renderMatches();
        renderMissions();
        renderShop();
        renderBadges();
    };

    const renderMatches = async () => {
        const matches = await stateManager.getMatches();
        const filtered = matches.filter(m => m.status === currentTab);
        
        // Preserve scroll position if re-rendering live items
        const scrollPos = matchesContainer.scrollTop;
        matchesContainer.innerHTML = '';

        if (filtered.length === 0) {
            matchesContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--color-text-muted);">
                    <i class="fa-solid fa-gamepad" style="font-size: 2.5rem; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p>No matches available under this tab.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(m => {
            const card = document.createElement('div');
            card.className = `glass-panel match-card ${m.status}`;
            card.setAttribute('data-id', m.id);
            
            // Check user's prediction
            const pred = stateManager.state.predictions.find(p => p.matchId === m.id);
            const predictedTeam = pred ? pred.teamPredicted : null;
            
            const isSettled = m.status === 'settled';
            const isLive = m.status === 'live';
            let statusLabel = m.status.toUpperCase();
            if (isLive) statusLabel = '<i class="fa-solid fa-circle"></i> Live Now';

            // Selected odds multiplier display
            const teamAOddsLabel = parseFloat(m.teamA_odds).toFixed(2) + 'x';
            const teamBOddsLabel = parseFloat(m.teamB_odds).toFixed(2) + 'x';

            card.innerHTML = `
                <div class="match-header">
                    <div class="match-badge ${m.status}">${statusLabel}</div>
                    <div class="match-title">${m.category}</div>
                </div>
                
                <div class="match-versus">
                    <div class="match-team ${predictedTeam === m.teamA ? 'selected' : ''} ${isSettled ? 'disabled' : ''}" data-team="${m.teamA}">
                        <img src="${m.teamA_logo}" alt="${m.teamA} logo">
                        <div class="match-team-name">${m.teamA}</div>
                        <div class="match-odds-row"><span class="team-odds">${teamAOddsLabel} Payout</span></div>
                        ${isLive ? `<div class="table-rank" style="margin-top:5px; font-size:1.1rem;" id="score-a-${m.id}">${m.teamA_score}</div>` : ''}
                        ${isSettled && m.winner === m.teamA ? '<div class="match-badge" style="background: rgba(57, 255, 20, 0.15); color: var(--color-accent); border: 1px solid var(--color-accent); font-size: 0.65rem; margin-top:5px;">WINNER</div>' : ''}
                    </div>
                    <div class="match-vs-divider">VS</div>
                    <div class="match-team ${predictedTeam === m.teamB ? 'selected' : ''} ${isSettled ? 'disabled' : ''}" data-team="${m.teamB}">
                        <img src="${m.teamB_logo}" alt="${m.teamB} logo">
                        <div class="match-team-name">${m.teamB}</div>
                        <div class="match-odds-row"><span class="team-odds right">${teamBOddsLabel} Payout</span></div>
                        ${isLive ? `<div class="table-rank" style="margin-top:5px; font-size:1.1rem;" id="score-b-${m.id}">${m.teamB_score}</div>` : ''}
                        ${isSettled && m.winner === m.teamB ? '<div class="match-badge" style="background: rgba(57, 255, 20, 0.15); color: var(--color-accent); border: 1px solid var(--color-accent); font-size: 0.65rem; margin-top:5px;">WINNER</div>' : ''}
                    </div>
                </div>

                <div class="match-prediction-bar">
                    <div class="match-prediction-fill-left" style="width: ${m.teamA_votes}%"></div>
                    <div class="match-prediction-fill-right" style="width: ${m.teamB_votes}%"></div>
                </div>
                <div class="match-prediction-stats">
                    <span>${m.teamA_votes}% support</span>
                    <span>${m.teamB_votes}% support</span>
                </div>

                <!-- Upgraded Staking Input Panel (Only visible for live/upcoming matches) -->
                ${!isSettled ? `
                    <div class="staking-panel" id="staking-panel-${m.id}" style="display: ${predictedTeam ? 'flex' : 'none'};">
                        <div class="staking-header">
                            <span>Place Prediction Stake</span>
                            <span>Wallet: <span style="color:var(--color-primary);">${stateManager.state.user.piPoints} pts</span></span>
                        </div>
                        <input type="range" class="staking-slider" id="stake-slider-${m.id}" min="10" max="50" step="5" value="${pred ? pred.stakeAmount : (localStakeInputs[m.id] || 10)}">
                        <div class="staking-output">
                            <span>Staking: <span id="stake-display-${m.id}">${pred ? pred.stakeAmount : (localStakeInputs[m.id] || 10)}</span> PiPoints</span>
                            <span class="staking-payout-val">Est. Payout: <span id="payout-display-${m.id}">0</span> XP/Points</span>
                        </div>
                        <button class="btn btn-primary btn-sm btn-place-bet" data-id="${m.id}" id="btn-bet-confirm-${m.id}">
                            <i class="fa-solid fa-check"></i> ${pred ? 'Update Prediction' : 'Lock In Staked Prediction'}
                        </button>
                    </div>
                ` : ''}
            `;

            // Prediction placing event wireups
            if (!isSettled) {
                const teamCards = card.querySelectorAll('.match-team');
                const panel = card.querySelector(`.staking-panel`);
                const slider = card.querySelector(`.staking-slider`);
                const stakeDisp = card.querySelector(`#stake-display-${m.id}`);
                const payoutDisp = card.querySelector(`#payout-display-${m.id}`);
                const confirmBtn = card.querySelector(`#btn-bet-confirm-${m.id}`);

                // Calculate potential stakes helper
                const updateStakingCalcs = (selectedTeam) => {
                    const value = slider.value;
                    localStakeInputs[m.id] = value;
                    stakeDisp.textContent = value;
                    
                    const odds = selectedTeam === m.teamA ? parseFloat(m.teamA_odds) : parseFloat(m.teamB_odds);
                    const payout = Math.round(value * odds);
                    payoutDisp.textContent = payout + ' pts';
                };

                teamCards.forEach(tc => {
                    tc.addEventListener('click', () => {
                        const clickedTeam = tc.getAttribute('data-team');
                        
                        // Toggle local visually
                        teamCards.forEach(c => c.classList.remove('selected'));
                        tc.classList.add('selected');
                        
                        panel.style.display = 'flex';
                        card.setAttribute('data-selected-team', clickedTeam);
                        updateStakingCalcs(clickedTeam);
                    });
                });

                if (slider) {
                    slider.addEventListener('input', () => {
                        const selectedTeam = card.getAttribute('data-selected-team') || predictedTeam || m.teamA;
                        updateStakingCalcs(selectedTeam);
                    });
                    // Run initial calc
                    const activeTeam = predictedTeam || card.getAttribute('data-selected-team') || m.teamA;
                    updateStakingCalcs(activeTeam);
                }

                if (confirmBtn) {
                    confirmBtn.addEventListener('click', async () => {
                        const activeTeam = card.getAttribute('data-selected-team') || predictedTeam;
                        if (!activeTeam) {
                            alert("Select a team first!");
                            return;
                        }

                        const stake = slider.value;
                        const ok = await stateManager.predict(m.id, activeTeam, stake);
                        if (ok) {
                            triggerConfetti();
                            appendChatMessage(stateManager.state.user.username, stateManager.state.user.favoriteTeam, `Staked ${stake} points on ${activeTeam}!`);
                            renderUI();
                        }
                    });
                }
            }

            matchesContainer.appendChild(card);
        });

        // Restore scroll position
        if (scrollPos > 0) {
            matchesContainer.scrollTop = scrollPos;
        }
    };

    const renderMissions = () => {
        missionsContainer.innerHTML = '';
        const missions = stateManager.generateMissions();

        missions.forEach(m => {
            const isCompleted = m.progress >= m.target;
            const isClaimed = stateManager.state.user.claimedMissions && stateManager.state.user.claimedMissions.includes(m.id);
            if (isClaimed) return;

            const mCard = document.createElement('div');
            mCard.className = 'glass-panel mission-card';
            const percentage = Math.min((m.progress / m.target) * 100, 100);

            mCard.innerHTML = `
                ${m.isAI ? `<div class="mission-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> Double XP</div>` : ''}
                <div class="mission-info">
                    <div class="mission-title">${m.title}</div>
                    <div class="mission-description">${m.description}</div>
                </div>
                <div class="mission-reward">
                    <i class="fa-solid fa-bolt"></i> +${m.reward} XP
                </div>
                <div class="mission-progress-container">
                    <div class="mission-progress-bar">
                        <div class="mission-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                        ${isCompleted ? 
                            `<button class="btn btn-primary btn-sm btn-claim" data-id="${m.id}" data-xp="${m.reward}" style="padding: 4px 10px; font-size:0.75rem;">
                                <i class="fa-solid fa-gift"></i> Claim
                             </button>` : 
                            `<span style="font-size:0.7rem; color:var(--color-text-muted);">In Progress</span>`
                        }
                        <span class="mission-progress-text">${m.progress}/${m.target}</span>
                    </div>
                </div>
            `;

            const claimBtn = mCard.querySelector('.btn-claim');
            if (claimBtn) {
                claimBtn.addEventListener('click', () => {
                    claimMissionXP(m.id, m.reward);
                });
            }

            missionsContainer.appendChild(mCard);
        });

        if (missionsContainer.children.length === 0) {
            missionsContainer.innerHTML = `
                <div style="text-align:center; padding:15px; color:var(--color-text-muted); font-size:0.8rem;">
                    <i class="fa-solid fa-circle-check" style="font-size:1.4rem; color:var(--color-accent); margin-bottom:8px;"></i>
                    <p>All personalized AI quests completed!</p>
                </div>
            `;
        }
    };

    const claimMissionXP = (missionId, xpReward) => {
        if (!stateManager.state.user.claimedMissions) {
            stateManager.state.user.claimedMissions = [];
        }
        stateManager.state.user.claimedMissions.push(missionId);

        // Award XP and check level-up
        const { leveledUp, newLevel, multiplierActive } = stateManager.addXp(xpReward);
        
        // Dynamic points bonus
        const ptsReward = missionId === 'mission_affinity_loyalty' ? 50 : 20;
        stateManager.state.user.piPoints += ptsReward;

        triggerConfetti();
        
        let msg = `Claimed quest reward! Gained +${multiplierActive ? xpReward*2 : xpReward} XP and +${ptsReward} PiPoints!`;
        alert(msg);
        appendChatMessage('System', 'ArenaPi', `${stateManager.state.user.username} claimed quest and earned ${ptsReward} points.`);

        if (leveledUp) {
            triggerLevelUpToast(newLevel);
        }

        stateManager.syncState();
        renderUI();
    };

    /**
     * Renders points Rewards Shop cards list
     */
    const renderShop = () => {
        shopContainer.innerHTML = '';

        Object.entries(stateManager.shopDefinitions).forEach(([id, item]) => {
            const card = document.createElement('div');
            card.className = 'glass-panel shop-card';
            
            // Check active flags
            let activeText = '';
            let isActive = false;
            
            if (id === 'streak_shield' && stateManager.state.user.streakShieldActive) {
                activeText = '<span class="badge-active-tag">Active</span>';
                isActive = true;
                card.classList.add('active');
            } else if (id === 'double_xp' && stateManager.state.user.doubleXpCount > 0) {
                activeText = `<span class="badge-active-tag">Active (${stateManager.state.user.doubleXpCount})</span>`;
                isActive = true;
                card.classList.add('active');
            } else if (id === 'golden_glow' && stateManager.state.user.goldenGlowActive) {
                activeText = '<span class="badge-active-tag">Unlocked</span>';
                isActive = true;
                card.classList.add('active');
            }

            card.innerHTML = `
                <div class="shop-card-icon">
                    <i class="${item.icon}"></i>
                </div>
                <div class="shop-card-info">
                    <div class="shop-card-title">${item.name}</div>
                    <div class="shop-card-desc">${item.desc}</div>
                </div>
                <div class="shop-card-action">
                    <div class="shop-card-cost"><i class="fa-solid fa-coins"></i> ${item.cost}</div>
                    ${isActive && id !== 'double_xp' ? activeText : `
                        <button class="btn btn-accent btn-sm btn-buy" data-id="${id}" style="padding: 4px 10px; font-size:0.75rem;">
                            <i class="fa-solid fa-cart-shopping"></i> Buy
                        </button>
                    `}
                </div>
            `;

            const buyBtn = card.querySelector('.btn-buy');
            if (buyBtn) {
                buyBtn.addEventListener('click', () => {
                    const res = stateManager.purchaseShopItem(id);
                    if (res.success) {
                        triggerConfetti();
                        alert(res.msg);
                        appendChatMessage('System', 'Shop', `${stateManager.state.user.username} purchased ${item.name}!`);
                        renderUI();
                    } else {
                        alert(res.msg);
                    }
                });
            }

            shopContainer.appendChild(card);
        });
    };

    const renderBadges = () => {
        badgesContainer.innerHTML = '';
        Object.entries(stateManager.badgeDefinitions).forEach(([id, b]) => {
            const isUnlocked = stateManager.state.badges.includes(id);
            const bItem = document.createElement('div');
            bItem.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
            bItem.title = `${b.name}: ${b.desc}`;
            bItem.innerHTML = `
                <div class="badge-icon"><i class="${b.icon}"></i></div>
                <div class="badge-name">${b.name}</div>
            `;
            badgesContainer.appendChild(bItem);
        });
    };

    // ==========================================================================
    // TOAST NOTIFICATIONS & CONFETTI
    // ==========================================================================

    const triggerLevelUpToast = (level) => {
        toastLevelVal.textContent = level;
        levelUpToast.style.opacity = '1';
        levelUpToast.style.transform = 'translateY(0)';
        xpLevelText.classList.add('glow-text-primary');

        setTimeout(() => {
            levelUpToast.style.opacity = '0';
            levelUpToast.style.transform = 'translateY(40px)';
            xpLevelText.classList.remove('glow-text-primary');
        }, 4000);
    };

    const triggerConfetti = () => {
        particles = [];
        const colors = ['#00f2fe', '#9d4edd', '#39ff14', '#ff007f', '#ffd700'];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: canvas.height + Math.random() * 20,
                vx: (Math.random() - 0.5) * 15,
                vy: -Math.random() * 20 - 10,
                radius: Math.random() * 5 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 1,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                rotation: Math.random() * Math.PI,
                gravity: 0.3
            });
        }
        if (!confettiActive) {
            confettiActive = true;
            animateConfetti();
        }
    };

    const animateConfetti = () => {
        if (!confettiActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;
            if (p.vy > 0) p.opacity -= 0.015;
            if (p.opacity > 0 && p.y < canvas.height) {
                alive = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 1.5);
                ctx.restore();
            }
        });
        if (alive) {
            requestAnimationFrame(animateConfetti);
        } else {
            confettiActive = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    // ==========================================================================
    // REAL-TIME score simulator ticking loop (The Esports Arena heartbeat)
    // ==========================================================================

    const startRealTimeTicking = () => {
        // Runs every 8 seconds
        setInterval(async () => {
            if (currentTab !== 'live') return; // Only process ticking when viewing live matches for visibility!

            const updates = stateManager.tickLiveMatches();
            if (updates.length > 0) {
                // Re-render matches view
                await renderMatches();

                updates.forEach(upd => {
                    // 1. Trigger score update flash
                    const card = matchesContainer.querySelector(`.match-card[data-id="${upd.matchId}"]`);
                    if (card) {
                        const scoreRow = card.querySelector('.match-versus');
                        if (scoreRow) {
                            scoreRow.classList.add('flash-score-green');
                            setTimeout(() => scoreRow.classList.remove('flash-score-green'), 1000);
                        }
                    }

                    // 2. Select commentary based on who scored
                    const comments = chatCommentary[upd.teamScored] || [];
                    if (comments.length > 0) {
                        const phrase = comments[Math.floor(Math.random() * comments.length)];
                        // mock users
                        const commentators = ['AuraEsports', 'KilljoyFan', 'RushB', 'ProSpectator', 'TenzNo1'];
                        const user = commentators[Math.floor(Math.random() * commentators.length)];
                        
                        appendChatMessage(user, upd.teamScored, `${phrase} (${upd.scoreA} - ${upd.scoreB})`);
                    }
                });

                // Check if user predictions completed and require points refresh
                // Filter prediction items that just settled
                const activePreds = stateManager.state.predictions;
                const settledMatches = stateManager.mockMatches.filter(m => m.status === 'settled');
                
                let foundPayout = false;
                settledMatches.forEach(m => {
                    const p = activePreds.find(pred => pred.matchId === m.id && pred.claimed === true && !pred.notifiedOfWin);
                    if (p) {
                        p.notifiedOfWin = true; // flag to prevent multiple alerts
                        foundPayout = true;
                        
                        triggerConfetti();
                        if (p.won) {
                            const payoutVal = Math.round(p.stakeAmount * parseFloat(p.oddsAtPrediction));
                            alert(`🎉 Match Concluded!\n\nYour prediction on ${p.teamPredicted} won!\nPoints Earned: +${payoutVal} PiPoints!`);
                            appendChatMessage('System', 'Payout', `${stateManager.state.user.username} won prediction pool: +${payoutVal} points.`);
                        } else {
                            alert(`❌ Match Concluded!\n\nYour prediction on ${p.teamPredicted} lost.`);
                        }
                    }
                });

                if (foundPayout) {
                    // Update user points balances
                    stateManager.incrementStreak(); // Streak increments automatically on successful predict day completion
                    renderUI();
                }
            }
        }, 8000);
    };

    // Tab filter bindings
    const setTab = (tab) => {
        currentTab = tab;
        tabLive.classList.remove('active');
        tabUpcoming.classList.remove('active');
        tabSettled.classList.remove('active');

        if (tab === 'live') tabLive.classList.add('active');
        if (tab === 'upcoming') tabUpcoming.classList.add('active');
        if (tab === 'settled') tabSettled.classList.add('active');

        renderMatches();
    };

    tabLive.addEventListener('click', () => setTab('live'));
    tabUpcoming.addEventListener('click', () => setTab('upcoming'));
    tabSettled.addEventListener('click', () => setTab('settled'));

    // Boot UI
    initChatFeed();
    setTimeout(() => {
        renderUI();
        startRealTimeTicking();
    }, 600); // skeleton loading effect delay
});
