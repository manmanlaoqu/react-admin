import "babel-polyfill"
import React from 'react'
import ReactDOM from 'react-dom';
import HashRouter from "react-router-dom/HashRouter";
// import BrowserRouter from "react-router-dom/BrowserRouter";
import './style/index.css';
// import './style/theme.css';
// import 'antd/dist/antd.min.css';

//Application's Index
import asyncComponent from "./lib/asyncComponent";

//redux
import { Provider } from 'react-redux';
import thunk from "redux-thunk";
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './Reducers'
const Index = asyncComponent(() => import('./Components/index'));
const store = createStore(rootReducer, applyMiddleware(thunk));


class App extends React.Component {

  constructor(props) {
    super(props);
    document.title = '优挂企业版';
  }

  render() {
    return (
      <Provider store={store}>
        <HashRouter>
          <Index />
        </HashRouter>
      </Provider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept(); 
 }

