import React from 'react';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonMenuButton,
  IonToolbar,
} from "@ionic/react";
import {
  body,
  book,
  grid,
  logoBitcoin,
  menu,
  personCircle,
  rose,
} from "ionicons/icons";
import "./BarraInferiorControles.css";
import MenuLateral from "./MenuLateral";

const botoesInformacoes = [
  { nome: 'Perfil', url: '/PaginaAvatar', icon: personCircle },
  { nome: 'Tarefas', url: '/PainelDeTarefas', icon: book },
  { nome: 'Atributos', url: '/PaginaAtributos', icon: rose },
]

const BarraInferior: React.FC = () => {
  return (
    <>
    <div style ={{ paddingTop : '2rem' }}>
    <IonToolbar className="custom-ion-toolbar">
      <IonTabs>
        <IonRouterOutlet id="main" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        </IonRouterOutlet>
        <IonTabBar color="primary" slot="bottom">
          {botoesInformacoes.map((botao, indice) => (
            <IonTabButton key={indice} tab={botao.nome} href={botao.url}>
              <IonIcon color="light" icon={botao.icon}></IonIcon>
              <IonLabel>{botao.nome}</IonLabel>
            </IonTabButton>
          ))}
          {/*<IonTabButton>
            <IonMenuButton autoHide={false}>
              <IonIcon icon={menu}></IonIcon>
            </IonMenuButton>
            <IonLabel>Menu</IonLabel>
          </IonTabButton>*/}
        </IonTabBar>
      </IonTabs>
    </IonToolbar>
    {/*<MenuLateral />*/}
    </div>
    </>
  );
};

export default BarraInferior;
