import React from "react";
import {
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButton,
  IonButtons,
} from "@ionic/react";
import BotaoVoltar from "./BotaoVoltar";
import { funnel, reload, reloadCircle } from "ionicons/icons";

interface BarraSuperiorProps {
  titulo: string;
  icone?: string;
  filtro?: boolean;
  mostraFiltro?: boolean;
  definirMostraFiltro?: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

const BarraSuperior: React.FC<BarraSuperiorProps> = ({
  titulo,
  icone,
  filtro,
  mostraFiltro,
  definirMostraFiltro,
}) => {
  const abrirFiltro = () => {
    if (definirMostraFiltro) {
      if (mostraFiltro === true) {
        definirMostraFiltro(false);
      } else {
        definirMostraFiltro(true);
      }
    }
  };
  
  const recarregar = true;
  const recarregarPagina = () => {
    location.reload();
  };

  const verificaFiltro = () => {
    if (filtro) {
      return { marginRight: "0.5rem" };
    } else {
      return { marginRight: "1.5rem" };
    }
  };

  return (
    <div>
      <IonToolbar color="primary">
        <div className="flex-center">
          <BotaoVoltar />
          <IonIcon style={{ width : '1.5rem', height : '1.5rem' }} icon={icone}></IonIcon>
          <IonTitle>{titulo}</IonTitle>
          {recarregar && (
            <IonButtons style={{ width: "4rem", height: "3rem" }}>
              <IonButton 
                onClick={recarregarPagina}
                style={{ ...verificaFiltro() }}
              >
                <IonIcon
                  className="large-icon avatar-icon"
                  icon={reload}
                ></IonIcon>
              </IonButton>
            </IonButtons>
          )}
          {filtro && (
            <IonButtons>
              <IonButton
                onClick={abrirFiltro}
                style={{ marginRight: "1.5rem" }}
              >
                <IonIcon
                  style={{ height: "1.5rem", width: "1.5rem" }}
                  icon={funnel}
                ></IonIcon>
              </IonButton>
            </IonButtons>
          )}
        </div>
      </IonToolbar>
    </div>
  );
};

export default BarraSuperior;