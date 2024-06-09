import React from 'react';
import { IonText, IonSpinner } from '@ionic/react';
import './CirculoCarregamento.css';

const CirculoCarregamento: React.FC = () => {

    return (
        <div className="container-carregamento" >
          {/*
          <IonText  className="texto-carregamento">
            Só um momento...
          </IonText>*/}
          <IonSpinner color="primary" className="custom-spinner" name="circular" />
        </div>
    );
};

export default CirculoCarregamento;
