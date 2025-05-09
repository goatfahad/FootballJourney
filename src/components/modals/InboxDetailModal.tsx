import React from 'react';
import { NewsItem } from '../../types/gameTypes';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';

interface InboxDetailModalProps {
  item: NewsItem;
  onClose: () => void;
}

export const InboxDetailModal: React.FC<InboxDetailModalProps> = ({ item, onClose }) => {
  return (
    <Modal title={item.subject} onClose={onClose}>
      <div className="space-y-3 text-gray-900 dark:text-gray-200">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Date: {formatDate(item.date)} | Type: {item.type.replace('_', ' ')}
        </p>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {/* Render message content - potentially handle markdown or HTML if needed */}
          {/* Split message by newline characters to render paragraphs */}
          {item.message.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {/* Add actions based on news type if applicable (e.g., respond to offer) */}
        <div className="flex justify-end pt-3">
          <Button onClick={onClose} variant="primary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
