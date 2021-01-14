import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import 'regenerator-runtime/runtime';

import Front from './Front';
import Page from './Page';
import NewPoll from './NewPoll';
import Polls from './Polls';
import Poll from './Poll';


ReactDOM.render(
	<BrowserRouter>
	    <Switch>
	      <Route path="/polls" render={props => <Polls {...props} />} />
	      <Route path="/new-poll" render={props => <NewPoll {...props} />} />
	      <Route path="/hash" render={props => <Page {...props} />} />
	      <Route path="/poll/:id" render={props => <Poll {...props} />} />
	      <Route path="/" render={props => <Front {...props} />} />
	    </Switch>
  	</BrowserRouter>
,
  document.getElementById('root')
);
