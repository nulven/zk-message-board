import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import Page from './Page';
import Home from './Home';
import Hash from './Hash';
import NewPoll from './NewPoll';
import Polls from './Polls';
import Poll from './Poll';

import NewGroup from './NewGroup';
import Group from './Group';
import Groups from './Groups';
import NewConfession from './NewConfession';
import Confessions from './Confessions';

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Page path="/confessions/new" Subpage={NewConfession} />
        <Page path="/confessions" Subpage={Confessions} />
        <Page path="/groups/new" Subpage={NewGroup} />
        <Page path="/groups/:id" Subpage={Group} />
        <Page path="/groups" Subpage={Groups} />
        <Page path="/polls/new" Subpage={NewPoll} />
        <Page path="/polls/:id" Subpage={Poll} />
        <Page path="/polls" Subpage={Polls} />
        <Page path="/hash" Subpage={Hash} />
        <Page path="/" Subpage={Home} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
