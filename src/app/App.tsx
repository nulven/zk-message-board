import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, HashRouter, Route, Switch, Redirect } from "react-router-dom";

import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { providers } from 'ethers';

import Page from './Page';
import Home from './Home';
import Hash from './Hash';
import NewGroup from './NewGroup';
import Group from './Group';
import Groups from './Groups';
import NewConfession from './NewConfession';
import Confessions from './Confessions';

import config from '../../config';

import eth from '../utils/ethAPI';

const INFURA_ID = config.infuraId;
const network = config.network;

const web3Modal = new Web3Modal({
  network: network,
  cacheProvider: true, // optional
  theme: 'light', // optional. Change to "dark" for a dark theme.
  providerOptions: {
  },
});

const App = () => {
  const [signer, setSigner] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (eth.provider &&
        eth.provider['provider'] &&
        typeof eth.provider['provider'].disconnect == 'function') {
      await eth.provider['provider'].disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    const injectedProvider = new providers.Web3Provider(provider);
    eth.setProvider(injectedProvider, setSigner);

    provider.on('chainChanged', chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
    });

    provider.on('accountsChanged', () => {
      console.log('account changed!');
      eth.setProvider(injectedProvider, setSigner);
    });

    provider.on('disconnect', (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, []);

  useEffect(() => {
    const { env } = config;
    let provider;
    if (env === 'production') {
      loadWeb3Modal();
    } else {
      const network_url = 'http://localhost:8545';
      provider = new providers.JsonRpcProvider(network_url);
      eth.setProvider(provider, setSigner);
    }
  }, []);

  return (
    <BrowserRouter>
      <Switch>
        <Page
          path="/confessions/new"
          Subpage={NewConfession}
          navbar={true}
          signer={signer}
          web3={web3Modal}
        />
        <Page
          path="/confessions"
          Subpage={Confessions}
          navbar={true}
          signer={signer}
          web3={web3Modal}
        />
        <Page
          path="/groups/new"
          Subpage={NewGroup}
          navbar={true}
          signer={signer}
          web3={web3Modal}
        />
        <Page
          path="/groups/:name"
          Subpage={Group}
          navbar={true}
          signer={signer}
          web3={web3Modal}
        />
        <Page
          path="/groups"
          Subpage={Groups}
          navbar={true}
          signer={signer}
          web3={web3Modal}
        />
        <Page
          path="/"
          Subpage={Home}
          navbar={true}
          signer={signer}
          web3={web3Modal}
        />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
