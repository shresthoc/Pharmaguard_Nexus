import Web3 from 'web3';

export function useWebSocket(url, callbacks) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onopen = callbacks.onOpen;
    ws.onmessage = (e) => callbacks.onMessage(e.data);
    ws.onerror = callbacks.onError;
    ws.onclose = callbacks.onClose;
    setSocket(ws);

    return () => ws.close();
  }, [url]);

  return socket;
}

export function formatBlockHash(hash) {
  return `${hash.substring(0, 12)}...${hash.substring(hash.length - 6)}`;
}

export function validateEthAddress(address) {
  return Web3.utils.isAddress(address);
}