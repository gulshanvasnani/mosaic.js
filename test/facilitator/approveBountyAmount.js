// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------
//
// http://www.simpletoken.org/
//
// ----------------------------------------------------------------------------

const BN = require('bn.js');
const chai = require('chai');
const sinon = require('sinon');
const Web3 = require('web3');
const Facilitator = require('../../libs/Facilitator/Facilitator');

const assert = chai.assert;

describe('Facilitator.approveBountyAmount()', () => {
  let facilitator;
  let web3;
  let gatewayAddress;
  let coGatewayAddress;
  let baseTokenAddress;
  let facilitatorAddress;
  let bountyAmount;

  let mockBaseTokenContract;
  let mockTx;
  let spy;

  const setup = function() {
    // Mock facilitator.getBounty method to return expected bounty amount.
    sinon.stub(facilitator, 'getBounty').callsFake(() => {
      return bountyAmount;
    });

    // Mock facilitator.getBaseToken method to return expected base token address.
    sinon.stub(facilitator, 'getBaseToken').callsFake(() => {
      return baseTokenAddress;
    });

    // Mock an instance of BaseToken contract.
    mockBaseTokenContract = sinon.mock(
      facilitator.contracts.BaseToken(baseTokenAddress)
    );
    const baseTokenContract = mockBaseTokenContract.object;

    // Mock approve transaction object.
    mockTx = sinon.mock(
      baseTokenContract.methods.approve(gatewayAddress, bountyAmount)
    );
    sinon.stub(mockTx.object, 'send').callsFake(() => {
      return Promise.resolve({
        account: gatewayAddress,
        amount: bountyAmount
      });
    });

    // Fake the approve call.
    sinon
      .stub(baseTokenContract.methods, 'approve')
      .callsFake((addressToApprove, amountToApprove) => {
        return mockTx.object;
      });

    // Fake the Gateway call to return gatewayContract object;
    sinon.stub(facilitator.contracts, 'BaseToken').callsFake(() => {
      return baseTokenContract;
    });
    //

    sinon.stub(facilitator, 'sendTransaction').callsFake((tx, txOptions) => {
      return new Promise(async function(resolve, reject) {
        const sendResult = await tx.send();
        resolve({ txResult: sendResult, txOptions: txOptions });
      });
    });

    // Add spy on Facilitator.approveBountyAmount.
    spy = sinon.spy(facilitator, 'approveBountyAmount');
  };

  const tearDown = function() {
    // Restore all mocked and spy objects.
    mockBaseTokenContract.restore();
    mockTx.restore();
    spy.restore();
  };

  beforeEach(() => {
    // runs before each test in this block
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9546'));
    gatewayAddress = '0x52c50cC9bBa156C65756abd71b172B6408Dde006';
    coGatewayAddress = '0xbF03E1680258c70B86D38A7e510F559A6440D06e';
    facilitator = new Facilitator(
      web3,
      web3,
      gatewayAddress,
      coGatewayAddress
    );

    baseTokenAddress = '0x79376dc1925ba1e0276473244802287394216a39';
    facilitatorAddress = '0x4e4ea3140f3d4a07e2f054cbabfd1f8038b3b4b0';
    bountyAmount = 100;
  });

  it('should approve bounty amount with default gas value', async function() {
    this.timeout(5000);
    const expectedErrorMessage = 'Invalid facilitator address.';
    await facilitator.approveBountyAmount().catch((exception) => {
      assert.strictEqual(
        exception.message,
        expectedErrorMessage,
        `Exception reason must be "${expectedErrorMessage}"`
      );
    });
  });

  it('should approve bounty amount with default gas value', async function() {
    this.timeout(5000);

    setup();

    // Call approve.
    const result = await facilitator.approveBountyAmount(facilitatorAddress);

    assert.strictEqual(
      result.txResult.account,
      gatewayAddress,
      'Account address must be gateway contract address.'
    );
    assert.strictEqual(
      result.txResult.amount,
      bountyAmount,
      'Bounty amount must be equal to expected bounty amount.'
    );
    assert.strictEqual(
      result.txOptions.from,
      facilitatorAddress,
      'From address must be facilitator address.'
    );
    assert.strictEqual(
      result.txOptions.to,
      baseTokenAddress,
      'To address must be base token address.'
    );
    assert.strictEqual(
      result.txOptions.gas,
      '7000000',
      'Gas value must be equal to default value.'
    );

    // Assert if the function was called with correct argument.
    assert.strictEqual(
      spy.calledWith(facilitatorAddress),
      true,
      'Function not called with correct argument.'
    );

    // Assert if the function was called only once.
    assert.strictEqual(
      spy.withArgs(facilitatorAddress).calledOnce,
      true,
      'Function must be called once.'
    );

    tearDown();
  });

  it('should approve bounty amount when gas amount is provided in argument', async function() {
    this.timeout(5000);

    bountyAmount = 50000;
    const gas = 100000;

    setup();

    // Call approve.
    const result = await facilitator.approveBountyAmount(
      facilitatorAddress,
      gas
    );

    assert.strictEqual(
      result.txResult.account,
      gatewayAddress,
      'Account address must be gateway contract address.'
    );
    assert.strictEqual(
      result.txResult.amount,
      bountyAmount,
      'Bounty amount must be equal to expected bounty amount.'
    );
    assert.strictEqual(
      result.txOptions.from,
      facilitatorAddress,
      'From address must be facilitator address.'
    );
    assert.strictEqual(
      result.txOptions.to,
      baseTokenAddress,
      'To address must be base token address.'
    );
    assert.strictEqual(
      result.txOptions.gas,
      gas,
      'Gas value must be equal to default value.'
    );

    // Assert if the function was called with correct argument.
    assert.strictEqual(
      spy.calledWith(facilitatorAddress),
      true,
      'Function not called with correct argument.'
    );

    // Assert if the function was called only once.
    assert.strictEqual(
      spy.withArgs(facilitatorAddress).calledOnce,
      true,
      'Function must be called once.'
    );

    tearDown();
  });
});
