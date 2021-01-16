import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import 'regenerator-runtime/runtime';

import Page from './Page';
import Home from './Home';
import Hash from './Hash';
import NewPoll from './NewPoll';
import Polls from './Polls';
import Poll from './Poll';

ReactDOM.render(
	<BrowserRouter>
	    <Switch>
	      <Page path="/polls/new" Subpage={NewPoll} />
	      <Page path="/polls/:id" Subpage={Poll} />
	      <Page path="/polls" Subpage={Polls} />
	      <Page path="/hash" Subpage={Hash} />
	      <Page path="/" Subpage={Home} />
	    </Switch>
  	</BrowserRouter>
,
  document.getElementById('root')
);
