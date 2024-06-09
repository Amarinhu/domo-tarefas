import React, { useEffect, useRef, useState } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonImg,
  IonCol,
  IonRow,
  IonGrid,
  IonText,
  IonCard,
  IonCardSubtitle,
  IonSelectOption,
  IonSelect,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonTextarea,
  IonButtons,
} from "@ionic/react";
import {
  settings,
  sync,
  clipboardOutline,
  happy,
  personCircle,
  save,
  body,
  camera,
} from "ionicons/icons";
import "./PaginaAvatar.css";
import TituloBotaoVoltar from "../components/BarraSuperior";
import { useHistory } from "react-router";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import logoImagem from "../assets/LoginUsuario.png";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import BarraInferior from "../components/BarraInferiorControles";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import armazenamento from "../armazenamento";

const PaginaServidor: React.FC = () => {
  const { executarAcaoSQL, iniciado } = usaSQLiteDB();
  const [imagemPerfil, definirImagemPerfil] = useState<string | undefined>(
    undefined
  );
  const [nomeUsuario, definirNomeUsuario] = useState("");
  const [estadoCarregamento, definirCarregamento] = useState<boolean>();
  const [idUsuario, definirIdUsuario] = useState();

  const [descricao, definirDescricao] = useState<string>("");

  const descricaoEntrada = useRef<HTMLIonTextareaElement>(null);

  const navegar = useHistory();

  useEffect(() => {
    const capturaIdUsuarioPromise = async () => {
      const resultado = await armazenamento.get("idUsuario");
      return await resultado;
    };

    const obterIdUsuario = async () => {
      const idUsuarioAtual: any = await capturaIdUsuarioPromise();
      definirIdUsuario(idUsuarioAtual);
    };

    obterIdUsuario();

    const mostraImagemEInfo = async () => {
      definirCarregamento(true);
      try {
        await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
          let resultadoFoto = await db?.query(
            `SELECT imagem from usuario where id = ${idUsuario}`
          );
          if (
            resultadoFoto &&
            resultadoFoto.values &&
            resultadoFoto.values.length > 0
          ) {
            const foto = `data:image/png;base64, ${resultadoFoto?.values[0]?.imagem}`;
            definirImagemPerfil(foto);
          } else {
            definirImagemPerfil(logoImagem);
          }

          let resultadoInfo = await db?.query(
            `SELECT nome, descricao from usuario where id = ${idUsuario}`
          );
          if (
            resultadoInfo &&
            resultadoInfo.values &&
            resultadoInfo.values.length > 0
          ) {
            const nome = resultadoInfo?.values[0]?.nome;
            const descricao = resultadoInfo?.values[0]?.descricao;
            definirNomeUsuario(nome);
            definirDescricao(descricao);
          } else {
            definirNomeUsuario("N/A");
          }
        });
      } catch (erro) {
        console.log(erro);
      } finally {
        definirCarregamento(false);
      }
    };

    mostraImagemEInfo();
  }, [iniciado]);

  const mostraImagemEInfo = async () => {
    definirCarregamento(true);
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        let resultadoFoto = await db?.query(
          `SELECT imagem from usuario where id = ${idUsuario}`
        );
        if (
          resultadoFoto &&
          resultadoFoto.values &&
          resultadoFoto.values.length > 0
        ) {
          const foto = `data:image/png;base64, ${resultadoFoto?.values[0]?.imagem}`;
          definirImagemPerfil(foto);
        } else {
          definirImagemPerfil(logoImagem);
        }

        let resultadoInfo = await db?.query(
          `SELECT nome, descricao from usuario where id = ${idUsuario}`
        );
        if (
          resultadoInfo &&
          resultadoInfo.values &&
          resultadoInfo.values.length > 0
        ) {
          const nome = resultadoInfo?.values[0]?.nome;
          const descricao = resultadoInfo?.values[0]?.descricao;
          definirNomeUsuario(nome);
          definirDescricao(descricao);
        } else {
          definirNomeUsuario("N/A");
        }
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      definirCarregamento(false);
    }
  };

  const selecionaImagem = async () => {
    try {
      const imagem = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });
      console.log("Imagem obtida:", imagem);

      const base64Imagem = `data:image/${imagem.format};base64,${imagem.base64String}`;
      definirImagemPerfil(base64Imagem);

      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        if (!db) {
          throw new Error("Conexão com o banco de dados está indefinida");
        }

        const result = await db.query(
          `UPDATE USUARIO SET imagem = ? where id = ${idUsuario}`,
          [imagem.base64String]
        );
        console.log("Resultado da atualização do banco de dados:", result);
      });
    } catch (error) {
      console.error("Erro em selecionaImagem:", error);
    }
  };

  const salvaDescricao = async () => {
    const descricaoInserida = String(descricaoEntrada.current?.value).trim();
    try {
      definirCarregamento(true);

      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(
          `UPDATE usuario SET descricao = ? where id = ${idUsuario}`,
          [descricaoInserida ?? ""]
        );
      });

      await mostraImagemEInfo();
    } catch (erro) {
      console.log(erro);
    } finally {
      definirCarregamento(false);
    }
  };

  return (
    <IonPage>
      <TituloBotaoVoltar icone={body} titulo="Avatar" />
      <IonContent color="tertiary">
        <div className="ion-padding">
          <IonGrid>
            <IonRow className="ion-align-items-center">
              {/*
              <IonCol className="ion-text-center">
                <IonButton className="botao-sem-margem">
                  <IonIcon
                    className="large-icon ion-text-center"
                    icon={sync}
                  ></IonIcon>
                </IonButton>
              </IonCol>*/}
              <IonCol className="ion-text-center">
                {estadoCarregamento === true ? (
                  <CirculoCarregamento />
                ) : (
                  <div className="circula-img limita-img">
                    {imagemPerfil ? (
                      <IonImg
                        className="padroniza-imagem"
                        src={imagemPerfil}
                        alt="Logo"
                      ></IonImg>
                    ) : null}
                  </div>
                )}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButtons className="ion-justify-content-center">
                  <IonButton
                    color="warning"
                    fill="solid"
                    onClick={selecionaImagem}
                  >
                    <IonIcon icon={camera} />
                  </IonButton>
                </IonButtons>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-center">
                {estadoCarregamento === true ? (
                  <CirculoCarregamento />
                ) : (
                  <IonCard color="secondary">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonText>{nomeUsuario}</IonText>
                      </IonCardTitle>
                      <IonCardSubtitle>
                        <IonTextarea
                          placeholder="Sua descrição"
                          value={descricao}
                          ref={descricaoEntrada}
                        ></IonTextarea>
                      </IonCardSubtitle>
                      <IonCardContent>
                        <IonButtons class="ion-justify-content-center">
                          <IonButton onClick={salvaDescricao}>
                            <IonIcon icon={save}></IonIcon>
                          </IonButton>
                        </IonButtons>
                      </IonCardContent>
                    </IonCardHeader>
                  </IonCard>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
        <BarraInferior />
      </IonContent>
    </IonPage>
  );
};

export default PaginaServidor;
