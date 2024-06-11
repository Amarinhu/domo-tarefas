import {
  IonApp,
  IonContent,
  IonItem,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonTextarea,
  IonHeader,
  IonIcon,
  IonLabel,
} from "@ionic/react";

import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import CirculoCarregamento from "../components/CirculoDeCarregamento";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import BarraSuperior from "../components/BarraSuperior";
import PopupResultado from "../components/PopupResultado";
import { rose, save } from "ionicons/icons";
import armazenamento from "../armazenamento";

const PaginaAtributoCadastro: React.FC = () => {
  const [carregamento, definirCarregamento] = useState<boolean>(false);
  const [resultadoCadastro, definirResultadoCadastro] = useState<string>("");
  const [idUsuario, definirIdUsuario] = useState();

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const nomeEntrada = useRef<HTMLIonInputElement>(null);
  const descricaoEntrada = useRef<HTMLIonTextareaElement>(null);

  const navegar = useHistory();

  const capturaIdUsuarioPromise = async () => {
    const resultado = await armazenamento.get('idUsuario')
    return await resultado
  }

  const obterIdUsuario = async() => {
    const idUsuarioAtual: any = await capturaIdUsuarioPromise();
    definirIdUsuario(idUsuarioAtual)
  }

  useEffect(() => {
    obterIdUsuario()
  },[iniciado])

  const cadastrarAtributo = async () => {
    const nomeInserido = String(nomeEntrada.current?.value).trim();
    const descricaoInserida = String(descricaoEntrada.current?.value).trim();

    if (!nomeInserido || !descricaoInserida) {
      definirResultadoCadastro("Por favor, preencha todos os campos.");
      return;
    }

    try {
      definirCarregamento(true);

      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(
          `INSERT INTO Atributo (nome, descricao, xp, ativo, usuario_id) VALUES (?, ?, ?, ?, ?)`,
          [nomeInserido, descricaoInserida, 0, 1, idUsuario]
        );

        definirResultadoCadastro("Atributo cadastrado com sucesso!");
        navegar.replace("/PaginaAtributos");
      });
    } catch (erro) {
      console.log(erro);
      definirResultadoCadastro(
        "Erro ao cadastrar atributo. Tente novamente mais tarde."
      );
    } finally {
      definirCarregamento(false);
    }
  };

  return (
    <IonApp>
      <IonHeader>
        <BarraSuperior icone={rose} titulo="Cadastrar Atributo" />
      </IonHeader>
      <IonContent color="tertiary">
        <div className="ion-padding">
          {carregamento ? (
            <CirculoCarregamento />
          ) : (
            <>
              <IonGrid className="ion-text-center ion-margin">
                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={nomeEntrada}
                        label="Nome"
                        label-placement="floating"
                        placeholder="Insira o nome do atributo"
                        id="nome-input"
                        color="dark"
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonTextarea
                        ref={descricaoEntrada}
                        label="Descrição"
                        label-placement="floating"
                        placeholder="Insira a descrição do atributo"
                        autoGrow={true}
                        id="descricao-input"
                        color="dark"
                      ></IonTextarea>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonButton onClick={cadastrarAtributo}>
                  <IonIcon slot="start" icon={save} />
                  <IonLabel>Cadastrar</IonLabel>
                </IonButton>
                <PopupResultado resultado={resultadoCadastro} />
              </IonGrid>
            </>
          )}
        </div>
      </IonContent>
    </IonApp>
  );
};

export default PaginaAtributoCadastro;
