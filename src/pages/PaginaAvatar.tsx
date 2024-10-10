import { useEffect, useState } from "react";
import BarraSuperior from "../components/BarraSuperior";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonProgressBar,
  IonRow,
  IonText,
  IonTextarea,
  IonToast,
} from "@ionic/react";
import { body, camera, home, personCircle, save, text } from "ionicons/icons";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import BarraInferior from "../components/BarraInferiorControles";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import imagemLightMode from "../assets/avatarLightMode.png";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const PaginaBase: React.FC = () => {
  const [carregamento, defCarregamento] = useState<boolean>(false);
  const [mostraMensagem, defMostraMensagem] = useState<boolean>(false);
  const [textoToast, defTextoToast] = useState<string>("");
  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const [nome, defNome] = useState<string>("");
  const [imagem, defImagem] = useState<string>("");
  const [descricao, defDescricao] = useState<string>("");
  const [xp, defXp] = useState<number>(0);
  const [resultadosXp, defResultadosXp] = useState<any>();

  const capDescricao = (evento: CustomEvent) => {
    const elementoHtml = evento.target as HTMLInputElement;
    const valor = elementoHtml.value;
    defDescricao(valor);
  };

  const capNome = (evento: CustomEvent) => {
    const elementoHtml = evento.target as HTMLInputElement;
    const valor = elementoHtml.value;
    defNome(valor);
  };

  useEffect(() => {
    if (textoToast !== "") {
      defMostraMensagem(true);

      setTimeout(() => {
        defMostraMensagem(false);
        defTextoToast("");
      }, 2000);
    }
  }, [textoToast]);

  useEffect(() => {
    buscaDados();
  }, [iniciado]);

  const salvar = async () => {
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const comandoSQL = `UPDATE USUARIO SET NOME = ?, DESCRICAO = ?;`;
        await db?.query(comandoSQL, [nome, descricao]);
      });
    } catch (erro) {
      console.error(erro);
    } finally {
      defTextoToast("Alterações Salvas");
    }
  };

  const calculaNivel = async (xp: number) => {
    let nivel = 0;
    let custoProxNivel = 500;
    let xpSobrando = 0;

    while (xp - custoProxNivel >= 0) {
      xp -= custoProxNivel;
      nivel += 1;
      custoProxNivel += custoProxNivel;
    }

    xpSobrando = xp;

    const resultados = [
      { nivel: nivel },
      { xpExcedente: xpSobrando },
      { xpProxNivel: custoProxNivel },
    ];

    defResultadosXp(resultados);
  };

  const buscaDados = async () => {
    try {
      defCarregamento(true);
      /*const prefDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
      const estadoDarkMode = prefDarkMode.matches;*/
      let imgPerfil = "";
      /*if (estadoDarkMode) {
        imgPerfil = imagemDarkMode;
      } else {
        imgPerfil = imagemLightMode;
      }*/
      imgPerfil = imagemLightMode;
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const comandoSQL = `
            SELECT COALESCE(nome, 'Casca Vazia') as nome, 
                COALESCE(descricao, 'Uma casca vazia esperando para ser algo') as descricao, 
                COALESCE(imagem, '${imagemLightMode}') as imagem,
                COALESCE(xp, 0) as xp
            FROM Usuario LIMIT 1;`;
        let resultado = await db?.query(comandoSQL);
        if (resultado && resultado.values && resultado?.values?.length <= 0) {
          await db?.query(`INSERT INTO USUARIO (nome, descricao, imagem, xp)
            VALUES ('Casca Vazia', 'Uma casca vazia esperando para ser algo', '${imagemLightMode}', 0) `);

          resultado = await db?.query(comandoSQL);
        }
        console.log("Resultado de SQL Usuário: ");
        console.log(resultado);
        const nome = resultado?.values?.[0].nome;
        const descricao = resultado?.values?.[0].descricao;
        const imagem = resultado?.values?.[0].imagem;
        const xp = resultado?.values?.[0].xp;

        defNome(nome);
        defDescricao(descricao);
        defImagem(imagem);
        defXp(xp);
        calculaNivel(xp);
      });
    } catch (erro) {
      defTextoToast("Erro ocorreu: " + erro);
    } finally {
      defCarregamento(false);
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

      const base64Imagem = `data:image/${imagem.format};base64,${imagem.base64String}`;

      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(`UPDATE USUARIO SET imagem = ?`, [base64Imagem]);
        location.reload();
      });
    } catch (error) {
      console.error("Erro em selecionaImagem:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <BarraSuperior icone={body} titulo={"Perfil"} />
      </IonHeader>
      <IonContent color="tertiary">
        {!carregamento ? (
          <IonCard color="secondary">
            <IonCardHeader style={{ paddingBottom: "0px" }}>
              <div
                className="circula-img"
                style={{ width: "8rem", height: "8rem" }}
              >
                {imagem ? (
                  <IonImg
                    className="padroniza-imagem"
                    src={imagem}
                    alt="Logo"
                  ></IonImg>
                ) : null}
              </div>

              <div className="ion-text-center">
                <IonButton onClick={selecionaImagem}>
                  <IonIcon icon={camera} />
                </IonButton>
              </div>

              <div className="ion-text-center" style={{ fontSize: "1.2rem" }}>
                <IonInput onIonInput={capNome} value={nome} />
              </div>
              {resultadosXp ? (
                <div className="ion-text-center">
                  {" "}
                  <IonText>Nível {resultadosXp[0].nivel}</IonText>
                  <IonProgressBar
                    value={
                      resultadosXp[1].xpExcedente / resultadosXp[2].xpProxNivel
                    }
                  ></IonProgressBar>{" "}
                </div>
              ) : null}
            </IonCardHeader>
            <IonCardContent>
              <IonItem lines="none" color="secondary">
                <IonTextarea
                  label="Descrição"
                  labelPlacement="floating"
                  autoGrow={true}
                  onIonInput={capDescricao}
                  placeholder="Escreva algo"
                  value={descricao}
                ></IonTextarea>
              </IonItem>
              <div className="ion-text-center">
                <br></br>
                <IonButton onClick={salvar}>
                  <IonIcon icon={save}></IonIcon>
                </IonButton>
                {/*<IonButton onClick={() => console.log(resultadosXp)}>
                    Teste
                </IonButton>*/}
              </div>
            </IonCardContent>
          </IonCard>
        ) : null}
        <IonToast
          isOpen={mostraMensagem}
          message={textoToast}
          onDidDismiss={() => defMostraMensagem(false)}
          duration={2000}
        ></IonToast>
        {carregamento ? <CirculoCarregamento /> : null}
      </IonContent>
      <IonFooter>
        <BarraInferior />
      </IonFooter>
    </IonPage>
  );
};

export default PaginaBase;
