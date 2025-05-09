import React, { useState } from 'react';
import { Player } from '../../types/gameTypes';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { formatCurrency, calculateCurrentAbility } from '../../utils/formatters';

interface TransferModalProps {
  player: Player;
  onClose: () => void;
  onMakeOffer: (player: Player, offerAmount: number) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ player, onClose, onMakeOffer }) => {
  // Ensure player.value is a number, default to 0 if not
  const playerValue = typeof player.value === 'number' ? player.value : 0;
  const suggestedFee = playerValue * 1.1; // Example: suggest 10% over value
  const [offerAmount, setOfferAmount] = useState(Math.max(0, Math.round(suggestedFee / 10000) * 10000)); // Round to nearest 10k, ensure non-negative

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfferAmount(parseInt(e.target.value) || 0);
  };

  const handleSubmitOffer = () => {
    onMakeOffer(player, offerAmount);
  };

  return (
    <Modal title={`Transfer Offer - ${player.name}`} onClose={onClose}>
      <div className="space-y-4 text-gray-900 dark:text-gray-200">
        {/* Player Details Summary */}
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <p><strong>Position:</strong> {player.position}</p>
          <p><strong>Age:</strong> {player.age}</p>
          <p><strong>Nationality:</strong> {player.nationality}</p>
          <p><strong>Rating:</strong> {calculateCurrentAbility(player.stats, player.generalPosition)}</p>
          <p><strong>Value:</strong> {formatCurrency(playerValue)}</p>
          {/* Add more details like contract info if needed */}
        </div>

        {/* Offer Input */}
        <div>
          <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Offer Amount:
          </label>
          <input
            type="number"
            id="offerAmount"
            value={offerAmount}
            onChange={handleOfferChange}
            step={10000} // Increment by 10k
            min={0}
            className="mt-1 block w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Suggested fee based on value: {formatCurrency(suggestedFee)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-3">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitOffer} variant="primary">
            Submit Offer
          </Button>
        </div>
      </div>
    </Modal>
  );
};
