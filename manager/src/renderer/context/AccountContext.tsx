import React, { createContext, useContext } from 'react';

import { createAccountStore } from 'renderer/stores/MainStore';

import { useLocalObservable } from 'mobx-react';

const AccountContext = createContext(createAccountStore());

export function AccountProvider({ children }: any) {
  const accountStore = useLocalObservable(createAccountStore);
  return (
    <AccountContext.Provider value={accountStore}>
      {children}
    </AccountContext.Provider>
  );
}

export const useAccountStore = () => useContext(AccountContext);
