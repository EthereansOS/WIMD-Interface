var IndexController = function (view) {
    var context = this;
    context.view = view;

    context.mintEvent = "Mint(uint256,address,uint256)";

    context.loadAddressBarParam = function loadAddressBarParam() {
        var toggle = window.addressBarParams.toggle;
        delete window.addressBarParams.toggle;
        toggle && context.view.setState({toggle});
    };

    context.loadData = async function loadData() {
        context.view.setState({collectionName : null, items : null});
        window.whereIsMyDragonEthItem = await window.newContract(window.context.IEthItemABI, window.getNetworkElement("whereIsMyDragonEthItemAddress"));
        var collectionName = (await window.blockchainCall(window.whereIsMyDragonEthItem.methods.name)).toLowerCase().split(' ').join('-');
        var logs = await window.getLogs({
            address : window.whereIsMyDragonEthItem.options.address,
            topics : [window.web3.utils.sha3(context.mintEvent)]
        });
        var items = [];
        for(var log of logs) {
            var data = window.web3.eth.abi.decodeParameters(["uint256","address","uint256"], log.data);
            var item = {
                index : items.length,
                key: data[0],
                objectId : data[0],
                erc20Wrapper : data[1]
            }
            items.push(item);
        }
        context.view.setState({collectionName, items}, context.refreshData);
    };

    context.refreshData = async function refreshData() {
        if(!context.view || !context.view.mounted || !context.view.state || !context.view.state.items || context.view.state.items.length === 0) {
            return;
        }
        context.view.state.items.forEach(async (item) => {
            item.metadataLink = item.metadataLink || await window.blockchainCall(window.whereIsMyDragonEthItem.methods.uri, item.objectId);
            item.metadata = item.metadata || await window.AJAXRequest(window.formatLink(item.metadataLink));
            item.staticImage = "assets/img/cardImages/" + item.objectId + ".png";
            item.userData = {
                balanceOf : await window.blockchainCall(window.whereIsMyDragonEthItem.methods.balanceOf, window.walletAddress, item.objectId)
            };
            context.view.setState({items : context.view.state.items});
        });
    };

    context.performCraft = async function performCraft() {
        await window.sleep(window.context.keyUpTimeoutInterval + 100);
        var selections = context.view.state.selections;
        if(selections.filter(it => !it).length > 0) {
            throw "You must select three cards to perform craft";
        }
        if(selections.filter(it => it.amount <= 0).length > 0) {
            throw "Each card must contain a positive amount";
        }
        for(var selection of selections) {
            if(!selection.card.userData || !selection.card.userData.balanceOf || parseInt(selection.card.userData.balanceOf) < selection.amount) {
                throw `You have insufficient ${selection.card.metadata.name}`;
            }
        }
        var from = window.walletAddress;
        var to = window.getNetworkElement("whereIsMyDragonCraftAddress");
        var objectIds = selections.map(it => it.card.objectId);
        var amounts = selections.map(it => it.amount + "");
        try {
            await window.blockchainCall(window.whereIsMyDragonEthItem.methods.safeBatchTransferFrom, from, to, objectIds, amounts, "0x");
            context.refreshData();
        } catch(e) {
            if((e.message || e).toLowerCase().indexOf("user denied") !== -1) {
                return;
            }
            throw 'Something went wrong. Maybe uncorrect crafting?';
        }
    };
};