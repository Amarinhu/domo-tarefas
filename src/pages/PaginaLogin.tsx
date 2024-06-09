import {
  IonApp,
  IonImg,
  IonContent,
  IonItem,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonText,
} from "@ionic/react";

import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import armazenamento from "../armazenamento";
import bcrypt from 'bcryptjs';

import LoginControles from "../components/LoginControles";
import PopupResultado from "../components/PopupResultado";
import logoImagem from "../assets/LoginUsuario.png";

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

import "./PaginaLogin.css";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";

const PaginaLogin: React.FC = () => {
  const [realizadoLogin, aplicaRealizadoLogin] = useState<string>("");
  const [carregamento, definirCarregamento] = useState<boolean>(false);
  const [imagemPerfil, definirImagemPerfil] = useState("");
  const [ultimoUsuario, definirUltimoUsuario] = useState("");

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const usuarioEntrada = useRef<HTMLIonInputElement>(null);
  const senhaEntrada = useRef<HTMLIonInputElement>(null);
  let usuarioInserido = "";
  let senhaInserida = "";
  let estadoLogin = "";

  const navegar = useHistory();
  const dataAtual = new Date();

  const iniciaSessao = async (token: string, usuario: string, idUsuario: number) => {
    await armazenamento.set("token", token);
    await armazenamento.set("usuario", usuario);
    await armazenamento.set("tempoLimite", dataAtual);
    await armazenamento.set("idUsuario", idUsuario);
    navegar.replace("/PainelDeTarefas");
  };

  const consultaLoginBanco = async (
    usuarioInserido: string,
    senhaInserida: string
  ) => {
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      /*console.log('== Consulta Login Banco ==')*/

      const resultado = await db?.query(
        "SELECT token, id from Usuario where email = ?",
        [usuarioInserido]
      );

      /*console.log(resultado)*/
      if (resultado && resultado.values && resultado.values.length > 0) {
        const token = resultado?.values[0]?.token;
        const idUsuario = resultado?.values[0]?.id;

        const validaSenha = await bcrypt.compare(senhaInserida, token);

        if (validaSenha) {
          iniciaSessao(token, senhaInserida, idUsuario);
        } else {
          estadoLogin = "Usuario ou Senha incorretos";
        }
      } else {
        estadoLogin = "Usuario ou Senha incorretos";
      }
    });
  };

  const faltandoDados = async () => {
    estadoLogin = "Usuario ou Senha em branco";
  };

  const realizaLogin = async () => {
    usuarioInserido = String(usuarioEntrada.current?.value).trim();
    senhaInserida = String(senhaEntrada.current?.value).trim();

    try {
      definirCarregamento(true);
      console.log(
        `Usuario Inserido: ${usuarioInserido} Senha Inserida: ${senhaInserida}`
      );
      if (usuarioInserido === "" || senhaInserida === "") {
        await faltandoDados();
      } else {
        try {
          await consultaLoginBanco(usuarioInserido, senhaInserida);
        } catch (erro) {
          console.log(erro);
        }
      }
    } catch (erro) {
      console.log(`Erro: ${erro}`);
    } finally {
      /*console.log(`Status Login: ${estadoLogin}`);*/
      aplicaRealizadoLogin(estadoLogin);
      definirCarregamento(false);
    }
  };

  const obterToken = async () => {
    return await armazenamento.get("token");
  };
  const obterUsuario = async () => {
    return await armazenamento.get("usuario");
  };

  useEffect(() => {
    const buscarDados = async () => {
      const token = await obterToken();
      const usuario = await obterUsuario();
      const condicao = token && usuario;
      if (condicao) {
        navegar.replace("/PainelDeTarefas");
      }
    };

    buscarDados();
  }, [navegar]);

  useEffect(() => {
    const mostraImagem = async () => {
      try {
        executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
          const resultado = await db?.query(
            "SELECT email, imagem from Usuario"
          );
          if (resultado && resultado.values && resultado.values.length > 0) {
            definirUltimoUsuario(resultado?.values[0]?.usuario);

            const foto = `data:image/png;base64, ${resultado?.values[0]?.imagem}`;
            definirImagemPerfil(foto);
          } else {
            definirImagemPerfil(logoImagem);
          }
        });
      } catch (erro) {
        console.log(erro);
      }
    };

    mostraImagem();
  }, [iniciado]);

  const enviaParaCadastro = () => {
    navegar.push("/PaginaCadastro?cadastro=true");
  }


  return (
    <IonApp>
      <IonContent color="tertiary">
        <div className="ion-padding" style={{ paddingTop: "10%" }}>
          <div className="circula-img limita-img">
            {dataAtual && (
              <IonImg
                className="padroniza-imagem"
                src={imagemPerfil}
                alt="Logo"
              ></IonImg>
            )}
          </div>
          {carregamento ? (
            <CirculoCarregamento />
          ) : (
            <>
              <IonGrid className="ion-text-center ion-margin">
                <IonRow>
                  <IonCol>
                    <IonItem color="light">
                      <IonInput
                        ref={usuarioEntrada}
                        label="Usuário"
                        label-placement="floating"
                        placeholder="Insira o Usuário"
                        id="usuario-input"
                        value={ultimoUsuario}
                        color="dark"
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
                        placeholder="Insira a senha"
                        id="senha-input"
                        color="dark"
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <LoginControles aoLogar={realizaLogin} />
                <br></br>
                <IonText onClick={enviaParaCadastro} style={{ fontWeight: "bold", textDecoration: 'underline' }}>
                  Cadastre-se
                </IonText>
                <br></br>

                <PopupResultado resultado={realizadoLogin} />
              </IonGrid>
            </>
          )}
        </div>
      </IonContent>
    </IonApp>
  );
};

export default PaginaLogin;
