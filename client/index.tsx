import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import 'regenerator-runtime/runtime';

import Dashboard from './dashboard/Dashboard';

ReactDOM.render(
	<BrowserRouter>
	    <Switch>
	      <Route path="/" render={props => <Dashboard {...props} />} />
	    </Switch>
  	</BrowserRouter>
,
  document.getElementById('root')
);
