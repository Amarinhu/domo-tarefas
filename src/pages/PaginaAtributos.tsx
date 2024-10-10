import { useEffect, useState } from "react";
import BarraSuperior from "../components/BarraSuperior";
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonProgressBar,
  IonRow,
  IonToast,
} from "@ionic/react";
import { home, pencil, rose, text, trash } from "ionicons/icons";
import CirculoCarregamento from "../components/CirculoDeCarregamento";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import atributoPlaceholder from "../assets/atributoPlaceholder.png";
import BarraInferior from "../components/BarraInferiorControles";

const PaginaBase: React.FC = () => {
  const [carregamento, defCarregamento] = useState<boolean>(false);

  const [atributoItens, defAtributoItens] = useState<Array<any>>([]);

  const { executarAcaoSQL, iniciado } = usaSQLiteDB();

  const buscaDados = async () => {
    const comandoSQL = `SELECT * FROM ATRIBUTO WHERE ATIVO = 1;`;
    defCarregamento(true);
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultado = await db?.query(comandoSQL);

        if (resultado && resultado.values && resultado.values.length > 0) {
          console.log(resultado.values);
          defAtributoItens(resultado.values);
        }
      });
    } catch (erro) {
      console.error(erro);
    } finally {
      defCarregamento(false);
    }
  };

  const calculaNivel = (xp: number) => {
    let nivel = 0;
    let custoProxNivel = 500;

    while (xp - custoProxNivel >= 0) {
      xp -= custoProxNivel;
      nivel += 1;
      custoProxNivel += custoProxNivel;
    }

    return nivel;
  };

  const calculaPorcentagem = (xp: number) => {
    let nivel = 0;
    let custoProxNivel = 500;
    let xpSobrando = 0;

    while (xp - custoProxNivel >= 0) {
      xp -= custoProxNivel;
      nivel += 1;
      custoProxNivel += custoProxNivel;
    }

    xpSobrando = xp;
    return xpSobrando / custoProxNivel;
  };

  const confirmaDelecao = async (id: number) => {
    let atributoDelecao = `
    UPDATE Atributo SET ativo = 0 WHERE id = ${id};`;

    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(atributoDelecao);
      });
    } catch (erro) {
      console.log(erro);
    } finally {
      location.reload();
    }
  };

  useEffect(() => {
    buscaDados();
  }, [iniciado]);

  return (
    <IonPage>
      <IonHeader>
        <BarraSuperior icone={rose} titulo={"Atributos"} />
      </IonHeader>

      <IonContent color="tertiary">
        {!carregamento ? (
          <div>
            {atributoItens.map((atributo, indice) => (
              <div>
                <IonCard key={indice} color="secondary">
                  <IonCardHeader
                    style={{ paddingBottom: "0.3rem" }}
                    className="ion-text-center"
                  >
                    <IonCardTitle style={{ fontWeight: "bold" }}>
                      <IonRow>
                        <IonCol
                          size="3"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {" "}
                          <IonImg
                            style={{
                              width: "4rem",
                              height: "4rem",
                              borderRadius: "50%",
                              objectFit: "cover",
                              overflow: "hidden",
                            }}
                            src={atributo.imagem ?? atributoPlaceholder}
                          />
                        </IonCol>
                        <IonCol
                          size="7"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          • {atributo.nome}
                        </IonCol>

                        <IonCol size="2" style={{ padding: "0px" }}>
                          <IonRow>
                            <IonButton
                              fill="clear"
                              href={`/PaginaAtributoEdicao?id=${atributo.id}`}
                            >
                              <IonIcon icon={pencil} />
                            </IonButton>
                          </IonRow>
                          <IonRow>
                            <IonButton
                              fill="clear"
                              id={`delecao-alerta-${atributo.id}`}
                            >
                              <IonIcon icon={trash} />
                            </IonButton>
                          </IonRow>
                        </IonCol>
                      </IonRow>
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="ion-text-center">
                      Nível {calculaNivel(atributo.xp)}
                    </div>
                    <IonProgressBar
                      value={calculaPorcentagem(atributo.xp)}
                    ></IonProgressBar>
                    {atributo.observacao}
                  </IonCardContent>
                </IonCard>
                <IonAlert
                key ={`delecao-${atributo.id}`}
                  trigger={`delecao-alerta-${atributo.id}`}
                  header="Deletar Atributo?"
                  message="Tem certeza que deseja deletar essa atributo?"
                  buttons={[
                    {
                      text: "Confirmar",
                      handler: () => confirmaDelecao(atributo.id),
                    },
                    {
                      text: "Cancelar",
                    },
                  ]}
                ></IonAlert>{" "}
              </div>
            ))}

            <IonButton
              href="./PaginaAtributoCadastro"
              shape="round"
              className="custom-botao"
              color="primary"
            >
              +
            </IonButton>
          </div>
        ) : null}
        {carregamento ? <CirculoCarregamento /> : null}
      </IonContent>

      <BarraInferior />
    </IonPage>
  );
};

export default PaginaBase;
