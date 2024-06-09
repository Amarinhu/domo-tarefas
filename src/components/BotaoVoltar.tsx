import React, { useState } from 'react';
import { IonButton, IonButtons, IonIcon } from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';

const VoltarBotao: React.FC = () => {
    const navegar = useHistory();

    const voltarPagina = () => {
        navegar.goBack();
    };

    return (
        <IonButtons>
            <IonButton className="botao-sem-margem" onClick={voltarPagina}>
                <IonIcon className="large-icon avatar-icon-menor" icon={chevronBackOutline}></IonIcon>
            </IonButton>
        </IonButtons>
    );
};

export default VoltarBotao;
