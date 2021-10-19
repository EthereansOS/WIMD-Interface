var RedeemController = function (view) {
    var context = this;
    context.view = view;

    context.redeem = async function redeem(amount) {
        var whereIsMyDragonEthItem = await window.newContract(window.context.IEthItemABI, window.getNetworkElement("whereIsMyDragonEthItemAddress"));
        await window.blockchainCall(whereIsMyDragonEthItem.methods.safeTransferFrom, window.walletAddress, window.getNetworkElement("treasureAddress"), window.getNetworkElement("unicornDragonItemID"), amount, "0x");
    };
}