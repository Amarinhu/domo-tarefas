import React from "react";
import {
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  IonImg,
  IonHeader,
  IonText,
} from "@ionic/react";
import { useHistory } from "react-router";
import { exit, cog } from "ionicons/icons";
import "./MenuLateral.css";
import armazenamento from "../armazenamento";
import domoImagem from "../assets/domoImagem.png";

const MenuLateral: React.FC = () => {
  const navegar = useHistory();

  const caminhosMenu = async (pagina: string, nome: string) => {
    if (nome === "Sair") {
      await armazenamento.remove("token");
      await armazenamento.remove("tempoLimite");
      await armazenamento.remove("foto");
      navegar.replace(pagina);
    } else {
      navegar.push(pagina);
    }
  };

  const caminhos = [
    { nome: "Dev Tools", url: "/AssistenteDev", icon: cog },
    { nome: "Sair", url: "/PaginaLogin", icon: exit },
  ];

  return (
    <IonMenu contentId="main">
      <IonContent>
        <div className="circula-img limita-img">
          <IonImg src={domoImagem} />
        </div>
        <IonHeader>DOMO</IonHeader>
        <IonList>
          {caminhos.map((item, index) => (
            <IonMenuToggle key={index}>
              <IonItem
                color="light"
                routerLink={item.url}
                onClick={() => caminhosMenu(item.url, item.nome)}
              >
                <IonIcon color="primary" icon={item.icon} slot="start" />
                <IonLabel>{item.nome}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
        <div className="ion-text-center custom-versao">
          <IonText>Ver. 0.1.0</IonText>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default MenuLateral;
