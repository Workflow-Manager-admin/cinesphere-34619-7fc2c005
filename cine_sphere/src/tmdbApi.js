//
// PUBLIC_INTERFACE
// tmdbApi.js - Minimal utility for interacting with The Movie Database (TMDb) API from frontend.
// DO NOT hardcode or expose the API key in any repo meant for production. Here, it's directly referenced for demo/development per requirements.
//

const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "5bc67d3b06aecbd18121a3cbbc16eb59";

/**
 * PUBLIC_INTERFACE
 * searchMovies - Search for movies by a query (e.g., for mood-based searching).
 * @param {string} query
 * @param {number} page
 * @return {Promise<Array>} List of movie objects
 */
export async function searchMovies(query, page = 1) {
    // Updates: language set to Tamil ('ta'), original_language ensures Kollywood, exclude adult, prioritize Kollywood relevance
    const url = `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
    )}&page=${page}&language=ta&with_original_language=ta&include_adult=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("TMDb searchMovies failed");
    const data = await res.json();
    // Ensure only Tamil/Kollywood movies are in result
    return (data.results || []).filter(m => m.original_language === "ta");
}

/**
 * PUBLIC_INTERFACE
 * getHiddenGems - Fetch movies that are lesser known (low pop.) but highly rated.
 * For demo, we use TMDb's discover endpoint with filters.
 * @param {number} page
 * @return {Promise<Array>} List of hidden gem movies
 */
export async function getHiddenGems(page = 1) {
    // Criteria: low popularity, high vote average, min vote count to filter spam.
    // Modified: only include Kollywood/Tamil-language movies
    const url = `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}`
        + `&sort_by=vote_average.desc`
        + `&vote_count.gte=50`
        + `&vote_average.gte=7`
        + `&with_original_language=ta`
        + `&popularity.lte=10`
        + `&with_language=ta`
        + `&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("TMDb getHiddenGems failed");
    const data = await res.json();
    // Filter to ensure original language is Tamil
    return (data.results || []).filter(m => m.original_language === "ta");
}
