/**
 * ArenaPi Landing Page Script
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Global State Manager
    if (window.ArenaPiState) {
        await window.ArenaPiState.init();
    }

    // 2. Teaser Match Prediction Interactive Widget
    const teamA = document.getElementById('teaser-team-a');
    const teamB = document.getElementById('teaser-team-b');
    const barLeft = document.getElementById('teaser-bar-left');
    const barRight = document.getElementById('teaser-bar-right');
    const labelLeft = document.getElementById('teaser-votes-left');
    const labelRight = document.getElementById('teaser-votes-right');

    const handleTeaserVote = (selectedTeam) => {
        teamA.classList.remove('selected');
        teamB.classList.remove('selected');

        if (selectedTeam === 'Sentinels') {
            teamA.classList.add('selected');
            // Animate percentage bar shift
            barLeft.style.width = '74%';
            barRight.style.width = '26%';
            labelLeft.textContent = '74% Predicted Sentinels';
            labelRight.textContent = '26% Fnatic';
        } else {
            teamB.classList.add('selected');
            // Animate percentage bar shift
            barLeft.style.width = '33%';
            barRight.style.width = '67%';
            labelLeft.textContent = '33% Sentinels';
            labelRight.textContent = '67% Predicted Fnatic';
        }
    };

    if (teamA && teamB) {
        teamA.addEventListener('click', () => handleTeaserVote('Sentinels'));
        teamB.addEventListener('click', () => handleTeaserVote('Fnatic'));
    }

    // 3. Profile Picker Activation
    const profileCards = document.querySelectorAll('.profile-card');
    
    profileCards.forEach(card => {
        const btn = card.querySelector('button');
        const username = card.getAttribute('data-name');
        const favTeam = card.getAttribute('data-team');

        const triggerLogin = () => {
            if (window.ArenaPiState) {
                // Initialize the State Manager for the selected persona
                window.ArenaPiState.loginAs(username, favTeam);
                
                // Add minor UI transition before redirection
                card.style.borderColor = 'var(--color-accent)';
                card.style.boxShadow = 'var(--glow-accent)';
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 400);
            }
        };

        // Make both button and card click work
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                triggerLogin();
            });
        }
        card.addEventListener('click', triggerLogin);
    });
});
