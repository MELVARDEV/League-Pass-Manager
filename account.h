#ifndef ACCOUNT_H
#define ACCOUNT_H

#include <vector>
#include <string>
#include <QDateTime>

struct Account {
    int id;
    std::string uid;
    std::string summonerName;
    std::string region;
    std::string apiKey;
    std::string tagName;
    int summonerLevel;
    int profileIconId;
    QDateTime lastFetchedAt;
    std::string description;
    std::string password;
    std::string tier;
    std::string rank;
    int lp;
};

typedef std::vector<Account> AccountList;

extern AccountList accountList;  // Global declaration

#endif // ACCOUNT_H
