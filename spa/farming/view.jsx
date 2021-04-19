var Farming = React.createClass({
    requiredScripts: [
        'spa/index/cardInfo.jsx',
        'spa/inlineLoader.jsx'
    ],
    componentDidMount() {
        this.controller.loadData();
    },
    getFirstEndBlock(item) {
        var values = Object.values(item);
        for (var value of values) {
            if (value.stakingData && value.stakingData.stakingData && value.stakingData.stakingData.length > 0) {
                return value.stakingData.stakingData[0].endBlock;
            }
        }
    },
    render() {
        var _this = this;
        return (<section>
            <section className="FarmingTop">
                <h2 className="BrandizedS">Cards</h2>
                {this.props.sortedItems.map((it, i) => <section key={it.key} className="collection CardsBigview">
                    <CardInfo card={it} clean hideBalance />
                    <div className="CardsBigviewInfo">
                        {this.state && this.state.items && this.state.items[i] && <p className="UniPriceBro">$ {window.formatMoney(this.state.items[i].priceInDollars, 1)}</p>}
                        <a className="unibtn" href={window.context.uniSwapInfoURL.format(it.erc20Wrapper)} target="_blank">Liquidity</a>
                        <a className="unibtn" href={window.context.uniswapSpawUrlTemplate.format(it.erc20Wrapper)} target="_blank">Swap</a>
                        <a className="unibtn Opns" href={window.context.openSeaItemLinkTemplate.format(window.whereIsMyDragonEthItem.options.address, it.key)} target="_blank">OpenSea</a>
                        <a className="unibtn" href={window.context.ethItemLinkTemplate.format(it.erc20Wrapper)} target="_blank">Info</a>
                    </div>
                </section>)}
                <section className="Delimitator"></section>
                <h2 className="BrandizedS">Decks</h2>
                <section className="collection DeckBigview">
                    <section className="singleCollCard cardInfo">
                        <figure className="collCard">
                            <img src="//ipfs.io/ipfs/QmbUYRhM8TKGm7iD9mLgSVC5fcToeXaDdk8ntz6yDMJnp1"/>
                        </figure>
                    </section>
                    <div className="CardsBigviewInfoP">
                        <p>A collection of the four common cards of the ITEMS based card game "Where Is My Dragon". Each unit of this deck contains 1 Penguin Fancy Shoes, 1 Unicorn Cat, 1 Magician Unicorn and 1 Magician Cat</p>
                    </div>
                    <div className="CardsBigviewInfo">
                        <a className="unibtn" href="https://info.uniswap.org/token/0xD15c7Fcda27a93b9d4cD3617E09416Ec3aaA5237" target="_blank">Liquidity</a>
                        <a className="unibtn" href="https://swap.item.eth.link/#/swap?outputCurrency=0xD15c7Fcda27a93b9d4cD3617E09416Ec3aaA5237" target="_blank">Swap</a>
                        <a className="unibtn Opns" href="https://opensea.io/assets/0x5a6EdeeE783A17AFa9e40f6a03B6C93Fabc5AdC1/1195241872894617222008635817406839094575782056503" target="_blank">OpenSea</a>
                        <a className="unibtn" href="https://item.eth.link/?interoperable=0xD15c7Fcda27a93b9d4cD3617E09416Ec3aaA5237" target="_blank">Info</a>
                    </div>
                </section>
                <section className="Delimitator"></section>
                <h2 className="BrandizedS">Farming (coming Soon)</h2>
                {/* 
                <section className="Delimitator"></section>
                {(!this.state || !this.state.stakingContracts) && <InlineLoader />}
                {this.state && this.state.stakingContracts && Object.entries(this.state.stakingContracts).map(seasonEntry => {
                    var seasonKey = seasonEntry[0];
                    var season = seasonEntry[1];
                    var endBlock = _this.getFirstEndBlock(season);
                    return (<section key={seasonKey} className="FarmingSeason">
                        <h2 className="BrandizedS">{seasonKey} <a target="_blank" href={`${window.getNetworkElement("etherscanURL")}block/${endBlock}`}>(Ending block n. {endBlock})</a></h2>
                        {Object.entries(season).filter(it => it[1].stakingData && it[1].stakingData.stakingData && it[1].stakingData.stakingData.length > 0).map(tokenEntry => {
                            var tokenKey = tokenEntry[0];
                            var tokenValue = tokenEntry[1];
                            var stakingDatas = tokenValue.stakingData.stakingData;
                            return stakingDatas.map(stakingData => {
                                var amountFor1 = 100 / stakingData.tiers[0].percentage;
                                if(!stakingData.rewardToken || !stakingData.mainToken) {
                                    return;
                                }
                                return (<section key={tokenKey} className="FarmingTier">
                                    <img src={window.formatLink(stakingData.rewardToken.logo || stakingData.rewardToken.logoURI)} />
                                    <p>Earn 1 {stakingData.rewardToken.name} Card for every:</p>
                                    <a className="GoToFarm" target="_blank" href={window.context.stakingUrlTemplate.format(stakingData.stakingManager.options.address)}>FARM</a>
                                    <br></br>
                                    <section className="FarmingTierDeal">
                                        <img src={window.formatLink(stakingData.mainToken.logo || stakingData.mainToken.logoURI)} />
                                        <p>{window.formatMoney(amountFor1, 2)} {stakingData.mainToken.symbol} locked in the Uniswap V2 pair {stakingData.mainToken.symbol} - {stakingData.pairs[0].symbol} {stakingData.tiers[0].tierKey} (Available: {window.fromDecimals(stakingData.tiers[0].remainingToStake, stakingData.mainToken.decimals)})</p>
                                    </section>
                                </section>);
                            });
                        })}
                    </section>);
                })}*/}
            </section>
        </section>);
    }
});