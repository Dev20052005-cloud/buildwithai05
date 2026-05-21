import os
import json
from flask import Flask, jsonify, request

app = Flask(__name__)

# File paths
DB_FILE = os.path.join(os.path.dirname(__file__), 'database.json')

DEFAULT_MATCHES = [
    {
        "id": "match_1",
        "teamA": "Sentinels",
        "teamB": "Fnatic",
        "teamA_logo": "https://api.dicebear.com/7.x/identicon/svg?seed=Sentinels",
        "teamB_logo": "https://api.dicebear.com/7.x/identicon/svg?seed=Fnatic",
        "status": "live",
        "category": "Valorant Champions",
        "teamA_votes": 62,
        "teamB_votes": 38,
        "time": "LIVE NOW",
        "winner": None,
        "teamA_score": 8,
        "teamB_score": 9,
        "max_score": 13,
        "teamA_odds": 2.10,
        "teamB_odds": 1.75
    },
    {
        "id": "match_2",
        "teamA": "Team India",
        "teamB": "Team Pakistan",
        "teamA_logo": "https://api.dicebear.com/7.x/identicon/svg?seed=India",
        "teamB_logo": "https://api.dicebear.com/7.x/identicon/svg?seed=Pakistan",
        "status": "live",
        "category": "Cricket Esports World Cup",
        "teamA_votes": 75,
        "teamB_votes": 25,
        "time": "LIVE - 2nd Innings",
        "winner": None,
        "teamA_score": 182,
        "teamB_score": 165,
        "max_score": 200,
        "teamA_odds": 1.45,
        "teamB_odds": 2.80
    },
    {
        "id": "match_3",
        "teamA": "T1",
        "teamB": "Gen.G",
        "teamA_logo": "https://api.dicebear.com/7.x/identicon/svg?seed=T1",
        "teamB_logo": "https://api.dicebear.com/7.x/identicon/svg?seed=GenG",
        "status": "upcoming",
        "category": "LCK Summer Final",
        "teamA_votes": 55,
        "teamB_votes": 45,
        "time": "Starts in 2 hours",
        "winner": None,
        "teamA_score": 0,
        "teamB_score": 0,
        "max_score": 3,
        "teamA_odds": 1.85,
        "teamB_odds": 1.95
    },
    {
        "id": "match_4",
        "teamA": "Team USA",
        "teamB": "Team Germany",
        "teamA_logo": "https://api.dicebear.com/7.x/identicon/svg?seed=USA",
        "teamB_logo": "https://api.dicebear.com/7.x/identicon/svg?seed=Germany",
        "status": "upcoming",
        "category": "Rocket League Invitational",
        "teamA_votes": 41,
        "teamB_votes": 59,
        "time": "Starts in 6 hours",
        "winner": None,
        "teamA_score": 0,
        "teamB_score": 0,
        "max_score": 5,
        "teamA_odds": 2.30,
        "teamB_odds": 1.60
    },
    {
        "id": "match_5",
        "teamA": "Natus Vincere",
        "teamB": "G2 Esports",
        "teamA_logo": "https://api.dicebear.com/7.x/identicon/svg?seed=NaVi",
        "teamB_logo": "https://api.dicebear.com/7.x/identicon/svg?seed=G2",
        "status": "settled",
        "category": "PGL Major Copenhagen",
        "teamA_votes": 48,
        "teamB_votes": 52,
        "time": "Finished",
        "winner": "G2 Esports",
        "teamA_score": 11,
        "teamB_score": 13,
        "max_score": 13,
        "teamA_odds": 1.90,
        "teamB_odds": 1.90
    }
]

# Helper to load data
def load_db():
    if not os.path.exists(DB_FILE):
        # Default Database structure
        default_db = {
            "user": {
                "username": "GamerX",
                "favoriteTeam": "Sentinels",
                "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=GamerX",
                "level": 1,
                "xp": 15,
                "nextLevelXp": 100,
                "streak": 3,
                "lastActiveDate": "2026-05-21",
                "affinity": {},
                "piPoints": 150,
                "streakShieldActive": False,
                "doubleXpCount": 0,
                "goldenGlowActive": False,
                "claimedMissions": []
            },
            "predictions": [],
            "badges": [],
            "matches": DEFAULT_MATCHES
        }
        save_db(default_db)
        return default_db
    try:
        with open(DB_FILE, 'r') as f:
            db = json.load(f)
            
            # Sanitization of loaded DB to ensure compatibility with upgraded schema
            if "user" not in db:
                db["user"] = {}
            user = db["user"]
            if "username" not in user: user["username"] = "GamerX"
            if "favoriteTeam" not in user: user["favoriteTeam"] = "Sentinels"
            if "avatar" not in user: user["avatar"] = f"https://api.dicebear.com/7.x/bottts/svg?seed={user['username']}"
            if "level" not in user: user["level"] = 1
            if "xp" not in user: user["xp"] = 15
            if "nextLevelXp" not in user: user["nextLevelXp"] = 100
            if "streak" not in user: user["streak"] = 3
            if "lastActiveDate" not in user: user["lastActiveDate"] = "2026-05-21"
            if "affinity" not in user: user["affinity"] = {}
            if "piPoints" not in user: user["piPoints"] = 150
            if "streakShieldActive" not in user: user["streakShieldActive"] = False
            if "doubleXpCount" not in user: user["doubleXpCount"] = 0
            if "goldenGlowActive" not in user: user["goldenGlowActive"] = False
            if "claimedMissions" not in user: user["claimedMissions"] = []
            
            if "predictions" not in db:
                db["predictions"] = []
            if "badges" not in db:
                db["badges"] = []
            if "matches" not in db:
                db["matches"] = DEFAULT_MATCHES
                save_db(db)
                
            return db
    except Exception as e:
        print(f"Error loading database.json: {e}")
        return {}

# Helper to save data
def save_db(data):
    try:
        with open(DB_FILE, 'w') as f:
            json.dump(data, f, indent=4)
        return True
    except Exception as e:
        print(f"Error saving to database.json: {e}")
        return False

# Custom CORS Implementation to make app self-contained without pip install flask-cors
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

# Handle preflight options requests globally
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_route(path):
    return jsonify({"status": "preflight-ok"}), 200

# Endpoint: Get user profile
@app.route('/api/user', methods=['GET'])
def get_user():
    db = load_db()
    return jsonify(db)

# Endpoint: Update user profile / sync state
@app.route('/api/user', methods=['POST'])
def update_user():
    user_state = request.get_json()
    if not user_state:
        return jsonify({"error": "Invalid JSON state supplied"}), 400
    
    # Save incoming state as database state
    save_db(user_state)
    return jsonify(user_state)

# Endpoint: Get matches
@app.route('/api/matches', methods=['GET'])
def get_matches():
    db = load_db()
    return jsonify(db.get("matches", DEFAULT_MATCHES))

# Endpoint: Update matches state (real-time sync)
@app.route('/api/matches', methods=['POST'])
def update_matches():
    matches_state = request.get_json()
    if not matches_state:
        return jsonify({"error": "Invalid JSON matches state supplied"}), 400
    
    db = load_db()
    db["matches"] = matches_state
    save_db(db)
    return jsonify(matches_state)

# Endpoint: Get global leaderboard
@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    leaderboard = [
        { "username": "S1mple", "level": 12, "streak": 14, "xp": 1200, "favoriteTeam": "Natus Vincere", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=S1mple", "goldenGlowActive": True },
        { "username": "Faker", "level": 10, "streak": 9, "xp": 980, "favoriteTeam": "T1", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Faker", "goldenGlowActive": False },
        { "username": "TenZ", "level": 8, "streak": 7, "xp": 750, "favoriteTeam": "Sentinels", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=TenZ", "goldenGlowActive": False },
        { "username": "Shroud", "level": 6, "streak": 4, "xp": 550, "favoriteTeam": "Sentinels", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Shroud", "goldenGlowActive": False },
        { "username": "Pokimane", "level": 5, "streak": 2, "xp": 420, "favoriteTeam": "Team USA", "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Poki", "goldenGlowActive": False }
    ]
    return jsonify(leaderboard)

if __name__ == '__main__':
    print("Starting ArenaPi Hackathon Backend on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
