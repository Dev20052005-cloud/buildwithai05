/**
 * ArenaPi State Manager & API Client (Dual-Mode - Upgraded with Real-time & Shop)
 */

class ArenaPiStateManager {
    constructor() {
        this.apiBaseUrl = 'http://127.0.0.1:5000/api';
        this.backendActive = false;
        
        // Default Upgraded Local State Structure
        this.state = {
            user: {
                username: 'GamerX',
                favoriteTeam: 'Sentinels',
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GamerX',
                level: 1,
                xp: 15,
                nextLevelXp: 100,
                streak: 3,
                lastActiveDate: new Date().toISOString().split('T')[0],
                affinity: {}, // team name -> support counts
                piPoints: 150, // Staking currency
                streakShieldActive: false, // Shop items
                doubleXpCount: 0,
                goldenGlowActive: false,
                claimedMissions: []
            },
            predictions: [], // { matchId, teamPredicted, won, claimed, stakeAmount, oddsAtPrediction }
            badges: [] // list of badge IDs
        };
        
        // Live Upgraded Matches Data
        this.mockMatches = [
            {
                id: 'match_1',
                teamA: 'Sentinels',
                teamB: 'Fnatic',
                teamA_logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Sentinels',
                teamB_logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Fnatic',
                status: 'live',
                category: 'Valorant Champions',
                teamA_votes: 62,
                teamB_votes: 38,
                time: 'LIVE NOW',
                winner: null,
                // Real-time scores
                teamA_score: 8,
                teamB_score: 9,
                max_score: 13, // First to 13 rounds wins
                teamA_odds: 2.10,
                teamB_odds: 1.75
            },
            {
                id: 'match_2',
                teamA: 'Team India',
                teamB: 'Team Pakistan',
                teamA_logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=India',
                teamB_logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Pakistan',
                status: 'live',
                category: 'Cricket Esports World Cup',
                teamA_votes: 75,
                teamB_votes: 25,
                time: 'LIVE - 2nd Innings',
                winner: null,
                // Real-time scores
                teamA_score: 182,
                teamB_score: 165,
                max_score: 200, // Target is 200 runs
                teamA_odds: 1.45,
                teamB_odds: 2.80
            },
            {
                id: 'match_3',
                teamA: 'T1',
                teamB: 'Gen.G',
                teamA_logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=T1',
                teamB_logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=GenG',
                status: 'upcoming',
                category: 'LCK Summer Final',
                teamA_votes: 55,
                teamB_votes: 45,
                time: 'Starts in 2 hours',
                winner: null,
                teamA_score: 0,
                teamB_score: 0,
                max_score: 3, // Best of 5
                teamA_odds: 1.85,
                teamB_odds: 1.95
            },
            {
                id: 'match_4',
                teamA: 'Team USA',
                teamB: 'Team Germany',
                teamA_logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=USA',
                teamB_logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Germany',
                status: 'upcoming',
                category: 'Rocket League Invitational',
                teamA_votes: 41,
                teamB_votes: 59,
                time: 'Starts in 6 hours',
                winner: null,
                teamA_score: 0,
                teamB_score: 0,
                max_score: 5,
                teamA_odds: 2.30,
                teamB_odds: 1.60
            },
            {
                id: 'match_5',
                teamA: 'Natus Vincere',
                teamB: 'G2 Esports',
                teamA_logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=NaVi',
                teamB_logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=G2',
                status: 'settled',
                category: 'PGL Major Copenhagen',
                teamA_votes: 48,
                teamB_votes: 52,
                time: 'Finished',
                winner: 'G2 Esports',
                teamA_score: 11,
                teamB_score: 13,
                max_score: 13,
                teamA_odds: 1.90,
                teamB_odds: 1.90
            }
        ];
        
        // Mock global leaderboard
        this.mockLeaderboard = [
            { username: 'S1mple', level: 12, streak: 14, xp: 1200, favoriteTeam: 'Natus Vincere', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=S1mple', goldenGlowActive: true },
            { username: 'Faker', level: 10, streak: 9, xp: 980, favoriteTeam: 'T1', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Faker', goldenGlowActive: false },
            { username: 'TenZ', level: 8, streak: 7, xp: 750, favoriteTeam: 'Sentinels', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TenZ', goldenGlowActive: false },
            { username: 'Shroud', level: 6, streak: 4, xp: 550, favoriteTeam: 'Sentinels', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shroud', goldenGlowActive: false },
            { username: 'Pokimane', level: 5, streak: 2, xp: 420, favoriteTeam: 'Team USA', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Poki', goldenGlowActive: false }
        ];

        // Badges definition
        this.badgeDefinitions = {
            'first_prediction': { name: 'First Blood', icon: 'fa-solid fa-crosshairs', desc: 'Lock in your first match prediction.' },
            'streak_3': { name: 'Streak Rookie', icon: 'fa-solid fa-fire-flame-curved', desc: 'Achieve a 3-day active streak.' },
            'streak_7': { name: 'Streak Demon', icon: 'fa-solid fa-fire', desc: 'Achieve a 7-day active streak.' },
            'oracle': { name: 'The Oracle', icon: 'fa-solid fa-eye', desc: 'Predict 3 matches correctly.' },
            'loyal_fan': { name: 'Loyal Vanguard', icon: 'fa-solid fa-shield-heart', desc: 'Support your affinity team through missions.' },
            'level_5': { name: 'Elite Retainer', icon: 'fa-solid fa-crown', desc: 'Reach Level 5.' }
        };

        // Points Shop inventory
        this.shopDefinitions = {
            'streak_shield': { id: 'streak_shield', name: 'Streak Shield', desc: 'Saves your active streak from freezing for 1 day.', cost: 80, icon: 'fa-solid fa-shield-halved' },
            'double_xp': { id: 'double_xp', name: 'Double XP Capsule', desc: 'Earn 2x XP for your next 2 correct match predictions.', cost: 120, icon: 'fa-solid fa-capsules' },
            'golden_glow': { id: 'golden_glow', name: 'Golden Profile Glow', desc: 'Unlocks a legendary golden crown and neon aura on your profile.', cost: 250, icon: 'fa-solid fa-crown' }
        };
    }

    /**
     * Initializes state and syncs with backend/localStorage
     */
    async init() {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 1200);
            
            const response = await fetch(`${this.apiBaseUrl}/user`, {
                signal: controller.signal
            });
            clearTimeout(id);
            
            if (response.ok) {
                console.log('🔌 Connected to Python Flask API backend.');
                this.backendActive = true;
                const data = await response.json();
                this.state = data;
                
                // Fetch matches from server
                await this.getMatches();
            } else {
                throw new Error('Backend error');
            }
        } catch (err) {
            console.warn('⚠️ Flask API backend offline. Operating in LocalStorage mode.', err.message);
            this.backendActive = false;
            this.loadFromLocalStorage();
        }
        this.saveToLocalStorage();
    }

    /**
     * Persona login routing
     */
    loginAs(username, favoriteTeam) {
        this.state.user.username = username;
        this.state.user.favoriteTeam = favoriteTeam;
        this.state.user.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
        this.state.user.level = 1;
        this.state.user.xp = 15;
        this.state.user.nextLevelXp = 100;
        this.state.user.streak = Math.floor(Math.random() * 4) + 1;
        this.state.user.piPoints = 150; // Starting demo points
        this.state.user.streakShieldActive = false;
        this.state.user.doubleXpCount = 0;
        this.state.user.goldenGlowActive = false;
        this.state.predictions = [];
        this.state.badges = [];
        this.state.user.claimedMissions = [];
        this.state.user.affinity = {};
        this.state.user.affinity[favoriteTeam] = 1;

        // Reset matches to default upon new login for demo consistency
        this.mockMatches = JSON.parse(JSON.stringify(this.mockMatches)); 
        this.syncState();
        this.syncMatches();
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('arenapi_state_v2');
        if (stored) {
            try {
                this.state = JSON.parse(stored);
                // Schema checks
                if (this.state.user.piPoints === undefined) this.state.user.piPoints = 150;
                if (this.state.user.doubleXpCount === undefined) this.state.user.doubleXpCount = 0;
            } catch (e) {
                console.error('Error parsing localStorage:', e);
            }
        }

        const storedMatches = localStorage.getItem('arenapi_matches_v2');
        if (storedMatches) {
            try {
                this.mockMatches = JSON.parse(storedMatches);
            } catch (e) {
                console.error('Error parsing stored matches:', e);
            }
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('arenapi_state_v2', JSON.stringify(this.state));
        localStorage.setItem('arenapi_matches_v2', JSON.stringify(this.mockMatches));
    }

    async syncState() {
        this.saveToLocalStorage();
        if (this.backendActive) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.state)
                });
                if (response.ok) {
                    const data = await response.json();
                    this.state = data;
                }
            } catch (err) {
                console.error('API sync failed:', err);
            }
        }
    }

    async syncMatches() {
        this.saveToLocalStorage();
        if (this.backendActive) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/matches`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.mockMatches)
                });
                if (response.ok) {
                    const data = await response.json();
                    this.mockMatches = data;
                }
            } catch (err) {
                console.error('API matches sync failed:', err);
            }
        }
    }

    /**
     * Staking Prediction placer
     */
    async predict(matchId, teamName, stakeAmount = 10) {
        stakeAmount = parseInt(stakeAmount);
        
        // Deduct points
        if (this.state.user.piPoints < stakeAmount) {
            alert("Insufficient PiPoints!");
            return false;
        }
        
        this.state.user.piPoints -= stakeAmount;

        // Affinity calc
        if (!this.state.user.affinity[teamName]) {
            this.state.user.affinity[teamName] = 0;
        }
        this.state.user.affinity[teamName]++;

        // Find match odds
        const matches = await this.getMatches();
        const m = matches.find(item => item.id === matchId);
        const odds = m ? (teamName === m.teamA ? m.teamA_odds : m.teamB_odds) : 2.0;

        // Register prediction
        const existingIdx = this.state.predictions.findIndex(p => p.matchId === matchId);
        if (existingIdx !== -1) {
            // Refund previous stake first for demo simplicity
            this.state.user.piPoints += this.state.predictions[existingIdx].stakeAmount || 0;
            this.state.predictions[existingIdx].teamPredicted = teamName;
            this.state.predictions[existingIdx].stakeAmount = stakeAmount;
            this.state.predictions[existingIdx].oddsAtPrediction = odds;
        } else {
            this.state.predictions.push({
                matchId: matchId,
                teamPredicted: teamName,
                won: null,
                claimed: false,
                stakeAmount: stakeAmount,
                oddsAtPrediction: odds
            });
        }

        this.checkAndAwardBadge('first_prediction');
        this.addXp(10); // placing gives base XP

        await this.syncState();
        return true;
    }

    /**
     * Purchase booster items from Point Shop
     */
    purchaseShopItem(itemId) {
        const item = this.shopDefinitions[itemId];
        if (!item) return { success: false, msg: 'Item not found' };

        if (this.state.user.piPoints < item.cost) {
            return { success: false, msg: 'Insufficient PiPoints! Make more predictions to earn points.' };
        }

        this.state.user.piPoints -= item.cost;

        if (itemId === 'streak_shield') {
            this.state.user.streakShieldActive = true;
        } else if (itemId === 'double_xp') {
            this.state.user.doubleXpCount += 2;
        } else if (itemId === 'golden_glow') {
            this.state.user.goldenGlowActive = true;
        }

        this.syncState();
        return { success: true, msg: `Successfully purchased ${item.name}!` };
    }

    addXp(amount) {
        // Double XP Capsule inventory logic
        let multiplierActive = false;
        if (this.state.user.doubleXpCount > 0) {
            amount *= 2;
            this.state.user.doubleXpCount -= 1;
            multiplierActive = true;
        }

        this.state.user.xp += amount;
        let leveledUp = false;
        
        while (this.state.user.xp >= this.state.user.nextLevelXp) {
            this.state.user.xp -= this.state.user.nextLevelXp;
            this.state.user.level += 1;
            this.state.user.nextLevelXp = Math.round(this.state.user.nextLevelXp * 1.2);
            leveledUp = true;
        }

        if (this.state.user.level >= 5) {
            this.checkAndAwardBadge('level_5');
        }

        this.syncState();
        return { leveledUp, newLevel: this.state.user.level, multiplierActive };
    }

    checkAndAwardBadge(badgeId) {
        if (!this.state.badges.includes(badgeId)) {
            this.state.badges.push(badgeId);
            this.addXp(30);
            this.syncState();
            return true;
        }
        return false;
    }

    async getMatches() {
        if (this.backendActive) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/matches`);
                if (response.ok) {
                    return await response.json();
                }
            } catch (err) {
                console.error('Error fetching matches:', err);
            }
        }
        return this.mockMatches;
    }

    async getLeaderboard() {
        let leaderboard = [...this.mockLeaderboard];
        if (this.backendActive) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/leaderboard`);
                if (response.ok) {
                    leaderboard = await response.json();
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            }
        }

        // Merge current user
        const userExistsIndex = leaderboard.findIndex(u => u.username === this.state.user.username);
        const userData = {
            username: this.state.user.username,
            level: this.state.user.level,
            streak: this.state.user.streak,
            xp: this.getTotalXpAccumulated(),
            favoriteTeam: this.state.user.favoriteTeam,
            avatar: this.state.user.avatar,
            goldenGlowActive: this.state.user.goldenGlowActive
        };

        if (userExistsIndex !== -1) {
            leaderboard[userExistsIndex] = userData;
        } else {
            leaderboard.push(userData);
        }

        leaderboard.sort((a, b) => b.xp - a.xp);
        return leaderboard;
    }

    getTotalXpAccumulated() {
        let total = this.state.user.xp;
        let base = 100;
        for (let i = 1; i < this.state.user.level; i++) {
            total += base;
            base = Math.round(base * 1.2);
        }
        return total;
    }

    getAffinityTeam() {
        let maxCount = 0;
        let affinityTeam = this.state.user.favoriteTeam;
        for (const [team, count] of Object.entries(this.state.user.affinity)) {
            if (count > maxCount) {
                maxCount = count;
                affinityTeam = team;
            }
        }
        return affinityTeam;
    }

    generateMissions() {
        const affinityTeam = this.getAffinityTeam();
        
        const missions = [
            {
                id: 'mission_predict_3',
                title: 'Supreme Forecaster',
                description: 'Lock in predictions for 3 upcoming matches.',
                reward: 50,
                progress: this.state.predictions.length,
                target: 3,
                completed: this.state.predictions.length >= 3,
                claimed: false,
                isAI: false
            },
            {
                id: 'mission_streak_keep',
                title: 'Gamer Resilience',
                description: 'Keep your streak hot. Predict matches on consecutive days.',
                reward: 40,
                progress: Math.min(this.state.user.streak, 5),
                target: 5,
                completed: this.state.user.streak >= 5,
                claimed: false,
                isAI: false
            }
        ];

        const predictionsOnAffinity = this.state.predictions.filter(p => p.teamPredicted === affinityTeam).length;
        missions.push({
            id: 'mission_affinity_loyalty',
            title: `AI Quest: Support ${affinityTeam}`,
            description: `Declare loyalty to ${affinityTeam} by predicting them to win in 2 separate matches.`,
            reward: 100,
            progress: predictionsOnAffinity,
            target: 2,
            completed: predictionsOnAffinity >= 2,
            claimed: false,
            isAI: true,
            team: affinityTeam
        });

        return missions;
    }

    /**
     * Processes live scoring tick changes
     */
    tickLiveMatches() {
        let scoreUpdated = false;
        let updateDetails = [];

        this.mockMatches.forEach(m => {
            if (m.status === 'live' && m.winner === null) {
                // Increment score randomly
                const triggerTeam = Math.random() > 0.5 ? 'teamA' : 'teamB';
                
                if (m.id === 'match_1') { // Valorant - score increments by 1 round
                    if (triggerTeam === 'teamA') m.teamA_score++;
                    else m.teamB_score++;
                    scoreUpdated = true;
                    updateDetails.push({ matchId: m.id, teamScored: triggerTeam === 'teamA' ? m.teamA : m.teamB, scoreA: m.teamA_score, scoreB: m.teamB_score });
                    
                    // Adjust dynamic odds based on leading team
                    const diff = m.teamA_score - m.teamB_score;
                    m.teamA_odds = Math.max(1.15, (2.0 - diff * 0.15)).toFixed(2);
                    m.teamB_odds = Math.max(1.15, (2.0 + diff * 0.15)).toFixed(2);
                } else if (m.id === 'match_2') { // Cricket - score increments by runs (e.g. 4 or 6)
                    const runs = Math.random() > 0.4 ? 4 : 6;
                    if (triggerTeam === 'teamA') m.teamA_score += runs;
                    else m.teamB_score += runs;
                    scoreUpdated = true;
                    updateDetails.push({ matchId: m.id, teamScored: triggerTeam === 'teamA' ? m.teamA : m.teamB, scoreA: m.teamA_score, scoreB: m.teamB_score });
                    
                    const diff = m.teamA_score - m.teamB_score;
                    m.teamA_odds = Math.max(1.10, (1.8 - diff * 0.02)).toFixed(2);
                    m.teamB_odds = Math.max(1.10, (1.8 + diff * 0.02)).toFixed(2);
                }

                // Check for match completion
                if (m.teamA_score >= m.max_score || m.teamB_score >= m.max_score) {
                    m.winner = m.teamA_score >= m.max_score ? m.teamA : m.teamB;
                    m.status = 'settled';
                    m.time = 'Finished';
                    this.resolvePredictionPayouts(m.id, m.winner);
                }
            }
        });

        if (scoreUpdated) {
            this.syncState();
            this.syncMatches();
        }

        return updateDetails;
    }

    /**
     * Resolves payout automatically for settled predictions
     */
    resolvePredictionPayouts(matchId, winnerName) {
        const pred = this.state.predictions.find(p => p.matchId === matchId && p.won === null);
        if (!pred) return;

        const correct = pred.teamPredicted === winnerName;
        pred.won = correct;
        
        if (correct) {
            // Payout calculation
            const multiplier = parseFloat(pred.oddsAtPrediction);
            const payout = Math.round(pred.stakeAmount * multiplier);
            this.state.user.piPoints += payout;

            // XP payout
            this.addXp(50);
            
            // Check Oracle
            const correctCount = this.state.predictions.filter(p => p.won === true).length;
            if (correctCount >= 3) {
                this.checkAndAwardBadge('oracle');
            }
        } else {
            // Prediction lost, streak shield check
            if (this.state.user.streakShieldActive) {
                this.state.user.streakShieldActive = false; // consume streak shield
                console.log("Streak Shield consumed! Saved streak.");
            } else {
                // reset streak to 1
                this.state.user.streak = 1;
            }
        }
        
        pred.claimed = true;
        this.syncState();
    }

    incrementStreak() {
        this.state.user.streak += 1;
        this.state.user.lastActiveDate = new Date().toISOString().split('T')[0];
        
        if (this.state.user.streak >= 7) {
            this.checkAndAwardBadge('streak_7');
        } else if (this.state.user.streak >= 3) {
            this.checkAndAwardBadge('streak_3');
        }
        this.syncState();
    }
}

// Instantiate
window.ArenaPiState = new ArenaPiStateManager();
