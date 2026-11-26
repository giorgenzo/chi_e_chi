import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { DataProvider } from './data/dati';
import { DemoDataService } from './data/DemoDataService';
import { preparaRubricaDemo } from './data/demoRubrica';
import { installaGuardiaIndietro } from './lib/navigazione';
import './styles/global.css';

// Demo: i dati arrivano dal file JSON. Nell'app vera qui si collega il servizio che chiama il backend.
const service = new DemoDataService();
preparaRubricaDemo();
installaGuardiaIndietro();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider service={service}>
      <HashRouter>
        <App />
      </HashRouter>
    </DataProvider>
  </StrictMode>,
);
