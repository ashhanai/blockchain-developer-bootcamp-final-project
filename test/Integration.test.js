const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const P2PLoan = artifacts.require("P2PLoan");
const ERC721Faucet = artifacts.require("ERC721Faucet");
const ERC20Faucet = artifacts.require("ERC20Faucet");


contract("P2PLoan", function(accounts) {
    let instance;
    let FTFaucet;
    let NFTFaucet;
    let nftId;
    let [_, user1, user2, user3] = accounts;

    beforeEach(async function() {
        instance = await P2PLoan.deployed();
        FTFaucet = await ERC20Faucet.new();
        NFTFaucet = await ERC721Faucet.new();

        await FTFaucet.get(2_000, { from: user1 });
        await FTFaucet.get(10_000, { from: user2 });
        const tx = await NFTFaucet.get({ from: user1 });
        nftId = tx.logs[0].args.tokenId;
    });

    it("should be able to revoked offer before acceptance", async function() {
        // Create offer
        await FTFaucet.approve(instance.address, 10_000, { from: user2 });
        const tx1 = await instance.createLoanOffer(NFTFaucet.address, nftId, FTFaucet.address, 10_000, 12_000, 300, { from: user2 });
        const offerId = tx1.logs.find(i => i.event == "LoanOfferCreated").args.offerId;

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(user1);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(2_000);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(10_000);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);

        // Revoke offer
        await instance.revokeLoanOffer(offerId, { from: user2 });

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(user1);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(2_000);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(10_000);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);

        // Try to accept offer
        await expectRevert(
            instance.acceptLoanOffer(offerId, { from: user1 }),
            "Loan offer is not in Open state"
        );
    });

    it("should be able to pay back loan and claim credit + interest", async function() {
        // Create offer
        await FTFaucet.approve(instance.address, 10_000, { from: user2 });
        const tx1 = await instance.createLoanOffer(NFTFaucet.address, nftId, FTFaucet.address, 10_000, 12_000, 300, { from: user2 });
        const offerId = tx1.logs.find(i => i.event == "LoanOfferCreated").args.offerId;

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(user1);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(2_000);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(10_000);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);

        // Accept offer
        await NFTFaucet.approve(instance.address, nftId, { from: user1 });
        const tx2 = await instance.acceptLoanOffer(offerId, { from: user1 });
        const loanId = tx2.logs.find(i => i.event == "LoanOfferAccepted").args.loanId;

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(instance.address);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(12_000);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);

        // Spend some time
        await time.increase(100);

        // Pay back
        await FTFaucet.approve(instance.address, 12_000, { from: user1 });
        await instance.payBackLoan(loanId, { from: user1 });

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(user1);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(12_000);

        // Claim
        await instance.claim(loanId, { from: user2 });

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(user1);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(12_000);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);
    });

    it("should be able to claim nft when loan expired", async function() {
        // Create offer
        await FTFaucet.approve(instance.address, 10_000, { from: user2 });
        const tx1 = await instance.createLoanOffer(NFTFaucet.address, nftId, FTFaucet.address, 10_000, 12_000, 300, { from: user2 });
        const offerId = tx1.logs.find(i => i.event == "LoanOfferCreated").args.offerId;

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(user1);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(2_000);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(10_000);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);

        // Accept offer
        await NFTFaucet.approve(instance.address, nftId, { from: user1 });
        const tx2 = await instance.acceptLoanOffer(offerId, { from: user1 });
        const loanId = tx2.logs.find(i => i.event == "LoanOfferAccepted").args.loanId;

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(instance.address);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(12_000);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);

        // Spend some time
        await time.increase(400);

        // Try to pay back
        await FTFaucet.approve(instance.address, 12_000, { from: user1 });
        await expectRevert(
            instance.payBackLoan(loanId, { from: user1 }),
            "Loan is expired"
        );
        
        // Claim
        await instance.claim(loanId, { from: user2 });

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(user2);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(12_000);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);
    });

    it("should be able to claim when owning loan token", async function() {
        // Create offer
        await FTFaucet.approve(instance.address, 10_000, { from: user2 });
        const tx1 = await instance.createLoanOffer(NFTFaucet.address, nftId, FTFaucet.address, 10_000, 12_000, 300, { from: user2 });
        const offerId = tx1.logs.find(i => i.event == "LoanOfferCreated").args.offerId;

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(user1);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(2_000);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(10_000);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);

        // Accept offer
        await NFTFaucet.approve(instance.address, nftId, { from: user1 });
        const tx2 = await instance.acceptLoanOffer(offerId, { from: user1 });
        const loanId = tx2.logs.find(i => i.event == "LoanOfferAccepted").args.loanId;

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(instance.address);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(12_000);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);

        // Spend some time
        await time.increase(100);

        // Transfer loan token
        await instance.safeTransferFrom(user2, user3, loanId, { from: user2 });

        // Pay back
        await FTFaucet.approve(instance.address, 12_000, { from: user1 });
        await instance.payBackLoan(loanId, { from: user1 });

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(user1);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(12_000);

        // Try to claim by old owner
        await expectRevert(
            instance.claim(loanId, { from: user2 }),
            "Sender is not loan token owner"
        );

        // Claim
        await instance.claim(loanId, { from: user3 });

        expect(await NFTFaucet.ownerOf(nftId)).to.equal(user1);
        expect((await FTFaucet.balanceOf(user1)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(user2)).toNumber()).to.equal(0);
        expect((await FTFaucet.balanceOf(user3)).toNumber()).to.equal(12_000);
        expect((await FTFaucet.balanceOf(instance.address)).toNumber()).to.equal(0);
    });

});
