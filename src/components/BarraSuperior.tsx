import React from "react";
import {
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButton,
  IonButtons,
} from "@ionic/react";
import BotaoVoltar from "./BotaoVoltar";
import { funnel } from "ionicons/icons";

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

  return (
    <div>
      <IonToolbar color="primary">
        <div className="flex-center">
          <BotaoVoltar />
          <IonIcon style={{ width : '1.5rem', height : '1.5rem' }} icon={icone}></IonIcon>
          <IonTitle>{titulo}</IonTitle>
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