const { expect } = require("chai");
const P2PLoan = artifacts.require("P2PLoan");

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

            await instance.createLoanOffer(asset1, asset2, 100, 110, 60, { from: user1 });

            const newOfferId = await instance.offerId();
            expect(newOfferId.toNumber()).to.equal(oldOfferId.toNumber() + 1);
        });

        it("should save offer data under offer id", async function() {
            const offerId = (await instance.offerId()).toNumber() + 1;
            const creditAmount = 100;
            const creditToBePaidAmount = 110;
            const duration = 60;

            await instance.createLoanOffer(asset1, asset2, creditAmount, creditToBePaidAmount, duration, { from: user1 });

            const offer = await instance.offers(offerId, { from: user1 });
            expect(offer.collateral).to.equal(asset1);
            expect(offer.credit).to.equal(asset2);
            expect(offer.creditAmount.toNumber()).to.equal(creditAmount);
            expect(offer.creditToBePaidAmount.toNumber()).to.equal(creditToBePaidAmount);
            expect(offer.duration.toNumber()).to.equal(duration);
            expect(offer.lender).to.equal(user1);
        });

        it("should emit `LoanOfferCreated` event", async function() {
            const offerId = (await instance.offerId()).toNumber() + 1;

            const tx = await instance.createLoanOffer(asset1, asset2, 80, 50, 1, { from: user1 });

            const event = tx.logs[0];
            expect(event.event).to.equal("LoanOfferCreated");
            expect(event.args.offerId.toNumber()).to.equal(offerId);
            expect(event.args.lender).to.equal(user1);
            expect(event.args.collateral).to.equal(asset1);
        });

        it("should return offer id", async function() {
            const oldOfferId = (await instance.offerId()).toNumber();

            const offerId = await instance.createLoanOffer.call(asset1, asset2, 80, 50, 1, { from: user1 });

            expect(offerId.toNumber()).to.equal(oldOfferId + 1);
        });

    });
});
