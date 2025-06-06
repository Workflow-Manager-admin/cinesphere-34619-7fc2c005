import React, { useState } from "react";
import "./CineSphereMainContainer.css";
import { searchMovies, getHiddenGems } from "./tmdbApi";

/**
 * PUBLIC_INTERFACE
 * CineSphereMainContainer displays seven feature columns for CineSphere,
 * now integrating TMDb API for "Movie Mood Matcher" and "Hidden Gems Explorer".
 */

function MovieMoodMatcher() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await searchMovies(query.trim());
      setMovies(res.slice(0, 6));
    } catch (err) {
      setError("Failed to fetch movies.");
      setMovies([]);
    }
    setLoading(false);
  }
  return (
    <div style={{ width: "100%" }}>
      <form onSubmit={handleSearch} style={{ marginBottom: 12, width: "100%" }}>
        <input
          type="text"
          style={{
            padding: 7,
            fontSize: 15,
            borderRadius: 6,
            border: "1.5px solid #f394ff",
            width: "75%",
            marginRight: 6,
          }}
          placeholder="Enter your mood or genre (e.g., 'happy', 'thriller')"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="btn" style={{ padding: "7px 18px" }}>
          Search
        </button>
      </form>
      {loading && <div style={{ fontStyle: "italic" }}>Loading...</div>}
      {error && (
        <div style={{ color: "#fff0ee", background: "#e34", borderRadius: 6, padding: "6px 8px", fontSize: "0.98rem" }}>{error}</div>
      )}
      <div>
        {movies.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {movies.map(movie => (
              <li key={movie.id} style={{ marginBottom: 9, display: "flex", gap: 10, alignItems: "center" }}>
                {movie.poster_path && (
                  <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} width={38} height={54} alt="" style={{ borderRadius: 6, border: "1.5px solid #f394ff" }}/>
                )}
                <span style={{ fontWeight: 500 }}>{movie.title}</span>
                <span style={{ color: "#9c9caa", fontSize: 13 }}>{movie.release_date ? `(${movie.release_date.slice(0, 4)})` : ""}</span>
              </li>
            ))}
          </ul>
        )}
        {!loading && !error && movies.length === 0 && (
          <div className="cinesphere-placeholder">
            <span>
              Try a mood keyword &mdash; Get instant movie suggestions!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * GuessTheMovieGame - Enhanced with levels, progressive difficulty, score, and progress UI.
 *
 * Levels progression:
 *  - Level 1: Easier (low blur, popular movies)
 *  - Level 2+: More blur and greater use of obscure movies
 * - Score is awarded for correct answer, lost for skipping or wrong.
 * - Shows progress bar/UI.
 */
function GuessTheMovieGame() {
  // Game config for levels.
  const LEVELS = [
    // Each object can define: blurStrength, obscure (if true, pulls from Hidden Gems API instead of Popular)
    { blur: 8, desc: "Popular Movies", obscure: false, hintPenalty: 2 },   // Level 1
    { blur: 13, desc: "Less Popular or More Blur", obscure: false, hintPenalty: 3 },  // Level 2
    { blur: 16, desc: "Hard Mode: Hidden Gems", obscure: true, hintPenalty: 4 },  // Level 3
    { blur: 20, desc: "Obscure + Max Blur", obscure: true, hintPenalty: 5 }, // Level 4+
  ];
  const MAX_LEVEL = 5; // After level 4, levels repeat with max difficulty.
  const INITIAL_SCORE = 0;

  // Game State
  const [level, setLevel] = React.useState(1); // Level starts at 1
  const [score, setScore] = React.useState(INITIAL_SCORE);
  const [round, setRound] = React.useState(1); // Used to reset all state per round

  const [movie, setMovie] = React.useState(null); // { poster_path, title }
  const [guess, setGuess] = React.useState('');
  const [status, setStatus] = React.useState(''); // "success" | "fail" | ""
  const [loading, setLoading] = React.useState(false);
  const [reveal, setReveal] = React.useState(false);
  const [error, setError] = React.useState('');

  // Hint system state: track individual hint usages per round
  const [hintActor, setHintActor] = React.useState(false);
  const [hintYear, setHintYear] = React.useState(false);
  const [hintTitle, setHintTitle] = React.useState(false);
  const [hintActorValue, setHintActorValue] = React.useState('');
  const [hintTitleValue, setHintTitleValue] = React.useState('');
  const [hintYearValue, setHintYearValue] = React.useState('');

  // Select current config per level, cycling after max level for extra difficulty
  const config = level <= LEVELS.length ? LEVELS[level-1] : LEVELS[LEVELS.length-1];

  // Resets all hint state
  function resetHints() {
    setHintActor(false);
    setHintTitle(false);
    setHintYear(false);
    setHintActorValue('');
    setHintTitleValue('');
    setHintYearValue('');
  }

  // Fetches a random movie, difficulty/obscurity varies by level
  async function fetchGameMovie() {
    setLoading(true);
    setError("");
    setReveal(false);
    setStatus("");
    setGuess("");
    resetHints();

    try {
      let found = null;
      // For obscure level, prefer getHiddenGems; else, popular movies API.
      if (config.obscure) {
        // Use getHiddenGems() (TMDb "discover" endpoint for hidden gems).
        // Import from tmdbApi
        // Try up to 4 times to get poster
        for (let tries = 0; tries < 4; tries++) {
          // getHiddenGems picks random 'page'; pick random index too
          const { getHiddenGems } = await import('./tmdbApi');
          const gems = await getHiddenGems(Math.floor(Math.random() * 3)+1);
          if (gems.length > 0) {
            found = gems[Math.floor(Math.random() * gems.length)];
            if (found.poster_path && found.title) break;
          }
        }
      } else {
        // Popular movies: Down-sample 1-30 pages => random poster
        for (let tries = 0; tries < 5; tries++) {
          const page = Math.floor(Math.random() * 30) + 1;
          const url = `https://api.themoviedb.org/3/movie/popular?api_key=5bc67d3b06aecbd18121a3cbbc16eb59&page=${page}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to load movie posters.");
          const data = await res.json();
          const posters = data.results.filter(m => m.poster_path && m.title && !m.adult);
          if (posters.length > 0) {
            found = posters[Math.floor(Math.random() * posters.length)];
            break;
          }
        }
      }
      if (!found) throw new Error("Couldn't get a suitable poster. Try again!");
      setMovie(found);
    } catch (err) {
      setError("Could not get movie poster. Try again later.");
      setMovie(null);
    }
    setLoading(false);
  }

  // Start round on mount/level/round change
  React.useEffect(() => {
    fetchGameMovie();
    // eslint-disable-next-line
  }, [level, round]);

  // Handles guess submission
  function handleGuess(e) {
    e.preventDefault();
    if (!movie) return;
    function clean(s) {
      return s.replace(/\W/g, '').toLowerCase();
    }
    if (clean(guess) === clean(movie.title)) {
      setStatus("success");
      setReveal(true);
      setScore(s => s + (5 - hintsUsed*config.hintPenalty));
    } else {
      setStatus("fail");
      setReveal(false);
      setScore(s => s - 1);
    }
  }

  // Hints: show lead actor, year, or part of title (hidden letters).
  async function handleHint() {
    if (!movie) return;
    let options = [];
    // Partial title: show first X chars, rest as "_"
    options.push(() => {
      const wordSplit = movie.title.split(' ');
      if (movie.title.length >= 6) {
        // Mask 60% of each word (unless short/stopword)
        return 'Title: ' + wordSplit.map(w => {
          if (w.length < 3) return w;
          const visible = Math.ceil(w.length * 0.4);
          return w.slice(0, visible) + "_".repeat(w.length - visible);
        }).join(' ');
      }
      return '';
    });
    // Release year
    if (movie.release_date)
      options.push(() => "Year: " + movie.release_date.slice(0,4));
    // Lead actor (needs tmdb API: /movie/{movie_id}/credits)
    options.push(async () => {
      try {
        const url = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=5bc67d3b06aecbd18121a3cbbc16eb59`;
        let res = await fetch(url);
        if (!res.ok) return '';
        let data = await res.json();
        let lead = (data.cast && data.cast.length) ? data.cast[0].name : null;
        if (lead) return `Lead actor: ${lead}`;
      } catch {
        // fail silently
      }
      return '';
    });
    // Pick random hint not already shown
    setHintsUsed(h => h+1);
    let pool = [...options];
    let nextHint = '';
    // Pick randomly (but cycle if exhausted)
    while (pool.length && !nextHint) {
      let idx = Math.floor(Math.random()*pool.length);
      let gen = pool.splice(idx, 1)[0];
      let val = await gen();
      if (val && (!hint || !hint.includes(val))) nextHint = val;
    }
    if (!nextHint) nextHint = "No more hints available.";
    setHint(hint ? hint + " | " + nextHint : nextHint);
    setScore(s => s - config.hintPenalty);
  }

  function handleGiveUp() {
    setReveal(true);
    setStatus("");
    setScore(s => s - 3); // Small penalty for giving up
  }

  function handleNextLevel() {
    setLevel(lvl => lvl + 1);
    setRound(r => r + 1);
    setMovie(null);
    setStatus("");
    setGuess("");
    setReveal(false);
    setError("");
    setHint("");
    setHintsUsed(0);
  }

  function handleRestartGame() {
    setLevel(1);
    setRound(r => r + 1); // Triggers useEffect fetch
    setScore(INITIAL_SCORE);
    setMovie(null);
    setStatus("");
    setGuess("");
    setReveal(false);
    setError("");
    setHint("");
    setHintsUsed(0);
  }

  // Progress UI
  function progressUI() {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 14, width: "100%", marginBottom: 13, justifyContent: "center"
      }}>
        <span style={{
          background: "#f394ff", color: "#1f1f47", borderRadius: 8, padding: "2.5px 13px", fontWeight: 600
        }}>Level {level}</span>
        <div style={{
          background: "#eaeaea", borderRadius: 8, width: 100, height: 10, overflow: "hidden", border: "1px solid #f1e2fb"
        }}>
          <div style={{
            width: `${(level / MAX_LEVEL) * 100}%`,
            background: "#f394ff", height: "100%"
          }}></div>
        </div>
        <span style={{ fontWeight: 500, color: "#f394ff" }}>Score: {score}</span>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {progressUI()}
      {loading && (
        <div style={{ fontStyle: "italic", fontWeight: 500, color: "#8c42a8", margin: "22px 0" }}>Loading a mystery poster...</div>
      )}
      {error && (
        <div style={{ color: "#fff0ee", background: "#e34", borderRadius: 6, padding: "8px 12px", fontSize: "0.98rem", margin: "18px 0" }}>{error}</div>
      )}
      {!loading && movie && (
        <div style={{
          width: "100%", display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <div style={{ position: "relative", margin: "0 0 18px 0" }}>
            <img
              src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
              alt="Guess the movie from this poster"
              width={170}
              height={240}
              style={{
                filter: reveal ? "none" : `blur(${config.blur}px) brightness(0.97) grayscale(0.07)`,
                borderRadius: "14px",
                boxShadow: !reveal ? "0 0 0 3px #f394ffcc, 0 3px 16px #1f1f4770" : "0 0 0 2px #8c42a8",
                border: "1.5px solid #f394ff",
                background: "#f6eaff",
                transition: "filter 0.35s cubic-bezier(.6,.8,.4,1)",
                objectFit: "cover",
              }}
            />
            {/* Overlay success/fail */}
            {status === "success" && (
              <span style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                borderRadius: "14px",
                background: "rgba(243, 148, 255, 0.82)",
                color: "#1f1f47", fontWeight: 700, fontSize: "1.38rem",
                display: "flex", justifyContent: "center", alignItems: "center",
                textShadow: "#fff 0 2px 8px",
                zIndex: 2,
              }}>
                🎉 Correct! <span style={{fontWeight:400, fontSize:"0.98rem", marginLeft:5}}>[+{5 - hintsUsed*config.hintPenalty}]</span>
              </span>
            )}
            {status === "fail" && (
              <span style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.68)",
                color: "#de2072", fontWeight: 700, fontSize: "1.08rem",
                display: "flex", justifyContent: "center", alignItems: "center",
                zIndex: 2, textShadow: "#fff 0 2px 11px",
                border: "1.5px solid #de2072"
              }}>
                ❌ Try Again! [-1]
              </span>
            )}
            {/* Show the answer if revealed but not a win */}
            {reveal && status !== "success" && (
              <div style={{
                position: "absolute", left: 0, bottom: "-37px", width: "100%",
                color: "#1f1f47", fontWeight: 600, fontSize: "1.17rem",
                display: "flex", justifyContent: "center", alignItems: "center",
                textShadow: "#fff 0 2px 8px", background: "#f394ff33",
                borderRadius: "0 0 12px 12px", padding: "6px 0",
                zIndex: 2, borderTop: "1.5px solid #8c42a8"
              }}>
                🎬 <span style={{marginLeft: 5}}>{movie.title}</span>
              </div>
            )}
          </div>
          {!reveal && (
            <>
              <form onSubmit={handleGuess} style={{ width: "90%", display: "flex", alignItems: "center", marginBottom: 9 }}>
                <input
                  aria-label="Guess the movie title"
                  type="text"
                  style={{
                    padding: 8, fontSize: 15, borderRadius: 6, border: "1.5px solid #f394ff",
                    width: "70%", marginRight: 7, outline: status==="fail"?"2px solid #de2072":"none"
                  }}
                  placeholder="Type your guess…"
                  value={guess}
                  onChange={e => { setGuess(e.target.value); setStatus(""); }}
                  disabled={loading}
                  spellCheck={false}
                  autoComplete="off"
                />
                <button className="btn" style={{ padding: "8px 22px" }} type="submit" disabled={loading || !guess.trim()}>
                  Guess
                </button>
              </form>
              <button type="button" className="btn" style={{ background: "#dfa7ff", color: "#1f1f47", marginBottom: 0, fontSize: "0.98rem", marginLeft: 9 }} onClick={handleHint} disabled={hintsUsed>=3} title="Show a hint!">
                Hint{hintsUsed>0 && ` (${hintsUsed})`}
              </button>
              {hint && (
                <div style={{
                  marginTop: 7, color: "#f394ff", background: "#f6eaff", border: "1.5px solid #f394ff66", borderRadius: 7, fontSize: "0.98rem", padding: "0.5em 0.9em"
                }}>
                  {hint}
                </div>
              )}
              <button className="btn" style={{ background: "#f394ff", color: "#1f1f47", marginTop: 5, fontSize: "0.97rem" }} type="button" onClick={handleGiveUp}>
                Reveal Answer [-3]
              </button>
            </>
          )}
          {(reveal || status === "success") && (
            <>
              {level < MAX_LEVEL && (
                <button className="btn" style={{ background: "#1f1f47", color: "#f394ff", marginTop: 16, fontSize: "1.01rem" }} type="button" onClick={handleNextLevel}>
                  Next Level →
                </button>
              )}
              {level >= MAX_LEVEL && (
                <button className="btn" style={{ background: "#1f1f47", color: "#f394ff", marginTop: 16, fontSize: "1.01rem" }} type="button" onClick={handleRestartGame}>
                  Restart Game
                </button>
              )}
            </>
          )}
        </div>
      )}
      {!loading && !movie && !error && (
        <div style={{ marginTop: 24, padding: "16px 6px", color: "#f394ff" }}>
          No poster available.{" "}
          <button className="btn" style={{ marginLeft: 4 }} onClick={handleRestartGame}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

// Hidden Gems Explorer demo: show low-popularity, high-rated movies
function HiddenGemsExplorer() {
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Only fetch once when opened
  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    getHiddenGems()
      .then(res => {
        if (isMounted) setGems(res.slice(0, 6));
      })
      .catch(() => {
        if (isMounted) setError("Failed to load hidden gems.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);
  return (
    <div style={{ width: "100%" }}>
      {loading && <div style={{ fontStyle: "italic" }}>Loading...</div>}
      {error && (
        <div style={{ color: "#fff0ee", background: "#e34", borderRadius: 6, padding: "6px 8px", fontSize: "0.98rem" }}>{error}</div>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {gems.map(gem => (
          <li key={gem.id} style={{ marginBottom: 9, display: "flex", alignItems: "center", gap: 10 }}>
            {gem.poster_path && (
              <img src={`https://image.tmdb.org/t/p/w92${gem.poster_path}`} width={38} height={54} alt="" style={{ borderRadius: 6, border: "1.5px solid #f394ff" }} />
            )}
            <span style={{ fontWeight: 500 }}>{gem.title}</span>
            <span style={{ color: "#f394ff", fontSize: 13, marginLeft: 3 }}>★ {gem.vote_average?.toFixed(1)}</span>
            <span style={{ color: "#aaaac1", fontSize: 13 }}>{gem.release_date ? `(${gem.release_date.slice(0, 4)})` : ""}</span>
          </li>
        ))}
      </ul>
      {!loading && !error && gems.length === 0 && (
        <div className="cinesphere-placeholder">
          <span>
            Find real hidden gems: Low-popularity, high-rated movies from TMDb!
          </span>
        </div>
      )}
    </div>
  );
}

function CineSphereMainContainer() {
  // Column order and labeling is preserved from the original design.
  return (
    <div className="cinesphere-main-container">
      <h1 className="cinesphere-title">CineSphere</h1>
      <div className="cinesphere-feature-grid">
        {/* Movie Mood Matcher */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Movie Mood Matcher</h2>
            <div className="cinesphere-feature-desc">
              Type your mood and get a list of movies that match it.
            </div>
            <MovieMoodMatcher />
          </div>
        </div>
        {/* Guess the Movie Game */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Guess the Movie Game (Poster Edition)</h2>
            <div className="cinesphere-feature-desc">
              View a blurred movie poster and guess the movie title.
            </div>
            <GuessTheMovieGame />
          </div>
        </div>
        {/* Hidden Gems Explorer */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Hidden Gems Explorer</h2>
            <div className="cinesphere-feature-desc">
              Discover underrated or low-popularity movies with high ratings.
            </div>
            <HiddenGemsExplorer />
          </div>
        </div>
        {/* Film Detective */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Film Detective</h2>
            <div className="cinesphere-feature-desc">
              Enter clues like actor name, quote, or year to find the movie.
            </div>
            <div className="cinesphere-placeholder">
              <span>
                <strong>Coming Soon:</strong> Film Detective
              </span>
            </div>
          </div>
        </div>
        {/* Binge Planner */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Binge Planner</h2>
            <div className="cinesphere-feature-desc">
              Input available hours and get movie/TV show suggestions that fit exactly into that time.
            </div>
            <div className="cinesphere-placeholder">
              <span>
                <strong>Coming Soon:</strong> Binge Planner
              </span>
            </div>
          </div>
        </div>
        {/* Regional Movie Explorer */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Regional Movie Explorer</h2>
            <div className="cinesphere-feature-desc">
              Filter and explore top-rated or rare movies by region or language.
            </div>
            <div className="cinesphere-placeholder">
              <span>
                <strong>Coming Soon:</strong> Regional Movie Explorer
              </span>
            </div>
          </div>
        </div>
        {/* Scene Breakdown Visualizer */}
        <div className="cinesphere-feature-col">
          <div className="cinesphere-feature-box">
            <h2 className="cinesphere-feature-title">Scene Breakdown Visualizer</h2>
            <div className="cinesphere-feature-desc">
              Visualize how a scene is built, including mood, lighting, camera angles, and plot points.
            </div>
            <div className="cinesphere-placeholder">
              <span>
                <strong>Coming Soon:</strong> Scene Breakdown Visualizer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CineSphereMainContainer;
