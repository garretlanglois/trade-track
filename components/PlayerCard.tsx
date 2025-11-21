"use client";

interface Player {
  id: string;
  nhlPlayerId: string;
  name: string;
  team: string | null;
  position: string;
  headshotUrl: string | null;
  teamLogoUrl: string | null;
  jerseyNumber: number | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  isTraded: boolean;
}

interface Props {
  player: Player;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (playerId: string) => void;
}

export default function PlayerCard({ player, selectable, selected, onSelect }: Props) {
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(player.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`border rounded-lg p-4 transition-all ${
        selectable ? "cursor-pointer hover:border-gray-400" : ""
      } ${
        selected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {player.headshotUrl && (
          <img
            src={player.headshotUrl}
            alt={player.name}
            className="w-16 h-16 rounded-full object-cover bg-gray-100"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{player.name}</h3>
            {player.isTraded && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Traded
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{player.position}</span>
            {player.team && (
              <>
                <span className="text-gray-400">•</span>
                <span>{player.team}</span>
              </>
            )}
            {player.jerseyNumber && (
              <>
                <span className="text-gray-400">•</span>
                <span>#{player.jerseyNumber}</span>
              </>
            )}
          </div>
          {player.age && (
            <div className="text-xs text-gray-500 mt-1">
              Age: {player.age}
              {player.height && player.weight && (
                <span className="ml-2">
                  • {Math.floor(player.height / 12)}'{player.height % 12}" • {player.weight} lbs
                </span>
              )}
            </div>
          )}
        </div>
        {player.teamLogoUrl && (
          <img
            src={player.teamLogoUrl}
            alt={player.team || "Team"}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>
    </div>
  );
}
