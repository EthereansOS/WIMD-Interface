var Index = React.createClass({
    getDefaultSubscriptions() {
        return {
            'ethereum/update': this.controller.loadData,
            'ethereum/ping': this.controller.refreshData
        }
    },
    requiredScripts: [
        "spa/inlineLoader.jsx",
        "spa/index/cardCraftSelector.jsx",
        "spa/index/cardInfo.jsx"
    ],
    requiredModules : [
        "spa/farming"
    ],
    componentDidMount() {
        this.controller.loadAddressBarParam();
        this.controller.loadData();
    },
    toggleFarming(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var toggle = (this.state && this.state.toggle);
        this.setState({toggle : toggle === 'farming' ? null : 'farming'});
    },
    perform(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var target = e.currentTarget;
        if ((this.state && this.state.performing) || target.className.toLowerCase().indexOf('disabled') !== -1) {
            return;
        }
        var action = target.dataset.action;
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        var _this = this;
        var close = function close(e) {
            var message = e && (e.message || e);
            _this.setState({ performing: null }, function () {
                message && message.indexOf('denied') === -1 && setTimeout(function () {
                    alert(message);
                });
                !message && _this.controller.refreshData();
            });
        }
        _this.setState({ performing: action }, function () {
            _this.controller['perform' + action.firstLetterToUpperCase()].apply(this, args).catch(close).finally(close);
        });
    },
    onCardSelectionUpdate(cardCraftSelector, selection) {
        var selections = this.state.selections || [null, null, null];
        selections[cardCraftSelector.props.index] = selection;
        this.setState({selections});
    },
    sortItems() {
        if(this.state.items.filter(it => !it.metadata).length > 0) {
            return this.state.items;
        }
        var itemsByCategory = {};
        for(var item of this.state.items) {
            var rarity = item.metadata.attributes.filter(it => it.trait_type === "Rarity")[0].value;
            itemsByCategory[rarity] = itemsByCategory[rarity] || [];
            itemsByCategory[rarity].push(item);
        }
        var sortedItems = [];
        for(var rarity of window.context.rarityOrder) {
            sortedItems.push(...itemsByCategory[rarity]);
        }
        return sortedItems;
    },
    getSelectableItems(sortedItems) {
        var myItems = [];
        for(var item of sortedItems) {
            if(!item.userData || !item.userData.balanceOf || item.userData.balanceOf === '0') {
                continue;
            }
            myItems.push(item);
        }
        var selectableItems = sortedItems;//myItems;
        selectableItems = selectableItems.filter(it => window.context.unselectable.indexOf(it.objectId) === -1);
        return selectableItems;
    },
    render() {
        var props = {};
        this.props && Object.entries(this.props).forEach(entry => props[entry[0]] = entry[1]);
        this.state && Object.entries(this.state).forEach(entry => props[entry[0]] = entry[1]);
        props.props && Object.entries(props.props).forEach(entry => props[entry[0]] = entry[1]);
        delete props.props;
        var sortedItems = props.items && this.sortItems();
        var selectableItems = sortedItems && this.getSelectableItems(sortedItems);
        return (<section className={this.state && this.state.toggle ? "ALL2" : "ALL"}>
            <header>
                <a target="_blank" href="/" className="brand"><img src="assets/img/logo.png"/></a>
                <a target="_blank" href="https://github.com/b-u-i-d-l/Where-Is-My-Dragon" className="navLink BrandizedS">Rules</a>
                <a className="navLink BrandizedS">ITEM</a>
                <a className="navLink BrandizedS" target="_blank" href="https://bafybeidohofcst2oxulj75mxdogz77ky7ldhvz27pcqx7htyatuazrcvwi.ipfs.dweb.link/">Uniswap</a>
                <a className="navLink BrandizedS" target="_blank" href={window.context.openSeaCollectionLinkTemplate.format(this.state && this.state.collectionName)}>OpenSea</a>
                {window.ethereum && !window.walletAddress && <a className="connect Brandized" href="javascript:;" onClick={() => window.ethereum.enable()}>Connect</a>}
                {props.items && props.items.length > 0 && <a className="navLink BrandizedS SPECIALITY" href="javascript:;" onClick={this.toggleFarming}>Farming</a>}
                <span className="navThings BrandizedS">Treasure: {window.formatMoney(window.balanceOf, 1)} ETH</span>
                {window.walletAddress && <a className="connect BrandizedS" target="_blank" href={window.getNetworkElement("etherscanURL") + "address/" + window.walletAddress}>{window.shortenWord(window.walletAddress, 15)}</a>}
            </header>
            {(!props.items || props.items.length === 0) && <InlineLoader />}
            {props.items && props.items.length > 0 && <section className="things">
                <section className="craft">
                    <CardCraftSelector index={0} items={selectableItems} exceptFor={props.selections} onUpdate={this.onCardSelectionUpdate} readOnly={props.performing !== undefined && props.performing !== null}/>
                    <CardCraftSelector index={1} items={selectableItems} exceptFor={props.selections} onUpdate={this.onCardSelectionUpdate} readOnly={props.performing !== undefined && props.performing !== null}/>
                    <CardCraftSelector index={2} items={selectableItems} exceptFor={props.selections} onUpdate={this.onCardSelectionUpdate} readOnly={props.performing !== undefined && props.performing !== null}/>
                    <section className="action">
                        {props.performing !== "craft" && <a className={"actionCraft" + (props.performing || !props.selections || props.selections.filter(it => !it).length > 0 ? " disabled" : "")} data-action="craft" href="javascript:;" onClick={this.perform}>Craft</a>}
                        {props.performing === "craft" && <InlineLoader />}
                    </section>
                </section>
                <section className="collectionALL">
                    {sortedItems.map(it => <section key={it.key} className="collection">
                        <CardInfo card={it}/>
                        <a className="unibtn" href={window.context.uniswapSpawUrlTemplate.format(it.erc20Wrapper)} target="_blank">&#129412;swap</a>
                    </section>)}
                </section>
            </section>}
            {props.items && props.items.length > 0 && props.toggle === 'farming' && <Farming sortedItems={sortedItems}/>}
        </section>);
    }
});