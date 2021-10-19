var RedeemController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
        context.loadItems();
        context.loadStakingData();
    };

    context.loadItems = async function loadItems() {
        var items = [];
        for(var i = 0; i < context.view.props.sortedItems.length; i++) {
            var item = context.view.props.sortedItems[i];
            var stateItem = {
                item
            };
            stateItem.priceInDollars = await window.getTokenPriceInDollarsOnUniswap(item.erc20Wrapper, 18);
            items.push(stateItem);
        }
        context.view.setState({items});
    };

    context.loadStakingData = async function loadStakingData() {
        var stakingContracts = await window.AJAXRequest('data/stakingContracts.json');
        var periods = Object.values(stakingContracts);
        for(var period of periods) {
            var items = Object.values(period);
            for(var item of items) {
                item.stakingData = await window.loadStakingData(item.stakingAddresses);
            }
        }
        context.view.setState({stakingContracts});
    };
}