import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/saga-blue/theme.css";

import { Auth0Provider } from '@auth0/auth0-react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Welcome from './Welcome.js';
import ErrorPage from '../src/pages/ErrorPage';
import App from '../src/pages/App';
import Painel from '../src/components/Painel';
import SignUpInfo from './pages/SignUpInfo';



const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

const AppRoutes = () => {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Welcome />,
      errorElement: <ErrorPage />
    },
    {
      path: '/SignUpInfo',
      element: <SignUpInfo />,
    },
    {
      path: '/sgb',
      element: <App />,
      children: [
        {
          path: '/sgb',
          element: <Painel />
        }
      ]
    }
  ]);

  return router;
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: 'http://localhost:3000/sgb'
    }}
  >
    <RouterProvider router={AppRoutes()} /> {/* Chame AppRoutes como uma função */}
  </Auth0Provider>,
);

export default AppRoutes;