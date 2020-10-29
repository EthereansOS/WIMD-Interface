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
                {this.props.sortedItems.map((it, i) => <section key={it.key} className="collection">
                    <CardInfo card={it} clean hideBalance />
                    {this.state && this.state.items && this.state.items[i] && <span className="UniPriceBro">$ {window.formatMoney(this.state.items[i].priceInDollars, 1)}</span>}
                    <br></br>
                    <a className="unibtn" href={window.context.uniswapSpawUrlTemplate.format(it.erc20Wrapper)} target="_blank">&#129412;swap</a>
                </section>)}
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
                })}
            </section>
        </section>);
    }
});