import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTextarea,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import usaSQLiteDB from "../composables/usaSQLiteDB";
import TituloBotaoVoltar from "../components/BarraSuperior";
import {
  bug,
  build,
  closeCircle,
  reloadCircle,
  server,
  serverOutline,
  trash,
  trashBin,
} from "ionicons/icons";

const AssistenteDev: React.FC = () => {
  const [BancoItens, definirBancoItens] = useState<Array<any>>();
  const [estadoCarregamento, definirCarregamento] = useState(false);
  const { executarAcaoSQL } = usaSQLiteDB();

  const recarregarPagina = () => {
    location.reload();
  };

  const deletarTabela = async () => {
    try {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query("DROP TABLE IF EXISTS Usuario;");
        await db?.query("DROP TABLE IF EXISTS Template;");
        await db?.query("DROP TABLE IF EXISTS Tarefa;");
        await db?.query("DROP TABLE IF EXISTS Atributo;");
        await db?.query("DROP TABLE IF EXISTS ListaAtributos;");
      });
    } catch (erro) {
      console.log(erro);
    }
  };

  const [comandoSQL, definirComandoSQL] = useState<string>();
  const [dadosSQL, definirDadosSQL] = useState<any>();

  const executaSQL = () => {
    if (comandoSQL) {
      executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        const resultado = await db?.query(comandoSQL);
        definirDadosSQL(resultado?.values);

        console.log(typeof resultado);
        console.log(resultado?.values);
      });
      console.log("Comando Executado : " + comandoSQL);
    }
  };

  const capturaComandoSQL = (evento: CustomEvent) => {
    const valor = (evento.target as HTMLInputElement).value;
    definirComandoSQL(valor);
  };

  const paraCarregamento = () => {
    if (estadoCarregamento == true) {
      definirCarregamento(false);
    } else {
      definirCarregamento(true);
    }
    console.log(BancoItens);
  };

  const limparTabelas = async () => {
    try {
      await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
        await db?.query("DELETE FROM Template;");
        await db?.query("DELETE FROM Atributo;");
        await db?.query("DELETE FROM Usuario;");
        await db?.query("DELETE FROM ListaAtributos;");
        await db?.query("DELETE FROM Tarefa;");
      });

      recarregarPagina();
    } catch (erro) {
      console.log(erro);
    }
  };

  const testarArbitrario = async () => {
    try {
      definirCarregamento(true);
    } catch (erro) {
      console.log(erro);
    } finally {
      definirCarregamento(false);
    }
  };

  const mostraBanco = () => {
    executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      let a = await db?.query(`SELECT * from Usuario`);
      let b = await db?.query(`SELECT * from Template`);
      let c = await db?.query(`SELECT * from Tarefa`);
      let d = await db?.query(`SELECT * from Atributo`);
      let e = await db?.query(`SELECT * from ListaAtributos`);

      console.log("Usuario");
      console.log(a);
      console.log("Template");
      console.log(b);
      console.log("Tarefa");
      console.log(c);
      console.log("Atributo");
      console.log(d);
      console.log("ListaAtributos");
      console.log(e);
    });
  };

  const insercaoTeste = () => {
    const comandoSQL = `
    -- Inserts para Usuario
    INSERT INTO Usuario (email, token, nome, descricao, banco, ativo) VALUES 
    ('gabriel@exemplo.com', '$2a$10$cpDosrx3DyxZ.D4eII1yGe96TU9gqcOF2mpdZgAzw0n5vOOi50tCy', 'Gabriel', 'Descrição para usuário um', 100, 1),
    ('marcelo@exemplo.com', '$2a$10$cpDosrx3DyxZ.D4eII1yGe96TU9gqcOF2mpdZgAzw0n5vOOi50tCy', 'Marcelo', 'Descrição para usuário dois', 200, 1);

    -- Inserts para Template
    INSERT INTO Template (nome, observacao, importancia, dificuldade, recompensa, usuario_id, ativo) VALUES 
    ('Template de Programação', 'Template para tarefas de programação', 5, 5, 300, 1, 1),
    ('Template de Exercício Físico', 'Template para tarefas de exercícios físicos', 4, 4, 200, 2, 1),
    ('Template de Estudos', 'Template para tarefas de estudo', 3, 3, 150, 1, 1),
    ('Template de Criatividade', 'Template para tarefas criativas', 4, 4, 200, 2, 1),
    ('Template Social', 'Template para tarefas sociais', 2, 2, 100, 1, 1);

    -- Inserts para Tarefa
    INSERT INTO Tarefa (nome, observacao, importancia, recompensa, dificuldade, data, usuario_id, completa, ativo) VALUES 
    ('Completar projeto de programação', 'Trabalhar no projeto X', 5, 300, 5, '2024-06-15', 1, 0, 1),
    ('Treino de força na academia', 'Fazer treino completo de força', 4, 200, 4, '2024-06-16', 1, 0, 1),
    ('Estudar para a prova', 'Revisar o material para a prova de amanhã', 3, 150, 3, '2024-06-17', 2, 0, 1),
    ('Criar uma obra de arte', 'Desenvolver uma pintura ou escultura', 4, 200, 4, '2024-06-18', 2, 0, 1),
    ('Participar de evento social', 'Ir ao evento e fazer networking', 2, 100, 2, '2024-06-19', 1, 0, 1);

    -- Inserts para Atributo
    INSERT INTO Atributo (nome, descricao, xp, ativo) VALUES 
    ('PRO', 'Atributo relacionado a programação', 10, 1),
    ('FOR', 'Atributo relacionado a força física', 20, 1),
    ('INT', 'Atributo relacionado a inteligência', 30, 1),
    ('CRE', 'Atributo relacionado a criatividade', 40, 1),
    ('SOC', 'Atributo relacionado a habilidades sociais', 50, 1);

    -- Inserts para ListaAtributos
    INSERT INTO ListaAtributos (atributo_id, tarefa_id, ativo) VALUES 
    (1, 6, 1),  -- PRO para tarefa 'Completar projeto de programação'
    (2, 7, 1),  -- FOR para tarefa 'Treino de força na academia'
    (3, 8, 1),  -- INT para tarefa 'Estudar para a prova'
    (4, 9, 1),  -- CRE para tarefa 'Criar uma obra de arte'
    (5, 10, 1); -- SOC para tarefa 'Participar de evento social'`;

    executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      await db?.query(comandoSQL)
    })
  };

  const IniciarBanco = async () => {
    const comandos = [`CREATE TABLE IF NOT EXISTS Usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT(200),
      descricao TEXT(500),
      imagem TEXT,
      xp INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS Atributo (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT,
      observacao TEXT,
      xp INTEGER,
      imagem TEXT,
      ativo INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS Tarefa (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT,
      observacao TEXT,
      importancia INTEGER,
      dificuldade INTEGER,
      dataInicio TEXT,
      dataFim TEXT,
      usuario_id INTEGER,
      completa INTEGER,
      ativo INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS Template (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      nome TEXT,
      observacao TEXT,
      importancia INTEGER,
      dificuldade INTEGER,
      dataInicio TEXT,
      dataFim TEXT,
      usuario_id INTEGER,
      ativo INTEGER
    );`,
      `CREATE TABLE IF NOT EXISTS ListaAtributos (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      atributo_id INTEGER,
      tarefa_id INTEGER,
      ativo INTEGER,
      FOREIGN KEY (atributo_id) REFERENCES Atributo(id),
      FOREIGN KEY (tarefa_id) REFERENCES Tarefa(id)
    );`]
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      for (const comando of comandos) {
        console.log(comando)
        await db?.query(comando)
      }
    })
  }

  return (
    <IonPage>
      <TituloBotaoVoltar titulo="Assistente" icone={build} />
      <IonContent color="tertiary">
        <IonCard color="secondary">
          <IonCardContent>
            <IonButtons>
              <IonButton onClick={recarregarPagina}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={reloadCircle}
                ></IonIcon>
                <IonLabel>Recarregar</IonLabel>
              </IonButton>

              <IonButton onClick={paraCarregamento}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={closeCircle}
                ></IonIcon>
                <IonLabel>On/Off</IonLabel>
              </IonButton>
            </IonButtons>
          </IonCardContent>
        </IonCard>

        <IonCard color="secondary">
          <IonCardContent>
            <IonButtons>
              <IonButton onClick={limparTabelas}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={trashBin}
                ></IonIcon>
                <IonLabel>Limpa Tab</IonLabel>
              </IonButton>

              <IonButton onClick={deletarTabela}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={trash}
                ></IonIcon>
                <IonLabel>Deleta Tab</IonLabel>
              </IonButton>
            </IonButtons>
          </IonCardContent>
        </IonCard>

        <IonCard color="secondary">
          <IonCardContent>
            <IonButtons>
              <IonButton onClick={testarArbitrario}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={bug}
                ></IonIcon>
                <IonLabel>Wild Card</IonLabel>
              </IonButton>
              <IonButton onClick={insercaoTeste}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={bug}
                ></IonIcon>
                <IonLabel>Inserção</IonLabel>
              </IonButton>
            </IonButtons>
          </IonCardContent>
        </IonCard>

        <IonCard color="secondary">
          <IonCardContent>
            <IonButtons>
              <IonButton onClick={mostraBanco}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={server}
                ></IonIcon>
                <IonLabel>Ver Banco</IonLabel>
              </IonButton>
              <IonButton onClick={IniciarBanco}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={server}
                ></IonIcon>
                <IonLabel>Iniciar Banco</IonLabel>
              </IonButton>
            </IonButtons>
          </IonCardContent>
        </IonCard>

        <IonCard color="secondary">
          <IonCardContent>
            <IonButtons>
              <IonButton onClick={executaSQL}>
                <IonIcon
                  slot="start"
                  className="icon-large"
                  icon={serverOutline}
                ></IonIcon>
                <IonLabel>Executa SQL</IonLabel>
              </IonButton>
            </IonButtons>
            <IonTextarea
              autoGrow={true}
              onIonInput={capturaComandoSQL}
              placeholder="Insira o comando SQL"
            ></IonTextarea>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader color="light">Resultado SQL</IonCardHeader>
          <div>
            {dadosSQL
              ? Object.entries(dadosSQL).map(([chave, valor]) => (
                <div
                  key={chave}
                  style={{
                    backgroundColor: "black",
                    color: "#008000",
                    paddingBottom: "0.5rem",
                    paddingTop: "0.5rem",
                    paddingRight: "0.5rem",
                    paddingLeft: "1rem",
                  }}
                >
                  <strong>{chave}:</strong> {JSON.stringify(valor, null, 2)}
                  <br></br>
                </div>
              ))
              : null}
          </div>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AssistenteDev;
