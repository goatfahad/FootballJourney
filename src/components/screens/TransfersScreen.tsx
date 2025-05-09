import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Player } from '../../types/gameTypes';
import { calculateCurrentAbility, formatCurrency } from '../../utils/formatters';
import { Button } from '../ui/Button';
// Import TransferModal - assuming it will be created
import { TransferModal } from '../modals/TransferModal'; 

export const TransfersScreen: React.FC = () => {
  const { state } = useGame();
  const { players, playerTeamId, teams } = state;
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const playerTeam = useMemo(() => teams.find(t => t.id === playerTeamId), [teams, playerTeamId]);

  // Filter players not on the player's team
  const availablePlayers = useMemo(() => {
    // Ensure players is an array before filtering
    if (!Array.isArray(players)) return []; 
    return players.filter(p => p && p.contract && p.contract.clubId !== playerTeamId); // Added null checks
  }, [players, playerTeamId]);

  // Basic filtering/sorting (can be expanded)
  const [searchTerm, setSearchTerm] = useState('');
  const filteredPlayers = useMemo(() => {
    return availablePlayers
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => calculateCurrentAbility(b.stats, b.generalPosition) - calculateCurrentAbility(a.stats, a.generalPosition)); // Sort by rating desc
  }, [availablePlayers, searchTerm]);

  const handleViewPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setShowTransferModal(true); // Open modal when viewing
  };

  const handleCloseModal = () => {
    setShowTransferModal(false);
    setSelectedPlayer(null);
  };

  const handleMakeOffer = (player: Player, offerAmount: number) => {
    console.log(`Offer made for ${player.name}: ${formatCurrency(offerAmount)}`);
    // TODO: Dispatch transfer offer action
    // Example: dispatch({ type: ActionTypes.MAKE_TRANSFER_OFFER, payload: { playerId: player.id, amount: offerAmount } });
    handleCloseModal();
  };

  if (!state.gameLoaded || !playerTeam) {
    return <div className="p-4 text-center">Loading transfer market...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Transfer Market</h1>

      {/* Search/Filter Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {/* Add more filters (position, age, value) later */}
      </div>

      {/* Player List Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pos</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Nat</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPlayers.map(player => (
              <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{player.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.position}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.age}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">{player.nationality.substring(0,3).toUpperCase()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-semibold">
                  {calculateCurrentAbility(player.stats, player.generalPosition)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(player.value)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <Button onClick={() => handleViewPlayer(player)} variant="info" size="sm">
                    View / Offer
                  </Button>
                </td>
              </tr>
            ))}
            {filteredPlayers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">No players match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && selectedPlayer && (
        <TransferModal 
          player={selectedPlayer} 
          onClose={handleCloseModal} 
          onMakeOffer={handleMakeOffer} 
        />
      )}
    </div>
  );
};
