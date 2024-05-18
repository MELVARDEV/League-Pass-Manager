#ifndef DBHANDLER_H
#define DBHANDLER_H

#include <QSqlDatabase>
#include <QCoreApplication>


class DbHandler
{

private:
    void createTables();

public:
    QSqlDatabase db;
    DbHandler();
    void initDb();
};

#endif // DBHANDLER_H
