import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from '../utils/blockchain-helpers';

const ChainContext = createContext();

export function ChainProvider({ children }) {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const ws = useWebSocket('ws://localhost:3000', {
    onMessage: (data) => {
      setBlocks(prev => [...prev, JSON.parse(data)]);
    }
  });

  useEffect(() => {
    const fetchChain = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/chain');
        const data = await response.json();
        setBlocks(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    fetchChain();
  }, []);

  return (
    <ChainContext.Provider
      value={{
        blocks,
        selectedBlock,
        isLoading,
        error,
        selectBlock: setSelectedBlock
      }}
    >
      {children}
    </ChainContext.Provider>
  );
}

export const useChain = () => useContext(ChainContext);