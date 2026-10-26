
import  {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import useFetchPhotos from "./useFetchPhotos";

const initialFavorites = () => {
  try {
    return JSON.parse(
      localStorage.getItem("gallery-favorites") || "[]"
    );
  } catch {
    return [];
  }
};

function favoritesReducer(state, action) {
  switch (action.type) {
    case "TOGGLE": {
      const exists = state.includes(action.id);

      return exists
        ? state.filter((id) => id !== action.id)
        : [...state, action.id];
    }

    default:
      return state;
  }
}

export default function App() {
  const { photos, loading, error } = useFetchPhotos();

  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const [favorites, dispatch] = useReducer(
    favoritesReducer,
    undefined,
    initialFavorites
  );

  useEffect(() => {
    localStorage.setItem(
      "gallery-favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  const handleSearch = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const toggleFavorite = useCallback((id) => {
    dispatch({ type: "TOGGLE", id });
  }, []);

  const filteredPhotos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return photos.filter((photo) => {
      const matchesAuthor = photo.author
        .toLowerCase()
        .includes(query);

      const matchesFavorite =
        !showFavorites || favorites.includes(photo.id);

      return matchesAuthor && matchesFavorite;
    });
  }, [photos, search, showFavorites, favorites]);

  return (
    <div className="min-h-screen">
      <header className="bg-purple-700 text-white p-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">
            Photo Gallery
          </h1>
          <p className="mt-2 text-purple-100">
            Discover beautiful photos and save your favourites.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by author name..."
            className="flex-1 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={() => setShowFavorites(false)}
            className={`rounded-lg px-5 py-3 font-medium ${
              !showFavorites
                ? "bg-purple-700 text-white"
                : "bg-white border"
            }`}
          >
            All Photos
          </button>

          <button
            onClick={() => setShowFavorites(true)}
            className={`rounded-lg px-5 py-3 font-medium ${
              showFavorites
                ? "bg-purple-700 text-white"
                : "bg-white border"
            }`}
          >
            ♥ Favourites ({favorites.length})
          </button>
        </div>

        {loading && (
          <p className="text-center py-12 text-lg">
            Loading photos...
          </p>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-700 text-white px-5 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="mb-4 text-gray-600">
              Showing {filteredPhotos.length} photos
            </p>

            {filteredPhotos.length === 0 ? (
              <p className="text-center py-12 text-gray-500">
                No photos found. Try another search.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredPhotos.map((photo) => {
                  const isFavorite = favorites.includes(photo.id);

                  return (
                    <article
                      key={photo.id}
                      className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={photo.download_url}
                        alt={`Photo by ${photo.author}`}
                        loading="lazy"
                        className="w-full h-56 object-cover"
                      />

                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="font-semibold truncate">
                            {photo.author}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Photo ID: {photo.id}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleFavorite(photo.id)}
                          aria-label={
                            isFavorite
                              ? "Remove from favourites"
                              : "Add to favourites"
                          }
                          aria-pressed={isFavorite}
                          className={`text-2xl shrink-0 ${
                            isFavorite
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        >
                          {isFavorite ? "♥" : "♡"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
