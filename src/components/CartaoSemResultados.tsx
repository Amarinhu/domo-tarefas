import React from "react";
import { IonCard, IonCardContent, IonItem } from '@ionic/react';

const CardVazio: React.FC = () => {
  return (
    <IonCard color="secondary">
      <IonCardContent>
        <IonItem color="light">Nenhum Planejamento Encontrado</IonItem>
      </IonCardContent>
    </IonCard>
  );
};

export default CardVazio;
