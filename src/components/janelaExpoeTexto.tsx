import React, { useState } from "react";
import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { search } from "ionicons/icons";

import "./janelaExpoeTexto.css";

const JanelaExpoeTexto: React.FC<{ texto: string }> = ({ texto }) => {
  const [exibirModal, definirExibirModal] = useState(false);

  const abrirModal = () => {
    definirExibirModal(true);
  };

  const fecharModal = () => {
    definirExibirModal(false);
  };

  return (
    <div>
      <IonIcon
        style={{
          fontSize: "1.3rem",
          borderRadius: "50%",
          padding: "0.1rem",
          border: "1px solid",
        }}
        icon={search}
        color="primary"
        onClick={abrirModal}
      />
      <IonModal
        className="tamanho-modal-icon"
        isOpen={exibirModal}
        onDidDismiss={fecharModal}
      >
        <h5 style={{ overflow : "auto", textAlign : "justify", margin : "auto"}} className="ion-padding">{texto}</h5>
        <IonButton className="ion-padding" onClick={fecharModal}>Fechar</IonButton>
      </IonModal>
    </div>
  );
};

export default JanelaExpoeTexto;
