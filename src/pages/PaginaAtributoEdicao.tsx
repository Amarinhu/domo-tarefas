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
import { useHistory, useLocation } from "react-router";
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

const PaginaAtributoEdicao: React.FC = () => {
  const [carregamento, definirCarregamento] = useState<boolean>(false);
  const [resultadoCadastro, definirResultadoCadastro] = useState<string>("");
  const [atributoEdicao, definirAtributoEdicao] = useState<any>();

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const nomeEntrada = useRef<HTMLIonInputElement>(null);
  const descricaoEntrada = useRef<HTMLIonTextareaElement>(null);

  const navegar = useHistory();

  const localizacao = useLocation();
  const queryParams = new URLSearchParams(localizacao.search);
  const idEdicao = queryParams.get("id");

  const atualizarAtributo = async () => {
    const nomeInserido = String(nomeEntrada.current?.value).trim();
    const descricaoInserida = String(descricaoEntrada.current?.value).trim();

    try {
      definirCarregamento(true);

      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(
          `UPDATE Atributo SET nome = ?, descricao = ? WHERE id = ${idEdicao}`,
          [nomeInserido, descricaoInserida]
        );

        definirResultadoCadastro("Atributo editado com sucesso!");
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

  useEffect(() => {
    const buscaDados = async () => {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultado = await db?.query(
          `SELECT * FROM ATRIBUTO WHERE ID = ${idEdicao}`
        );
        definirAtributoEdicao(resultado?.values);
      });
    };

    buscaDados();
  }, [iniciado]);

  return (
    <IonApp>
      <IonHeader>
        <BarraSuperior icone={rose} titulo="Editar Atributo" />
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
                        value={atributoEdicao?.[0].nome}
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
                        value={atributoEdicao?.[0].descricao}
                      ></IonTextarea>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonButton onClick={atualizarAtributo}>
                  <IonIcon slot="start" icon={save} />
                  <IonLabel>Atualizar</IonLabel>
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

export default PaginaAtributoEdicao;
