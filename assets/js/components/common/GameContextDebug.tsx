import React, { useContext } from 'react';

import { GameContext } from '../../contexts';

const GameContextDebug: React.FC = () => {
  const gameContext = useContext(GameContext);

  return <pre>{JSON.stringify(gameContext, null, 2)}</pre>;
};
export { GameContextDebug };
