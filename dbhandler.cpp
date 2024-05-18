#include "dbhandler.h"
#include "QtCore/qdebug.h"

#include <QSettings>
#include <QSqlQuery>
#include <QCoreApplication>

void DbHandler::createTables()
{
    // define the query for this->db
    QSqlQuery query(this->db);

    // create the if not exists table for the accounts, make the query multiple lines for readability
    query.exec("CREATE TABLE IF NOT EXISTS accounts ("
               "id INTEGER PRIMARY KEY AUTOINCREMENT, "
               "uid TEXT, "
               "summonerName TEXT, "
               "region TEXT, "
               "apiKey TEXT, "
               "tagName TEXT, "
               "summonerLevel INTEGER, "
               "profileIconId INTEGER"
               "lastFetchedAt DATETIME"
               "description TEXT"
               "password TEXT"
               "tier TEXT"
               "rank TEXT"
               "lp INTEGER"
               ");");
\
}

DbHandler::DbHandler() {
    initDb();
}


void DbHandler::initDb()
{
    this->db = QSqlDatabase::addDatabase("QSQLITE");
    // the database should be located in the storagePath set in the settings
    QSettings settings;
    QString storagePath = settings.value("storagePath").toString();
    this->db.setDatabaseName(storagePath + "/clave.db");

    if (!db.open()) {
        qDebug() << "Error: connection with database fail";
    } else {
        qDebug() << "Database: connection ok";
        createTables();
    }
}
