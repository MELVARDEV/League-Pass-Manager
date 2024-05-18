#include "mainwindow.h"
#include "login.h"

#include "QMessageBox"
#include <QApplication>
#include <QSettings>
#include <QCoreApplication>
#include <QStandardPaths>
#include <QDir>
#include <QSqlDatabase>
#include "dbhandler.h"


// set default settings
void setDefaultSettings()
{
    QSettings settings;

    // get documents path, create a folder named "Clave" and set it as storage path. if it already exists, just set it as storage path
    QString documentsPath = QStandardPaths::writableLocation(QStandardPaths::DocumentsLocation);
    // check if folder exists and create it if it doesn't
    QDir dir(documentsPath);
    if (!dir.exists("Clave"))
    {
        dir.mkdir("Clave");
    }

    QString storagePath = documentsPath + "/Clave";
    settings.setValue("storagePath", storagePath);


    settings.setValue("passphrase", "clave");
}



int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    QCoreApplication::setOrganizationName("Exory");
    QCoreApplication::setApplicationName("Clave");

    setDefaultSettings();
    DbHandler dbHandler;
    dbHandler.initDb();


    MainWindow w;

    // show login window

    // show login window
    Login login;
    login.exec();

    return a.exec();

}

