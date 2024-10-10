import { useEffect, useRef, useState } from "react";
import {
  SQLiteDBConnection,
  SQLiteConnection,
  CapacitorSQLite,
} from "@capacitor-community/sqlite";

const usaSQLiteDB = () => {
  const db = useRef<SQLiteDBConnection>();
  const sqlite = useRef<SQLiteConnection>();
  const [iniciado, defineIniciado] = useState<boolean>(false);

  useEffect(() => {
    const inicializaDB = async () => {
      if (sqlite.current) return;

      sqlite.current = new SQLiteConnection(CapacitorSQLite);
      const consistencia = await sqlite.current.checkConnectionsConsistency();
      const verificacaoConexao = (
        await sqlite.current.isConnection("DomoBD", false)
      ).result;

      if (consistencia.result && verificacaoConexao) {
        db.current = await sqlite.current.retrieveConnection(
          "DomoBD",
          false
        );
      } else {
        db.current = await sqlite.current.createConnection(
          "DomoBD",
          false,
          "no-encryption",
          1,
          false
        );
      }
    };

    inicializaDB().then(async () => {
      await iniciaTabelas();
      defineIniciado(true);
    });
  }, []);

  const executarAcaoSQL = async (
    acao: (db: SQLiteDBConnection | undefined) => Promise<void>
  ) => {
    try {
      await db.current?.open();
      await acao(db.current);
    } catch (erro) {
      console.log(erro);
    } finally {
      try {
        (await db.current?.isDBOpen())?.result && (await db.current?.close());
      } catch (erro) {
        console.log(erro);
      }
    }
  };

  const iniciaTabelas = async () => {
    await executarAcaoSQL(async (db: SQLiteDBConnection | undefined) => {
      await db?.query(`CREATE TABLE IF NOT EXISTS Usuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        nome TEXT(200),
        descricao TEXT(500),
        imagem TEXT,
        xp INTEGER
    );
       
        CREATE TABLE IF NOT EXISTS Template (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        nome TEXT,
        observacao TEXT,
        importancia INTEGER,
        dificuldade INTEGER,
        dataInicio TEXT,
        dataFim TEXT,
        usuario_id INTEGER,
        ativo INTEGER
    );
    
        CREATE TABLE IF NOT EXISTS Tarefa (
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
    );
      
      CREATE TABLE IF NOT EXISTS Atributo (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        nome TEXT,
        observacao TEXT,
        xp INTEGER,
        imagem TEXT,
        ativo INTEGER
    );
    
      CREATE TABLE IF NOT EXISTS ListaAtributos (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        atributo_id INTEGER,
        tarefa_id INTEGER,
        ativo INTEGER
    );`);

    });
  };

  return { executarAcaoSQL, iniciado, iniciaTabelas };
};

export default usaSQLiteDB;
