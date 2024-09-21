import React from "react";
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonMenuButton,
  IonToolbar,
  IonFooter,
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
import { Capacitor } from "@capacitor/core";

const botoesInformacoes = [
  { nome: "Perfil", url: "/PaginaAvatar", icon: personCircle },
  { nome: "Tarefas", url: "/PainelDeTarefas", icon: book },
  { nome: "Atributos", url: "/PaginaAtributos", icon: rose },
];

const iosPlat = Capacitor.getPlatform() === "ios";

const BarraInferior: React.FC = () => {
  return (
    <IonFooter style={{ height: iosPlat ? "5rem" : "3.5rem" }}>
      <IonTabs>
        <IonRouterOutlet
          id="main"
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        ></IonRouterOutlet>
        <IonTabBar slot="bottom"  color="primary">
          {botoesInformacoes.map((botao, indice) => (
            <IonTabButton
              style={{ height: "3rem", width: "3rem" }}
              key={indice}
              tab={botao.nome}
              href={botao.url}
            >
              <IonIcon icon={botao.icon}></IonIcon>
              <IonLabel>
                <strong>{botao.nome}</strong>
              </IonLabel>
            </IonTabButton>
          ))}
          {/*<IonTabButton>
            <IonMenuButton autoHide={false}>
              <IonIcon icon={menu}></IonIcon>
            </IonMenuButton>
            <IonLabel>
              <strong>Menu</strong>
            </IonLabel>
          </IonTabButton>*/}
        </IonTabBar>
      </IonTabs>
    </IonFooter>
  );
};

export default BarraInferior;
