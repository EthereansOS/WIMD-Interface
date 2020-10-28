var FarmingController = function (view) {
    var context = this;
    context.view = view;

    context.loadData = async function loadData() {
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
}