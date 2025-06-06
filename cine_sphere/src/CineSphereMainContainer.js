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
            <div
              className="cinesphere-placeholder"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '22px 14px',
                marginTop: 22,
                fontSize: '1.19rem',
                background: 'linear-gradient(95deg,#f394ffa0 0%,#fcfcfc 70%)',
                color: '#1f1f47',
                border: '2.5px dashed #f394ff',
                fontWeight: 600,
                letterSpacing: '.2px',
                boxShadow: '0 2px 10px 0 #f394ff21',
              }}
            >
              <span style={{
                fontWeight: 700,
                color: '#e45cf7',
                fontSize: '1.27rem',
                marginBottom: 8,
                letterSpacing: '0.2px',
              }}>
                🚧 Coming Soon!
              </span>
              <span style={{ color: '#1f1f47', opacity: 0.92, fontWeight: 500, fontSize: '1.07rem' }}>
                Guess the Movie Game <br />
                <span style={{ fontSize: '0.98rem', fontStyle: 'italic', color: '#7a2c91', display: 'block', marginTop: 7 }}>
                  (Poster Edition)
                </span>
              </span>
              <span style={{ color: '#8c42a8', marginTop: 14, fontSize: '0.96rem', fontWeight: 400 }}>
                Challenge yourself to identify movies from their mystery posters — launching soon!
              </span>
            </div>
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
