import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { logInOutline } from "ionicons/icons";

const LoginControles: React.FC<{
  aoLogar: () => void;
}> = (props) => {
  return (
    <div>
      <IonButton
        style={{
          width: "92%",
          margin: "auto",
          display: "block"
        }}
        size="large"
        onClick={props.aoLogar}
        expand="full"
        id="entrar-botao"
      >
        <IonIcon slot="start" icon={logInOutline}></IonIcon>
        Entrar
      </IonButton>
    </div>
  );
};

export default LoginControles;
