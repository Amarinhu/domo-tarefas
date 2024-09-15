import { useState } from "react";
import BarraSuperior from "../components/BarraSuperior";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonToast,
} from "@ionic/react";
import { home, text } from "ionicons/icons";
import CirculoCarregamento from "../components/CirculoDeCarregamento";

const PaginaBase: React.FC = () => {
  const [carregamento, defCarregamento] = useState<boolean>(false);
  const [mostraMensagem, defMostraMensagem] = useState<boolean>(false);
  const [texto, definirTexto] = useState<string>("");

  const funcao = () => {
    defMostraMensagem(true);
  };

  const capturaTexto = (evento: CustomEvent) => {
    const elementoHtml = evento.target as HTMLInputElement;
    const valor = elementoHtml.value;
    definirTexto(valor);
  };

  const onOffCarregamento = () => {
    if (carregamento == false) {
      defCarregamento(true);
    } else {
      defCarregamento(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <BarraSuperior icone={home} titulo={"Pagina Base"} />
      </IonHeader>
      <IonContent color="tertiary">
        <IonCard color="secondary">
          <IonCardContent>
            <IonItem lines="none" color="secondary">
              <IonInput
                onIonInput={capturaTexto}
                placeholder="Escreva algo"
              ></IonInput>
            </IonItem>
            <div className="ion-text-center">
              <IonButton onClick={funcao}>
                <IonLabel>Ação</IonLabel>
              </IonButton>
            </div>
            <div className="ion-text-center">
              <IonButton onClick={onOffCarregamento}>
                <IonLabel>Carregamento</IonLabel>
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
        <IonToast
          isOpen={mostraMensagem}
          message={texto}
          onDidDismiss={() => defMostraMensagem(false)}
          duration={5000}
        ></IonToast>
        {carregamento ? <CirculoCarregamento /> : null}
      </IonContent>
    </IonPage>
  );
};

export default PaginaBase;
