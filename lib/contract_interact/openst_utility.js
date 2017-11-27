"use strict";

const web3RpcProvider = require('../web3/providers/utility_rpc')
  , helper = require('./helper')
  , contractName = 'openSTUtility'
  , coreAddresses = require('../../config/core_addresses')
  , contractAbi = coreAddresses.getAbiForContract(contractName)
  , currContract = new web3RpcProvider.eth.Contract( contractAbi )
  , responseHelper = require('../../lib/formatter/response')
  ;

currContract.setProvider( web3RpcProvider.currentProvider );

const OpenStUtilityContractInteract = module.exports = function (contractAddress) {
  this.contractAddress = contractAddress;
};

OpenStUtilityContractInteract.prototype = {

  getSimpleTokenPrimeContractAddress: function(){
    const encodedABI = currContract.methods.simpleTokenPrime.encodeABI();
    return helper.call(web3RpcProvider, this.contractAddress, encodeABI)
      .catch(function (err) {
        console.error(err);
        return Promise.resolve(responseHelper.error('ci_ost_ut1', 'Something went wrong'));
      })
      .then(function (response) {
        return Promise.resolve(responseHelper.successWithData({simpleTokenPrimeContractAddress: response}));
      });
  },

  getSimpleTokenPrimeUUID: function(){
    const encodedABI = currContract.methods.uuidSTPrime.encodeABI();
    return helper.call(web3RpcProvider, this.contractAddress, encodeABI)
      .catch(function (err) {
        console.error(err);
        return Promise.resolve(responseHelper.error('ci_ost_ut2', 'Something went wrong'));
      })
      .then(function (response) {
        return Promise.resolve(responseHelper.successWithData({simpleTokenPrimeUUID: response}));
      });
  }


};