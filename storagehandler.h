#ifndef STORAGEHANDLER_H
#define STORAGEHANDLER_H

#include "account.h"

class StorageHandelr
{
private:
    std::string passphrase;
public:
    StorageHandelr(std::string passphrase);
    AccountList loadAccounts(std::string passphrase);
};

#endif // STORAGEHANDLER_H
