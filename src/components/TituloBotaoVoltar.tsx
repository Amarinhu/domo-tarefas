import React from 'react';
import { IonToolbar, IonTitle, IonProgressBar, IonIcon } from '@ionic/react';
import BotaoVoltar from './BotaoVoltar';

interface TituloBotaoVoltarProps {
    titulo: string;
    icone?: string;
}

const TituloBotaoVoltar: React.FC<TituloBotaoVoltarProps> = ({ titulo, icone }) => {
    return (
        <div>
            <IonToolbar color="primary">
                <div className="flex-center">
                    <BotaoVoltar/>
                    {icone && <IonIcon style={{ height : '1.5rem', width : '1.5rem' }} icon={icone}></IonIcon>}
                    <IonTitle>{titulo}</IonTitle>
                </div>
            </IonToolbar>
        </div>
    );
};

export default TituloBotaoVoltar;