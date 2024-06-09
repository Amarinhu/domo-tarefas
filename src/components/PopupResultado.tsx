import React, { useEffect, useState } from "react";
import {
  IonToast
} from "@ionic/react";

const PopupResultado: React.FC<{ resultado: string }> = (props) => {
  const [mostraMensagem, defineMostraMensagem] = useState(false);

  useEffect(() => {
    if (props.resultado) {
      defineMostraMensagem(true);
    }
  }, [props.resultado]);

  return (
    <IonToast
    isOpen={mostraMensagem}
    message={props.resultado}
    duration={10000}
    color="dark"
    >
    </IonToast>
  );
};

export default PopupResultado;
