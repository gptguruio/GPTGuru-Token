import EVMRevert from '../helpers/EVMRevert';
import toBN from '../helpers/toBN';

const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();
  
var IERC20 = artifacts.require('./GptGuruToken.sol');

contract('GPTGuruToken', function([ _, wallet, wallet2 ]) {

  before(async function () {
    this.token =  await IERC20.new();
  }); 

  describe('Contract has instantiated correctly', function() {
    it('Asserts all constructor params', async function() {

      const symbol = await this.token.symbol();
      symbol.should.be.equal( "GPTG" );

      const name = await this.token.name();
      name.should.be.equal( "GPT Guru Token." );

      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal( toBN("2000000000000000000000000000") );

      const decimals = await this.token.decimals();
      decimals.should.be.bignumber.equal( toBN(18) );

    });
  });

  describe('Transfer Scenarios', function() {
    it('Balance of should work as expected', async function() {
      const balance = await this.token.balanceOf(_);
      balance.should.be.bignumber.equal( toBN("2000000000000000000000000000") );
    });

    it('Transfer fails if balance is not available', async function() {
      await this.token.transfer(wallet, "100000", { from: wallet }).should.be.rejectedWith(EVMRevert);
    });

    it('Transfers balance to other address', async function() {
      await this.token.transfer(wallet, "100000").should.be.fulfilled;
      const balance = await this.token.balanceOf(wallet);
      balance.should.be.bignumber.equal( toBN( 100000) );
    });
  });


  describe('Transfer From Scenarios', function() {
    it('Give approval to other address', async function() {
      await this.token.approve(wallet, "200000").should.be.fulfilled;
    });

    it('Read allowance of spender address', async function() {
      const allowance = await this.token.allowance( _, wallet );
      allowance.should.be.bignumber.equal( toBN("200000") );
    });

    it('Unable to transfer balance if transfer amount is more than the allowance', async function() {
      await this.token.transferFrom( _, wallet2, "300000", { from: wallet }).should.be.rejectedWith(EVMRevert);
    });

    it('Transfer amount to another address successfully', async function() {
      await this.token.transferFrom( _, wallet2, "200000", { from: wallet }).should.be.fulfilled;
      const balance = await this.token.balanceOf(wallet2);
      balance.should.be.bignumber.equal( toBN( 200000) );

      const allowance = await this.token.allowance( _, wallet );
      allowance.should.be.bignumber.equal( toBN(0) );
    });


    it('Able to increase allowance', async function() {
      await this.token.increaseAllowance(wallet, "200000").should.be.fulfilled;

      const allowance = await this.token.allowance( _, wallet );
      allowance.should.be.bignumber.equal( toBN(200000) );
    });

    it('Able to decrease allowance', async function() {
      await this.token.decreaseAllowance(wallet, "100000").should.be.fulfilled;

      const allowance = await this.token.allowance( _, wallet );
      allowance.should.be.bignumber.equal( toBN(100000) );
    });
  });

  describe('Burn Scenarios', function() {


    it('Unable to burn balance if amount is more than balance', async function() {
      await this.token.burn( "300000", { from: wallet2 }).should.be.rejectedWith(EVMRevert);
    });

    it('User should be able to burn his balance', async function() {
      const balance = await this.token.balanceOf(_);
      const totalSupply = await this.token.totalSupply();
      await this.token.burn( "300000" ).should.be.fulfilled;

      const newBalance = await this.token.balanceOf(_);
      newBalance.should.be.bignumber.equal( balance.sub( toBN(300000) ) );

      const newTotalSupply = await this.token.totalSupply();
      newTotalSupply.should.be.bignumber.equal( totalSupply.sub( toBN(300000) ) );

    });

    it('Unable to burn from other address if allowance is not given', async function() {
      await this.token.burnFrom( _, "300000", { from: wallet2 }).should.be.rejectedWith(EVMRevert);
    });

    it('User should be able to burn his balance', async function() {
      const balance = await this.token.balanceOf(_);
      const totalSupply = await this.token.totalSupply();

      await this.token.approve( wallet2, "300000" ).should.be.fulfilled;

      await this.token.burnFrom( _, "300000", { from: wallet2 }).should.be.fulfilled;

      const newBalance = await this.token.balanceOf(_);
      newBalance.should.be.bignumber.equal( balance.sub( toBN(300000) ) );

      const newTotalSupply = await this.token.totalSupply();
      newTotalSupply.should.be.bignumber.equal( totalSupply.sub( toBN(300000) ) );
    });

  });
  
});