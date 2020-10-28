var Farming = React.createClass({
    requiredScripts: [
        'spa/index/cardInfo.jsx'
    ],
    componentDidMount() {
        this.controller.loadData();
    },
    render() {
        return (<section>
            <section className="FarmingTop">
                <h2 className="BrandizedS">Cards</h2>
                {this.props.sortedItems.map((it, i)=> <section key={it.key} className="collection">
                    <CardInfo card={it} />
                    {this.state && this.state.items && this.state.items[i] && <span className="UniPriceBro">$ {window.formatMoney(this.state.items[i].priceInDollars, 1)}</span>}
                    <br></br>
                    <a className="unibtn" href={window.context.uniswapSpawUrlTemplate.format(it.erc20Wrapper)} target="_blank">&#129412;swap</a>
                </section>)}
                <section className="FarmingSeason">
                <h2 className="BrandizedS">Farming Season 1 <a target="_blank" href="https://etherscan.io/block/countdown/11246089">(Ending block n. 11246089)</a></h2>
                    <section className="FarmingTier">
                        <img src=""></img>
                        <p>Earn 1 Name Card for every:</p> 
                        <section className="FarmingTierDeal">
                            <img src=""></img>
                            <p>100 Name Second Token locked in the Uniswap V2 pair Token 1 - Token 2 for "Time" (Available: )</p>
                            <a className="GoToFarm">FARM</a>
                        </section>
                    </section>
                </section>
                <section className="FarmingSeason">
                <h2 className="BrandizedS">Farming Long Term Season <a target="_blank" href="https://etherscan.io/block/countdown/11246089">(Ending block n. 11246089)</a></h2>
                    <section className="FarmingTier">
                        <img src=""></img>
                        <p>Earn 1 Name Card for every:</p> 
                        <section className="FarmingTierDeal">
                            <img src=""></img>
                            <p>100 Name Second Token locked in the Uniswap V2 pair Token 1 - Token 2 for "Time" (Available: )</p>
                            <a className="GoToFarm">FARM</a>
                        </section>
                    </section>
                </section>
            </section>
        </section>);
    }
});