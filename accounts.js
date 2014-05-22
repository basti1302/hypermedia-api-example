'use strict';

var _ = require('lodash')
  , accounts = require('./data/accounts')
  , genId = require('gen-id')('nnn')
  , errors = require('./lib/errors')
  , transactions = require('./data/transactions')
  , util = require('./lib/util')
  ;

module.exports = function(express, app) {

  var router = express.Router();
  app.use('/accounts', router);

  router.param('account', function(req, res, next, accountId) {
    var account = accounts[accountId];
    if (!account) {
      return errors.notFound(res);
    }
    req.account = account;
    next();
  });

  router.param('transaction', function(req, res, next, transactionId) {
    var transactionList = transactions[req.params.account];
    if (!transactionList) {
      return errors.notFound(res);
    }
    var transaction = _.find(transactionList, function(t) {
      return t.id === transactionId;
    });
    if (!transaction) {
      return errors.notFound(res);
    }
    req.transaction = transaction;
    next();
  });

  router.get('/', function(req, res) {
    addLinksToAllAccounts(accounts);
    res.render(req.viewDirectory +
      'accounts/account_list.ejs', { accounts: accounts });
  });

  router.get('/:account', function(req, res) {
    addLinksToAccount(req.account);
    res.render(req.viewDirectory +
      'accounts/account_overview.ejs', { account: req.account });
  });

  router.post('/:account/transfer', function(req, res) {
    debugger;
    var transactionList = transactions[req.params.account];
    if (!transactionList) {
      transactionList = transactions[req.params.account] = {};
    }
    var transactionId = req.params.account + '-' + genId.generate();
    var amount = parseFloat(req.body.amount);
    if (isNaN(amount)) {
      return errors.badRequest(res);
    }
    transactionList[transactionId] = {
      id: transactionId,
      amount: amount,
      partner: req.body.recipient,
      reference: req.body.reference,
    };
    res.redirect('/accounts/12345');
  });

  router.get('/:account/transactions', function(req, res) {
    addLinksToAccount(req.account);
    var transactionList = transactions[req.params.account];
    if (!transactionList) {
      return errors.notFound(res);
    }
    transactionList = filterTransactions(transactionList, req.query);
    addLinksToAllTransactions(req.account, transactionList);
    res.render(req.viewDirectory +
      'accounts/transaction_list.ejs', {
      account: req.account,
      transactions: transactionList,
    });
  });

  router.get('/:account/transactions/:transaction', function(req, res) {
    addLinksToAccount(req.account);
    addLinksToTransaction(req.account, req.transaction);
    res.render(req.viewDirectory +
      'accounts/transaction_detail.ejs', {
      account: req.account,
      transaction: req.transaction,
    });
  });
};

function filterTransactions(transactionList, query) {
  if (!query) {
    return transactionList;
  }
  transactionList =
    util.filterByQueryTerm(
      transactionList, query, 'partner', 'partner');
  transactionList =
    util.filterByQueryTerm(
      transactionList, query, 'amount', 'amount');
  transactionList =
    util.filterByQueryTerm(
      transactionList, query, 'reference', 'reference');
  return transactionList;
}

function addLinksToAllAccounts(accountList) {
  for (var accountId in accountList) {
    addLinksToAccount(accountList[accountId]);
  }
}

function addLinksToAccount(account) {
  account.links = {
    self: {
      href: '/accounts/' + account.id,
    },
    transactions: {
      href: '/accounts/' + account.id + '/transactions',
    },
    transfer: {
      href: '/accounts/' + account.id + '/transfer',
    },
  };
}

function addLinksToAllTransactions(account, transactionList) {
  for (var transactionId in transactionList) {
    addLinksToTransaction(account, transactionList[transactionId]);
  }
}

function addLinksToTransaction(account, transaction) {
  transaction.links = {
    self: {
      href: '/accounts/' + account.id + '/transactions/' + transaction.id,
    },
    account: {
      href: '/accounts/' + account.id,
    },
  };
}
