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
import {
  body,
  camera,
  home,
  personCircle,
  rose,
  save,
  text,
} from "ionicons/icons";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import BarraInferior from "../components/BarraInferiorControles";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import atributoPlaceholder from "../assets/atributoPlaceholder.png";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useHistory, useLocation } from "react-router";

const PaginaBase: React.FC = () => {
  const [carregamento, defCarregamento] = useState<boolean>(false);
  const [mostraMensagem, defMostraMensagem] = useState<boolean>(false);
  const [textoToast, defTextoToast] = useState<string>("");
  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const [nome, defNome] = useState<string>("");
  const [imagem, defImagem] = useState<string>("");
  const [descricao, defDescricao] = useState<string>("");

  const localizacao = useLocation();
  const queryParams = new URLSearchParams(localizacao.search);
  const navegar = useHistory();

  useEffect(() => {
    if (textoToast !== "") {
      defMostraMensagem(true);

      setTimeout(() => {
        defMostraMensagem(false);
        defTextoToast("");
      }, 5000);
    }
  }, [textoToast]);

  const capDescricao = (evento: CustomEvent) => {
    const elementoHtml = evento.target as HTMLInputElement;
    const valor = elementoHtml.value;
    console.log(valor);
    defDescricao(valor);
  };

  const capNome = (evento: CustomEvent) => {
    const elementoHtml = evento.target as HTMLInputElement;
    const valor = elementoHtml.value;
    defNome(valor);
  };

  const salvar = async () => {
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const comandoSQL = `INSERT INTO ATRIBUTO (NOME, OBSERVACAO, IMAGEM, ATIVO) VALUES (?, ?, ?, ?)`;
        await db?.query(comandoSQL, [nome, descricao, imagem, 1]);
      });
    } catch (erro) {
      console.error(erro);
    } finally {
      defTextoToast("Atributo Cadastrado");
      navegar.push("/PaginaAtributos");
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
      defImagem(base64Imagem);
    } catch (error) {
      console.error("Erro em selecionaImagem:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <BarraSuperior icone={rose} titulo={"Cadastrar Atributo"} />
      </IonHeader>
      <IonContent color="tertiary">
        {!carregamento ? (
          <IonCard key="1" color="secondary">
            <IonCardHeader style={{ paddingBottom: "0px" }}>
              <div
                className="circula-img"
                style={{ width: "8rem", height: "8rem" }}
              >
                {imagem ? (
                  <IonImg
                    className="padroniza-imagem"
                    src={imagem ?? atributoPlaceholder}
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
                <IonInput
                  onIonInput={capNome}
                  value={nome}
                  placeholder="Insira o Nome do Atributo"
                />
              </div>
            </IonCardHeader>
            <IonCardContent>
              <IonItem lines="none" color="secondary">
                <IonTextarea
                  placeholder="Insira a Descrição do Atributo"
                  autoGrow={true}
                  onIonInput={capDescricao}
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
          duration={5000}
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
