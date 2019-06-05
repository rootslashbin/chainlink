const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const setup = require('./setup');

const provider = new Web3.providers.HttpProvider(setup.infuraURL);
const web3 = new Web3(provider);

const privateKey = Buffer.from(setup.privateKey, 'hex');
const abi = [{"constant":false,"inputs":[{"name":"_requestId","type":"bytes32"},{"name":"_payment","type":"uint256"},{"name":"_callbackFunc","type":"bytes4"},{"name":"_expiration","type":"uint256"}],"name":"cancelOracleRequest","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_requestId","type":"bytes32"},{"name":"_payment","type":"uint256"},{"name":"_callbackAddress","type":"address"},{"name":"_callbackFunctionId","type":"bytes4"},{"name":"_expiration","type":"uint256"},{"name":"_data","type":"bytes32"}],"name":"fulfillOracleRequest","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_sender","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"onTokenTransfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_sender","type":"address"},{"name":"_payment","type":"uint256"},{"name":"_specId","type":"bytes32"},{"name":"_callbackAddress","type":"address"},{"name":"_callbackFunctionId","type":"bytes4"},{"name":"_nonce","type":"uint256"},{"name":"_dataVersion","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"oracleRequest","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_node","type":"address"},{"name":"_allowed","type":"bool"}],"name":"setFulfillmentPermission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_recipient","type":"address"},{"name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_link","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"specId","type":"bytes32"},{"indexed":false,"name":"requester","type":"address"},{"indexed":false,"name":"requestId","type":"bytes32"},{"indexed":false,"name":"payment","type":"uint256"},{"indexed":false,"name":"callbackAddr","type":"address"},{"indexed":false,"name":"callbackFunctionId","type":"bytes4"},{"indexed":false,"name":"cancelExpiration","type":"uint256"},{"indexed":false,"name":"dataVersion","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"OracleRequest","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"requestId","type":"bytes32"}],"name":"CancelOracleRequest","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":true,"inputs":[],"name":"EXPIRY_TIME","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_node","type":"address"}],"name":"getAuthorizationStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"withdrawable","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];

const contract = new web3.eth.Contract(abi, setup.oracleAddress, {
  from: setup.account,
  gasLimit: 3000000,
});

contract.methods.withdrawable().call()
    .then(function(result){
    var myTokenBalance = Number(result)
    withdrawAll('0x' + myTokenBalance.toString(16));
});

function withdrawAll(amount) {
  
  const contractFunction = contract.methods.withdraw(setup.account, amount);
  
  const functionAbi = contractFunction.encodeABI();
  
  let estimatedGas;
  let nonce;
  
  console.log("Getting gas estimate");
  
  contractFunction.estimateGas({from: setup.account}).then((gasAmount) => {
    estimatedGas = gasAmount.toString(16);
  
    console.log("Estimated gas: " + estimatedGas);
  
    web3.eth.getTransactionCount(setup.account).then(_nonce => {
      nonce = _nonce.toString(16);
  
      console.log("Nonce: " + nonce);
      const txParams = {
        gasPrice: '0x02184e72a0',
        gasLimit: 200000,
        to: setup.oracleAddress,
        data: functionAbi,
        from: setup.account,
        nonce: '0x' + nonce,
        value: 0
      };
  
      const tx = new Tx(txParams);
      tx.sign(privateKey);
  
      const serializedTx = tx.serialize();
  
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', receipt => {
        console.log(receipt.status);
        process.exit()
      })
    });
  });
} 
