const { expect } = require("chai");
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const P2PLoan = artifacts.require("P2PLoan");
const FakeERC721 = artifacts.require("FakeERC721");
const FakeERC20 = artifacts.require("FakeERC20");


contract("P2PLoan", async function(accounts) {
    let instance;
    let [owner, user1, user2, asset1, asset2] = accounts;

    beforeEach(async function() {
        instance = await P2PLoan.deployed();
    });


    describe("Constructor", function() {
    
        it("should set owner", async function() {
            instance = await P2PLoan.new({ from: user1 });

            const instanceOwner = await instance.owner();
            expect(instanceOwner).to.equal(user1);
        });

        it("should set proper name", async function() {
            const name = await instance.name();
            expect(name).to.equal("P2PLoan");
        });
        
        it("should set proper symbol", async function() {
            const symbol = await instance.symbol();
            expect(symbol).to.equal("2PL");
        });
        
    });


    describe("Create offer", function() {

        it("should increment global offer id", async function() {
            const oldOfferId = await instance.offerId();

            await instance.createLoanOffer(asset1, 1, asset2, 100, 110, 60, { from: user1 });

            const newOfferId = await instance.offerId();
            expect(newOfferId.toNumber()).to.equal(oldOfferId.toNumber() + 1);
        });

        it("should save offer data under offer id", async function() {
            const collateralId = 1;
            const creditAmount = 100;
            const creditToBePaidAmount = 110;
            const duration = 60;

            const tx = await instance.createLoanOffer(asset1, collateralId, asset2, creditAmount, creditToBePaidAmount, duration, { from: user1 });
            const offerId = tx.logs[0].args.offerId;

            const offer = await instance.offers(offerId, { from: user1 });
            expect(offer.state.toNumber()).to.equal(1);
            expect(offer.collateral).to.equal(asset1);
            expect(offer.collateralId.toNumber()).to.equal(collateralId);
            expect(offer.credit).to.equal(asset2);
            expect(offer.creditAmount.toNumber()).to.equal(creditAmount);
            expect(offer.creditToBePaidAmount.toNumber()).to.equal(creditToBePaidAmount);
            expect(offer.duration.toNumber()).to.equal(duration);
            expect(offer.lender).to.equal(user1);
        });

        it("should emit `LoanOfferCreated` event", async function() {
            const offerId = (await instance.offerId()).toNumber() + 1;

            const tx = await instance.createLoanOffer(asset1, 1, asset2, 80, 50, 1, { from: user1 });

            expectEvent(tx, "LoanOfferCreated", {
                offerId: new BN(offerId),
                lender: user1,
                collateral: asset1
            });
        });

        it("should return offer id", async function() {
            const oldOfferId = (await instance.offerId()).toNumber();

            const offerId = await instance.createLoanOffer.call(asset1, 1, asset2, 80, 50, 1, { from: user1 });

            expect(offerId.toNumber()).to.equal(oldOfferId + 1);
        });

    });


    describe("Revoke offer", async function() {
        let offerId;

        beforeEach(async function() {
            const tx = await instance.createLoanOffer(asset1, 1, asset2, 80, 50, 1, { from: user1 });
            offerId = tx.logs[0].args.offerId;
        });


        it("should fail when sender is not offeror", async function() {
            await expectRevert(
                instance.revokeLoanOffer(offerId, { from: user2 }),
                "Sender is not a loan offeror"
            );
        });

        it("should delete offer data", async function() {
            await instance.revokeLoanOffer(offerId, { from: user1 });

            const offer = await instance.offers(offerId);
            expect(offer.state.toNumber()).to.equal(0);
            expect(offer.collateral).to.equal(constants.ZERO_ADDRESS);
            expect(offer.collateralId.toNumber()).to.equal(0);
            expect(offer.credit).to.equal(constants.ZERO_ADDRESS);
            expect(offer.creditAmount.toNumber()).to.equal(0);
            expect(offer.creditToBePaidAmount.toNumber()).to.equal(0);
            expect(offer.duration.toNumber()).to.equal(0);
            expect(offer.lender).to.equal(constants.ZERO_ADDRESS);
        });

        it("should emit `LoanOfferRevoked` event", async function() {
            const tx = await instance.revokeLoanOffer(offerId, { from: user1 });

            expectEvent(tx, "LoanOfferRevoked", {
                offerId: offerId,
                lender: user1
            });
        });

    });


    describe("Accept loan offer", async function() {
        let offerId;
        let fakeERC721;
        let fakeERC20;
        const duration = 100;
        const collateralId = 41231;
        const creditAmount = 80;

        beforeEach(async function() {
            fakeERC721 = await FakeERC721.new();
            await fakeERC721.setOwnerOf(user2);
            fakeERC20 = await FakeERC20.new();
            const tx = await instance.createLoanOffer(fakeERC721.address, collateralId, fakeERC20.address, creditAmount, 50, duration, { from: user1 });
            offerId = tx.logs[0].args.offerId;
        });


        it("should fail when sender is not a collateral owner", async function() {
            await fakeERC721.setOwnerOf(user1);

            await expectRevert(
                instance.acceptLoanOffer(offerId, { from: user2 }),
                "Sender is not a collateral owner"
            );
        });

        it("should fail when offer is not in Open state", async function() {
            await expectRevert(
                instance.acceptLoanOffer(offerId.toNumber() + 1, { from: user2 }),
                "Loan offer is not in Open state"
            );
        });

        it("should increase loan id", async function() {
            const oldLoanId = await instance.loanId();

            await instance.acceptLoanOffer(offerId, { from: user2 });

            const loanId = await instance.loanId();
            expect(loanId.toNumber()).to.equal(oldLoanId.toNumber() + 1);
        });

        it("should save loan data under loan id", async function() {
            const tx = await instance.acceptLoanOffer(offerId, { from: user2 });
            const loanId = tx.logs[1].args.loanId;

            const lastBlockNumber = await web3.eth.getBlockNumber();
            const block = await web3.eth.getBlock(lastBlockNumber);
            const blockTimestamp = block.timestamp;
            const loan = await instance.loans(loanId);
            expect(loan.state.toNumber()).to.equal(1);
            expect(loan.borrower).to.equal(user2);
            expect(loan.expiration.toNumber()).to.equal(blockTimestamp + duration);
            expect(loan.acceptedOfferId.toNumber()).to.equal(offerId.toNumber());
        });

        it("should update offer state", async function() {
            await instance.acceptLoanOffer(offerId, { from: user2 });

            const offer = await instance.offers(offerId);
            expect(offer.state.toNumber()).to.equal(2);
        });

        it("should transfer collateral to contract", async function() {
            await instance.acceptLoanOffer(offerId, { from: user2 });

            const called = await fakeERC721.safeTransferFromCalled();
            const params = await fakeERC721.lastSafeTransferFromCallParams();
            expect(called).to.equal(true);
            expect(params.from).to.equal(user2);
            expect(params.to).to.equal(instance.address);
            expect(params.tokenId.toNumber()).to.equal(collateralId);
        });

        it("should transfer credit to borrower", async function() {
            await instance.acceptLoanOffer(offerId, { from: user2 });

            const called = await fakeERC20.transferFromCalled();
            const params = await fakeERC20.lastTransferFromCallParams();
            expect(called).to.equal(true);
            expect(params.sender).to.equal(user1);
            expect(params.recipient).to.equal(user2);
            expect(params.amount.toNumber()).to.equal(creditAmount);
        });

        it("should mint loan token to lender", async function() {
            const oldBalance = await instance.balanceOf(user1);

            const tx = await instance.acceptLoanOffer(offerId, { from: user2 });
            const loanId = tx.logs[1].args.loanId;

            const tokenOwner = await instance.ownerOf(loanId);
            expect(tokenOwner).to.equal(user1);

            const newBalance = await instance.balanceOf(user1);
            expect(newBalance.toNumber()).to.equal(oldBalance.toNumber() + 1);
        });

        it("should emit `LoanOfferAccepted` event", async function() {
            const loanId = (await instance.loanId()).toNumber() + 1;

            const tx = await instance.acceptLoanOffer(offerId, { from: user2 });

            expectEvent(tx, "LoanOfferAccepted", {
                offerId: offerId,
                loanId: new BN(loanId),
                lender: user1,
                collateral: fakeERC721.address,
                collateralId: new BN(collateralId),
            });
        });

        it("should return loan id", async function() {
            const oldLoanId = await instance.loanId();

            const loanId = await instance.acceptLoanOffer.call(offerId, { from: user2 });

            expect(loanId.toNumber()).to.equal(oldLoanId.toNumber() + 1);
        });
    });


    describe("Pay back loan", async function() {
        let offerId;
        let loanId;
        let fakeERC721;
        let fakeERC20;
        const duration = 100;
        const collateralId = 41231;
        const creditToBePaidAmount = 122;

        beforeEach(async function() {
            fakeERC721 = await FakeERC721.new();
            await fakeERC721.setOwnerOf(user2);
            fakeERC20 = await FakeERC20.new();
            const tx1 = await instance.createLoanOffer(fakeERC721.address, collateralId, fakeERC20.address, 90, creditToBePaidAmount, duration, { from: user1 });
            offerId = tx1.logs[0].args.offerId;

            const tx2 = await instance.acceptLoanOffer(offerId, { from: user2 });
            loanId = tx2.logs[1].args.loanId;
        });


        it("should fail when loan is expired", async function() {
            await time.increase(duration + 10);

            await expectRevert(
                instance.payBackLoan(loanId, { from: user2 }),
                "Loan is expired"
            );
        });

        it("should fail when loan is not running", async function() {
            await instance.payBackLoan(loanId, { from: user2 });

            await expectRevert(
                instance.payBackLoan(loanId, { from: user2 }),
                "Loan is not running"
            );
        });

        it("should update loan state", async function() {
            await instance.payBackLoan(loanId, { from: user2 });

            const loan = await instance.loans(loanId);
            expect(loan.state.toNumber()).to.equal(2);
        });

        it("should transfer credit to be paid amount to contract", async function() {
            await instance.payBackLoan(loanId, { from: user2 });

            const called = await fakeERC20.transferFromCalled();
            const params = await fakeERC20.lastTransferFromCallParams();
            expect(called).to.equal(true);
            expect(params.sender).to.equal(user2);
            expect(params.recipient).to.equal(instance.address);
            expect(params.amount.toNumber()).to.equal(creditToBePaidAmount);
        });

        it("should transfer collateral back to borrower", async function() {
            await instance.payBackLoan(loanId, { from: user2 });

            const called = await fakeERC721.safeTransferFromCalled();
            const params = await fakeERC721.lastSafeTransferFromCallParams();
            expect(called).to.equal(true);
            expect(params.from).to.equal(instance.address);
            expect(params.to).to.equal(user2);
            expect(params.tokenId.toNumber()).to.equal(collateralId);
        });

        it("should emit `LoanPaidBack` event", async function() {
            const tx = await instance.payBackLoan(loanId, { from: user2 });

            expectEvent(tx, "LoanPaidBack", {
                loanId: loanId,
                collateral: fakeERC721.address,
                collateralId: new BN(collateralId),
            });
        });

        it("should be able to pay back from any account", async function() {
            await instance.payBackLoan(loanId, { from: owner });
        });

    });


    describe("Claim", async function() {
        let offerId;
        let loanId;
        let fakeERC721;
        let fakeERC20;
        const duration = 100;
        const collateralId = 41231;
        const creditToBePaidAmount = 122;

        beforeEach(async function() {
            fakeERC721 = await FakeERC721.new();
            await fakeERC721.setOwnerOf(user2);
            fakeERC20 = await FakeERC20.new();
            const tx1 = await instance.createLoanOffer(fakeERC721.address, collateralId, fakeERC20.address, 90, creditToBePaidAmount, duration, { from: user1 });
            offerId = tx1.logs[0].args.offerId;

            const tx2 = await instance.acceptLoanOffer(offerId, { from: user2 });
            loanId = tx2.logs[1].args.loanId;
        });


        it("should fail when sender is not loan token owner", async function() {
            await instance.payBackLoan(loanId);

            await expectRevert(
                instance.claim(loanId, { from: user2 }),
                "Sender is not loan token owner"
            );
        });

        it("should transfer collateral when loan expired", async function() {
            await time.increase(duration + 10);

            await instance.claim(loanId, { from: user1 });

            const called = await fakeERC721.safeTransferFromCalled();
            const params = await fakeERC721.lastSafeTransferFromCallParams();
            expect(called).to.equal(true);
            expect(params.from).to.equal(instance.address);
            expect(params.to).to.equal(user1);
            expect(params.tokenId.toNumber()).to.equal(collateralId);
        });

        it("should transfer credit + interest when loan is paid back", async function() {
            await instance.payBackLoan(loanId);

            await instance.claim(loanId, { from: user1 });

            const called = await fakeERC20.transferCalled();
            const params = await fakeERC20.lastTransferCallParams();
            expect(called).to.equal(true);
            expect(params.recipient).to.equal(user1);
            expect(params.amount.toNumber()).to.equal(creditToBePaidAmount);
        });

        it("should fail when loan is not expired nor paid back", async function() {
            await expectRevert(
                instance.claim(loanId, { from: user1 }),
                "Loan cannot be claimed"
            );
        });

        it("should burn loan token", async function() {
            await instance.payBackLoan(loanId);

            await instance.claim(loanId, { from: user1 });

            await expectRevert(
                instance.ownerOf(loanId),
                "ERC721: owner query for nonexistent token"
            );
        });

        it("should delete loan data", async function() {
            await instance.payBackLoan(loanId);

            await instance.claim(loanId, { from: user1 });

            const loan = await instance.loans(loanId);
            expect(loan.state.toNumber()).to.equal(0);
            expect(loan.borrower).to.equal(constants.ZERO_ADDRESS);
            expect(loan.expiration.toNumber()).to.equal(0);
            expect(loan.acceptedOfferId.toNumber()).to.equal(0);
        });

    });


    describe("Get loan status", async function() {
        let offerId;
        let loanId;
        let fakeERC721;
        let fakeERC20;
        const duration = 100;

        beforeEach(async function() {
            fakeERC721 = await FakeERC721.new();
            await fakeERC721.setOwnerOf(user2);
            fakeERC20 = await FakeERC20.new();
            const tx1 = await instance.createLoanOffer(fakeERC721.address, 1, fakeERC20.address, 20, 22, duration, { from: user1 });
            offerId = tx1.logs[0].args.offerId;

            const tx2 = await instance.acceptLoanOffer(offerId, { from: user2 });
            loanId = tx2.logs[1].args.loanId;
        });
        

        it("should return expired state when is not paid back and have passed expiration date", async function() {
            time.increase(duration + 10);

            const state = await instance.getLoanStatus(loanId);

            expect(state.toNumber()).to.equal(3);
        });

        it("should return paid back state when is paid back and have passed expiration date", async function() {
            await instance.payBackLoan(loanId, { from: user2 });
            time.increase(duration + 10);

            const state = await instance.getLoanStatus(loanId);

            expect(state.toNumber()).to.equal(2);
        });

        it("should return paid back state when have not passed expiration date", async function() {
            await instance.payBackLoan(loanId, { from: user2 });

            const state = await instance.getLoanStatus(loanId);

            expect(state.toNumber()).to.equal(2);
        });
    
        it("should return running state when have not passed expiration date", async function() {
            const state = await instance.getLoanStatus(loanId);

            expect(state.toNumber()).to.equal(1);
        });

    });

});
