import {
  IonApp,
  IonContent,
  IonItem,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonText,
  IonHeader,
  IonIcon,
  IonLabel,
} from "@ionic/react";

import React, { useRef, useState } from "react";
import { useHistory } from "react-router";
import bcrypt from "bcryptjs";

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

import "./PaginaCadastro.css";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import BarraSuperior from "../components/BarraSuperior";
import PopupResultado from "../components/PopupResultado";
import { man, save } from "ionicons/icons";

const PaginaCadastro: React.FC = () => {
  const [carregamento, definirCarregamento] = useState<boolean>(false);
  const [toastCarregamento, definirToastCarregamento] =
    useState<boolean>(false);

  const [resultadoCadastro, definirResultadoCadastro] = useState<string>("");

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const nomeEntrada = useRef<HTMLIonInputElement>(null);
  const emailEntrada = useRef<HTMLIonInputElement>(null);
  const senhaEntrada = useRef<HTMLIonInputElement>(null);
  const confirmarSenhaEntrada = useRef<HTMLIonInputElement>(null);

  const navegar = useHistory();

  const cadastrarUsuario = async () => {
    const nomeInserido = String(nomeEntrada.current?.value).trim();
    const emailInserido = String(emailEntrada.current?.value).trim();
    const senhaInserida = String(senhaEntrada.current?.value).trim();
    const confirmarSenhaInserida = String(
      confirmarSenhaEntrada.current?.value
    ).trim();

    if (
      !nomeInserido ||
      !emailInserido ||
      !senhaInserida ||
      !confirmarSenhaInserida
    ) {
      definirResultadoCadastro("Por favor, preencha todos os campos.");
      return;
    }

    if (senhaInserida !== confirmarSenhaInserida) {
      definirResultadoCadastro("As senhas não coincidem.");
      return;
    }

    try {
      definirCarregamento(true);
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senhaInserida, salt);

      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultadoSelectEmail = await db?.query(
          `SELECT * from usuario where email = '${emailInserido}'`
        );
        if(resultadoSelectEmail?.values && resultadoSelectEmail?.values?.length > 0){
          definirResultadoCadastro("Já existe um usuario com esse email")
        } else {
          await db?.query(
            `INSERT INTO Usuario (nome, email, token) VALUES (?, ?, ?)`,
            [nomeInserido, emailInserido, senhaHash]
          );

          console.log(`INSERT INTO Usuario (nome, email, token) VALUES (?, ?, ?)`, [nomeInserido, emailInserido, senhaHash])
  
          definirResultadoCadastro("Cadastro realizado com sucesso!");
          navegar.replace("/PaginaLogin");
        }
      });
    } catch (erro) {
      console.log(erro);
      definirResultadoCadastro(
        "Erro ao cadastrar usuário. Tente novamente mais tarde."
      );
    } finally {
      definirCarregamento(false);
    }
  };

  return (
    <IonApp>
      <IonHeader>
        <BarraSuperior icone={man} titulo="Cadastre-se" />
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
                        placeholder="Insira seu nome"
                        id="nome-input"
                        color="dark"
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={emailEntrada}
                        label="Email"
                        label-placement="floating"
                        placeholder="Insira seu email"
                        id="email-input"
                        type="email"
                        color="dark"
                        required
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={senhaEntrada}
                        type="password"
                        label="Senha"
                        label-placement="floating"
                        placeholder="Insira sua senha"
                        id="senha-input"
                        color="dark"
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={confirmarSenhaEntrada}
                        type="password"
                        label="Confirmar Senha"
                        label-placement="floating"
                        placeholder="Confirme sua senha"
                        id="confirmar-senha-input"
                        color="dark"
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonButton onClick={cadastrarUsuario}>
                  <IonIcon icon={save} slot="start"></IonIcon>
                  <IonLabel>Cadastrar-se</IonLabel>
                </IonButton>
              </IonGrid>
              <PopupResultado resultado={resultadoCadastro} />
            </>
          )}
        </div>
      </IonContent>
    </IonApp>
  );
};

export default PaginaCadastro;
