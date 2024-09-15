import React, { useEffect, useState } from 'react';
import {
  IonApp,
  setupIonicReact,
} from '@ionic/react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';

import './global.css';
import './theme/variables.css'

import PaginaBase from './pages/PaginaBase_Ref';

import PaginaCadastro from './pages/PaginaCadastro';
import PaginaAvatar from './pages/PaginaAvatar';
import PaginaAtributos from './pages/PaginaAtributos';
import PaginaAtributoCadastro from './pages/PaginaAtributoCadastro';
import PaginaAtributoEdicao from './pages/PaginaAtributoEdicao';
import PainelDeTarefas from './pages/PainelDeTarefas';
import PaginaTarefaCadastro from './pages/PaginaTarefaCadastro';
import PaginaTarefaEdicao from './pages/PaginaTarefaEdicao';
import AssistenteDev from './pages/AssistenteDev';
import PaginaModificarPlanejamento from './pages/123';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import PaginaRecompensas from './pages/PaginaRecompensas';

setupIonicReact();

const App: React.FC = () => {
  
  return (
    <IonApp>
    <Router>
      <Switch>
      <Route path="/PaginaCadastro" component={PaginaCadastro} />

      <Route path="/PaginaBase" component={PaginaBase} />

        <Route path="/PaginaAvatar" component={PaginaAvatar} />
        <Route path="/PainelDeTarefas" component={PainelDeTarefas} />
        <Route path="/PaginaTarefaCadastro" component={PaginaTarefaCadastro} />    
        <Route path="/PaginaTarefaEdicao" component={PaginaTarefaEdicao} />      
        <Route path="/PaginaAtributos" component={PaginaAtributos} />
        <Route path="/PaginaAtributoEdicao" component={PaginaAtributoEdicao} />
        <Route path="/PaginaAtributoCadastro" component={PaginaAtributoCadastro} />
        <Route path="/PaginaRecompensas" component={PaginaRecompensas} />
        <Route path="/AssistenteDev" component={AssistenteDev} /> 
        <Route path="/PaginaModificarPlanejamento" component={PaginaModificarPlanejamento} />
        <Route path="/" exact component={PainelDeTarefas} />
      </Switch>
    </Router>
    </IonApp>
  );
};

export default App;
