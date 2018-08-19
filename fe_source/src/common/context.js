import React from 'react';
export const CurrentUserContext = React.createContext({
  id: 'initial',
  logOut: () => {}
});