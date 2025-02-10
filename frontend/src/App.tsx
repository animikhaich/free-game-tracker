import { useEffect, useState } from 'react';
import { ExternalLink, Gift, Clock, Users, GamepadIcon, Flame, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface Game {
  id: number;
  title: string;
  worth: string;
  thumbnail: string;
  image: string;
  description: string;
  instructions: string;
  open_giveaway_url: string;
  published_date: string;
  type: string;
  platforms: string;
  end_date: string;
  users: number;
  status: string;
  worthNumber?: number;
  endDateTime?: number;
}

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [highlightedGames, setHighlightedGames] = useState<Game[]>([]);
  const [regularGames, setRegularGames] = useState<Game[]>([]);
  const [freeGames, setFreeGames] = useState<Game[]>([]);
  const [showFreeGames, setShowFreeGames] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        console.log(import.meta.env.VITE_BACKEND_URL);
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/giveaways');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Sort and process games
        const processedGames = data.map((game: Game) => ({
          ...game,
          worthNumber: game.worth === "N/A" ? 0 : parseFloat(game.worth.replace('$', '')) || 0,
          endDateTime: game.end_date === "N/A" ? Infinity : new Date(game.end_date).getTime()
        }));

        // Separate free games (worth is N/A)
        const freeForeverGames = processedGames.filter(game => game.worth === "N/A");
        const paidGames = processedGames.filter(game => game.worth !== "N/A");

        // Get top 3 games by worth and earliest end date
        const topGames = [...paidGames]
          .sort((a: Game, b: Game) => {
            if ((b.worthNumber ?? 0) === (a.worthNumber ?? 0)) {
              return (a.endDateTime ?? 0) - (b.endDateTime ?? 0);
            }
            return (b.worthNumber ?? 0) - (a.worthNumber ?? 0);
          })
          .slice(0, 3);

        const otherGames = paidGames.filter(
          game => !topGames.find(top => top.id === game.id)
        );

        setHighlightedGames(topGames);
        setRegularGames(otherGames);
        setFreeGames(freeForeverGames);
        setGames(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching games:', error);
        setError('Failed to load games. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const formatDate = (dateString: string) => {
    return dateString === "N/A" ? "No expiration" : new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatWorth = (worth: string) => {
    return worth === "N/A" ? "Free" : worth;
  };

  const getAllPlatforms = () => {
    const platforms = new Set<string>();
    games.forEach(game => {
      game.platforms.split(',').forEach(platform => {
        platforms.add(platform.trim());
      });
    });
    return Array.from(platforms).sort();
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const filterGames = (games: Game[]): Game[] => {
    if (selectedPlatforms.length === 0) return games;
    return games.filter((game: Game) =>
      selectedPlatforms.some(platform =>
        game.platforms.toLowerCase().includes(platform.toLowerCase())
      )
    );
  };

  const GameCard = ({ game, isHighlighted = false }: { game: Game; isHighlighted?: boolean }) => (
    <article className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-shadow duration-300 ${
      isHighlighted ? 'ring-2 ring-purple-500 hover:shadow-purple-500/30' : 'hover:shadow-purple-500/20'
    }`}>
      <div className="relative">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = game.thumbnail;
          }}
        />
        <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {formatWorth(game.worth)}
        </div>
        {isHighlighted && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Flame className="w-4 h-4" />
            Hot Deal
          </div>
        )}
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold mb-3 text-gray-100">{game.title}</h2>
        
        <div className="space-y-4">
          <p className="text-gray-400 line-clamp-3">{game.description}</p>
          
          <div className="flex flex-wrap gap-2">
            {game.platforms.split(',').map(platform => (
              <span key={platform} className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                {platform.trim()}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Ends: {formatDate(game.end_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{game.users.toLocaleString()} claimed</span>
            </div>
          </div>

          <a
            href={game.open_giveaway_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <GamepadIcon className="w-4 h-4" />
            Claim Game
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-100">
          <h2 className="text-2xl font-bold mb-4">Oops!</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const filteredHighlightedGames = filterGames(highlightedGames);
  const filteredRegularGames = filterGames(regularGames);
  const filteredFreeGames = filterGames(freeGames);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <header className="max-w-7xl mx-auto mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gift className="w-12 h-12 text-purple-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Free Game Tracker
          </h1>
        </div>
        <p className="text-gray-400 text-lg">Discover and claim free games before they're gone!</p>
      </header>

      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold">Filter by Platform</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {getAllPlatforms().map(platform => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                  selectedPlatforms.includes(platform)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredHighlightedGames.length > 0 && (
        <section className="max-w-7xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <span>Featured Deals</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHighlightedGames.map(game => (
              <GameCard key={game.id} game={game} isHighlighted={true} />
            ))}
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-6">Limited Time Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRegularGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        <section>
          <button
            onClick={() => setShowFreeGames(!showFreeGames)}
            className="w-full bg-gray-800 p-4 rounded-lg flex items-center justify-between hover:bg-gray-750 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold">Free Forever Games</h2>
              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-sm">
                {filteredFreeGames.length}
              </span>
            </div>
            <div className={`transform transition-transform duration-300 ${showFreeGames ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-6 h-6" />
            </div>
          </button>
          
          <div className={`free-games-content grid ${showFreeGames ? 'grid-rows-1' : 'grid-rows-0'}`}>
            <div className="min-h-0">
              <div className="py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredFreeGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto mt-16 text-center text-gray-400">
        <p>Data provided by GamerPower API</p>
      </footer>
    </div>
  );
}

export default App;
